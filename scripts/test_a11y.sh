#!/usr/bin/env bash
# Run an axe-core accessibility audit against the local static preview.
set -euo pipefail

# axe ships its own chromedriver, which may not match the installed Chrome.
# The root chromedriver devDependency tracks the current Chrome release.
CHROMEDRIVER="$(node -p "require('chromedriver').path")"

echo "Starting local static preview..."
python3 -m http.server 8080 --directory public > "${TMPDIR:-/tmp}/ancya-a11y-server.log" 2>&1 &
SERVER_PID=$!
trap "kill $SERVER_PID 2>/dev/null || true" EXIT
sleep 2

# Path, page label pairs
paths=("" "/about.html" "/work.html" "/work-foxtail-cafe.html" "/journal.html" "/journal-website-cost.html" "/services-web-design.html" "/privacy-policy.html" "/terms-of-service.html" "/cookie-policy.html" "/404.html")

for path in "${paths[@]}"; do
  echo
  echo "=== Accessibility audit: http://127.0.0.1:8080$path ==="
  npx axe "http://127.0.0.1:8080$path" --tags wcag2a,wcag2aa,wcag21aa --chromedriver-path "$CHROMEDRIVER"
done
