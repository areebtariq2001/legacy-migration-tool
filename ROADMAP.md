# StarBuild Roadmap

**From "Code Translation" to "Migration Audit & Planning Platform"**

StarBuild started as a legacy code translator. It has since evolved into an audit and planning platform that helps enterprises understand, de-risk, and document migrations — not just convert code. This roadmap shows where we are and where we're going.

**Status legend:** Done | In Progress | Planned (needs infrastructure)

---

## 1. Legacy Intelligence & Business Logic Discovery

- Call Graph generation — DONE — Maps functions, calls, imports, and entry points for a file.
- Dependency mapping (per file) — DONE — Shows which functions use which external libraries.
- Risk & Vulnerability Assessment — DONE — Flags DB/API/network dependencies with High/Medium/Low risk + recommendations.
- "Safe vs High Risk" classification — DONE — Every dependency is rated so teams know what's safe to migrate.
- Cross-file, whole-project dependency graph — PLANNED — Needs a project-upload + server-side analysis engine.
- Interactive dependency-graph visualization — PLANNED — Needs a graph-rendering frontend + backend project state.

## 2. Enterprise Reliability & Trust

- Confidence Scoring (0-100) — DONE — Every AI migration is scored on syntax, compile, and variable-integrity checks.
- AST + compile-level verification — DONE — Output is parsed and compiled to confirm it is execution-ready.
- Smart fallback to rule-based migration — DONE — When AI output is unreliable, the tool switches to deterministic rules.
- Audit Logs & Compliance reporting — DONE — Every action is timestamped and recorded (text + JSON) with a usage dashboard.
- Rollback / view original — DONE — One click to compare or restore the pre-migration code.
- Dry-Run / control-flow analysis — IN PROGRESS — Call Graph provides structural analysis; deeper flow analysis planned.
- Human-in-the-loop approval (single user) — IN PROGRESS — Confidence threshold + accept/review badges exist; full workflow planned.
- Team collaboration & multi-user approval — PLANNED — Needs user accounts, a database, and role-based permissions.

## 3. Professional Documentation

- Knowledge Transfer (KT) doc generator — DONE — Reads a file and produces PURPOSE / business logic / functions / notes as PDF.
- Migration Readiness Report — DONE — Quantifies High/Medium/Low risk dependencies with downloadable summary PDF.
- Tech Debt scoring — DONE — Estimates remediation effort in developer-hours from legacy-pattern counts.
- Copy / export (docs, risk, summary) — DONE — One-click copy and PDF export across modes.

## 4. Technical Roadmap (Scale & Integration)

- Unit Test Generation — DONE — Generates unit tests for migrated code.
- Batch processing — DONE — Handles multiple files with an adjustable confidence threshold.
- Incremental migration (mixed Python 2/3 codebase) — PLANNED — Enterprise-grade; needs async processing, a state database, and a bridging runtime.
- Async processing & queues (1000+ files) — PLANNED — Needs a paid server and a job queue for large-scale migrations.
- Resumable migrations — PLANNED — Needs a database to persist progress across sessions.
- On-premise / CLI deployment — PLANNED — For banks that cannot upload code externally; runs fully locally.

---

## Why the "Planned" items need infrastructure

The remaining large features (incremental migration, whole-project graphs, team workflows, async scale) are not blocked by design — they require:

- A dedicated server (the current free host sleeps and cannot run large or long jobs)
- A database (to store project state, progress, users, and approvals)
- An async job system (to process large codebases without timing out)

These are Stage 4-5 (enterprise & banking-grade) capabilities. They are planned and scoped, and become buildable once dedicated infrastructure is available.

## Honest status

StarBuild is a working, tested tool — but it is not yet banking-ready, and we state that clearly. Enterprise scale and compliance (SOC 2, dedicated infrastructure, a review team) are the next milestones. What exists today is a verified, honest foundation to build on.

---

Maintained by Areeb Tariq.