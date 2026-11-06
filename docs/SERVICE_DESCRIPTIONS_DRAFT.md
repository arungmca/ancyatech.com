# Services draft — Ancya Technologies

These drafts are review material only. They are deliberately technical, practical, and free of unverified numbers, rankings guarantees, client quotations, or fabricated proof.

---

## 1. Web Development

### Narrative
Most small-business websites do not fail because they look old. They fail because their delivery chain is fragile: oversized bundles, guessed-at accessibility, fragile forms, and deployments that depend on memory. Web development here focuses on making pages load, work, and remain editable after launch.

### Technical base
- Static-first delivery where possible, with Cloudflare Workers Assets as the deploy boundary.
- One shared stylesheet and one shared behaviour file for predictable maintenance.
- Deferred JavaScript and pauseable animations for decoration.
- Form validation and server-side handling, including spam filtering and recoverable failure states.
- Explicit asset dimensions, lazy loading and long-term cached content-addressable assets.

### Trade-offs
- Avoid heavy frontend frameworks when a static site plus small script is enough.
- Choose fewer, stronger dependencies over a larger dependency graph.
- Separate content-driven marketing pages from application logic.

### Deliverables
- Buildable page set
- Shared component structure
- Deployment configuration
- Test and release checklist

### How emerging tools are adopted
A new library is introduced through a separate branch or draft, checked against accessibility, performance, and security, then promoted only when it reduces rather than increases long-term maintenance work.

---

## 2. AI SEO & GEO

### Narrative
Search visibility in 2026 is less about keyword volume than about being useful, consistent, and quotable. Traditional engines still matter for discovery, while generative systems reward concise answer paragraphs, clear entity structures and verifiable facts.

### Technical base
- Semantic HTML and logical heading hierarchy.
- JSON-LD structured data for Organization, LocalBusiness, Article, Service.
- Canonical URLs, sitemap coverage and crawl discipline.
- Page-level metadata unique to the search intent of each page.
- Internal links from Work, Journal, Service and Contact paths on every page.

### GEO considerations
- Answer-first headings
- Lists and comparison blocks for clear extraction
- Short, explicit paragraphs
- Factual copy that can be quoted without caveat
- No keyword stuffing or fabricated metric claims

### Deliverables
- Metadata and schema recommendations
- Sitemap and robots setup
- Structured-data page templates
- Content-answer block guidelines

### How emerging tools are adopted
New search/generative discovery methods are tested in staging and benchmarked against actual query behavior, not guessed keywords. Recommendations are only promoted when they improve clarity and crawlability.

---

## 3. AI Automation

### Narrative
The useful kind of automation removes boring administration without changing what the business actually sells. Every system should survive the founder being unavailable for a week, and every workflow should leave a human-readable audit trail.

### Technical base
- Cloudflare Worker routes for small, explicit operations.
- Server-side validation, structured errors, and safe external APIs.
- Honeypot and optional challenge layers for abuse protection.
- Clear secret handling and environment separation.
- Webhooks, queues where appropriate, and idempotent operations.

### Trade-offs
- Start with deterministic workflows before adding LLM inference
- Prefer observable, reversible automations over “black box” chains
- Avoid collecting data that cannot be explained or deleted

### Deliverables
- Workflow specification
- Worker/service configuration
- Failure and retry plan
- Monitoring and alert notes

### How emerging tools are adopted
A custom AI pattern is first prototyped locally or on a non-production route. It must show measurable manual-effort reduction, pass security review, and have a rollback before production adoption.

---

## 4. Branding & Identity

### Narrative
A brand system should make decisions easier. The job is not a secret color palette; it is a set of constraints, token names, spacing rules, and copy boundaries that help every future page look like it belongs to the same company.

### Technical base
- Tokens in `:root` with light and dark definitions
- A frozen visual system documented in the design spec and style guide
- Iconography and component examples in a live reference file
- Explicit rules for changed or added components
- Clear boundaries around logo, color, typography, and motion

### Deliverables
- Brand kit and token set
- Logo usage guidance
- Visual component reference
- Release rules for design-system updates

### How emerging tools are adopted
New visual language directions are reviewed as explicit version changes, not as side effects of adding pages or components.

---

## 5. E-Commerce

### Narrative
E-commerce competence is operational clarity: catalogs that do not desync, prices that move predictably, checkout that fails visibly, and ownership of the final data. That matters more than adding interface flourishes to the cart.

### Technical base
- Mobile-first checkout journey
- Accessible form controls and payment validation
- Explicit delivery and inventory error states
- Structured product/catalog content
- Secure third-party gateway integration and secret handling

### Trade-offs
- Prefer a smaller, understandable store architecture over an overstretched custom stack
- Minimize features that add operational drag
- Treat payment flows with clearer rollback and notification paths

### Deliverables
- Store architecture notes
- Product and catalog content model
- Checkout error and recovery scenarios
- Security and reconciliation checklist

### How emerging tools are adopted
E-commerce changes are staged carefully: transaction flows are not changed casually once a store is live. New checkout or inventory strategies must be tested in preview before production use.