# ancyatech.com

The ANCYA studio website. Today this repository is a hand-written static site
(`index.html`, `robots.txt`, `sitemap.xml`) deployed to **Cloudflare Workers**
static assets at [ancyatech.com](https://ancyatech.com). The CI/CD setup is
designed so an Angular frontend and a Node.js or Java backend can be added
later without rewriting any workflow.

## Repository layout

| Path | Purpose |
| --- | --- |
| `index.html`, `robots.txt`, `sitemap.xml` | Current static site |
| `wrangler.jsonc` | Worker config: asset directory, custom domains |
| `.github/workflows/ci.yml` | Reusable CI: checks, lint, tests, builds |
| `.github/workflows/deploy-cloudflare.yml` | CI → stage `_site/` → `wrangler deploy` |
| `.github/actions/detect/` | Detects which parts of the repo exist |
| `.github/scripts/stage-site.sh` | Builds the publishable `_site/` directory |
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
push to main ──► deploy-cloudflare.yml ──► ci.yml ────────┘
                        │
                        ├─ stage _site/ (static files or Angular dist/)
                        └─ wrangler deploy → Worker "ancyatech" + custom domains
```

- **CI is shared.** PRs run `ci.yml` directly; `main` runs it as a reusable
  workflow from the deploy pipeline, so a broken build can never be published.
- **Jobs are conditional.** Each check runs only when its part exists; adding
  `frontend/angular.json` turns on the Angular job with no YAML edits.
- **One required check.** `CI Success` aggregates every job and is the only
  status check the ruleset requires, so new jobs do not need rule changes.
- **Static assets are free.** Cloudflare does not bill requests that serve
  files from the assets directory, and bandwidth is unlimited on every plan.
- **Deployment is atomic.** The site is staged into `_site/`, then a single
  `wrangler deploy` uploads it. Concurrent deploys queue rather than cancel.

## One-time setup

1. **Cloudflare API token** — dashboard → My Profile → API Tokens → Create
   Token. Scoped to the `ancyatech.com` zone with:
   *Account → Workers Scripts: Edit*, *Zone → Workers Routes: Edit*,
   *Zone → Zone: Read*, *Zone → DNS: Edit*.
2. **GitHub repository secrets** — Settings → Secrets and variables → Actions:
   - `CLOUDFLARE_API_TOKEN` — the token from step 1
   - `CLOUDFLARE_ACCOUNT_ID` — dashboard sidebar, or `npx wrangler whoami`
3. **DNS** — delete the old GitHub Pages records (see below). Custom domains
   cannot be attached while conflicting records exist.
4. **Decommission GitHub Pages** — Settings → Pages: remove the custom domain
   and/or set the source to *None*. Otherwise GitHub keeps reporting
   `NotServedByPagesError`.
5. **Apply the repository rulesets:** `./.github/scripts/apply-rulesets.sh`
   (see [Repository rulesets](#repository-rulesets)). Requires `gh auth login`
   with admin access.

## DNS and custom domains

`wrangler.jsonc` declares both hostnames as Worker custom domains:

```jsonc
"routes": [
  { "pattern": "ancyatech.com",     "custom_domain": true },
  { "pattern": "www.ancyatech.com", "custom_domain": true }
]
```

On the first `wrangler deploy`, Cloudflare **creates the DNS records and issues
the certificates automatically**. There are no A records to add by hand — in
fact Workers do not use static IPs.

Before that first deploy, in **Cloudflare → DNS → Records** for `ancyatech.com`:

- Delete the four GitHub Pages `A` records on `@` (`185.199.108–111.153`).
- Delete any `AAAA` on `@`, any `CNAME` on `www`, and leftovers from the old
  Worker (`*.workers.dev` targets).
- Leave `MX`, `TXT` and unrelated subdomains alone.

Then push to `main`. The deploy attaches both hostnames and they resolve to
Cloudflare (proxied) — this is expected. The DNS records Cloudflare creates are
**managed**; don't edit them manually afterwards.

To redirect `www` to the apex, add a **Redirect Rule** (Rules → Redirect
Rules) from `www.ancyatech.com/*` to `https://ancyatech.com/$1`, 301. The page
already declares `https://ancyatech.com/` as canonical, so both hostnames
serving the same content is also acceptable.

Verify with:

```bash
dig +short ancyatech.com
dig +short www.ancyatech.com
```

Cloudflare `104.x`/`172.67.x` addresses are correct here — unlike GitHub Pages,
Cloudflare is *supposed* to be proxied.

If you ever go back to GitHub Pages, the reverse applies: four A records to
`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`,
`www` CNAME to `<user>.github.io`, all **DNS only** (grey cloud).

## Local development

```bash
# Preview exactly what will be deployed
SITE_MODE=static ./.github/scripts/stage-site.sh
npx wrangler@4 dev              # serves _site/ per wrangler.jsonc

# Checks run by CI
node .github/scripts/check-static-site.mjs

# Validate workflow YAML before pushing
for f in .github/workflows/*.yml .github/actions/detect/action.yml; do
  ruby -ryaml -e "YAML.load_file('$f')" && echo "OK $f"
done
```

`npx wrangler dev` requires authentication only for remote resources; local
static preview works against the `_site/` directory.

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
- stages `dist/<project>/browser` into `_site/`, copying `robots.txt`,
  `sitemap.xml`, `og-image.png`, etc. from the repository root, and
- deploys through the same Worker.

Notes:

- `not_found_handling` is `single-page-application`, so Angular client-side
  routes resolve to `index.html`. For strict 404s, switch it to `404-page` and
  stage a `404.html`.
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

**The Worker only serves static assets.** A Node or Java API needs its own
host (Fly.io, Render, Cloud Run, AWS, …). Reuse `ci.yml` in that deployment
workflow:

```yaml
jobs:
  ci:
    uses: ./.github/workflows/ci.yml
  deploy:
    needs: ci
    # push the image built in CI to your registry and release it
```

Keep backend secrets in the repository/Environment settings, never in YAML.
Cloudflare Workers can host light JavaScript/TypeScript APIs, but not a full
Node process or a JVM.

## Conventions

- Node 22 and Java 21 (Temurin) are pinned in `ci.yml` via `NODE_VERSION` /
  `JAVA_VERSION`; bump them there.
- Dependabot groups Angular packages and Actions updates weekly; backend
  manifests are picked up as soon as they exist.
- The static-site checker fails on missing metadata, invalid JSON-LD, broken
  local references, or malformed sitemap entries, and warns on softer SEO
  issues.
- `_site/` and `.wrangler/` are build artifacts and are git-ignored.
