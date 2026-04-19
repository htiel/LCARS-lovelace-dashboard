## 13. File Registration Plan

| Component Tag              | File                          | Purpose                         |
|----------------------------|-------------------------------|---------------------------------|
| `lcars-media-panel`        | `lcars-media-panel.js`        | Full panel component            |

Extends `LcarsDevicePanelBase`:
- `panelFrameColor` → `var(--lcars-african-violet)`
- `mediaAspectRatio` → `1 / 1` (overridden to `16 / 9` for video content)
- `_isPrimaryDomain(domain)` → `domain === 'media_player'`
- `_renderMedia()` → renders viewscreen, now playing, progress, and transport controls

---
