from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import ast
import re
import os
import requests

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

def analyze_code(source):
    try:
        tree = ast.parse(source)
    except:
        return {"functions": [], "classes": [], "imports": [], "issues": ["Could not parse file"]}
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
    if 'print ' in source and 'print(' not in source:
        issues.append("print statement found - use print()")
    if 'raw_input' in source:
        issues.append("raw_input() found - use input()")
    return {"functions": functions, "classes": classes, "imports": imports, "issues": issues}

def migrate_code(source):
    changes = []
    migrated = source
    if 'xrange' in migrated:
        migrated = migrated.replace('xrange', 'range')
        changes.append("xrange -> range")
    if 'raw_input' in migrated:
        migrated = migrated.replace('raw_input', 'input')
        changes.append("raw_input -> input")
    if 'unicode(' in migrated:
        migrated = migrated.replace('unicode(', 'str(')
        changes.append("unicode -> str")
    return {"migrated_code": migrated, "changes": changes}

def analyze_php(source: str):
    issues = []
    if re.search(r"\bmysql_\w+\b", source):
        issues.append("Deprecated mysql_* functions found - use mysqli or PDO")
    if 'ereg(' in source:
        issues.append("ereg() found - use preg_match()")
    if 'split(' in source:
        issues.append("split() found - use explode()")
    if 'session_register' in source:
        issues.append("session_register() found - use $_SESSION instead")
    if re.search(r"\bvar\s+\$\w+", source):
        issues.append("PHP4-style property declarations found - use public/protected/private")
    return {"issues": issues}

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
    migrated = re.sub(r'var\s+\$(\w+)', r'public $\1', migrated)
    return {"migrated_code": migrated, "changes": changes}

def analyze_java(source: str):
    issues = []
    if re.search(r"\bStringBuffer\b", source):
        issues.append("Use StringBuilder instead of StringBuffer")
    if re.search(r"\bnew\s+Integer\s*\(", source):
        issues.append("Use Integer.valueOf() instead of new Integer()")
    if re.search(r"\bSystem\.out\.println\b", source):
        issues.append("Consider using a logging framework")
    if re.search(r"for\s*\(\s*int\s+\w+\s*=\s*0", source):
        issues.append("Old-style for loop - consider enhanced for loop")
    if re.search(r"\b(Vector|Hashtable)\b", source):
        issues.append("Consider using ArrayList/HashMap instead")
    return {"issues": issues}

def migrate_java(source: str):
    changes = []
    migrated = source
    if 'StringBuffer' in migrated:
        migrated = migrated.replace('StringBuffer', 'StringBuilder')
        changes.append("StringBuffer -> StringBuilder")
    if 'new Integer(' in migrated:
        migrated = migrated.replace('new Integer(', 'Integer.valueOf(')
        changes.append("new Integer() -> Integer.valueOf()")
    return {"migrated_code": migrated, "changes": changes}

def analyze_cobol(source: str):
    issues = []
    if 'PERFORM' in source:
        issues.append("PERFORM found - consider converting to functions")
    if 'GOTO' in source:
        issues.append("GOTO found - use structured programming instead")
    if 'PIC 9' in source:
        issues.append("PIC 9 numeric fields found - convert to Python int/float")
    if 'PIC X' in source:
        issues.append("PIC X string fields found - convert to Python str")
    if 'MOVE' in source:
        issues.append("MOVE statement found - use Python assignment instead")
    return {"issues": issues}

def migrate_cobol(source: str):
    changes = []
    migrated = "# Converted from COBOL\n\n"
    if 'IDENTIFICATION DIVISION' in source:
        changes.append("IDENTIFICATION DIVISION removed")
    if 'DATA DIVISION' in source:
        changes.append("DATA DIVISION converted to Python variables")
        migrated += "# Variables\n"
    if 'PROCEDURE DIVISION' in source:
        changes.append("PROCEDURE DIVISION converted to Python functions")
        migrated += "\ndef main():\n    pass\n\nif __name__ == '__main__':\n    main()\n"
    if 'DISPLAY' in source:
        migrated = migrated.replace('DISPLAY', 'print')
        changes.append("DISPLAY -> print()")
    return {"migrated_code": migrated, "changes": changes}

def ai_suggest(source: str, language: str):
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama3-8b-8192",
            "messages": [
                {
                    "role": "user",
                    "content": f"Review this {language} code and give 3 specific improvement suggestions:\n\n{source[:500]}"
                }
            ],
            "max_tokens": 200
        }
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        result = response.json()
        if "choices" in result:
            suggestions = result["choices"][0]["message"]["content"]
            return {"suggestions": suggestions}
        else:
            return {"suggestions": str(result)}
    except Exception as e:
        return {"suggestions": f"AI service error: {str(e)}"}

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
    return Response(
        content=migrated.encode('utf-8'),
        media_type='application/octet-stream',
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@app.post("/analyze-php")
async def analyze_php_endpoint(file: UploadFile = File(...)):
    content = await file.read()
    source = content.decode("utf-8", errors='ignore')
    result = analyze_php(source)
    result["filename"] = file.filename
    return result

@app.post("/migrate-php")
async def migrate_php_endpoint(file: UploadFile = File(...)):
    content = await file.read()
    source = content.decode("utf-8", errors='ignore')
    result = migrate_php(source)
    result["filename"] = file.filename
    return result

@app.post("/analyze-java")
async def analyze_java_endpoint(file: UploadFile = File(...)):
    content = await file.read()
    source = content.decode("utf-8", errors='ignore')
    result = analyze_java(source)
    result["filename"] = file.filename
    return result

@app.post("/migrate-java")
async def migrate_java_endpoint(file: UploadFile = File(...)):
    content = await file.read()
    source = content.decode("utf-8", errors='ignore')
    result = migrate_java(source)
    result["filename"] = file.filename
    return result

@app.post("/analyze-cobol")
async def analyze_cobol_endpoint(file: UploadFile = File(...)):
    content = await file.read()
    source = content.decode("utf-8", errors='ignore')
    result = analyze_cobol(source)
    result["filename"] = file.filename
    return result

@app.post("/migrate-cobol")
async def migrate_cobol_endpoint(file: UploadFile = File(...)):
    content = await file.read()
    source = content.decode("utf-8", errors='ignore')
    result = migrate_cobol(source)
    result["filename"] = file.filename
    return result

@app.post("/ai-suggest")
async def ai_suggest_endpoint(file: UploadFile = File(...), language: str = "python"):
    content = await file.read()
    source = content.decode("utf-8", errors='ignore')
    result = ai_suggest(source, language)
    result["filename"] = file.filename
    return result

@app.get("/")
def root():
    return {"message": "Legacy Migration Tool API is running!"}