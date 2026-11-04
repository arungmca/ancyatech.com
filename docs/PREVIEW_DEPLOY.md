# Preview and production deploy — Ancya Tech

This repository deploys a Cloudflare Worker with static assets.

## Preview locally

```bash
npm ci
npm run dev
```

Open `http://localhost:8787/` and exercise:

- extensionless pages such as `/work`, `/about`, `/journal`
- an intentional 404 such as `/does-not-exist`
- the contact form and `mailto:` fallback

## CI checks

GitHub Actions runs:

- page inventory
- internal links
- core HTML/SEO assertions
- sitemap check
- browserless accessibility checks

Run the same locally:

```bash
npm run check
npm run check:a11y
npm run test:a11y
```

## Preview deployment

Cloudflare preview URLs are configured in `wrangler.jsonc`:

```json
"preview_urls": true
```

Use preview environments for review of every branch before integration. Check the returned preview URL before production deployment.

## Production deployment

```bash
npx wrangler secret put RESEND_API_KEY
npm run deploy
```

## Rollback

Keep the previous deployed version available through the Cloudflare dashboard. To roll back a failed release, deploy the previously verified commit or use the Workers version history before merging or tagging a new release.

## Launch checklist

- [ ] CI green on `release/v2-production`
- [ ] preview deployment verified
- [ ] form submission reaches the inbox
- [ ] all social links and footer navigation work
- [ ] metadata, canonicals and structured data are valid
- [ ] no unintended `noindex` remains on indexed pages
- [ ] Lighthouse and accessibility reports reviewed