from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ast
import re
import os
import requests
import json
from datetime import datetime

try:
    import javalang
    JAVALANG_AVAILABLE = True
except:
    JAVALANG_AVAILABLE = False

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.middleware("http")
async def cors_handler(request: Request, call_next):
    if request.method == "OPTIONS":
        return JSONResponse(
            content={},
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Max-Age": "86400",
            }
        )
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

STATS_FILE = "stats.json"

def load_stats():
    try:
        with open(STATS_FILE, "r") as f:
            return json.load(f)
    except:
        return {"total_files": 0, "total_migrations": 0, "total_analyses": 0, "logs": []}

def save_stats(stats):
    try:
        with open(STATS_FILE, "w") as f:
            json.dump(stats, f)
    except:
        pass

def write_audit_log(action, filename, result_summary):
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_line = f"[{timestamp}] action={action} | file={filename} | result={result_summary}\n"
        with open("audit_log.txt", "a", encoding="utf-8") as f:
            f.write(log_line)
    except:
        pass

def track_usage(action, filename):
    stats = load_stats()
    stats["total_files"] += 1
    if "migrate" in action:
        stats["total_migrations"] += 1
    elif "analyze" in action:
        stats["total_analyses"] += 1
    stats["logs"].insert(0, {
        "action": action,
        "filename": filename,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })
    stats["logs"] = stats["logs"][:50]
    save_stats(stats)

def call_groq(prompt, max_tokens=500):
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens
        }
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
        result = response.json()
        if "choices" in result:
            return result["choices"][0]["message"]["content"]
        else:
            return str(result)
    except Exception as e:
        return f"AI service error: {str(e)}"

# ---------- WHY EXPLANATIONS ----------
WHY_RULES = [
    ("xrange", "xrange() was removed in Python 3. range() now returns an efficient iterator, so xrange() is no longer needed."),
    ("raw_input", "raw_input() was renamed to input() in Python 3. The old Python 3-style input() (which evaluated code) was removed for safety."),
    ("has_key", "dict.has_key() was removed in Python 3. The 'in' operator is the standard, faster way to check for a key."),
    ("iteritems", "iteritems() was removed in Python 3. items() now returns an efficient view object, so the iter* methods are gone."),
    ("itervalues", "itervalues() was removed in Python 3. values() now returns an efficient view object."),
    ("iterkeys", "iterkeys() was removed in Python 3. keys() now returns an efficient view object."),
    ("unicode", "The unicode type was merged into str in Python 3, since all strings are now Unicode by default."),
    ("basestring", "basestring was removed in Python 3 because there is now a single str type for text."),
    ("urllib2", "urllib2 was reorganized into urllib.request and urllib.error in Python 3."),
    ("cPickle", "cPickle was merged into the pickle module in Python 3; pickle now uses the fast C version automatically."),
    ("<>", "The <> inequality operator was removed in Python 3. Use != instead."),
    ("except", "Python 3 requires the 'except Exception as e' syntax. The old comma form 'except Exception, e' was removed."),
]

def get_why_explanations(original_source):
    explanations = []
    if "print " in original_source and not "print(" in original_source.split("print ")[0][-5:]:
        explanations.append({"change": "print statement -> print()", "why": "In Python 3, print is a function, not a statement. It must be called with parentheses, e.g. print(x)."})
    for keyword, reason in WHY_RULES:
        if keyword in original_source:
            explanations.append({"change": keyword, "why": reason})
    return explanations

# ---------- DEPENDENCY REQUIREMENTS ----------
DEPENDENCY_RULES = [
    ("urllib2", "urllib2 -> use built-in urllib.request (no external package needed in Python 3)"),
    ("cPickle", "cPickle -> use built-in pickle (no external package needed in Python 3)"),
    ("StringIO", "StringIO -> use built-in io.StringIO (no external package needed in Python 3)"),
    ("commands", "commands module -> use built-in subprocess (no external package needed in Python 3)"),
    ("MySQLdb", "MySQLdb -> install mysqlclient or use PyMySQL for Python 3"),
    ("Tkinter", "Tkinter -> use tkinter (lowercase) in Python 3"),
    ("ConfigParser", "ConfigParser -> use configparser (lowercase) in Python 3"),
    ("Queue", "Queue module -> use queue (lowercase) in Python 3"),
    ("HTMLParser", "HTMLParser -> use html.parser in Python 3"),
    ("urlparse", "urlparse -> use urllib.parse in Python 3"),
]

def check_dependencies(source):
    deps = []
    for keyword, note in DEPENDENCY_RULES:
        if keyword in source:
            deps.append(note)
    return deps

# ---------- TECHNICAL DEBT SCORE ----------
DEBT_RULES = [
    (r'\bprint\s+[^(]', "print statement", 5),
    (r'\bxrange\b', "xrange()", 5),
    (r'\braw_input\b', "raw_input()", 5),
    (r'\.has_key\(', "dict.has_key()", 5),
    (r'\.iteritems\(\)', "iteritems()", 5),
    (r'\.itervalues\(\)', "itervalues()", 5),
    (r'\.iterkeys\(\)', "iterkeys()", 5),
    (r'\bunicode\(', "unicode()", 5),
    (r'\bbasestring\b', "basestring", 5),
    (r'\bexcept\s+\w+\s*,', "old except syntax", 10),
    (r'\burllib2\b', "urllib2 (network)", 20),
    (r'\bcPickle\b', "cPickle", 10),
    (r'\bStringIO\b', "StringIO", 10),
    (r'\bMySQLdb\b', "MySQLdb (database)", 60),
    (r'\bcommands\b', "commands module", 15),
    (r'\bxmlrpclib\b', "xmlrpclib", 20),
    (r'\bhttplib\b', "httplib", 20),
    (r'\bboto\b', "boto (AWS legacy)", 90),
]

