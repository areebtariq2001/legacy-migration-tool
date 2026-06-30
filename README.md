StarBuild — Legacy Code Migration & Audit Platform

Modernize legacy code, predictably.

StarBuild is an AI-assisted platform that doesn't just translate legacy code — it helps teams audit, plan, and de-risk migrations. Every automated change comes with transparent confidence scoring and AST-based verification, so you always know what's safe to ship and what needs a human review.

Supports Python, Java, PHP, and COBOL.

🔗 Live demo: https://areebtariq2001.github.io/legacy-tool/
📚 API docs (Swagger): https://legacy-migration-tool-1.onrender.com/docs


Why StarBuild?

Most "migration tools" are blind converters — they change your code and leave you guessing whether it still works. Generic AI tools hallucinate and offer no verification. StarBuild is built around one idea: migration should be predictable and auditable.

ApproachReliabilityVerificationAudit-readyManual migrationHigh risk of human errorSlow & expensiveNoGeneric AI toolsHigh hallucination riskNo verificationNoStarBuildPredictable & AST-verifiedConfidence scoredYes

Stress-tested on 50+ real-world legacy scripts — 97% high-confidence migrations.


Features

StarBuild has moved beyond translation into audit & planning. It offers nine analysis modes:

Migration


Analyze — Detects legacy patterns, functions, classes, and imports.
Migrate — Deterministic, rule-based conversion that produces the exact same output every run.
AI Migrate — Full-file AI modernization with guardrails. For Python and Java: syntax validation, variable-integrity checks, a confidence score (0–100%), compile-level verification, and a smart fallback to rule-based migration when the AI is unreliable.


Audit & Planning


Call Graph — Maps which functions call which, and which external library each function depends on. Understand impact before migrating.
Risk Check — A dependency "Risk Assessment" that flags databases, APIs, and network libraries likely to break during migration, each with a High / Medium / Low risk level and a recommendation.
Tech Debt — A code-based Technical Debt Score (0–100) with an estimated remediation effort in developer-hours. Turns code quality into a planning number.
Gen Docs — A Knowledge Transfer (KT) documentation generator. Reads a whole file and produces professional handover docs (purpose, business logic, key functions, migration notes) — downloadable as PDF. Perfect for legacy code with no documentation.


Developer Assist


AI Suggest — Three targeted code-improvement suggestions.
Explain — Plain-language, section-by-section explanation of what the code does.
Gen Tests — Generates unit tests for the migrated code.


Reliability & Trust


Confidence scoring — Every AI migration gets a 0–100% score with an itemized reason.
AST + compile verification — Output is checked to be valid and runnable.
Smart fallback — When AI output is unreliable, the tool switches to deterministic rule-based migration automatically.
Audit logging — Every action is timestamped and recorded (text + JSON), with a live usage dashboard.
Batch processing — Process many files at once with an adjustable confidence threshold (accept vs. manual review).
Security by design — Code is processed in-memory and never stored on the server.
Audit-ready PDF reports — Downloadable migration summaries and KT documentation.



Tech Stack


Backend: Python, FastAPI, AST parsing, javalang (Java AST), Groq (Llama 3.1) for AI features
Frontend: React, deployed on GitHub Pages
Backend hosting: Render
Reports: jsPDF (client-side PDF generation)



How It Works


Upload one or more legacy files (.py, .java, .php, .cbl).
Choose a mode — migrate, or run an audit (call graph, risk, tech debt, docs).
Review the results — confidence scores, diffs, risk levels, and explanations.
Export — download migrated files, a summary PDF, or KT documentation.



Project Status

StarBuild is an actively developed, working tool with an honest roadmap.


Stage 1–2 (Reliable migration + guardrails): ✅ Complete
Stage 3 (Production polish — testing, audit, error handling): 🔨 ~80%
Stage 4–5 (Enterprise & banking-grade — scale, SOC 2, team workflows): 📋 Planned (requires company infrastructure)


Honest by design: StarBuild is not yet banking-ready, and we say so. Enterprise scale needs dedicated infrastructure and a review team. StarBuild is the verified foundation to get there.


Roadmap

Planned features as StarBuild grows from a tool into an enterprise platform:


Interactive, cross-file dependency-graph visualization
Rollback / snapshot mechanism for safe migrations
Incremental migration support (mixed Python 2 / 3 codebases)
Team collaboration with an approval workflow (review / approve)
Cross-file, whole-project call-graph analysis
Async processing & queues for large-scale (1000+ file) migrations



Author

Built by Areeb Tariq with AI assistance.


GitHub: @areebtariq2001


