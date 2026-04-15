## Data — Architecture Review: v4.13.0 Visual Enhancements (BlueAir-Specific)

**Reviewer**: Data (Architecture & Code Quality)
**Date**: Stardate 2026.04.13
**Status**: APPROVED WITH CONDITIONS

### Findings

1. **MEDIUM — DRY violation: `getCo2Level()` duplicates `getCo2Color()` in `lcars-color-utils.js`.** Two functions for CO₂ thresholds with different tier counts (3 vs 4) and different color mappings. **NOTED**: Spec now includes DRY reconciliation note — resolve to single source of truth before implementation.
2. **LOW — First-render animation budget transient exceeds ≤6 for ~730ms.** GPU-composited transform+opacity stagger. **NOTED**: Budget transient annotation added per R3.
3. **INFO — `{ once: true }` animationend pattern is correct. YAGNI: shared helper abstraction unnecessary.**
4. **INFO — Multi-sparkline stagger inherits correctly from Atmoscrubber CSS. Good DRY compliance.**
5. **INFO — Reduced-motion compliance is thorough. Filter-expired static outline fallback is exemplary.**

### Conditions (Applied)
- **R1/R2 (NOTED)**: DRY reconciliation note added — `getCo2Color()` must be updated to match before implementation.
- **R3 (APPLIED)**: First-render budget transient documented in animation budget summary.

### Consultation Notes
- **Geordi**: Ice/sunflower/tomato 3-tier model is visually cleaner. Recommends collapsing `getCo2Color()` to 3 tiers.
- **Wesley**: Concurs with eliminating `getCo2Level()` in favour of direct `getCo2Color()` inline style.

---
