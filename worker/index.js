/**
 * Cloudflare Worker — Ancya contact endpoint.
 *
 * Request flow:
 *   /api/contact
 *     OPTIONS   -> 204, no body (CORS preflight, same-origin only in practice)
 *     !POST     -> 405
 *     POST
 *       1. Origin check        — if an Origin header is present it must match the
 *                                request URL origin, otherwise 403. No Origin is
 *                                allowed (non-browser clients such as curl/Resend).
 *       2. Rate limit          — per-isolate Map keyed by CF-Connecting-IP
 *                                (5 requests / 10 minutes), 429 when exceeded.
 *       3. Content type        — JSON or form data only, otherwise 415.
 *       4. Body size           — Content-Length and the read body are capped at
 *                                32 KB, otherwise 413.
 *       5. Parse + validate    — malformed JSON/form -> 400; field errors -> 422.
 *       6. Honeypot            — non-empty "website" field -> 200 ok, no email sent.
 *       7. Delivery            — Resend API; missing key -> 503, non-OK -> 502.
 *
 *   Anything else is served by the ASSETS binding, falling back to 404.
 *
 * Security headers are added to every response. CSP is only added to HTML/asset
 * responses; JSON API responses omit it.
 *
 * NOTE: The in-isolate rate limiter is a best-effort guard only. Production-grade
 * limiting must also be configured at the edge (Cloudflare WAF rate-limiting rules)
 * because isolates are created/disposed and each has its own Map.
 *
 * TODO(security): Configure Cloudflare WAF rate limiting for POST /api/contact.
 * TODO(security): Add server-side Turnstile verification once the frontend can
 *                 send a token (requires a frontend change).
 */

import { MAX, MAX_BODY_BYTES, RATE_LIMIT } from "./config.js";

const BODY_ENCODER = new TextEncoder();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      return handleContact(request, env);
    }

    if (env.ASSETS) {
      const assetResponse = await env.ASSETS.fetch(request);
      return withSecurityHeaders(assetResponse);
    }

    return withSecurityHeaders(new Response("Not found", { status: 404 }));
  },
};

function json(data, status = 200, extraHeaders = {}) {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  for (const [key, value] of Object.entries(extraHeaders)) {
    headers.set(key, value);
  }
  setSecurityHeaders(headers, false);
  return new Response(JSON.stringify(data), { status, headers });
}

export function setSecurityHeaders(headers, includeCsp = true) {
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("x-frame-options", "DENY");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
  headers.set("strict-transport-security", "max-age=63072000; includeSubDomains; preload");
  if (includeCsp) {
    headers.set(
      "content-security-policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com; media-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
    );
  }
}

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  setSecurityHeaders(headers);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function clean(value) {
  return String(value == null ? "" : value)
    .replace(/\s+/g, " ")
    .trim();
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Simple fixed-window limiter held in module (isolate) memory.
 * Injectable via `handleContact(request, env, { rateLimiter })`; pass
 * `{ rateLimiter: null }` to disable it in tests.
 */
export function createRateLimiter({ limit = RATE_LIMIT.limit, windowMs = RATE_LIMIT.windowMs, now = Date.now } = {}) {
  const buckets = new Map();

  return {
    check(key) {
      const at = now();
      let bucket = buckets.get(key);

      if (!bucket || at - bucket.start >= windowMs) {
        bucket = { start: at, count: 0 };
        buckets.set(key, bucket);
      }

      if (bucket.count >= limit) {
        const retryAfter = Math.max(1, Math.ceil((bucket.start + windowMs - at) / 1000));
        return { allowed: false, retryAfter };
      }

      bucket.count += 1;

      // Opportunistically drop stale keys so the Map cannot grow without bound.
      if (buckets.size > 5000) {
        for (const [entryKey, entry] of buckets) {
          if (at - entry.start >= windowMs) buckets.delete(entryKey);
        }
      }

      return { allowed: true, remaining: limit - bucket.count };
    },
    reset() {
      buckets.clear();
    },
  };
}

const defaultRateLimiter = createRateLimiter();

/**
 * Browser submissions must be same-origin. Requests without an Origin header
 * (curl, server-to-server) are allowed through.
 */
export function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    // "null" (sandboxed iframe) or malformed origins are never same-origin.
    return false;
  }
}

/**
 * Validate and normalise submitted fields.
 * Returns { ok: true, honeypot, fields } or { ok: false, status, error }.
 */
