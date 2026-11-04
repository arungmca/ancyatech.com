// Cloudflare Worker for the Ancya contact form.
// Static assets are served by the ASSETS binding; this Worker only handles /api/contact.
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

const MAX = { name: 120, email: 254, company: 160, budget: 80, message: 5000 };

function json(data, status = 200) {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  setSecurityHeaders(headers, false);
  return new Response(JSON.stringify(data), { status, headers });
}

function setSecurityHeaders(headers, includeCsp = true) {
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("x-frame-options", "DENY");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
  headers.set("strict-transport-security", "max-age=63072000; includeSubDomains; preload");
  if (includeCsp) {
    headers.set(
      "content-security-policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com; media-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests"
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

async function handleContact(request, env) {
  if (request.method === "OPTIONS") {
    return json({ ok: true }, 204);
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  let data = {};
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid request body" }, 400);
    }
  } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData();
    data = Object.fromEntries(form.entries());
  } else {
    return json({ ok: false, error: "Unsupported content type" }, 415);
  }

  const name = clean(data.name);
  const email = clean(data.email);
  const company = clean(data.company);
  const budget = clean(data.budget);
  const message = clean(data.message).replace(/\r?\n/g, "\n");
  const honeypot = clean(data.website);

  if (honeypot) {
    // Pretend success for bots without sending mail.
    return json({ ok: true });
  }

  if (!name || name.length > MAX.name) {
    return json({ ok: false, error: "Please enter a valid name." }, 422);
  }
  if (!email || email.length > MAX.email || !validEmail(email)) {
    return json({ ok: false, error: "Please enter a valid email address." }, 422);
  }
  if (!message || message.length > MAX.message) {
    return json({ ok: false, error: "Please include project details." }, 422);
  }
  if (company.length > MAX.company || budget.length > MAX.budget) {
    return json({ ok: false, error: "Some details are too long." }, 422);
  }

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
      return json({ ok: false, error: "The message could not be sent. Please try again or email us directly." }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    console.error("Contact delivery failed:", error && error.message);
    return json({ ok: false, error: "The message could not be sent. Please try again or email us directly." }, 502);
  }
}
