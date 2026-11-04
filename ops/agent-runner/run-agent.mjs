/**
 * One agent job:
 *   clone -> branch -> run agent -> checks -> commit -> push -> PR.
 *
 * Providers:
 *   AGENT_PROVIDER=ollama  Aider against an OpenAI-compatible Ollama endpoint
 *                          (default https://ollama.com/v1, model qwen3-coder).
 *   AGENT_PROVIDER=claude  Claude Code CLI in headless mode (ANTHROPIC_API_KEY).
 */

import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const REPO = process.env.REPO || "arungmca/ancyatech.com";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const PROVIDER = (process.env.AGENT_PROVIDER || "ollama").toLowerCase();
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "https://ollama.com/v1";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3-coder:480b";
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || "";
const OLLAMA_CHAT_URL = process.env.OLLAMA_CHAT_URL || "https://ollama.com/api/chat";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const CHECK_COMMANDS = (process.env.CHECK_COMMANDS || "npm ci,npm run build,npm run check,npm run check:a11y,npm run lint:html,npm run lint:js,npm test")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const AGENT_FILES = {
  "project-manager": ".claude/agents/project-manager.md",
  "frontend-designer": ".claude/agents/frontend-designer.md",
  "content-writer": ".claude/agents/content-writer.md",
  "content-reviewer": ".claude/agents/content-reviewer.md",
  "seo-geo-specialist": ".claude/agents/seo-geo-specialist.md",
};

// These agents read and comment; they never edit the repository.
const TEXT_AGENTS = new Set(["project-manager", "content-reviewer"]);

function basicAuth() {
  const encoded = Buffer.from(`x-access-token:${GITHUB_TOKEN}`).toString("base64");
  return `Authorization: Basic ${encoded}`;
}

function gitEnv() {
  return {
    ...process.env,
    GIT_CONFIG_COUNT: "1",
    GIT_CONFIG_KEY_0: "http.https://github.com/.extraheader",
    GIT_CONFIG_VALUE_0: basicAuth(),
    GIT_TERMINAL_PROMPT: "0",
  };
}

