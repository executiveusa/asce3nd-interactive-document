# RSVP Hardening — 2026-07-29

## Scope

This change set addresses four identified RSVP risks without changing the public form fields or exposing additional PII.

## Resolved in code

1. Removed committed fallback Supabase RPC URL and anon token from `api/rsvp.js` and `api/_lib/rsvp-summary-adapter.js`.
2. Made `SUPABASE_RPC`, `SUPABASE_ANON`, and `RSVP_PUBLIC_ORIGIN` required runtime configuration.
3. Replaced instance-memory rate limiting with a database-backed atomic RPC using an HMAC-SHA256 bucket. Raw IP addresses are not stored in the rate-limit table.
4. Added `source` and `updated_at` to a new redacted read RPC, `load_confirmed_rsvp_v2`, and updated the adapter to consume it.
5. Added a secret-free `.env.example` documenting the exact required origins and settings.

## Required deployment sequence

1. Apply `sql/rsvp-hardening-2026-07-29.sql` to the production database/schema that already contains `rsvp_registrations`.
2. Configure these Vercel environment variables for Preview and Production:
   - `SUPABASE_RPC`
   - `SUPABASE_ANON`
   - `RSVP_PUBLIC_ORIGIN=https://asc3nd-frontend.vercel.app,https://asc3nd-interactive-document.vercel.app`
   - `RSVP_PUBLIC_BASE_URL=https://asc3nd-interactive-document.vercel.app`
   - `RSVP_RATE_LIMIT_SECRET` with at least 32 random bytes
3. Deploy a preview from the hardening branch.
4. Verify allowed and denied CORS origins.
5. Verify request 6 from one rate bucket receives HTTP 429 during the ten-minute window.
6. Verify the redacted adapter returns `source` and `updated_at` and still omits email, phone, surname, and tokens.
7. Merge only the exact reviewed commit after explicit release approval.

## Important database finding

The connected Supabase project `cyxdevcjycmffhmwxojh` is named `botanic-creations` and currently contains none of the RSVP tables or RPCs. The deployed RSVP code points to a separate custom RPC host. Therefore this migration must not be applied to `botanic-creations`; it must be applied to the actual database behind the configured `SUPABASE_RPC` value.
