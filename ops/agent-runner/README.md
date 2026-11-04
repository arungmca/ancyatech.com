# Ancya agent runner

One HTTP worker that executes a single agent job against `arungmca/ancyatech.com`:

```
clone v2 -> branch -> agent edits -> checks -> commit -> push -> draft PR
```

It never merges, deploys or force-pushes. n8n calls it; GitHub remains the system of record.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | none | Liveness |
| POST | `/run` | Bearer `WORKER_TOKEN` | Queue one job |
| GET | `/jobs/:id` | Bearer `WORKER_TOKEN` | Job status and result |

### POST /run

```json
{
  "agent": "seo-geo-specialist",
  "issue": 18,
  "baseBranch": "v2",
  "instructions": "Issue body plus the latest reviewer comments..."
}
```

Supported agents: all five. The Project Manager and Content Reviewer run as read-only text agents (context + Ollama review, no clone). Frontend, Content Writer and SEO run the full clone → edit → checks → PR flow.

## Run locally

```bash
cp ops/agent-runner/.env.example ops/agent-runner/.env
# fill WORKER_TOKEN, GITHUB_TOKEN, OLLAMA_API_KEY
docker build -f ops/agent-runner/Dockerfile -t ancya-agent-runner .
docker run --rm -p 8788:8788 --env-file ops/agent-runner/.env ancya-agent-runner
```

Health check:

```bash
curl -s http://localhost:8788/health
```

Queue a job:

```bash
curl -s -X POST http://localhost:8788/run \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "content-type: application/json" \
  -d '{"agent":"seo-geo-specialist","issue":18,"instructions":"Fix the metadata on #18"}'
```

## Providers

- `AGENT_PROVIDER=ollama` — Aider with an OpenAI-compatible Ollama endpoint. For Ollama Cloud use `OLLAMA_BASE_URL=https://ollama.com/v1` and a code-capable model such as `qwen3-coder:480b`.
- `AGENT_PROVIDER=claude` — Claude Code CLI in headless mode. Requires `ANTHROPIC_API_KEY`.

Content/SEO work needs a model that can follow a long agent file and edit several files. If the Ollama model cannot reliably run the checks, use the Claude provider.

## Safety

- Bearer token on every mutating call.
- Repository and agent allowlists.
- One job at a time; no parallel clones.
- Instructions capped at 12,000 characters.
- Branch prefix `agent/<agent>/issue-<n>-…`; PRs are drafts.
- GitHub token should be a fine-grained PAT limited to this repository with `Contents: write` and `Pull requests: write`.
- Run the container with a read-only root filesystem where possible and no Docker socket.