function run(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      ...options,
      env: options.env || process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    const cap = (value, chunk) => (value + chunk).slice(-20_000);
    child.stdout.on("data", (chunk) => (stdout = cap(stdout, chunk.toString())));
    child.stderr.on("data", (chunk) => (stderr = cap(stderr, chunk.toString())));
    child.on("error", (error) => resolve({ code: 127, stdout, stderr: String(error) }));
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

async function github(pathname, init = {}) {
  const response = await fetch(`https://api.github.com${pathname}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${GITHUB_TOKEN}`,
      "x-github-api-version": "2022-11-28",
      "user-agent": "ancya-agent-runner",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: response.ok, status: response.status, data };
}

async function fetchIssueContext(job) {
  const issue = await github(`/repos/${job.repo}/issues/${job.issue}`);
  if (!issue.ok) throw new Error(`could not load issue #${job.issue}`);
  const comments = await github(`/repos/${job.repo}/issues/${job.issue}/comments?per_page=100`);
  const history = Array.isArray(comments.data) ? comments.data : [];
  return {
    title: issue.data.title,
    body: issue.data.body || "",
    labels: (issue.data.labels || []).map((label) => (typeof label === "string" ? label : label.name)),
    comments: history.map((comment) => `@${comment.user.login}: ${comment.body}`).join("\n\n"),
  };
}

function issueBlock(context) {
  return [
    `Title: ${context.title}`,
    "",
    "Issue body:",
    context.body || "(empty)",
    "",
    "Labels: " + context.labels.join(", "),
    "",
    "Comment history:",
    context.comments || "(none)",
  ].join("\n");
}

function buildPrompt(job, agentInstructions, context) {
  return [
    agentInstructions,
    "",
    "---",
    "",
    `Repository: ${job.repo}`,
    `Issue: #${job.issue}`,
    "",
    "## Issue and review history",
    issueBlock(context),
    "",
    "## Latest instruction",
    job.instructions || "(none)",
    "",
    "## Hard rules",
    "- Change only files owned by your role and listed in the task.",
    "- Do not merge, deploy, force-push, or push to v2/main.",
    "- Do not edit public/, worker/, .github/workflows/, secrets or CSP without approval.",
    "- Do not invent prices, dates, metrics, clients or testimonials.",
    "- Run the repository checks and leave the tree buildable.",
    "- When finished, stop. The runner commits and opens the PR.",
  ].join("\n");
}

async function runAgent(provider, prompt, cwd, agentFile) {
  if (provider === "claude") {
    if (!ANTHROPIC_API_KEY) return { code: 2, stderr: "ANTHROPIC_API_KEY is not set" };
    return run(
      "claude",
      [
        "-p",
        prompt,
        "--permission-mode",
        "acceptEdits",
        "--max-turns",
        "40",
        "--allowedTools",
        "Read,Edit,Write,Bash",
      ],
      { cwd, env: { ...process.env, ANTHROPIC_API_KEY } }
    );
  }

  if (!OLLAMA_API_KEY) return { code: 2, stderr: "OLLAMA_API_KEY is not set" };
  return run(
    "aider",
    [
      "--model",
      `openai/${OLLAMA_MODEL}`,
      "--openai-api-base",
      OLLAMA_BASE_URL,
      "--openai-api-key",
      OLLAMA_API_KEY,
      "--yes",
      "--no-auto-commits",
      "--no-check-update",
      "--message",
      prompt,
      "--read",
      agentFile,
    ],
    { cwd }
  );
}

async function runTextAgent(job, agentInstructions, context) {
  const prompt = buildPrompt(job, agentInstructions, context);
  const agentFile = AGENT_FILES[job.agent];

  if (PROVIDER === "claude") {
    if (!ANTHROPIC_API_KEY) return { ok: false, error: "ANTHROPIC_API_KEY is not set" };
    const result = await run(
      "claude",
      ["-p", prompt, "--permission-mode", "plan", "--max-turns", "8", "--allowedTools", "Read,Grep,Glob"],
      { env: { ...process.env, ANTHROPIC_API_KEY } }
    );
    return { ok: result.code === 0, comment: result.stdout.trim(), logs: result.stderr };
  }

  if (!OLLAMA_API_KEY) return { ok: false, error: "OLLAMA_API_KEY is not set" };
  const response = await fetch(OLLAMA_CHAT_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${OLLAMA_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        { role: "system", content: agentInstructions },
        { role: "user", content: `${issueBlock(context)}\n\nLatest instruction:\n${job.instructions || "(none)"}` },
      ],
    }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    return { ok: false, error: `Ollama error (${response.status})`, detail: data };
  }
  const comment = data.message && data.message.content ? data.message.content.trim() : "";
  return { ok: Boolean(comment), comment, agentFile };
}

async function createPullRequest(job, branch, workdir) {
  const body = [
    `Automated work for #${job.issue} by the ${job.agent} agent.`,
    "",
    "Refs #" + job.issue,
    "",
    "## Checks",
    "Run by ops/agent-runner before push. Review the CI result before merging.",
  ].join("\n");

  const result = await github(`/repos/${REPO}/pulls`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: `[#${job.issue}] ${job.agent} update`,
      head: branch,
      base: job.baseBranch,
      body,
      draft: true,
    }),
  });

  if (result.ok) return { ok: true, url: result.data.html_url, number: result.data.number };
  if (result.status === 422) {
    const existing = await github(`/repos/${REPO}/pulls?head=arungmca:${branch}&state=open`);
    if (existing.ok && Array.isArray(existing.data) && existing.data[0]) {
      return { ok: true, url: existing.data[0].html_url, number: existing.data[0].number, existing: true };
    }
  }
  return { ok: false, error: `PR creation failed (${result.status})`, detail: result.data };
}

