> **Status: superseded.** The project now uses **n8n + Ollama Cloud + ops/agent-runner** instead of GitHub Actions. See `ops/n8n/README.md`, `ops/agent-runner/README.md` and `docs/agents/roles.md`. The roles, labels, Project fields and comment protocol below remain valid.

# AGENT WORKFLOW

This is the structure for agentic workflow to perform ever tasks auomated by AI agent

---

## Architecture

### GitHub is the control plane; Claude Code is the worker

GitHub Project (dashboard)

```text
   └── Issue (task + acceptance criteria + agent label)
         ├── user comment  /agent run      ──► GitHub Action ──► Claude agent
         ├── user comment  /agent revise … ──► same agent, reads review comments
         ├── agent pushes branch + opens PR ──► CI (links, a11y, lint, tests)
         └── user comment  /approve         ──► PM moves item to Done
```

Project Manager agent ──► weekly + on-demand consolidated report

Important constraint: Claude Code agents do not run persistently. They only work when something invokes them. Two supported invocation paths:

- A. GitHub Actions (recommended): issue_comment event → Claude Code Action → the comment authorises one agent run. Fully asynchronous; you work from GitHub.
- B. Local orchestrator: a script pulls Ready items and you run the agent in Claude Code. No secrets, but you must be at the terminal.

I recommend A with a local fallback; the Action uses the same agent files.

---

1. Agent roles, dos, don’ts, performance

Project Manager — project-manager

Owns: board hygiene, sequencing, issue quality, WIP limits, consolidated reporting.
Dos

