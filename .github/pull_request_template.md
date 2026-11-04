## Agent and issue

- Agent: <!-- Project Manager / Frontend Designer / Content Writer / Content Reviewer / SEO/GEO -->
- Issue: Refs #
- Branch: `agent/<role>/issue-<n>-<slug>`

## What changed

<!-- One paragraph. List the files changed and why. -->

## Evidence

- [ ] `npm run build`
- [ ] `npm run check`
- [ ] `npm run check:a11y`
- [ ] `npm run lint:html`
- [ ] `npm run lint:css`
- [ ] `npm run lint:js`
- [ ] `npm test`
- [ ] Before/after screenshots (design)
- [ ] Before/after word count or outline (content)
- [ ] Metadata/schema validation (SEO)

## Scope check

- [ ] Only files listed on the issue are touched
- [ ] No changes to `public/`, `worker/`, `.github/workflows/`, CSP or secrets
- [ ] One H1 per page and no metadata drift unless the issue is an SEO metadata task
- [ ] No invented prices, dates, metrics, clients or testimonials

## Review notes

<!-- Reviewer verdict: APPROVED or CHANGES REQUESTED, with numbered items. -->

## Risk and rollback

<!-- Low/medium/high. How to revert: squash-merge revert is enough? Any data or SEO impact? -->
