## 11. Typography & Spacing

### Font Sizes (Three sizes only — Bracer Jack Rule 6)

| Element                   | Size Token                   | Value      | Usage                              |
|---------------------------|------------------------------|------------|-------------------------------------|
| Current temperature (SVG) | Title tier equivalent        | `48` (SVG) | Large viewscreen readout            |
| Device/location name      | `--lcars-font-size-sub`      | `1.25rem`  | Panel header                        |
| All other text            | `--lcars-font-size-data`     | `0.875rem` | Sensor labels, values, forecast text|

**Three font sizes. No exceptions.** The SVG temperature text at font-size 48 (within a 200×160 viewBox) maps to the "title" tier visually. Everything else is sub-header or data.

### Spacing Constants (Jörn Weißenborn Grid)

| Spacing                          | Token / Value                | Usage                                        |
|----------------------------------|------------------------------|----------------------------------------------|
| Gap between all elements         | `var(--lcars-gap)` = 0.25rem | Universal LCARS grid spacing                 |
| Panel internal padding           | `var(--lcars-gap)` = 0.25rem | Inside the panel frame border                |
| Sensor line min-height           | 1.75rem                      | ~28px — exceeds WCAG 2.5.8 (24px min)       |
| Forecast tile min-width          | 4.5rem = 72px                | Comfortable for day + data                   |
| Forecast tile padding            | 0.25rem 0.375rem             | Compact but readable spacing                 |
| Media frame border               | 3px solid                    | Viewscreen border — matches Device Panel     |
| Panel outer border (left/bottom) | 4px solid                    | Thick side (Bracer Jack Rule 2)              |
| Panel outer border (top/right)   | 2px solid                    | Thin side — thick→thin                       |
| Day-arc bar height               | 3px                          | Subtle position indicator                    |
| Range bar height                 | 3px                          | Minimal data-viz line                        |

### Text Treatment

- **ALL UPPERCASE** for: location name, sensor labels, sensor values, condition labels, day names, "RISE"/"SET"
- **Mixed case** ONLY for: none in this panel
- **Letter-spacing**: `0.05em` on headings and day names
- **Font-weight**: `700` (bold) for sensor values, temperature, wind speed. `400` for everything else

---