- Triage new issues: confirm goal, acceptance criteria, agent, priority, workstream.
- Enforce WIP limits and sequence dependent work (Content brief → Writer → Re
- Move items through Status; summarise user review comments into a numbered task list for the assigned agent.
- Post the consolidated report (weekly and /pm report): done, in review, chanext, metrics, decisions needed.
- Flag stale branches, failing CI and scope creep.
  Don’ts
- Do not write application code, copy, CSS or schema.
- Do not merge PRs, deploy, close issues without user acceptance, or change s
- Do not reassign an issue without noting why.
- Do not edit public/.
  Performance
- Board accuracy ≥95%; report on time 100%; items stale >48h ≤1; WIP never abitem has an owner and next step.

Frontend Designer — frontend-designer

Owns: HTML templates, CSS, layout, responsive behaviour, interaction, visual
Dos

- Work only from an issue with approved copy and a design direction.
- Use tokens in base.css; mobile-first; keyboard and reduced-motion support.
- Run build, link check, a11y check, HTML/CSS/JS lint; attach before/after sc
- Keep PRs small and scoped to the issue.
  Don’ts
- Do not rewrite marketing copy, meta titles/descriptions, or JSON-LD; request Content/SEO changes instead.
- Do not add dependencies, change CSP, _headers, worker/, or CI without PM ap
- Do not push to main/v2, merge, or edit public/.
  Performance
- CI green on first push ≥90%; zero unapproved visual regressions; zero a11y regressions; cycle time ≤2 working days; one revision round or fewer.

Content Writer — content-writer

Owns: body copy, headings, FAQs, page structure, front-matter copy fields.
Dos

- Follow the SEO brief in docs/seo/briefs/<issue>.md and the brand voice.
- Answer the reader’s question early; one idea per section; specific, plain E
- Provide an outline and before/after word count in the PR.

  Don’ts
- Do not invent prices, dates, client names, metrics or testimonials.
- Do not change CSS/JS, schema, canonical tags or sitemap.
- Do not publish or remove noindex; that is an SEO/PM decision.
  Performance
- Acceptance criteria met on first review ≥80%; revision rounds ≤1.5; unsuppord target met; no duplicate paragraphs across pages.

Content Reviewer — content-reviewer

Owns: factual accuracy, tone, structure, readability, link text, duplication,
Dos

- Read the whole diff and the rendered page.
- Leave line-level comments; verify every number/claim against a source or flag it.
- Give one verdict: APPROVED or CHANGES REQUESTED, with a numbered, actionabl
- Check that copy matches metadata and the SEO brief.
  Don’ts
- Do not silently rewrite the page; comment and hand back.
- Do not approve without reading the full change or with unsupported claims.
- Do not expand scope or change design/SEO decisions.
  Performance
- Review within 1 business day; every comment actionable; escaped factual defects 0; verdict always explicit.

SEO, GEO & AI SEO Specialist — seo-geo-specialist

Owns: keyword/intent briefs, metadata, headings, internal links, structured data, sitemap/indexing, AI-search (GEO) formatting.
Dos

- Produce a brief before content work: primary query, intent, entities, suggested H1/H2s, FAQs, internal links, metadata.
- Keep titles unique (30–60 chars) and descriptions 120–155 chars; validate s
- Verify canonical, robots, sitemap and noindex state after changes.
- Prefer answer-first sections, concrete entities and citations for AI search
  Don’ts
- Do not keyword-stuff, invent search-volume data, or promise rankings.
- Do not index /work pages or remove noindex without approval.
- Do not change visual design or write long-form body copy.
  Performance
- Metadata uniqueness 100%; schema validity 100%; zero indexing regressions;  acceptance criteria; measurable before/after evidence in the PR.

---

1. GitHub Project design

Create one user Project: “Ancya Website” (@me).

Fields

┌──────────────┬───────────────┬─────────────────────────────────────────────────────┐
│    Field     │     Type      │                                    Values                                     │
├──────────────┼───────────────┼─────────────────────────────────────────────────────┤
│ Status       │ single select │ Backlog, Ready, In Progress, In Review, Changes Requested, Blocked, Done      │
├──────────────┼───────────────┼─────────────────────────────────────────────────────┤
│ Agent        │ single select │ Project Manager, Frontend Designer, Content Writer, Content Reviewer, SEO/GEO │
├──────────────┼───────────────┼─────────────────────────────────────────────────────┤
│ Priority     │ single select │ P0, P1, P2, P3                                                                │
├──────────────┼───────────────┼─────────────────────────────────────────────────────┤
│ Workstream   │ single select │ Design, Content, SEO, Schema, Ops                                             │
├──────────────┼───────────────┼─────────────────────────────────────────────────────┤
│ Review │ single select │ Needs review, Changes requested, Approved                                     │
├──────────────┼───────────────┼─────────────────────────────────────────────────────┤
│ Estimate     │ number        │ 1, 2, 3, 5, 8                                                                 │
├──────────────┼───────────────┼─────────────────────────────────────────────────────┤
│ Iteration    │ iteration     │ optional 2-week sprint                                                        │
└──────────────┴───────────────┴─────────────────────────────────────────────────────┘

Views

- Board by Status (default)
- “My review queue” — Review = Needs review
- “By agent”
- “Blocked + stale”
- Roadmap/iteration

Labels: agent:pm, agent:frontend, agent:content, agent:review, agent:seo plus existing seo, enhancement, question.

Templates: one issue form (.github/ISSUE_TEMPLATE/agent-task.yml) and one PR template. Issue form fields: goal, agent, priority, context, files, acceptance criteria, evidence
required, dependencies.

Comment protocol (exact strings, case-sensitive):

┌───────────────────────┬────────────────────┬───────────────────────────────
│        Comment        │        Who         │                 Effect                  │
├───────────────────────┼────────────────────┼───────────────────────────────
│ /agent run            │ owner/collaborator │ Assigned agent picks up the issue       │
├───────────────────────┼────────────────────┼───────────────────────────────
│ /agent revise <notes> │ owner/collaborator │ Agent reworks using the review comments │
├───────────────────────┼────────────────────┼───────────────────────────────
│ /agent status         │ anyone             │ Agent posts a short status              │
├───────────────────────┼────────────────────┼───────────────────────────────
│ /review approve       │ Content Reviewer   │ Content verdict                         │
├───────────────────────┼────────────────────┼───────────────────────────────
│ /approve              │ user only          │ Final approval; PM closes after CI      │
├───────────────────────┼────────────────────┼───────────────────────────────
│ /block <reason>       │ anyone             │ Status → Blocked                        │
├───────────────────────┼────────────────────┼───────────────────────────────
│ /handoff <agent>      │ PM                 │ Reassign                                │
├───────────────────────┼────────────────────┼───────────────────────────────
│ /pm report            │ user               │ Consolidated report now                 │
└───────────────────────┴────────────────────┴───────────────────────────────

Only OWNER, MEMBER, COLLABORATOR comments may trigger an agent. All comment td input by the agent.

---

1. Work lifecycle

1. PM creates/refines the issue; sets Agent, Priority, Status = Ready.
1. User comments /agent run.
1. Agent branches from v2 as agent/<role>/issue-<n>-<slug>, implements only is, opens a PR (Refs #n, no Closes).
1. Agent sets Status = In Review; Reviewer (or SEO for metadata) reviews; user comments.
1. /agent revise … → same branch; repeat.
1. /approve → PM verifies CI and acceptance criteria, merges (or asks user to merge), sets Done.
1. PM reports.

Agents never merge, deploy, force-push, edit secrets/settings, or commit to p-merged by the PM/user only.

---

1. Implementation phases

┌───────┬────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬──────────┐
│ Phase │                                                                 Deliverable                                                                  │   Time   │
├───────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────┤
│ 0     │ Create Project, fields, views, labels, issue/PR templates                                                                                    │ ~30 min  │
├───────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────┤
│ 1     │ Five agent definitions in .claude/agents/ (commit them; .gitignore currently hides .claude) + docs/agents/roles.md                           │ ~45 min  │
├───────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────┤
│ 2     │ Local orchestration: scripts/agents/project.mjs (list/claim items), dispatch.mjs (build prompt), pm-report.mjs (metrics + report)            │ ~45 min  │
├───────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────┤
│ 3     │ .github/workflows/agent-dispatch.yml (comment trigger) and pm-report.yml (weekly/on-demand), using ANTHROPIC_API_KEY + PROJECT_TOKEN secrets │ ~60 min  │
├───────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────┤
│ 4     │ Seed the Project with issues #15–#24, set Agent/Priority/Workstream                                                                          │ ~20 min  │
├───────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────┤
│ 5     │ Pilot on #18 (metadata): SEO → Reviewer → user approval → PM report                                                                          │ ~1 issue │
├───────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────┤
│ 6     │ Enable for all workstreams; tune WIP and prompts                                                                                             │ ongoing  │
└───────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────┘

Phase 3 is the only part needing secrets:

- ANTHROPIC_API_KEY — for Claude Code Action.
- PROJECT_TOKEN — a PAT with project scope; the default GITHUB_TOKEN cannot r.

---

1. Governance and risks

- File ownership matrix prevents collisions: Designer owns CSS/JS/layout; Wrins metadata/schema; Reviewer writes nothing; PM owns reports/project fields.
- Untrusted comments: the Action checks author association and never executes shell from comment text; the agent receives the comment as context only.
- Hallucinated facts: Writer must flag unverified claims; Reviewer must verifrch data.
- Cost control: one agent run per /agent comment; max turns per run; PM WIP limit 3–5; scheduled report once per week.
- Branch protection stays as-is; all agent PRs must pass CI Success before th
- Rollback: every PR is squash-merged and revertible; no agent deploys.

---

1. Decisions I need before executing

1. Automation: (A) GitHub Actions comment-triggered + local fallback — recommended; (B) local only.
1. Model: Sonnet for all agents (recommended, cheaper) or Opus for PM + Revie
1. Integration branch: v2 (recommended) or main.

If you confirm these three, I’ll execute Phases 0–2 and the pilot setup immediately, then we enable Phase 3 once you add the two secrets.
