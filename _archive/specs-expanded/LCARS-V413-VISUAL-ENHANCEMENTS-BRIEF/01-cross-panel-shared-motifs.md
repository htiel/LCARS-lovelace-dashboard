## Cross-Panel Shared Motifs

Before diving into per-panel specifics, these are reusable CSS building blocks referenced throughout. Each panel composes from this vocabulary.

| Motif | Description | CSS Technique |
|-------|-------------|---------------|
| **Pill Badge** | Rounded-capsule readout with label left, value right (from `thermostat.png` HUMID 63%) | `border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; display: inline-flex` |
| **Data Pips** | Row of small squares/dots along a panel edge — decorative telemetry (from `pool panel.png` bottom strip) | Repeating `background: repeating-linear-gradient` or pseudo-element grid |
| **Numeric Code** | 6–8 digit decorative stardate-style number (053-11974 from `general.png`) | `::before` / `::after` content with `attr()` or CSS custom property |
| **Segment Bar** | Discrete stacked blocks instead of smooth fill (from `general.png` DILITHIUM/PLASMA meters) | `background: repeating-linear-gradient(to top, color 0 segH, transparent segH segH+gap)` |
| **Ring Gauge** | Partial donut arc using `conic-gradient` on a rounded element (from `general.png` center rings) | `conic-gradient(from Xdeg, color 0 Ydeg, transparent Ydeg)` with `border-radius: 50%` |
| **Glow Halo** | Soft radial color bleed behind active elements | `box-shadow: 0 0 Xpx Ypx color` or `filter: drop-shadow()` |
| **Scan Line** | Horizontal luminous sweep across a surface | `@keyframes` translating a thin gradient pseudo-element top→bottom |

---
