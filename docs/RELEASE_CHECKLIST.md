# Release checklist — Ancya Tech v2.0.0

## Before release

- [ ] CP-0 baseline commit is clean on `release/v2-production`
- [ ] Visual baselines at 1440 / 1024 / 861 / 390 are captured and compared
- [ ] P1-2 contact form delivers in production and failure path is tested
- [ ] D1–D3 pending decisions are recorded with final outcomes
- [ ] No banned claims remain on indexed pages
- [ ] Social links resolve to real profiles
- [ ] Approved templates are indexed only after review
- [ ] Metadata, canonicals, Open Graph and structured data are valid
- [ ] Sitemap and robots are up to date
- [ ] `npm run check` passes
- [ ] `npm run check:a11y` passes
- [ ] Optional: `npm run test:a11y` (when chromedriver is stable)
- [ ] Lighthouse mobile baseline captured and LCP / CLS within targets
- [ ] Cloudflare preview URL is verified
- [ ] Security headers and CSP are verified in a real browser
- [ ] `RESEND_API_KEY` is configured as a secret and `RESEND_FROM` verified
- [ ] Privacy/cookie copy reflects the contact processor
- [ ] Docs updated (`DESIGN_SPEC.md`, `ARCHITECTURE.md`, `styleguide.html`, `PRODUCTION_TODO.md`)
- [ ] Rollback runbook reviewed
- [ ] Tag is created: `v2.0.0`
- [ ] Tag is pushed

## Rollback

1. Confirm the failed production change.
2. Roll back to the last known-good Worker version in Cloudflare or redeploy the prior commit.
3. Re-run smoke tests:
   - home page
   - service page
   - journal page
   - contact form submission
   - 404 behavior

## Release gate

Do not tag or deploy until this checklist is complete.