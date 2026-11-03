#!/usr/bin/env python3
"""Verify that every local href/src in the site and docs resolves.

Root-relative paths (starting with /) are resolved against public/.
External URLs, mail links and anchors are ignored.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
FILES = sorted(PUBLIC.rglob("*.html")) + sorted((ROOT / "docs").rglob("*.html"))

LINK_RE = re.compile(r'(?:href|src)="([^"]+)"')
SKIP = ("http://", "https://", "mailto:", "tel:", "data:", "//", "#")

missing = []
for file in FILES:
    text = file.read_text(encoding="utf-8", errors="ignore")
    for match in LINK_RE.finditer(text):
        url = match.group(1)
        if url.startswith(SKIP):
            continue
        target_path = url.split("#")[0].split("?")[0]
        if not target_path:
            continue
        if target_path.startswith("/"):
            target = PUBLIC / target_path.lstrip("/")
        else:
            target = file.parent / target_path
        if not target.exists():
            missing.append((file.relative_to(ROOT), url))

if missing:
    print("Broken local links:")
    for file, url in missing:
        print(f"  {file}: {url}")
    sys.exit(1)

print(f"Checked {len(FILES)} HTML files — all local links resolve.")
