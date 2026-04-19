## Geordi La Forge — Design Review

**Reviewer**: Geordi La Forge (LCARS UI Design Authority)  
**Date**: Stardate 2026.04.13  
**Status**: APPROVED WITH NOTES

### LCARS Compliance
- §1 Grid Layout: Correct 4-row grid (header, sensors+media, modes, auxctrl). Thick→thin border (4px left/bottom, 2px top/right) satisfies Bracer Jack Rule 2.
- §5 Temperature arc (SVG): This is a **data visualization**, not a decorative gradient or 3D effect. The semicircular arc with `stroke` and `stroke-linecap: round` is acceptable — it's a sensor gauge, the kind you'd see on an actual LCARS Engineering substation. Approved.
- §5.2 Setpoint buttons: The decrement button uses `border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius)` — rounded LEFT, flat RIGHT. This is the **reverse** of standard LCARS pill direction (flat left, rounded right). However, this creates a symmetrical ±/bracket pair around the temperature value, which reads as a contained control group. I'm approving this as an intentional design choice for setpoint controls specifically. **Do not extend this reversed pill pattern elsewhere.**
- §6 Mode selector strip: Correct pill buttons with proper `radiogroup` ARIA pattern. Active mode uses dynamic `--mode-color` which is semantically correct (heat=butterscotch, cool=ice, etc.).
- §8 HVAC action animation: The heating pulse (2s) and cooling pulse (3s) are ambient, non-critical animations that exceed the 1s guideline but are opacity-only. These are acceptable as background status indicators — they don't carry information that isn't also conveyed by color and text. `prefers-reduced-motion` properly cancels them.
- §9 Fault indicators: The pulsing dot with `prefers-reduced-motion` fallback to a static larger dot (10px vs 8px) is a good reduced-motion pattern.

### Color & Typography
- Dynamic `--panel-frame-color` based on `hvac_action` is excellent design. Butterscotch for heating, ice for cooling — instant peripheral feedback. This is exactly how Environmental Control works on the bridge.
- Color table (§2) is complete and well-justified. All pass WCAG AA. `--lcars-gray` at 4.6:1 is the lowest — intentionally dim for disabled state.
- Typography: Three font sizes — SVG `42` (title tier), `--lcars-font-size-sub` (1.25rem), `--lcars-font-size-data` (0.875rem). Clean hierarchy, no violations.
- ALL UPPERCASE maintained throughout — confirmed.

### Layout & Visual Balance
- The viewscreen temperature arc floating in black space is perfect LCARS aesthetic. "Empty space is beautiful" — the arc breathes.
- Dual setpoint layout (§1 and §5.2) for `heat_cool` mode is well-structured. Low (butterscotch) and High (ice) targets with color-coded labels provide clear differentiation.
- The aux controls row (§7) with FAN and PRESET as inline pill strips is compact but clear. The `calc(var(--lcars-gap) * 4)` spacing between groups provides visual separation.

### Accessibility
- WCAG 2.5.8: Mode buttons at 48px height × 80px min-width. Setpoint buttons at 40px × 40px. Aux buttons at 36px height. All exceed 24px minimum.
- Temperature arc SVG uses `role="meter"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` — excellent semantic markup. Screen readers can report "Current temperature: 72 degrees, range 45 to 95."
- Focus indicators: 2px solid `--lcars-ice` with 2px offset throughout — 10.3:1 contrast. Approved.
- Setpoint controls properly grouped with `role="group"` and descriptive `aria-label` on each ± button pair.
- `prefers-reduced-motion` covers all animations — confirmed in §8.

### Recommendations
1. **APPROVED**: Temperature arc SVG design — sensor gauge visualization, not a decorative element.
2. **APPROVED**: Dynamic frame color shifting across HVAC actions.
3. **APPROVED**: Dual setpoint layout for heat_cool mode.
4. **APPROVED**: Mode button strip layout and coloring.
5. **NOTE** (§5.2): The reversed pill direction on the decrement setpoint button is approved for this specific use case only. Document this as a "paired control exception" in the implementation to prevent cargo-cult usage elsewhere.
6. **NOTE** (§7): Aux buttons at 2.25rem (36px) height are smaller than the standard 3rem (48px) LCARS button. They pass WCAG 2.5.8 (≥24px) but feel slightly undersized. Consider bumping to `var(--lcars-bar-h)` (3rem) if horizontal space allows.
7. **APPROVED**: The heating/cooling ambient pulse animations are tasteful and non-distracting.

---
