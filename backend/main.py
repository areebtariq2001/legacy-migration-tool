from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import ast
import re
import os
import requests
import json
from datetime import datetime

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

# ---------- WHY EXPLANATIONS (sir's suggestion) ----------
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
    return {"migrated_code": migrated, "changes": changes, "why_explanations": get_why_explanations(source)}

# ---------- VALIDATOR (syntax check) ----------
def validate_python(code):
    try:
        ast.parse(code)
        return {"valid": True, "validation_message": "Output is valid Python syntax."}
    except SyntaxError as e:
        return {"valid": False, "validation_message": f"Warning: output has a syntax error on line {e.lineno}. Please review carefully before use."}
    except Exception as e:
        return {"valid": False, "validation_message": f"Warning: could not verify output ({str(e)}). Please review carefully."}

# ---------- VARIABLE SCOPE MAPPING ----------
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

# ---------- CONFIDENCE SCORE ----------
def calculate_confidence(source, migrated, valid, vars_ok):
    score = 100
    reasons = []
    if not valid:
        score -= 50
        reasons.append("output has a syntax error")
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
    prompt = (
        f"You are an expert {language} developer. "
        f"Convert this legacy {language} code to {language} 3. "
        f"ONLY fix syntax that is strictly required for {language} 3 compatibility. "
        f"Do NOT rename any variables, functions, or classes. "
        f"Do NOT add or remove comments. Do NOT change formatting, logic, or style. "
        f"Keep everything exactly the same except the required syntax fixes. "
        f"Return ONLY the converted code, no explanations, no markdown.\n\n"
        f"Legacy code:\n{source}"
    )
    result = call_groq(prompt, max_tokens=2000)
    cleaned = result.replace("```python", "").replace("```", "").strip()
    output = {"migrated_code": cleaned, "ai_powered": True}
    if language == "python":
        check = validate_python(cleaned)
        output["valid"] = check["valid"]
        output["validation_message"] = check["validation_message"]
        var_check = check_variable_integrity(source, cleaned)
        output["vars_ok"] = var_check["vars_ok"]
        output["var_message"] = var_check["var_message"]
        conf = calculate_confidence(source, cleaned, output["valid"], output["vars_ok"])
        output.update(conf)
        output["why_explanations"] = get_why_explanations(source)
    return output

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
        (r'\bmysql_real_escape_string\b', 'mysqli_real_escape_string', "mysql_real_escape_string -> mysqli_real_escape_string"),
        (r'\bereg\(', 'preg_match(', "ereg() -> preg_match()"),
        (r'\beregi\(', 'preg_match(', "eregi() -> preg_match()"),
        (r'\bsplit\(', 'explode(', "split() -> explode()"),
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
        (r"\bnew\s+Long\s*\(", "new Long() found - use Long.valueOf()"),
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
        (r'\bStringBuffer\b', 'StringBuilder', "StringBuffer -> StringBuilder"),
        (r'\bnew\s+Integer\(', 'Integer.valueOf(', "new Integer() -> Integer.valueOf()"),
        (r'\bnew\s+Boolean\(', 'Boolean.valueOf(', "new Boolean() -> Boolean.valueOf()"),
        (r'\bnew\s+Double\(', 'Double.valueOf(', "new Double() -> Double.valueOf()"),
        (r'\bnew\s+Long\(', 'Long.valueOf(', "new Long() -> Long.valueOf()"),
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
        ('PIC 9', "PIC 9 numeric fields - convert to int/float"),
        ('PIC X', "PIC X string fields - convert to str"),
        ('MOVE', "MOVE statement - use Python assignment"),
        ('COMPUTE', "COMPUTE found - use Python arithmetic"),
        ('ACCEPT', "ACCEPT found - use input()"),
        ('STOP RUN', "STOP RUN found - use return/exit"),
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
    if 'DATA DIVISION' in source:
        changes.append("DATA DIVISION -> Python variables")
        migrated += "# Variables\n"
    if 'PROCEDURE DIVISION' in source:
        changes.append("PROCEDURE DIVISION -> Python function")
        migrated += "\ndef main():\n    pass\n\nif __name__ == '__main__':\n    main()\n"
    if 'DISPLAY' in source:
        changes.append("DISPLAY -> print()")
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

# ---------- ENDPOINTS ----------
@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    source = (await file.read()).decode("utf-8", errors='ignore')
    result = analyze_code(source)
    result["filename"] = file.filename
    track_usage("analyze", file.filename)
    return result

@app.post("/migrate")
async def migrate(file: UploadFile = File(...)):
    source = (await file.read()).decode("utf-8", errors='ignore')
    result = migrate_code(source)
    result["filename"] = file.filename
    track_usage("migrate", file.filename)
    return result

@app.post("/ai-migrate")
async def ai_migrate_endpoint(file: UploadFile = File(...)):
    source = (await file.read()).decode("utf-8", errors='ignore')
    result = ai_advanced_migrate(source, detect_language(file.filename))
    result["filename"] = file.filename
    track_usage("ai-migrate", file.filename)
    return result

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

@app.get("/")
def root():
    return {"message": "API is running"}