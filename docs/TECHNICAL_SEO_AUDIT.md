# Technical SEO Audit — https://ancyatech.com

Skill: `/technical-seo https://ancyatech.com`
Scope: static site audit based on repository and generated `public/` output.

## Score summary

| Area | Result |
|---|---|
| Crawlability & robots.txt | ✅ Pass |
| XML sitemap | ✅ Pass |
| Canonical URLs | ✅ Pass (19 pages) |
| Metadata | ✅ Pass, with minor truncation notes |
| Structured data | ✅ Pass (Organization, Service, Article, Blog) |
| HTML validation | ✅ 0 errors |
| Link integrity | ✅ 19 HTML files checked, all links resolve |
| Accessibility structure | ✅ 18 HTML files checked, passes |
| Security headers | ✅ Strong CSP, HSTS, frame protection |
| Core Web Vitals | ⚠️ Not measured locally; build targets 95+ PageSpeed and sub-second load |

## Findings

### Passed
- `User-agent: *` / `Allow: /` with sitemap reference.
- Every public page has title, description, canonical URL, and OG/Twitter tags.
- JSON-LD on service, journal, homepage and Kortenberg pages.
- Cache headers differ correctly for HTML and immutable assets.
- `404.html` uses noindex intent through template setup.

### Advisories
1. Two campaign meta descriptions are 181–183 chars and may be truncated:
   - `/services-web-design`
   - `/web-design-kortenberg`
2. `journal-design-decisions.njk` title is 67 chars; monitor snippet truncation.
3. `index.njk` description is 197 chars; could be tightened to ~155 chars for snippet display.
4. No Lighthouse/Core Web Vitals run was performed in this local audit; recommended before release.
5. Verify production HTTPS deployment and `www`/non-www redirect behavior on Cloudflare.

## Recommended next commands
- `/page-speed-seo https://ancyatech.com`
- `/content-audit https://ancyatech.com --scope full`
- `/competitor-gap --target https://ancyatech.com --competitors ...`
- `/workflows:launch-seo https://staging.ancyatech.com`
