import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import worker, {
  handleContact,
  validate,
  setSecurityHeaders,
  createRateLimiter,
  isSameOrigin,
} from "../../worker/index.js";
import { MAX_BODY_BYTES } from "../../worker/config.js";

const ORIGIN = "https://ancyatech.com";
const API_URL = `${ORIGIN}/api/contact`;

const ENV = {
  RESEND_API_KEY: "re_test_key",
  RESEND_TO: "antony@ancyatech.com",
  RESEND_FROM: "Ancya Enquiry <noreply@ancyatech.com>",
};

// Disable the in-isolate limiter for endpoint tests unless a test wants it.
const NO_LIMIT = { rateLimiter: null };

const VALID = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  budget: "£10k–£20k",
  message: "We need a new website for our analytical engine business.",
};

const realFetch = globalThis.fetch;
let resendCalls;

beforeEach(() => {
  resendCalls = [];
  // Any unexpected network call fails loudly; handleContact turns this into 502.
  globalThis.fetch = async (input) => {
    throw new Error(`Unexpected fetch call to ${input}`);
  };
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

function stubResend(status = 200, body = '{"id":"email_123"}') {
  globalThis.fetch = async (input, init) => {
    resendCalls.push({ url: String(input), init });
    return new Response(body, {
      status,
      headers: { "content-type": "application/json" },
    });
  };
}

function postRequest(payload, { headers = {}, raw = null, url = API_URL } = {}) {
  const body = raw !== null ? raw : JSON.stringify(payload);
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
}

test("OPTIONS returns 204 with no body", async () => {
  const response = await worker.fetch(new Request(API_URL, { method: "OPTIONS" }), {});

  assert.equal(response.status, 204);
  assert.equal(await response.text(), "");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  // JSON/API responses intentionally omit the HTML CSP.
  assert.equal(response.headers.get("content-security-policy"), null);
});

test("GET returns 405", async () => {
  const response = await worker.fetch(new Request(API_URL), {});

  assert.equal(response.status, 405);
  assert.deepEqual(await response.json(), { ok: false, error: "Method not allowed" });
  assert.match(response.headers.get("allow") || "", /POST/);
});

test("wrong content type returns 415", async () => {
  const request = postRequest(VALID, { headers: { "content-type": "text/plain" } });
  const response = await handleContact(request, ENV, NO_LIMIT);

  assert.equal(response.status, 415);
  assert.equal(resendCalls.length, 0);
});

test("invalid JSON returns 400", async () => {
  const request = postRequest(null, { raw: "{ not json" });
  const response = await handleContact(request, ENV, NO_LIMIT);

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { ok: false, error: "Invalid request body" });
  assert.equal(resendCalls.length, 0);
});

test("JSON arrays are rejected as invalid bodies", async () => {
  const request = postRequest(null, { raw: "[]" });
  const response = await handleContact(request, ENV, NO_LIMIT);

  assert.equal(response.status, 400);
});

test("missing fields return 422", async () => {
  const response = await handleContact(postRequest({}), ENV, NO_LIMIT);

  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), { ok: false, error: "Please enter a valid name." });
  assert.equal(resendCalls.length, 0);
});

test("invalid email returns 422", async () => {
  const response = await handleContact(
    postRequest({ ...VALID, email: "not-an-email" }),
    ENV,
    NO_LIMIT
  );

  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "Please enter a valid email address.",
  });
});

test("overlong fields return 422", async () => {
  const response = await handleContact(
    postRequest({ ...VALID, name: "x".repeat(121) }),
    ENV,
    NO_LIMIT
  );

  assert.equal(response.status, 422);
  assert.equal(resendCalls.length, 0);
});

test("honeypot returns 200 without calling Resend", async () => {
  const response = await handleContact(
    postRequest({ ...VALID, website: "https://spam.example" }),
    ENV,
    NO_LIMIT
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(resendCalls.length, 0);
});

test("missing API key returns 503", async () => {
  const response = await handleContact(postRequest(VALID), {}, NO_LIMIT);

  assert.equal(response.status, 503);
  assert.equal(resendCalls.length, 0);
});

test("Resend non-OK response returns 502", async () => {
  stubResend(500, "upstream boom");

  const response = await handleContact(postRequest(VALID), ENV, NO_LIMIT);

  assert.equal(response.status, 502);
  assert.equal(resendCalls.length, 1);
});

test("successful send returns 200 and calls Resend correctly", async () => {
  stubResend(200);

  const response = await handleContact(postRequest(VALID), ENV, NO_LIMIT);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(resendCalls.length, 1);
  assert.equal(resendCalls[0].url, "https://api.resend.com/emails");
  assert.equal(resendCalls[0].init.headers.Authorization, "Bearer re_test_key");

  const payload = JSON.parse(resendCalls[0].init.body);
  assert.deepEqual(payload.to, ["antony@ancyatech.com"]);
  assert.equal(payload.reply_to, VALID.email);
  assert.match(payload.subject, /£10k–£20k/);
  assert.match(payload.text, /We need a new website/);
});

test("form-urlencoded submissions still work", async () => {
  stubResend(200);

  const request = new Request(API_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(VALID).toString(),
  });

  const response = await handleContact(request, ENV, NO_LIMIT);

  assert.equal(response.status, 200);
  assert.equal(resendCalls.length, 1);
});

