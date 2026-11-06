#!/usr/bin/env python3
"""Verify the favicon setup Google Search needs.

Google discovers a site's favicon either at /favicon.ico (the root path it
probes first) or through <link rel="icon"> tags on the home page, and recommends
a source larger than 48x48 px (multiples of 48: 96, 144, 192...). A missing or
too-small icon is what makes results show the generic globe.

Runs against the built site so regressions fail CI before deploy.
"""
import re
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
HOME = PUBLIC / "index.html"
ROOT_ICON = PUBLIC / "favicon.ico"

LINK_RE = re.compile(r"<link\b[^>]*\brel=\"icon\"[^>]*>", re.IGNORECASE)
ATTR_RE = re.compile(r"([a-zA-Z:-]+)=\"([^\"]*)\"")
SIZE_RE = re.compile(r"(\d+)x(\d+)", re.IGNORECASE)

MIN_ROOT_ICO = 48
MIN_SEARCH_ICON = 96

errors = []


def read_ico_sizes(path):
    """Return the (width, height) sizes stored in an .ico file."""
    data = path.read_bytes()
    if len(data) < 6:
        raise ValueError("file is too short to be an ICO")
    reserved, kind, count = struct.unpack("<HHH", data[:6])
    if reserved != 0 or kind != 1 or count == 0:
        raise ValueError("not a valid ICO file (bad header)")
    sizes = []
    for index in range(count):
        offset = 6 + index * 16
        if offset + 16 > len(data):
            raise ValueError("truncated ICO directory")
        width, height = data[offset], data[offset + 1]
        sizes.append((width or 256, height or 256))
    return sizes


def main():
    if not HOME.exists():
        print(f"Missing build output: {HOME.relative_to(ROOT)} (run `npm run build`).")
        return 1

    # 1. Google probes /favicon.ico first; it must exist and be a real icon.
    if not ROOT_ICON.exists():
        errors.append("public/favicon.ico is missing (root favicon returns 404).")
    else:
        try:
            sizes = read_ico_sizes(ROOT_ICON)
        except ValueError as exc:
            errors.append(f"public/favicon.ico is invalid: {exc}")
        else:
            largest = max(max(w, h) for w, h in sizes)
            if largest < MIN_ROOT_ICO:
                errors.append(
                    f"public/favicon.ico largest image is {largest}px; "
                    f"expected at least {MIN_ROOT_ICO}px."
                )

    # 2. The home page must declare the icons with crawlable, existing files.
    html = HOME.read_text(encoding="utf-8", errors="ignore")
    tags = LINK_RE.findall(html)
    declared_sizes = []
    root_icon_linked = False

    for tag in tags:
        attrs = {key.lower(): value for key, value in ATTR_RE.findall(tag)}
        href = attrs.get("href", "")
        if not href:
            continue
        if href == "/favicon.ico":
            root_icon_linked = True
        for width, height in SIZE_RE.findall(attrs.get("sizes", "")):
            declared_sizes.append((int(width), int(height)))

        target = href.split("?")[0].split("#")[0]
        if target.startswith("/"):
            target = PUBLIC / target.lstrip("/")
        else:
            target = HOME.parent / target
        if not target.exists():
            errors.append(f'Home page references a missing icon: {href}')

    if not root_icon_linked:
        errors.append('Home page does not link the root icon (<link rel="icon" href="/favicon.ico">).')

    largest_declared = max((max(w, h) for w, h in declared_sizes), default=0)
    if largest_declared < MIN_SEARCH_ICON:
        errors.append(
            f"Largest declared icon is {largest_declared}px; Google recommends "
            f"a source larger than 48x48 — declare at least {MIN_SEARCH_ICON}x{MIN_SEARCH_ICON}."
        )

    # 3. robots.txt must not block the favicon (Googlebot-Image crawls it).
    robots = PUBLIC / "robots.txt"
    if robots.exists():
        for line in robots.read_text(encoding="utf-8", errors="ignore").splitlines():
            if re.match(r"\s*Disallow:\s*/assets", line, re.IGNORECASE) or re.match(
                r"\s*Disallow:\s*/\s*$", line, re.IGNORECASE
            ):
                errors.append(f"robots.txt blocks the favicon: {line.strip()}")

    if errors:
        print("Favicon check failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print(
        "Favicon check passed: /favicon.ico is valid and the home page "
        f"declares icons up to {largest_declared}px."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
