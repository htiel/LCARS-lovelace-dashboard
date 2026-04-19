## 19. LCARS Design Rules Compliance

| Rule                                              | Source           | Compliant? | Notes                                          |
|---------------------------------------------------|------------------|------------|--------------------------------------------------|
| No gradients, shadows, or 3D effects              | Bracer Jack #1   | ✅*         | Forecast range bar uses cold→warm gradient — APPROVED by Geordi as a data-visualization exception. This gradient is RESTRICTED to the 3px forecast range bars only; never applied to buttons, frames, or panels. |
| Frame goes thick→thin (4px→2px border)            | Bracer Jack #2   | ✅          | Left/bottom 4px, top/right 2px                   |
| Pill buttons with flat left, rounded right         | Bracer Jack #4   | N/A        | No control buttons in this panel (read-only)     |
| Exactly 3 font sizes (title, sub, data)           | Bracer Jack #6   | ✅          | SVG 48 (title), sub (location name), data (rest) |
| ≤5 hue families                                   | Bracer Jack      | ✅          | Blue (frame/sky), warm (sunny/sunflower), gold (lightning), gray (overcast), white (text) = 5 functional families. `--lcars-tomato` is a system-wide alert color exempt from per-panel hue budgets (same exemption as all other panels). |
| All text uppercase                                 | TheLCARS.com     | ✅          | Every text element uppercase                      |
| Antonio font only                                  | TheLCARS.com     | ✅          | `var(--lcars-font)` throughout                    |
| CSS custom properties, no hardcoded hex            | Project rule     | ✅          | All colors via `var(--lcars-*)` tokens            |
| Background is always `#000000`                     | TheLCARS.com     | ✅          | `var(--lcars-bg)` = `var(--lcars-black)`          |
| Animations < 1s, respects `prefers-reduced-motion` | WCAG + project   | ✅          | Longest is wind rotation 800ms; all disabled      |
| WCAG AA contrast on all text                       | WCAG 1.4.3       | ✅          | Verified in §2 table                             |
| 24px+ touch targets                                | WCAG 2.5.8       | ✅          | Sensor lines 28px+, forecast tiles 48px+          |
| Focus visible 2px outline, 3:1 contrast            | WCAG 2.4.7/13    | ✅          | Ice blue outline, 10.3:1 vs black                |
| Color not sole means of information                | WCAG 1.4.1       | ✅          | Text labels + glyphs + color on all conditions    |
| Keyboard operable                                  | WCAG 2.1.1       | ✅          | Full tab order for all interactive elements       |
| `aria-label` / `role` on all interactive elements  | WCAG 4.1.2       | ✅          | See §13.2 ARIA template                          |
| `aria-live` for state changes                      | WCAG 4.1.3       | ✅          | Condition changes announced via live region       |
| Spacing uses `--lcars-gap` (0.25rem)               | Jörn Weißenborn  | ✅          | Invisible grid constant throughout                |
| Empty space preserved                              | Bracer Jack      | ✅          | Temperature floats in black viewscreen, sensors breathe |

---
