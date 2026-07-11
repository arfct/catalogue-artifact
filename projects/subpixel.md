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

Digital worlds used to fit in a text file. Subpixel insists they still can. Every world — 1-bit island, 16-bit meadow — is a single JSON document: a grid of characters and a legend to name them. Legible enough to write by hand; simple enough for a tile editor, or a language model, to author whole. Portals join the worlds, and they are inhabited — other players drift through in real time. A browser tab is citizenship.

Worlds validate, compile, and serve from the edge; presence runs through one small server per world. 2026.