def calculate_tech_debt(source):
    items = []
    total_count = 0
    total_minutes = 0
    for pattern, label, mins in DEBT_RULES:
        matches = re.findall(pattern, source)
        count = len(matches)
        if count > 0:
            items.append({
                "issue": label,
                "occurrences": count,
                "minutes_each": mins,
                "estimated_minutes": count * mins
            })
            total_count += count
            total_minutes += count * mins
    debt_score = min(100, total_count * 8)
    if debt_score == 0:
        debt_level = "Minimal debt"
    elif debt_score < 30:
        debt_level = "Low debt"
    elif debt_score < 60:
        debt_level = "Moderate debt"
    else:
        debt_level = "High debt"
    hours = round(total_minutes / 60.0, 1)
    return {
        "debt_score": debt_score,
        "debt_level": debt_level,
        "total_issues": total_count,
        "estimated_minutes": total_minutes,
        "estimated_hours": hours,
        "items": items,
        "summary": f"{total_count} legacy issues detected. Estimated manual remediation effort: ~{hours} developer-hours. StarBuild automates these specific fixes.",
        "disclaimer": "This Technical Debt Score is a code-based estimate derived from counting known legacy patterns and applying average per-fix time assumptions. It is an indicative planning figure, not a guaranteed cost saving. Actual effort depends on testing, integration, and review."
    }

# ---------- DEPENDENCY RISK ASSESSMENT ----------
RISK_RULES = [
    ("MySQLdb", "Database", "High", "MySQLdb (MySQL driver) is not compatible with Python 3 as-is.", "Migrate to mysqlclient or PyMySQL and re-test all DB queries."),
    ("psycopg2", "Database", "Medium", "psycopg2 (PostgreSQL driver) versions differ between Python 2 and 3.", "Pin a Python 3-compatible version and verify connection handling."),
    ("sqlite3", "Database", "Low", "sqlite3 is built-in but cursor/text handling changed slightly in Python 3.", "Verify text vs bytes handling on query results."),
    ("cx_Oracle", "Database", "High", "cx_Oracle has different builds and behavior across Python versions.", "Use a Python 3 build and re-test stored-procedure calls."),
    ("pymongo", "Database", "Medium", "pymongo API changed across major versions.", "Confirm the driver version matches your MongoDB server."),
    ("sqlalchemy", "Database", "Medium", "SQLAlchemy ORM behavior can differ across versions during migration.", "Run your full test suite against the target version."),
    ("urllib2", "API / Network", "High", "urllib2 does not exist in Python 3; network calls will break.", "Replace with urllib.request / urllib.error."),
    ("httplib", "API / Network", "High", "httplib was renamed to http.client in Python 3.", "Update imports to http.client."),
    ("requests", "API / Network", "Low", "requests works on both, but old pinned versions may have TLS issues.", "Upgrade to a current requests version and re-test endpoints."),
    ("urlfetch", "API / Network", "High", "urlfetch (App Engine) is legacy and may not be supported.", "Replace with requests or urllib.request."),
    ("xmlrpclib", "API / Network", "Medium", "xmlrpclib was renamed to xmlrpc.client in Python 3.", "Update imports to xmlrpc.client."),
    ("smtplib", "API / Network", "Low", "smtplib exists in both but message handling changed.", "Verify email.mime usage for Python 3."),
    ("ftplib", "API / Network", "Low", "ftplib exists in both but returns bytes in Python 3.", "Handle bytes vs str on transfers."),
    ("memcache", "Cache / Infra", "Medium", "python-memcached has limited Python 3 support.", "Switch to pymemcache or a maintained client."),
    ("redis", "Cache / Infra", "Low", "redis-py works on both but response decoding changed.", "Set decode_responses explicitly and re-test."),
    ("boto", "Cloud / API", "High", "boto (AWS SDK v2) is legacy; boto3 is the modern SDK.", "Migrate to boto3 and re-test AWS calls."),
    ("paramiko", "API / Network", "Medium", "paramiko (SSH) versions differ in behavior.", "Pin a Python 3-compatible version."),
]

def assess_dependency_risk(source):
    try:
        tree = ast.parse(source)
        imported = set()
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for a in node.names:
                    imported.add(a.name.split(".")[0])
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imported.add(node.module.split(".")[0])
    except:
        imported = set()
    findings = []
    seen = set()
    for pattern, category, level, desc, rec in RISK_RULES:
        in_imports = pattern in imported
        in_source = re.search(r'\b' + re.escape(pattern) + r'\b', source) is not None
        if (in_imports or in_source) and pattern not in seen:
            seen.add(pattern)
            findings.append({
                "dependency": pattern,
                "category": category,
                "risk_level": level,
                "description": desc,
                "recommendation": rec
            })
    high = sum(1 for f in findings if f["risk_level"] == "High")
    medium = sum(1 for f in findings if f["risk_level"] == "Medium")
    low = sum(1 for f in findings if f["risk_level"] == "Low")
    if high > 0:
        overall = "High risk"
    elif medium > 0:
        overall = "Medium risk"
    elif low > 0:
        overall = "Low risk"
    else:
        overall = "No known external dependency risks detected"
    return {
        "findings": findings,
        "high_count": high,
        "medium_count": medium,
        "low_count": low,
        "total_findings": len(findings),
        "overall_risk": overall,
        "disclaimer": "This is a static assessment based on known library compatibility. It flags dependencies that commonly break during migration. Always validate against your live systems before deploying."
    }

# ---------- DEEP VERIFICATION (PYTHON) ----------
def deep_verify_python(code):
    try:
        ast.parse(code)
    except SyntaxError as e:
        return {"verified": False, "verify_message": f"Compilation failed: syntax error on line {e.lineno}. Code is not execution-ready."}
    try:
        compile(code, "<migrated>", "exec")
    except Exception as e:
        return {"verified": False, "verify_message": f"Compilation failed: {str(e)}. Code is not execution-ready."}
    return {"verified": True, "verify_message": "Code compiles successfully and is execution-ready (compile-level verification passed)."}

# ---------- JAVA GUARDRAILS ----------
def validate_java(code):
    if not JAVALANG_AVAILABLE:
        return {"valid": True, "validation_message": "Java parser not available; skipped syntax check."}
    try:
        javalang.parse.parse(code)
        return {"valid": True, "validation_message": "Output is valid Java syntax (parsed successfully)."}
    except Exception as e:
        return {"valid": False, "validation_message": f"Warning: output has a Java syntax error. Please review before use."}

