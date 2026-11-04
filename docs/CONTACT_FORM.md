# Contact form — Workers + Resend

Delivery path: `POST /api/contact` is handled by `worker/index.js`. The Worker validates the payload, applies the honeypot spam check, then sends the email through Resend.

## Deployment steps

1. Install locally:
   ```bash
   npm ci
   ```
2. Add the Resend API key:
   ```bash
   npx wrangler secret put RESEND_API_KEY
   ```
3. Configure or review these variables in `wrangler.jsonc`:
   - `RESEND_TO` — inbox that receives enquiries
   - `RESEND_FROM` — sender display name and address. Production default: `Ancya Enquiry <noreply@ancyatech.com>`
   - Before `ancyatech.com` is verified in Resend, use `Ancya Enquiry <onboarding@resend.dev>` for testing. Do not send to arbitrary recipients until the domain is verified.
4. Run locally:
   ```bash
   npm run dev
   ```
5. Deploy:
   ```bash
   npm run deploy
   ```

## Important setup notes

- While the account is in Resend test mode, use `onboarding@resend.dev` as the sender. Do not send to arbitrary recipients until the sending domain is verified.
- The form must only show success after `/api/contact` returns `{ "ok": true }`.
- If delivery fails, the user sees a recoverable error and a `mailto:` fallback.
- The honeypot field `website` is ignored for normal visitors and causes a fake success for bots.

## Related blockers

- Part of P1-2.
- Supports P1-6 (launch flags), P1-7 (metadata has no public email changes), and P2-12 (secrets and spam handling).