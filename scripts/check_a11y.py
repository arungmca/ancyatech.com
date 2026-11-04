"""Browserless accessibility invariants for the static site.

This deliberately checks rules that can be enforced at markup level. Full WCAG
audits still require axe in a real browser; see npm run test:a11y.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
FILES = sorted(PUBLIC.rglob("*.html"))

errors = []
for file in FILES:
    text = file.read_text(encoding="utf-8", errors="ignore")
    path = file.relative_to(ROOT)

    if '<html lang=' not in text:
        errors.append(f"{path}: missing lang attribute")
    if text.count("<h1") != 1:
        errors.append(f"{path}: expected exactly one H1, found {text.count('<h1')}")
    if 'id="main"' not in text or 'tabindex="-1"' not in text:
        errors.append(f"{path}: #main target is missing")
    if 'class="skip-link"' not in text:
        errors.append(f"{path}: missing skip link")
    if 'href="#main"' not in text:
        errors.append(f"{path}: skip link target is missing")

    for match in re.finditer(r'<img\b[^>]*>', text):
        if 'alt=' not in match.group(0):
            errors.append(f"{path}: image without alt text")

    for match in re.finditer(r'<button\b[^>]*>', text):
        tag = match.group(0)
        content = text[match.end():match.end() + 120]
        if 'aria-label=' not in tag and not re.search(r'[A-Za-z0-9]', content[:40]):
            errors.append(f"{path}: button without accessible name")

if errors:
    print("Accessibility issues:")
    for error in errors:
        print(f"  {error}")
    sys.exit(1)

print(f"Checked {len(FILES)} HTML files - structural accessibility passes.")
