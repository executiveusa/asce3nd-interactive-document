# RSVP Hardening Verification Checklist

- [x] No hard-coded Supabase RPC URL remains in the changed RSVP runtime files.
- [x] No hard-coded anon token remains in the changed RSVP runtime files.
- [x] CORS configuration is required and default-deny.
- [x] Canonical public origins are documented explicitly.
- [x] Rate limiting uses a shared database RPC rather than process memory.
- [x] Raw client IP addresses are HMAC-hashed before database storage.
- [x] Rate-limit table has RLS enabled and no direct anon/authenticated table grants.
- [x] New read RPC returns `source` and `updated_at`.
- [x] Adapter continues to omit email, phone, surname, confirmation code, and cancellation token.
- [ ] Production database migration applied to actual RSVP database.
- [ ] Required Vercel Preview environment variables configured.
- [ ] Required Vercel Production environment variables configured.
- [ ] Preview deployment smoke-tested.
- [ ] Exact reviewed SHA approved for merge.
- [ ] Production deployed and verified.
