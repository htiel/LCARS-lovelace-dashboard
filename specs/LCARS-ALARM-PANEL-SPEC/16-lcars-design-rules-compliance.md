## 15. LCARS Design Rules Compliance

| Rule                                              | Source           | Compliant? | Notes                                                   |
|---------------------------------------------------|------------------|------------|---------------------------------------------------------|
| No gradients, shadows, or 3D effects              | Bracer Jack #1   | ✅          | Shield SVG is flat stroke, keypad buttons are flat      |
| Frame goes thick→thin (4px→2px border)            | Bracer Jack #2   | ✅          | Left/bottom 4px, top/right 2px; triggered 6px/3px      |
| Pill buttons with flat left, rounded right         | Bracer Jack #4   | ✅          | Mode buttons, keypad digits, action buttons             |
| Exactly 3 font sizes (title, sub, data)            | Bracer Jack #6   | ✅          | SVG 48 + 2rem (title), 1.25rem (sub), 0.875rem (data) |
| ≤5 hue families in use                            | Bracer Jack      | ✅          | Blue (disarmed), warm (armed), red (triggered), gold (transitional), gray (disabled) = 5 families |
| All text uppercase                                 | TheLCARS.com     | ✅          | All labels, values, buttons, SVG text                   |
| Antonio font only                                  | TheLCARS.com     | ✅          | `var(--lcars-font)` throughout                          |
| CSS custom properties, no hardcoded hex            | Project rule     | ✅          | All colors via `var(--lcars-*)` tokens                  |
| Background is always `#000000`                     | TheLCARS.com     | ✅          | `var(--lcars-bg)` = `var(--lcars-black)`                |
| Animations respect `prefers-reduced-motion`        | WCAG + project   | ✅          | All animations disable; static weight alternatives      |
| WCAG AA contrast on all text                       | WCAG 1.4.3       | ✅          | Verified in §2 contrast table                          |
| 24px+ touch targets                                | WCAG 2.5.8       | ✅          | All buttons ≥ 56px, zone lines 28px                    |
| Focus visible 2px outline, 3:1 contrast            | WCAG 2.4.7/13    | ✅          | Ice blue outline, 10.3:1 vs black                      |
| Color not sole means of information                | WCAG 1.4.1       | ✅          | All states have text + color (§13.4)                    |
| Keyboard operable                                  | WCAG 2.1.1       | ✅          | Full tab order + keypad keyboard capture (§13.2)        |
| `aria-label` / `role` on all interactive elements  | WCAG 4.1.2       | ✅          | See §13.3 ARIA templates                                |
| `aria-live="assertive"` for alarm state changes    | WCAG 4.1.3       | ✅          | Assertive for security urgency (§13.7)                  |
| Spacing uses `--lcars-gap` (0.25rem)               | Jörn Weißenborn  | ✅          | Invisible grid constant throughout                      |
| No sensitive data in DOM/logs                      | OWASP A02:2021   | ✅          | PIN code handler clears on consume (§7.5 Worf review)  |

---
