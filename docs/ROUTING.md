# Routing and 404 behaviour — Ancya Technologies

Static pages generated from `src/*.njk` into `public/`, served by Cloudflare Workers
Static Assets. `worker/index.js` only handles `/api/contact`; every other path goes to
the `ASSETS` binding.

## Configuration

- Wrangler static assets directory: `./public` (build output; never hand-edit)
- `html_handling`: `auto-trailing-slash`
- `not_found_handling`: `404-page`
- Worker entry: `worker/index.js`, with the `ASSETS` binding
- Preview URLs are enabled in `wrangler.jsonc`

## URLs

Internal links, canonicals, OG URLs and the sitemap use the extension-less form.
Cloudflare Workers Assets (`auto-trailing-slash`) serves `/page` from `page.html`
and 307-redirects the legacy `.html` spelling to `/page`. The source template and
generated file for each route:

| URL | Source | Generated |
|---|---|---|
| `/` | `src/index.njk` | `public/index.html` |
| `/about` · `/about.html` | `src/about.njk` | `public/about.html` |
| `/work` · `/work.html` | `src/work.njk` | `public/work.html` (draft) |
| `/work-foxtail-cafe` · `.html` | `src/work-foxtail-cafe.njk` | `public/work-foxtail-cafe.html` (draft) |
| `/journal` · `/journal.html` | `src/journal.njk` | `public/journal.html` |
| `/journal-website-cost` · `.html` | `src/journal-website-cost.njk` | `public/journal-website-cost.html` |
| `/journal-design-decisions` · `.html` | `src/journal-design-decisions.njk` | `public/journal-design-decisions.html` |
| `/services-web-design` · `.html` | `src/services-web-design.njk` | `public/services-web-design.html` |
| `/services-web-development` · `.html` | `src/services-web-development.njk` | `public/services-web-development.html` |
| `/services-ai-seo` · `.html` | `src/services-ai-seo.njk` | `public/services-ai-seo.html` |
| `/services-ai-automation` · `.html` | `src/services-ai-automation.njk` | `public/services-ai-automation.html` |
| `/services-branding` · `.html` | `src/services-branding.njk` | `public/services-branding.html` |
| `/services-ecommerce` · `.html` | `src/services-ecommerce.njk` | `public/services-ecommerce.html` |
| `/privacy-policy` · `.html` | `src/privacy-policy.njk` | `public/privacy-policy.html` |
| `/terms-of-service` · `.html` | `src/terms-of-service.njk` | `public/terms-of-service.html` |
| `/cookie-policy` · `.html` | `src/cookie-policy.njk` | `public/cookie-policy.html` |
| `/404.html` | `src/404.njk` | `public/404.html` |

`/page` returns 200; `/page.html` returns 307 to `/page`. `404.html` is the exception:
it is served only through `not_found_handling` (and directly for previews), and is
never linked or listed in the sitemap.

## Draft pages

`work.njk`, `work-foxtail-cafe.njk` and `404.njk` render `noindex`. The work pages are
excluded automatically from the generated `sitemap.xml` (`src/sitemap.njk`) until the
case-study content is approved. `scripts/check_indexing.py` fails CI if a noindex page
enters the sitemap or a normal page disappears from it.

## 404 behaviour

- Unknown paths render `public/404.html` through `not_found_handling: "404-page"`.
- The 404 page links back to the home page and primary sections.
- `robots.txt` remains available and points to the sitemap.

## Redirects

The canonical form is extension-less. Legacy `.html` URLs stay alive through
`html_handling: auto-trailing-slash`, so no redirect file is required. If URLs ever move
to directory indexes, add Cloudflare Redirect Rules and keep the old URLs alive for at
least one release.

## Verification

Run after changes:

```bash
npm run build
npm run check
npm run dev
```

Verify in the browser:

- `/`, `/work`, `/about`, `/journal`, `/services-web-design`
- the same paths with `.html` (expect a 307 to the extension-less URL)
- a missing route such as `/does-not-exist`
- `POST /api/contact` still returns JSON rather than falling through to the 404 page
