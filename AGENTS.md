# AGENTS.md — Master Plan for Polished

## Project Overview & Stack
**App:** Polished
**Overview:** A mobile-optimized web application designed to help ambitious young professionals gain conversational breadth through bite-sized cultural lessons and mandatory critical reflections. The "learning -> reflection -> conversation" loop.
**Stack:** Next.js (App Router), Supabase (Postgres + Auth), Vercel, Gemini 2.5 Flash
**Critical Constraints:** Mobile-first design required, dark mode by default, strictly $0 budget, fast page loads (< 2s).

## Setup & Commands
Execute these commands for standard development workflows. Do not invent new package manager commands.
- **Setup:** `npm install`
- **Development:** `npm run dev`
- **Testing:** `npm test`
- **Linting & Formatting:** `npm run lint`
- **Build:** `npm run build`

## Protected Areas
Do NOT modify these areas without explicit human approval:
- **Infrastructure:** `infrastructure/`, Dockerfiles, and deployment workflows (`.github/workflows/`).
- **Database Migrations:** Existing migration files.
- **Third-Party Integrations:** Payment gateway configurations and Auth setups.

## Coding Conventions
- **Formatting:** Enforce required ESLint/Prettier rules strictly. No warnings allowed in new code.
- **Architecture rules:** Routes/controllers handle request/response ONLY. All business logic goes in `services/` or `core/`. No database calls from route handlers.
- **Testing Expectations:** All new utilities must have unit tests. Core user flows require integration tests. Verification via browser required before marking tasks complete.
- **Type Safety:** The `any` type is FORBIDDEN—use `unknown` with type guards. All function parameters and returns must be typed. Use Zod or similar for runtime validation.

## Agent Behaviors
These rules apply across all AI coding assistants:
1. **Understand Intent First:** Before answering, identify what the user actually needs.
2. **Plan Before Execution:** ALWAYS propose a brief step-by-step plan before changing more than one file. Ask for approval, then implement.
3. **Refactor Over Rewrite:** Prefer refactoring existing functions incrementally rather than completely rewriting large blocks of code.
4. **Context Compaction:** Write states to `MEMORY.md` or a `spec.md` instead of filling context history during long sessions.
5. **Iterative Verification:** Run tests or linters after each logical change. Fix errors before proceeding (See `REVIEW-CHECKLIST.md`).
6. **Team Coordination:** If working in Agent Teams, require the Team Lead to approve teammate PRs or plans.
7. **No Apologies:** Do NOT apologize for errors—fix them immediately. Do NOT generate filler text before providing solutions. If context is missing, ask ONE specific clarifying question.
