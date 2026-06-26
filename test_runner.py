import os
import requests
import csv
import time

API = "https://legacy-migration-tool-1.onrender.com"
TEST_FOLDER = "test_files"
OUTPUT_CSV = "test_results.csv"
OUTPUT_HTML = "test_report.html"

def get_endpoint(filename):
    ext = filename.split(".")[-1].lower()
    if ext == "py":
        return "/ai-migrate"
    elif ext == "java":
        return "/migrate-java"
    elif ext == "php":
        return "/migrate-php"
    elif ext == "cbl":
        return "/migrate-cobol"
    return None

def test_all_files():
    results = []
    all_files = os.listdir(TEST_FOLDER)
    files = [f for f in all_files if f.split(".")[-1].lower() in ["py", "java", "php", "cbl"]]

    if not files:
        print("Koi supported file nahi mili!")
        return

    print(f"Total {len(files)} files. Testing shuru...\n")

    for i, filename in enumerate(files):
        endpoint = get_endpoint(filename)
        ext = filename.split(".")[-1].lower()
        lang = {"py": "Python", "java": "Java", "php": "PHP", "cbl": "COBOL"}.get(ext, "Unknown")
        filepath = os.path.join(TEST_FOLDER, filename)
        try:
            with open(filepath, "rb") as f:
                response = requests.post(API + endpoint, files={"file": (filename, f)}, timeout=120)
            data = response.json()
            if ext == "py":
                score = data.get("confidence_score", "N/A")
                level = data.get("confidence_level", "N/A")
                detail = data.get("confidence_reason", "")
            else:
                changes = data.get("changes", [])
                score = "rule-based"
                level = f"{len(changes)} changes" if changes else "no changes"
                detail = ", ".join(changes[:3]) if changes else "no patterns found"
            print(f"[{i+1}/{len(files)}] {filename} ({lang}) -> {score} / {level}")
            results.append({"filename": filename, "language": lang, "score": score, "level": level, "detail": detail})
        except Exception as e:
            print(f"[{i+1}/{len(files)}] {filename} -> ERROR: {e}")
            results.append({"filename": filename, "language": lang, "score": "ERROR", "level": "failed", "detail": str(e)})
        time.sleep(1)

    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["filename", "language", "score", "level", "detail"])
        writer.writeheader()
        writer.writerows(results)

    langs = {}
    for r in results:
        lang = r["language"]
        if lang not in langs:
            langs[lang] = {"total": 0, "files": []}
        langs[lang]["total"] += 1
        langs[lang]["files"].append(r)

    py_scores = [r["score"] for r in results if isinstance(r["score"], int)]
    py_high = len([s for s in py_scores if s >= 90])
    py_avg = round(sum(py_scores)/len(py_scores)) if py_scores else 0

    html = build_html(results, langs, py_high, py_avg, py_scores)
    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(html)

    print("\n===== SUMMARY =====")
    for lang, info in langs.items():
        print(f"{lang}: {info['total']} files")
    if py_scores:
        print(f"Python High confidence (90+): {py_high}/{len(py_scores)}")
        print(f"Python Average: {py_avg}%")
    print(f"\nCSV: {OUTPUT_CSV}")
    print(f"HTML report: {OUTPUT_HTML} (browser mein kholo)")

def build_html(results, langs, py_high, py_avg, py_scores):
    rows = ""
    for r in results:
        color = "#1e293b"
        if isinstance(r["score"], int):
            color = "#16a34a" if r["score"] >= 90 else ("#ea580c" if r["score"] >= 60 else "#dc2626")
        rows += f'<tr><td>{r["filename"]}</td><td>{r["language"]}</td><td style="color:{color};font-weight:bold">{r["score"]}</td><td>{r["level"]}</td><td style="font-size:12px;color:#64748b">{r["detail"]}</td></tr>'

    lang_cards = ""
    for lang, info in langs.items():
        lang_cards += f'<div style="background:#f1f5f9;border-radius:10px;padding:16px;text-align:center;min-width:120px"><div style="font-size:28px;font-weight:bold;color:#0ea5e9">{info["total"]}</div><div style="color:#475569;font-size:13px">{lang} files</div></div>'

    return f'''<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>StarBuild Test Report</title></head>
<body style="font-family:Arial;max-width:900px;margin:0 auto;padding:30px;background:#fff;color:#1e293b">
<h1 style="color:#0ea5e9">StarBuild — Automated Test Report</h1>
<p style="color:#475569">Total files tested: {len(results)}</p>
<div style="display:flex;gap:12px;flex-wrap:wrap;margin:20px 0">{lang_cards}</div>
<div style="background:#ecfdf5;border:1px solid #16a34a;border-radius:10px;padding:16px;margin:16px 0">
<b style="color:#16a34a">Python Results:</b> {py_high}/{len(py_scores)} files high confidence (90+). Average: {py_avg}%
</div>
<table style="width:100%;border-collapse:collapse;margin-top:20px" border="1" cellpadding="8">
<tr style="background:#0ea5e9;color:#fff"><th>File</th><th>Language</th><th>Score</th><th>Result</th><th>Detail</th></tr>
{rows}
</table>
<p style="color:#94a3b8;font-size:12px;margin-top:30px">Generated by StarBuild automated test runner</p>
</body></html>'''

if __name__ == "__main__":
    test_all_files()