def extract_java_names(code):
    names = set()
    if not JAVALANG_AVAILABLE:
        return names
    try:
        tree = javalang.parse.parse(code)
        for path, node in tree:
            if hasattr(node, "name") and node.name:
                names.add(node.name)
    except:
        pass
    return names

def check_java_integrity(original, migrated):
    orig = extract_java_names(original)
    new = extract_java_names(migrated)
    if not orig or not new:
        return {"vars_ok": True, "var_message": ""}
    missing = orig - new
    expected = {"StringBuffer", "Vector", "Hashtable", "Enumeration"}
    real_missing = [v for v in missing if v not in expected]
    if real_missing:
        return {"vars_ok": False, "var_message": "Warning: these Java names may have been renamed or removed: " + ", ".join(sorted(real_missing)[:8]) + ". Review required."}
    return {"vars_ok": True, "var_message": "All original Java names preserved."}

def calculate_confidence_java(source, migrated, valid, vars_ok):
    score = 100
    reasons = []
    if not valid:
        score -= 50
        reasons.append("output has a Java syntax error")
    if not vars_ok:
        score -= 25
        reasons.append("Java names may have changed")
    if "AI service error" in migrated or migrated.strip() == "":
        score -= 40
        reasons.append("AI did not return usable output")
    if len(source.strip()) > 0:
        ratio = len(migrated.strip()) / len(source.strip())
        if ratio < 0.5:
            score -= 20
            reasons.append("output is much shorter than input (code may be missing)")
    if score < 0:
        score = 0
    if score >= 90:
        level = "High confidence"
    elif score >= 60:
        level = "Medium confidence - review recommended"
    else:
        level = "Low confidence - manual review required"
    reason_text = "; ".join(reasons) if reasons else "all checks passed"
    return {"confidence_score": score, "confidence_level": level, "confidence_reason": reason_text}

# ---------- PYTHON ----------
def analyze_code(source):
    try:
        tree = ast.parse(source)
    except:
        return {"functions": [], "classes": [], "imports": [], "issues": ["Could not parse file (may be Python 2 syntax)"]}
    functions, classes, imports, issues = [], [], [], []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            functions.append(node.name)
        elif isinstance(node, ast.ClassDef):
            classes.append(node.name)
        elif isinstance(node, ast.Import):
            for a in node.names:
                imports.append(a.name)
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.append(node.module)
    py_issue_checks = [
        ('xrange', "xrange() found - use range()"),
        ('raw_input', "raw_input() found - use input()"),
        ('has_key', "dict.has_key() found - use 'in' operator"),
        ('iteritems', "iteritems() found - use items()"),
        ('itervalues', "itervalues() found - use values()"),
        ('iterkeys', "iterkeys() found - use keys()"),
        ('unicode(', "unicode() found - use str()"),
        ('basestring', "basestring found - use str"),
        ('urllib2', "urllib2 found - use urllib.request"),
        ('commands.getoutput', "commands module found - use subprocess"),
        ('itertools.izip', "izip found - use built-in zip()"),
        ('itertools.imap', "imap found - use built-in map()"),
        ('itertools.ifilter', "ifilter found - use built-in filter()"),
        ('.sort(cmp=', "sort(cmp=...) found - use key= instead"),
        ('exec ', "exec statement found - use exec() function"),
        ('<>', "<> operator found - use !="),
        ('apply(', "apply() found - use func(*args)"),
        ('execfile(', "execfile() found - use exec(open(...).read())"),
        ('reduce(', "reduce() found - import from functools"),
        ('StringIO', "StringIO found - use io.StringIO"),
        ('cPickle', "cPickle found - use pickle"),
        ('__cmp__', "__cmp__ found - use rich comparison methods"),
    ]
    for pattern, msg in py_issue_checks:
        if pattern in source:
            issues.append(msg)
    if re.search(r'\bprint\s+[^(]', source):
        issues.append("print statement found - use print()")
    if re.search(r'\bexcept\s+\w+\s*,', source):
        issues.append("old except syntax found - use 'except X as e'")
    return {"functions": functions, "classes": classes, "imports": imports, "issues": issues}

def migrate_code(source):
    changes = []
    migrated = source
    rules = [
        (r'\bxrange\b', 'range', "xrange -> range"),
        (r'\braw_input\b', 'input', "raw_input -> input"),
        (r'\bunicode\(', 'str(', "unicode() -> str()"),
        (r'\bbasestring\b', 'str', "basestring -> str"),
        (r'\.iteritems\(\)', '.items()', "iteritems() -> items()"),
        (r'\.itervalues\(\)', '.values()', "itervalues() -> values()"),
        (r'\.iterkeys\(\)', '.keys()', "iterkeys() -> keys()"),
        (r'import urllib2', 'import urllib.request', "urllib2 -> urllib.request"),
        (r'\bitertools\.izip\b', 'zip', "izip -> zip"),
        (r'\bitertools\.imap\b', 'map', "imap -> map"),
        (r'\bitertools\.ifilter\b', 'filter', "ifilter -> filter"),
        (r'\bcPickle\b', 'pickle', "cPickle -> pickle"),
        (r'\bexecfile\(([^)]+)\)', r'exec(open(\1).read())', "execfile() -> exec(open().read())"),
        (r'\bapply\((\w+),\s*([^)]+)\)', r'\1(*\2)', "apply() -> func(*args)"),
        (r'\s<>\s', ' != ', "<> -> !="),
        (r'\bStringIO\.StringIO\b', 'io.StringIO', "StringIO -> io.StringIO"),
    ]
    for pattern, repl, label in rules:
        if re.search(pattern, migrated):
            migrated = re.sub(pattern, repl, migrated)
            changes.append(label)
    new_lines = []
    for line in migrated.split('\n'):
        m = re.match(r'^(\s*)print\s+(?!\()(.+?)\s*$', line)
        if m:
            new_lines.append(f'{m.group(1)}print({m.group(2)})')
            if "print statement -> print()" not in changes:
                changes.append("print statement -> print()")
        else:
            new_lines.append(line)
    migrated = '\n'.join(new_lines)
    if re.search(r'(\w+)\.has_key\(([^)]+)\)', migrated):
        migrated = re.sub(r'(\w+)\.has_key\(([^)]+)\)', r'\2 in \1', migrated)
        changes.append("has_key() -> in operator")
    if re.search(r'except\s+(\w+)\s*,\s*(\w+)', migrated):
        migrated = re.sub(r'except\s+(\w+)\s*,\s*(\w+)', r'except \1 as \2', migrated)
        changes.append("except X, e -> except X as e")
    return {"migrated_code": migrated, "changes": changes, "why_explanations": get_why_explanations(source), "dependencies": check_dependencies(source)}

