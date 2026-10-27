# ancyatech.com

The ANCYA studio website. Today this repository is a hand-written static site
(`index.html`, `robots.txt`, `sitemap.xml`) served from GitHub Pages at
[ancyatech.com](https://ancyatech.com). The CI/CD setup is designed so an
Angular frontend and a Node.js or Java backend can be added later without
rewriting any workflow.

## Repository layout

| Path | Purpose |
| --- | --- |
| `index.html`, `robots.txt`, `sitemap.xml` | Current static site |
| `.github/workflows/ci.yml` | Reusable CI: checks, lint, tests, builds |
| `.github/workflows/deploy-pages.yml` | CI → build Pages artifact → deploy |
| `.github/actions/detect/` | Detects which parts of the repo exist |
| `.github/scripts/check-static-site.mjs` | SEO / markup / link checks |
| `.github/rulesets/` | Branch and tag protection rulesets |
| `.github/scripts/apply-rulesets.sh` | Applies the rulesets through `gh` |
| `.github/dependabot.yml` | Weekly dependency updates |

### Planned layout

```
frontend/            Angular application
backend/node/        Node.js API          (either)
backend/java/        Java API (Maven or Gradle) (or)
```

`detect` also recognises an Angular app or backend at the repository root, and
conventional directories such as `server/`, `api/` and `backend/`, so the exact
layout can evolve. Nothing outside the detected parts is built or deployed.

## How the pipeline works

```
pull_request ──► ci.yml ──► Static site checks │ Angular lint/test/build │ Node │ Java
                                                          │
push to main ──► deploy-pages.yml ──► ci.yml ─────────────┘
                       │
                       ├─ stage _site/ (static files or Angular dist/)
                       └─ deploy to GitHub Pages (environment: github-pages)
```

- **CI is shared.** PRs run `ci.yml` directly; `main` runs it as a reusable
  workflow from the deploy pipeline, so a broken build can never be published.
- **Jobs are conditional.** Each check runs only when its part exists; adding
  `frontend/angular.json` turns on the Angular job with no YAML edits.
- **One required check.** `CI Success` aggregates every job and is the only
  status check the ruleset requires, so new jobs do not need rule changes.
- **Deployment is atomic.** The site is built into `_site/`, then uploaded and
  deployed in one Pages deployment. Concurrent deploys queue rather than cancel.

## One-time GitHub setup

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
   This is required — the first deploy fails while Pages still builds from a
   branch. (The custom domain `ancyatech.com` and *Enforce HTTPS* stay as they
   are; the workflow also writes a `CNAME` file into the artifact.)
2. **Apply the repository rulesets:** `./.github/scripts/apply-rulesets.sh`
   (see [Repository rulesets](#repository-rulesets)). They protect `main` and
   the `v*` release tags. Requires `gh auth login` with admin access; the same
   rules can be created by hand under Settings → Rules → Rulesets.
3. Optional: **Settings → Actions → General** keeps workflow permissions at
   *Read repository contents*; each workflow requests only what it needs.
4. Optional: set repository variable `PAGES_CUSTOM_DOMAIN` if the domain ever
   changes. It defaults to `ancyatech.com`.

## Local development

```bash
# Current static site
python3 -m http.server 8080        # then open http://localhost:8080
node .github/scripts/check-static-site.mjs

# Validate workflow YAML before pushing
for f in .github/workflows/*.yml .github/actions/detect/action.yml; do
  ruby -ryaml -e "YAML.load_file('$f')" && echo "OK $f"
done
```

## Repository rulesets

`.github/rulesets/` holds the GitHub rulesets as JSON. Apply them
idempotently — rulesets are matched by name, then updated or created:

```bash
./.github/scripts/apply-rulesets.sh --dry-run   # preview changes
./.github/scripts/apply-rulesets.sh             # apply to the current repo
./.github/scripts/apply-rulesets.sh owner/repo  # explicit target
```

| Ruleset | Applies to | Rules |
| --- | --- | --- |
| `main-protection` | default branch | block deletion and force pushes; require a pull request; require the `CI Success` check with branches up to date; linear history; squash/rebase merges only; resolve review threads |
| `release-tags` | `v*` tags | block deletion, force pushes and retagging |

Notes:

- Admins can bypass through a pull request, not with direct pushes, so the
  owner is never locked out while a red CI run still needs an explicit
  override.
- `required_approving_review_count` is `0` so a solo maintainer can merge
  without self-approval (GitHub does not allow approving your own PR). Raise it
  to `1` in `main-branch.json` when the team grows.
- Only repository-level rulesets are managed; organisation-level rulesets are
  inherited and cannot be changed from this repository.

## Adding the Angular frontend

```bash
npx @angular/cli new ancya --directory frontend --routing --style=scss
```

The pipeline then automatically:

- installs with `npm ci` (lockfile is committed and cached),
- runs `npm run lint`, `npm run test:ci` (falling back to
  `npm test -- --watch=false`) and `npm run build`,
- publishes `dist/<project>/browser` to Pages, copying `robots.txt`,
  `sitemap.xml`, `og-image.png`, etc. from the repository root,
- generates `404.html` from `index.html` so client-side routes resolve, and
- adds `.nojekyll`.

Notes:

- The site is served from the domain root, so the Angular base href stays `/`.
  If the app is ever served from a sub-path, set `--base-href` / `baseHref`.
- Add a `test:ci` script (e.g. `ng test --watch=false --browsers=ChromeHeadless`)
  if the default unit-test runner needs specific CI configuration.
- When the Angular app becomes the production site, the root `index.html` can be
  removed; `detect` then reports `site_mode=angular` and the static job stops
  running. Move `robots.txt`, `sitemap.xml` and images into `frontend/public/`
  so they are produced by the build.

## Adding a backend

Create `backend/node/package.json` or `backend/java/pom.xml` /
`build.gradle(.kts)`; the corresponding job starts running on the next PR. Both
jobs run lint/tests/build and build a container image when a `Dockerfile` is
present.

**GitHub Pages only serves static files.** When the API needs hosting, add a
separate deployment workflow (Fly.io, Render, Cloud Run, AWS, …) that reuses
`ci.yml`, for example:

```yaml
jobs:
  ci:
    uses: ./.github/workflows/ci.yml
  deploy:
    needs: ci
    # push the image built in CI to your registry and release it
```

Keep backend secrets in the repository/Environment settings, never in YAML.

## Conventions

- Node 22 and Java 21 (Temurin) are pinned in `ci.yml` via `NODE_VERSION` /
  `JAVA_VERSION`; bump them there.
- Dependabot groups Angular packages and Actions updates weekly; backend
  manifests are picked up as soon as they exist.
- The static-site checker fails on missing metadata, invalid JSON-LD, broken
  local references, or malformed sitemap entries, and warns on softer SEO
  issues.
