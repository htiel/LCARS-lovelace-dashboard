## Geordi La Forge — Design Review

**Reviewer**: Geordi La Forge (LCARS UI Design Authority)  
**Date**: Stardate 2026.04.13  
**Status**: APPROVED WITH NOTES

### LCARS Compliance
- §3 Grid Layout: The tile grid with floor grouping is an authentic LCARS pattern. Internal sensor grids on the Enterprise Engineering substations looked exactly like this — compact readout cells, grouped by deck, color-coded by status.
- Tile shape (§4): `border-radius: 0 0.75rem 0.75rem 0` — flat left, rounded right. This is the LCARS pill/cap DNA. **Excellent** — the tiles themselves are LCARS buttons in data-display mode. Bracer Jack would recognize these immediately.
- Thick→thin border (4px left/bottom, 2px top/right) on the outer frame — correct per Bracer Jack Rule 2.
- Tile comfort-state border coloring is a good use of the LCARS color system — the border communicates zone status just like the colored sections on a bridge status display.
- The floor group labels with the bullet dot (§3 `.sensors-floor-label::before`) are a clean LCARS section marker.

### Color & Typography
- `--lcars-ice` (#99ccff) for the environmental monitoring frame is correct — lighter blue than the atmoscrubber's `--lcars-bluey`, appropriate for a passive monitoring grid.
- Temperature color spectrum (§5): 5 temperature colors (blue → bluey → ice → butterscotch → peach). This spans 3 hue families (blue, neutral, warm) plus white for text — within the 5-family maximum.
- `--lcars-blue` (#5566ff) at 4.6:1 contrast for "cold" temperatures is the lowest color in use. It passes AA but just barely. Since cold temperatures always have the numeric value alongside the color, the dual-encoding satisfies WCAG 1.4.1. However, for the border color use, the contrast against `#000000` background may be less perceptible peripherally.
- **ISSUE**: The spec references `--lcars-font-subtitle` (1.5rem) and `--lcars-font-body` (1rem) as its font size tokens. Other specs use `--lcars-font-size-sub` (1.25rem) and `--lcars-font-size-data` (0.875rem). These appear to be **different token names for potentially different values**. The Appendix A references `--lcars-font-title` (2.5rem), `--lcars-font-subtitle` (1.5rem), `--lcars-font-body` (1rem) from UI Architecture §2. Need to verify these map to the same three tiers used by other specs. If they're different values, we have font-size inconsistency across panels.

### Layout & Visual Balance
- The `auto-fill` grid with `minmax(9.5rem, 1fr)` columns is the right approach — tiles fill available space naturally without hardcoded column counts.
- The summary row at the bottom with "SHIP AVG" is a nice dashboard-level aggregation. The `aria-live="polite"` ensures screen readers announce changes.
- Sparklines at 1rem tall with no axis labels or grid lines — perfectly minimal. This is the right level of data visualization for a monitoring grid.
- The staggered tile entry animation (§12, 50ms per tile) evokes the sequential bootup of internal sensors — a nice thematic touch.
- Appliance meter handling (§14) with dashed borders and snowflake suffix is a smart differentiation strategy.

### Accessibility
- Tiles at minimum `7.5rem × 3rem` (120×48px) — well above WCAG 2.5.8. Mobile row tiles at `100% × 3rem` — compliant.
- Each tile has comprehensive `aria-label` with room name, temperature, humidity. Low battery appends to the label. Unavailable announces "sensor offline".
- The battery badge uses animation + color + shape (dot) — triple encoding. `prefers-reduced-motion` makes it static at full opacity.
- Summary row `aria-live="polite"` — correct for non-urgent aggregate updates.
- Grid-to-list transition on mobile (§10) maintains information while adapting layout — good responsive pattern.

### Recommendations
1. **APPROVED**: Tile-based grid layout with floor grouping — authentic LCARS internal sensor display.
2. **APPROVED**: Tile pill shape (flat left, rounded right) — matches LCARS cap/button DNA.
3. **APPROVED**: Sparkline implementation at 1rem height — minimally elegant.
4. **NEEDS CLARIFICATION**: Font size tokens `--lcars-font-subtitle` / `--lcars-font-body` vs `--lcars-font-size-sub` / `--lcars-font-size-data` used in other specs. Verify these resolve to the same computed values, or standardize on one naming convention across all specs. If `--lcars-font-subtitle` (1.5rem) ≠ `--lcars-font-size-sub` (1.25rem), we have a cross-panel inconsistency that must be resolved before implementation.
5. **NOTE** (§5): `--lcars-blue` (#5566ff) at 4.6:1 is acceptable for colored text paired with numeric values but may be hard to distinguish from `--lcars-bluey` (#8899ff) at small sizes. Ensure the "cold" vs "cool" boundary is meaningful to users — if the practical difference between 54°F and 56°F doesn't warrant a color change, consider simplifying to 4 temperature tiers.
6. **APPROVED**: Appliance meter visual differentiation (dashed border, exclusion from averages).
7. **APPROVED**: Responsive behavior — grid→list transition on mobile.

---