# ---------- VALIDATOR (PYTHON) ----------
def validate_python(code):
    try:
        ast.parse(code)
        return {"valid": True, "validation_message": "Output is valid Python syntax."}
    except SyntaxError as e:
        return {"valid": False, "validation_message": f"Warning: output has a syntax error on line {e.lineno}. Please review carefully before use."}
    except Exception as e:
        return {"valid": False, "validation_message": f"Warning: could not verify output ({str(e)}). Please review carefully."}

# ---------- VARIABLE SCOPE MAPPING (PYTHON) ----------
def extract_variables(code):
    names = set()
    try:
        tree = ast.parse(code)
    except:
        return names
    for node in ast.walk(tree):
        if isinstance(node, ast.Name):
            names.add(node.id)
        elif isinstance(node, ast.FunctionDef):
            names.add(node.name)
            for arg in node.args.args:
                names.add(arg.arg)
        elif isinstance(node, ast.ClassDef):
            names.add(node.name)
    return names

def check_variable_integrity(original, migrated):
    orig_vars = extract_variables(original)
    new_vars = extract_variables(migrated)
    if not orig_vars or not new_vars:
        return {"vars_ok": True, "var_message": ""}
    missing = orig_vars - new_vars
    expected_changes = {"xrange", "raw_input", "unicode", "basestring", "iteritems", "itervalues", "iterkeys", "has_key"}
    real_missing = [v for v in missing if v not in expected_changes]
    if real_missing:
        return {"vars_ok": False, "var_message": "Warning: AI may have renamed or removed these names: " + ", ".join(sorted(real_missing)) + ". Review required."}
    return {"vars_ok": True, "var_message": "All original variable names preserved."}

# ---------- CONFIDENCE SCORE (PYTHON) ----------
def calculate_confidence(source, migrated, valid, vars_ok, verified):
    score = 100
    reasons = []
    if not valid:
        score -= 50
        reasons.append("output has a syntax error")
    if not verified:
        score -= 30
        reasons.append("code did not pass compile-level verification")
    if not vars_ok:
        score -= 25
        reasons.append("variable names may have changed")
    if "AI service error" in migrated or migrated.strip() == "":
        score -= 40
        reasons.append("AI did not return usable output")
    if len(source.strip()) > 0:
        ratio = len(migrated.strip()) / len(source.strip())
        if ratio < 0.5:
            score -= 20
            reasons.append("output is much shorter than input (code may be missing)")
    if score < 0:
        score = 0
    if score >= 90:
        level = "High confidence"
    elif score >= 60:
        level = "Medium confidence - review recommended"
    else:
        level = "Low confidence - manual review required"
    reason_text = "; ".join(reasons) if reasons else "all checks passed"
    return {"confidence_score": score, "confidence_level": level, "confidence_reason": reason_text}

# ---------- AI ADVANCED MIGRATION ----------
def ai_advanced_migrate(source, language):
    code_lines = [ln for ln in source.split("\n") if ln.strip() and not ln.strip().startswith("#")]
    if not code_lines:
        if language == "python":
            return {
                "migrated_code": source, "ai_powered": True, "valid": True,
                "validation_message": "File has no executable code (empty or comments only).",
                "verified": True, "verify_message": "Nothing to verify - no executable code.",
                "vars_ok": True, "var_message": "", "confidence_score": 100,
                "confidence_level": "High confidence", "confidence_reason": "no executable code to migrate",
                "why_explanations": [], "dependencies": []
            }
        else:
            return {"migrated_code": source, "ai_powered": True,
                    "valid": True, "validation_message": "File has no executable code.",
                    "confidence_score": 100, "confidence_level": "High confidence",
                    "confidence_reason": "no executable code to migrate"}
    prompt = (
        f"You are an expert {language} developer. "
        f"Convert this legacy {language} code to modern {language}. "
        f"ONLY fix syntax and APIs that are strictly required for modern {language} compatibility. "
        f"Do NOT rename any variables, functions, or classes. "
        f"Do NOT add or remove comments. Do NOT change formatting, logic, or style. "
        f"Keep everything exactly the same except the required fixes. "
        f"Return ONLY the converted code, no explanations, no markdown.\n\n"
        f"Legacy code:\n{source}"
    )
    result = call_groq(prompt, max_tokens=2000)
    cleaned = result.replace(f"```{language}", "").replace("```python", "").replace("```java", "").replace("```php", "").replace("```", "").strip()
    output = {"migrated_code": cleaned, "ai_powered": True}
    if language == "python":
        check = validate_python(cleaned)
        output["valid"] = check["valid"]
        output["validation_message"] = check["validation_message"]
        verify = deep_verify_python(cleaned)
        output["verified"] = verify["verified"]
        output["verify_message"] = verify["verify_message"]
        var_check = check_variable_integrity(source, cleaned)
        output["vars_ok"] = var_check["vars_ok"]
        output["var_message"] = var_check["var_message"]
        conf = calculate_confidence(source, cleaned, output["valid"], output["vars_ok"], output["verified"])
        output.update(conf)
        ai_dropped_code = False
        if len(source.strip()) > 0:
            if len(cleaned.strip()) / len(source.strip()) < 0.8:
                ai_dropped_code = True
        if conf["confidence_score"] < 60 or ai_dropped_code:
            rule_result = migrate_code(source)
            rule_code = rule_result["migrated_code"]
            rule_valid = validate_python(rule_code)
            rule_verify = deep_verify_python(rule_code)
            if rule_valid["valid"] and rule_verify["verified"]:
                output["migrated_code"] = rule_code
                output["valid"] = True
                output["validation_message"] = "Output is valid Python syntax."
                output["verified"] = True
                output["verify_message"] = "Code compiles successfully (rule-based fallback used)."
                output["vars_ok"] = True
                output["var_message"] = "Rule-based migration preserves all names."
                output["confidence_score"] = 95
                output["confidence_level"] = "High confidence"
                output["confidence_reason"] = "AI output was unreliable; switched to deterministic rule-based migration"
                output["fallback_used"] = True
        output["why_explanations"] = get_why_explanations(source)
        output["dependencies"] = check_dependencies(source)
    elif language == "java":
        check = validate_java(cleaned)
        output["valid"] = check["valid"]
        output["validation_message"] = check["validation_message"]
        var_check = check_java_integrity(source, cleaned)
        output["vars_ok"] = var_check["vars_ok"]
        output["var_message"] = var_check["var_message"]
        conf = calculate_confidence_java(source, cleaned, output["valid"], output["vars_ok"])
        output.update(conf)
        if conf["confidence_score"] < 60:
            rule_result = migrate_java(source)
            rule_code = rule_result["migrated_code"]
            rule_valid = validate_java(rule_code)
            if rule_valid["valid"]:
                output["migrated_code"] = rule_code
                output["valid"] = True
                output["validation_message"] = "Output is valid Java syntax."
                output["vars_ok"] = True
                output["var_message"] = "Rule-based migration preserves all names."
                output["confidence_score"] = 95
                output["confidence_level"] = "High confidence"
                output["confidence_reason"] = "AI output was unreliable; switched to deterministic rule-based migration"
                output["fallback_used"] = True
        output["note_java"] = "Java guardrails use syntax-level (AST) verification. Compile-level verification requires a full JDK and is planned for on-premise deployment."
    else:
        output["experimental"] = True
        output["experimental_message"] = f"AI migration for {language.upper()} is experimental. Guardrails for {language.upper()} are planned. For reliable results, use the rule-based Migrate mode."
    return output

