## 1. Design Constants & Grid System

All sizing derives from Jörn Weißenborn's mathematical grid (lcars-css-framework), adapted for the HA panel viewport.

```
LCARS Base Unit (1u)   = 7.5rem   = 120px at 16px root
LCARS Vertical Unit    = 3rem     = 48px
LCARS Gap              = 0.25rem  = 4px
Elbow Width            = 9.5rem   = 152px
Elbow Height           = 4.5rem   = 72px
Elbow Outer Radius     = 3.75rem  = 60px
Elbow Inner Cutout     = 2rem × 3rem, radius 1.875rem
Header Bar Height      = 1.5rem   = 24px
Footer Bar Height      = 1.5rem   = 24px
Sidebar Width          = 12rem    = 192px (desktop), collapsed on mobile
End Cap Size           = 1.5rem × 1.5rem, radius 0.75rem
Button Height          = 3rem     = 48px (meets WCAG 2.5.8 target-size 24×24 minimum)
Button Border Radius   = 0 1.5rem 1.5rem 0  (flat left, round right)
Sidebar Button Radius  = 1.5rem 0 0 1.5rem  (round left, flat right — docked to sidebar edge)
Content Padding        = 0.5rem   = 8px (from frame inner edge)
```

### Grid Formula for Multi-Unit Spans

```
width  = n × 7.5 + (n-1) × 0.25 rem
height = n × 3   + (n-1) × 0.25 rem
```

Examples:
- 2u wide = 15.25rem
- 3u wide = 23rem
- 2vu tall = 6.25rem

---
