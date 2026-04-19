## 11. Typography & Spacing

### Font Sizes (Three sizes only — Bracer Jack Rule 6)

| Element                  | Size Token                   | Value      | Usage                             |
|--------------------------|------------------------------|------------|-----------------------------------|
| Current temperature (SVG)| Title tier equivalent        | `42` (SVG) | Large viewscreen readout          |
| Device name, setpoint val| `--lcars-font-size-sub`      | `1.25rem`  | Panel header, setpoint display    |
| All other text           | `--lcars-font-size-data`     | `0.875rem` | Sensor labels, values, buttons    |

**Three font sizes. No exceptions.** The SVG temperature text at font-size 42 (within a 200×130 viewBox) maps to the "title" tier visually. Everything else is sub-header or data.

### Spacing Constants (Jörn Weißenborn Grid)

| Spacing                      | Token / Value                | Usage                                       |
|------------------------------|------------------------------|---------------------------------------------|
| Gap between all elements     | `var(--lcars-gap)` = 0.25rem | Universal LCARS grid spacing                |
| Panel internal padding       | `var(--lcars-gap)` = 0.25rem | Inside the panel frame border               |
| Sensor line min-height       | 1.75rem                      | ~28px — exceeds WCAG 2.5.8 (24px min)      |
| Mode button height           | `var(--lcars-btn-height)` = 3rem | Standard LCARS button = 48px           |
| Mode button min-width        | 5rem = 80px                  | Exceeds WCAG 2.5.8                          |
| Aux button height            | 2.25rem = 36px               | Compact but exceeds 24px minimum            |
| Setpoint ± button size       | 2.5rem × 2.5rem = 40px      | Exceeds WCAG 2.5.8                          |
| Media frame border           | 3px solid                    | Viewscreen border — matches Device Panel    |
| Panel outer border (left/bottom) | 4px solid                | Thick side (Bracer Jack Rule 2)             |
| Panel outer border (top/right)   | 2px solid                | Thin side — thick→thin                      |

### Text Treatment

- **ALL UPPERCASE** for: device name, sensor labels, sensor values, button text, setpoint labels, "CURRENT"
- **Mixed case** ONLY for: none in this panel
- **Letter-spacing**: `0.05em` on headings and labels (matching existing `.lcars-heading`)
- **Font-weight**: `700` (bold) for sensor values, setpoint values, action badge. `400` (normal) for everything else

---
