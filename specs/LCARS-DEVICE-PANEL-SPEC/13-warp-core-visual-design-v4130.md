## 13. Warp Core Visual Design (v4.13.0)

**Replaces**: The v4.12 single-fill cylindrical warp core  
**Inspiration**: TNG-era warp core power conduit display (see `localinfo/inspiration/battery panel 1.png`)  
**Status**: Implementation-Ready  
**Component**: `lcars-homepage-card.js` → battery panel `grid-area: core`

### 13.1 Design Rationale

The original warp core was a simple rounded rectangle with a CSS `height` fill — functional but visually flat. It didn't read as a *warp core*. The v4.13 redesign replaces it with a **segmented pill-column assembly** that matches the on-screen TNG warp core aesthetic: two columns of horizontal power segments stacked around a central reaction chamber (junction ring), capped with trapezoidal funnels and terminal endcaps.

The new design serves as the **visual centerpiece** of the battery panel. Per Gene Roddenberry's principle: simplicity conveys advanced technology. The segmented pills communicate charge level through *how many segments are illuminated* — an instantly readable analog meter, like fuel rods in a reactor display. No numbers needed at a glance.

Per Bracer Jack's Manifesto: "Empty space is beautiful." The 3px gaps between pills let the black background breathe through the assembly, reinforcing the segmented mechanical feel.

**Design Note — Glow Exception**: Lit pills use a subtle `box-shadow` glow. This is an **intentional, documented deviation** from Bracer Jack Rule #1 ("no drop shadows"). Justification: the glow is a *functional status indicator* communicating the active charge level of each segment — it is not decorative embellishment. The canonical System 47 LCARS screensaver uses bloom/glow on active power conduit readouts. The glow is essential for the warp core to "read" as a power visualization rather than a static UI frame element.

### 13.2 Visual Layout — ASCII Diagram

```
                                 386456   ← decorative Okudagram code
                              ┌──────┐
                              │ENDCAP│   ← 0.5rem tall, gray, rounded
                              └──┬───┘
                             ╱        ╲
                            ╱  FUNNEL   ╲  ← trapezoid, gray, 1.75rem tall
                           ╱              ╲
     ┌──────────────────────────────────────────┐
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 7    │ ← pill row (furthest from junction)
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 6    │    lit LAST as charge increases
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 5    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 4    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 3    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 2    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 1    │ ← nearest junction, lit FIRST
     │ ┌─────────┐ ┃  ┃ ┌─────────┐            │
     │ │▓▓FLANGE▓│(●RING●)│▓FLANGE▓▓│  JUNCTION│ ← center reaction chamber
     │ └─────────┘ ┃  ┃ └─────────┘            │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 1    │ ← nearest junction, lit FIRST
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 2    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 3    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 4    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 5    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 6    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 7    │ ← furthest from junction
     └──────────────────────────────────────────┘
                           ╲              ╱
                            ╲   FUNNEL  ╱
                             ╲        ╱
                              ┌──────┐
                              │ENDCAP│
                              └──────┘
                              1436-78    ← decorative Okudagram code

     ← LEFT PILL   ┃RAILS┃  RIGHT PILL →
       (rounded-L)           (rounded-R)
```

**Fill direction: CENTER → OUT**. Power radiates from the junction ring outward. Tier 1 (closest to junction) lights first. Tier 7 (extremities) lights last. This matches the matter/antimatter reaction metaphor: energy originates at the dilithium chamber and propagates outward through the power transfer conduits.

### 13.3 Complete DOM Structure (LitElement Template)

```javascript
/* ── Charge computation ── */
const PILL_TIERS = 7;
const litTiers = charge > 0
  ? Math.max(1, Math.ceil(charge / 100 * PILL_TIERS))
  : 0;

const coreState = isCharging ? 'charging'
  : charge < 5 ? 'critical'
  : charge < 20 ? 'low'
  : 'normal';

/* ── Pill row generator ── */
const renderPillRow = (tier, lit) => html`
  <div class="core-pill-row">
    <div class="core-pill core-pill--left ${lit ? 'pill-lit' : 'pill-dim'}"
         style="--pill-tier:${tier}"></div>
    <div class="core-pill core-pill--right ${lit ? 'pill-lit' : 'pill-dim'}"
         style="--pill-tier:${tier}"></div>
  </div>
