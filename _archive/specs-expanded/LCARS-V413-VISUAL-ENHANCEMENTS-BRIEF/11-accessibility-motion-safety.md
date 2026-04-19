## Accessibility & Motion Safety

All animated enhancements **MUST** be gated behind:

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all continuous/looping animations */
  /* Keep single-fire confirmations (button flash, completion flash) but reduce duration by 50% */
  /* Keep static glows — they're not motion, they're color */
}
```

> **[Worf R5] Security Invariant**: No `innerHTML`, `unsafeHTML()`, or direct DOM
> `textContent` assignment is used for entity-derived data. All rendering flows
> through LitElement `html` tagged template auto-escaping. This invariant MUST be
> maintained across all v4.13.0 implementations.

Animations fall into three categories:

| Category | Motion Setting: `no-preference` | Motion Setting: `reduce` |
|----------|-------------------------------|--------------------------|
| **Ambient loops** (breathing, waveform, caustics, particle drift, pump spin) | Full animation | Disabled — static fallback |
| **State transitions** (glow changes, color shifts, bar fills) | Animated transition | Instant transition (0ms duration) |
| **Confirmations** (button flash, completion flash, key preview) | Full animation | Duration halved, still plays |

---
