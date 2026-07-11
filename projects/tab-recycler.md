---
title: Tab Recycler
date: 2020-04
tags: [browser, tools, open-source]
media:
  - src: _sample/16-9.png
    caption: Extension popup — tabs waiting to be recycled after Figma launched
url: https://github.com/arfct/tab-recycler
role: Engineering
---

Every handoff leaves a corpse. Figma, Zoom, Notion — click their links and a browser tab opens just long enough to launch the native app, then sits there, blank and purposeless. Nobody closes these tabs. They accumulate silently across the tab strip.

Tab Recycler closes each one the moment the native app has launched. A Chrome extension, using URL monitoring and content scripts to spot the leftover tab and take it away.