test("Origin mismatch returns 403", async () => {
  const response = await handleContact(
    postRequest(VALID, { headers: { origin: "https://evil.example" } }),
    ENV,
    NO_LIMIT
  );

  assert.equal(response.status, 403);
  assert.equal(resendCalls.length, 0);
});

test("malformed Origin (null) returns 403", async () => {
  const response = await handleContact(
    postRequest(VALID, { headers: { origin: "null" } }),
    ENV,
    NO_LIMIT
  );

  assert.equal(response.status, 403);
});

test("matching Origin is allowed", async () => {
  stubResend(200);

  const response = await handleContact(
    postRequest(VALID, { headers: { origin: ORIGIN } }),
    ENV,
    NO_LIMIT
  );

  assert.equal(response.status, 200);
});

test("oversized body returns 413", async () => {
  const raw = JSON.stringify({ ...VALID, message: "x".repeat(MAX_BODY_BYTES) });

  const response = await handleContact(postRequest(null, { raw }), ENV, NO_LIMIT);

  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), { ok: false, error: "Request body too large" });
  assert.equal(resendCalls.length, 0);
});

test("declared oversized Content-Length returns 413 before reading", async () => {
  const request = postRequest(VALID, { headers: { "content-length": "999999" } });

  const response = await handleContact(request, ENV, NO_LIMIT);

  assert.equal(response.status, 413);
  assert.equal(resendCalls.length, 0);
});

test("per-IP rate limiter returns 429 once the window is exhausted", async () => {
  stubResend(200);
  const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
  const headers = { "cf-connecting-ip": "203.0.113.7" };

  const first = await handleContact(postRequest(VALID, { headers }), ENV, { rateLimiter: limiter });
  const second = await handleContact(postRequest(VALID, { headers }), ENV, { rateLimiter: limiter });

  assert.equal(first.status, 200);
  assert.equal(second.status, 429);
  assert.ok(Number(second.headers.get("retry-after")) > 0);
  // Only the allowed request reached Resend.
  assert.equal(resendCalls.length, 1);
});

test("createRateLimiter resets after the window elapses", () => {
  let now = 1_000;
  const limiter = createRateLimiter({ limit: 1, windowMs: 10_000, now: () => now });

  assert.equal(limiter.check("ip").allowed, true);
  assert.equal(limiter.check("ip").allowed, false);

  now += 10_000;
  assert.equal(limiter.check("ip").allowed, true);
});

test("isSameOrigin allows requests without an Origin header", () => {
  assert.equal(isSameOrigin(new Request(API_URL, { method: "POST" })), true);
  assert.equal(
    isSameOrigin(new Request(API_URL, { method: "POST", headers: { origin: ORIGIN } })),
    true
  );
  assert.equal(
    isSameOrigin(new Request(API_URL, { method: "POST", headers: { origin: "https://other.example" } })),
    false
  );
});

test("validate normalises fields and flags the honeypot", () => {
  const ok = validate({ ...VALID, name: "  Ada   Lovelace " });
  assert.equal(ok.ok, true);
  assert.equal(ok.honeypot, false);
  assert.equal(ok.fields.name, "Ada Lovelace");

  const bot = validate({ ...VALID, website: "spam" });
  assert.equal(bot.ok, true);
  assert.equal(bot.honeypot, true);
});

test("setSecurityHeaders applies baseline headers and optional CSP", () => {
  const withCsp = new Headers();
  setSecurityHeaders(withCsp, true);
  assert.equal(withCsp.get("x-content-type-options"), "nosniff");
  assert.match(withCsp.get("content-security-policy") || "", /default-src 'self'/);

  const withoutCsp = new Headers();
  setSecurityHeaders(withoutCsp, false);
  assert.equal(withoutCsp.get("x-content-type-options"), "nosniff");
  assert.equal(withoutCsp.get("content-security-policy"), null);
});
