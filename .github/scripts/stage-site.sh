#!/usr/bin/env bash
#
# Stage the publishable site into _site/ for Cloudflare Workers static assets.
# Run from the repository root.
#
#   SITE_MODE=static ./.github/scripts/stage-site.sh
#   SITE_MODE=angular BUILD_DIR=_build ./.github/scripts/stage-site.sh
#
# Environment:
#   SITE_MODE  "static" (hand-written site) or "angular" (built app)
#   BUILD_DIR  directory holding the Angular dist artifact (default: _build)
#   OUT_DIR    output directory (default: _site)
set -euo pipefail

site_mode="${SITE_MODE:-static}"
build_dir="${BUILD_DIR:-_build}"
out_dir="${OUT_DIR:-_site}"

copy_root_files() {
  for f in robots.txt sitemap.xml og-image.png logo.png favicon.ico favicon.svg; do
    if [ -f "$f" ]; then cp "$f" "$out_dir/"; fi
  done
}

rm -rf "$out_dir"
mkdir -p "$out_dir"

case "$site_mode" in
  angular)
    # Angular emits dist/<project>/browser in v17+. Fall back to the directory
    # that actually contains index.html for other layouts.
    src="$(find "$build_dir" -maxdepth 3 -type d -name browser -print -quit || true)"
    if [ -z "$src" ]; then
      index_file="$(find "$build_dir" -maxdepth 5 -type f -name index.html -print -quit || true)"
      if [ -n "$index_file" ]; then
        src="$(dirname "$index_file")"
      fi
    fi
    case "$src" in
      "$build_dir"/*) ;;
      *) echo "::error::Angular build output not found under $build_dir." >&2; exit 1 ;;
    esac
    if [ ! -d "$src" ]; then
      echo "::error::Could not locate the Angular build output under $build_dir." >&2
      exit 1
    fi
    echo "Using Angular output: $src"
    cp -R "$src"/. "$out_dir"/
    copy_root_files
    ;;
  static)
    rsync -a \
      --exclude='.git' \
      --exclude='.github' \
      --exclude='.claude' \
      --exclude='.wrangler' \
      --exclude='node_modules' \
      --exclude='frontend' \
      --exclude='backend' \
      --exclude="$build_dir" \
      --exclude="$out_dir" \
      --exclude='dist' \
      --exclude='*.md' \
      --exclude='.gitignore' \
      --exclude='wrangler.*' \
      ./ "$out_dir"/
    ;;
  *)
    echo "error: SITE_MODE must be 'static' or 'angular' (got '$site_mode')" >&2
    exit 1
    ;;
esac

if [ ! -f "$out_dir/index.html" ]; then
  echo "::error::Staged site has no index.html (site mode: $site_mode)." >&2
  exit 1
fi

commit="${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || echo unknown)}"
ref="${GITHUB_REF_NAME:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)}"
run_id="${GITHUB_RUN_ID:-local}"

COMMIT="$commit" REF="$ref" RUN_ID="$run_id" SITE_MODE="$site_mode" OUT_DIR="$out_dir" \
  node -e '
    const fs = require("node:fs");
    fs.writeFileSync(`${process.env.OUT_DIR}/version.json`, JSON.stringify({
      commit: process.env.COMMIT,
      ref: process.env.REF,
      runId: process.env.RUN_ID,
      deployedAt: new Date().toISOString(),
      siteMode: process.env.SITE_MODE
    }, null, 2) + "\n");
  '

echo "Staged $(du -sh "$out_dir" | cut -f1) into $out_dir"
