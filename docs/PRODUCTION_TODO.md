# Production Readiness TODO — V2

**Status:** Draft — awaiting approval. No production changes started.
**Created:** 3 November 2026
**Scheduled start:** 4 November 2026
**Base branch:** `v2` @ `c3e3491` (up to date with `origin/v2`)
**Release branch (proposed):** `release/v2-production`

---

## 0. How to use this document

This is the working plan for turning the V2 pre-release into a production build.
It records the task list, owners, dependencies, pending decisions and the execution protocol.

Do not start Phase 1 until the four pending decisions in §2 are answered.
Do not merge to `v2` or deploy until the Phase 1 review checkpoint in §5 passes.

---

## 1. Scope

Production-ready means:

- A visitor can submit the contact form and the message actually arrives.
- Every navigation, footer, card and social link resolves.
- The copy is true: no fabricated team size, credentials, metrics or quotes.
- The approved templates are live, indexed and connected to the home page.
- Accessibility, performance and security meet the targets in `docs/DESIGN_SPEC.md`.
- Deployment is repeatable, previewable and reversible.

**Out of scope for this pass:** a CMS/build-system migration, new services, ecommerce, full content marketing, a new visual direction.
The scaling plan is documented in `docs/ARCHITECTURE.md` and is not part of this release.

---

## 2. Pending decisions (blockers for some tasks)

| # | Decision | Options | Blocks |
|---|---|---|---|
| D1 | **Contact form delivery** | Cloudflare Worker + Resend (needs `RESEND_API_KEY`) · hosted service (Formspree/Basin, needs endpoint) · configurable endpoint with keys added later | Task P0-3 |
| D2 | **Case metrics & quotes** | Mark as illustrative · provide verified client data · remove until verified | Tasks P0-4, P0-5 |
| D3 | **Social links** | Remove placeholders until real profiles exist · provide real URLs · keep placeholders (not recommended) | Task P0-4 |
| D4 | **TODO approval** | Approve all · approve P0 only · revise · hold | Everything |

Defaults if no answer: **D1** configurable endpoint (no live sending until a key is supplied), **D2** mark as illustrative and exclude unverifiable numbers from indexed pages, **D3** remove the icons. These defaults are safe but not launch-complete for the form.

---

## 3. Task list

### Phase 0 — Baseline

| ID | Task | Owner | Depends on | Acceptance |
|---|---|---|---|---|
| P0-0 | Commit baseline: VS Code configs, `.gitignore` update, this document; create `release/v2-production`; confirm CI + link check | Lead | D4 | Clean branch; CI green; link check passes |
| P0-1 | Capture visual baseline at 1440 / 1024 / 861 / 390 for all pages | QA agent | P0-0 | Screenshots stored for before/after review |

### Phase 1 — Launch blockers

| ID | Task | Owner | Depends on | Acceptance |
|---|---|---|---|---|
| P1-2 | **Contact form delivery.** Add the real endpoint (Worker or hosted), server-side validation, spam protection, success/error states, secrets documented, form fallback | Backend agent | D1 | Real submission reaches the inbox; errors are recoverable and announced; no client-only fake success |
| P1-3 | **Placeholder cleanup.** Social links, Journal/card links, “coming soon” case cards, any remaining `href="#"` | Frontend agent | P0-0, D3 | No placeholders; every visible link resolves |
| P1-4 | **Truth-in-copy pass.** Remove “hand-crafted” and similar claims; resolve sample metrics/quotes; confirm domain/hosting wording | Content agent | D2 | No banned phrases; numbers/quotes verified or clearly illustrative |
| P1-5 | **Navigation & integration.** Home nav → `work.html`, `journal.html`, `about.html`; service cards → service page; footer and cross-links | Frontend agent | P1-3 | Nav/footer identical across pages; no dead anchors |
| P1-6 | **Launch flags.** Remove `noindex` from approved pages; add analytics + consent to all pages; update privacy/cookie copy if the form adds a processor | Frontend/SEO agent | P1-2, P1-5 | No unintended noindex; consent gates analytics; policy matches reality |
| P1-7 | **SEO metadata.** Per-page title/description/canonical/OG; Organization, LocalBusiness, Article/Service JSON-LD; sitemap and robots | SEO agent | P1-5 | Structured data validates; sitemap covers live URLs; no missing canonicals |
| P1-8 | **Routing & 404.** Verify `/work` style URLs, 404 page, redirects for any moved paths | Cloud agent | P1-5 | `/work` works, 404 renders, redirects documented |

### Phase 2 — Quality

| ID | Task | Owner | Depends on | Acceptance |
|---|---|---|---|---|
| P2-9 | **Accessibility audit.** axe + keyboard + focus + screen-reader spot check; fix findings | QA agent | P1 checkpoint | No serious/critical axe issues; complete keyboard pass |
| P2-10 | **Performance audit.** Lighthouse mobile, font strategy, image formats/sizes, GSAP/canvas cost, caching | Frontend/perf agent | P1 checkpoint | LCP < 2.5s, CLS < 0.1, no long main-thread tasks from decoration |
| P2-11 | **Responsive & resilience.** Breakpoints, reduced motion, no-JS, cross-browser | QA agent | P2-9 | No overflow; content and CTAs usable with motion/JS off |
| P2-12 | **Security.** CSP/headers, external links, secrets, consent enforcement, dependency check | Security agent | P1-6 | Headers documented; no secrets committed; CSP works with inline scripts/GA |
| P2-13 | **CI & preview deploys.** Link/HTML/SEO checks, optional Lighthouse, Cloudflare preview per branch | DevOps agent | P1-8 | CI green; preview URL works |

