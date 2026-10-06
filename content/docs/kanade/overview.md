---
title: Overview
order: 0
source: https://github.com/0x1d1e/kanade/blob/main/README.md
---
A top-center Dynamic Island for niri, built with [Amane](https://github.com/MystiaFin/amane).

![Concept video: the island expanding into a music player.](videos/kanade-concept.mp4)

AI-generated concept, not a capture of the current build.

## Limitations

- The island stays visible over fullscreen windows. niri 26.04 does not report fullscreen state, and guessing it from window size also catches maximized windows, so suppression waits for [niri#2836](https://github.com/niri-wm/niri/pull/2836). See [ADR 0002](docs/adr/0002-defer-fullscreen-suppression.md).
- The Launcher cannot tell when an app fails to start. Amane's `DesktopApp::launch` runs the entry through `sh -c` and reports nothing back, so a broken `Exec` line just closes the island.
- The Launcher shows "Finding apps" forever on a system with no launchable `.desktop` entries. Amane's `Apps` is empty both while scanning and after finding nothing, and exposes no scan-complete state.
