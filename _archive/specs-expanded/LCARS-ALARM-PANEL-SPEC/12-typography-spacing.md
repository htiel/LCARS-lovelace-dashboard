## 11. Typography & Spacing

### Font Sizes (Three sizes only — Bracer Jack Rule 6)

| Element                   | Size Token                   | Value      | Usage                              |
|---------------------------|------------------------------|------------|------------------------------------|
| Shield symbol (SVG)       | Title tier equivalent        | `48` (SVG) | Large viewscreen shield symbol     |
| Countdown time            | `--lcars-font-size-title`    | `2rem`     | Countdown clock in viewscreen      |
| Device name, keypad digits| `--lcars-font-size-sub`      | `1.25rem`  | Panel header, digit buttons        |
| All other text            | `--lcars-font-size-data`     | `0.875rem` | Sensor labels, values, badges, btns|

**Three font sizes. No exceptions.** The SVG shield symbol at font-size 48 (within a 160×180 viewBox) maps to the "title" tier visually. The countdown time at 2rem is the same title tier. Keypad digits use sub-header. Everything else is data.

### Spacing Constants (Jörn Weißenborn Grid)

| Spacing                       | Token / Value                 | Usage                                          |
|-------------------------------|-------------------------------|-------------------------------------------------|
| Gap between all elements      | `var(--lcars-gap)` = 0.25rem  | Universal LCARS grid spacing                   |
| Panel internal padding        | `var(--lcars-gap)` = 0.25rem  | Inside the panel frame border                  |
| Sensor/zone line min-height   | 1.75rem                       | ~28px — exceeds WCAG 2.5.8 (24px min)         |
| Mode button height            | `var(--lcars-btn-height)` = 3.5rem | Standard LCARS button = 56px             |
| Mode button min-width         | 5rem = 80px                   | Exceeds WCAG 2.5.8                             |
| Keypad digit button           | 3.5rem × 3.5rem = 56px       | Large touch target — exceeds 24px minimum      |
| Action button height          | `var(--lcars-btn-height)` = 3.5rem | 56px — matches mode buttons             |
| Keypad grid gap               | `var(--lcars-gap)` = 0.25rem  | Between digit buttons                          |
| Media frame border            | 3px solid                     | Viewscreen border — matches Device Panel       |
| Panel outer border (left/btm) | 4px solid                     | Thick side (Bracer Jack Rule 2)                |
| Panel outer border (top/rt)   | 2px solid                     | Thin side — thick→thin                         |
| Triggered border (left/btm)   | 6px solid                     | Extra thick for Red Alert emphasis             |

### Text Treatment

- **ALL UPPERCASE** for: device name, state labels, zone names, zone values, button text, keypad digits, code label, countdown text
- **Mixed case**: none in this panel
- **Letter-spacing**: `0.05em` on headings and labels, `0.15em` on countdown timer (wide tracking for mission clock readability), `0.1em` on countdown badge
- **Font-weight**: `700` (bold) for state badge, zone values, action buttons, keypad digits. `400` (normal) for everything else
- **`font-variant-numeric: tabular-nums`** on countdown timer and countdown badge — prevents layout jitter as digits change

---
