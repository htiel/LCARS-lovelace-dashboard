## 13. Heading & Label Hierarchy

| Element                 | `aria-level` | Font Size                   | Color                           | Purpose                               |
|-------------------------|--------------|-----------------------------|---------------------------------|---------------------------------------|
| Panel title             | 3            | `--lcars-font-size-sub`     | `--lcars-text-heading`          | Device name ("IRRIGATION — RACHIO")   |
| Zone names              | —            | `--lcars-font-size-data`    | `--lcars-space-white`           | "FRONT LAWN", "GARDEN"                |
| Zone status             | —            | `--lcars-font-size-data`    | Dynamic (state-based)           | "IDLE", "WATERING"                    |
| Zone countdown          | —            | `--lcars-font-size-sub`     | `--lcars-ice`                   | "12:34"                               |
| Schedule labels         | —            | `--lcars-font-size-data`    | `--lcars-space-white`           | "NEXT RUN", "RAIN DELAY"             |
| Schedule values         | —            | `--lcars-font-size-data`    | Dynamic                         | "TUE 05:30", "NONE"                  |
| Zone attributes         | —            | `--lcars-font-size-data`    | `--lcars-disabled`              | "SOIL: CLAY LOAM"                    |
| Button text             | —            | `--lcars-font-size-data`    | `--lcars-black` (on button bg)  | "START", "STOP", "STANDBY"           |

**Exactly 2 visual font sizes in active use** (sub-header for title + countdown, data for everything else). The title tier isn't used — this panel has no hero number. Still within the 3-size maximum.

---