export function validate(data) {
  const source = data && typeof data === "object" ? data : {};

  const fields = {
    name: clean(source.name),
    email: clean(source.email),
    company: clean(source.company),
    budget: clean(source.budget),
    message: clean(source.message).replace(/\r?\n/g, "\n"),
    honeypot: clean(source.website),
  };

  if (fields.honeypot) {
    // Pretend success for bots without sending mail.
    return { ok: true, honeypot: true, fields };
  }

  if (!fields.name || fields.name.length > MAX.name) {
    return { ok: false, status: 422, error: "Please enter a valid name." };
  }
  if (!fields.email || fields.email.length > MAX.email || !validEmail(fields.email)) {
    return { ok: false, status: 422, error: "Please enter a valid email address." };
  }
  if (!fields.message || fields.message.length > MAX.message) {
    return { ok: false, status: 422, error: "Please include project details." };
  }
  if (fields.company.length > MAX.company || fields.budget.length > MAX.budget) {
    return { ok: false, status: 422, error: "Some details are too long." };
  }

  return { ok: true, honeypot: false, fields };
}

export async function handleContact(request, env = {}, options = {}) {
  if (request.method === "OPTIONS") {
    const headers = new Headers({ "cache-control": "no-store" });
    setSecurityHeaders(headers, false);
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405, { allow: "OPTIONS, POST" });
  }

  if (!isSameOrigin(request)) {
    return json({ ok: false, error: "Cross-origin requests are not allowed." }, 403);
  }

  const limiter =
    options && options.rateLimiter !== undefined ? options.rateLimiter : defaultRateLimiter;
  if (limiter) {
    const key = request.headers.get("cf-connecting-ip") || "unknown";
    const limitResult = limiter.check(key);
    if (!limitResult.allowed) {
      return json(
        { ok: false, error: "Too many requests. Please try again later." },
        429,
        { "retry-after": String(limitResult.retryAfter) }
      );
    }
  }

  const contentType = request.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const isForm =
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded");

  if (!isJson && !isForm) {
    return json({ ok: false, error: "Unsupported content type" }, 415);
  }

  // Reject early when the declared size is already too large.
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null) {
    const declaredBytes = Number(declaredLength);
    if (Number.isFinite(declaredBytes) && declaredBytes > MAX_BODY_BYTES) {
      return json({ ok: false, error: "Request body too large" }, 413);
    }
  }

  let raw;
  try {
    raw = await request.text();
  } catch {
    return json({ ok: false, error: "Invalid request body" }, 400);
  }

  // Also enforce the cap for chunked bodies without a Content-Length header.
  if (BODY_ENCODER.encode(raw).byteLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "Request body too large" }, 413);
  }

  let data;
  if (isJson) {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return json({ ok: false, error: "Invalid request body" }, 400);
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return json({ ok: false, error: "Invalid request body" }, 400);
    }
    data = parsed;
  } else {
    try {
      if (contentType.includes("application/x-www-form-urlencoded")) {
        data = Object.fromEntries(new URLSearchParams(raw).entries());
      } else {
        const form = await new Response(raw, { headers: { "content-type": contentType } }).formData();
        data = Object.fromEntries(form.entries());
      }
    } catch {
      return json({ ok: false, error: "Invalid request body" }, 400);
    }
  }

  const validation = validate(data);
  if (!validation.ok) {
    return json({ ok: false, error: validation.error }, validation.status);
  }
  if (validation.honeypot) {
    return json({ ok: true });
  }

  const { name, email, company, budget, message } = validation.fields;

  if (!env.RESEND_API_KEY) {
    return json({ ok: false, error: "Email delivery is not configured yet." }, 503);
  }

  const to = env.RESEND_TO || "antony@ancyatech.com";
  const from = env.RESEND_FROM || "Ancya Enquiry <onboarding@resend.dev>";
  const subject = `New project enquiry${budget ? `: ${budget}` : ""}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : "",
    budget ? `Budget: ${budget}` : "",
    "",
    "Project details:",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject,
        text,
      }),
    });

    if (!resendResponse.ok) {
      const detail = await resendResponse.text();
      console.error("Resend error:", resendResponse.status, detail);
      return json(
        { ok: false, error: "The message could not be sent. Please try again or email us directly." },
        502
      );
    }

    return json({ ok: true });
  } catch (error) {
    console.error("Contact delivery failed:", error && error.message);
    return json(
      { ok: false, error: "The message could not be sent. Please try again or email us directly." },
      502
    );
  }
}
