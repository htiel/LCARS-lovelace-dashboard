## 14. File Registration Plan

| Component Tag                    | File                            | Purpose                           |
|----------------------------------|---------------------------------|-----------------------------------|
| `lcars-atmoscrubber-panel`       | `lcars-atmoscrubber-panel.js`   | Full panel component              |

Extends `LcarsDevicePanelBase`:
- `panelFrameColor` → `var(--lcars-bluey)`
- `mediaAspectRatio` → N/A (cylinder has explicit dimensions)
- `_isPrimaryDomain(domain)` → `domain === 'fan'`
- `_renderMedia()` → renders the `atmos-cylinder` with particles

---

*"The environmental systems on a Galaxy-class starship process over 7,000 cubic meters of atmosphere per hour. You'd never know it — they just work. That's what good engineering looks like."*  
— La Forge, Main Engineering

---
