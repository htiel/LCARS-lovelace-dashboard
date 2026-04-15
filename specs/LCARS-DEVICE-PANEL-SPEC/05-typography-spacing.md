## 5. Typography & Spacing

### Font Sizes (Three sizes only — Bracer Jack Rule 6)

| Element                | Size Token                  | Value      | Usage                            |
|------------------------|-----------------------------|------------|----------------------------------|
| Device name            | `--lcars-font-size-sub`     | `1.25rem`  | Panel header — sub-header tier   |
| Sensor labels          | `--lcars-font-size-data`    | `0.875rem` | Telemetry text — normal data     |
| Sensor values          | `--lcars-font-size-data`    | `0.875rem` | Same tier, bold weight           |
| Control button text    | `--lcars-font-size-data`    | `0.875rem` | Button labels — normal data      |
| Device badge/model     | `--lcars-font-size-data`    | `0.875rem` | Secondary info                   |

**No font size exceptions**. If something needs emphasis, it gets color or weight — never a fourth font size.

### Spacing Constants (Jörn Weißenborn Grid)

| Spacing                    | Token / Value               | Usage                                    |
|----------------------------|-----------------------------|------------------------------------------|
| Gap between all elements   | `var(--lcars-gap)` = 0.25rem | Universal LCARS grid spacing             |
| Panel internal padding     | `var(--lcars-gap)` = 0.25rem | Inside the panel frame border            |
| Sensor line min-height     | 1.75rem                     | ~28px — exceeds WCAG 2.5.8 (24px min)   |
| Control button height      | `var(--lcars-btn-height)` = 3rem | Standard LCARS button = 48px       |
| Control button min-width   | 6rem = 96px                 | Exceeds WCAG 2.5.8 (24px)               |
| Media frame border         | 3px solid                   | Viewscreen border — matches existing camera-frame |
| Panel outer border (left/bottom) | 4px solid             | Thick side of frame (Bracer Jack Rule 2) |
| Panel outer border (top/right)   | 2px solid             | Thin side — thick→thin transition        |

### Text Treatment

- **ALL UPPERCASE** for: device name, sensor labels, sensor values, button text
- **Mixed case** ONLY for: none in this panel (no body paragraphs)
- **Letter-spacing**: `0.05em` on headings (matching existing `.lcars-heading`)
- **Font-weight**: `700` (bold) for sensor values only; `400` (normal) for everything else

---