### Phase 3 — Launch

| ID | Task | Owner | Depends on | Acceptance |
|---|---|---|---|---|
| P3-14 | **Deploy runbook.** Preview verification, production deploy, rollback | DevOps agent | P2-13 | Runbook reviewed; rollback rehearsed |
| P3-15 | **Monitoring.** Analytics events for CTA/form, Search Console, uptime check | SEO/DevOps agent | P1-6 | Events visible; sitemap submitted; uptime alert configured |
| P3-16 | **Lock & release.** Final design/content sign-off; update `DESIGN_SPEC.md`, `ARCHITECTURE.md`, `styleguide.html`; tag `v2.0.0` | Lead + design agent | All | Docs match shipped code; release tagged and pushed |

---

## 4. Agent assignment

Work is assigned to dedicated agents by discipline. Agents must not edit the same files in parallel; the lead coordinates hand-offs.

| Agent role | Suggested subagent | Files / scope | Tasks |
|---|---|---|---|
| **Backend/cloud** | backend or cloud agent + Cloudflare docs | `worker/`, `wrangler.jsonc`, form endpoint, secrets docs | P1-2, P1-8 |
| **Frontend/integration** | frontend-developer | page HTML, `public/assets/js/site.js`, nav/footer, form UI | P1-3, P1-5, P1-6, P2-10 |
| **Content/SEO** | general-purpose or content specialist | page copy/heads, `sitemap.xml`, JSON-LD, social/footer links | P1-4, P1-7, P3-15 |
| **QA/accessibility** | ui-ux-designer or frontend QA | read-only audits, test matrix, screenshots | P0-1, P2-9, P2-11 |
| **Security/DevOps** | security/cloud agent | CI, headers, deploy config, runbook | P2-12, P2-13, P3-14 |
| **Design system** | lead + design agent | `docs/DESIGN_SPEC.md`, `docs/ARCHITECTURE.md`, style guide | P3-16 |

**Execution protocol**
1. P0-0 creates `release/v2-production`; all work lands there.
2. Phase 1 agents run in the order listed; P1-2 may run in parallel with P0-1/P1-3.
3. **Checkpoint after Phase 1:** human review of the integrated pages and form before Phase 2 starts.
4. Phase 2 may run QA, performance and security in parallel, but fixes to the same files are serialised.
5. Phase 3 starts only after all P2 acceptance criteria pass.
6. Every task ends with a commit, the link checker, and a short report. No direct pushes to `v2` or production without approval.

---

## 5. Review checkpoints

| Checkpoint | When | What is reviewed | Gate |
|---|---|---|---|
| CP-0 | After P0-0 | Branch, CI, baseline screenshots | Start Phase 1 |
| CP-1 | After Phase 1 | Page integration, copy truth, metadata, real form submission | Start Phase 2 |
| CP-2 | After Phase 2 | Accessibility/performance/security reports, preview deploy | Start launch |
| CP-3 | Before release | Final design/content sign-off, docs updated, rollback ready | Tag and deploy |

---

## 6. Definition of done

- [ ] Contact form delivers and handles failures.
- [ ] No placeholder links; nav/footer consistent; templates linked.
- [ ] No fabricated claims; metrics/quotes verified or removed.
- [ ] No unintended `noindex`; analytics consent-gated on every page.
- [ ] Metadata, canonical, JSON-LD and sitemap complete and valid.
- [ ] axe: no serious/critical findings; keyboard pass complete.
- [ ] LCP < 2.5s, CLS < 0.1 on mobile; budget documented.
- [ ] Security headers/CSP reviewed; no secrets in the repo.
- [ ] Preview deploy verified; production runbook and rollback written.
- [ ] `docs/DESIGN_SPEC.md`, `docs/ARCHITECTURE.md` and `docs/styleguide.html` match the shipped site.
- [ ] `v2.0.0` tagged and pushed.

---

## 7. Known risks / notes

- **Force-push history:** `v2` was rebased and force-pushed on 3 Nov. The remote tree matched the local tree before the CI commit; no content was lost.
- **Templates are `noindex`** and not linked from the home nav yet. Do not remove `noindex` until P1-6 and the CP-1 review.
- **VS Code warning** about `git:/…/index.html` is a stale virtual document from the move to `public/index.html`; reload the VS Code window.
- **Sandbox limits:** local port binding, `git push` and `gh` need to run outside the agent sandbox (VS Code tasks and the user’s terminal are fine).
- **Serving note:** `wrangler.jsonc` uses `asset.directory: ./public`, `html_handling: auto-trailing-slash`, `not_found_handling: 404-page`.
- **Uncommitted baseline:** `.vscode/` configs and the `.gitignore` update are part of P0-0, not yet committed.

---

## 8. Change log

| Date | Change |
|---|---|
| 2026-11-03 | Plan drafted; awaiting decisions D1–D4. |
