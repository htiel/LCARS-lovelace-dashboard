## 15. Heading & Label Hierarchy

| Element                  | `aria-level` | Font Size                    | Color                           | Purpose                              |
|--------------------------|--------------|------------------------------|---------------------------------|--------------------------------------|
| Panel title              | 3            | `--lcars-font-size-sub`      | `--lcars-text-heading`          | Location name ("LOCAL WEATHER — GRANDBRIDGE") |
| Sensor labels            | —            | `--lcars-font-size-data`     | `--lcars-space-white`           | "HUMIDITY", "PRESSURE", "UV INDEX"   |
| Sensor values            | —            | `--lcars-font-size-data`     | Dynamic (state-based)           | "62%", "30.12 INHG", "6 HIGH"       |
| Condition badge          | —            | `--lcars-font-size-data`     | `--weather-condition-color`     | "☀ SUNNY"                            |
| Temperature (SVG)        | —            | Title tier (SVG 48)          | `--weather-condition-color`     | "72°" — the big number              |
| Condition label (SVG)    | —            | Data tier (SVG 12)           | `--lcars-space-white`           | "SUNNY" below temp                   |
| Forecast day name        | —            | `--lcars-font-size-data`     | `--lcars-text-heading`          | "MON", "TUE", etc.                  |
| Forecast high temp       | —            | `--lcars-font-size-data`     | `--lcars-space-white`           | "74°"                                |
| Forecast low temp        | —            | `--lcars-font-size-data`     | `--lcars-disabled`              | "58°"                                |
| Forecast precip %        | —            | `--lcars-font-size-data`     | Dynamic (>50% = sky, else gray) | "45%"                                |
| Sunrise/sunset labels    | —            | `--lcars-font-size-data`     | `--lcars-sunflower`             | "RISE 06:42", "SET 19:58"           |
| Wind readout             | —            | `--lcars-font-size-data`     | `--lcars-space-white`           | "8 MPH NNW"                          |

**Exactly 3 visual font sizes.** Title (SVG temp), sub-header (location name), data (everything else). Bracer Jack Rule 6 — no exceptions.

---
