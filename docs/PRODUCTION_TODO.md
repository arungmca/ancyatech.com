# Production Readiness — v2

**Status:** implementation in progress on `v2`. The content, form endpoint, headers,
metadata and documentation are in place; the Eleventy build/CI migration and the live
deployment checks are the remaining work.

**Legend:** `[x]` done and verified in the repository · `[~]` implemented, needs a live
check · `[ ]` pending

---

## 1. Launch gates

The release is not ready to tag until every gate below passes.

| Gate | Status | Evidence / next action |
|---|---|---|
| Contact form delivers to the inbox and failure is recoverable | `[~]` | `worker/index.js` + `tests/worker/contact.test.mjs` exist. Run `npm run test:worker`, then send a real submission with `RESEND_API_KEY` set. |
| No placeholder links; nav and footer resolve | `[x]` | Social links point to real LinkedIn/Instagram profiles; nav and footer use sibling pages. `npm run check` must stay green. |
| Truth-in-copy | `[x]` | Approved pages use the AI-built/reviewed-by-hand framing; unverified case metrics live only on the `noindex` work pages. |
| Indexing is intentional | `[x]` | `work.html`, `work-foxtail-cafe.html` and `404.html` carry `noindex`; `sitemap.xml` lists only indexable pages. The automated guard is still pending. |
| Metadata, canonicals, Open Graph and structured data | `[x]` | Present in every content template; validate JSON-LD and canonicals after the final build. |
| Accessibility | `[~]` | `npm run check:a11y` covers structural rules. Run `npm run test:a11y` for axe and complete a keyboard/reduced-motion pass. |
| Performance budget | `[ ]` | Capture a Lighthouse mobile baseline; target LCP < 2.5 s, CLS < 0.1, INP < 200 ms. |
| Security headers and CSP | `[~]` | Defined in `src/_headers` and mirrored by the Worker. Fonts are self-hosted; the CSP still allows `'unsafe-inline'` for two small bootstraps. |
| Secrets are not committed | `[x]` | `.dev.vars` is ignored; only `.dev.vars.example` is tracked. Configure `RESEND_API_KEY` with `wrangler secret put`. |
| Build and CI are repeatable | `[ ]` | `npm run build` exists. Add the lint scripts and `npm test` alias, then replace the pre-migration CI page-inventory step with a build-based pipeline. |
| Preview deploy verified | `[ ]` | Deploy a preview through Wrangler and exercise pages, 404 and the form. |
| Rollback rehearsed | `[ ]` | Follow the rollback section in `RELEASE_CHECKLIST.md`. |
| Release tagged | `[ ]` | Tag `v2.0.0` only after the checklist is complete. |

---

## 2. Resolved decisions

| # | Decision | Outcome |
|---|---|---|
| D1 | Contact form delivery | Cloudflare Worker + Resend at `POST /api/contact`; server-side validation, honeypot, body cap and best-effort rate limit. |
| D2 | Case metrics and quotes | Unverified case content stays on `noindex` work pages and out of the sitemap until approved. |
| D3 | Social links | Real LinkedIn and Instagram profile URLs. |
| D4 | Todo approval | Superseded: implementation started. This document now tracks remaining work. |

---

## 3. Completed in the v2 pre-release

- [x] Eleventy source tree: page templates in `src/*.njk`, shared shell in
      `src/_includes`, static files and assets under `src/`.
- [x] Contact endpoint with origin check, content-type check, 32 KB body cap, field
      validation, honeypot, rate limiting and Resend delivery.
- [x] Worker tests under `tests/worker/`.
- [x] Navigation and footer integrated with About, Journal, Work and the six service pages.
- [x] Real social profile links.
- [x] Per-page title, description, canonical, Open Graph, Twitter Card and JSON-LD.
- [x] Analytics and consent on content pages; consent gates Google Tag Manager.
- [x] Draft indexing: `noindex` on Work and the Foxtail case study; drafts excluded from
      the sitemap.
- [x] Security headers moved to `src/_headers` (CSP, HSTS, frame, referrer, permissions,
      cache) and mirrored in the Worker.
- [x] Long-lived caching for hashed/static assets; revalidation for HTML.
- [x] Link checker and browserless structural accessibility checker.
- [x] Documentation set updated to the `src/` to `public/` architecture.

---

## 4. Remaining work

### Build and tooling

- [x] Add the Eleventy configuration (`.eleventy.js`) and `npm run build`.
- [x] Add `npm run dev` (build once, then Wrangler) and `npm run build:watch`.
- [x] Worker tests are runnable with `npm run test:worker`.
- [ ] Add `npm run lint:html`, `npm run lint:css`, `npm run lint:js`.
- [ ] Add `npm test` as the alias for the existing `npm run test:worker`.
- [ ] Remove the pre-migration `npm run preview` path or document it as build-output-only.

### CI

- [ ] Build before checking; remove the hard-coded page inventory that assumes
      `public/*.html` already exists.
- [ ] Run link, structural a11y, HTML/CSS/JS lint and Worker tests.
- [ ] Add the indexing guard: drafts must retain `noindex` and stay out of `sitemap.xml`.
- [ ] Deploy on `main` only after the gates pass.

### Verification

- [ ] `npm run test:worker` passes.
- [ ] Real Resend submission reaches `RESEND_TO`; missing key returns a recoverable error.
- [ ] `npm run test:a11y` passes with no serious/critical axe findings.
- [ ] Lighthouse mobile baseline captured and within budget.
- [ ] Keyboard, 200% zoom, reduced-motion and no-JS passes.
- [ ] Headers and CSP verified in a browser on the preview URL.
- [ ] Preview URL reviewed; production deploy and rollback rehearsed.

### Content and operations

- [ ] Approve or keep draft the Work pages; if approved, remove `noindex`, add them to
      the sitemap and navigation, and verify the case data.
- [ ] Configure Cloudflare WAF rate limiting for `POST /api/contact`; the in-isolate
      limiter is best-effort only.
- [ ] Optional: add Turnstile verification once the frontend can send a token.
- [ ] Tighten the CSP by removing `'unsafe-inline'` and self-hosting GSAP.
- [ ] Final design/content sign-off; confirm `DESIGN_SPEC.md` and `styleguide.html`
      match the shipped build.
- [ ] Tag and push `v2.0.0`.

---

## 5. Known risks and notes

- **In-isolate rate limiting is not a security boundary.** Cloudflare may run many
  isolates; configure edge rate limiting for the contact endpoint.
- **CSP is not strict yet.** `script-src` allows `'unsafe-inline'` and Google Tag Manager.
  Tightening requires hashing or externalising the inline consent bootstrap.
- **`public/` is generated.** Editing it directly will be overwritten by the next build
  and will fail a source/output comparison.
- **Draft Work pages contain illustrative metrics.** Keep them `noindex` until the
  client-approved data exists.
- **Cloudflare routing** depends on `html_handling: "auto-trailing-slash"` and
  `not_found_handling: "404-page"`; changing either changes every public URL.
- **Local port binding and `git push`** may need to run outside an agent sandbox; use
  the normal terminal or VS Code tasks.

---

## 6. Change log

| Date | Change |
|---|---|
| 2026-11-03 | Plan drafted. |
| 2026-11-04 | Rewritten as a current status checklist for the `src/` to `public/` Eleventy architecture; resolved D1–D3; added build/CI, indexing-guard, WAF and CSP items. |
