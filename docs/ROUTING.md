# Routing and 404 behaviour — Ancya Tech

Static site deployed with Cloudflare Workers Assets.

## Configuration

- Wrangler static assets directory: `./public`
- `html_handling`: `auto-trailing-slash`
- `not_found_handling`: `404-page`
- Preview URLs are enabled per branch/preview.

## URLs

URLs use the current `public/<page>.html` inventory. Cloudflare Workers Assets also serves extension-less URLs automatically:

- `/` → `index.html`
- `/work` → `work.html`
- `/about` → `about.html`
- `/journal` → `journal.html`
- `/journal-website-cost` → `journal-website-cost.html`
- `/services-web-design` → `services-web-design.html`

Both `/page` and `/page.html` resolve while `html_handling` remains `auto-trailing-slash`.

## 404 behaviour

- Unknown paths render `public/404.html`.
- `public/404.html` links to Home, Work, Journal and Contact.
- `robots.txt` remains available and points to the sitemap.

## Redirects

No public URL migration is in progress for this release. If URLs move from `.html` to directory indexes later, add a `public/_redirects` file for each old URL and update `sitemap.xml`.

## Verification

Run after changes:

```bash
npm run check
npm run dev
npm run deploy
```

Verify in the browser:

- `/work`, `/about`, `/journal`, and `/services-web-design`
- A missing route such as `/does-not-exist`
- Contact form redirect behaviour is unaffected