async function loadLocalAgentFile(agentFile) {
  for (const candidate of [
    path.join(process.cwd(), agentFile),
    path.resolve(process.cwd(), "..", "..", agentFile),
  ]) {
    try {
      return await readFile(candidate, "utf8");
    } catch {
      // try the next location
    }
  }
  throw new Error(`agent file not found: ${agentFile}`);
}

export async function runJob(job) {
  if (!GITHUB_TOKEN) return { ok: false, error: "GITHUB_TOKEN is not set" };
  const agentFile = AGENT_FILES[job.agent];
  if (!agentFile) return { ok: false, error: "agent has no runner definition" };

  let context;
  try {
    context = await fetchIssueContext(job);
  } catch (error) {
    return { ok: false, phase: "context", error: error.message };
  }

  if (TEXT_AGENTS.has(job.agent)) {
    const agentInstructions = await loadLocalAgentFile(agentFile);
    return runTextAgent(job, agentInstructions, context);
  }

  const workdir = await mkdtemp(path.join(os.tmpdir(), `ancya-${job.issue}-`));
  const branch = `agent/${job.agent}/issue-${job.issue}-${Date.now().toString(36)}`;

  try {
    const clone = await run(
      "git",
      ["clone", "--depth", "40", "--branch", job.baseBranch, `https://github.com/${REPO}.git`, workdir],
      { env: gitEnv() }
    );
    if (clone.code !== 0) return { ok: false, phase: "clone", logs: clone.stderr };

    const configured = await run("git", ["config", "user.name", "Ancya Agent"], { cwd: workdir });
    if (configured.code !== 0) return { ok: false, phase: "git-config", logs: configured.stderr };
    await run("git", ["config", "user.email", "agents@ancyatech.com"], { cwd: workdir });

    const branchResult = await run("git", ["checkout", "-b", branch], { cwd: workdir });
    if (branchResult.code !== 0) return { ok: false, phase: "branch", logs: branchResult.stderr };

    const agentInstructions = await readFile(path.join(workdir, agentFile), "utf8");
    const prompt = buildPrompt(job, agentInstructions, context);
    const agentRun = await runAgent(PROVIDER, prompt, workdir, agentFile);
    if (agentRun.code !== 0) {
      return {
        ok: false,
        phase: "agent",
        provider: PROVIDER,
        logs: `${agentRun.stdout}\n${agentRun.stderr}`.trim(),
      };
    }

    const checks = [];
    for (const command of CHECK_COMMANDS) {
      const [bin, ...args] = command.split(" ");
      const result = await run(bin, args, { cwd: workdir, env: { ...process.env, CI: "1" } });
      checks.push({ command, code: result.code });
      if (result.code !== 0) {
        return {
          ok: false,
          phase: "checks",
          branch,
          checks,
          logs: result.stdout + result.stderr,
        };
      }
    }

    const status = await run("git", ["status", "--porcelain"], { cwd: workdir });
    if (!status.stdout.trim()) {
      return { ok: false, phase: "no-changes", checks };
    }

    const commit = await run("git", ["add", "-A"], { cwd: workdir });
    if (commit.code !== 0) return { ok: false, phase: "git-add", logs: commit.stderr };
    const message = `agent(${job.agent}): address #${job.issue}`;
    const committed = await run("git", ["commit", "-m", message], { cwd: workdir, env: gitEnv() });
    if (committed.code !== 0) return { ok: false, phase: "commit", logs: committed.stderr };

    const pushed = await run("git", ["push", "-u", "origin", branch], { cwd: workdir, env: gitEnv() });
    if (pushed.code !== 0) return { ok: false, phase: "push", logs: pushed.stderr };

    const pr = await createPullRequest(job, branch, workdir);
    if (!pr.ok) return { ok: false, phase: "pr", branch, checks, detail: pr.detail };

    return { ok: true, branch, prUrl: pr.url, prNumber: pr.number, checks };
  } finally {
    await rm(workdir, { recursive: true, force: true });
  }
}
