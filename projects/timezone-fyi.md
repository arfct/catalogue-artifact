---
title: Timezone.fyi
date: 2020-11
tags: [web, tools]
media:
  - src: timezone-fyi/screen.png
    caption: The site, explaining its own URL format
    alt: A plain page titled timezone.fyi showing the URL structure and the zone formats it accepts
url: https://timezone.fyi
role: Design, Engineering
---

"What time is it there when it's 3pm here" is arithmetic nobody should do twice. timezone.fyi does it once and hands you a link. The URL is the interface: timezone.fyi/10am,NYC,LON,TOK renders that hour in every listed zone, ready to paste into a thread. It accepts abbreviations, city aliases, IANA names, GMT offsets, and airport codes — and will hand back an .ics file so the time survives contact with a calendar.

A serverless function parses the path; no app, no account. 2020.
