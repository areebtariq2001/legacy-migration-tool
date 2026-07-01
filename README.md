StarBuild — Legacy Code Migration & Audit Platform

Modernize legacy code, predictably.

StarBuild is an AI-assisted platform that doesn't just translate legacy code — it helps teams audit, plan, secure, and de-risk migrations. Every automated change comes with transparent confidence scoring and AST-based verification, so you always know what's safe to ship and what needs a human review.

Supports Python, Java, PHP, and COBOL.

🔗 Live demo: https://areebtariq2001.github.io/legacy-tool/
📚 API docs (Swagger): https://legacy-migration-tool-1.onrender.com/docs


Why StarBuild?

Most "migration tools" are blind converters — they change your code and leave you guessing whether it still works. Generic AI tools hallucinate and offer no verification. StarBuild is built around one idea: migration should be predictable, secure, and auditable.

ApproachReliabilityVerificationAudit-readyManual migrationHigh risk of human errorSlow & expensiveNoGeneric AI toolsHigh hallucination riskNo verificationNoStarBuildPredictable & AST-verifiedConfidence scoredYes

Stress-tested on 50+ real-world legacy scripts — 97% high-confidence migrations.


Features

StarBuild has moved beyond translation into audit, security, and planning. It offers multiple analysis modes:

Migration


Analyze — Detects legacy patterns, functions, classes, and imports.
Migrate — Deterministic, rule-based conversion that produces the exact same output every run.
AI Migrate — Full-file AI modernization with guardrails: syntax validation, variable-integrity checks, a confidence score (0–100%) with a detailed check breakdown, compile-level verification, and a smart fallback to rule-based migration when the AI is unreliable.
Rollback / View Original — Compare or restore the pre-migration code with one click.


Audit & Planning


Call Graph — Maps which functions call which, and which external library each function depends on.
Risk Check — A dependency "Risk Assessment" that flags databases, APIs, and network libraries likely to break during migration, each with a High / Medium / Low level and a recommendation.
Tech Debt — A code-based Technical Debt Score (0–100) with an estimated remediation effort in developer-hours.
Gen Docs — A Knowledge Transfer (KT) documentation generator: purpose, business logic, key functions, and migration notes — downloadable as PDF.


Security & Compliance


Data Scan — Scans code for sensitive data patterns (card numbers, hardcoded passwords, API keys, private keys) before migration, rated High / Medium / Low.
Banking Scan — Detects common banking business logic (interest calculation, balance validation, transaction handling, loan processing) and flags where extra care is needed.
Compliance Checklist — A migration compliance summary (data scan, audit log, risk check, human review) shown with each scan.


Developer Assist


AI Suggest / Explain / Gen Tests — Improvement suggestions, plain-language explanations, and unit-test generation.
CLI Tool — Batch-process a whole folder from the command line: python starbuild_cli.py <folder> --mode risk.


Reliability & Trust


Confidence scoring with an itemized reason and a detailed check breakdown (AST valid, compiles, variables preserved).
AST + compile verification — output is checked to be valid and runnable.
Smart fallback — switches to deterministic rule-based migration when AI output is unreliable.
Audit logging — every action is timestamped and recorded (text + JSON), with a live usage dashboard.
Batch processing with an adjustable confidence threshold (accept vs. manual review).
Security by design — code is processed in-memory and never stored on the server.
Audit-ready PDF reports — migration summaries, KT documentation, and risk reports.



Tech Stack


Backend: Python, FastAPI, AST parsing, javalang (Java AST), Groq (Llama 3.1) for AI features
Frontend: React, deployed on GitHub Pages
Backend hosting: Render
Reports: jsPDF (client-side PDF generation)
CLI: Standalone Python script using the live API



How It Works


Upload one or more legacy files (.py, .java, .php, .cbl) — or point the CLI at a folder.
Choose a mode — migrate, or run an audit (call graph, risk, tech debt, docs, data scan, banking scan).
Review the results — confidence scores, diffs, risk levels, security findings, and explanations.
Export — download migrated files, a summary PDF, KT documentation, or a risk report.



Project Status

StarBuild is an actively developed, working tool with an honest roadmap. See ROADMAP.md for the full plan.


Stage 1–2 (Reliable migration + guardrails): ✅ Complete
Stage 3 (Production polish — testing, audit, security, error handling): 🔨 ~85%
Stage 4–5 (Enterprise & banking-grade — scale, SOC 2, team workflows): 📋 Planned (requires company infrastructure)


Honest by design: StarBuild is not yet banking-ready, and we say so. Enterprise scale needs dedicated infrastructure and a review team. StarBuild is the verified foundation to get there.


Author

Built by Areeb Tariq with AI assistance.
