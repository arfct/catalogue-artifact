---
name: new-project
description: Use when the user wants to add a project or entry to this catalogue site — whether they name a GitHub repo, point at a local folder or files, or just say "add a project" with nothing prepared.
---

# New Project Entry

Create `projects/<slug>.md` plus its media, matching the site's existing conventions exactly.

## Ground truth

- `projects/_sample.md` is the canonical entry format — read it before writing anything. It is a permanent reference, deliberately excluded from the published site by its `_` prefix. Never delete it or suggest deleting it.
- Read `catalogue.config.yml` and note `stack:` before touching media (see Media below).

## 1. Gather facts

Pick the mode by what the user gave you:

- **GitHub repo** — `gh repo view <org>/<name>`, then README and source for what it is, when, and what it's built with.
- **Local folder** — read its README and code directly.
- **Nothing** — interview the user: one question at a time, plain language, no jargon. Cover: what is it called? what is it / what did you make? when (year + month)? what was your role? client, if any? a few tags?

Facts you infer (especially the date, role, and tags) are guesses — confirm them with the user instead of presenting them as fact.

## 2. Write the entry

Create `projects/<slug>.md` — kebab-case slug; it becomes the URL `/p/<slug>/`.

- Frontmatter: same fields, order, and formats as `_sample.md`. `date: YYYY-MM` is when the project happened, not when its repo was created.
- Tags: short, lowercase, kebab-case (`open-source`, not `open source`). Reuse tags from existing entries where they fit.
- Body: 1–3 short paragraphs, plain and factual, in the voice of the existing entries. No marketing tone.

## 3. Media

In order of preference:

1. **User's images** — copy into `media/<slug>/`, give them descriptive names, write a caption and alt text for each.
2. **Capture** — if the project is a live site or runnable app, offer to screenshot it. Frame near 4:3 (index cards crop to 4:3), ~1600px wide.
3. **Placeholders** — point `media:` at `_sample/<ratio>.png` files and tell the user which real images to supply.

Stack determines where media must go (`catalogue.config.yml`):

- `github-pages` — files in `media/` are served directly; adding them is enough.
- `cloudflare` — media is served from R2, not the repo. After adding files to `media/`, run `npm run sync` or the images will 404 in production.

## 4. Verify

Run the dev server and check both pages render correctly: the new card on `/` and the detail page at `/p/<slug>/`. Show the user what it looks like.

## 5. Hand off

Don't commit, push, or deploy unless asked. Tell the user what will publish it:

- `github-pages` — commit and push to main; the site rebuilds automatically.
- `cloudflare` — `npm run sync` for media, `npm run deploy` for the site (or push, if CI deploys are set up).
