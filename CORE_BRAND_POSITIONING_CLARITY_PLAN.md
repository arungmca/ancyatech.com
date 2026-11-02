## Website Design Plan: ANCYA Studio Site

### Context
This repository contains the ANCYA website (https://ancyatech.com), a complete static HTML site for a web design and development studio. The site serves as both a marketing presence and a demonstration of the studio's capabilities. The plan below identifies all information needed to develop a website like this from scratch, or to evaluate what additional information may be required for enhancements.

### Approach — Information Requirements for Website Development

Every step below is a concrete, verifiable requirement. An implementer following this plan top-to-bottom with zero design decisions should be able to determine success at each step.

#### 1. Core Brand & Positioning Clarity
- **Studio name and legal entity** — Ancya Technologies, Antony Arun Praksh (Founder)
- **Target businesses** — small to mid-size businesses, specific industries verticals if any
- **Value proposition** — what makes the studio different (hand-crafted + engineering rigor, fixed quotes, senior people only, etc.)
- **Brand assets** — logo file @logo folder
- **Success metric definition** — what constitutes a "successful" website for this studio (leads, portfolio inquiries, brand awareness)

#### 2. Content Inventory & Strategy
- **About page content** — studio origin story, team bios with photos, values, philosophy
- **Services page** — list of services (Web Design, Web Development, Branding, E-commerce, SEO & Content, Care & Growth Plans) with descriptions, deliverables, and starting prices
- **Work/Case studies** — 3-5 featured projects with: client name, industry, brief, problem statement, approach, results (metrics), link to live site
- **Blog content** — existing posts (5 posts on website cost, signs your site is losing customers, mobile-first, redesign ROI, choosing an agency) or plan for regular blog
- **Contact information** — physical address, phone, email, hours, contact form requirements
- **Legal pages** — privacy policy, terms of service (if needed), cookie policy

#### 3. Technical Specifications
- **Hosting platform** — Cloudflare Workers (per wrangler.jsonc), or alternative (Netlify, Vercel, traditional hosting)
- **Domain** — ancyatech.com (primary) and www.ancyatech.com (per routes config)
- **Performance requirements** — Core Web Vitals targets (LCP < 2.5s, FID < 100ms, CLS < 0.1), sub-second load (0.8s mentioned in hero illustration)
- **Responsive breakpoints** — mobile-first design with breakpoints at 1024px, 860px, 640px, 440px (per existing CSS media queries)
- **Browser support** — latest Chrome, Firefox, Safari; IE11 decision
- **Accessibility requirements** — WCAG 2.1 AA minimum, keyboard navigation, color contrast ratios, screen reader support
- **CMS needs** — static HTML vs. headless CMS (Contentful, Strapi) vs. traditional CMS (WordPress); if CMS, content model requirements
- **Integration requirements** — forms (Netlify Forms, Formspree, or self-hosted), analytics (Plausible, Google Analytics), email marketing
- **Deployment pipeline** — GitHub Actions, manual wrangler deploy, CI/CD setup

#### 4. Design System Requirements
- **Color palette** — primary brand colors, secondary accents, neutrals, functional colors (error, success, warning); exact hex values and usage rules
- **Typography** — font families for display/body/accent, sizes, line heights, weight hierarchy; Google Fonts or self-hosted
- **Spacing and grid** — 8px or 4px base unit, max width, gutter calculations, column counts per breakpoint
- **Component library** — buttons (primary, ghost, secondary, small, large, block), cards, accordions, navigation, forms, modals
- **Icon system** — SVG sprite approach (per index.html defs), icon naming convention, new icon requirements
- **Illustration style** — hand-drawn aesthetic, color usage, recurring motifs (ferns, doodles, scribbles)
- **Motion guidelines** — CSS transitions, reduced-motion preference, entrance animations

#### 5. Site Structure & Navigation
- **Page hierarchy** — home, about, services, pricing/care, blog, blog post detail, contact, legal pages
- **Navigation structure** — main nav items, sub-pages, hierarchy, CTA placement
- **Internal linking** — between related pages, blog posts to services, case studies to contact
- **Sitemap** — XML sitemap structure, priority and changefreq settings

#### 6. SEO & Structured Data
- **Target keywords** — primary and secondary search terms per page
- **Schema.org markup** — Organization, WebSite, Service, BlogPosting, LocalBusiness if applicable; exact property values
- **Metadata strategy** — title format, description length, open graph tags, Twitter cards
- **Sitemap & robots.txt** — automatic generation or manual maintenance

#### 7. Analytics & Measurement
- **Analytics platform** — setup and configuration
- **Key events to track** — form submissions, CTA clicks, page views, scroll depth, time on page
- **Goal definitions** — what conversion events matter most

#### 8. Cookie & Privacy Compliance
- **Cookie banner** — opt-in vs opt-out, categories, default state, scanning behavior
- **Privacy policy link** — location in footer, content requirements
- **Data processing** — what data is collected, how it's stored, retention policy

#### 9. Quality Assurance & Testing
- **Cross-browser testing** — which browsers, device labs or tools (BrowserStack, Sauce Labs)
- **Mobile device testing** — iOS and Android phones, various screen sizes
- **Performance testing** — Lighthouse scores, WebPageTest, real-user monitoring
- **Accessibility testing** — axe, WAVE, manual keyboard navigation, screen reader checks
- **Form testing** — submission flow, error handling, spam protection (honeypot already in code)

#### 10. Future & Scalability
- **Feature backlog** — enhancements planned beyond initial launch
- **Update frequency** — content update schedule, blog posting cadence, case study additions
- **Versioning** — how design system changes are tracked and deployed

### Critical Files & Anchors (existing repository)
1. `index.html` — full site markup, CSS design system, SVG sprites, structured data (lines 1-3577)
2. `wrangler.jsonc` — Cloudflare Workers config, routes, assets directory (".")
3. `package.json` — `wrangler ^4.154.0` devDependency for deployment
4. `docker-compose.yml` — cloudflared tunnel for local development
5. `sitemap.xml` — single URL entry; plan may require expansion
6. `robots.txt` — allow all, sitemap reference

### Verification
After following this plan, an implementer should be able to:
1. Build a complete static HTML site matching the ANCYA design system
2. Deploy to Cloudflare Workers with custom domains ancyatech.com and www.ancyatech.com
3. Achieve Core Web Vitals scores in the "Good" range
4. Pass WCAG 2.1 AA accessibility audit
5. Have structured data validate at schema.org tester
6. Configure cookie banner and basic privacy compliance
7. Set up form handling and basic analytics

Each step depends on the prior: branding must be defined before design system; content inventory before page structure; technical specs before deployment configuration.

### Assumptions & Contingencies
- **Assumed**: The studio's brand palette (Fern: #72bf44, Rose: #ff7b9c, Glaucous: #607196, Slate: #babfd1, Platinum: #e8e9ed) and type scale are fixed as observed in the existing CSS. If the studio wants a rebrand, this changes the entire design system.
- **Assumed**: Cloudflare Workers + Wrangler is the deployment target (per existing package.json and wrangler.jsonc). If a different host is desired, the entire build/deploy pipeline changes.
- **Assumed**: Static HTML is the delivery mechanism. If a CMS is required, the content model and templating change significantly.