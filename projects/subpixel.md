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

A multiplayer web of small pixel-art worlds you can explore and build together, right in the browser. Worlds range from 1-bit to 16-bit universes, connected to each other by portals.

Each world is a single JSON document — a character grid with a legend — simple enough to be written by hand, by a tile editor, or by an LLM. Worlds are validated, compiled, and served from the edge, with live presence flowing through one small server per world.
