# System Memory & Context 🧠
<!--
AGENTS: Update this file after every major milestone, structural change, or resolved bug.
DO NOT delete historical context if it is still relevant. Compress older completed items.
-->

## 🏗️ Active Phase & Goal
**Current Task:** MVP Polish and Final Walkthroughs (Phases 1-7 Completed).
**Next Steps:**
1. Address any lingering UI/UX snags or animations.
2. Polish global UI states (empty states, errors).

## 📂 Architectural Decisions
*(Log specific choices made during the build here so future agents respect them)*
- [2026-03-08] - Hub Data is 100% dynamic, driven by `categories`, `lessons`, and `lesson_prerequisites` tables with strict RLS (Row Level Security) applied.
- [2026-03-12] - Established secure GitHub backup workflow; hardened `.gitignore` for zero-leak public exposure.
- [2026-03-12] - Implemented "Auth Bridge" logic (RPC `migrate_guest_data`) for atomic guest-to-permanent data transfer.

## 🐛 Known Issues & Quirks
*(Log current bugs or weird workarounds here)*
- Supabase caching sometimes requires `NOTIFY pgrst, 'reload schema';` when modifying columns directly.
- Ensure column types in DB exactly match seed script requirements (e.g. `difficulty` must be `text`).

## 📜 Completed Phases
- [x] Phase 1 & 2: Project Scaffold & Core Lesson UI (Interactive Reader, Reflection)
- [x] Phase 3: Duolingo-style Pod Hub interface mapping
- [x] Phase 4: Skill Tree logic, Security Hardening, Rate Limiting
- [x] Phase 5: Auth Hooks (Guest/Permanent), Landing Page
- [x] Phase 6: Admin Dashboard (Categories, Lessons, Slides, Versioning, Skill Tree Editor)
- [x] Phase 7: Hub Integration (Dynamic categories, lessons, and prerequisite sync)
- [x] Phase 8: Auth Bridge & Persistent Backups (GitHub sync, guest migration RPC)
