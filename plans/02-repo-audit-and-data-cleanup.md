# Repo audit: what every project needs before the catalogue is right

_Plan 02. 2026-10-25. Proposed. Revised the same day with Nicholas's answers: the folder is `.artifact/` (was `catalogue/`), the ops skill becomes `artifact-entry`, entries gain `category`, Chronology becomes Arcminute, the quiet repos are cloned and seeded like the rest, and dates get a first-pass guess. Second revision: a fourth category, `infrastructure`; Villainy is one entry; Teleprompt Live keeps its name; pennybook, complicated-watchface and stickerclip are in, tab-manager is not yet. Third revision: eink.page is out; Teleprompt's date is the prototype's; entries gain `links` (product page, stores, TestFlight) and a fixed-name `icon.png`. Fourth revision: Hourglass gets its `.artifact/` entry written but isn't listed; Villainy is TestFlight-only on iOS. Builds on [plan 01](01-entries-live-in-their-repos.md) and turns it into a per-repo worklist. Touches: `arfct/catalogue` (template code), `arfct/catalogue-artifact` (branches, deploy, entries), `arfct/ops` (rename), and every repo listed below. Plan only. No product repo has been changed._

## Summary

Plan 01 set the convention: each product describes itself in a folder at its repo root, and the catalogue imports it. The ops half shipped under the name `catalogue/` (`catalogue-entry` skill, `primer/products.md`, the `app-store-assets` hook). The catalogue half hasn't started. There is no importer, and no repo has the folder yet. That makes now the cheapest time to rename it.

The audit of every repo in `/Volumes/code`, plus the 14 org repos cloned for it, turned up two problems plan 01 doesn't cover:

1. **The fork's `main` is not the site.** The live site is built from the `pages` branch, which is 14 commits ahead of `main`: the homepage, multi-page support, `/catalog/` mount, `media.artifact.com`, Shareware and Tiny Gifts, and the real Translucent, Chronology and Timezone images. `main` has only plan 01 on top of the fork point, so anything branched from `main` starts from a stale site.
2. **The data is wrong in ways a validator would catch.** Every one of the 17 entries has a `date` equal to its repo's first-commit month, which is the trap the entry skill warns about. 11 of 17 still show `_sample/` placeholders. Four have no `url` or a GitHub link where a live home exists. One links to a dead host. Tags mix platforms, languages and kinds in mixed case, and `tools` is on 14 of 17 entries, so it tells a visitor nothing. Nothing checks any of this, so it drifts again after every fix.

