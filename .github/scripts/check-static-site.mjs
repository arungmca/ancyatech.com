#!/usr/bin/env node
/**
 * Structural checks for the hand-written static site. Runs in CI before the
 * site is published. Exits non-zero on errors; warnings are informative only.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const errors = [];
const warnings = [];

const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

function read(path) {
  if (!existsSync(path)) {
    fail(`missing file: ${path}`);
    return null;
  }
  return readFileSync(path, 'utf8');
}

const html = read('index.html');
const robots = read('robots.txt');
const sitemap = read('sitemap.xml');

if (html) {
  if (statSync('index.html').size < 1024) {
    warn('index.html is under 1 KB — is that intentional?');
  }

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!title || !title[1].trim()) fail('index.html: missing or empty <title>');
  else if (title[1].trim().length > 70) {
    warn(`index.html: <title> is ${title[1].trim().length} characters, likely truncated in search results`);
  }

  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) {
    fail('index.html: missing viewport meta tag');
  }
  if (!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+/i.test(html)) {
    warn('index.html: missing meta description');
  }
  if (!/<link[^>]+rel=["']canonical["']/i.test(html)) {
    warn('index.html: missing canonical link');
  }
  const lang = html.match(/<html[^>]+lang=["']([^"']+)["']/i);
  if (!lang) warn('index.html: <html> has no lang attribute');

  // Inline JSON-LD must be valid JSON.
  const ldBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (ldBlocks.length === 0) warn('index.html: no JSON-LD structured data found');
  ldBlocks.forEach(([, body], i) => {
    try {
      JSON.parse(body);
    } catch (err) {
      fail(`index.html: JSON-LD block #${i + 1} is not valid JSON (${err.message})`);
    }
  });

  // Every local reference must resolve on disk.
  const refs = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)].map((m) => m[1]);
  const localRefs = new Set(
    refs.filter(
      (ref) =>
        ref &&
        !ref.startsWith('#') &&
        !ref.startsWith('//') &&
        !/^(?:[a-z][a-z0-9+.-]*:)/i.test(ref),
    ),
  );
  for (const ref of localRefs) {
    const clean = decodeURIComponent(ref.split('#')[0].split('?')[0]);
    if (!clean) continue;
    const target = resolve(clean.startsWith('/') ? `.${clean}` : dirname('index.html'), clean);
    if (!existsSync(target)) fail(`index.html: broken local reference "${ref}"`);
  }
}

if (robots) {
  if (!/^\s*User-agent:/im.test(robots)) fail('robots.txt: missing User-agent directive');
  const sitemapDirective = robots.match(/^\s*Sitemap:\s*(\S+)/im);
  if (!sitemapDirective) warn('robots.txt: no Sitemap directive');
  if (!/^\s*Allow:\s*\//im.test(robots) && !/^\s*Disallow:\s*$/im.test(robots)) {
    warn('robots.txt: does not explicitly allow crawling');
  }
}

if (sitemap) {
  if (!/<urlset[\s>]/i.test(sitemap)) fail('sitemap.xml: missing <urlset> root element');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
  if (locs.length === 0) fail('sitemap.xml: no <loc> entries');
  for (const loc of locs) {
    if (!/^https:\/\//i.test(loc)) fail(`sitemap.xml: entry is not an absolute https URL: ${loc}`);
  }
  for (const [, lastmod] of sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/gi)) {
    if (Number.isNaN(Date.parse(lastmod))) fail(`sitemap.xml: invalid <lastmod> date: ${lastmod}`);
  }
  const home = locs.find((loc) => {
    try {
      return new URL(loc).pathname === '/';
    } catch {
      return false;
    }
  });
  if (home) {
    const host = new URL(home).host;
    const canonical = html?.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
    let canonicalHost = null;
    try {
      canonicalHost = canonical ? new URL(canonical[1]).host : null;
    } catch {
      warn('canonical link is not an absolute URL');
    }
    if (canonicalHost && canonicalHost !== host) {
      warn(`canonical host (${canonicalHost}) differs from sitemap host (${host})`);
    }
    if (robots && !robots.includes(host)) {
      warn(`robots.txt does not reference the sitemap host ${host}`);
    }
  }
}

for (const warning of warnings) console.log(`::warning::${warning}`);
for (const error of errors) console.log(`::error::${error}`);

if (errors.length > 0) {
  console.error(`\nStatic site checks failed with ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`Static site checks passed (${warnings.length} warning(s)).`);