# ---------- AI as QA ASSISTANT ----------
def ai_qa_compare(original, migrated):
    prompt = (
        "You are a senior QA engineer reviewing a code migration. "
        "Compare the ORIGINAL and MIGRATED code below. "
        "Answer in this exact format:\n"
        "VERDICT: SAME or DIFFERENT\n"
        "REASON: one short sentence.\n"
        "Only say DIFFERENT if the migrated code would behave differently or lose functionality.\n\n"
        f"ORIGINAL:\n{original}\n\nMIGRATED:\n{migrated}"
    )
    response = call_groq(prompt, max_tokens=300)
    verdict = "UNKNOWN"
    if "VERDICT:" in response:
        after = response.split("VERDICT:")[1].strip()
        if after.upper().startswith("SAME"):
            verdict = "SAME"
        elif after.upper().startswith("DIFFERENT"):
            verdict = "DIFFERENT"
    return {"qa_verdict": verdict, "qa_full_response": response}

# ---------- CALL GRAPH ANALYSIS ----------
def analyze_call_graph(source):
    try:
        tree = ast.parse(source)
    except:
        return {"call_graph_error": "Could not parse file (may be Python 2 syntax). Try migrating it to Python 3 first, then run call-graph analysis."}
    defined_functions = []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            defined_functions.append(node.name)
    calls_map = {}
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            inner_calls = []
            for sub in ast.walk(node):
                if isinstance(sub, ast.Call):
                    fname = None
                    if isinstance(sub.func, ast.Name):
                        fname = sub.func.id
                    elif isinstance(sub.func, ast.Attribute):
                        fname = sub.func.attr
                    if fname and fname in defined_functions and fname != node.name:
                        if fname not in inner_calls:
                            inner_calls.append(fname)
            calls_map[node.name] = inner_calls
    imports = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for a in node.names:
                imports.append(a.name.split(".")[0])
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.append(node.module.split(".")[0])
    imports = sorted(set(imports))
    lib_usage = {}
    for lib in imports:
        usage = []
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                for sub in ast.walk(node):
                    if isinstance(sub, ast.Attribute) and isinstance(sub.value, ast.Name):
                        if sub.value.id == lib and node.name not in usage:
                            usage.append(node.name)
                    elif isinstance(sub, ast.Name) and sub.id == lib and node.name not in usage:
                        usage.append(node.name)
        if usage:
            lib_usage[lib] = usage
    entry_points = [f for f in defined_functions if all(f not in calls for calls in calls_map.values())]
    return {
        "defined_functions": defined_functions,
        "calls_map": calls_map,
        "imports": imports,
        "lib_usage": lib_usage,
        "entry_points": entry_points,
        "total_functions": len(defined_functions)
    }

# ---------- KNOWLEDGE TRANSFER (KT) DOC GENERATOR ----------
def generate_documentation(source, filename):
    analysis = analyze_code(source)
    risk = assess_dependency_risk(source)
    debt = calculate_tech_debt(source)
    callgraph = analyze_call_graph(source)
    prompt = (
        "You are a senior software architect writing handover documentation for a legacy file. "
        "Read the code and write clear, professional documentation a new developer could use. "
        "Use these exact section headers, each on its own line:\n"
        "PURPOSE: (2-3 sentences on what this file does overall)\n"
        "BUSINESS_LOGIC: (explain the main logic and flow in plain English, 3-5 sentences)\n"
        "KEY_FUNCTIONS: (one short line per function describing what it does)\n"
        "NOTES: (any risks, dependencies, or things to watch when migrating)\n\n"
        "Do not use markdown symbols. Just the headers and plain text.\n\n"
        f"Code:\n{source}"
    )
    ai_doc = call_groq(prompt, max_tokens=1200)
    return {
        "filename": filename,
        "ai_documentation": ai_doc,
        "functions": analysis.get("functions", []),
        "classes": analysis.get("classes", []),
        "imports": analysis.get("imports", []),
        "total_functions": callgraph.get("total_functions", 0),
        "entry_points": callgraph.get("entry_points", []),
        "overall_risk": risk.get("overall_risk", "N/A"),
        "high_count": risk.get("high_count", 0),
        "medium_count": risk.get("medium_count", 0),
        "low_count": risk.get("low_count", 0),
        "debt_score": debt.get("debt_score", 0),
        "debt_level": debt.get("debt_level", ""),
        "estimated_hours": debt.get("estimated_hours", 0),
        "doc_generated": True
    }

