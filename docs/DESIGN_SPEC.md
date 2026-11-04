# ANCYA — Design & Build Specification

**Version:** 1.1 (source-path update)
**Updated:** 4 November 2026
**Audience:** design agents, front-end agents, and any human or AI contributor shipping pages for ancyatech.com.

> This document is the contract. If a request conflicts with it, stop and ask. The visual language is **frozen**: changes ship as a deliberate version bump, never as a side effect of adding a page.

---

## 1. Source of truth

| Asset | Role |
|---|---|
| `src/assets/css/base.css` | Design tokens (custom properties), reset, typography and layout primitives. |
| `src/assets/css/main.css` | Component styles and page compositions. Content pages load `base.css` then `main.css`. |
| `src/assets/css/legal.css` | Legal-page styles. Legal pages load `base.css` then `legal.css`. |
| `docs/styleguide.html` | Live component reference with rendered examples and code. |
| `docs/DESIGN_SPEC.md` (this file) | Rules, page templates, motion, accessibility, workflow. |
| `src/assets/js/` | Shared behaviour modules (nav, reveals, back-to-top, shape ribbons, consent). |

Never introduce a second component stylesheet, a CSS framework, or a component library.
Never override a token with a raw hex value in a page. If a value is missing, add a token
to `base.css` and document it in the style guide. `public/assets/` is generated; edit
`src/assets/` only.

---

## 2. Brand truths

- **Studio:** Ancya Tech, a solo studio run by Antony S., Kortenberg, Belgium.
- **Buyer:** ambitious small and medium businesses that have outgrown templates but do not want agency overhead.
- **Offer:** fast marketing websites, AI SEO/GEO, and custom AI automation; fixed starting prices; 100% code and account ownership.
- **Method:** built with modern AI tooling, reviewed and owned by a human. Say this plainly. Never imply a large team, a traditional hand-coding studio, or work that is not done.
- **Honesty rule:** no fabricated claims, clients, metrics or credentials. Case-study numbers and quotes are sample content in the review templates and must be verified or replaced before launch.
- **Domain & hosting:** excluded from project prices, billed separately and paid directly by the client. Ancya can register the domain in the client's name and manage domain + hosting. Starter Launchpad includes a free basic hosting server.

**Banned phrases:** “hand-crafted code”, “hand-written code”, “our team of designers”, “award-winning”, invented awards, “guaranteed #1 ranking”, “100% secure”. “AI-built, reviewed by hand” is the approved framing.

---

## 3. Voice & copy rules

