## 14. LCARS Design Rules Compliance

| Rule                                              | Source           | Compliant? | Notes                                      |
|---------------------------------------------------|------------------|------------|---------------------------------------------|
| No gradients, shadows, or 3D effects              | Bracer Jack #1   | ✅          | Flat fills throughout                       |
| Frame goes thick→thin (4px→2px border)            | Bracer Jack #2   | ✅          | Left/bottom 4px, top/right 2px             |
| Pill buttons with flat left, rounded right         | Bracer Jack #4   | ✅          | Transport buttons, source options            |
| Exactly 3 font sizes (title, sub, data)           | Bracer Jack #6   | ✅          | Sub for device name + track, data for rest  |
| ≤5 hue families                                   | Bracer Jack      | ✅          | Violet (frame/accent), warm (playback states), gray (idle), white (text), red (fault) = 5 families |
| All text uppercase                                 | TheLCARS.com     | ✅          | Every text element uppercase                |
| Antonio font only                                  | TheLCARS.com     | ✅          | `var(--lcars-font)` throughout              |
| CSS custom properties, no hardcoded hex            | Project rule     | ✅          | All colors via `var(--lcars-*)` tokens      |
| Background is always `#000000`                     | TheLCARS.com     | ✅          | `var(--lcars-bg)` = `var(--lcars-black)`    |
| Animations < 1s, respects `prefers-reduced-motion` | WCAG + project   | ✅          | Longest is viewscreen 600ms; all disabled with reduced-motion |
| WCAG AA contrast on all text                       | WCAG 1.4.3       | ✅          | Verified in §2 table                       |
| 24px+ touch targets                                | WCAG 2.5.8       | ✅          | All buttons 48px+, bars use container height |
| Focus visible 2px outline, 3:1 contrast            | WCAG 2.4.7/13    | ✅          | Ice blue outline, 10.3:1 vs black          |
| Color not sole means of information                | WCAG 1.4.1       | ✅          | Text labels + icons + color on all states   |
| Keyboard operable                                  | WCAG 2.1.1       | ✅          | Full tab order, arrow keys on sliders       |
| `aria-label` / `role` on all interactive elements  | WCAG 4.1.2       | ✅          | See §11.2 ARIA template                    |
| `aria-live` for state changes                      | WCAG 4.1.3       | ✅          | Track changes announced via live region     |
| Spacing uses `--lcars-gap` (0.25rem)               | Jörn Weißenborn  | ✅          | Invisible grid constant throughout          |
| Empty space preserved                              | Bracer Jack      | ✅          | Idle state is minimal; active state breathes |

---
