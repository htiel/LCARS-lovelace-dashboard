## 12. LCARS Design Rules Compliance

| Rule                                                | Source           | Compliant? | Notes                                        |
|-----------------------------------------------------|------------------|------------|----------------------------------------------|
| No gradients on buttons/panels                      | Bracer Jack #1   | ✅          | All flat fills, no gradients anywhere         |
| Frame goes thick→thin (4px→2px border)              | Bracer Jack #2   | ✅          | Left/bottom 4px, top/right 2px               |
| Pill buttons with flat left, rounded right           | Bracer Jack #4   | ✅          | Setpoint buttons, circuit toggles             |
| Exactly 3 font sizes (title, sub, data)              | Bracer Jack #6   | ✅          | Sub for body temp, data for everything else   |
| ≤5 hue families                                     | Bracer Jack      | ✅          | Blue (frame/pool), warm (spa/heating), white (text), gray (disabled), red (alerts) = 5 families |
| All text uppercase                                   | TheLCARS.com     | ✅          | Every label, value, heading, button           |
| Antonio font only                                    | TheLCARS.com     | ✅          | `var(--lcars-font)` throughout                |
| CSS custom properties, no hardcoded hex              | Project rule     | ✅          | All colors via `var(--lcars-*)` tokens. Swatch colors use inline hex but these are data values, not UI chrome |
| Background is always `#000000`                       | TheLCARS.com     | ✅          | `var(--lcars-bg)` = `var(--lcars-black)`      |
| Animations < 1s (or justified), respects `prefers-reduced-motion` | WCAG + project | ✅ | Heating pulse 2.5s (ambient, non-critical), particles 6–10s (decorative), all disable gracefully |
| WCAG AA contrast on all text                         | WCAG 1.4.3       | ✅          | Verified in §2 contrast table                |
| 24px+ touch targets                                  | WCAG 2.5.8       | ✅          | Setpoint btns 2.25rem=36px, toggles 1.75rem×3rem, swatches 3.5rem wide |
| Focus visible 2px outline, 3:1 contrast              | WCAG 2.4.7/13    | ✅          | Ice blue outline, 10.3:1 vs black            |
| Color not sole means of information                  | WCAG 1.4.1       | ✅          | All chemistry has text labels + values + color; heat badges have text labels |
| Keyboard operable                                    | WCAG 2.1.1       | ✅          | Full tab order defined, radiogroup keyboard   |
| `aria-label` / `role` on all interactive elements    | WCAG 4.1.2       | ✅          | See §11 ARIA template                        |
| `aria-live="polite"` for state changes               | WCAG 4.1.3       | ✅          | Hidden live region for temp/chem/circuit updates |
| Spacing uses `--lcars-gap` (0.25rem)                 | Jörn Weißenborn  | ✅          | Invisible grid constant throughout            |

---
