# Phase 2 — pointing artifact.com at the Cloudflare site

**Date:** 2026-07-27
**Repos:** `arfct/catalogue-artifact`, `arfct/web`, plus Cloudflare and Netlify config
**Status:** deferred — do not start until the content phase is settled
**Depends on:** [the pages spec](2026-07-27-catalogue-pages-design.md) and
[Artifact's pages](2026-07-27-artifact-contribute-page-design.md)

## Why this is a separate, later phase

The current phase is about working out content, and it carries no production risk:
`artifact.com` keeps serving the existing one-page Vite site from Netlify while the new
site develops at `catalogue-artifact.pages.dev`. This document exists so the cutover
items aren't rediscovered later. It is a **checklist with real gotchas**, not a
migration — there is nothing stateful to move.

## Current topology

| Host | Serves |
|---|---|
| Netlify (`artifact-site`, id `e4d0be06-0c82-4b4d-b7ca-1d87da759b95`, team `625afee9…`) | `artifact.com` — the `arfct/web` Vite site |
| Google Sites (`ghs.googlehosted.com`) | `site.artifact.com` — the Support and Privacy pages |
| Cloudflare Pages + R2 (`catalogue-artifact`) | `catalogue-artifact.pages.dev` — the new site |

DNS for `artifact.com` is already on Cloudflare nameservers (`ed`/`eva.ns.cloudflare.com`)
while A records point at Netlify. So the cutover is a records change Cloudflare manages
itself, and rollback is repointing at Netlify.

Netlify has **no Forms enabled**, and the Netlify API exposes no functions or env vars
for this project. **Confirm build command, publish directory, and any custom redirects
or headers in the Netlify UI before cutover** — the API does not expose them, so this is
the one thing that must be checked by hand rather than assumed.

## Ordered checklist

1. ~~**Give R2 a custom domain.**~~ **Done 2026-07-29.** Media was served from a
   `pub-*.r2.dev` URL, which Cloudflare rate-limits and does not support for production
   traffic. It now serves from `https://media.artifact.com`, a custom domain on the
   `catalogue-artifact` bucket, and `cloudflare.r2_media_base_url` points at it.
   Verified: all 8 distinct media URLs return 200 on the new host, and no `r2.dev`
   reference remains anywhere in the built output.

   Remaining hygiene: **disable the bucket's public `r2.dev` URL** in the R2 dashboard,
   so there is exactly one way media is served and nothing can silently fall back to the
   throttled host. This is a dashboard action and does not affect the site.
2. **Set `url:` to `https://artifact.com`** in `catalogue.config.yml`. It feeds
   `absoluteMediaUrl`, which builds `og:image`. Miss it and social previews break while
   the site otherwise looks fine.
3. **Enable Cloudflare Pages git integration** so pushes to `main` build and deploy.
   AGENTS.md currently states push-to-deploy for the `cloudflare` stack is planned but
   not shipped, so this is new setup — configured in the Cloudflare dashboard, not in
   the repo. Update AGENTS.md once it works, and stop relying on local `wrangler`.
4. **Disable the GitHub Pages workflow in this fork.** `.github/workflows/deploy-github-pages.yml`
   fires on every push to `main`, but this fork is `stack: cloudflare`. It is a real
   template feature for the `github-pages` stack, not a leftover — so disable it here
   rather than deleting it upstream.
5. **Port the homepage.** Move `src/index.html`, `src/index.css` (51 lines), and
   `src/logo.js` (310 lines) from `arfct/web` into a root page using the template's page
   + script mechanism. `logo.js` imports the bare specifier `three`, so it must go
   through the esbuild step. Then **remove the `/` → `/catalog/` 302** from `_redirects`.
6. **Add `artifact.com` as a custom domain** on the Pages project and cut DNS over.
7. **Verify**, then retire the Netlify `artifact-site` project.
8. **Archive `arfct/web`** — only once the owner is satisfied. It is explicitly kept for
   now. Its one unique asset is `logo.js`, which step 5 moves.

## Optional, once page support exists

Bring `site.artifact.com`'s Support and Privacy pages off Google Sites and into
`pages/`, collapsing three hosts into one. The homepage links to both, so those links
would change. Not required for cutover, and safe to do afterward.

## Rollback

Repoint `artifact.com`'s DNS at Netlify's IPs (`75.2.60.5`, `99.83.231.61`). Keep the
Netlify project until well after cutover so this stays a one-step reversal. Do not
complete step 7 until confident.

## Verification

- `artifact.com` serves the new site; `/catalog/` and `/catalog/<slug>/` both resolve.
- Media loads from the custom domain, with no `r2.dev` URLs left in the built output.
- `og:image` resolves to an absolute `artifact.com` URL — check with a scraper, not by eye.
- A push to `main` deploys on its own, with no local wrangler run.
- `site.artifact.com` still serves Support and Privacy, and the homepage links still work.
- The homepage's rotating logo works in production, not just in dev.
