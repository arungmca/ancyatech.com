# Release checklist — Ancya Technologies v2.0.0

Run this on the release commit. Every box must be ticked before tagging.

## Build and validation

- [ ] Working tree is clean on the release branch; `npm ci` completed.
- [ ] `npm run build` succeeds and regenerates `public/` from `src/`.
- [ ] `git diff --exit-code -- public/` is clean (generated output matches the commit).
- [ ] `npm run check` passes (all local links resolve).
- [ ] `npm run check:a11y` passes (structure, H1, `#main`, skip link, alt text, names).
- [ ] `npm run lint:html`, `npm run lint:css` and `npm run lint:js` pass.
- [ ] `npm test` passes (Worker endpoint tests).
- [ ] `npm run test:a11y` passes in a browser; no serious/critical axe findings.
- [ ] Keyboard, 200% zoom, reduced-motion and no-JS passes completed.

## Content and indexing

- [ ] Approved pages are indexable; only `work.html`, `work-foxtail-cafe.html` and
      `404.html` carry `noindex`.
- [ ] `sitemap.xml` contains every indexable page and no draft page.
- [ ] `robots.txt` still points to `https://ancyatech.com/sitemap.xml`.
- [ ] No placeholder links remain; nav and footer resolve on every page.
- [ ] Unverified case metrics and quotes exist only on `noindex` work pages.
- [ ] No banned claims on indexed pages (`hand-crafted`, `award-winning`, invented
      guarantees).
- [ ] Metadata, canonicals, Open Graph, Twitter Cards and JSON-LD validate.
- [ ] Privacy and cookie copy matches the Resend form processor and analytics.

## Security and performance

- [ ] `src/_headers` and the Worker response headers agree (CSP, HSTS,
      `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
      `Permissions-Policy`, cache policy).
- [ ] CSP works in a real browser with Google Tag Manager, GSAP and the form.
- [ ] No secrets are committed; `.dev.vars` is untracked.
- [ ] `RESEND_API_KEY` is set as a Cloudflare secret; `RESEND_TO` and `RESEND_FROM` are
      correct for the verified Resend domain.
- [ ] Cloudflare WAF rate limiting is configured for `POST /api/contact`.
- [ ] Lighthouse mobile baseline captured: LCP < 2.5 s, CLS < 0.1, INP < 200 ms.
- [ ] Preview URL verified end to end (pages, 404, form success and failure paths).

## Deploy and rollback

- [ ] Previous Worker version is identified as the rollback target.
- [ ] Rollback steps below have been read and are executable by the person deploying.
- [ ] `npm run deploy` completed against the release commit.
- [ ] Smoke tests pass in production.
- [ ] Tag `v2.0.0` created and pushed.

## Smoke tests

Run in production, desktop and mobile:

1. `/` loads; hero, services, pricing, FAQ and contact render.
2. `/about`, `/services-web-design`, `/journal`, `/journal-website-cost` load.
3. `/work` and `/work-foxtail-cafe` load but return `noindex` metadata.
4. `/does-not-exist` renders the 404 page with a working "back" link.
5. Contact form: valid submission shows success; an induced failure shows the
   recoverable error and `mailto:` fallback.
6. Consent banner appears; analytics is not sent before acceptance.

## Rollback

1. Confirm the failed production change (Worker version or static asset deploy).
2. In the Cloudflare dashboard, roll back to the last known-good Worker version, or
   redeploy the previous release commit with `npm run deploy`.
3. Purge the Cloudflare cache if stale HTML or assets are being served.
4. Re-run the smoke tests above, including one form submission.
5. Record the cause, the rollback time and the follow-up fix.

## Release gate

Do not tag or deploy until every box above is ticked. If a gate cannot be met, stop and
record it in `PRODUCTION_TODO.md` rather than tagging a partial release.
