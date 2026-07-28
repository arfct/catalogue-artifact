# Artifact site pages — catalogue at /catalog/, and the contribute page

**Date:** 2026-07-27
**Repo:** `arfct/catalogue-artifact` (Artifact's site)
**Depends on:** [multi-page support in the template](2026-07-27-catalogue-pages-design.md)
**Status:** draft, pending owner review

## Context

Artifact wants a page where someone can give either time or money, unlisted for now
because the point of this phase is working out the content. It becomes prominent later.

This supersedes an earlier draft that built the page as a second Vite entry point in
`arfct/web`. That approach is abandoned: Vite is a bundler, not a site generator, and
every new page required hand-editing a `rollupOptions.input` map. All the content
decisions below survive from that draft unchanged; only the mechanics differ.

`arfct/web` and the Netlify site serving `artifact.com` are left alone in this phase.
Nothing here touches production.

### Organization facts (from the IRS determination letter)

**Artifact Creative Foundation**, a Delaware nonprofit corporation. EIN 99-4345481.
Determination letter dated 08/28/2024, exemption effective 05/04/2023. Exempt under
§501(c)(3), classified as a **private foundation** under §509(a) and a **private
operating foundation** under §4942(j)(3). Donors can deduct contributions under §170.
Form 990-PF required annually.

Never describe Artifact as a "public charity" — it is a private foundation, and the
claim would be false. Private *operating* foundation is the favorable classification
here: it carries the same donor AGI deduction limits as a public charity.

The determination letter also carries a `C/O` address routing through a named
individual. **It must not appear on the site or anywhere in this repo.**

## Goals

- Catalogue mounted at `/catalog/`, entries at `/catalog/<slug>/`.
- A contribute page presenting both ways to give, linking out for both.
- No backend, no forms, no stored donor data, no secrets.
- Accurate about tax status without overstating it.
- Reachable by URL, absent from navigation.

## Non-goals

Not building, because Stripe's hosted page does all of it: amount presets, recurring
toggles, tribute fields, donor records, receipts, acknowledgment mail, thank-you pages.
Not building any volunteer intake form or needs/roles list — an intake form creates an
inbox somebody must answer, and a needs list goes stale. Links rot in neither way.

## Configuration

```yaml
catalog_path: /catalog/
entry_path: /catalog/
```

Entry URLs move from `/p/<slug>/` to `/catalog/<slug>/`. Safe to do now: the site is
only at `catalogue-artifact.pages.dev` and nothing public links to it yet. Doing it
before `artifact.com` points here avoids ever having to redirect.

`/catalog` is the URL while the repo, config title, and branding all say "catalogue".
That mismatch is deliberate — note it in the config so nobody "fixes" it later.

`nav:` stays **empty**. That is what makes the contribute page unlisted.

## Root URL

With the catalogue at `/catalog/`, `/` has nothing. Until the homepage is ported,
`_redirects` sends `/` to `/catalog/` with a **302** — temporary, because `/` becomes
the real homepage later. Cloudflare Pages supports `_redirects` for redirects (though
not for external-origin rewrites).

## The contribute page

`pages/contribute.md`, permalink `/contribute/`, no `nav_label`.

1. **Heading** — "Contribute".
2. **Framing** — one short paragraph on what contributing to Artifact means.
3. **Give time** — Artifact's work is open source; the useful thing is to pick up
   something real. Two links: the GitHub org (`https://github.com/arfct`) and the
   Discord invite (`https://discord.com/invite/fmvwuvjJ8Y`), both taken from the
   current `arfct/web` homepage. No form, no email intake.
   Do **not** link `arfct/ops` (the Primer) — it is a private repo as of 2026-07-27.
4. **Give money** — two paths:
   - *Online.* A "Give" link to a Stripe-hosted Payment Link. **Conditional:** rendered
     only once a Payment Link URL exists. Until then the line states that card giving is
     coming soon. No `#` placeholder, so there is no dead link and nothing to clean up.
   - *Cheque.* Payable to **Artifact Creative Foundation**, mailed to:

     ```
     Artifact Creative Foundation
     PO Box B
     Kingsville, TX 78364
     ```

     (Kingsville uses 78364 for PO Boxes and 78363 for street addresses.)
5. **Status line** — "Artifact Creative Foundation is a 501(c)(3) nonprofit
   (EIN 99-4345481). Contributions are tax-deductible."

Any page-specific CSS goes in `styles/custom.css`, not `styles/main.css`, so template
updates keep merging cleanly.

## Prerequisites (owner, not implementer)

1. **Create the Stripe account.** Requires business identity and bank details, so it
   cannot be automated. Legal name Artifact Creative Foundation; EIN 99-4345481;
   business type nonprofit corporation. Stripe also needs a **physical business
   address**, which a PO Box generally will not satisfy — this is still open and is the
   critical path for online giving.
2. **Apply for Stripe's nonprofit rate** (~2.2% + 30¢ vs. standard 2.9% + 30¢ for US
   501(c)(3)s). An application, not automatic; it wants the determination letter. Do it
   before accepting gifts.
3. **Create the Payment Link** with "let customers decide what to pay" enabled, plus
   the recurring option if wanted. That setting is what makes a Payment Link work as a
   donation page, and it is why no amount UI is needed here.
4. Hand over the URL; the implementer adds it in one line.

## Risks and follow-ups

- **Unlisted means unlinked, not private.** No nav entry and no inbound links, but no
  `noindex` either — the owner's explicit choice. Nothing prevents indexing once
  anything external links to it. Hardening is a meta tag plus a `robots.txt` disallow.
- **Solicitation as a private foundation.** Private foundations are normally funded by a
  single donor or family rather than public appeal, and publicly soliciting gifts can
  trigger **state charitable solicitation registration** in a number of states. Form
  990-PF is public. None of this blocks an unlisted page, but confirm with counsel
  before the page becomes prominent. This spec is not legal or tax advice.
- The page will live at `catalogue-artifact.pages.dev/contribute/` until cutover. Fine
  while unlisted; re-homed by the cutover spec.

## Verification

- `npm run dev`: `/contribute/` renders; `/catalog/` shows the index; a project resolves
  at `/catalog/<slug>/`; `/` redirects to `/catalog/`.
- The entry back-link and site title both go somewhere real, not a 404.
- No nav anywhere on the site, and `/contribute/` appears in no listing or sitemap.
- `npm run build` succeeds and media still resolves (R2 sync unchanged).
- Grep the repo for "Kleberg", "Mendez", and "78363" — all three must return nothing.
