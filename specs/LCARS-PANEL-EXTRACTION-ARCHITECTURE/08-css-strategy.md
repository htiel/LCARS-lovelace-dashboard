## 7. CSS Strategy

### 7.1 Three-Tier CSS Architecture

```
Tier 1: lcars-styles.js (lcarsBaseStyles)
  ├── LCARS color palette (CSS custom properties)
  ├── Sizing tokens (unit, vunit, gap, etc.)
  ├── Typography
  └── Global reset / host styles

Tier 2: components/ (shared UI primitives — own shadow DOM)
  ├── <lcars-panel-frame> (corner brackets, header, panel code)
  ├── <lcars-sensor-row> (indicator dot, label, value, click handler)
  ├── <lcars-option-strip> (radiogroup selector, unified CSS)
  ├── <lcars-section-divider> (horizontal rule + label)
  └── <lcars-setpoint> (+/- buttons, debounced events)
Tier 3: panels/*/lcars-*-panel-styles.js (panel-specific CSS modules)
  └── Exported as `css` tagged template, imported by panel JS
      Scoped to that panel's shadow DOM
      - Climate: setpoint knob, HVAC mode indicator, temperature scale
      - Alarm: PIN keypad grid, zone status indicators, countdown timer
      - Media: playback controls, album art, progress bar
      - Power: arc SVG, consolidated grid, responsive breakpoints (~990 lines)
      - etc.
```

### 7.2 CSS Budget Per Tier

Current CSS in homepage card: **~2,837 lines** in a single `static get styles()`.

Projected distribution:
| Tier | Lines | Notes |
|---|---|---|
| Tier 1 (lcarsBaseStyles) | ~120 | Already exists. Unchanged. |
| Tier 2 (components/) | ~237 | Frame ~115 + sensor row ~40 + option strip ~50 + divider ~16 + setpoint ~16 |
| Tier 3 (per panel avg) | ~150 | Panel-specific only (no frame/sensor CSS). 10 panels × 150 = ~1,500 lines total |
| Orchestrator CSS | ~300 | Area layout, domain groups, split layout, device headers |
| **Total** | **~2,157** | **~680 lines eliminated** — duplicated frame + sensor + option CSS |
96 | Already exists. 196 lines verifi
That is a **24% reduction** in total CSS through deduplication + component encapsulation. Measurable.

### 7.3 Style Isolation

Each panel is a custom element with shadow DOM. Its Tier 3 CSS cannot leak to other panels or to the host. This eliminates the current risk of CSS specificity conflicts between panel renderers sharing one shadow root.

---
