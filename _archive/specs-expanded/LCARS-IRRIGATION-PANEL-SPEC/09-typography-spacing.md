## 8. Typography & Spacing

### Font Sizes (Three sizes only — Bracer Jack Rule 6)

| Element                  | Size Token                   | Value      | Usage                             |
|--------------------------|------------------------------|------------|-----------------------------------|
| Device name              | `--lcars-font-size-sub`      | `1.25rem`  | Panel header                      |
| Countdown timer          | `--lcars-font-size-sub`      | `1.25rem`  | Active zone time remaining        |
| All other text           | `--lcars-font-size-data`     | `0.875rem` | Zone names, status, labels, attrs |

**Three font sizes. No exceptions.** This panel doesn't have a large "hero" number like the climate panel's SVG temperature — the zone grid is a dense data display. The countdown timer for the active zone uses sub-header size to draw the eye to the running action.

### Spacing Constants (Jörn Weißenborn Grid)

| Spacing                      | Token / Value                | Usage                                       |
|------------------------------|------------------------------|---------------------------------------------|
| Gap between all elements     | `var(--lcars-gap)` = 0.25rem | Universal LCARS grid spacing                |
| Panel internal padding       | `var(--lcars-gap)` = 0.25rem | Inside the panel frame border               |
| Zone row min-height          | 2.25rem = 36px               | Exceeds WCAG 2.5.8 (24px min)              |
| Zone button height           | `var(--lcars-bar-h)` = 3rem  | Standard LCARS button = 48px               |
| Zone button min-width        | 5rem = 80px                  | Exceeds WCAG 2.5.8                          |
| Standby button height        | 3rem = 48px                  | Standard LCARS button                       |
| Fill bar height              | 0.5rem = 8px                 | Minimal track — non-interactive visual only |
| Panel outer border (left/bottom) | 4px solid                | Thick side (Bracer Jack Rule 2)             |
| Panel outer border (top/right)   | 2px solid                | Thin side — thick→thin                      |

### Text Treatment

- **ALL UPPERCASE** for: device name, zone names, status labels, sensor labels, values, button text, attributes
- **Font-weight**: `700` (bold) for status values, countdown, button text. `400` (normal) for everything else

---
