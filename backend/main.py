from fastapi import FastAPI, UploadFile, File
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import ast
import os
import re
from collections import defaultdict, Counter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def analyze_code(source):
    tree = ast.parse(source)
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
        issues.append("xrange() found — use range()")
    if 'print ' in source and 'print(' not in source:
        issues.append("print statement found — use print()")
    if 'raw_input' in source:
        issues.append("raw_input() found — use input()")
    return {"functions": functions, "classes": classes, "imports": imports, "issues": issues}

def migrate_code(source):
    changes = []
    migrated = source
    if 'xrange' in migrated:
        migrated = migrated.replace('xrange', 'range')
        changes.append("xrange → range")
    if 'raw_input' in migrated:
        migrated = migrated.replace('raw_input', 'input')
        changes.append("raw_input → input")
    if 'unicode(' in migrated:
        migrated = migrated.replace('unicode(', 'str(')
        changes.append("unicode → str")
    return {"migrated_code": migrated, "changes": changes}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    content = await file.read()
    source = content.decode("utf-8")
    result = analyze_code(source)
    result["filename"] = file.filename
    return result

@app.post("/migrate")
async def migrate(file: UploadFile = File(...)):
    content = await file.read()
    source = content.decode("utf-8")
    result = migrate_code(source)
    result["filename"] = file.filename
    return result

@app.post("/download")
async def download(file: UploadFile = File(...)):
    content = await file.read()
    source = content.decode("utf-8")
    result = migrate_code(source)
    migrated = result.get("migrated_code", "")
    filename = file.filename
    if filename.endswith('.py'):
        filename = filename.replace('.py', '_migrated.py')
    else:
        filename = f"{filename}_migrated"
    return Response(
        content=migrated.encode('utf-8'),
        media_type='application/octet-stream',
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

def migrate_php(source: str):
    changes = []
    migrated = source
    if 'mysql_connect' in migrated:
        migrated = migrated.replace('mysql_connect', 'mysqli_connect')
        changes.append("mysql_connect -> mysqli_connect")
    if 'mysql_query' in migrated:
        migrated = migrated.replace('mysql_query', 'mysqli_query')
        changes.append("mysql_query -> mysqli_query")
    if 'mysql_fetch_array' in migrated:
        migrated = migrated.replace('mysql_fetch_array', 'mysqli_fetch_array')
        changes.append("mysql_fetch_array -> mysqli_fetch_array")
    if 'ereg(' in migrated:
        migrated = migrated.replace('ereg(', 'preg_match(')
        changes.append("ereg() -> preg_match()")
    if 'split(' in migrated:
        migrated = migrated.replace('split(', 'explode(')
        changes.append("split() -> explode()")
    if 'session_register' in migrated:
        changes.append("session_register() is deprecated - use $_SESSION")
    migrated = re.sub(r'var\s+\$(\w+)', r'public $\1', migrated)
    if 'public $' in migrated:
        changes.append("var -> public (PHP4 -> PHP7)")
    return {"migrated_code": migrated, "changes": changes}

def analyze_php(source: str):
    issues = []
    if re.search(r"\bmysql_\w+\b", source):
        issues.append("Deprecated mysql_* functions found — use mysqli or PDO")
    if 'ereg(' in source:
        issues.append("ereg() found — use preg_match() or PCRE")
    if 'split(' in source:
        issues.append("split() found — use explode() or preg_split()")
    if 'session_register' in source:
        issues.append("session_register() found — use $_SESSION instead")
    if re.search(r"\bvar\s+\$\w+", source):
        issues.append("PHP4-style property declarations found — use public/protected/private")
    if re.search(r"\becho\s+\$\w+", source) and 'htmlspecialchars' not in source:
        issues.append("Raw output detected — consider escaping HTML output")
    return {"issues": issues}

@app.post("/migrate-php")
async def migrate_php_endpoint(file: UploadFile = File(...)):
    content = await file.read()
    source = content.decode("utf-8", errors='ignore')
    result = migrate_php(source)
    result["filename"] = file.filename
    return result

@app.post("/analyze-php")
async def analyze_php_endpoint(file: UploadFile = File(...)):
    content = await file.read()
    source = content.decode("utf-8", errors='ignore')
    result = analyze_php(source)
    result["filename"] = file.filename
    return result

def migrate_java(source: str):
    changes = []
    migrated = source
    if 'public static void main' in migrated:
        changes.append("main method detected")
    migrated = re.sub(r"\bString\s+(\w+)\s*=", r"var \1 =", migrated)
    if re.search(r"\bvar\s+\w+\s*=", migrated):
        changes.append("String declarations -> var (Java 10+)")
    if 'System.out.println' in migrated:
        changes.append("System.out.println detected - consider using Logger")
    if re.search(r"for\s*\(\s*int\s+\w+\s*=\s*0", migrated):
        changes.append("Old-style for loop detected - consider enhanced for loop or streams")
    if 'StringBuffer' in migrated:
        migrated = migrated.replace('StringBuffer', 'StringBuilder')
        changes.append("StringBuffer -> StringBuilder")
    if 'new Integer(' in migrated:
        migrated = migrated.replace('new Integer(', 'Integer.valueOf(')
        changes.append("new Integer() -> Integer.valueOf()")
    return {"migrated_code": migrated, "changes": changes}

def analyze_java(source: str):
    issues = []
    if re.search(r"\bStringBuffer\b", source):
        issues.append("Use StringBuilder instead of StringBuffer when single-threaded")
    if re.search(r"\bnew\s+Integer\s*\(", source):
        issues.append("Use Integer.valueOf() or autoboxing instead of new Integer()")
    if re.search(r"\bSystem\.out\.println\b", source):
        issues.append("Consider using a logging framework (java.util.logging, SLF4J, Log4j)")
    if re.search(r"for\s*\(\s*int\s+\w+\s*=\s*0", source):
        issues.append("Old-style for loop found — consider enhanced for loop or streams API")
    if re.search(r"\b(Vector|Hashtable)\b", source):
        issues.append("Consider using ArrayList/HashMap instead of Vector/Hashtable")
    if re.search(r"\b\bDate\b", source) and not re.search(r"\b(LocalDate|LocalDateTime|java\.time)\b", source):
        issues.append("Consider using java.time APIs instead of Date")
    if re.search(r"\bpublic\s+static\s+void\s+main\s*\(", source):
        issues.append("Contains main method — consider separating application entrypoint from library code")
    if re.search(r"new\s+File(InputStream|Reader)|BufferedReader\(|FileInputStream\(|FileReader\(|BufferedWriter\(|FileWriter\(", source) and 'try (' not in source:
        issues.append("Resource handling detected — consider try-with-resources to ensure proper closing")
    return {"issues": issues}

@app.post("/migrate-java")
async def migrate_java_endpoint(file: UploadFile = File(...)):
    content = await file.read()
    source = content.decode("utf-8", errors='ignore')
    result = migrate_java(source)
    result["filename"] = file.filename
    return result

@app.post("/analyze-java")
async def analyze_java_endpoint(file: UploadFile = File(...)):
    content = await file.read()
    source = content.decode("utf-8", errors='ignore')
    result = analyze_java(source)
    result["filename"] = file.filename
    return result

@app.get("/")
def root():
    return {"message": "Legacy Migration Tool API is running!"}