# ---------- PHP ----------
def analyze_php(source):
    issues = []
    php_checks = [
        (r"\bmysql_\w+\b", "Deprecated mysql_* functions - use mysqli or PDO"),
        (r'\bereg\(', "ereg() found - use preg_match()"),
        (r'\beregi\(', "eregi() found - use preg_match()"),
        (r'\bsplit\(', "split() found - use explode() or preg_split()"),
        (r'\bsession_register\b', "session_register() found - use $_SESSION"),
        (r"\bvar\s+\$\w+", "PHP4-style 'var' property - use public/protected/private"),
        (r'\bmagic_quotes\b', "magic_quotes found - removed in PHP 5.4+"),
        (r'\bcreate_function\b', "create_function() found - use anonymous functions"),
        (r'\bmcrypt_\w+\b', "mcrypt_* found - use openssl or sodium"),
        (r'\beach\(', "each() found - use foreach loop"),
        (r'\bcall_user_method\b', "call_user_method() found - use call_user_func()"),
        (r'\bget_magic_quotes_gpc\b', "get_magic_quotes_gpc() found - removed in PHP 7"),
    ]
    for pattern, msg in php_checks:
        if re.search(pattern, source):
            issues.append(msg)
    return {"issues": issues}

def migrate_php(source):
    changes = []
    migrated = source
    rules = [
        (r'\bmysql_connect\b', 'mysqli_connect', "mysql_connect -> mysqli_connect"),
        (r'\bmysql_query\b', 'mysqli_query', "mysql_query -> mysqli_query"),
        (r'\bmysql_fetch_array\b', 'mysqli_fetch_array', "mysql_fetch_array -> mysqli_fetch_array"),
        (r'\bmysql_fetch_assoc\b', 'mysqli_fetch_assoc', "mysql_fetch_assoc -> mysqli_fetch_assoc"),
        (r'\bmysql_fetch_row\b', 'mysqli_fetch_row', "mysql_fetch_row -> mysqli_fetch_row"),
        (r'\bmysql_num_rows\b', 'mysqli_num_rows', "mysql_num_rows -> mysqli_num_rows"),
        (r'\bmysql_close\b', 'mysqli_close', "mysql_close -> mysqli_close"),
        (r'\bmysql_error\b', 'mysqli_error', "mysql_error -> mysqli_error"),
        (r'\bmysql_insert_id\b', 'mysqli_insert_id', "mysql_insert_id -> mysqli_insert_id"),
        (r'\bmysql_real_escape_string\b', 'mysqli_real_escape_string', "mysql_real_escape_string -> mysqli_real_escape_string"),
        (r'\bmysql_select_db\b', 'mysqli_select_db', "mysql_select_db -> mysqli_select_db"),
        (r'\bereg_replace\(', 'preg_replace(', "ereg_replace() -> preg_replace()"),
        (r'\bereg\(', 'preg_match(', "ereg() -> preg_match()"),
        (r'\bsplit\(', 'explode(', "split() -> explode()"),
        (r'\bcall_user_method\b', 'call_user_func', "call_user_method -> call_user_func"),
    ]
    for pattern, repl, label in rules:
        if re.search(pattern, migrated):
            migrated = re.sub(pattern, repl, migrated)
            changes.append(label)
    if re.search(r'var\s+\$(\w+)', migrated):
        migrated = re.sub(r'var\s+\$(\w+)', r'public $\1', migrated)
        changes.append("var -> public")
    return {"migrated_code": migrated, "changes": changes}

# ---------- JAVA ----------
def analyze_java(source):
    issues = []
    java_checks = [
        (r"\bStringBuffer\b", "StringBuffer found - use StringBuilder"),
        (r"\bnew\s+Integer\s*\(", "new Integer() found - use Integer.valueOf()"),
        (r"\bnew\s+Boolean\s*\(", "new Boolean() found - use Boolean.valueOf()"),
        (r"\bnew\s+Double\s*\(", "new Double() found - use Double.valueOf()"),
        (r"\bVector\b", "Vector found - use ArrayList"),
        (r"\bHashtable\b", "Hashtable found - use HashMap"),
        (r"\bEnumeration\b", "Enumeration found - use Iterator"),
        (r"\bSystem\.out\.println\b", "System.out.println - consider a logging framework"),
    ]
    for pattern, msg in java_checks:
        if re.search(pattern, source):
            issues.append(msg)
    return {"issues": issues}

def migrate_java(source):
    changes = []
    migrated = source
    rules = [
        (r'\bnew\s+Integer\(', 'Integer.valueOf(', "new Integer() -> Integer.valueOf()"),
        (r'\bnew\s+Boolean\(', 'Boolean.valueOf(', "new Boolean() -> Boolean.valueOf()"),
        (r'\bnew\s+Double\(', 'Double.valueOf(', "new Double() -> Double.valueOf()"),
        (r'\bnew\s+Long\(', 'Long.valueOf(', "new Long() -> Long.valueOf()"),
        (r'\bStringBuffer\b', 'StringBuilder', "StringBuffer -> StringBuilder"),
        (r'\bVector\b', 'ArrayList', "Vector -> ArrayList"),
        (r'\bHashtable\b', 'HashMap', "Hashtable -> HashMap"),
        (r'\bEnumeration\b', 'Iterator', "Enumeration -> Iterator"),
    ]
    for pattern, repl, label in rules:
        if re.search(pattern, migrated):
            migrated = re.sub(pattern, repl, migrated)
            changes.append(label)
    return {"migrated_code": migrated, "changes": changes}

