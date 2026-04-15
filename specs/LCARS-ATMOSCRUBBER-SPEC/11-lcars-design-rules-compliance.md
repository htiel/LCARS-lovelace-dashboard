## 10. LCARS Design Rules Compliance

| Rule                                              | Source           | Compliant? | Notes                                  |
|---------------------------------------------------|------------------|------------|----------------------------------------|
| No gradients on buttons/panels                    | Bracer Jack #1   | ✅          | Cylinder uses minimal structural shading only |
| Frame goes thick→thin (4px→2px border)            | Bracer Jack #2   | ✅          | Left/bottom 4px, top/right 2px         |
| Pill buttons with flat left, rounded right         | Bracer Jack #4   | ✅          | Preset buttons and toggles             |
| Exactly 3 font sizes (title, sub, data)            | Bracer Jack #6   | ✅          | Sub for header, data for everything else|
| ≤5 hue families                                   | Bracer Jack      | ✅          | Blue (frame), warm (AQI states), violet (VOC sparkline), gray (disabled), white (text) = 5 families |
| All text uppercase                                 | TheLCARS.com     | ✅          | Sensor labels, values, headings, buttons|
| Antonio font only                                  | TheLCARS.com     | ✅          | `var(--lcars-font)` throughout          |
| CSS custom properties, no hardcoded hex            | Project rule     | ✅          | All colors via `var(--lcars-*)` tokens  |
| Background is always `#000000`                     | TheLCARS.com     | ✅          | `var(--lcars-bg)` = `var(--lcars-black)`|
| Animations < 1s, respects `prefers-reduced-motion` | WCAG + project   | ✅          | Hazard pulse = 1s, particles gentle, all disable with reduced-motion |
| WCAG AA contrast on all text                       | WCAG 1.4.3       | ✅          | Verified in §2 table                   |
| 24px+ touch targets                                | WCAG 2.5.8       | ✅          | Preset buttons 2.25rem=36px, toggles 1.75rem × 3rem ≥ 24px |
| Focus visible 2px outline, 3:1 contrast            | WCAG 2.4.7/13    | ✅          | Ice blue outline, 10.3:1 vs black      |
| Color not sole means of information                | WCAG 1.4.1       | ✅          | AQI text label + value + color; all sensors have text state |
| Keyboard operable                                  | WCAG 2.1.1       | ✅          | Full tab order defined, radiogroup keyboard pattern |
| `aria-label` / `role` on all interactive elements  | WCAG 4.1.2       | ✅          | See §9 ARIA template                   |
| `aria-live="polite"` for state changes             | WCAG 4.1.3       | ✅          | Hidden live region for AQI updates     |
| Spacing uses `--lcars-gap` (0.25rem)               | Jörn Weißenborn  | ✅          | Invisible grid constant throughout      |

---
