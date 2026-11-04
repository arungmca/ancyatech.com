#!/usr/bin/env node
/**
 * Import/update the Ancya n8n workflows through the public n8n API.
 *
 * Usage:
 *   N8N_BASE_URL=https://n8n.ancyatech.com \
 *   N8N_API_KEY=... \
 *   node ops/n8n/import.mjs
 *
 * The key needs workflow create/update/activate permission. Existing workflows
 * with the same name are updated in place; new ones are created and activated.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const base = (process.env.N8N_BASE_URL || "https://n8n.ancyatech.com").replace(/\/$/, "");
const key = process.env.N8N_API_KEY;

if (!key) {
  console.error("N8N_API_KEY is required.");
  process.exit(1);
}

async function api(pathname, init = {}) {
  const response = await fetch(`${base}/api/v1${pathname}`, {
    ...init,
    headers: {
      "X-N8N-API-KEY": key,
      accept: "application/json",
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
  if (!response.ok) {
    throw new Error(`${init.method || "GET"} ${pathname} failed (${response.status}): ${text}`);
  }
  return data;
}

function payload(workflow) {
  return {
    name: workflow.name,
    nodes: workflow.nodes,
    connections: workflow.connections,
    settings: workflow.settings || { executionOrder: "v1" },
    staticData: workflow.staticData || null,
  };
}

const files = ["agent-dispatch.json", "pm-report.json"];
const existing = await api("/workflows?limit=250");
const byName = new Map((existing.data || []).map((workflow) => [workflow.name, workflow]));

for (const file of files) {
  const workflow = JSON.parse(await readFile(path.join(here, "workflows", file), "utf8"));
  const current = byName.get(workflow.name);
  let saved;

  if (current) {
    saved = await api(`/workflows/${current.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload(workflow)),
    });
    console.log("updated", workflow.name, saved.id);
  } else {
    saved = await api("/workflows", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload(workflow)),
    });
    console.log("created", workflow.name, saved.id);
  }

  const active = await api(`/workflows/${saved.id}/activate`, { method: "POST" });
  console.log("activated", active.name, active.active);
}

console.log("done");
