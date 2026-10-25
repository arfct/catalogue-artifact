# Multi-page support in the catalogue template

**Date:** 2026-07-27
**Repo:** `arfct/catalogue` (the template — upstream)
**Status:** draft, pending owner review

## Context

`arfct/catalogue` is an Eleventy 3 template for publishing a catalogue of work.
Today it produces exactly two kinds of page: the index at `/` (`index.njk`, which
declares `permalink: /`) and one detail page per project at `/p/<slug>/`, from
Markdown files in `projects/`.

Artifact needs a site *around* its catalogue — a homepage, a contribute page, and
eventually the support and privacy pages currently hosted on Google Sites. The
capability belongs upstream in the template rather than in Artifact's fork, so that
the fork adds only content and never diverges on mechanism. This mirrors the pattern
already established by `styles/custom.css`, which exists so template updates merge
cleanly.

The template ships this capability **unused**: no pages, empty nav, and defaults that
reproduce today's output exactly.

## Goals

- Host arbitrary standalone pages alongside the catalogue.
- Mount the catalogue index and entries at a configurable path.
- Allow a page to carry a bundled client-side script.
- Change nothing for existing forks that don't opt in.

## Non-goals

No CMS, no collections beyond `entries`, no tag pages, no pagination, no RSS. Nav is a
flat list — no dropdowns or nesting.

## Design

### Standalone pages

New `pages/` directory. One file per page, Markdown or Nunjucks, using a new
`_includes/page.njk` layout kept deliberately distinct from `entry.njk` (entries are
catalogue records with media and dates; pages are prose).

Frontmatter: `title`, optional `permalink` (defaults to `/<fileSlug>/`), optional
`nav_label` and `nav_order`, and optional `script`.

The `_`-prefix exclusion already used by `projects/` applies here too, so
`pages/_sample.md` can document the format without publishing. `projects/_sample.md`
remains the canonical *entry* format and is not touched.

### Configurable mount paths

Three additions to `catalogue.config.yml`, all defaulting to current behavior:

```yaml
home_path: /        # where the site logo/back-link points
catalog_path: /     # where the catalogue index is mounted
entry_path: /p/     # prefix for individual entry pages
```

- `index.njk`'s hardcoded `permalink: /` becomes computed from `catalog_path`.
- Entry permalinks become `{{ entry_path }}<slug>/`, preserving `/p/<slug>/` by default.
- `_includes/layout.njk` currently hardcodes `href="/"` in both the entry back-link and
  the site title. Both must read from config, or a relocated catalogue links back to a
  page that doesn't exist. **This is the most likely thing to be missed.**

Setting `catalog_path` and `entry_path` to the same value (Artifact will use
`/catalog/`) puts the index at `/catalog/` and entries at `/catalog/<slug>/`. These
cannot collide, since an entry slug is never empty.

### Navigation

Optional `nav:` list in config, each item `{label, path}`, rendered in
`layout.njk` only when non-empty. Pages may also self-register via `nav_label` /
`nav_order`. **Absence from nav is how a page stays unlisted** — Artifact depends on
this for its contribute page, so a page must never be auto-added to nav.

Default is empty, so existing forks render no nav and look unchanged.

### Page scripts

A page declaring `script: foo.js` gets `scripts/pages/foo.js` bundled to
`_site/js/foo.js` and referenced from that page only.

Bundling is required because the motivating case — Artifact's three.js logo — is a
310-line ES module whose sole import is the bare specifier `import * as THREE from
'three'`. Browsers cannot resolve bare specifiers and Eleventy does not bundle.

Implementation: add `esbuild` as a devDependency and a `build:js` npm script running
before `eleventy`. Ships with zero scripts, so the step is a no-op for existing forks.

## Backward compatibility

This is a template with forks in the wild, so it is a hard requirement: with no config
changes and no `pages/` directory, the built output must be **identical** to before —
index at `/`, entries at `/p/<slug>/`, no nav, no JS bundle.

## Documentation

`AGENTS.md` and `README.md` need a "pages" section: the `pages/` convention, the three
path settings, nav, and page scripts. AGENTS.md's "What this is" currently states the
index is at `/` and entries at `/p/<slug>/` as fixed facts; both become defaults.

Optional, deferred: a `new-page` skill in `.claude/skills/` mirroring the existing
`new-project` skill. Not required for Artifact's needs.

## Verification

- With an unmodified config: `npm run build` output matches the pre-change build,
  file for file. This is the gate that protects existing forks.
- With `catalog_path: /catalog/` and `entry_path: /catalog/`: index at
  `/catalog/index.html`, entries at `/catalog/<slug>/index.html`, and the layout's
  back-link and site title both resolve to real URLs rather than `/`.
- A page in `pages/` with no `nav_label` builds and is reachable, and appears in no nav.
- A page declaring a `script` gets a bundle with no bare import specifiers left in it.
- `projects/_sample.md` still excluded and still present.
