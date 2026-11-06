# Contact form — Workers + Resend

`POST /api/contact` is handled by `worker/index.js`. Static pages and assets are served
by the `ASSETS` binding; the Worker owns this route only.

## Request contract

- Methods: `OPTIONS` (204 preflight), `POST`. Anything else returns 405.
- Body: JSON or form-encoded data, up to 32 KB.
- Fields: `name` (required, ≤120), `email` (required, valid, ≤254), `message`
  (required, ≤5000), `company` (optional, ≤160), `budget` (optional, ≤80), and the
  honeypot `website` (must stay empty).
- An `Origin` header, when present, must match the request origin.

Responses are JSON `{ "ok": true }` or `{ "ok": false, "error": "…" }`:

| Status | Meaning |
|---|---|
| 200 | Accepted, or honeypot triggered (no email sent). |
| 400 | Malformed body. |
| 403 | Cross-origin request. |
| 405 | Unsupported method. |
| 413 | Body over 32 KB. |
| 415 | Unsupported content type. |
| 422 | Field validation failure; the message is safe to show. |
| 429 | In-isolate rate limit exceeded (5 requests / 10 minutes per IP). |
| 502 | Resend rejected the message or the request failed. |
| 503 | `RESEND_API_KEY` is not configured. |

The browser must only show success after a `{ "ok": true }` response. On failure it
shows a recoverable error and the `mailto:antony@ancyatech.com` fallback.

## Local setup

1. Install dependencies:
   ```bash
   npm ci
   ```
2. Copy `.dev.vars.example` to `.dev.vars` (ignored by git) and add:
   ```
   RESEND_API_KEY=re_...
   ```
   `RESEND_TO` and `RESEND_FROM` are non-secret vars in `wrangler.jsonc`.
3. Build and run:
   ```bash
   npm run build
   npm run dev
   ```
4. Submit the form and confirm the JSON response. Without a key the endpoint returns
   503, which is the expected local failure path.

## Tests

```bash
npm run test:worker    # target alias: npm test
```

`tests/worker/contact.test.mjs` covers validation, origin checks, method and content
type handling, body limits, the honeypot, rate limiting and Resend failure responses.
The tests stub `fetch`; they do not send real email.

## Deployment

1. Set the secrets (first deploy or rotation):
   ```bash
   npx wrangler secret put RESEND_API_KEY
   npx wrangler secret put TURNSTILE_SECRET_KEY
   ```
   Then add the Turnstile widget's public site key to
   `src/_data/site.json` → `turnstileSiteKey` and rebuild. Create the widget with
   hostname `ancyatech.com` (and `www.ancyatech.com`) in the Cloudflare dashboard.
2. Confirm in `wrangler.jsonc`:
   - `RESEND_TO` — inbox that receives enquiries
   - `RESEND_FROM` — sender name and address; production default is
     `Ancya Enquiry <noreply@ancyatech.com>`
3. Deploy:
   ```bash
   npm run deploy
   ```

While the Resend account is in test mode, use `onboarding@resend.dev` as the sender and
send only to the account owner. Do not send to arbitrary recipients until the sending
domain is verified.

## Operational notes

- **Rate limiting is best-effort.** The limiter is an in-isolate `Map`; Cloudflare may
  create many isolates. Configure WAF rate limiting for `POST /api/contact` in production.
- **No secrets in the repo.** `.dev.vars` is ignored; only `.dev.vars.example` is tracked.
- **Spam.** The `website` honeypot returns a fake success to bots. Cloudflare Turnstile
  adds a second layer: the frontend widget sends a token as `cf-turnstile-response`,
  and the Worker verifies it before delivery. For the check to run, both keys must be
  set — the public `turnstileSiteKey` in `src/_data/site.json` and the
  `TURNSTILE_SECRET_KEY` Worker secret. If either is empty, the widget is not rendered
  and the Worker skips verification.
- **Logging.** Delivery failures are logged with `console.error` and are visible in
  Worker observability.

See also `docs/PREVIEW_DEPLOY.md` for preview and rollback, and `docs/PRODUCTION_TODO.md`
for the remaining launch gates.
