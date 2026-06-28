# Catalogue Raisonné

A template for building a beautiful, long-lasting online catalog of your work —
design, engineering, art, writing, anything. Fork it, add your projects, and get
a published site with a browsable **index** and a **detail page** for every
project. Works on screen and prints cleanly to PDF.

Your project descriptions live as plain text files in the repo. Your images live
alongside your entries or in cloud storage depending on the stack you choose.

> **New here? You don't have to do this alone.** See **[AGENTS.md](AGENTS.md)**
> for how to use Claude to walk through every step, including writing your
> project files for you.

---

## Choose your stack

Pick one, or run both in parallel.

| | **GitHub Pages** | **Cloudflare** |
|---|---|---|
| **Best for** | Simplest setup, small–medium media | Larger media, custom domain, fast CDN |
| **Accounts needed** | Just GitHub | Cloudflare (free) |
| **Your site's address** | `you.github.io/catalogue` | `your-project.pages.dev` |
| **Custom domain** | Yes | Yes, free |
| **Media stored** | In the repo, served by GitHub | Cloudflare R2 (10 GB free, zero egress) |
| **Media limit** | 100 MB/file, ~1 GB total | 10 GB free |
| **Secrets needed** | None | 5 |

---

## Setup — GitHub Pages stack

### 1. Fork this repo
Click **Fork** at the top right on GitHub.

### 2. Enable GitHub Pages
In your fork: **Settings → Pages → Source: GitHub Actions**. No secrets needed.

### 3. Edit your config
Open `catalogue.config.yml`:
```yaml
title: Your Name
description: A catalog of my work
author: Your Name
accent_color: "#1a1a1a"
stack: github-pages
```

### 4. Add your first project
Create `_entries/my-project.md`:
```markdown
---
title: My Project
date: 2024-06
media:
  - src: my-project/hero.jpg
    caption: Optional caption
  - src: my-project/detail.jpg
---

A few sentences about the project. What it was, what you did, why it matters.
```

### 5. Add your images
Put images in `media/<project>/` (e.g. `media/my-project/hero.jpg`) and commit.
GitHub serves them directly alongside your site. Keep images under **100 MB**
and export at **~2000px on the long edge** — there's no automatic resizing.

### 6. Push
Every push to `main` rebuilds and republishes automatically. Your site will be
live at `you.github.io/catalogue`.

---

## Setup — Cloudflare stack

### 1. Fork this repo
Click **Fork** at the top right on GitHub.

### 2. Create a Cloudflare account
Sign up at <https://dash.cloudflare.com/sign-up>.

### 3. Create an R2 bucket for media
1. In the Cloudflare dashboard → **R2** → create a bucket (e.g. `my-catalogue`).
2. Attach a **custom domain** to the bucket (e.g. `media.yourdomain.com`) so
   media is served via Cloudflare's CDN. (The `pub-<hash>.r2.dev` address works
   for testing but is rate-limited — use a custom domain for your live site.)
3. Create an **R2 API token** under Account → R2 → Manage API Tokens. Copy the
   **Access Key ID**, **Secret Access Key**, and your **Account ID**.

### 4. Create a Pages project for your site
**Workers & Pages → Create → Pages** → connect your forked repo. Note the
**project name**. Create a **Cloudflare API token** with Pages edit permissions.

### 5. Edit your config
```yaml
title: Your Name
description: A catalog of my work
author: Your Name
accent_color: "#1a1a1a"
stack: cloudflare

cloudflare:
  pages_project: my-catalogue
  r2_media_base_url: https://media.yourdomain.com
```

### 6. Add secrets to GitHub
**Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API token |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 token access key ID |
| `R2_SECRET_ACCESS_KEY` | R2 token secret |
| `R2_BUCKET` | Your R2 bucket name |

### 7. Add your first project
Same format as GitHub Pages (see above).

### 8. Add your images
Put web-ready images in `media/<project>/` and commit. A GitHub Action uploads
them to R2, writes the URLs into your entry file, and removes the originals from
the repo. Keep each image under **100 MB** and export at **~2000px on the long
edge**.

For large files or video: upload directly via the R2 dashboard and paste the
URLs into your entry's `media:` list.

### 9. Push
Every push to `main` rebuilds and republishes automatically.

---

## Running both stacks in parallel

Set up both sets of secrets/settings. Both deploy workflows are independent —
they'll both run on every push and produce the same site at two URLs. Good for
redundancy or while migrating between stacks.

---

## Entry format

Each project is a Markdown file in `_entries/` with YAML frontmatter:

```markdown
---
title: Project Title                 # required
date: 2024-06                        # required (YYYY or YYYY-MM)
tags: [print, identity]             # optional
media_type: image                   # optional: image | video | audio
media:                              # required
  - src: project/hero.jpg           # relative path or absolute URL
    caption: Optional caption
    alt: Optional alt text
  - src: project/detail.jpg         # caption and alt are optional
client: Client Name                 # optional
role: Design, Art Direction         # optional
---

Write your project description here in plain Markdown. As long or short as
you like. This becomes the body of the detail page.
```

The filename stem becomes the URL slug: `_entries/sfmoma-poster.md` →
`/entry/sfmoma-poster/`.

---

## Updating your work

- **Edit a project:** change its `_entries/` file and commit.
- **Replace an image:** commit a new file with the same name. GitHub rebuilds
  automatically. On Cloudflare, the R2 sync runs and updates the URL.
- **Add a project:** add a new `_entries/` file and images.

---

## Working locally with large files

```bash
git clone https://github.com/YOU/catalogue.git
cd catalogue
npm install

cp .env.example .env    # add your R2 keys (Cloudflare stack only)

npm run sync            # upload media-local/ to R2, fill in entries
npm run dev             # preview at localhost:8080
```

`media-local/` is gitignored — large originals stay on your machine.

---

## Printing / PDF export

Open your site and use your browser's **Print** command. The layout switches to
a clean print style.

---

## Internet Archive

IA is an excellent long-term home for media (permanent, free, hotlinkable) and
is planned as an alternate media backend in a future version. It cannot host
HTML. If you want to archive your media on IA today, upload files at
<https://archive.org/upload> and paste the URLs into your entries as absolute
URLs.

---

## Project layout

```
catalogue.config.yml   ← your name, settings, stack choice
_entries/              ← one .md file per project
media/                 ← images (committed, synced to R2 or served directly)
media-local/           ← large media, local only, never committed
styles/, _includes/    ← CSS and templates (don't need to touch)
.github/workflows/     ← build and deploy automation
```

See **[PLAN.md](PLAN.md)** for the full design rationale.

---

## Getting help

Open **[AGENTS.md](AGENTS.md)** and ask Claude — it can choose a stack with you,
write entry files, configure secrets, and diagnose errors.
