# Changelog — Ancya Tech

## [v2.0.0-rc] — 2026-11-04

### Production readiness

- Replaced the client-only contact form simulation with a Cloudflare Worker + Resend route
- Added server-side validation, spam filtering and recoverable error UX
- Replaced placeholder social links with production profile URLs
- Corrected truth-in-copy for approved page metadata and high-risk marketing claims
- Marked unverified case-study case metrics as illustrative
- Integrated navigation and footer links with sibling site pages
- Added service links and deep-linked service selection
- Added `noindex` only to pages that still contain unresolved sample content

### Performance and assets

- Reduced Google Fonts request to the weights actually used
- Added explicit image dimensions to the journal article
- Added long-term caching for immutable public assets
- Added `public/_headers` and fixed Cloudflare header-rule syntax
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

- Added shared Workers security headers and strict CSP
- Derived CSP around the current inline-but-vetted frontend behavior
- Added Cloudflare-compatible asset loading and Worker bindings
- Documented contact-form operations and preview/rollback steps
- Added branch-assist automation for link checks and accessibility checks

### Infrastructure and standardization

- Worker entry point: `worker/index.js`
- Assets binding through Wrangler
- Cloudflare preview/reset documentation
- Release checklist added
- Architecture decision: retain zero-build until Phase 1, then plan Eleventy extraction after launch

### Documentation

- `docs/PRODUCTION_TODO.md`
- `docs/ARCHITECTURE.md`
- `docs/CONTACT_FORM.md`
- `docs/ROUTING.md`
- `docs/PREVIEW_DEPLOY.md`
- `docs/RELEASE_CHECKLIST.md`

### Known open items

- Optional Lighthouse baseline was not executed in the agent sandbox
- axe-core results require `chromedriver` to be installed locally
- Work and case-study metrics still use illustrative data unless verified before launch