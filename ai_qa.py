import os
import requests
import time

API = "https://legacy-migration-tool-1.onrender.com"
TEST_FOLDER = "test_files"

def run_qa():
    # Sirf kuch Python files lete hain (pehli 10, taake free server par load kam ho)
    files = [f for f in os.listdir(TEST_FOLDER) if f.endswith(".py")][:10]

    if not files:
        print("Koi Python file nahi mili!")
        return

    print(f"AI-as-QA: {len(files)} files check kar rahe hain...\n")

    same_count = 0
    diff_count = 0
    error_count = 0

    for i, filename in enumerate(files):
        filepath = os.path.join(TEST_FOLDER, filename)
        try:
            # Step 1: original code parho
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                original = f.read()

            # Step 2: migrate karo (AI Migrate se)
            with open(filepath, "rb") as f:
                mig_resp = requests.post(API + "/ai-migrate", files={"file": (filename, f)}, timeout=120)
            mig_data = mig_resp.json()
            migrated = mig_data.get("migrated_code", "")

            if not migrated:
                print(f"[{i+1}/{len(files)}] {filename} -> migration skip (no code)")
                continue

            time.sleep(1)

            # Step 3: AI se QA check karwao (original vs migrated)
            qa_resp = requests.post(API + "/qa-check",
                                    json={"original": original, "migrated": migrated},
                                    timeout=120)
            qa_data = qa_resp.json()
            verdict = qa_data.get("qa_verdict", "UNKNOWN")

            print(f"[{i+1}/{len(files)}] {filename} -> QA verdict: {verdict}")

            if verdict == "SAME":
                same_count += 1
            elif verdict == "DIFFERENT":
                diff_count += 1
                # Agar farak hai to detail dikhao
                print(f"      Detail: {qa_data.get('qa_full_response', '')[:150]}")
            else:
                error_count += 1

            time.sleep(1)

        except Exception as e:
            print(f"[{i+1}/{len(files)}] {filename} -> ERROR: {e}")
            error_count += 1

    print("\n===== AI-as-QA SUMMARY =====")
    print(f"Logically SAME (migration safe): {same_count}")
    print(f"Logically DIFFERENT (needs review): {diff_count}")
    print(f"Errors/Unknown: {error_count}")
    print(f"\nQA pass rate: {round(same_count/len(files)*100)}%")

if __name__ == "__main__":
    run_qa()