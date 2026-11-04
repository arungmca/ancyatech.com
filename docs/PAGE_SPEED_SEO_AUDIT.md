# Page Speed SEO Analysis — https://ancyatech.com

Skill: `/page-speed-seo https://ancyatech.com`

## Summary (static asset review)

| Asset | Approx. size | SEO/perf note |
|---|---:|---|
| `main.css` | 51 KB | Single stylesheet, render-blocking; acceptable but can be split/critical |
| `base.css` | 10 KB | Required base; load order is correct |
| `home.js` | 24 KB | Home-only deferred script |
| `site.js` | 6 KB | Shared deferred script |
| `consent.js` | 2.4 KB | Deferred |
| `founder.jpg` | 166 KB | Largest image; compress/convert to WebP/AVIF |
| `twitter-header-1500x500.png` | 81 KB | OG image; reduce dimensions/quality |
| Fonts | 49 KB total | Preloaded primary font; good |

## Opportunities

1. **Optimize `founder.jpg`**  
   - Compress and serve modern formats (WebP/AVIF).  
   - Impact: improved LCP/CLS/transfer size.

2. **Review CSS bundle size**  
   - 51 KB `main.css` is reasonable for a full site but could be split by page for non-home routes.  
   - Consider critical CSS on hero/header for LCP.

3. **Defer non-essential scripts**  
   - `home.js` already deferred; confirm it is not on non-home pages. It is page-specific.  
   - Keep consent and site scripts deferred.

4. **Image delivery**  
   - Favicons and social images can be optimized.  
   - Ensure all images have width/height to avoid CLS.

5. **Cache policy**  
   - `_headers` sets immutable cache for `/assets/*`; good.  
   - Keep HTML revalidation (`max-age=0, must-revalidate`) for content freshness.

## Recommended measurement commands
Run these against preview/production before release:
- Google Lighthouse
- PageSpeed Insights
- Chrome DevTools Performance tab
- `npm run check:a11y`

## Next recommended skill
- `/workflows:launch-seo https://staging.ancyatech.com`