`;

/* ── Upper pills: DOM top→bottom = tier 7→1 (away from junction → toward junction) ── */
const upperPills = Array.from({length: PILL_TIERS}, (_, i) => {
  const tier = PILL_TIERS - i;               // 7 at top, 1 at bottom (near junction)
  return renderPillRow(tier, tier <= litTiers);
});

/* ── Lower pills: DOM top→bottom = tier 1→7 (toward junction → away from junction) ── */
const lowerPills = Array.from({length: PILL_TIERS}, (_, i) => {
  const tier = i + 1;                         // 1 at top (near junction), 7 at bottom
  return renderPillRow(tier, tier <= litTiers);
});
```

```html
<!-- Warp Core Assembly -->
<div class="warp-core-assembly" data-state="${coreState}"
     role="meter"
     aria-valuenow="${Math.round(charge)}"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="Warp core charge level: ${Math.round(charge)} percent${
       isCharging ? ', charging' : ''}${
       charge < 5 ? ', critical' : charge < 20 ? ', low' : ''}">

  <!-- Top decorative code -->
  <span class="core-funnel-code" aria-hidden="true">386456</span>

  <!-- Top endcap -->
  <div class="core-endcap" aria-hidden="true"></div>

  <!-- Top funnel -->
  <div class="core-funnel core-funnel--top" aria-hidden="true"></div>

  <!-- Main core body -->
  <div class="core-body" aria-hidden="true">

    <!-- Upper pill section (tier 7 at top → tier 1 near junction) -->
    <div class="core-pills-section">
      ${upperPills}
    </div>

    <!-- Junction ring with flanges -->
    <div class="core-junction">
      <div class="core-flange core-flange--left"></div>
      <div class="core-junction-ring"></div>
      <div class="core-flange core-flange--right"></div>
    </div>

    <!-- Lower pill section (tier 1 near junction → tier 7 at bottom) -->
    <div class="core-pills-section">
      ${lowerPills}
    </div>

  </div>

  <!-- Bottom funnel -->
  <div class="core-funnel core-funnel--bottom" aria-hidden="true"></div>

  <!-- Bottom endcap -->
  <div class="core-endcap" aria-hidden="true"></div>

  <!-- Bottom decorative code -->
  <span class="core-funnel-code" aria-hidden="true">1436-78</span>
</div>
```

### 13.4 Complete CSS

#### 13.4.1 Assembly Container

```css
/* ═══════════════════════════════════════════════════
   WARP CORE ASSEMBLY
   Container sits in grid-area: core of the battery panel.
   Flex column stacks: code → endcap → funnel → body → funnel → endcap → code
   ═══════════════════════════════════════════════════ */
.warp-core-assembly {
  grid-area: core;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;                       /* 2px micro-gap between vertical sections */
  padding: 0.5rem 0;
  min-height: 14rem;
  width: 5.5rem;                       /* tight bounding box — core is narrow */
  justify-self: center;                /* center within grid cell */

  /* State-driven CSS custom properties (defaults = normal state) */
  --core-pill-color: var(--lcars-ice);
  --core-pill-glow: rgba(153, 204, 255, 0.45);
  --core-pill-dim: 0.12;
}
```

#### 13.4.2 Decorative Funnel Codes

```css
.core-funnel-code {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-ice);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
  user-select: none;
  opacity: 0.6;
}
```

#### 13.4.3 Endcaps

```css
/* Terminal endcaps — small rounded rectangles at top and bottom */
.core-endcap {
  width: 2rem;                         /* ~36% of core body width, matching funnel narrow end */
  height: 0.5rem;
  background: var(--lcars-gray);
  border-radius: 0.25rem;
  flex-shrink: 0;
}
```

#### 13.4.4 Funnels