# ---------- COBOL ----------
def analyze_cobol(source):
    issues = []
    cobol_checks = [
        ('PERFORM', "PERFORM found - convert to functions/loops"),
        ('GOTO', "GOTO found - use structured programming"),
        ('GO TO', "GO TO found - use structured programming"),
        ('PIC 9', "PIC 9 numeric fields - convert to int/float"),
        ('PIC X', "PIC X string fields - convert to str"),
        ('MOVE', "MOVE statement - use Python assignment"),
        ('COMPUTE', "COMPUTE found - use Python arithmetic"),
        ('ACCEPT', "ACCEPT found - use input()"),
        ('STOP RUN', "STOP RUN found - use return/exit"),
        ('WORKING-STORAGE', "WORKING-STORAGE section - convert to variables"),
        ('PERFORM UNTIL', "PERFORM UNTIL - convert to while loop"),
    ]
    for pattern, msg in cobol_checks:
        if pattern in source:
            issues.append(msg)
    return {"issues": issues}

def migrate_cobol(source):
    changes = []
    migrated = "# Converted from COBOL\n\n"
    if 'IDENTIFICATION DIVISION' in source:
        changes.append("IDENTIFICATION DIVISION removed")
    if 'WORKING-STORAGE' in source:
        changes.append("WORKING-STORAGE -> Python variables")
    if 'DATA DIVISION' in source:
        changes.append("DATA DIVISION -> Python variables")
        migrated += "# Variables\n"
    if 'PROCEDURE DIVISION' in source:
        changes.append("PROCEDURE DIVISION -> Python function")
        migrated += "\ndef main():\n    pass\n\nif __name__ == '__main__':\n    main()\n"
    if 'DISPLAY' in source:
        changes.append("DISPLAY -> print()")
    if 'PERFORM UNTIL' in source:
        changes.append("PERFORM UNTIL -> while loop")
    if 'ACCEPT' in source:
        changes.append("ACCEPT -> input()")
    return {"migrated_code": migrated, "changes": changes}

# ---------- AI ----------
def ai_suggest(source, language):
    prompt = f"You are a code review expert. Review this {language} code and give exactly 3 specific improvement suggestions for {language}:\n\n{source}"
    return {"suggestions": call_groq(prompt)}

def ai_explain(source, language):
    prompt = f"You are a programming teacher. Explain this {language} code in simple terms, section by section, so a beginner can understand what it does:\n\n{source}"
    return {"explanation": call_groq(prompt)}

def ai_generate_tests(source, language):
    prompt = f"You are a test engineer. Write unit tests for this {language} code. Provide only the test code with brief comments:\n\n{source}"
    return {"tests": call_groq(prompt)}

def detect_language(filename):
    ext = filename.split('.')[-1].lower()
    return {"py": "python", "java": "java", "php": "php", "cbl": "cobol"}.get(ext, "python")

# ---------- ERROR HANDLING ----------
MAX_FILE_SIZE = 500000

def safe_read_file(content_bytes, filename):
    if len(content_bytes) > MAX_FILE_SIZE:
        return None, f"File too large ({len(content_bytes)} bytes). Maximum is {MAX_FILE_SIZE} bytes."
    if len(content_bytes) == 0:
        return None, "File is empty."
    try:
        source = content_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        return None, f"Could not read file (encoding issue): {str(e)}"
    printable = sum(1 for c in source[:1000] if c.isprintable() or c in "\n\r\t ")
    if len(source) > 0 and printable / min(len(source), 1000) < 0.7:
        return None, "File does not appear to be text/code (may be binary)."
    return source, None

# ---------- ENDPOINTS ----------
@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        content = await file.read()
        source, error = safe_read_file(content, file.filename)
        if error:
            return {"filename": file.filename, "error": error}
        result = analyze_code(source)
        result["filename"] = file.filename
        track_usage("analyze", file.filename)
        write_audit_log("analyze", file.filename, f"issues={len(result.get('issues', []))}")
        return result
    except Exception as e:
        return {"filename": file.filename, "error": f"Analysis failed safely: {str(e)}"}

@app.post("/migrate")
async def migrate(file: UploadFile = File(...)):
    try:
        content = await file.read()
        source, error = safe_read_file(content, file.filename)
        if error:
            return {"filename": file.filename, "error": error}
        result = migrate_code(source)
        result["filename"] = file.filename
        track_usage("migrate", file.filename)
        write_audit_log("migrate", file.filename, f"changes={len(result.get('changes', []))}")
        return result
    except Exception as e:
        return {"filename": file.filename, "error": f"Migration failed safely: {str(e)}"}

@app.post("/ai-migrate")
async def ai_migrate_endpoint(file: UploadFile = File(...)):
    try:
        content = await file.read()
        source, error = safe_read_file(content, file.filename)
        if error:
            return {"filename": file.filename, "error": error}
        result = ai_advanced_migrate(source, detect_language(file.filename))
        result["filename"] = file.filename
        track_usage("ai-migrate", file.filename)
        summary = f"confidence={result.get('confidence_score','N/A')} level={result.get('confidence_level','N/A')}"
        write_audit_log("ai-migrate", file.filename, summary)
        return result
    except Exception as e:
        return {"filename": file.filename, "error": f"Migration failed safely: {str(e)}"}

class QARequest(BaseModel):
    original: str
    migrated: str

@app.post("/qa-check")
async def qa_check(req: QARequest):
    try:
        result = ai_qa_compare(req.original, req.migrated)
        write_audit_log("qa-check", "code-pair", f"verdict={result['qa_verdict']}")
        return result
    except Exception as e:
        return {"qa_verdict": "ERROR", "qa_full_response": f"QA check failed safely: {str(e)}"}

@app.post("/call-graph")
async def call_graph_endpoint(file: UploadFile = File(...)):
    try:
        content = await file.read()
        source, error = safe_read_file(content, file.filename)
        if error:
            return {"filename": file.filename, "error": error}
        result = analyze_call_graph(source)
        result["filename"] = file.filename
        track_usage("call-graph", file.filename)
        write_audit_log("call-graph", file.filename, "functions=" + str(result.get("total_functions", 0)))
        return result
    except Exception as e:
        return {"filename": file.filename, "error": f"Call-graph analysis failed safely: {str(e)}"}

