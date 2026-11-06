# Changelog — Ancya Technologies

## [Unreleased] — 2026-11-04

### Build migration (in progress)

- Moved page sources to `src/*.njk` with shared layouts and partials in `src/_includes/`.
- Moved CSS, JavaScript, images and static files under `src/assets/` and `src/`.
- `public/` is now generated output from `npm run build`; it is no longer edited by hand.
- Added the Eleventy configuration, `build`, `build:watch` and `dev` scripts, and the
  Worker test script.
- Pending: lint scripts, the `npm test` alias, build-based CI, and preview verification.

### Documentation

- Rewrote `README.md` for the `src/` to `public/` workflow.
- Rewrote `ARCHITECTURE.md` around the implemented structure and kept the migration
  rationale short.
- Rewrote `PRODUCTION_TODO.md` and `RELEASE_CHECKLIST.md` as current checklists.
- Updated `DESIGN_SPEC.md`, `ROUTING.md`, `CONTACT_FORM.md` and `styleguide.html` to
  reference source paths and note generated output.

## [v2.0.0-rc] — 2026-11-04

### Production readiness

- Replaced the client-only contact form simulation with a Cloudflare Worker + Resend route
- Added server-side validation, spam filtering and recoverable error UX
- Replaced placeholder social links with production profile URLs
- Corrected truth-in-copy for approved page metadata and high-risk marketing claims
- Marked unverified case-study metrics as illustrative
- Integrated navigation and footer links with sibling site pages
- Added service links and deep-linked service selection
- Added `noindex` only to pages that still contain unresolved sample content

### Performance and assets

- Reduced Google Fonts request to the weights actually used
- Added explicit image dimensions to the journal article
- Added long-term caching for immutable public assets
- Added security headers and fixed Cloudflare header-rule syntax
- Added a browserless structural accessibility gate

### SEO and GEO

- Added canonicals, Open Graph and Twitter Card tags to all content pages
- Added JSON-LD structured data:
  - Organization
  - Person/ProfilePage
  - Service
  - Article
  - WebPage / Blog
- Updated the sitemap to include newly indexed pages
- Updated `robots.txt` supporting metadata templates

### Security and operations

- Added shared Workers security headers and CSP
- Derived CSP around the current inline-but-vetted frontend behaviour
- Added Cloudflare-compatible asset loading and Worker bindings
- Documented contact-form operations and preview/rollback steps
- Added branch-assist automation for link checks and accessibility checks

### Infrastructure and standardization

- Worker entry point: `worker/index.js`
- Assets binding through Wrangler
- Cloudflare preview/reset documentation
- Release checklist added
- Architecture decision: retain the zero-build site until the launch pass, then move to
  Eleventy (completed in the Unreleased change set)

### Documentation

- `docs/PRODUCTION_TODO.md`
- `docs/ARCHITECTURE.md`
- `docs/CONTACT_FORM.md`
- `docs/ROUTING.md`
- `docs/PREVIEW_DEPLOY.md`
- `docs/RELEASE_CHECKLIST.md`

### Known open items (carried forward)

- Lighthouse baseline not executed
- axe-core results require Chrome/chromedriver locally
- Work and case-study metrics still use illustrative data and remain `noindex`
