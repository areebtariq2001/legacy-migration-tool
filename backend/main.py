from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import ast
import re
import os
import requests

app = FastAPI()

# 1. Sirf ek jagah CORS configuration rakhein (Middleware best hai)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... (Apne saare analyze_code, migrate_code, analyze_php, etc. functions yahan waise hi rehne dein jaise thay) ...

# 2. Fixed AI Suggest Endpoint
@app.post("/ai-suggest")
async def ai_suggest_endpoint(file: UploadFile = File(...), language: str = "python"):
    content = await file.read()
    source = content.decode("utf-8", errors='ignore')
    
    # Language detection logic
    ext = file.filename.split('.')[-1].lower()
    lang_map = {"py": "python", "java": "java", "php": "php", "cbl": "cobol", "cob": "cobol"}
    actual_lang = lang_map.get(ext, language)
        
    result = ai_suggest(source, actual_lang)
    result["filename"] = file.filename
    return result

# ... (Baaki saare endpoints waise hi rehne dein) ...

@app.get("/")
def root():
    return {"message": "Legacy Migration Tool API is running!"}
