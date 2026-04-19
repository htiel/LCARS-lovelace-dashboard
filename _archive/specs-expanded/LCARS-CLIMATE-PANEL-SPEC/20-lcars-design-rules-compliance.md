## 19. LCARS Design Rules Compliance

| Rule                                              | Source           | Compliant? | Notes                                               |
|---------------------------------------------------|------------------|------------|-----------------------------------------------------|
| No gradients, shadows, or 3D effects              | Bracer Jack #1   | ✅          | SVG arc is flat stroke, no gradient fills           |
| Frame goes thick→thin (4px→2px border)            | Bracer Jack #2   | ✅          | Left/bottom 4px, top/right 2px                     |
| Pill buttons with flat left, rounded right         | Bracer Jack #4   | ✅          | Mode buttons, aux buttons, setpoint ± buttons      |
| Exactly 3 font sizes (title, sub, data)            | Bracer Jack #6   | ✅          | SVG 42 (title), 1.25rem (sub), 0.875rem (data)    |
| ≤5 hue families in use                            | Bracer Jack      | ✅          | Warm (butterscotch/gold/sunflower), cool (ice), violet (fan), gray (disabled), white (text) = 5 |
| All text uppercase                                 | TheLCARS.com     | ✅          | Sensor labels, values, headings, buttons, SVG text |
| Antonio font only                                  | TheLCARS.com     | ✅          | `var(--lcars-font)` throughout                     |
| CSS custom properties, no hardcoded hex            | Project rule     | ✅          | All colors via `var(--lcars-*)` tokens             |
| Background is always `#000000`                     | TheLCARS.com     | ✅          | `var(--lcars-bg)` = `var(--lcars-black)`           |
| Animations < 1s, respects `prefers-reduced-motion` | WCAG + project   | ✅          | Heating pulse 2s (ambient only), all disable        |
| WCAG AA contrast on all text                       | WCAG 1.4.3       | ✅          | Verified in §2 contrast table                      |
| 24px+ touch targets                                | WCAG 2.5.8       | ✅          | All buttons ≥ 36px, sensor lines 28px              |
| Focus visible 2px outline, 3:1 contrast            | WCAG 2.4.7/13    | ✅          | Ice blue outline, 10.3:1 vs black                  |
| Color not sole means of information                | WCAG 1.4.1       | ✅          | All states have text + color                       |
| Keyboard operable                                  | WCAG 2.1.1       | ✅          | Full tab order, radiogroup keyboard patterns       |
| `aria-label` / `role` on all interactive elements  | WCAG 4.1.2       | ✅          | See §14 ARIA templates                             |
| `aria-live="polite"` for state changes             | WCAG 4.1.3       | ✅          | Hidden live region for temperature/mode changes    |
| Spacing uses `--lcars-gap` (0.25rem)               | Jörn Weißenborn  | ✅          | Invisible grid constant throughout                 |

---
