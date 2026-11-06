/**
 * HTML email templates for the Ancya Technologies contact form notification.
 *
 * Each renderer takes the validated contact fields and returns a complete
 * HTML document. User input is escaped to prevent HTML injection.
 */

const MAX_VARIANT = 4;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function baseParagraphs({ name, email, company, budget, message }) {
  return {
    name: escapeHtml(name),
    email: escapeHtml(email),
    company: escapeHtml(company),
    budget: escapeHtml(budget),
    message: escapeHtml(message).replace(/\n/g, "<br>"),
  };
}

export function renderContactEmail(fields, variant = 1) {
  const n = Number.isFinite(Number(variant)) ? Math.min(MAX_VARIANT, Math.max(1, Number(variant))) : 1;
  const data = baseParagraphs(fields);

  switch (n) {
    case 2:
      return templateBranded(data);
    case 3:
      return templateSummary(data);
    case 4:
      return templateAction(data);
    case 1:
    default:
      return templateMinimal(data);
  }
}

function templateMinimal({ name, email, company, budget, message }) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;font-family:'Plus Jakarta Sans',Arial,sans-serif;background:#f7f5f0;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:32px;">
          <tr><td>
            <h1 style="margin:0 0 4px;font-size:22px;">New project enquiry</h1>
            <p style="margin:0 0 20px;color:#666;font-size:13px;">From the Ancya Technologies contact form</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <tr><td style="padding:6px 0;color:#888;width:90px;">Name</td><td style="padding:6px 0;font-weight:600;">${name}</td></tr>
              <tr><td style="padding:6px 0;color:#888;">Email</td><td style="padding:6px 0;"><a href="mailto:${email}" style="color:#ff5a36;">${email}</a></td></tr>
              ${company ? `<tr><td style="padding:6px 0;color:#888;">Company</td><td style="padding:6px 0;">${company}</td></tr>` : ""}
              ${budget ? `<tr><td style="padding:6px 0;color:#888;">Budget</td><td style="padding:6px 0;">${budget}</td></tr>` : ""}
            </table>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
            <p style="margin:0 0 6px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Project details</p>
            <p style="margin:0;font-size:14px;">${message}</p>
            <p style="margin-top:24px;"><a href="mailto:${email}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#ff5a36;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">Reply to ${name}</a></p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function templateBranded({ name, email, company, budget, message }) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;font-family:'Plus Jakarta Sans',Arial,sans-serif;background:#0b132b;color:#ffffff;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;color:#1a1a1a;">
          <tr><td style="background:#0b132b;color:#ffffff;padding:24px;">
            <p style="margin:0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;opacity:.7;">Ancya Technologies Enquiry Desk</p>
            <h1 style="margin:8px 0 0;font-size:22px;">New project enquiry</h1>
          </td></tr>
          <tr><td style="padding:24px;">
            ${budget ? `<div style="background:#fff5f1;border:1px solid #ffd6cb;border-radius:10px;padding:14px;margin-bottom:16px;"><p style="margin:0;font-size:13px;font-weight:600;color:#b4421f;">Budget: ${budget}</p></div>` : ""}
            <p style="margin:0 0 4px;font-size:15px;font-weight:600;">${name}</p>
            ${company ? `<p style="margin:0 0 4px;font-size:14px;color:#666;">${company}</p>` : ""}
            <p style="margin:0 0 18px;font-size:14px;"><a href="mailto:${email}" style="color:#ff5a36;">${email}</a></p>
            <p style="margin:0 0 6px;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Message</p>
            <p style="margin:0 0 18px;font-size:14px;">${message}</p>
            <a href="mailto:${email}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#ff5a36;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">Reply now</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function templateSummary({ name, email, company, budget, message }) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;font-family:'Plus Jakarta Sans',Arial,sans-serif;background:#f7f5f0;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:24px;">
          <tr><td>
            <p style="margin:0 0 6px;color:#888;font-size:12px;">New enquiry · Ancya Technologies website</p>
            <h1 style="margin:0 0 18px;font-size:20px;">${name}${company ? ` — ${company}` : ""}</h1>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse;">
              <tr><td style="padding:10px 0;border-top:1px solid #eee;color:#666;width:110px;">Name</td><td style="padding:10px 0;border-top:1px solid #eee;font-weight:600;">${name}</td></tr>
              <tr><td style="padding:10px 0;border-top:1px solid #eee;color:#666;">Email</td><td style="padding:10px 0;border-top:1px solid #eee;"><a href="mailto:${email}" style="color:#ff5a36;">${email}</a></td></tr>
              ${company ? `<tr><td style="padding:10px 0;border-top:1px solid #eee;color:#666;">Company</td><td style="padding:10px 0;border-top:1px solid #eee;">${company}</td></tr>` : ""}
              ${budget ? `<tr><td style="padding:10px 0;border-top:1px solid #eee;color:#666;">Budget</td><td style="padding:10px 0;border-top:1px solid #eee;font-weight:600;color:#0b519c;">${budget}</td></tr>` : ""}
              <tr><td style="padding:10px 0;border-top:1px solid #eee;color:#666;vertical-align:top;">Details</td><td style="padding:10px 0;border-top:1px solid #eee;">${message}</td></tr>
            </table>
            <p style="margin-top:18px;font-size:12px;color:#888;">Reply directly to this email to reach ${name}.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function templateAction({ name, email, company, budget, message }) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;font-family:'Plus Jakarta Sans',Arial,sans-serif;background:#f7f5f0;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:24px;">
          <tr><td>
            <h1 style="margin:0 0 4px;font-size:20px;">Action required: new enquiry</h1>
            <p style="margin:0 0 18px;color:#666;font-size:13px;">Reply within 1 business day for best results.</p>
            <div style="margin-bottom:18px;">
              <a href="mailto:${email}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#ff5a36;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;margin-right:8px;">Reply now</a>
              <a href="mailto:${email}?subject=Project%20brief" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#f1f1f1;color:#1a1a1a;text-decoration:none;font-weight:600;font-size:14px;">Request full brief</a>
            </div>
            <div style="background:#f7f5f0;border-radius:10px;padding:16px;font-size:14px;">
              <strong>${name}</strong>${company ? ` · ${company}` : ""}<br>
              ${email}<br>
              ${budget ? `Budget: ${budget}<br>` : ""}
              <hr style="border:none;border-top:1px solid #e2e2e2;margin:12px 0;">
              ${message}
            </div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