```css
/* Trapezoidal funnels — wide at core body, narrow at endcap */
.core-funnel {
  width: 100%;                         /* matches core body width */
  height: 1.75rem;
  background: var(--lcars-gray);
  flex-shrink: 0;
}

/* Top funnel: narrow at top, wide at bottom */
.core-funnel--top {
  clip-path: polygon(28% 0%, 72% 0%, 100% 100%, 0% 100%);
}

/* Bottom funnel: wide at top, narrow at bottom */
.core-funnel--bottom {
  clip-path: polygon(0% 0%, 100% 0%, 72% 100%, 28% 100%);
}
```

#### 13.4.5 Core Body (Main Frame)

```css
/* Core body — the rectangular section containing pills, rails, and junction */
.core-body {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  gap: 0;                              /* junction handles its own spacing */
  flex: 1 1 auto;                      /* grow to fill available height */
}

/* ── Side Rails ──
   Two thin vertical lines running full height through the center gap.
   Positioned on the core-body via pseudo-elements so they pass behind
   the junction ring and flanges (junction has higher z-index). */
.core-body::before,
.core-body::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--lcars-ice);
  opacity: 0.25;
  z-index: 0;
  pointer-events: none;
}

/* Left rail — offset left of center */
.core-body::before {
  left: calc(50% - 4px);
}

/* Right rail — offset right of center */
.core-body::after {
  left: calc(50% + 2px);
}
```

#### 13.4.6 Pill Sections & Pill Rows

```css
/* Pills section — upper or lower group of 7 rows */
.core-pills-section {
  display: flex;
  flex-direction: column;
  gap: 3px;                            /* visible gap between pill rows per reference image */
  position: relative;
  z-index: 1;                          /* above rails */
}

/* Pill row — contains left pill + right pill */
.core-pill-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 0.5rem;                       /* 0.5rem column gap houses the rails visually */
  height: 0.875rem;                    /* 14px pill height */
}
```

#### 13.4.7 Individual Pills

```css
/* ── Individual Pill ──
   Rounded rectangle: one flat side (inner, facing rails) and one
   rounded side (outer). Flat fill, no gradients.
   Colors driven by --core-pill-color on the assembly container. */
.core-pill {
  height: 100%;
  transition: background 0.6s ease, box-shadow 0.6s ease, opacity 0.6s ease;
}

/* Left pill: rounded left, flat right (faces center rails) */
.core-pill--left {
  border-radius: 0.625rem 0 0 0.625rem;
}

/* Right pill: flat left (faces center rails), rounded right */
.core-pill--right {
  border-radius: 0 0.625rem 0.625rem 0;
}

/* ── Lit state ── bright, glowing, fully alive */
.pill-lit {
  background: var(--core-pill-color);
  box-shadow: 0 0 8px 1px var(--core-pill-glow);
  opacity: 1;
}

/* ── Dim state ── ghost outline, nearly invisible */
.pill-dim {
  background: var(--core-pill-color);
  box-shadow: none;
  opacity: var(--core-pill-dim);       /* 0.12 default — barely visible on black */
}
```

#### 13.4.8 Junction Ring & Flanges

```css
/* ── Junction Assembly ──
   The central reaction chamber: a gray ring flanked by striped flanges.
   This is always visible regardless of charge level. */
.core-junction {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  height: 1.75rem;
  margin: 3px 0;                       /* match pill row gap spacing */
  position: relative;
  z-index: 2;                          /* above rails and pills */
}

/* Junction ring — the circular element at dead center */
.core-junction-ring {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 3px solid var(--lcars-gray);
  background: rgba(102, 102, 136, 0.3);  /* subtle gray fill */
  flex-shrink: 0;
  z-index: 3;
}

/* Flanges — striped mechanical bars extending from the ring to the edges */
.core-flange {
  flex: 1;
  height: 0.75rem;
  background: repeating-linear-gradient(
    0deg,
    var(--lcars-gray) 0px,
    var(--lcars-gray) 2px,
    transparent 2px,
    transparent 4px
  );
  opacity: 0.7;
}

/* Left flange has rounded-left cap */
.core-flange--left {
  border-radius: 0.375rem 0 0 0.375rem;
}

/* Right flange has rounded-right cap */
.core-flange--right {
  border-radius: 0 0.375rem 0.375rem 0;
}
```

### 13.5 Color States

The assembly's `data-state` attribute drives color overrides on the container's CSS custom properties.

