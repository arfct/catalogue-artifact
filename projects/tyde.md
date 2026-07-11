---
title: Tyde
date: 2025-02
tags: [hardware, Python, tools]
media:
  - src: _sample/16-10.png
    caption: Tide meter display — current height, next high and low
url: https://github.com/arfct/tyde
role: Engineering
---

The ocean keeps a schedule; this object posts it on the wall. Tyde is a physical tide meter: a Python script pulls two days of NOAA predictions for a chosen station and renders the current height, its direction of travel, and the next high and low water onto an e-ink panel. Alongside the tide it draws the day's sunrise, sunset, and golden hours, and a moon whose terminator curve is computed for the actual phase.

Python on a Pimoroni Inky display, NOAA predictions at 15-minute intervals, type set in Hanken Grotesk. 2025.