- British/EU English, second person (“you”), first person singular for the founder (“I”).
- Sentence case for headings; uppercase only for eyebrows, tags and micro-labels.
- Currency: `€790`, `€1,490`, `€59 / month`. Ranges use an en dash: `5–14 days`, `€790–€1,500`.
- Numbers: numerals for prices, durations and metrics; tabular numerals in data.
- CTAs are verbs: “Start a project”, “Read the case study”, “Discuss this service”, “See pricing”.
- No exclamation marks. No emoji. No filler (“in today's fast-paced digital world”).
- Prose max ~65–70 characters per line. Paragraphs 2–4 sentences.
- One H1 per page. H2 for sections. Never skip levels.
- Alt text describes the information, not the file. Decorative SVG gets `aria-hidden="true"`.

---

## 4. Colour

Tokens live in `:root` in `src/assets/css/base.css` and are copied into the generated
`public/assets/css/base.css`.

### Brand

| Token | Hex | Use |
|---|---|---|
| `--sapphire` | `#0B519C` | Links, focus, active states, brand structure |
| `--sapphire-deep` | `#082A61` | Hover on links, dark brand surfaces |
| `--sapphire-500` | `#3B82F6` | Focus ring |
| `--sapphire-300` | `#93C5FD` | Accent text on dark |
| `--sapphire-100` | `#DBEAFE` | Tinted surfaces |
| `--sapphire-50` | `#EFF6FF` | Icon tiles, washes |
| `--swoop-coral` | `#FC5332` | Signal colour: primary CTA gradient, start of a journey, accent marks |
| `--swoop-amber` | `#FFA537` | Gradient end, secondary accent |

Coral never carries body text and never fills a destructive control. On dark, use `--sapphire-300` for links.

### Neutrals

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0B132B` | Headings, nav links, primary text |
| `--body` | `#475569` | Body copy |
| `--muted` | `#94A3B8` | Metadata, captions, placeholders |
| `--canvas` | `#F8FAFC` | `band` sections and page background |
| `--surface` | `#FFFFFF` | `band-white`, cards |
| `--surface-elev` | `#F1F5F9` | Illustration panels, raised fills |
| `--border-subtle` | `#E2E8F0` | Card hairlines |
| `--border-strong` | `#CBD5E1` | Inputs, interactive outlines |

### Dark surfaces

`--dark-root #070A12`, `--dark-surface #0B0F1C`, `--dark-surface-2 #11182A`, `--dark-border #1E2B4A`, `--dark-text #F8FAFC`, `--dark-text-2 #94A3B8`.

### Gradients

- `--gradient-swoop` (90°) and `--gradient-cta` (135°) — coral → amber. Primary buttons and the wordmark underline only.
- `--gradient-hero` — sapphire radial. Home hero only; inner pages use flat bands.
- No other gradients except the approved decorative rules in §6.

---

## 5. Typography

**Family:** Plus Jakarta Sans (variable 300–800) for everything. No serif, no mono except code samples.

| Role | Rule |
|---|---|
| H1 | `clamp(2.4rem, 4.6–5.5vw, 3.5–4rem)`, 800, letter-spacing −.035em, `text-wrap: balance` |
| H2 | `clamp(1.75rem, 3.5vw, 2.6rem)`, 700, −.03em |
| H3 | `clamp(1.15rem, 1.6vw, 1.4rem)`, 600 |
| H4 | 1.05rem, 600 |
| Lead | `clamp(1.05rem, 1.4vw, 1.2rem)`, line-height 1.6, colour `--body` |
| Body | 1rem / 1.65, `--body` |
| Eyebrow | .75rem, 700, letter-spacing .12em, uppercase, `--sapphire`, coral gradient dot before |
| Tag / micro label | .68–.72rem, 600–700, uppercase, letter-spacing .04–.12em |
| Nav | .9rem, 700, `--ink`; active 800, `--sapphire` |

Type scale ratio is editorial (≈1.25). Do not introduce sizes outside these roles. Line length caps are part of the design.

---

## 6. Layout, surfaces & decoration

### Page rhythm

- Container: `--maxw` 1200px, gutters `clamp(20px, 5vw, 40px)`.
- Section padding: `--section-y` `clamp(72px, 9vw, 128px)`.
- Fixed header height: `--header-h` 72px desktop, 64px ≤860px. Anchors use `scroll-padding-top: calc(var(--header-h) + 12px)`.
- Breakpoints: 1024, 860, 640, 440. Mobile-first is not required, but every rule must degrade.
- Cards: 16px radius (`--r-card`); small surfaces 12px; pills 9999px.
- Shadows: only `--shadow-sm/md/lg/swoop`; tinted ink, never pure black.

### Section surfaces

Alternate `band` (`--canvas`) and `band-white` (`--surface`). Dark surfaces are reserved for: the home hero, the client story section, the CTA band, and the footer. Never place a dark band between two light bands without a CTA purpose.

### Decorative background system

Every light section has a **blueprint grid**: 56px lines at 4.5% sapphire, radial mask, 45s diagonal drift. Generated by `.band::before` / `.band-white::before`. Do not add another grid.

Six-plus light sections also carry a **ribbon**, selected with `.has-ribbon` + a shape modifier:

| Modifier | Behaviour | Used in |
|---|---|---|
| `ribbon--wave` | Four-line wave, horizontal drift 180s | Services, Journal |
| `ribbon--mixed` | Random triangles, hexagons and circles generated by JS; random size/position | Problem, FAQ, Contact |
| `ribbon--triangle` | Rotating triangles | (available, currently unused) |
| `ribbon--circle` | Circles scaling 0.5 → 1.18 | Work, About |
| `ribbon--hex` | Rotating hexagons | Process, Pricing |

Rules:
- Shapes are DOM nodes appended by `site.js` into `.ribbon-field`; never hand-write `.ribbon-shape` markup.
- They sit at `z-index: -1` inside an isolated section; they must never overlay content or capture pointer events.
- Masks are edge-bold and centre-soft. Do not strengthen the centre.
- Off-screen fields pause via IntersectionObserver.
- Reduced motion freezes all decoration; the static composition must still look intentional.

---

## 7. Page shell

Every page uses this anatomy:

```html
<header class="site-header" id="site-header"> … capsule brand + capsule nav + #nav-toggle … </header>
<main id="main" tabindex="-1">
  <section class="page-hero band"> breadcrumbs, eyebrow, h1, lead, actions/meta </section>
  … content bands …
  <section class="cta-band"> … </section>
</main>
<footer class="site-footer"> … </footer>
<button class="to-top" id="to-top" aria-label="Back to top"> … </button>
<script src="assets/js/site.js" defer></script>
```

- Header is transparent and fixed; do not add a background or border.
- The brand and nav are separate frosted capsules; keep them in the same position.
- The shell above lives in `src/_includes/base.njk` and its partials. Page templates
  supply content; they never repeat the header, footer, sprite or script tags.
- On inner pages, mark the current nav item with `aria-current="page"` — `site.js` does not run scroll-spy on templates.
- Every page is rendered with the inline SVG sprite from `src/_includes/sprite.njk`, the font links, and the generated `assets/css/base.css` plus `assets/css/main.css` (or `legal.css` for legal pages).
- Work templates are `noindex` until approved. Remove the noindex flag and add the page to the sitemap only after content sign-off.
- Include the back-to-top button and `site.js` on every page. Do not duplicate behaviours inline.

### Page hero

`.page-hero` + `.band` (or `.band-white`): breadcrumbs (`Journal / Web design`), eyebrow, H1, lead, optional `.page-actions` and `.page-hero-meta` (price, timeline, ownership). Keep the H1 to one clear sentence or two short clauses.

---

## 8. Component contract

Full examples: `docs/styleguide.html`. Class names and restrictions:

| Component | Classes | Rules |
|---|---|---|
| Buttons | `.btn .btn-primary/-secondary/-outline/-ghost`, `.btn-sm/-lg/-block` | Primary = one per surface; ghost only on dark. 48px min height. |
| Text link | `.btn-link` | Arrow shifts 3px on hover. |
| Section head | `.section-head`, `.is-centered` | Eyebrow + H2 + lead; max-width 720px. |
| Eyebrow | `.eyebrow`, `.eyebrow--light` | Always precedes a heading. |
| Tag / badge | `.tag`, `.tag--swoop`, `.price-badge`, `.price-badge--offer` | Pills hug content. Offer badge straddles the card top edge (`z-index: 2`, absolute). |
| Card | `.card`, `.card--lift`, `.icon-tile`, `.icon-tile--swoop` | 1px hairline + sm shadow; calm hover only. |
| Service selector | `.services` > `.service[data-service]` > `.service-head` + `.service-lede` + `.service-tag`; `.service-stage` > `.stage-slide[data-panel]` | One persistent panel, never collapses, fixed height from stacked slides. Click selects; update `.is-active` and `aria-pressed`. No hover-open. |
| Roadmap | `.roadmap`, `.roadmap-step`, `.roadmap-marker`, `.roadmap-node`, `.roadmap-connector`, `.roadmap-card`, `.roadmap-art` | Four steps on desktop, 2×2 at 1024, stacked at 860. First node coral. |
| Stats | `.stats-bar`, `.stat`, `.stat-num`, `.stat-label` | Gradient numerals; four across, two on tablet, two on phone. |
| Price card | `.price-card`, `.is-popular`, `.price-name`, `.price-amount`, `.price-figure`, `.price-desc`, `.price-perk` (not used), `.price-features`, `.is-free` | CTA bottom-aligned. Popular keeps sapphire border on hover. |
| Pricing note | `.pricing-info` | Coral left rule, tinted wash, icon; used for domain/hosting. |
| FAQ | `.faq-item`, `<details>`, `.faq-answer` | Native details; chevron rotates; no JS. |
| Quote | `.founder-quote` (light), `.quote-card` (dark) | Coral rule; quote text near-white on dark. |
| Page hero | `.page-hero`, `.breadcrumbs`, `.page-actions`, `.page-hero-meta` | Inner pages only. |
| Featured case | `.featured-case`, reuse `.case-visual`, `.case-result` | Two columns, collapses at 1024. |
| Case meta | `.case-meta` (`<dl>`) | Four facts: client, industry, services, timeline. |
| Result grid | `.result-grid`, `.result-stat` | Three verified metrics. |
| Article | `.article-layout`, `.article-aside`, `.prose`, `.author-card` | TOC sticky on desktop, above prose on mobile. |
| Back to top | `.to-top`, `.is-visible` | Icon only, 46px, appears after 480px; focus moves to `#main`. |
| Footer | `.site-footer`, `.footer-top`, `.footer-col`, `.social-btn`, `.footer-legal` | Dark; links white/muted. |

### Hover policy

Hover is **feedback, not spectacle**. Cards and buttons may change border, background, colour or shadow. They must not translate, scale, rotate or add gradient washes. The only deliberate exceptions are the primary CTA’s 1px lift, the brand logo’s spring, and the back-to-top control’s shadow.

---

## 9. Page templates

All templates share the shell above and use real site content. Current review set:

| Page | Source | Purpose / anatomy |
|---|---|---|
| Home | `src/index.njk` | Hero, stats, problem, services selector, roadmap, work, testimonial, pricing + hosting note, FAQ, journal, CTA, contact, founder, footer. Frozen. |
| Portfolio index | `src/work.njk` | Page hero → featured case → three case cards (third = open slot CTA) → CTA. Draft (`noindex`). |
| Case study | `src/work-foxtail-cafe.njk` | Breadcrumb/hero → large visual → challenge/approach + result grid → what we built → quote → CTA. Draft (`noindex`). |
| Journal index | `src/journal.njk` | Page hero → featured article → two-column card grid → CTA. |
| Article | `src/journal-website-cost.njk`, `src/journal-design-decisions.njk` | Breadcrumb/hero + meta → article layout with sticky TOC → prose with `h2`/`h3`, list, blockquote, figure → author card → related posts → CTA. |
| Services | `src/services-*.njk` (six pages) | Breadcrumb/hero with actions + meta → approach with diagram → deliverable cards → price card + domain/hosting note → FAQ → CTA. |
| Profile | `src/about.njk` | Page hero → large portrait + studio story + quote → four principles → ways to work together → CTA. |
| Legal | `src/privacy-policy.njk`, `src/terms-of-service.njk`, `src/cookie-policy.njk` | Legal prose with the shared header/footer and `legal.css`. |
| Not found | `src/404.njk` | 404 message with a link back to the site; `noindex`. |

Work pages contain illustrative metrics. Keep them `noindex` and out of
`src/sitemap.xml` until the client approves the case data. Approved pages are already
linked from the shared navigation.

---

## 10. Motion

| Element | Motion | Timing |
|---|---|---|
| Scroll reveal | opacity + 20px rise, staggered via `--d` | .65s `--ease` |
| Hover | border/shadow/colour only | .18–.25s |
| Hero hook | zoom + blur crossfade | .38s out / .6s in, every 4.6s |
| Hero glows | slow drift | 10–15s yoyo |
| Hero galaxy | canvas dots, twinkling sparkles, occasional shooting star | rAF, paused off-screen |
| Client story | sparkle field + shooting star inside the card | rAF, paused off-screen |
| Wave ribbon | horizontal drift | 180s linear |
| Shape ribbons | rotate 50–120s; circles scale 6–15s alternate | random direction/delay |
| Logo hover | spring tilt/scale + capsule sheen | .5s `back.out` |
| Brand reveal | none beyond page entrance | — |

Rules:
- Every animation must stop under `prefers-reduced-motion`. Content must remain complete and static.
- Canvas effects pause when off-screen. Shape fields pause off-screen.
- No parallax, no scroll hijacking, no section snapping, no cursor followers.
- Do not add a library for an effect that CSS can do. GSAP is already loaded only on the home page for the hero and services; templates use CSS + `site.js`.

---

## 11. Accessibility

- WCAG 2.1 AA minimum.
- Focus: never remove `:focus-visible`. Global ring is 3px `--sapphire-500`, 3px offset.
- Contrast: body on `--surface` ≥ 7:1; muted metadata only for secondary information; coral text only at large sizes or on the offer badge.
- Buttons for actions, links for navigation. One H1. Sections use `aria-labelledby`.
- Service selector uses `aria-pressed` and matching `data-service` / `data-panel`; the panel is `aria-live="polite"`.
- Back to top: `aria-label`, hidden via `visibility` so it is not focusable, focus moves to `#main`.
- Forms: visible labels, no placeholder-only labels, errors described in text, honeypot hidden from users.
- Touch targets ≥ 44px. Mobile nav items are 48px.
- Decorative canvases and shape fields are `aria-hidden="true"` and `pointer-events: none`.
- Test: keyboard-only pass, 200% zoom, reduced motion, VoiceOver/NVDA spot check, axe.

---

## 12. Performance budget

- LCP < 2.5s, CLS < 0.1, INP < 200ms on a mid-range phone.
- CSS is one shared file; no frameworks. JS is small and deferred except the home hero (GSAP).
- Images: explicit dimensions, lazy below the fold, WebP/AVIF where possible. Portrait currently `src/assets/img/founder.jpg` (648×1152).
- Fonts: Plus Jakarta Sans via Google Fonts with `display=swap`; self-hosting/subsetting is a pending optimisation.
- Canvases: cap DPR at 2, pause off-screen, cap particle counts (hero ≤170, quote card ≤60).
- Do not add an animation loop without an IntersectionObserver pause.

---

## 13. SEO / GEO

- Unique `<title>` (≤60 chars) and meta description (≤155) per page; canonical URL.
- `noindex` on review templates until launch.
- Structured data: Organization + WebSite on home; Article on posts; Service/LocalBusiness where relevant. Update to match the AI-built positioning.
- Internal links: every page links back to Work, Journal, Pricing, Contact. Case studies link to the service used; articles link to relevant services.
- Headings must describe content, not styling.
- Sitemap and robots updated when pages go live.
- Open Graph image: 1500×500 (`src/assets/social/twitter-header-1500x500.png`), replace when the brand imagery changes.
- AI search (GEO): concise answer paragraphs, lists, schema, and verifiable facts. No keyword stuffing.

---

## 14. Files, naming & versioning

```
src/                           source — edit here
├─ _includes/
│  ├─ base.njk                 document shell (head, sprite, header, footer, scripts)
│  ├─ header.njk · footer.njk
│  ├─ sprite.njk               single source for the SVG symbol sheet
│  └─ cookie.njk
├─ _data/                      site metadata (URL, contact details, analytics)
├─ assets/
│  ├─ css/base.css             design tokens, reset, type, layout primitives
│  ├─ css/main.css             components + page compositions
│  ├─ css/legal.css            legal-page styles
│  ├─ js/                      site.js, consent.js and shared modules
│  └─ img/ · svg/ · social/ · favicons/
├─ *.njk                       page templates (index, about, work, journal, services, legal, 404)
├─ _headers                    CSP, HSTS, frame, referrer, permissions, cache
├─ robots.txt · sitemap.xml · site.webmanifest
└─ .assetsignore               exclusions for the Cloudflare upload

public/                        generated output (Wrangler assets.directory)
├─ index.html                  home (frozen)
├─ work.html · work-foxtail-cafe.html
├─ journal.html · journal-website-cost.html · journal-design-decisions.html
├─ services-web-design.html and the five sibling service pages
├─ about.html
├─ privacy-policy.html · terms-of-service.html · cookie-policy.html
├─ 404.html                    not-found page
├─ robots.txt · sitemap.xml · site.webmanifest
├─ _headers                    copied from src/
└─ assets/                     generated css/js and copied images

docs/                          not deployed
├─ styleguide.html             component reference
├─ DESIGN_SPEC.md              this document (source of truth for rules)
└─ ARCHITECTURE.md             current structure and hosting

brand/                         source logo exports (not deployed)
scripts/check_links.py         local link checker used by CI
README.md · wrangler.jsonc · package.json · .github/workflows/ci.yml
```

`wrangler.jsonc` deploys only `./public`. `docs/`, `brand/`, tooling and `src/` never
reach the CDN, and `public/` is never edited by hand.

Deployment rules:
- `html_handling: "auto-trailing-slash"` — extension-less URLs such as `/work` serve `work.html`.
- `not_found_handling: "404-page"` — misses render `public/404.html`.
- `npm run build` renders `src/` into `public/`; `npm run check` and `npm run check:a11y` run against the built output.
- Source and output must stay in sync: change `src/`, run the build, commit both only after the build is deterministic.

Rules:
- New component: add CSS to `src/assets/css/main.css` under a comment banner; add new tokens to `base.css`; add a live example + code to `docs/styleguide.html`, then reference it here if it is system-level.
- Do not add inline `<style>` blocks. Page-specific one-off styles are a smell; extend the system instead.
- Keep the inline SVG sprite generated from `src/_includes/sprite.njk` (external `<use>` fails on `file://` and adds a request).
- Cache-bust CSS with the version query sourced from `assetVersion` in `src/_data/site.json`; do not hard-code versions in templates.
- Version this spec and the style guide together; record the change and date at the bottom.

---

## 15. Agent workflow

1. Read this spec, `docs/styleguide.html`, and the relevant section of `src/assets/css/main.css` (tokens in `base.css`).
2. Pick the closest page template; reuse `src/_includes/base.njk` and its partials rather than copying the shell.
3. Use existing tokens and classes. No new colours, fonts, radii, shadows or motion without an approved system change.
4. Write honest copy. Check the banned-phrase list. Mark sample data with an HTML comment.
5. Run `npm run build`, the review checklist below, and the link/a11y checks. Verify at 1440, 1024, 861, 390 and with reduced motion.
6. Keep the work templates `noindex` and out of the sitemap until the design owner approves them.
7. When approved: remove `noindex`, add the page to `src/sitemap.xml`, update internal links, then lock.

### Review checklist

- [ ] One H1; logical heading order.
- [ ] No horizontal scroll at 390px; no clipped focus rings.
- [ ] Focus states visible on every interactive element.
- [ ] All hover states are border/shadow/colour only.
- [ ] Reduced motion: no drift, rotation, pulse or shooting star; content visible.
- [ ] Canvas and shape fields paused off-screen.
- [ ] Copy contains no banned claims; prices/currency formatted correctly.
- [ ] Domain/hosting wording matches §2 if mentioned.
- [ ] Meta title, description, canonical and robots correct.
- [ ] Images have dimensions, alt text and sensible loading.
- [ ] Page passes axe with no serious issues; Lighthouse mobile ≥ 90 performance/accessibility where feasible.

---

## 16. Known gaps (do not assume these are done)

- **Work pages are drafts.** `src/work.njk` and `src/work-foxtail-cafe.njk` contain
  illustrative metrics and quotes, render `noindex`, and are excluded from the sitemap
  until the client approves the case data.
- **CSP is not strict yet.** `src/_headers` allows `'unsafe-inline'`, Google Tag Manager
  and cdnjs for GSAP. Tightening it requires removing inline scripts and self-hosting
  the library.
- **The in-isolate rate limit is best-effort.** Configure Cloudflare WAF rate limiting
  for `POST /api/contact`.
- **Lighthouse baseline is not captured.** Run it before release and record the numbers
  in `RELEASE_CHECKLIST.md`.

---

## 17. Change log

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-11-03 | Design language frozen. Added sibling-page templates and this specification. |
| 1.1 | 2026-11-04 | Moved source-of-truth paths to `src/`; documented generated `public/`; refreshed page inventory and known gaps. |