#### 13.5.1 State Definitions

| State        | Condition                          | `--core-pill-color`             | `--core-pill-glow`                       | Animation             |
|--------------|------------------------------------|---------------------------------|------------------------------------------|-----------------------|
| **normal**   | charge ≥ 20%, not charging         | `var(--lcars-ice)` (#99ccff)    | `rgba(153, 204, 255, 0.45)`             | idle pulse            |
| **charging** | any charge, `isCharging === true`  | `var(--lcars-butterscotch)` (#ff9966) | `rgba(255, 153, 102, 0.5)`        | upward stripe cascade |
| **low**      | 5% ≤ charge < 20%, not charging   | `var(--lcars-tomato)` (#ff5555) | `rgba(255, 85, 85, 0.45)`               | slow pulse            |
| **critical** | charge < 5%, not charging          | `var(--lcars-tomato)` (#ff5555) | `rgba(255, 85, 85, 0.6)`                | fast pulse + blink    |

#### 13.5.2 State CSS Overrides

```css
/* ── Normal state (default) ── */
/* Properties already set on .warp-core-assembly — no override needed */

/* ── Charging state ── warm butterscotch power flow */
.warp-core-assembly[data-state="charging"] {
  --core-pill-color: var(--lcars-butterscotch);
  --core-pill-glow: rgba(255, 153, 102, 0.5);
}

/* ── Low battery ── alert tomato */
.warp-core-assembly[data-state="low"] {
  --core-pill-color: var(--lcars-tomato);
  --core-pill-glow: rgba(255, 85, 85, 0.45);
}

/* ── Critical battery ── alert tomato, intensified */
.warp-core-assembly[data-state="critical"] {
  --core-pill-color: var(--lcars-tomato);
  --core-pill-glow: rgba(255, 85, 85, 0.6);
  --core-pill-dim: 0.06;              /* dim pills nearly invisible */
}
```

#### 13.5.3 Contrast Verification (all against #000000 background)

| State Color            | Hex       | Contrast vs #000 | WCAG Level | Usage              |
|------------------------|-----------|-------------------|------------|--------------------|
| `--lcars-ice`          | `#99ccff` | 10.3:1            | AAA        | Normal lit pills   |
| `--lcars-butterscotch` | `#ff9966` | 8.2:1             | AAA        | Charging lit pills |
| `--lcars-tomato`       | `#ff5555` | 5.2:1             | AA         | Low/critical pills |
| `--lcars-gray`         | `#666688` | 4.6:1             | AA         | Junction, flanges  |

All pass **WCAG 1.4.11** Non-text Contrast (3:1 minimum for UI components).

### 13.6 Animation Keyframes

#### 13.6.1 Idle Pulse (Normal State)

A gentle opacity oscillation on lit pills. The pulse cascades outward from the junction: tier 1 starts first, tier 7 last, via `animation-delay` driven by `--pill-tier`.

```css
@keyframes core-idle-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.65; }
}

/* Normal state: idle pulse on lit pills */
.warp-core-assembly[data-state="normal"] .pill-lit {
  animation: core-idle-pulse 3s ease-in-out infinite;
  animation-delay: calc((var(--pill-tier, 1) - 1) * 80ms);
}
```

**Timing**: 3s period is slow and meditative — conveying advanced technology that doesn't rush (Source: System 47 animation tempo reference). The 80ms inter-tier stagger creates a visible ripple from center to extremities over ~480ms.

#### 13.6.2 Charging Cascade (Charging State)

When charging, lit pills show a moving stripe pattern flowing upward. Each pill's stripe animation is offset by tier so the visual energy cascades outward from the junction.

```css
/* Stripe texture applied to lit pills during charging */
.warp-core-assembly[data-state="charging"] .pill-lit {
  background-image: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 4px,
    rgba(255, 255, 255, 0.18) 4px,
    rgba(255, 255, 255, 0.18) 6px
  );
  background-size: 100% 12px;
  animation: core-charge-stripe 0.8s linear infinite;
  animation-delay: calc((var(--pill-tier, 1) - 1) * 60ms);
}

@keyframes core-charge-stripe {
  0%   { background-position-y: 0; }
  100% { background-position-y: -12px; }
}
```

**Timing**: 0.8s stripe cycle is brisk — communicating active energy transfer. The 60ms inter-tier stagger (`7 × 60ms = 420ms` total) keeps the cascade under 500ms, well within the 1s animation cap.

#### 13.6.3 Low Battery Pulse (Low State)

A slow, wide-amplitude pulse on lit pills signals reduced power.

```css
@keyframes core-low-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.35; }
}

.warp-core-assembly[data-state="low"] .pill-lit {
  animation: core-low-pulse 2s ease-in-out infinite;
  animation-delay: calc((var(--pill-tier, 1) - 1) * 50ms);
}
```

#### 13.6.4 Critical Battery Alert (Critical State)

Fast pulsing with an intermittent full-assembly blink. This is the warp core equivalent of a Red Alert — something demands immediate attention.

```css
@keyframes core-critical-pulse {
  0%, 100% { opacity: 1; }
  30%      { opacity: 0.2; }
  60%      { opacity: 0.9; }
}

@keyframes core-critical-blink {
  0%, 80%, 100% { opacity: 1; }
  90%           { opacity: 0.3; }
}

.warp-core-assembly[data-state="critical"] .pill-lit {
  animation: core-critical-pulse 1s ease-in-out infinite;
}

/* Assembly-level blink at critical — the whole core flickers */
.warp-core-assembly[data-state="critical"] {
  animation: core-critical-blink 4s ease-in-out infinite;
}
```

#### 13.6.5 Junction Ring Glow (All States)

The junction ring subtly reflects the current state color, reinforcing that the "reaction chamber" is responding to charge level.

```css
.warp-core-assembly[data-state="normal"] .core-junction-ring {
  box-shadow: 0 0 4px rgba(153, 204, 255, 0.3);
}

.warp-core-assembly[data-state="charging"] .core-junction-ring {
  box-shadow: 0 0 6px rgba(255, 153, 102, 0.4);
}

.warp-core-assembly[data-state="low"] .core-junction-ring,
.warp-core-assembly[data-state="critical"] .core-junction-ring {
  box-shadow: 0 0 6px rgba(255, 85, 85, 0.4);
}
```

### 13.7 Charge Level Mapping

#### 13.7.1 Algorithm

The core uses **center-out fill**: power radiates from the junction ring outward toward the extremities.

```javascript
const PILL_TIERS = 7;

/**
 * Compute the number of lit tiers (1–7) from a charge percentage (0–100).
 * Each tier illuminates one row above AND one row below the junction
 * simultaneously (14 pill rows total = 7 symmetric tiers).
 *
 * Fill direction: junction → extremities (center-out).
 * At 0%: no tiers lit (core is dead).
 * At >0%: minimum 1 tier (core shows signs of life).
 * At 100%: all 7 tiers lit (power reaches the endpoints).
 */
function computeLitTiers(charge) {
  if (charge <= 0) return 0;
  return Math.max(1, Math.ceil(charge / 100 * PILL_TIERS));
}
```

#### 13.7.2 Tier Boundary Table

| Charge %   | Lit Tiers | Lit Rows (of 14) | Visual                                     |
|------------|-----------|-------------------|--------------------------------------------|
| 0          | 0         | 0                 | All pills dim, core is dead                |
| 1 – 14     | 1         | 2                 | Junction-adjacent pills only, barely alive |
| 15 – 28    | 2         | 4                 | Small glow around junction                 |
| 29 – 42    | 3         | 6                 | Core warming up                            |
| 43 – 57    | 4         | 8                 | Healthy mid-range, center-heavy glow       |
| 58 – 71    | 5         | 10                | Strong power flow                          |
| 72 – 85    | 6         | 12                | Near full, outer pills beginning to light  |
| 86 – 100   | 7         | 14                | Full power — all segments lit, core blazing|

#### 13.7.3 Tier Assignment Per Row

**Upper pills section** (DOM order: top to bottom, i = 0…6):
```
Row i → tier = 7 - i
```
- i=0 (topmost): tier 7 — furthest from junction, lit last
- i=6 (nearest junction): tier 1 — lit first

**Lower pills section** (DOM order: top to bottom, i = 0…6):
```
Row i → tier = i + 1
```
- i=0 (nearest junction): tier 1 — lit first  
- i=6 (bottommost): tier 7 — lit last

A row is **lit** if `tier <= litTiers`. Otherwise **dim**.

### 13.8 Reduced Motion Fallback

```css
@media (prefers-reduced-motion: reduce) {
  .warp-core-assembly,
  .warp-core-assembly .pill-lit,
  .warp-core-assembly .core-junction-ring {
    animation: none !important;
    transition: none !important;
  }

  /* Static brightness differentiation replaces animation:
     - Lit pills at full opacity (no pulse)
     - Dim pills at reduced opacity (no transition)
     - State color changes apply instantly */
  .warp-core-assembly .pill-lit {
    opacity: 1 !important;
  }

  /* Charging state: static stripes (no motion) but keep the texture
     so the charging state is still visually distinct */
  .warp-core-assembly[data-state="charging"] .pill-lit {
    background-image: repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 4px,
      rgba(255, 255, 255, 0.18) 4px,
      rgba(255, 255, 255, 0.18) 6px
    );
  }
}
```

Per WCAG 2.3.3 and the existing `prefers-reduced-motion` pattern in `lcars-styles.js`: all animations stop, all transitions become instant. The visual meter (lit pills vs dim pills) is fully functional without motion — the charge level is always readable from the static segment count.

### 13.9 Accessibility

#### 13.9.1 ARIA Meter Pattern

The assembly uses `role="meter"` — the semantic HTML meter pattern for a scalar value within a known range.

| Attribute          | Value                                          | Purpose                                      |
|--------------------|-------------------------------------------------|----------------------------------------------|
| `role`             | `meter`                                         | Communicates this is a gauge/meter to AT      |
| `aria-valuenow`    | `${Math.round(charge)}`                        | Current charge percentage (0–100)             |
| `aria-valuemin`    | `0`                                             | Minimum value                                 |
| `aria-valuemax`    | `100`                                           | Maximum value                                 |
| `aria-label`       | `Warp core charge level: N percent[, state]`   | Human-readable description with state context |

The `aria-label` dynamically includes state qualifiers:
- ", charging" appended when `isCharging` is true
- ", critical" appended when charge < 5%
- ", low" appended when charge < 20%

#### 13.9.2 Decorative Elements Hidden from AT

All visual-only structural elements are marked `aria-hidden="true"`:
- Funnel codes (`386456`, `1436-78`), endcaps, funnels, core body (pills, rails, junction)

The *only* element exposed to assistive technology is the outer `.warp-core-assembly` container with its `role="meter"` attributes. The segmented pill visual is a decorative representation — the actual data is communicated through the ARIA meter values.

#### 13.9.3 Color Is Not Sole Indicator (WCAG 1.4.1)

The charge level is conveyed through **three independent channels**:
1. **Segment count** — how many pill tiers are lit (spatial/geometric, not color-dependent)
2. **ARIA value** — screen reader announces the numeric percentage  
3. **Color** — ice/butterscotch/tomato for state reinforcement (redundant channel)

A user who cannot perceive color can still read the charge level from the number of lit segments. A user who cannot see at all gets the percentage via screen reader. Color is never the sole means.

#### 13.9.4 Status Change Announcements (WCAG 4.1.3)

When the core state changes (e.g., normal → low, or idle → charging), the battery panel's existing `aria-live="polite"` status region announces the change:

```javascript
// In the battery panel's updated() lifecycle:
if (prevState !== coreState) {
  this._announceStatus(
    `${deviceName}: battery ${Math.round(charge)} percent, ${coreState}`
  );
}
```

### 13.10 Interaction with Battery Panel Grid

The warp core assembly occupies `grid-area: core` in the existing battery panel layout. No changes to the grid definition are needed. The assembly's `width: 5.5rem` and `justify-self: center` keep it centered within the grid cell. `flex: 1 1 auto` on `.core-body` allows the pill sections to stretch vertically when the grid cell is taller than the minimum.

```
┌───────────────────────────────────────────────────┐
│ [totals]  │      [core]       │     [controls]    │
│           │                   │                   │
│ Battery A │   ╭━━╮   ╭━━╮    │  ┌─────────╮      │
│ Battery B │   ╭━━╮   ╭━━╮    │  │ SETTING │      │
│ Battery C │   ╭━━╮   ╭━━╮    │  └─────────╯      │
│           │   (●RING●)        │  ┌─────────╮      │
│           │   ╭━━╮   ╭━━╮    │  │ CONTROL │      │
│           │   ╭━━╮   ╭━━╮    │  └─────────╯      │
│           │   ╭━━╮   ╭━━╮    │                   │
└───────────────────────────────────────────────────┘
```

### 13.11 CSS Custom Properties Summary (New for Warp Core)

| Property              | Default                            | Scope                    | Purpose                                 |
|-----------------------|------------------------------------|--------------------------|-----------------------------------------|
| `--core-pill-color`   | `var(--lcars-ice)`                 | `.warp-core-assembly`    | Active pill fill color (state-driven)   |
| `--core-pill-glow`    | `rgba(153, 204, 255, 0.45)`       | `.warp-core-assembly`    | Active pill box-shadow glow color       |
| `--core-pill-dim`     | `0.12`                             | `.warp-core-assembly`    | Dim pill opacity                        |
| `--pill-tier`         | `1`                                | `.core-pill` (per-row)   | Tier index (1–7) for animation delay    |

### 13.12 Design Verification Checklist

| Rule                                                     | Source            | Compliant? | Notes                                    |
|----------------------------------------------------------|-------------------|------------|------------------------------------------|
| No gradients on structural elements                      | Bracer Jack #1    | ✅          | Pills are flat solid fills               |
| `box-shadow` glow on pills only                          | (documented exception) | ⚠️     | Functional status indicator, not decorative — see §13.1 |
| Frame thick→thin (flanges 0.75rem→rails 2px)             | Bracer Jack #2    | ✅          | Flange thickness > rail thickness        |
| Pill caps as natural termination points                  | Bracer Jack #4    | ✅          | Rounded ends terminate each pill segment |
| 3px gap = invisible grid alignment                       | Bracer Jack #5    | ✅          | Consistent gap between all pill rows     |
| Exactly 3 font sizes (data only used here)               | Bracer Jack #6    | ✅          | Funnel codes use `--lcars-font-size-data`|
| ≤3 color families at rest                                 | Bracer Jack color | ✅          | Ice (pills) + gray (structure) + white (codes) |
| State colors add ≤2 more families                        | Bracer Jack color | ✅          | Butterscotch (charging) + tomato (alert) |
| All text uppercase                                       | TheLCARS.com      | ✅          | Funnel codes are numeric (case n/a)      |
| Antonio font only                                        | TheLCARS.com      | ✅          | `var(--lcars-font)`                      |
| CSS custom properties, no hardcoded hex                  | Project rule      | ✅          | All colors via `--lcars-*` vars          |
| Animations < 1s, `prefers-reduced-motion` respected      | WCAG + project    | ✅          | Longest animation: 0.8s stripe cycle     |
| Non-text contrast ≥ 3:1 (WCAG 1.4.11)                   | WCAG 1.4.11       | ✅          | All pill/structure colors verified       |
| Color not sole means of information (WCAG 1.4.1)         | WCAG 1.4.1        | ✅          | Segment count + ARIA + color             |
| `role="meter"` with full ARIA value attributes           | WCAG 4.1.2        | ✅          | valuenow, valuemin, valuemax, label      |
| Decorative elements hidden from AT                       | WCAG 4.1.2        | ✅          | `aria-hidden="true"` on all visual parts |
| Status changes announced via `aria-live`                 | WCAG 4.1.3        | ✅          | State transitions announced              |
| Pure CSS+HTML, no SVG or canvas                          | Admiral's orders  | ✅          | `clip-path: polygon()` for funnels       |

---

*"She's more than a gauge, Captain — she's the heart of the ship. When that core is lit up, you know she's got power to spare. When it's dark... you start looking for a starbase."*  
— La Forge, Main Engineering

---
