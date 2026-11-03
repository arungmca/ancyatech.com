# ANCYA — Architecture & Scaling Notes

**Status:** current production architecture + recommended evolution
**Companion to:** `DESIGN_SPEC.md` (rules) and `styleguide.html` (components)

---

## 1. Current architecture (shipped)

A **zero-build static site** deployed to Cloudflare Workers.

```
public/                        ← the only deployed directory
├─ *.html                      pages and page templates
├─ assets/
│  ├─ css/main.css             single shared stylesheet (tokens + components)
│  ├─ css/legal.css
│  ├─ js/site.js               shared behaviour for sibling pages
│  ├─ js/consent.js
│  └─ img/ svg/ png/ social/ favicons/
├─ robots.txt · sitemap.xml · site.webmanifest
├─ .assetsignore
└─ 404.html
docs/                          ← never deployed
├─ DESIGN_SPEC.md
└─ styleguide.html
brand/                         ← source logo exports, never deployed
scripts/check_links.py
wrangler.jsonc · package.json · .github/workflows/ci.yml
```

**Why this works**
- Clear deploy boundary: Wrangler points at `./public`; source, docs and brand files cannot leak to the CDN.
- One stylesheet and one shared behaviour file keep the design language consistent.
- `html_handling: "auto-trailing-slash"` lets `/work` serve `work.html`, and `not_found_handling: "404-page"` gives a real 404 without a server.
- CI checks the page inventory, internal links, core SEO tags and sitemap before a PR can merge.
- No framework, no runtime dependencies, no hydration — excellent Core Web Vitals and a tiny attack surface.

**Known limits at scale**
- The header, footer and inline SVG sprite are repeated in every page. A nav change means editing every file.
- Content lives inside HTML; publishing an article or case study means hand-editing markup.
- No image pipeline, no HTML validation, no accessibility regression test.
- Templates share CSS/JS but not layout, so drift is possible.

That is acceptable for ~10 pages and one editor. It stops being acceptable when content publishing becomes frequent or a second editor joins.

---

## 2. Recommended structure for scalable development

When the duplication starts to cost more than a build step, migrate to **Eleventy (11ty)**. It keeps the site static and framework-free in the browser, while giving layouts, partials, collections and a Markdown content model. Astro is the alternative if interactive islands are expected later.

### Target tree

```
src/
├─ _includes/
│  ├─ layouts/base.njk          <head>, sprite, header, footer, scripts
│  ├─ partials/header.njk
│  ├─ partials/footer.njk
│  ├─ partials/sprite.njk       single source for the SVG symbol sheet
│  └─ partials/cta.njk
├─ _data/
│  ├─ site.json                 name, email, address, social URLs
│  ├─ navigation.json           nav + footer link groups (single source)
│  └─ pricing.json              plans, features, hosting note
├─ content/
│  ├─ work/
│  │  ├─ foxtail-cafe.md        front matter + case-study body
│  │  └─ harbor-and-pine.md
│  ├─ journal/
│  │  └─ how-much-does-a-website-cost-in-2026.md
│  └─ services/
│     └─ web-design.md
├─ pages/
│  ├─ index.njk
│  ├─ work.njk                  collection index
│  ├─ work-detail.njk           pagination template
│  ├─ journal.njk
│  ├─ journal-detail.njk
│  ├─ services.njk
│  ├─ about.njk
│  └─ 404.njk
├─ assets/
│  ├─ css/                      tokens.css · base.css · components/*.css → one bundle
│  ├─ js/site.js · consent.js
│  └─ img/                      processed by eleventy-img
└─ docs/                        styleguide source
public/                          build output (wrangler assets.directory)
docs/                            contributor docs (not deployed)
scripts/                         link check, image audit, sitemap guard
tests/                           HTML validation, axe, screenshot baselines
```

### What each layer owns

| Layer | Owns | Rule |
|---|---|---|
| `_includes/layouts` | Shell, meta, header, footer, back-to-top, shape-field hooks | One header, one footer, one sprite. Never duplicate in pages. |
| `_data` | Navigation, contact details, pricing, social URLs | Change once, update everywhere. |
| `content` | Case studies, articles, services | Markdown + front matter. Metrics/quotes must be client-approved. |
| `assets/css` | Tokens + components | Tokens only; components documented in the style guide; one bundled output. |
| `assets/img` | Photography, illustrations | Hashed filenames, WebP/AVIF with fallbacks, explicit dimensions. |
| `public/` | Generated output only | Never hand-edit; deploy exactly this directory. |
| `docs/` | Design spec + style guide | Updated in the same PR as any system change. |

### URL strategy

- Keep current `.html` URLs during migration; add redirects only when moving to directory indexes.
- Clean-URL target:
  - `/` home
  - `/work/` portfolio
  - `/work/foxtail-cafe/` case study
  - `/journal/` index
  - `/journal/how-much-does-a-website-cost-in-2026/` article
  - `/services/web-design/` service
  - `/about/` profile
- Cloudflare Workers assets serves `public/work/index.html` at `/work/` once pages are migrated to directory indexes.
- Add `_redirects` for every old `.html` URL if the paths change.

### Build, test and deploy pipeline

1. `npm ci`
2. `npm run build` (Eleventy + CSS bundle + image pipeline)
3. `npm run check` — link checker, HTML validator, noindex guard on drafts
4. `npm run test:a11y` — axe on rendered pages
5. `npm run test:visual` — screenshot comparison at 1440 / 1024 / 390
6. `npm run deploy` — Wrangler uploads `./public`

Recommended caching:
- Hashed CSS/JS/images: `Cache-Control: public, max-age=31536000, immutable`.
- HTML: `public, max-age=0, must-revalidate`.
- Use Cloudflare preview URLs per PR; promote only after the visual/a11y checks pass.

### Content and conversion layer

When the site starts generating leads, add:
- **Forms:** a Cloudflare Worker endpoint (Resend/email or CRM webhook). Never ship the simulated success state.
- **Analytics:** GA4 behind consent, plus a lightweight privacy-first event layer for CTA clicks and form submits.
- **Case-study CMS:** if the founder publishes often, Decap CMS or Keystatic over the Markdown folder keeps the build static.
- **Search:** only when the journal exceeds ~30 posts.

---

## 3. Migration path (low risk)

1. **Freeze** the current templates as the visual baseline.
2. Add Eleventy, copy `public/*.html` into `src/pages` and extract header/footer/sprite into includes — no visual change.
3. Move case studies and articles into `src/content` and generate the existing pages from templates.
4. Move CSS into `src/assets/css` with the same tokens; bundle to one `main.css`.
5. Add image processing and hashed assets.
6. Point `wrangler.jsonc` at the build output, add redirects if URLs changed.
7. Add the link/a11y/visual checks to CI.
8. Only then allow content editors in.

Each step is independently deployable; the site can stay live on the zero-build output until step 6.

---

## 4. Decision guide

| Trigger | Action |
|---|---|
| < 10 pages, one editor | Stay zero-build; keep the current structure. |
| Repeated shell/sprite edits, second editor | Adopt Eleventy; extract layouts. |
| Frequent articles/case studies | Add the Markdown content model + CMS. |
| Interactive product or booking flows | Consider Astro islands or a small app, not a heavier page framework. |
| International expansion | Add locale-prefixed routes and translated content collections; do not fork the design system. |

The design system does not change in any of these steps. `DESIGN_SPEC.md` and the style guide remain the contract; the generator only removes duplication.
