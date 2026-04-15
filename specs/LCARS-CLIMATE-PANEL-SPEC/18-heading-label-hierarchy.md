## 17. Heading & Label Hierarchy

| Element                 | `aria-level` | Font Size                   | Color                           | Purpose                               |
|-------------------------|--------------|-----------------------------|---------------------------------|---------------------------------------|
| Panel title             | 3            | `--lcars-font-size-sub`     | `--lcars-text-heading`          | Device name ("LIVING ROOM THERMOSTAT")|
| Section labels          | 4 (implicit) | `--lcars-font-size-data`    | `--lcars-text-heading`          | "FAN", "PRESET"                       |
| Sensor labels           | —            | `--lcars-font-size-data`    | `--lcars-space-white`           | "CURRENT", "TARGET", "HUMIDITY"       |
| Sensor values           | —            | `--lcars-font-size-data`    | Dynamic (state-based)           | "72°F", "48%", "HEAT"                 |
| Setpoint label          | —            | `--lcars-font-size-data`    | `--lcars-space-white`           | "TARGET", "LOW", "HIGH"              |
| Setpoint value          | —            | `--lcars-font-size-sub`     | `--lcars-gold` or per-setpoint  | "74°F"                                |
| Temperature (SVG)       | —            | Title tier (SVG 42)         | `--climate-action-color`        | "72°" — the big number               |
| Action badge            | —            | `--lcars-font-size-data`    | `--climate-action-color`        | "HEATING"                             |
| Mode button text        | —            | `--lcars-font-size-data`    | Black (active) / white (inactive)| "HEAT", "COOL", "AUTO"              |

**Exactly 3 visual font sizes.** Title (SVG temp), sub-header (device name + setpoint values), data (everything else). Bracer Jack Rule 6 — no exceptions.

---
