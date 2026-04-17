## Executive Summary

The `lcars-homepage-card.js` monolith (7,545 lines) must be decomposed into reusable panel modules. My analysis of Lit composition patterns, Home Assistant frontend architecture, and the exemplary `lovelace-mushroom` HACS project converges on a single recommended pattern: **each panel as its own `customElements.define()` web component, sharing a common base class, composed via sub-element embedding in a thin orchestrator host.**

This is not opinion. This is what HA core does. This is what Mushroom does. This is what Lit documentation recommends for reusable UI units with their own state and template.

The key measurements:
- Current monolith: **7,545 lines**, 1 class, 10 inline panel renderers
- Proposed structure: **10 panel elements** (~200–920 lines each), **5 shared components**, **1 base class** (~150 lines), **1 orchestrator** (~2,200 lines)
- Bundle size impact: **~0 bytes** net change (same code, different files — webpack inlines everything)
- Migration risk: **Low** — incremental, one panel at a time, backwards-compatible at each step

---
