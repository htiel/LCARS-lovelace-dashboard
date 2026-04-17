## Worf + Data — v4.13.0 Visual Enhancements Review

**Date**: Stardate 2026.04.13

### Worf (Security)
**Verdict**: APPROVED WITH CONDITIONS

- **[M3 — APPLIED]** Replaced CSS `content: attr(data-panel-code)` pseudo-element with `<span aria-hidden="true">` to prevent screen reader announcement of decorative numeric codes. All panels inherit fix since this is in the base class.
- No XSS vectors — all rendering via LitElement `html` tagged template auto-escaping.
- No supply chain changes. No `innerHTML`/`unsafeHTML`. Perimeter holds.

### Data (Architecture)
**Verdict**: APPROVED

- **[L-4 — APPLIED]** Fixed hash function modulo from `% 100000000` to `% 1000000` for consistent 6-digit output with 3-3 split format.
- **[M-1]** Keyframe naming: standardize to `lcars-{panel}-{effect}` during implementation.
- **[M-7]** Warp Core 14 box-shadows at full charge: consider single `filter: drop-shadow()` on container, or limit glow to tier-1 pills. Advisory for implementation.
- **[R-1]** Extract shared keyframes (`viewscreen-activate`, `cascade-in`, `frame-breathe`, `button-flash`, `distress-pulse`) into `lcars-shared-animations.js`. Saves ~1.2 KiB.
- **[R-2]** Extract state→color switch functions into shared `STATE_COLOR_MAP` in `lcars-color-utils.js`. Saves ~2 KiB.
- **[R-5]** Establish animation timing token scale (flash=200ms, confirm=400ms, pulse-urgent=1s, pulse=2s, breathe=4s, ambient=8s).