So the plan comes in three parts: settle the format, change the code (reconcile branches, upstream the template features, add a validator next to plan 01's importer), then work through a per-repo table, grouped so the work can be batched.

## The format

### `.artifact/` at the repo root

```
.artifact/
  <slug>.md       the entry: frontmatter + curator-voice body; the filename is the URL
  icon.png        the app icon, by name; never listed in media[]
  <image>.png     its media, beside it; src: is a bare filename
  _*              ignored (drafts, source art)
```

- **A dot folder, because it's data.** The repo's `README.md` is the human description. It can link down to the entry or to its catalogue page, so the folder doesn't need to be noticed. It belongs with `.github/` and `.claude/`: about the repo, not part of the product. GitHub Pages builds leave dot folders out, which keeps entry media off a product's own site.
- **The one cost is search.** ripgrep and the agent search tools built on it skip hidden paths by default. The `artifact-entry` skill tells agents to read `.artifact/` directly. The importer and the org-wide check go through the GitHub API, which sees it anyway.
- **Written is not listed.** A repo appears in the catalogue only when it's in the catalogue's `sources:`. A repo can carry a finished `.artifact/` entry and stay off the site until it's ready. Hourglass starts that way. The org-wide check reports such repos as "written, not listed", not as missing.
- **One file per product.** A repo that ships two products a visitor would think of separately has two `.md` files. Platforms of one product share one.
- **The template doesn't hard-code the name.** `source_dir:` in `catalogue.config.yml` defaults to `.catalogue` for other forks. The Artifact fork sets `.artifact`.

### Frontmatter

Same fields as `_sample.md`, plus these:

| Field | Rule |
|---|---|
| `category` | **New.** `product`, `system`, `tool` or `infrastructure`. Systems (design systems, typefaces, CSS kits), tools (utilities, libraries) and infrastructure (shared services and reference code other products build on) share the index with products and are listed after them, in that order. Only the field is fixed now. How the index clusters by it may change |
| `unconfirmed` | **New.** A list of field names that are guesses, e.g. `[date]`. Nothing renders. The validator warns until Nicholas confirms and the field is removed. Every first-pass date below starts with `unconfirmed: [date]` |
| `formerly` | **New.** Old slugs. The build writes a redirect from each to the current one (`/catalog/chronology/` → `/catalog/arcminute/`) |
| `links` | **New.** Where to get it, as a map with fixed keys, rendered as a "Get it" row in this order: `app` (a web app separate from the product page, e.g. `play.villainy.app`), `app_store`, `mac_app_store`, `testflight`, `play`, `play_testing`, `chrome_web_store`, `pebble` (Rebble), `repebble`, `source` (GitHub, public repos only). Only public links: a TestFlight link is a `testflight.apple.com/join/…` public link, never an internal group. The validator checks each key's host, that it returns 200 with `--remote`, that a TestFlight page is still accepting testers, and that a private repo has no `source` |
| `icon_shape` | **New.** Optional: `squircle` (default), `circle` (watch faces) or `none` (a transparent mark shown as drawn). See "Icons" |
| `credits` | Exists. Outside work the product is built on is credited here: vapor credits `inanimate-tech/mist` |

Unchanged: `title`, `date` (first release, `YYYY-MM`, or `YYYY` when only the year is known; for a product that grew out of a prototype, the prototype's month), `tags`, `media[]` with `caption` and `alt`, `role`, `client`, and the body in `curator-voice`. There's still no `status` field.

`url` stays the one primary link and means **the product page**: the product's own domain, or its GitHub Pages site. When a product has no page, `url` is its best store link, and only then a public repo. Every link the product has also goes in `links`, so the page shows all ways to get it, not just one.

### Icons

- **`.artifact/icon.png`, by name.** The catalogue shows it on its own in the entry header, and beside the title on the index card. It is never one of the `media[]` images and never the index-card crop. A repo with two entries uses `<slug>.icon.png`.
- **The unmasked source art**: square, 1024×1024 (512 minimum), sRGB, opaque, no rounded corners. It's the same art uploaded to App Store Connect or Play. The catalogue applies the mask: the `arfct/squircle` rule by default, a circle for `icon_shape: circle`. Baking corners in would double-round them.
- **`icon.svg`** is accepted for web products whose mark is a logo, not an app icon. Set `icon_shape: none` to show it as drawn.
- **Optional.** Systems, tools and infrastructure often have none, and nothing renders then.
- Where the art comes from is in the links table below. An Icon Composer `.icon` file has to be exported to PNG first. For a released app, the store's own 1024 artwork is a fallback.

### Renames in ops (one PR, `arfct/ops`)

`catalogue-entry` becomes `artifact-entry`, and its folder becomes `.artifact/`. It documents `category`, `unconfirmed`, `formerly`, `links`, `icon.png` and `icon_shape`, and says to read hidden paths. The `app-store-assets` and `play-store-assets` hooks also refresh `icon.png` and the store keys in `links` when a listing changes. Matching edits go to `primer/products.md`, the `app-store-assets` hook, `curator-voice`, the plugin README row and the marketplace description, with a `plugin.json` bump. Plan 01 gets an amendment line pointing here. No repo has adopted the old name, so nothing else migrates.

## What the audit found

Survey on 2026-10-25: remote, visibility, branch, first and last commit, tags, store assets, deploy config, live URL check, and for dates, commit-month histograms, release tags, launch-like commit messages and the Wayback Machine's first capture. See "Method".

### The catalogue repos

| | `arfct/catalogue` (template) | `arfct/catalogue-artifact` (fork) |
|---|---|---|
| Default branch | `main`, last commit 2026-07-25 (credits) | `main` = fork point + plan 01. **`pages` holds the live site** |
| Ahead of the other | nothing | 34 commits on `pages` not upstream, of which several are generic template features (below) |
| Deploy | GitHub Pages workflow | Manual `npm run deploy` (wrangler) from a local checkout. `deploy-github-pages.yml` still runs on every push to `main` and serves nothing useful |
| GitHub `homepage` | `arfct.github.io/catalogue` | same, which is wrong for the fork (ops #18) |
| Live | n/a | `catalogue-artifact.pages.dev` serves `/` and `/catalog/` (18 links). `artifact.com` is still the Netlify site (cutover spec deferred) |

Commits on `pages` that belong in the template, because nothing in them is Artifact-specific: `a8f9c90` multi-page support, `6494907` mount paths (the config half), `a537098` landing pages, page scripts, per-page fonts and a real 404, plus the `_*.md` ignore and `img/` passthrough in `.eleventy.js`.

### Every entry, existing and proposed

**Dates are first-pass guesses, all `unconfirmed`.** The evidence column says what the guess rests on. "First commit" alone is the weakest evidence; a launch commit, a release tag or the month the work clustered in is stronger. Wayback first captures are only listed where they come after the first commit, because several domains had earlier owners (`subpixel.org` 2004, `vapor.fyi` 2018, `size.fyi` 2023, `address.fyi` 2016).

#### Existing entries (17), all products unless noted

| Entry | Repo | Date guess | Evidence | Problems to fix in the seeding PR |
|---|---|---|---|---|
| subpixel | `subpixel` (private) | 2026-07 | 562 of 596 commits in 2026-07 | `url` `subpixel.org` 301s to `subpixel.app` |
| shareware | `shareware` (private) | 2026-08 | First commit 07-26, but signing for distribution 08-09 and `android-preview-1` 08-13 | Placeholder media (31 store captures in repo). No `url` (`shareware.fyi`). Tags say iOS only; Android and web sender too |
| tiny-gifts | `tiny.gifts` | 2021-01 | 8 commits in 2021-01 | One more image |
| timezone-fyi | `timezone.fyi` | 2020-11 | 8 commits 2020-11; Wayback 2021-10. Rebuilt 2024-10 (49 commits) | |
| itty-bitty | `itty-bitty` | 2018-07 | "Clean up for first launch" 2018-07-04 | Placeholder. Local checkout on `og-svg-renderer` |
| redirect-app | `redirect-app` | 2019-07 | First commit; Wayback 2020-03 | Placeholder. `iOS` tag on a web redirector |
| teleprompt | `teleprompt.live` | 2024-07 (confirmed) | The original prototype's month, per Nicholas | Placeholder. `url` is GitHub; should be `teleprompt.fyi`. Title stays "Teleprompt Live" (decided), though the app and site say "Teleprompt" |
| chronograph | `chronograph` (history in `chronograph-archive`) | 2024-06 | 25 commits in 2024-06. Android port 2026-08 | Placeholder. No `url`; `chronograph.app` is a parked lander |
| arcminute (`formerly: [chronology]`) | `arcminute-watchface` (local dir `chronology-watchface`) | 2025-08 | Pebble work 2025-07. The Rebble listing was created 2025-08-06 (from its object id). Wear OS 2026-08, on Play | **Renamed.** Body and tags are Pebble-only (`C, hardware`), so add Wear OS. Repo `homepage` 404s. 8 store captures |
| tyde | `tyde` | 2025-02 | Only 3 commits, all 2025-02 | Placeholder; hardware, needs photographs. 1 uncommitted file locally |
| hypercube | `hypercube` (private) | 2023-09 | 7 commits 2023-09 to 2023-11 | `url` `hypercube-five.vercel.app` returns 404 |
| translucent | `translucent` | 2024-03 | App Store release 2024-03-21 (iTunes lookup) | `url` is GitHub; should be `translucent.directory` |
| timer-supply | `timer.supply` | 2019-01 | 3 commits | Placeholder |
| mizaru | `mizaru` | 2023-05 | 17 of 20 commits in 2023-05 | Placeholder; needs photographs |
| pancakes | `pancakes` | 2021-07 | First commit 06-22; most work 2021-07 | Placeholder |
| polychrome | `polychrome` | 2021-05 | 64 of 105 commits in 2021-05 | Placeholder (browser extension) |
| tab-recycler | `tab-recycler` | 2020-04 | 10 of 15 commits in 2020-04 | Placeholder (browser extension) |
| wrench | `wrench` | 2021-05 | 42 of 55 commits in 2021-05 | Placeholder (browser extension) |

#### New entries: add

| Entry | Repo | Category | Date guess | Evidence | Notes |
|---|---|---|---|---|---|
| villainy | `villainy` (private) | product | 2016 | 2016-01 to 2016-06 work, tag `1.1` 2018-09. Year only until the first App Store release is found | Live at `villainy.app`, `play.villainy.app`. One entry; Scramble is covered in the body |
| vapor | `vapor` | product | 2026-09 | Artifact's work 2026-08 to 09 (227 of 229 commits) | `credits: inanimate-tech/mist` |
| size-fyi | `size.fyi` | product | 2026-07 | "size.fyi v1" merged 2026-07-19 | |
| menagerie | `menagerie` (local `brooklyn`, private) | product | 2026-10 | `extension-0.1.0` 2026-10-06; Wayback 2026-10 | `url` `menagerie.fyi` (`menagerie.app` is parked) |
| hourglass | `arfct/hourglass` (private) | product | 2026-07 | Two commits, 2026-07 | **Written, not listed**: seed `.artifact/` with the entry, and leave it out of `sources:`. `alcor/hourglass` is deprecated and not a source |
| silhouette | `silhouette` | product | 2026-10 | All 75 commits 2026-10 | No live domain found |
| enigma | `enigma` | tool | 2026-08 | All commits 2026-08 | |
| system-six | `system-six` | system | 2026-10 | | |
| quantum | `quantum` | system | 2026-10 | "Quantum design system 0.1.0" 2026-10-15 | |
| integer | `integer` | system | 2026-10 | Specimen published 2026-10-23 | README says prototype. The body says so too |
| ishihara | `ishihara` | system | 2026-10 | One commit | Typeface with a specimen image |
| squircle | `squircle` (private) | system | 2026-10 | QR generator published 2026-10-22 | Private repo: only `.artifact/` is published |
| rosetta-icons | `rosetta-icons` | tool | 2026-10 | | |
| geocode | `geocode` | tool | 2026-09 | "Initial implementation of the geocode.fyi tool" 2026-09-19 | Live at `geocode.fyi` |
| address-fyi | `address.fyi` | tool | 2020-01 | First commit; Firebase app | Live at `address.fyi` |

#### New entries: decided in

| Entry | Repo | Category | Date guess | Evidence | Notes |
|---|---|---|---|---|---|
| pennybook | `pennybook` (private) | product | 2026-10 | Prepared for TestFlight 2026-10-18 | Not released. Status goes in the body. Local checkout on `android-home` |
| complicated | `complicated-watchface` | product | 2026-09 | Two commits, 2026-09 and 2026-10 | Wear OS watch face |
| stickerclip | `alcor/stickerclip` | product | 2022-07 | App Store release 2022-07-27 (iTunes lookup) | Live at `stickerclip.app`. Sources from `alcor/stickerclip` until adoption (`internal#4`) moves it to `arfct`; the importer accepts any owner the token can read. 39 uncommitted files locally |
| link-previews | `link-previews` | infrastructure | 2026-08 | First commit 2026-08-30 | |
| og-svg | `og-svg` | infrastructure | 2026-07 | All commits 2026-07-29 | |
| agent-connection | `agent-connection` | infrastructure | 2026-10 | | |

**Out until they ship:** `minder`, `alchemy` (its TestFlight beta is "Quicksilver"), `safe-area`, `tab-manager` (Sublimation).

**Out:** `eink.page` (decided).

**Out:** `ops`, `internal`, `geist`, `multiplexer`, `domains`, `catalogue`, `catalogue-artifact`, `artifact-web`, `google-ai-mode`, `subpixel-private`, `personal`, `chronograph-archive`. Also repos other people or older owners hold: `PersonalShipYard` (`NDBellisario`), `hourglass-classic`, `itty-bitty-land`, `Sharecode` (`alcor/*`, deprecated or personal), `isograph` (fork of outside work).

### Links and icons

The links each entry should carry, found in the repos and checked on 2026-10-25. App Store presence comes from the iTunes lookup API (US storefront), Play from the public listing returning 200, and TestFlight from the join page's title. `source` is listed only for public repos. "—" means nothing public was found. **Bold** marks fixes to the live site rather than to the entry.

| Entry | `url` (product page) | `links` | Icon source |
|---|---|---|---|
| subpixel | `subpixel.app` | — (private repo) | `web/assets/images/icon-512.png` (512) |
| shareware | `shareware.fyi` | `app_store` id6799876787 (released 2026-10-19), `play` `com.artifact.shareware`, `testflight` `fGYBRRrT` | `docs/store-assets/icon-1024.png` |
| tiny-gifts | `tiny.gifts` | `source` | `public/favicon.svg` (mark, `none`) |
| timezone-fyi | `timezone.fyi` | `source` | none: make one or skip |
| itty-bitty | `itty.bitty.site` | `source` | `docs/favicon.svg` (mark) |
| redirect-app | `redirect.app` | `source` | none |
| teleprompt | `teleprompt.fyi` | `source`. No public TestFlight link found | `teleprompt.live/AppIcon.icon` (export). **`teleprompt.fyi` serves HTTP only: Pages has no HTTPS for the custom domain yet** |
| chronograph | `chronograph.fyi` | `testflight` `qP1EtCvZ` ("Chronograph³¹"), `play` `com.artifact.chronograph`, `source`. Not on the App Store | `apple/iOS/…/AppIcon.appiconset/App Icon - Light.png`. **`chronograph.fyi` redirects straight to TestFlight, so it's not a page yet** |
| arcminute | `arfct.github.io/arcminute-watchface/` once it has a page | `play` `com.artifact.arcminute.wff`, `pebble` (Rebble `68937d18…`), `repebble` (`72fb25c0…`), `source` | `store/play/icon-512.png`, `circle`. **Its Pages site is built but 404s: no index** |
| tyde | — | `source` | none (hardware) |
| hypercube | — (Vercel URL is dead) | — (private) | `web/reflect/public/icon.svg` |
| translucent | `translucent.directory` | `app_store` id6477412179, `source`. TestFlight `64xgwI8e` is dead, so leave it out | `docs/assets/img/favicon.large.png` (512); store artwork as fallback |
| timer-supply | `timer.supply` | `source` | none |
| mizaru, pancakes, polychrome | — | `source` | none |
| tab-recycler | — | `chrome_web_store` `nbcnplijgopjihcgplgbhagnpopnomdi`, `source` | from the store listing |
| wrench | — | `chrome_web_store` `npngmeachnajkiekngpdhmnhkcgieccf` ("A Wrench Menu"), `source` | from the store listing |
| villainy | `villainy.app` | `app` `play.villainy.app`, `play` `com.artifact.villainy`, `testflight` (iOS is TestFlight-only; App Store 2.0.0 is awaiting review per `internal/deployments.md`). No public TestFlight link is in any repo, and the old `get.villainy.app` forward is dormant, so it needs the public link from App Store Connect (TestFlight → external group → Public Link). Add `app_store` id6773132528 on release | `ios/Villainy/…/AppIcon.appiconset/Store@2x.png` (1024) |
| vapor | `vapor.fyi` | `source` | `public/logo.svg` (mark) |
| size-fyi | `size.fyi` | `source` | `public/logo.svg` (mark) |
| menagerie | `menagerie.fyi` | — (private; Play `com.artifact.menagerie` not public) | `apple/Menagerie/…/icon-1024.png` |
| hourglass | — | — (private, nothing deployed) | none. Written, not listed |
| silhouette | `arfct.github.io/silhouette/` | `testflight` `EmuWevCK` ("Silhouette - Chroma Key Camera"), `source` | `Design/icon-1024.png` |
| enigma, system-six, integer | `arfct.github.io/<repo>/` | `source` | `enigma/favicon.svg` (mark). The others have none |
| quantum, ishihara, rosetta-icons | — (no Pages site) | `source` | none |
| squircle | `arfct.github.io/squircle/qr/` (the root 404s) | — (private) | none |
| geocode | `geocode.fyi` | `source` | `src/lib/assets/favicon.svg` (mark) |
| address-fyi | `address.fyi` | — (private) | none |
| pennybook | — | — (private; no public TestFlight link; Play listing not public) | `Pennybook/Resources/Pennybook.icon` (export) |
| complicated | — | `source` (Play `com.artifact.complicated.wff` not public) | none: export the watch face preview, `circle` |
| stickerclip | `stickerclip.app` | `app_store` id1633833395, `testflight` `bblf4AVl` (via `beta.stickerclip.app`) | `App/…/AppIcon.appiconset/Messages1024.png` |
| link-previews, og-svg, agent-connection | — | `source` | none |

### Local checkout state that affects the work

Eight checkouts are on feature branches with other agents' work in them (`chronograph`, `itty-bitty`, `timezone.fyi`, `teleprompt.live`, `alchemy`, `brooklyn`, `pennybook`, `internal`), and five have uncommitted files (`tyde`, `stickerclip`, `google-ai-mode`, `personal`, `ops`). Seeding PRs never touch those working trees. Each one is made in a `git worktree` from a fresh `origin/<default>`.

## Decisions

### 1. `main` becomes the site; `pages` goes away

Merge `pages` into `main` (a merge, not a squash, so the 14 commits stay readable), then delete `pages`. Deploys move to CI on `main`: a workflow that runs `npm run build` and `wrangler pages deploy`, which is also template issue `arfct/catalogue#4`. Disable `deploy-github-pages.yml` in the fork, not upstream. Set the fork's GitHub `homepage` to `https://catalogue-artifact.pages.dev/catalog/` until cutover.

Why first: the importer, the validator and every seeding PR would otherwise be built against a `main` that lacks the mount paths and five of the entries.

### 2. Generic features move upstream, so the fork carries only Artifact

Port the template-generic commits into `arfct/catalogue` as one PR, with README and AGENTS.md sections, and keep the default config reproducing today's template layout (`/`, `/p/`). Then merge upstream into the fork. The test: `git diff upstream/main origin/main -- .eleventy.js _includes index.njk scripts/` shows only Artifact styling and config.

### 3. A validator, run everywhere the data enters

`npm run check` (`scripts/check-entries.js`) in the template. It reads `projects/*.md` and, with `--dir`, any source folder, so product repos and the importer run the same rules:

- **Errors:**
  - missing `title`, `date`, `category` or `media`;
  - `date` not `YYYY` or `YYYY-MM`;
  - `category` not one of the configured values;
  - `url` not `https://`;
  - a media `src` that doesn't exist (locally, or under `media_base_url` with `--remote`);
  - a file over 2 MB;
  - a media item with no `alt`;
  - a tag not in the vocabulary (decision 4);
  - a `formerly` slug that collides with a live one;
  - an unknown `links` key, or a link whose host doesn't match its key (`app_store` must be `apps.apple.com`, and so on).
- **Warnings:**
  - an entry with a store-capable platform tag (`ios`, `android`, `wear-os`…) but no matching `links` key;
  - `icon.png` not square, under 512px, or with transparent corners when `icon_shape` isn't `none`;
  - any `unconfirmed` field;
  - `_sample/` media;
  - first image more than 10% off 4:3;
  - `url` pointing at `github.com` when the repo has a `homepageUrl`;
  - `url` not returning 200 (`--remote`).
- **`--report`** prints one table row per entry with its warnings. It is the dashboard for this plan, and the baseline run on today's 17 is the first exit test.

CI runs it on every PR in both catalogue repos. The `artifact-entry` skill's "check it" step runs the same script from a catalogue checkout.

### 4. Tags are a fixed vocabulary; `category` carries the grouping

Today's 17 entries use 16 distinct tags in mixed case (`iOS`, `visionOS`, `3D`). Three are languages (`Swift`, `C`, `Python`), which `curator-voice` already puts in the body's last line, and `tools` is on 14 entries. With `category` taking the product/system/tool/infrastructure split, tags become platform and subject only: a `tags.yml` vocabulary (`web`, `ios`, `macos`, `android`, `wear-os`, `pebble`, `visionos`, `browser-extension`, `hardware`, plus subject words such as `game`, `widget`, `watchface`, `typeface`, `multiplayer`), lowercase, validated. A fork without `tags.yml` keeps free tags.

### 5. The index groups by `category`, in one list

Products first, then systems, tools and infrastructure, each newest first, each with a small heading. One page and one grid, so a later switch to a filter or separate pages only changes `index.njk`. The category order comes from config (`categories: [product, system, tool, infrastructure]`), so forks can name their own.

### 6. Seeding is a script, editorial is a person

`scripts/seed-entry.js <slug> <owner/repo>` writes `.artifact/<slug>.md` with bare `src` names, `category`, `url` and `links` from the links table, and `unconfirmed: [date]` with the guess from the tables above. It also copies the icon to `icon.png`, exporting `.icon` sources with Xcode's `ictool` (untested) and falling back to the store's artwork. It copies the media from `media/<slug>/` or R2 into a worktree of the repo. The agent opens the PR with that entry's validator warnings as a checklist in the body. The same script seeds every repo, including the eight quiet ones, now cloned. The catalogue then imports each folder back, and the existing hand-written text is the starting point, not something to rewrite.

## Phases

Each phase ends with a test someone can run.

### 0. Fork hygiene (catalogue-artifact)

- Merge `pages` into `main`, delete `pages`, add the CI deploy, disable the GitHub Pages workflow, fix `homepage`.
- Exit: a no-op PR merged to `main` deploys, and `/catalog/shareware/` on `catalogue-artifact.pages.dev` returns 200 with that build's commit in a build stamp.

### 1. Format and template code

- In `arfct/ops`: the rename PR (format section above).
- In `arfct/catalogue`:
  - upstream the generic features (decision 2);
  - add `source_dir`, `category`/`categories`, `unconfirmed` and `formerly` (with redirects), `check-entries.js` and `tags.yml` support;
  - add plan 01's importer and `seed-entry.js`;
  - fix `sync-media.js` uploading `_`-prefixed files;
  - point `new-project` at `.artifact/` and `curator-voice`.
- Exit: in the fork, `npm run check -- --report --remote` prints the baseline for all 17 entries, and an import of a fixture repo produces a byte-identical `projects/` file.

### 2. Pilot: subpixel

- Plan 01 step 2, plus the `url` fix.
- Exit: the live page is unchanged apart from the link, and its `projects/` file carries `source:`.

### 3. Seed the 16 other existing entries

- Quiet repos (`tiny.gifts`, `timezone.fyi`, `itty-bitty`, `redirect-app`, `tyde`, `hypercube`, `translucent`, `timer.supply`, `mizaru`, `pancakes`, `polychrome`, `tab-recycler`, `wrench`): seeding PRs from this side.
- Active repos (`shareware`, `teleprompt.live`, `chronograph`, `arcminute-watchface`): seeded too, so nothing waits on a store session. Each PR body asks that repo's next asset session to replace the media. Arcminute's PR does the rename (`formerly: [chronology]`).
- Exit: the report shows zero errors, all 17 entries carry `source:`, and `/catalog/chronology/` redirects to `/catalog/arcminute/`.

### 4. Editorial and media

- Captures for the live web products. Store captures re-exported for shareware, villainy and arcminute. Photos for tyde and mizaru from Nicholas. Archival or old-browser captures for the three extensions. Hypercube's dead `url` is fixed or removed. Site fixes from the links table, in their own repos: HTTPS on `teleprompt.fyi`, a real page at `chronograph.fyi`, an index for the Arcminute Pages site.
- Nicholas confirms dates in one pass over the report's `unconfirmed` list.
- Exit: zero `_sample/` warnings, every `url` and `links` value returns 200, every app-store product has an `icon.png`, and no `unconfirmed` left on existing entries.

### 5. New entries

- The "add" table: products first (villainy, vapor, size.fyi, menagerie, silhouette), then systems and tools. Hourglass's entry is written in its repo but not added to `sources:`. Active repos' own agents write theirs with `artifact-entry`, and this side seeds the quiet ones. This closes catalogue-artifact #4.
- Then the "decided in" table: pennybook, complicated, stickerclip, and the three infrastructure entries.
- Exit: the report lists every repo in `sources:` with no errors.

### 6. Keep it right

- Scheduled import PR and the org-wide "shipped repo with no `.artifact/`" check, as plan 01 step 5. The check's list is the new-entry tables, so it doesn't flag plumbing.
- The importer reports when a repo's GitHub `homepage` and description drift from its entry's `url` and first line. It doesn't write to repo settings.

## Method

The survey reads each `/Volumes/code/*/.git` repo: `origin` remote, `gh repo list arfct` metadata (visibility, fork, homepage, description, created and pushed dates), current branch, uncommitted file count, first and last commit dates, tags, `docs/store-listing*`, store-asset and screenshot folders, `CNAME` and `wrangler.*`. Live checks are `curl -L` for status, plus `dig @1.1.1.1` where it failed. For dates, it uses commits per month across all branches, tags with dates, commit subjects matching launch/release/ship/TestFlight/publish/deploy, and the Wayback CDX first 200 capture of the live domain. The 14 repos not checked out before were cloned to the top of `/Volumes/code` for this: hypercube, translucent, timer.supply, mizaru, pancakes, polychrome, tab-recycler, wrench, complicated-watchface, geocode, ishihara, address.fyi, tab-manager, chronograph-archive. Rerun before phase 3, because branch state and live sites change weekly.

## What would reopen this

- Clustering by `category` reads badly once real entries are in. The fix lives in `index.njk` (filter, tabs or separate pages); the entry field stays.
- Cloudflare git integration is preferred over a GitHub Actions deploy. Phase 0's exit test stays the same, but the workflow goes away.
- An entry needs a fifth category (an `experiment`, say). Add it to `categories:` and the validator; nothing else changes.

## Open questions

None open. Remaining facts (dates marked `unconfirmed`, Villainy's public TestFlight link, photos for tyde and mizaru) are collected in phase 4.