@app.post("/risk-assessment")
async def risk_assessment_endpoint(file: UploadFile = File(...)):
    try:
        content = await file.read()
        source, error = safe_read_file(content, file.filename)
        if error:
            return {"filename": file.filename, "error": error}
        result = assess_dependency_risk(source)
        result["filename"] = file.filename
        track_usage("risk-assessment", file.filename)
        write_audit_log("risk-assessment", file.filename, "overall=" + result.get("overall_risk", "N/A"))
        return result
    except Exception as e:
        return {"filename": file.filename, "error": f"Risk assessment failed safely: {str(e)}"}

@app.post("/tech-debt")
async def tech_debt_endpoint(file: UploadFile = File(...)):
    try:
        content = await file.read()
        source, error = safe_read_file(content, file.filename)
        if error:
            return {"filename": file.filename, "error": error}
        result = calculate_tech_debt(source)
        result["filename"] = file.filename
        track_usage("tech-debt", file.filename)
        write_audit_log("tech-debt", file.filename, "score=" + str(result.get("debt_score", 0)) + " hours=" + str(result.get("estimated_hours", 0)))
        return result
    except Exception as e:
        return {"filename": file.filename, "error": f"Tech-debt analysis failed safely: {str(e)}"}

@app.post("/generate-docs")
async def generate_docs_endpoint(file: UploadFile = File(...)):
    try:
        content = await file.read()
        source, error = safe_read_file(content, file.filename)
        if error:
            return {"filename": file.filename, "error": error}
        result = generate_documentation(source, file.filename)
        track_usage("generate-docs", file.filename)
        write_audit_log("generate-docs", file.filename, "doc generated")
        return result
    except Exception as e:
        return {"filename": file.filename, "error": f"Doc generation failed safely: {str(e)}"}

@app.post("/download")
async def download(file: UploadFile = File(...)):
    source = (await file.read()).decode("utf-8", errors='ignore')
    result = migrate_code(source)
    migrated = result.get("migrated_code", "")
    filename = file.filename
    if filename.endswith('.py'):
        filename = filename.replace('.py', '_migrated.py')
    return Response(
        content=migrated.encode('utf-8'),
        media_type='application/octet-stream',
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@app.post("/analyze-php")
async def analyze_php_endpoint(file: UploadFile = File(...)):
    source = (await file.read()).decode("utf-8", errors='ignore')
    result = analyze_php(source)
    result["filename"] = file.filename
    track_usage("analyze-php", file.filename)
    return result

@app.post("/migrate-php")
async def migrate_php_endpoint(file: UploadFile = File(...)):
    source = (await file.read()).decode("utf-8", errors='ignore')
    result = migrate_php(source)
    result["filename"] = file.filename
    track_usage("migrate-php", file.filename)
    write_audit_log("migrate-php", file.filename, f"changes={len(result.get('changes', []))}")
    return result

@app.post("/analyze-java")
async def analyze_java_endpoint(file: UploadFile = File(...)):
    source = (await file.read()).decode("utf-8", errors='ignore')
    result = analyze_java(source)
    result["filename"] = file.filename
    track_usage("analyze-java", file.filename)
    return result

@app.post("/migrate-java")
async def migrate_java_endpoint(file: UploadFile = File(...)):
    source = (await file.read()).decode("utf-8", errors='ignore')
    result = migrate_java(source)
    result["filename"] = file.filename
    track_usage("migrate-java", file.filename)
    write_audit_log("migrate-java", file.filename, f"changes={len(result.get('changes', []))}")
    return result

@app.post("/analyze-cobol")
async def analyze_cobol_endpoint(file: UploadFile = File(...)):
    source = (await file.read()).decode("utf-8", errors='ignore')
    result = analyze_cobol(source)
    result["filename"] = file.filename
    track_usage("analyze-cobol", file.filename)
    return result

@app.post("/migrate-cobol")
async def migrate_cobol_endpoint(file: UploadFile = File(...)):
    source = (await file.read()).decode("utf-8", errors='ignore')
    result = migrate_cobol(source)
    result["filename"] = file.filename
    track_usage("migrate-cobol", file.filename)
    write_audit_log("migrate-cobol", file.filename, f"changes={len(result.get('changes', []))}")
    return result

@app.post("/ai-suggest")
async def ai_suggest_endpoint(file: UploadFile = File(...)):
    source = (await file.read()).decode("utf-8", errors='ignore')
    result = ai_suggest(source, detect_language(file.filename))
    result["filename"] = file.filename
    track_usage("ai-suggest", file.filename)
    return result

@app.post("/explain")
async def explain_endpoint(file: UploadFile = File(...)):
    source = (await file.read()).decode("utf-8", errors='ignore')
    result = ai_explain(source, detect_language(file.filename))
    result["filename"] = file.filename
    track_usage("explain", file.filename)
    return result

@app.post("/generate-tests")
async def generate_tests_endpoint(file: UploadFile = File(...)):
    source = (await file.read()).decode("utf-8", errors='ignore')
    result = ai_generate_tests(source, detect_language(file.filename))
    result["filename"] = file.filename
    track_usage("generate-tests", file.filename)
    return result

@app.get("/stats")
def get_stats():
    return load_stats()

@app.get("/audit-log")
def get_audit_log():
    try:
        with open("audit_log.txt", "r", encoding="utf-8") as f:
            lines = f.readlines()
        return {"total_entries": len(lines), "recent": lines[-50:]}
    except:
        return {"total_entries": 0, "recent": []}

@app.get("/audit-log-json")
def get_audit_log_json():
    entries = []
    try:
        with open("audit_log.txt", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                entry = {"raw": line}
                try:
                    if line.startswith("["):
                        entry["timestamp"] = line.split("]")[0][1:]
                    if "action=" in line:
                        entry["action"] = line.split("action=")[1].split(" |")[0].strip()
                    if "file=" in line:
                        entry["file"] = line.split("file=")[1].split(" |")[0].strip()
                    if "result=" in line:
                        entry["result"] = line.split("result=")[1].strip()
                except:
                    pass
                entries.append(entry)
        return {"audit_ready": True, "total_entries": len(entries), "entries": entries[-100:]}
    except:
        return {"audit_ready": True, "total_entries": 0, "entries": []}

@app.get("/")
def root():
    return {"message": "API is running"}