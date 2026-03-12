# Polished MVP - Security Hardening Report

This report documents the security hardening measures implemented during Phase 4, following OWASP best practices to ensure the application remains robust against common attack vectors.

## Improvements Made

### 1. Global Rate Limiting
- **Implementation:** Added a custom Next.js Edge Middleware (`src/middleware.ts`).
- **Policy:** 50 requests per minute per IP address.
- **Handling:** Violations cleanly return an HTTP `429 Too Many Requests` status with a descriptive JSON message, preventing server crashes while keeping the UI stable. This protects API routes and the application core from DDoS and basic brute-force scraping, adhering to strict zero-budget constraints by utilizing an intelligent Edge memory isolate Map instead of a paid Redis cluster.

### 2. Input Validation and Sanitization
- **Implementation:** Hardened `src/components/ReflectionBox.tsx`.
- **Validation:** Added strict Zod schema constraints (`.trim()`, `.min(1)`, `.max(300)`) preventing database bloating and excessive payload processing.
- **XSS Prevention:** Integrated `isomorphic-dompurify` directly against the validated form payload. The sanitizer explicitly strips *all* HTML tags (`ALLOWED_TAGS: []`), ensuring only raw, harmless text is ever processed, mitigating Stored XSS attacks via peer comments in the `DiscussionFeed`.

### 3. Secure API Key Handling
- **Audit Findings:** No hard-coded keys exist in the codebase.
- **Server Separation:** The sensitive `GEMINI_API_KEY` is purposefully loaded in `src/services/ai/gemini.ts` without the `NEXT_PUBLIC_` prefix, guaranteeing it is strictly stripped from the Vercel client-side JS bundle.
- **Client Safety:** Supabase keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) correctly use the prefix to enable necessary browser-side Guest logic, relying on Supabase RLS policies for database protection.
- **Rotation:** Secrets are managed safely via Vercel Environment Variables. If compromised, rotate keys in Vercel settings and trigger a fresh deployment.

### 4. OWASP Best Practices & Security Headers
- **Implementation:** Updated Next.js `next.config.ts` to attach global security headers to every response:
  - `X-Frame-Options: DENY` (Mitigates Clickjacking)
  - `X-Content-Type-Options: nosniff` (Mitigates MIME-type sniffing)
  - `Strict-Transport-Security` (Enforces HTTPS to prevent man-in-the-middle)
  - `Referrer-Policy: strict-origin-when-cross-origin` (Prevents leaking strict URLs)
  - `Permissions-Policy` (Disables unused browser features like microphone/geolocation)

## Potential Risks to Monitor in Production
1. **Edge Middleware Memory Leaks:** The in-memory rate limiter randomly prunes stale IP hits. While safe for an MVP, high-traffic scaling might require a dedicated Redis cluster (e.g., Upstash) to synchronize rate limits globally instead of per-Vercel-regional-isolate.
2. **Supabase RLS Definitions:** While the Next.js middle-tier is secure, production database tables must have robust Row-Level Security (RLS) defined in the Supabase dashboard to prevent an attacker from bypassing the UI and injecting records using the `ANON_KEY`.
