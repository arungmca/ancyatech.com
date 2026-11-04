FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates python3 python3-venv python3-pip curl \
  && rm -rf /var/lib/apt/lists/*

# Claude Code CLI (used when AGENT_PROVIDER=claude)
RUN npm install -g @anthropic-ai/claude-code

# Aider (used when AGENT_PROVIDER=ollama, including Ollama Cloud)
RUN python3 -m venv /opt/aider \
  && /opt/aider/bin/pip install --no-cache-dir aider-chat
ENV PATH="/opt/aider/bin:${PATH}"

WORKDIR /app
# Build context is the repository root:
#   docker build -f ops/agent-runner/Dockerfile -t ancya-agent-runner .
COPY ops/agent-runner/package.json ops/agent-runner/server.mjs ops/agent-runner/run-agent.mjs ./
COPY .claude/agents /app/.claude/agents

EXPOSE 8788
CMD ["node", "server.mjs"]
