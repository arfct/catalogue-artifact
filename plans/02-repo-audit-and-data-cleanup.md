# Repo audit: what every checked-out project needs before the catalogue is right

_Plan 02. 2026-10-25. Proposed. Builds on [plan 01](01-entries-live-in-their-repos.md) (entries live in their repos) and turns it into a per-repo worklist. Touches: `arfct/catalogue` (template code), `arfct/catalogue-artifact` (branches, deploy, entries), and the 46 repos checked out in `/Volumes/code`. Plan only. No product repo has been changed._

## Summary

Plan 01 set the convention: each product carries `catalogue/<slug>.md` at its root, and the catalogue imports it. The ops half has shipped (`catalogue-entry` skill, `primer/products.md` section, `app-store-assets` hook). The catalogue half hasn't started. There is no importer, and no repo has a `catalogue/` folder yet.

The audit of every checked-out repo turned up two problems plan 01 doesn't cover:

1. **The fork's `main` is not the site.** The live site is built from the `pages` branch, which is 14 commits ahead of `main`: the homepage, multi-page support, `/catalog/` mount, `media.artifact.com`, Shareware and Tiny Gifts, and the real Translucent, Chronology and Timezone images. `main` has only plan 01 on top of the fork point, so anything branched from `main` (including plan 01's importer) starts from a stale site.
2. **The data is wrong in ways a validator would catch.** Every one of the 17 entries has a `date` equal to its repo's first-commit month, which is the trap `catalogue-entry` warns about. 11 of 17 still show `_sample/` placeholders. Four have no `url` or a GitHub link where a live home exists. One links to a dead host. Tags mix platforms, languages and kinds in mixed case, and `tools` is on 14 of 17 entries, so it tells a visitor nothing. Nothing checks any of this, so it drifts again after every fix.

