## 15. LCARS Design Rules Compliance

| Rule                                              | Source           | Compliant? | Notes                                               |
|---------------------------------------------------|------------------|------------|-----------------------------------------------------|
| No gradients, shadows, or 3D effects              | Bracer Jack #1   | ✅          | Fill bar is flat color, no gradient                 |
| Frame goes thick→thin (4px→2px border)            | Bracer Jack #2   | ✅          | Left/bottom 4px, top/right 2px                     |
| Pill buttons with flat left, rounded right         | Bracer Jack #4   | ✅          | Zone Start/Stop, Standby button                    |
| ≤3 font sizes (title, sub, data)                  | Bracer Jack #6   | ✅          | Only sub + data used; within 3-size limit           |
| ≤5 hue families in use                            | Bracer Jack      | ✅          | Blue (ice), warm (sunflower/gold), violet (rain delay), gray (disabled), white (text) = 5 |
| All text uppercase                                 | TheLCARS.com     | ✅          | Zone names, labels, buttons, attributes             |
| Antonio font only                                  | TheLCARS.com     | ✅          | `var(--lcars-font)` throughout                     |
| CSS custom properties, no hardcoded hex            | Project rule     | ✅          | All colors via `var(--lcars-*)` tokens             |
| Background is always `#000000`                     | TheLCARS.com     | ✅          | `var(--lcars-bg)` = `var(--lcars-black)`           |
| Animations < 1s, respects `prefers-reduced-motion` | WCAG + project   | ✅          | Fill bar 1s linear, all disable with reduce         |
| WCAG AA contrast on all text                       | WCAG 1.4.3       | ✅          | Verified in §2 contrast table                      |
| 24px+ touch targets                                | WCAG 2.5.8       | ✅          | All buttons ≥ 48px, zone rows 36px                 |
| Focus visible 2px outline, 3:1 contrast            | WCAG 2.4.7/13    | ✅          | Ice blue outline, 10.3:1 vs black                  |
| Color not sole means of information                | WCAG 1.4.1       | ✅          | All states have text + color                       |
| Keyboard operable                                  | WCAG 2.1.1       | ✅          | Full tab order, button keyboard support             |
| `aria-label` / `role` on all interactive elements  | WCAG 4.1.2       | ✅          | See §11 ARIA templates                             |
| `aria-live="polite"` for state changes             | WCAG 4.1.3       | ✅          | Hidden live region for zone start/stop/delay        |
| Spacing uses `--lcars-gap` (0.25rem)               | Jörn Weißenborn  | ✅          | Invisible grid constant throughout                 |
| Empty space is beautiful                           | Bracer Jack      | ✅          | Zone grid rows breathe; no decorative fill          |

---
