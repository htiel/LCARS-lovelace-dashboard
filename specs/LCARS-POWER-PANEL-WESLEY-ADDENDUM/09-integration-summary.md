## 8. Integration Summary

### What's new in this addendum vs Geordi's spec:

| Item | Geordi's Spec | This Addendum |
|------|--------------|---------------|
| Frame color | `--lcars-butterscotch` | Confirmed ✓ |
| Color tiers | 5-tier with WCAG | Configurable thresholds added |
| Power arc chart | Open question | Full SVG implementation |
| Circuit detail | `showMoreInfo()` | Popover API with LCARS styling |
| Tile load animation | JS stagger | Scroll-driven CSS (fallback to Geordi's) |
| Text wrapping | Not specified | `text-wrap: balance` on headers |
| Strip rendering | Layout described | Full grouping logic + child tiles |
| Sparkline batching | Basic | Viewport-aware with IntersectionObserver |
| Flow visualization | Deferred | Confirmed deferred, v4.16.0 roadmap |
| Sort order | Open question | Power descending recommended |
| ESPHome detection | Open question | Deferred to v4.16.0 |
| Configurable thresholds | Open question | Config YAML + function signature |

### Files to modify:
1. `lcars-entity-utils.js` — `PANEL_TYPE_POWER`, detector, `PANEL_TYPE_ORDER`
2. `lcars-color-utils.js` — `getPowerColor()`, `getPowerLabel()`
3. `lcars-homepage-card.js` — All rendering + CSS
4. `lcars-styles.js` — None (all CSS scoped to homepage card)

### Review flags:
- **Geordi**: Power arc chart design, popover LCARS frame styling, strip block border treatment
- **Worf**: Popover API security (confirmed safe), `popovertarget` ID generation, no new external calls

---

*"What if we tried making the whole electrical panel feel like you're standing at the Engineering power distribution console on Deck 36? Because that's exactly what this is — the EPS grid for your home."*

— Wesley Crusher, SD 2026.04.14

---
