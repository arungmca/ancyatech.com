# Launch SEO Checklist — Ancya Technologies

Skill: `/workflows:launch-seo https://staging.ancyatech.com`

## Checklist status

- ✅ Canonical tags configured on all pages
- ✅ XML sitemap generated at `/sitemap.xml`
- ✅ `robots.txt` configured and references sitemap
- ✅ 404 page created
- ⚠️ Redirects mapped — verify during deploy (no redirect rules documented in repo)
- ✅ Google Analytics consent setup present (Consent Mode v2)
- ⚠️ Google Search Console verification — verify after domain cutover
- ⚠️ Core Web Vitals — measure with Lighthouse/PageSpeed before production release
- ✅ Mobile-first responsive layout in templates
- ✅ Structured data present (Organization, Service, Article, Blog, LocalBusiness)
- ✅ Local SEO landing page for Kortenberg created
- ⚠️ Google Business Profile setup outstanding (phone number required first)
- ✅ Sitemap total: 19 indexable pages

## Pre-publish tasks

1. Run `npm run build`
2. Run `npm run check`
3. Run `npm run check:a11y`
4. Run `npm run lint:html`
5. Submit `https://ancyatech.com/sitemap.xml` in Search Console
6. Verify canonical non-www/www redirect behavior
7. Measure Lighthouse on homepage and service pages

## Status
Launch SEO preflight is mostly complete. Remaining items are deployment-dependent: redirects, Search Console verification, and Core Web Vitals measurement.
