# StarBuild — Legacy Code Migration Tool

StarBuild modernizes legacy code (Python 2 to 3, plus Java, PHP, and COBOL) predictably, through transparent confidence scoring and AST-based verification.

**Live demo:** https://areebtariq2001.github.io/legacy-tool/
**API:** https://legacy-migration-tool-1.onrender.com

---

## What it does

StarBuild offers two migration approaches:

- **Rule-based migration** — deterministic conversions that produce the exact same output every run.
- **AI-assisted migration** — for Python, AI migration runs behind a full set of guardrails (syntax validation, variable-integrity checks, compile-level verification, and a confidence score).

When AI migration is unreliable, StarBuild automatically falls back to deterministic rule-based migration, so the user always gets a usable result.

## Key features

- **6 modes:** Analyze, Migrate, AI Migrate, AI Suggest, Explain, Generate Tests
- **Confidence scoring** — every AI migration gets a 0–100% score with a clear reason
- **AST + compile verification** — output is checked to be valid, execution-ready Python
- **Variable-integrity check** — flags if AI renamed or dropped any names
- **Why explanations** — every change comes with a plain-language reason
- **Dependency check** — flags libraries that need updating
- **Smart fallback** — switches to rule-based migration when AI confidence is low
- **Batch processing** — migrate many files at once with a summary report
- **Audit logging** — every migration is recorded with a timestamp (text and JSON formats)
- **Error handling** — handles empty, oversized, and binary files safely without crashing

## Testing

StarBuild has been stress-tested on 50+ real-world legacy scripts from open-source repositories, achieving 97% high-confidence migrations. An automated test runner sends files to the backend and produces a colour-coded HTML validation report.

On large, complex files (such as numpy or pandas internals), StarBuild honestly returns a "review recommended" status rather than a false 100% — reflecting a human-in-the-loop design.

## Tech stack

- **Frontend:** React (hosted on GitHub Pages)
- **Backend:** FastAPI / Python (hosted on Render)
- **AI:** Groq API (Llama 3.1)

## Project status

- Stage 1 (Basic migration): complete
- Stage 2 (Reliable + guardrails): complete
- Stage 3 (Production-ready): ~80% — automated testing, real-world testing, error handling, and audit logging done; large-scale batch processing (async) is the remaining work

## Author

Built by Areeb Tariq.