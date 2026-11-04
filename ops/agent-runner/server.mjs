/**
 * Ancya agent runner — HTTP control surface.
 *
 * n8n (or any trusted caller) posts one job here. The runner clones the repo,
 * runs one agent, checks the result, pushes a branch and opens a PR.
 *
 * Security:
 *   - Bearer token required (WORKER_TOKEN).
 *   - Agent allowlist, repository allowlist, issue number and instruction cap.
 *   - One job executes at a time; jobs are never run in parallel.
 *   - No shell interpolation: child processes receive argument arrays.
 *   - The worker never merges, deploys or force-pushes.
 */

import http from "node:http";
import { randomUUID } from "node:crypto";
import { runJob } from "./run-agent.mjs";

const PORT = Number(process.env.PORT || 8788);
const TOKEN = process.env.WORKER_TOKEN || "";
const MAX_BODY = 64 * 1024;
const MAX_INSTRUCTIONS = 12_000;
const ALLOWED_AGENTS = new Set([
  "project-manager",
  "frontend-designer",
  "content-writer",
  "content-reviewer",
  "seo-geo-specialist",
]);
const ALLOWED_REPOS = new Set(["arungmca/ancyatech.com"]);

if (!TOKEN) {
  console.error("WORKER_TOKEN is required.");
  process.exit(1);
}

const jobs = new Map();
let queue = Promise.resolve();
let active = false;

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error("body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function authorised(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return false;
  const provided = header.slice(7).trim();
  if (provided.length !== TOKEN.length) return false;
  return provided === TOKEN;
}

function validate(payload) {
  const agent = String(payload.agent || "").trim();
  const repo = String(payload.repo || "arungmca/ancyatech.com").trim();
  const issue = Number(payload.issue);
  const instructions = String(payload.instructions || "").trim();
  const baseBranch = String(payload.baseBranch || "v2").trim();

  if (!ALLOWED_AGENTS.has(agent)) return { error: "unsupported agent" };
  if (!ALLOWED_REPOS.has(repo)) return { error: "unsupported repository" };
  if (!Number.isInteger(issue) || issue <= 0) return { error: "invalid issue number" };
  if (!instructions) return { error: "instructions required" };
  if (instructions.length > MAX_INSTRUCTIONS) return { error: "instructions too long" };
  if (!/^[a-zA-Z0-9._/-]+$/.test(baseBranch)) return { error: "invalid base branch" };

  return { agent, repo, issue, instructions, baseBranch };
}

function enqueue(job) {
  queue = queue.then(async () => {
    active = true;
    job.status = "running";
    job.startedAt = new Date().toISOString();
    try {
      const result = await runJob(job);
      job.status = result.ok ? "success" : "failed";
      job.result = result;
    } catch (error) {
      job.status = "failed";
      job.result = { ok: false, error: error && error.message ? error.message : String(error) };
    } finally {
      job.finishedAt = new Date().toISOString();
      active = false;
      if (job.resolve) job.resolve(job);
    }
  });
  return queue;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://worker");

  if (req.method === "GET" && url.pathname === "/health") {
    return json(res, 200, { ok: true, jobs: jobs.size, busy: active });
  }

  if (!authorised(req)) {
    return json(res, 401, { ok: false, error: "unauthorised" });
  }

  if (req.method === "POST" && url.pathname === "/run") {
    let payload;
    try {
      payload = JSON.parse(await readBody(req));
    } catch {
      return json(res, 400, { ok: false, error: "invalid JSON body" });
    }

    const job = validate(payload);
    if (job.error) return json(res, 422, { ok: false, error: job.error });

    const id = randomUUID();
    const record = {
      id,
      ...job,
      status: "queued",
      createdAt: new Date().toISOString(),
    };
    record.done = new Promise((resolve) => {
      record.resolve = resolve;
    });
    jobs.set(id, record);
    enqueue(record);

    // n8n uses ?wait=1 so one HTTP node can return the final result.
    if (url.searchParams.get("wait") === "1") {
      await record.done;
      return json(res, 200, {
        ok: record.status === "success",
        jobId: id,
        status: record.status,
        result: record.result,
      });
    }

    return json(res, 202, { ok: true, jobId: id, status: "queued" });
  }

  const match = url.pathname.match(/^\/jobs\/([a-f0-9-]+)$/);
  if (req.method === "GET" && match) {
    const job = jobs.get(match[1]);
    if (!job) return json(res, 404, { ok: false, error: "job not found" });
    return json(res, 200, {
      ok: true,
      job: {
        id: job.id,
        agent: job.agent,
        issue: job.issue,
        repo: job.repo,
        status: job.status,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        finishedAt: job.finishedAt,
        result: job.result,
      },
    });
  }

  return json(res, 404, { ok: false, error: "not found" });
});

server.listen(PORT, () => {
  console.log(`agent-runner listening on ${PORT}`);
});

process.on("TERM", () => server.close(() => process.exit(0)));
process.on("INT", () => server.close(() => process.exit(0)));
