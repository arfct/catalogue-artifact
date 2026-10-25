# Entries live in their repos: each product carries its own catalogue entry, and the catalogue imports it

_Plan 01. 2026-10-23. Proposed. Touches: `arfct/catalogue` (importer, skill), `arfct/catalogue-artifact` (sources, migration), `arfct/ops` (primer rule), every product repo with an entry. Related issues: catalogue-artifact #1 (placeholder media), #2 (editorial pass), #4 (missing entries); catalogue #4 (Cloudflare CI deploy); ops #18 (repo metadata)._

> **Amended by [plan 02](02-repo-audit-and-data-cleanup.md):** the folder is `.artifact/`, not `catalogue/`, and the ops skill is `artifact-entry`. Entries gain `category` (product, system, tool, infrastructure), `unconfirmed`, `formerly`, a `links` map (stores, TestFlight, source) and a fixed-name `icon.png`, and tags become a fixed vocabulary (open question 2). The site is built from the `pages` branch, not `main`, so branch reconciliation comes before step 1. The media custom domain under "Alongside" is done (`media.artifact.com`). All 17 entries, including the quiet repos, are seeded into their repos.

## Summary

Today every entry is hand-written in `catalogue-artifact/projects/`, far from the code it describes, so entries drift: 15 of 16 still show placeholder media, dates and roles were never checked, and five shipped products have no entry. Nothing in `ops` or `catalogue` says how a product repo describes itself to the catalogue. The only guidance is the `new-project` skill, which writes into the catalogue and treats the repo as a source to read.

This plan turns that around. Each product repo holds its own entry in one folder at its root, `catalogue/`: `<slug>.md` in exactly the `_sample.md` format, with its images beside it. The repo's own agents write and update it, most naturally while producing store assets, when fresh captures of the product already exist. The catalogue gets an importer that copies the folders in and commits them, so the site build stays offline. The repo becomes the single home for its facts, and the entry changes in the same PR as the product.

## What exists today

| Where | What it says about entries |
|---|---|
| `catalogue/projects/_sample.md` | The entry format: `title`, `date`, `tags`, `media[]` (`src`, `caption`, `alt`), `client`, `role`, `url`, `credits[]` |
| `catalogue/.claude/skills/new-project` | Gathers facts from a repo, folder or interview. Writes `projects/<slug>.md` in the catalogue. Media comes from the user's images, then screenshots, then placeholders |
| `ops/plugins/artifact/skills/curator-voice` | The voice for entry bodies. The new-project skill keeps its own copy of it, which `ops` says should be a pointer instead |
| `ops/primer/products.md` | Each product's fixed points (ID, domain, legal pages) and store-listing docs in `docs/store-listing-<store>.md`. No mention of the catalogue |
| Product repos | Nothing. No repo carries catalogue metadata |

A single root folder keeps the catalogue's footprint in a product repo to one obvious place, and a folder that exists or doesn't is easy to check across the whole org.

## The convention

### In each product repo

```
catalogue/
  <slug>.md       ← the entry: _sample.md frontmatter + curator-voice body
  *.png, *.jpg    ← its media, beside it (~2000px long edge, first image crops to 4:3)
```

- **Same frontmatter as `_sample.md`, field for field.** There's no second schema to maintain. The importer adds the provenance fields described below; authors never write them.
- **The filename is the slug** (`teleprompt.live` → `catalogue/teleprompt.md`), so the URL needs no extra field. A repo that ships two products a visitor would think of separately has two `.md` files; platforms of one product share one.
- **`media[].src` is a bare filename** in the folder. The importer rewrites it to `<slug>/<file>`.
- **`_`-prefixed files are ignored**: drafts and source art.
- **Opt-in by presence.** A repo is in the catalogue when it has `catalogue/` *and* is listed in the catalogue's sources. Its private code stays private. Only the folder is published.

### In the catalogue (template, so every fork gets it)

`catalogue.config.yml` gains a sources list:

```yaml
sources:
  - repo: arfct/subpixel
  - repo: arfct/teleprompt.live
  - repo: arfct/arcminute-watchface
```

`npm run import` (`scripts/import-entries.js`):

1. Reads each source's `catalogue/` folder from its default branch through `gh api`, which works for private repos with the user's or CI's token.
2. Validates the frontmatter against the `_sample.md` fields: required fields present, `date` in YYYY or YYYY-MM, every media file exists. It fails loudly and names the repo.
3. Writes `projects/<slug>.md` with the importer's fields: `source: arfct/<repo>`, `source_commit: <sha>`, plus a comment saying *edit in the repo, not here*. It copies media to `media/<slug>/`.
4. Prints what changed. Committing and running `npm run sync` (media to R2) stay manual for now.

Hand-written entries stay supported: a file in `projects/` without `source:` is the catalogue's own, for projects with no repo. The importer only overwrites files it created, which it recognizes by `source:`.

**Why commit the imports rather than fetch at build time.** The build stays offline and deterministic. The published site doesn't depend on a GitHub token or on every repo staying reachable, and the diff of an import is reviewable in a PR.

### In ops (drafted on `arfct/ops` branch `danvers/catalogue-entry`)

