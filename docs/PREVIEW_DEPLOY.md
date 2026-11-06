# Preview and production deploy — Ancya Technologies

This repository deploys a Cloudflare Worker with static assets generated from `src/`.

## Preview locally

```bash
npm ci
npm run build
npm run dev
```

Open the URL Wrangler prints (normally `http://localhost:8787/`) and exercise:

- extension-less pages such as `/work`, `/about`, `/journal`
- an intentional 404 such as `/does-not-exist`
- the contact form and `mailto:` fallback (a real send needs `RESEND_API_KEY` in
  `.dev.vars`; without it the endpoint returns 503, which is the expected failure path)

## CI checks

GitHub Actions runs:

- `npm run build`
- link and structural accessibility checks
- html-validate, stylelint and ESLint
- Worker tests (`npm run test:worker`; `npm test` is the target alias)
- indexing guard: draft pages keep `noindex` and stay out of the sitemap

Run the same locally:

```bash
npm run build
npm run check
npm run check:a11y
npm run lint:html
npm run lint:css
npm run lint:js
npm run test:worker    # target alias: npm test
npm run test:a11y      # requires Chrome/chromedriver
```

## Preview deployment

Cloudflare preview URLs are configured in `wrangler.jsonc`:

```json
"preview_urls": true
```

Use a preview environment for review of every branch before integration. Check the
returned preview URL before production deployment.

## Production deployment

```bash
npx wrangler secret put RESEND_API_KEY
npm run deploy
```

The deploy uploads `worker/index.js` and the generated `public/` directory through the
`ASSETS` binding. It binds `ancyatech.com` and `www.ancyatech.com` per `wrangler.jsonc`.

## Rollback

Keep the previous deployed version available through the Cloudflare dashboard. To roll
back a failed release, deploy the previously verified commit or use the Workers version
history before merging or tagging a new release. Purge the cache if stale HTML or assets
are being served, then re-run the smoke tests in `RELEASE_CHECKLIST.md`.

## Launch checklist

- [ ] CI green on the release branch
- [ ] preview deployment verified
- [ ] form submission reaches the inbox; failure path is recoverable
- [ ] all social links and footer navigation work
- [ ] metadata, canonicals and structured data are valid
- [ ] no unintended `noindex` remains on indexed pages
- [ ] Lighthouse and accessibility reports reviewed

The full release gate is in `RELEASE_CHECKLIST.md`.
