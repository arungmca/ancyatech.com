# ancyatech.com

The Ancya Tech website: a zero-build static site deployed to Cloudflare Workers.
Only the `public/` directory is published.

## Structure

```
public/                  deployed assets (Wrangler assets.directory)
├─ *.html                site pages and templates
├─ assets/               css, js, images, logos, favicons
├─ robots.txt · sitemap.xml · site.webmanifest
├─ .assetsignore
└─ 404.html
docs/
├─ DESIGN_SPEC.md        rules for contributors (source of truth)
├─ ARCHITECTURE.md       current structure + scaling plan
├─ PRODUCTION_TODO.md    production-readiness plan (start 4 Nov)
└─ styleguide.html       live component reference (not deployed)
brand/                   source logo exports (not deployed)
scripts/check_links.py   internal link validation used by CI
wrangler.jsonc · package.json · .github/workflows/ci.yml
```

## Commands

```bash
npm run preview   # serve public/ at http://localhost:8080
npm run check     # validate every local link in public/ and docs/
npm run dev       # Wrangler local runtime with the real asset config
npm run deploy    # deploy to Cloudflare Workers
```

## Pages

- Live: `public/index.html` + legal pages.
- Templates (noindex until approved): `work.html`, `work-foxtail-cafe.html`, `journal.html`, `journal-website-cost.html`, `services-web-design.html`, `about.html`.
- Not found: `public/404.html`, wired via `not_found_handling: "404-page"`.

See [`docs/DESIGN_SPEC.md`](docs/DESIGN_SPEC.md) before changing anything, and [`docs/styleguide.html`](docs/styleguide.html) for component examples. The scaling plan lives in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), and the production-readiness plan in [`docs/PRODUCTION_TODO.md`](docs/PRODUCTION_TODO.md).

## Deployment

`wrangler.jsonc` deploys `./public` with extension-less URLs (`/work` serves `work.html`)
and a 404 page. `docs/`, `brand/` and tooling never reach the CDN.
