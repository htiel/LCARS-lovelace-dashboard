## 14. File Registration Plan

| Component Tag               | File                            | Purpose                            |
|-----------------------------|---------------------------------|------------------------------------|
| `lcars-irrigation-panel`    | `lcars-irrigation-panel.js`     | Full irrigation panel component    |

Extends `LcarsDevicePanelBase`:
- `panelFrameColor` → Static `var(--lcars-ice)`
- `_isPrimaryDomain(domain)` → `domain === 'switch'` (zone switches)
- `_renderMedia()` → renders the zone grid
- No media frame (viewscreen) — the zone grid IS the primary content

---