- **`primer/products.md` gains a Catalogue entry section.** Every shipped product has a root `catalogue/` folder. The repo's agents keep it current, in the same PR as a change that would make it wrong. Store-asset sessions are the natural moment.
- **A new plugin skill, `catalogue-entry`**, is what agents in product repos load. It covers the folder, the frontmatter (pointing at `_sample.md` as canonical), the media rules (reuse store captures, re-export for the web, no branded store art), the workflow, and when to update.
- **`app-store-assets` gains a shared practice:** refresh `catalogue/` from the same captures before closing the session. `play-store-assets` already defers to that list.
- **`curator-voice` points at `catalogue-entry`.** Plugin bumps to 0.7.0.

### In the template's `new-project` skill

The skill changes target. Given a repo, it writes the entry into that repo's `catalogue/` folder (following `catalogue-entry`), then adds the repo to `sources:` and runs the import. Only repo-less projects get a hand-written file in `projects/`. Its voice section is replaced by a pointer to `curator-voice`, as the ops README already asks.

## Rollout

### 1. Build it (template)

- Importer, validation, `sources:` config, README and AGENTS.md sections, `new-project` skill update. These land in `arfct/catalogue` and merge into the fork as usual.
- Fix while there: `sync-media.js` uploads `_`-prefixed files despite its comment.
- Done when: importing a fixture repo yields a byte-identical `projects/` file and the site builds.

### 2. Pilot on subpixel

- Subpixel is the only entry with real media. Move `projects/subpixel.md` and `media/subpixel/` into `arfct/subpixel` as `catalogue/subpixel.md` plus its two images. Add the source, import, and check that the output matches the hand-written page.
- Done when: the live page is unchanged and its file in the catalogue carries `source:`.

### 3. Migrate the existing 15

One PR per product repo. Each PR moves the entry and does the editorial and media work at the same time, because the repo is where the facts can be checked. This closes catalogue-artifact #1 and #2 as it goes.

Two paths, by how active the repo is:
- **Active repos with agents working in them** (shareware, villainy, chronograph, teleprompt.live, arcminute-watchface, timezone.fyi, itty-bitty): the repo's agents do it with `catalogue-entry`, at the next store-asset session or release. For a first version, the existing entry text is seeded into `catalogue/` so nothing is lost.
- **Idle repos** (polychrome, wrench, pancakes, timer.supply, tab-recycler, mizaru, hypercube, translucent, tyde, redirect-app): one seeding PR each, from this side. The repos are quiet, so there's no store-asset session to wait for. They still get the file, because it's the cheapest home for the entry and the PR is small.

Per repo:
- Move the entry to `catalogue/<slug>.md`.
- Check `date` against first release (not repo creation), `role`, `url` (a live home beats a GitHub link), tags against the shared list, and `credits` (confirmed with Nicholas, never inferred from committers).
- Replace the placeholder media: capture live sites, take device screenshots or photos for hardware and native apps.

| Entry | Repo | Media path |
|---|---|---|
| itty-bitty, timezone-fyi, timer-supply, redirect-app, hypercube, translucent | same names (`timer.supply`, `timezone.fyi`) | capture the live site |
| chronograph, teleprompt | `chronograph`, `teleprompt.live` | iOS screenshots |
| chronology | `arcminute-watchface` (renamed from `chronology-watchface`). Decide whether the entry is renamed too | watch screenshots |
| tyde, mizaru | same names | photos (hardware) |
| tab-recycler, wrench, polychrome, pancakes | same names | extension or browser captures, or archival |

### 4. Add what's missing

- Start with catalogue-artifact #4: vapor, shareware, villainy, tiny.gifts, size.fyi. The adoption issues in `arfct/internal` (#3–#10) each end with "add to catalogue" and now point at "add `catalogue/`". These are active repos, so each one's agents write its entry with `catalogue-entry`.
- Then triage the other candidates with Nicholas: menagerie, enigma, integer, ishihara, system-six, quantum, silhouette, geocode, link-previews, og-svg, agent-connection, complicated-watchface, eink.page, hourglass, minder, pennybook, squircle.
- Out by default: org plumbing (ops, internal, .github, geist, multiplexer, catalogue, catalogue-artifact, artifact-web-example, artifact-logo, subpixel-private, tab-manager, ai-mode-skill) and forks of outside work (isograph).

### 5. Automate (later)

- A scheduled workflow in catalogue-artifact runs the import and opens a PR when anything changed. This pairs with catalogue #4 (CI deploy for the Cloudflare stack), so merging the import PR publishes.
- Optional: a `repository_dispatch` from product repos when `catalogue/` changes, for same-day updates.
- An org-wide check (in `moosh` or a sweep script) that lists shipped repos with no `catalogue/` folder.

## Alongside, not part of this plan

- Media is served from the rate-limited `pub-….r2.dev` address. Move it to a custom domain before the media count grows (README's own warning).
- ops #18: the catalogue-artifact repo's `homepage` still points at the template's GitHub Pages URL, and its dead `deploy-github-pages.yml` is still there.
- Entry pages could emit schema.org JSON-LD (`CreativeWork` / `SoftwareApplication`) built from the frontmatter, using the Artifact vocabulary at types.artifact.com (menagerie plan 43). This is derived output, so authors never write JSON-LD.

## Open questions

1. **Media in product repos:** commit images to each repo's `catalogue/` (simple, versioned with the product) or upload straight to R2 and reference absolute URLs (keeps binaries out of repos)? This plan commits them, capped at 2 MB each.
2. **Who owns tags:** a fixed list in the catalogue that the importer validates against, or free tags with a consistency pass?
