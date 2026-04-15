## Geordi La Forge — Design Review

**Reviewer**: Geordi La Forge (LCARS UI Design Authority)  
**Date**: Stardate 2026.04.13  
**Status**: APPROVED WITH NOTES

### LCARS Compliance
- §1 Grid Layout: The full-width 3-column layout (chemistry | aquatics | controls) is justified. Two climate entities, chemistry sensors, circuit switches, AND a lighting selector cannot fit in a standard 2-column panel. The `grid-column: 1 / -1` approach is correct for wide panels — same pattern as Ops console data displays.
- Thick→thin border (4px left/bottom, 2px top/right) — correct per Bracer Jack Rule 2.
- §5 Dual viewscreens: Two side-by-side viewscreens is unprecedented but defensible. Pool and spa are two distinct water bodies requiring simultaneous monitoring — this is the Cetacean Ops display showing two tanks. **Approved** as a multi-body monitoring exception.
- §5.3 Water particle animations: Decorative but appropriate. The slow drift (6–10s) conveys "living water" without demanding attention. Convection animation when heating switches to vertical drift — nice physical metaphor. `prefers-reduced-motion` makes particles static at 20% opacity — good fallback.
- §6 Circuit toggles: Flat pill toggles with `--lcars-gold` active / `--lcars-disabled` inactive — correct LCARS toggle pattern. No iOS-style sliders — good.
- §7 IntelliBrite lighting strip: The horizontally scrollable swatch grid is a practical solution for 22+ color modes.

### Color & Typography
- `--lcars-bluey` (#8899ff) for the panel frame is correct — aquatic/water systems use the blue family, distinct from the deeper `--lcars-blue` or lighter `--lcars-ice`.
- Thermal color coding: Pool (ice/cool blue) vs Spa (butterscotch/warm) gives instant body identification. This is the right approach.
- Chemistry threshold coloring (§2): Three-tier system (optimal→acceptable→alert) using ice→sunflower→tomato is semantically clear and consistent with other panel alert patterns.
- **ISSUE** (§7.2, §11): The swatch labels at `font-size: 0.55rem` and the setpoint label at `font-size: 0.6rem` introduce font sizes below the data tier. This **violates Bracer Jack Rule 6** (exactly 3 font sizes). I understand the constraint — 22 swatches need compact labels — but the rule exists for a reason.
- **MITIGATION**: Either (a) remove visible swatch labels entirely and rely on `aria-label` + tooltip for identification, or (b) use `--lcars-font-size-data` (0.875rem) and accept that swatch labels may truncate. Option (a) is the more LCARS-authentic choice — the original Okuda displays used color alone without micro-labels.
- The IntelliBrite swatch hex colors are **data values** representing physical light output, not UI chrome. These are not LCARS theme colors. **Exception approved** — they must reflect actual light colors to be useful.

### Layout & Visual Balance
- The three-column layout breathes well. Chemistry on the left is the "science station," aquatics in the center is the viewscreen, and controls on the right is the engineering station. This maps to TNG console layout conventions.
- The compact "no-chem" variant (§1) that collapses to 2 columns when IntelliChem isn't present is a good adaptive design.
- The water particle visualization in the lower 40% of each viewscreen keeps the temperature readouts and setpoint controls above the "water line" — clear visual hierarchy.

### Accessibility
- WCAG 2.5.8: Setpoint buttons at 2.25rem (36px) — passes. Circuit toggles at 1.75rem × 3rem — the 1.75rem (28px) height passes but is on the lower end. Consider bumping to 2rem.
- Swatch buttons at 3.5rem wide with 1.75rem height fill circle — the tap target includes the padding, bringing effective size above 24px. Passes.
- Focus indicators: 2px solid `--lcars-ice` with 2px offset — consistent and approved.
- Chemistry readings use dynamic color + numeric value + status label (OPTIMAL/ACCEPTABLE/ALERT) — triple encoding satisfies WCAG 1.4.1 thoroughly.
- `prefers-reduced-motion` covers all water particles, heating pulses, and swatch animations — confirmed.

### Recommendations
1. **APPROVED**: Full-width 3-column layout for pool/spa monitoring.
2. **APPROVED**: Dual viewscreen pattern for simultaneous body monitoring.
3. **APPROVED**: IntelliBrite swatch hex colors as data-value exception.
4. **NEEDS REVISION** (§7.2): Swatch labels at 0.55rem violate Bracer Jack Rule 6. Remove visible labels and use `aria-label` + optional tooltip. The 3-letter abbreviations (PAR, ROM, BLU) can be replaced by the colored circle alone — users will learn the colors quickly, and the `aria-label` serves accessibility.
5. **NEEDS REVISION** (§5.2): The `.pool-setpoint-label` at `font-size: 0.6rem` also violates Rule 6. Increase to `--lcars-font-size-data` (0.875rem) or, if space is tight, use letter-spacing and weight differentiation to distinguish it from sibling text at the same size.
6. **NOTE**: The swatch `hue-rotate` animation (§7.2) for dynamic modes is a color-shifting effect. It technically modifies the swatch appearance beyond flat color — however, it's confined to decorative swatch previews and properly disabled under `prefers-reduced-motion`. Approved with that caveat.
7. **APPROVED**: Water particle animations — decorative, appropriate, and properly gated behind reduced-motion.
8. **NOTE**: The circuit toggle height at 1.75rem is functional but could feel cramped on touch devices. If layout permits, increase to 2.25rem for comfort.

---
