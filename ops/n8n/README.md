# n8n automation for the Ancya agent team

n8n is the orchestration and reporting layer. The heavy work (clone, edit, build, push, PR) runs in `ops/agent-runner`; n8n calls it over HTTP.

```
GitHub webhook ──► n8n ──► agent-runner ──► branch / draft PR
                     └────► GitHub comment
Schedule ─────────► n8n ──► GitHub GraphQL ──► Ollama summary ──► weekly report
```

## Prerequisites

1. n8n can reach the worker container on the same Docker network, e.g. `http://agent-runner:8788`.
2. GitHub webhook can reach n8n:
   - Public URL: `https://<n8n-host>/webhook/agent-dispatch`
   - Cloudflare Tunnel is fine; restrict the path with Cloudflare Access if possible.
3. n8n environment variables (or replace them with Header Auth credentials):

| Variable | Purpose |
|---|---|
| `WORKER_URL` | Worker base URL, e.g. `http://agent-runner:8788` or `http://127.0.0.1:8788` |
| `WORKER_TOKEN` | Bearer token for the worker |
| `GITHUB_TOKEN` | Issues/PR comments + GraphQL Project access |
| `OLLAMA_API_KEY` | Ollama Cloud |
| `OLLAMA_MODEL` | e.g. `qwen3-coder:480b` or a stronger reasoning model |
| `PROJECT_ID` | `PVT_kwHOABg2C84BqMeO` (project "Ancya Website") |

If n8n blocks env access in nodes, either set `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` or create Header Auth credentials and swap the expressions.

## Import

n8n → **Workflows → Import from File**:

- `workflows/agent-dispatch.json`
- `workflows/pm-report.json`

Then activate both. The dispatch workflow uses a webhook; copy the production URL shown by the Webhook node.

## GitHub webhook

Repository → Settings → Webhooks → Add webhook:

- Payload URL: `https://<n8n-host>/webhook/agent-dispatch`
- Content type: `application/json`
- Events: **Issue comments**
- Secret: set one and put a Cloudflare Access rule or Basic Auth in front; the workflow validates author association but does not verify the GitHub HMAC. Treat the webhook URL as a secret until HMAC verification is added.

## Comment commands

```
/agent run
/agent revise <notes>
/agent status
```

Only `OWNER`, `MEMBER` and `COLLABORATOR` comments can trigger a run. `/approve`, `/block` and `/pm report` are reserved for the human workflow and can be added as extra workflows.

## Project

Project ID: `PVT_kwHOABg2C84BqMeO` (user project `arungmca`, number 3).

| Field | ID |
|---|---|
| Agent | `PVTSSF_lAHOABg2C84BqMeOzhokqMk` |
| Priority | `PVTSSF_lAHOABg2C84BqMeOzhokqMo` |
| Workstream | `PVTSSF_lAHOABg2C84BqMeOzhokqMs` |
| Review | `PVTSSF_lAHOABg2C84BqMeOzhokqMw` |
| Workflow | `PVTSSF_lAHOABg2C84BqMeOzhokqM0` |
| Estimate | `PVTF_lAHOABg2C84BqMeOzhokqM4` |
| Start date | `PVTF_lAHOABg2C84BqMeOzhok598` |
| Target date | `PVTF_lAHOABg2C84BqMeOzhok5-A` |

The built-in `Status` field is unused; the team uses **Workflow**.

## Adding project sync (recommended next workflow)

A second workflow should react to `issues` and `pull_request` events and set **Workflow**:

| Event | Set |
|---|---|
| Issue labeled `agent:*` | In Progress |
| Draft PR opened | In Review |
| Review comment with `CHANGES REQUESTED` | Changes Requested |
| User comment `/approve` | Approved |
| PR merged | Done |
| `/block` | Blocked |

Use the GraphQL mutations `addProjectV2ItemById` for new issues and `updateProjectV2ItemFieldValue` for fields. Keep this in n8n, not in the agents.

## PM report

`pm-report.json` runs every Friday at 16:00, reads the Project via GraphQL, computes status/agent/stale metrics plus overdue, due-within-7-days and missing-target items from the Start/Target date fields, asks Ollama for a short narrative, and comments on tracking issue #25.

Test it with **Execute Workflow** before activating. The Code node tolerates empty projects.

## Security notes

- The worker requires `WORKER_TOKEN`; never expose port 8788 publicly.
- Give `GITHUB_TOKEN` only the scopes needed: issues/PR comments and Projects read/write. Do not reuse a personal admin token.
- The worker refuses unsupported agents, repos, issues and oversized instructions.
- Agents never merge, deploy or force-push; PRs are drafts.
- Review the n8n execution log after each run; it contains agent output but never the token.

## Local smoke test

```bash
curl -s -X POST "http://localhost:8788/run?wait=1" \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "content-type: application/json" \
  -d '{"agent":"content-reviewer","issue":18,"instructions":"Review the metadata change."}'
```
