# System Memory & Context 🧠
<!--
AGENTS: Update this file after every major milestone, structural change, or resolved bug.
DO NOT delete historical context if it is still relevant. Compress older completed items.
-->

## 🏗️ Active Phase & Goal
**Current Task:** MVP Polish and Final Walkthroughs (Phases 1-8 Completed, See [CHANGELOG.md](./CHANGELOG.md)).
**Next Steps:**
1. Address any lingering UI/UX snags or animations.
2. Polish global UI states (empty states, errors).
3. Implement fuzzy onboarding matching in `PodHub.tsx`.
4. Hydrate Hub using the new `get_hydrated_hub()` RPC.
5. Standardise `difficulty` column and automate schema reloading.

## 📂 Architectural Decisions
*(Log specific choices made during the build here so future agents respect them)*
- [2026-03-08] - Hub Data is 100% dynamic, driven by `categories`, `lessons`, and `lesson_prerequisites` tables with strict RLS (Row Level Security) applied.
- [2026-03-12] - Established secure GitHub backup workflow; hardened `.gitignore` for zero-leak public exposure.
- [2026-03-12] - Implemented "Auth Bridge" logic (RPC `migrate_guest_data`) for atomic guest-to-permanent data transfer.
- [2026-03-20] - Centralized schema reloading via `pgrst_watch` event trigger.

## 🐛 Known Issues & Quirks
*(Log current bugs or weird workarounds here)*
- Ensure column types in DB exactly match seed script requirements (standardized to `text`).
- PostgREST reload trigger `ddl_command_end` might be restricted in some Supabase tiers.

## 📜 Completed Phases
- [x] Phases 1-8: Core Foundation, Hub, Admin, and Auth Bridge (Archived to [CHANGELOG.md](./CHANGELOG.md))
- [x] Task 1.1-2.2: Phase 1 & 2 Polish - Persistence, Security Hardening, and Intellectual Loop.
