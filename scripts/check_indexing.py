#!/usr/bin/env python3
"""Guard the sitemap against accidental indexing changes.

Contract (also documented in .github/workflows/ci.yml):
  * every indexable page in public/ must appear in sitemap.xml;
  * no page carrying <meta name="robots" content="noindex"> may appear;
  * the known drafts (work and the case study) must stay noindex;
  * 404.html is never listed.

Run after `npm run build`.
"""

from __future__ import annotations

import sys
from pathlib import Path
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SITEMAP = PUBLIC / "sitemap.xml"

# Pages intentionally kept out of search results until they have real content.
DRAFTS = {"/work", "/work-foxtail-cafe"}
ALWAYS_EXCLUDED = {"/404"}


def canonical_path(path: str) -> str:
    """Normalise /about.html and /about to the URL Cloudflare serves."""
    if path in ("", "/", "/index.html"):
        return "/"
    return path.removesuffix(".html")


def page_path(html_file: Path) -> str:
    """Return the public URL path for a generated HTML file."""
    rel = html_file.relative_to(PUBLIC).as_posix()
    return canonical_path(f"/{rel}")


def is_noindex(html: str) -> bool:
    lower = html.lower()
    marker = 'name="robots"'
    start = lower.find(marker)
    while start != -1:
        tag_start = lower.rfind("<meta", 0, start)
        tag_end = lower.find(">", start)
        if tag_start != -1 and tag_end != -1 and "noindex" in lower[tag_start:tag_end]:
            return True
        start = lower.find(marker, start + 1)
    return False


def main() -> int:
    if not SITEMAP.exists():
        print("check_indexing: public/sitemap.xml is missing — run `npm run build`.")
        return 1

    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    tree = ElementTree.parse(SITEMAP)
    sitemap_paths = {
        canonical_path(url.text.replace("https://ancyatech.com", ""))
        for url in tree.findall(".//sm:loc", namespace)
        if url.text
    }

    pages = sorted(PUBLIC.rglob("*.html"))
    issues: list[str] = []
    indexable: set[str] = set()
    noindexed: set[str] = set()

    for page in pages:
        path = page_path(page)
        if path in ALWAYS_EXCLUDED:
            continue
        html = page.read_text(encoding="utf-8")
        if is_noindex(html):
            noindexed.add(path)
        else:
            indexable.add(path)

    for path in sorted(indexable - sitemap_paths):
        issues.append(f"indexable page missing from sitemap: {path}")

    for path in sorted(noindexed & sitemap_paths):
        issues.append(f"noindex page listed in sitemap: {path}")

    for draft_path in sorted(DRAFTS):
        if draft_path not in noindexed:
            issues.append(f"draft page is no longer noindex: {draft_path}")

    if issues:
        print("check_indexing: FAILED")
        for issue in issues:
            print(f"  - {issue}")
        return 1

    print(
        f"check_indexing: OK — {len(indexable)} indexable pages, "
        f"{len(noindexed)} noindex pages, {len(sitemap_paths)} sitemap URLs."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
