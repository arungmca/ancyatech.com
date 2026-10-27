#!/usr/bin/env bash
#
# Apply the repository rulesets in .github/rulesets/ to a GitHub repository.
#
#   .github/scripts/apply-rulesets.sh [OWNER/REPO] [--dry-run]
#
# Idempotent: rulesets are matched by name, then updated in place or created.
# Requires the GitHub CLI authenticated with admin access to the repository
# (`gh auth login`). The default GITHUB_TOKEN cannot manage rulesets.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: .github/scripts/apply-rulesets.sh [OWNER/REPO] [--dry-run]

  OWNER/REPO  Target repository. Defaults to the repository of the current
              directory (gh repo view).
  --dry-run   Print what would change without calling the API.
EOF
}

dry_run=0
repo=""
for arg in "$@"; do
  case "$arg" in
    --dry-run) dry_run=1 ;;
    -h|--help) usage; exit 0 ;;
    -*) echo "error: unknown option $arg" >&2; usage >&2; exit 2 ;;
    *) repo="$arg" ;;
  esac
done

for bin in gh jq; do
  command -v "$bin" >/dev/null 2>&1 || {
    echo "error: '$bin' is required but not installed." >&2
    exit 1
  }
done

if ! gh auth status >/dev/null 2>&1; then
  echo "error: not authenticated. Run 'gh auth login' with admin access to the repository." >&2
  exit 1
fi

if [ -z "$repo" ]; then
  repo="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
rules_dir="$(cd "$script_dir/../rulesets" && pwd)"

shopt -s nullglob
files=("$rules_dir"/*.json)
shopt -u nullglob

if [ "${#files[@]}" -eq 0 ]; then
  echo "error: no ruleset files found in $rules_dir" >&2
  exit 1
fi

# Repository-level rulesets only; org-level ones are inherited and must be
# edited in the organisation settings.
existing="$(gh api "repos/$repo/rulesets" --paginate \
  --jq '.[] | select(.source_type == "Repository") | "\(.name)\t\(.id)"')"

for file in "${files[@]}"; do
  if ! jq -e . "$file" >/dev/null 2>&1; then
    echo "error: $file is not valid JSON" >&2
    exit 1
  fi
  name="$(jq -r '.name // empty' "$file")"
  if [ -z "$name" ]; then
    echo "error: $file has no \"name\" field" >&2
    exit 1
  fi
  id="$(printf '%s\n' "$existing" | awk -F'\t' -v want="$name" '$1 == want { print $2; exit }')"

  if [ "$dry_run" -eq 1 ]; then
    if [ -n "$id" ]; then
      echo "[dry-run] would update ruleset \"$name\" (id $id)"
    else
      echo "[dry-run] would create ruleset \"$name\""
    fi
    continue
  fi

  if [ -n "$id" ]; then
    echo "Updating ruleset \"$name\" (id $id)"
    gh api --method PUT "repos/$repo/rulesets/$id" --input "$file" >/dev/null
  else
    echo "Creating ruleset \"$name\""
    new_id="$(gh api --method POST "repos/$repo/rulesets" --input "$file" --jq '.id')"
    echo "  created with id $new_id"
  fi
done

if [ "$dry_run" -eq 0 ]; then
  echo
  echo "Rulesets now configured for $repo:"
  gh api "repos/$repo/rulesets" --jq '.[] | "  - \(.name) [target: \(.target)] [\(.enforcement)]"'
fi
