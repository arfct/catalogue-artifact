---
title: Subpixel
date: 2026-07
tags: [web, game, multiplayer]
media:
  - src: subpixel/island.png
    caption: A 1-bit island world, explored on foot
    alt: Top-down black-and-white pixel-art island with palm trees, a house, and a small character standing on sand
  - src: subpixel/plaza.png
    caption: The plaza — a full-color crossroads between worlds
    alt: Top-down pixel-art plaza with a stone platform surrounded by grass and sandy paths
url: https://subpixel.org
role: Design, Engineering
---

Worlds small enough to read whole. Subpixel keeps each one to a single JSON document — a grid of characters and a legend that names them — and from that austerity builds a connected web of pixel-art places, 1-bit through 16-bit, threaded together by portals. A world simple enough to write by hand is simple enough for a tile editor, or an LLM, to write too; the format refuses to privilege any author.

Exploration is communal. Visitors move through each other's grids in the browser, building as they go, presence flickering live across the map. The document stays the source of truth: validated, compiled, then served flat — the multiplayer layer sits beside it rather than inside it.

Worlds on Cloudflare R2; one Durable Object per world for presence. 2026.
