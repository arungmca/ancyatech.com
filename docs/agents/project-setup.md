# GitHub Project setup — Ancya Website

Project: https://github.com/users/arungmca/projects/3  
Project ID: `PVT_kwHOABg2C84BqMeO`

## Fields

| Field | Type | Options |
|---|---|---|
| Workflow | single select | Backlog, Ready, In Progress, In Review, Changes Requested, Blocked, Done |
| Agent | single select | Project Manager, Frontend Designer, Content Writer, Content Reviewer, SEO/GEO |
| Priority | single select | P0, P1, P2, P3 |
| Workstream | single select | Design, Content, SEO, Schema, Ops |
| Review | single select | Needs review, Changes requested, Approved |
| Estimate | number | 1, 2, 3, 5, 8 |
| Start date | date | roadmap start |
| Target date | date | roadmap target |

The built-in **Status** field is unused; use **Workflow**. GitHub does not expose view creation through its API, so create these once in the UI:

1. **Board** — layout Board, group by Workflow.
2. **Review queue** — layout Table, filter `Review = Needs review`, sort by Priority.
3. **By agent** — layout Table, group by Agent, filter `Workflow != Done`.
4. **Blocked and stale** — filter `Workflow = Blocked` or items not updated in 2 days.
5. **Roadmap** — layout Roadmap, filter `-workflow:Done`, Start date = Start date, Target date = Target date, group by Agent, zoom Months. Seeded dates run from 5 Nov to 4 Dec 2026.

## Labels

| Label | Routes to |
|---|---|
| `agent:pm` | Project Manager |
| `agent:frontend` | Frontend Designer |
| `agent:content` | Content Writer |
| `agent:review` | Content Reviewer |
| `agent:seo` | SEO/GEO Specialist |

## Issue and PR templates

- Agent task form: `.github/ISSUE_TEMPLATE/agent-task.yml`
- Pull request template: `.github/pull_request_template.md`
- Roles and comment protocol: `docs/agents/roles.md`

## Automation ownership

| Action | Owner |
|---|---|
| Move items between statuses | n8n (`ops/n8n/`) |
| Agent execution | `ops/agent-runner` |
| Final approval, merge | User / Project Manager |
| Weekly report | n8n `pm-report` workflow |

## Manual fallback

If n8n is unavailable:

```bash
# list ready items
gh project item-list 1 --owner arungmca --format json

# run one agent locally
curl -s -X POST "http://localhost:8788/run?wait=1" \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "content-type: application/json" \
  -d '{"agent":"seo-geo-specialist","issue":18,"instructions":"Run the metadata task."}'
```
