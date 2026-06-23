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

def call_groq(prompt):
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 500
        }
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        result = response.json()
        if "choices" in result:
            return result["choices"][0]["message"]["content"]
        else:
            return str(result)
    except Exception as e:
        return f"AI service error: {str(e)}"

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
    if 'xrange' in source:
        issues.append("xrange() found - use range()")
    if re.search(r'\bprint\s+[^(]', source):
        issues.append("print statement found - use print()")
    if 'raw_input' in source:
        issues.append("raw_input() found - use input()")
    if 'has_key' in source:
        issues.append("dict.has_key() found - use 'in' operator")
    if 'iteritems' in source:
        issues.append("iteritems() found - use items()")
    if 'itervalues' in source:
        issues.append("itervalues() found - use values()")
    if 'iterkeys' in source:
        issues.append("iterkeys() found - use keys()")
    if 'unicode(' in source:
        issues.append("unicode() found - use str()")
    if 'basestring' in source:
        issues.append("basestring found - use str")
    if re.search(r'\bexcept\s+\w+\s*,', source):
        issues.append("old except syntax found - use 'except X as e'")
    if 'urllib2' in source:
        issues.append("urllib2 found - use urllib.request")
    if 'commands.getoutput' in source:
        issues.append("commands module found - use subprocess")
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
    ]
    for pattern, repl, label in rules:
        if re.search(pattern, migrated):
            migrated = re.sub(pattern, repl, migrated)
            changes.append(label)
    # print statement -> print()
    new_lines = []
    for line in migrated.split('\n'):
        m = re.match(r'^(\s*)print\s+(?!\()(.+)$', line)
        if m:
            new_lines.append(f'{m.group(1)}print({m.group(2)})')
            if "print statement -> print()" not in changes:
                changes.append("print statement -> print()")
        else:
            new_lines.append(line)
    migrated = '\n'.join(new_lines)
    # dict.has_key("x") -> "x" in dict
    def haskey_repl(m):
        return f'{m.group(2)} in {m.group(1)}'
    if re.search(r'(\w+)\.has_key\(([^)]+)\)', migrated):
        migrated = re.sub(r'(\w+)\.has_key\(([^)]+)\)', haskey_repl, migrated)
        changes.append("has_key() -> in operator")
    # except X, e -> except X as e
    if re.search(r'except\s+(\w+)\s*,\s*(\w+)', migrated):
        migrated = re.sub(r'except\s+(\w+)\s*,\s*(\w+)', r'except \1 as \2', migrated)
        changes.append("except X, e -> except X as e")
    return {"migrated_code": migrated, "changes": changes}

# ---------- PHP ----------
def analyze_php(source):
    issues = []
    if re.search(r"\bmysql_\w+\b", source):
        issues.append("Deprecated mysql_* functions - use mysqli or PDO")
    if 'ereg(' in source or 'eregi(' in source:
        issues.append("ereg()/eregi() found - use preg_match()")
    if re.search(r'\bsplit\(', source):
        issues.append("split() found - use explode() or preg_split()")
    if 'session_register' in source:
        issues.append("session_register() found - use $_SESSION")
    if re.search(r"\bvar\s+\$\w+", source):
        issues.append("PHP4-style 'var' property - use public/protected/private")
    if 'magic_quotes' in source:
        issues.append("magic_quotes found - removed in PHP 5.4+")
    if re.search(r'\bcreate_function\b', source):
        issues.append("create_function() found - use anonymous functions")
    if 'mcrypt_' in source:
        issues.append("mcrypt_* found - use openssl or sodium")
    if re.search(r'\bset_magic_quotes_runtime\b', source):
        issues.append("set_magic_quotes_runtime() found - removed")
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
    if re.search(r"\bStringBuffer\b", source):
        issues.append("StringBuffer found - use StringBuilder")
    if re.search(r"\bnew\s+Integer\s*\(", source):
        issues.append("new Integer() found - use Integer.valueOf()")
    if re.search(r"\bnew\s+Boolean\s*\(", source):
        issues.append("new Boolean() found - use Boolean.valueOf()")
    if re.search(r"\bnew\s+Double\s*\(", source):
        issues.append("new Double() found - use Double.valueOf()")
    if re.search(r"\bnew\s+Long\s*\(", source):
        issues.append("new Long() found - use Long.valueOf()")
    if re.search(r"\bSystem\.out\.println\b", source):
        issues.append("System.out.println - consider a logging framework")
    if re.search(r"\b(Vector|Hashtable)\b", source):
        issues.append("Vector/Hashtable found - use ArrayList/HashMap")
    if re.search(r"\bEnumeration\b", source):
        issues.append("Enumeration found - use Iterator")
    if '.stop()' in source or '.suspend()' in source:
        issues.append("Thread.stop()/suspend() found - deprecated and unsafe")
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
    ]
    for pattern, repl, label in rules:
        if re.search(pattern, migrated):
            migrated = re.sub(pattern, repl, migrated)
            changes.append(label)
    return {"migrated_code": migrated, "changes": changes}

# ---------- COBOL ----------
def analyze_cobol(source):
    issues = []
    if 'PERFORM' in source:
        issues.append("PERFORM found - convert to functions")
    if 'GOTO' in source or 'GO TO' in source:
        issues.append("GOTO found - use structured programming")
    if 'PIC 9' in source:
        issues.append("PIC 9 numeric fields - convert to int/float")
    if 'PIC X' in source:
        issues.append("PIC X string fields - convert to str")
    if 'MOVE' in source:
        issues.append("MOVE statement - use Python assignment")
    if 'COMPUTE' in source:
        issues.append("COMPUTE found - use Python arithmetic")
    if 'ACCEPT' in source:
        issues.append("ACCEPT found - use input()")
    if 'STOP RUN' in source:
        issues.append("STOP RUN found - use return/exit")
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
    if 'ACCEPT' in source:
        changes.append("ACCEPT -> input()")
    if 'STOP RUN' in source:
        changes.append("STOP RUN -> return")
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