So this plan comes in two parts: code first (reconcile branches, upstream the template features, add a validator next to plan 01's importer), then a per-repo table saying what each project needs, grouped so the work can be batched.

## What the audit found

Survey of `/Volumes/code` on 2026-10-25: remote, visibility, branch, first and last commit, tags, store assets, deploy config, live URL check. Raw output is reproducible with the probe described under "Method".

### The catalogue repos

| | `arfct/catalogue` (template) | `arfct/catalogue-artifact` (fork) |
|---|---|---|
| Default branch | `main`, last commit 2026-07-25 (credits) | `main` = fork point + plan 01. **`pages` holds the live site** |
| Ahead of the other | nothing | 34 commits on `pages` not upstream, of which several are generic template features (below) |
| Deploy | GitHub Pages workflow | Manual `npm run deploy` (wrangler) from a local checkout. `deploy-github-pages.yml` still runs on every push to `main` and serves nothing useful |
| GitHub `homepage` | `arfct.github.io/catalogue` | same, which is wrong for the fork (ops #18) |
| Live | n/a | `catalogue-artifact.pages.dev` serves `/` and `/catalog/` (18 links). `artifact.com` is still the Netlify site (cutover spec deferred) |

Commits on `pages` that belong in the template, because nothing in them is Artifact-specific: `a8f9c90` multi-page support, `6494907` mount paths (the config half), `a537098` landing pages, page scripts, per-page fonts and a real 404, plus the `_*.md` ignore and `img/` passthrough in `.eleventy.js`. As long as they live only in the fork, every template change has to be merged around them, and other forks don't get them.

### Existing entries (17)

`date` is the repo's first-commit month in every row, so it is listed only where something else is wrong too. "Placeholder" means every `media` item is `_sample/`.

| Entry | Repo · local dir | Media | Problems found | Work |
|---|---|---|---|---|
| subpixel | `subpixel` (private) | real (2) | `url` is `subpixel.org`, which now 301s to `subpixel.app` | Pilot (plan 01 step 2). Fix `url` |
| shareware | `shareware` (private) | placeholder | No `url` (`shareware.fyi` is live). Tags say iOS only. The repo ships Android and a web sender too. 31 store captures in the repo | Active repo: its agents write the entry from the store captures |
| tiny-gifts | `tiny.gifts` | real (1) | `date` 2021-01 is the repo's creation day (`2021-01-01`) | Seed. Confirm date. One more image |
| timezone-fyi | `timezone.fyi` | real (1) | Local checkout is on `og-svg-renderer` | Seed. Confirm date |
| itty-bitty | `itty-bitty` | placeholder | Local checkout is on `og-svg-renderer` | Seed. Capture live site |
| redirect-app | `redirect-app` | placeholder | `iOS` tag on a web redirector (keep only if the entry argues for it) | Seed. Capture live site |
| teleprompt | `teleprompt.live` | placeholder | `url` is the GitHub repo. `teleprompt.fyi` is the product page (CNAME set, A records on GitHub Pages, but HTTPS failed from here: unverified). Title says "Teleprompt Live". The app and site say "Teleprompt". Mac build exists. Tags say iOS only | Active repo: entry with the next TestFlight/App Store asset session |
| chronograph | `chronograph` | placeholder | No `url`. `chronograph.app` is a parked lander. The repo was re-created 2026-10-24 (old one is `chronograph-archive`), now has `android/`. Local checkout on `transparent-widgets` | Active repo. Decide the `url` |
| chronology | `chronology-watchface` → `arfct/arcminute-watchface` | real (1) | The product is now **Arcminute** with a Wear OS port. The entry is Pebble-only, tagged `C, hardware`. Repo `homepage` (`arfct.github.io/arcminute-watchface`) 404s. 8 store captures | Rename decision (slug and title). Active repo |
| tyde | `tyde` | placeholder | Hardware: needs photographs. Working copy has 1 uncommitted file | Seed. Photos from Nicholas |
| hypercube | not checked out (private) | placeholder | `url` `hypercube-five.vercel.app` returns 404 | Fix or drop the `url`. Clone or keep hand-written |
| translucent | not checked out | real (1) | `url` is GitHub | Clone or keep hand-written |
| timer-supply | not checked out | placeholder | | Clone or keep hand-written. Capture live site |
| mizaru | not checked out | placeholder | Hardware/security: photos | Clone or keep hand-written |
| pancakes, polychrome, tab-recycler, wrench | not checked out | placeholder | Last pushed 2022–2024. Browser extensions: captures may need an old browser or archival images | Clone or keep hand-written |

### Checked-out repos with no entry

Grouped by recommendation. Live checks were run on 2026-10-25. App Store and Play status is unverified unless a tag says otherwise.

**Add: shipped, public-facing**

| Repo · local dir | Live at | Notes |
|---|---|---|
| `villainy` (private) | `villainy.app`, `play.villainy.app` | iOS/Mac/Android/web. Store listings and 17 store captures in the repo. Issue #4 mentions Scramble: one entry or two (plan 01's "two products a visitor would think of separately") |
| `vapor` | `vapor.fyi` | A **fork of `inanimate-tech/mist`**. Needs a `credits` or `client` decision before the entry says what Artifact made |
| `size.fyi` | `size.fyi` | Public, live, 210 commits |
| `menagerie` · `brooklyn` (private) | `menagerie.fyi`, `collections.fyi`, `types.artifact.com` | `menagerie.app` is a parked lander, so it isn't the `url`. Browser extension tag `extension-0.1.0` |
| `silhouette` | none found (`silhouette.fyi` doesn't resolve) | macOS virtual camera with support, privacy and terms pages in `docs/`, so it's at least store-bound |
| `enigma` | `arfct.github.io/enigma/` | Client-side text to IPA |
| `system-six` | `arfct.github.io/system-six/` | 1-bit CSS components with a live demo |

**Decide with Nicholas: libraries, prototypes, private or not-yet-adopted**

| Repo · local dir | Why it's a question |
|---|---|
| `integer` | Its README calls it a prototype pipeline, not a finished typeface. Live demo exists |
| `quantum`, `squircle` (private), `rosetta-icons` | Design system and libraries. Good catalogue material if the catalogue includes tools-for-makers. Squircle is private |
| `eink.page` (private) | Live, but adoption issue `internal#9` says fix HTTPS and rotate exposed keys first |
| `pennybook` (private) | Active, iOS and Android, 11 screenshots. Unreleased |
| `hourglass` (2 commits) and `hourglass-classic` (`alcor/hourglass`, 2018–2026, 249 commits) | Same product across two repos and two owners. One entry, from which repo? |
| `stickerclip` (`alcor/stickerclip`) | Live at `stickerclip.app`. Adoption is `internal#4`. Working copy has 39 uncommitted files |
| `itty-bitty-land`, `Sharecode` (`alcor/*`) | Personal repos. Probably out, or part of the itty-bitty entry |
| `link-previews`, `og-svg`, `agent-connection` | Reference code and shared infrastructure. Probably out |

**Out until they ship:** `minder` (personal use per `MINDER.md`, `minder.to` returns 503), `alchemy` (research), `safe-area` (a day old).

**Out (org plumbing, not work):** `ops`, `internal`, `geist`, `multiplexer`, `domains`, `catalogue`, `catalogue-artifact`, `artifact-web` (the homepage it held now lives in the fork), `google-ai-mode` (`ai-mode-skill`), `subpixel-private`, `personal`, `PersonalShipYard` (`NDBellisario/PersonalShipYard`, not an Artifact repo).

### Local checkout state that affects the work

Eight checkouts are on feature branches with other agents' work in them (`chronograph`, `itty-bitty`, `timezone.fyi`, `teleprompt.live`, `alchemy`, `brooklyn`, `pennybook`, `internal`), and five have uncommitted files (`tyde`, `stickerclip`, `google-ai-mode`, `personal`, `ops`). Seeding PRs must not touch those working trees. Each one is made in a `git worktree` from a fresh `origin/<default>`.

## Decisions

### 1. `main` becomes the site; `pages` goes away

Merge `pages` into `main` (a merge, not a squash, so the 14 commits stay readable), then delete `pages`. Deploys move to CI on `main`: a workflow that runs `npm run build` and `wrangler pages deploy`, which is also template issue `arfct/catalogue#4`. Disable `deploy-github-pages.yml` in the fork, not upstream, as the cutover spec says. Set the fork's GitHub `homepage` to `https://catalogue-artifact.pages.dev/catalog/` until cutover.

Why first: plan 01's importer, the validator and every seeding PR would otherwise be built against a `main` that lacks the mount paths and five of the entries.

### 2. Generic features move upstream, so the fork carries only Artifact

Port the template-generic commits listed above into `arfct/catalogue` as one PR, with README and AGENTS.md sections, and keep the default config reproducing today's template layout (`/`, `/p/`). Then merge upstream into the fork. The test: `git diff upstream/main origin/main -- .eleventy.js _includes index.njk scripts/` shows only Artifact styling and config. `projects/`, `media/`, `pages/`, `styles/custom.css` and `catalogue.config.yml` can differ as they like.

### 3. A validator, run everywhere the data enters

`npm run check` (`scripts/check-entries.js`) in the template. It reads `projects/*.md` and, with `--dir`, any `catalogue/` folder, so product repos and the importer run the same rules:

- **Errors:** missing `title`, `date` or `media`. `date` not `YYYY` or `YYYY-MM`. `url` not `https://`. A media `src` that doesn't exist (locally, or under `media_base_url` with `--remote`). A file over 2 MB. A media item with no `alt`. A tag not in the vocabulary (decision 4).
- **Warnings:** `_sample/` media. First image more than 10% off 4:3. `url` pointing at `github.com` when the repo's `homepageUrl` is set. `url` not returning 200 (`--remote`). A `date` equal to the source repo's first-commit month (importer only: it has the repo).
- **`--report`** prints one table row per entry with its warnings, which is the dashboard for this plan. The baseline run on today's 17 is the first exit test.

CI runs `npm run check` on every PR in both catalogue repos. The `catalogue-entry` skill's step 4 ("Check it") becomes `npx arfct-catalogue-check catalogue/`, or, simpler, running the script from a catalogue checkout. That choice is part of phase 1.

### 4. Tags are a fixed vocabulary in two facets

Plan 01 left this open. Today's 17 entries use 16 distinct tags in mixed case (`iOS`, `visionOS`, `3D`). Three are languages (`Swift`, `C`, `Python`, six uses between them), which `curator-voice` already puts in the body's last line, and `tools` is on 14 entries. Proposal: `tags.yml` in the config with

- **platform:** `web`, `ios`, `macos`, `android`, `wear-os`, `pebble`, `visionos`, `browser-extension`, `hardware`;
- **kind:** `tool`, `game`, `widget`, `watchface`, `typeface`, `design-system`, `library`, `toy`, and a few more as entries need them.

Lowercase, kebab-case, validated, and rendered as two groups, which also gives template issue `#8` (make tags do something) its filter axes. A fork without `tags.yml` keeps free tags, so the template stays general.

### 5. Seeding is a script, editorial is a person

Plan 01 calls for one PR per product repo. Ten of the moves are mechanical, so `scripts/seed-entry.js <slug> <owner/repo>` writes `catalogue/<slug>.md` (bare `src` names) and copies its media from `media/<slug>/` or R2 into a worktree of the repo. The agent then opens the PR with the validator's warnings for that entry as a checklist in the body. Facts (date, credits, names) are confirmed with Nicholas on that PR rather than guessed, as the skill requires. One message to him can cover the whole batch (see the open questions below).

### 6. Repos that aren't checked out stay hand-written for now

Eight entries (hypercube, translucent, timer-supply, mizaru, pancakes, polychrome, tab-recycler, wrench) belong to quiet repos last pushed 2022–2024. Plan 01 seeds them anyway. This plan defers them: they stay in `projects/` without `source:`, which plan 01 already supports. They get their facts and media fixed in the catalogue directly, in one editorial PR. Moving them later is the same script. Reopen if any of them becomes active again.

## Phases

Each phase ends with a test someone can run.

### 0. Fork hygiene (catalogue-artifact)

- Merge `pages` into `main`, delete `pages`, add the CI deploy, disable the GitHub Pages workflow, fix `homepage`.
- Exit: a no-op PR merged to `main` deploys, and `curl -s https://catalogue-artifact.pages.dev/catalog/shareware/` returns 200 with that build's commit in a `<meta name="generator">` or build stamp.

### 1. Template code (catalogue)

- Upstream the generic features (decision 2). Add `check-entries.js` and `tags.yml` support (decisions 3–4), plan 01's importer, `seed-entry.js`. Fix `sync-media.js` uploading `_`-prefixed files. Update `new-project` to target `catalogue/` and point its voice section at `curator-voice`.
- Exit: in the fork, `npm run check -- --report --remote` prints the baseline table for all 17 entries, and an import of a fixture repo produces a byte-identical `projects/` file.

### 2. Pilot: subpixel

- As plan 01 step 2, plus the `url` fix.
- Exit: the live page is unchanged apart from the link, and its `projects/` file carries `source:`.

### 3. Seed the other nine checked-out entries

- `tiny.gifts`, `timezone.fyi`, `itty-bitty`, `redirect-app`, `tyde`: seeding PRs from this side (quiet repos).
- `shareware`, `teleprompt.live`, `chronograph`, `arcminute-watchface`: seeded too, so nothing waits on a store session, with the PR body asking that repo's next asset session to replace the media.
- Exit: `npm run check -- --report` shows zero errors, and every one of these entries has `source:`.

### 4. Editorial and media

- Captures for the live web products (headless Chrome, as in `new-project`). Store captures re-exported for shareware, villainy, arcminute. Photos for tyde and mizaru from Nicholas.
- The hand-written eight get their pass in one catalogue PR (decision 6). Hypercube's dead `url` is fixed or removed.
- Exit: zero `_sample/` warnings in the report, and every `url` returns 200.

### 5. New entries

- "Add" group first: villainy, vapor, size.fyi, menagerie, silhouette, enigma, system-six. Each written in its own repo by its agents with `catalogue-entry`, then added to `sources:`. This closes catalogue-artifact #4.
- Then whatever Nicholas picks from the "Decide" group.
- Exit: the report lists every repo in `sources:` and none of them warns.

### 6. Keep it right

- Scheduled import PR and the org-wide "shipped repo with no `catalogue/`" check, both as plan 01 step 5. The check's list is this plan's "Add" and "Decide" tables, so it doesn't flag plumbing.
- Each repo's GitHub `homepage` and description match its entry's `url` and first line. The importer reports drift rather than writing to repo settings.

## Method

The survey reads each `/Volumes/code/*/.git` repo: `origin` remote, `gh repo list arfct` metadata (visibility, fork, homepage, description, created and pushed dates), current branch, uncommitted file count, first and last commit dates, tags, `catalogue/`, `docs/store-listing*`, store-asset and screenshot folders, `CNAME` and `wrangler.*`. Live checks are `curl -L` for status, plus `dig @1.1.1.1` where it failed. Rerun before phase 3, because branch state and live sites change weekly.

## What would reopen this

- Nicholas wants the catalogue to show only shipped consumer products. The "Decide" table then shrinks to nothing and decision 4's `kind` facet loses most of its values.
- Cloudflare git integration is preferred over a GitHub Actions deploy. Phase 0's exit test stays the same, but the workflow goes away.
- Product-repo agents start writing `catalogue/` before phase 1 lands. Their entries are still valid input, so the importer takes them as they are, and the validator's first run doubles as their review.

## Open questions

1. **Dates:** all 17 are first-commit months. Should one list go to Nicholas for every first-release month, or should the importer just flag them and they get fixed as each PR comes up?
2. **Renames:** should Chronology become Arcminute (slug `arcminute`, with a redirect from `/catalog/chronology/`), and Teleprompt Live become Teleprompt?
3. **Scope:** does the catalogue include libraries and design systems (quantum, system-six, rosetta-icons, squircle, integer)?
4. **vapor:** it's a fork of `inanimate-tech/mist`. Should that be a credit, a `client`, or a line in the body?
5. **Hourglass:** should there be one entry for `alcor/hourglass` and `arfct/hourglass` together, and does `alcor/hourglass` move into the org first?
6. **The quiet eight:** should they stay hand-written (decision 6), or be cloned and seeded as plan 01 says?
