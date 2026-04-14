# LCARS UI Architecture Specification

**Version**: 1.0  
**Date**: 2026-04-10  
**Target**: Lit-element v2 / lit-html v1 web components for Home Assistant Lovelace  
**Author**: Geordi La Forge (LCARS Design Authority)

---

## Table of Contents

1. [Design Constants & Grid System](#1-design-constants--grid-system)
2. [CSS Custom Properties](#2-css-custom-properties)
3. [Typography](#3-typography)
4. [LCARS Layout Mapping — `lcars-dashboard-layout`](#4-lcars-layout-mapping)
5. [Component Visual Specifications](#5-component-visual-specifications)
6. [Color Assignment by UI Role](#6-color-assignment-by-ui-role)
7. [Interaction Design & Animation](#7-interaction-design--animation)
8. [Audio Grammar](#8-audio-grammar)
9. [Accessibility](#9-accessibility)
10. [Mobile / Responsive Strategy](#10-mobile--responsive-strategy)
11. [File Manifest](#11-file-manifest)

---

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

## 2. CSS Custom Properties

Define these in the `:host` selector of `lcars-dashboard-layout`. All child components inherit via CSS cascade through shadow DOM `::slotted` or by re-declaring in their own `:host`.

```css
:host {
  /* ═══════════════════════════════════════════
     LCARS COLOR PALETTE — Classic Theme (2369 era)
     Source: TheLCARS.com + Bracer Jack
     ═══════════════════════════════════════════ */

  /* Primary Palette */
  --lcars-butterscotch:    #ff9966;  /* Header elbows, header bar, primary action buttons */
  --lcars-sunflower:       #ffcc99;  /* Default button color, heading text */
  --lcars-african-violet:  #cc99ff;  /* Sidebar panels, footer elbows */
  --lcars-almond-creme:    #ffbbaa;  /* Sidebar panel accent */
  --lcars-almond:          #ffaa90;  /* Button variant, tile accent */
  --lcars-ice:             #99ccff;  /* Button variant, headings, frame borders */
  --lcars-gray:            #666688;  /* Default tile background, muted/disabled text */

  /* Secondary Palette */
  --lcars-lilac:           #cc55ff;  /* Button variant, tile accent */
  --lcars-gold:            #ffaa00;  /* Active/pressed button state */
  --lcars-golden-orange:   #ff9900;  /* Emphasis accent */
  --lcars-bluey:           #8899ff;  /* Secondary accent */
  --lcars-blue:            #5566ff;  /* Deep accent (rare) */
  --lcars-orange:          #ff8800;  /* Strong emphasis */
  --lcars-peach:           #ff8866;  /* Warm accent */
  --lcars-tomato:          #ff5555;  /* Error/alert states, red alert */
  --lcars-sky:             #aaaaff;  /* Cool accent */
  --lcars-violet-creme:    #ddbbff;  /* Soft accent */

  /* Semantic Colors */
  --lcars-space-white:     #f5f6fa;  /* Primary text color */
  --lcars-black:           #000000;  /* Background — ALWAYS */

  /* ═══════════════════════════════════════════
     SEMANTIC ROLE TOKENS
     ═══════════════════════════════════════════ */

  /* Frame Structure */
  --lcars-frame-header:        var(--lcars-butterscotch);
  --lcars-frame-footer:        var(--lcars-african-violet);
  --lcars-frame-sidebar:       var(--lcars-african-violet);
  --lcars-frame-sidebar-accent: var(--lcars-almond-creme);
  --lcars-frame-header-bar:    var(--lcars-butterscotch);
  --lcars-frame-footer-bar:    var(--lcars-african-violet);
  --lcars-frame-elbow-top:     var(--lcars-butterscotch);
  --lcars-frame-elbow-bottom:  var(--lcars-african-violet);

  /* Buttons */
  --lcars-button-default:      var(--lcars-sunflower);
  --lcars-button-hover:        brightness(1.2);
  --lcars-button-active:       var(--lcars-gold);
  --lcars-button-nav:          var(--lcars-african-violet);
  --lcars-button-action:       var(--lcars-butterscotch);
  --lcars-button-alt-1:        var(--lcars-ice);
  --lcars-button-alt-2:        var(--lcars-almond);
  --lcars-button-alt-3:        var(--lcars-lilac);
  --lcars-button-disabled:     var(--lcars-gray);

  /* Text */
  --lcars-text-primary:        var(--lcars-space-white);
  --lcars-text-heading:        var(--lcars-sunflower);
  --lcars-text-subheading:     var(--lcars-ice);
  --lcars-text-muted:          var(--lcars-gray);
  --lcars-text-alert:          var(--lcars-tomato);
  --lcars-text-on-button:      var(--lcars-black);

  /* Content Tiles */
  --lcars-tile-bg:             var(--lcars-gray);
  --lcars-tile-accent:         var(--lcars-almond);
  --lcars-tile-active:         var(--lcars-gold);

  /* Alerts */
  --lcars-status-ok:           var(--lcars-ice);
  --lcars-status-warn:         var(--lcars-golden-orange);
  --lcars-status-error:        var(--lcars-tomato);
  --lcars-status-offline:      var(--lcars-gray);

  /* ═══════════════════════════════════════════
     SIZING TOKENS
     ═══════════════════════════════════════════ */
  --lcars-unit:            7.5rem;
  --lcars-vunit:           3rem;
  --lcars-gap:             0.25rem;
  --lcars-sidebar-width:   12rem;
  --lcars-header-height:   4.5rem;   /* elbow height */
  --lcars-footer-height:   4.5rem;   /* elbow height */
  --lcars-bar-height:      1.5rem;
  --lcars-button-height:   3rem;
  --lcars-elbow-width:     9.5rem;
  --lcars-elbow-height:    4.5rem;
  --lcars-elbow-radius:    3.75rem;
  --lcars-endcap-size:     1.5rem;
  --lcars-endcap-radius:   0.75rem;
  --lcars-btn-radius:      1.5rem;

  /* ═══════════════════════════════════════════
     TYPOGRAPHY TOKENS
     ═══════════════════════════════════════════ */
  --lcars-font-family:     'Antonio', sans-serif;
  --lcars-font-title:      2.5rem;    /* Title size */
  --lcars-font-subtitle:   1.5rem;    /* Sub-header size */
  --lcars-font-body:        1rem;     /* Normal data size */
  --lcars-text-transform:  uppercase;

  /* ═══════════════════════════════════════════
     ANIMATION TOKENS
     ═══════════════════════════════════════════ */
  --lcars-transition-speed:     200ms;
  --lcars-transition-function:  ease-out;
  --lcars-fade-speed:           300ms;
}
```

### Google Fonts Import

```css
@import url('https://fonts.googleapis.com/css2?family=Antonio:wght@400;700&display=swap');
```

---

## 3. Typography

| Role               | Size                       | Weight | Transform   | Color                       |
|--------------------|-----------------------------|--------|-------------|-----------------------------|
| View title         | `var(--lcars-font-title)`   | 700    | `uppercase` | `var(--lcars-text-heading)`  |
| Section heading    | `var(--lcars-font-subtitle)`| 400    | `uppercase` | `var(--lcars-text-subheading)` |
| Button label       | `var(--lcars-font-body)`    | 400    | `uppercase` | `var(--lcars-text-on-button)` |
| Body text          | `var(--lcars-font-body)`    | 400    | `none`      | `var(--lcars-text-primary)`  |
| Status/data values | `var(--lcars-font-body)`    | 400    | `uppercase` | `var(--lcars-text-primary)`  |
| Muted/disabled     | `var(--lcars-font-body)`    | 400    | `uppercase` | `var(--lcars-text-muted)`    |

**Rules**:
- ONE font family throughout: Antonio
- Three sizes only: Title (2.5rem), Sub-header (1.5rem), Normal (1rem)
- ALL UPPERCASE for labels, buttons, headings, data readouts
- Mixed case ONLY for body paragraph text (descriptive prose)
- Letter-spacing on buttons: `0.05em`

---

## 4. LCARS Layout Mapping

### Conceptual Frame

```
┌───────────────────────────────────────────────────────────────┐
│ ┌─────────┐ ┌──────────────────────────────────────────┐│ ▲   │
│ │ ELBOW   │ │          HEADER BAR                 [CAP]││ │   │
│ │ top-left│ │  (butterscotch)                          ││4.5r │
│ │(butter- │ └──────────────────────────────────────────┘│ │   │
│ │ scotch) │                                              │ ▼   │
│ ├─────────┤  ┌──────────────────────────────────────────┐│     │
│ │ SIDEBAR │  │                                          ││     │
│ │(african │  │         MAIN CONTENT AREA                ││     │
│ │ violet) │  │      (slotted HA cards go here)          ││     │
│ │         │  │                                          ││     │
│ │ btn-01  │  │  <slot></slot>                           ││     │
│ │ btn-02  │  │                                          ││     │
│ │ btn-03  │  │                                          ││     │
│ │ ...     │  │                                          ││     │
│ │         │  │                                          ││     │
│ ├─────────┤  └──────────────────────────────────────────┘│     │
│ │ ELBOW   │ ┌──────────────────────────────────────────┐ │ ▲   │
│ │ bot-left│ │          FOOTER BAR                [CAP] │ │ │   │
│ │(african │ │  (african-violet)                        │ │4.5r │
│ │ violet) │ └──────────────────────────────────────────┘ │ ▼   │
│ └─────────┘                                              │     │
└───────────────────────────────────────────────────────────────┘
  Background: #000000
```

### `lcars-dashboard-layout` — HTML Structure

```html
<div class="lcars-frame">

  <!-- ═══ TOP ROW: Elbow + Header Bar ═══ -->
  <div class="lcars-header">
    <div class="lcars-elbow lcars-elbow--top-left">
      <div class="lcars-elbow__inner"></div>
      <!-- Elbow label (e.g. stardate or view title) -->
      <span class="lcars-elbow__label">USS ENTERPRISE</span>
    </div>
    <div class="lcars-header-bar">
      <span class="lcars-header-bar__title"><!-- dynamic view title --></span>
      <div class="lcars-header-bar__endcap"></div>
    </div>
  </div>

  <!-- ═══ MIDDLE ROW: Sidebar + Content ═══ -->
  <div class="lcars-body">
    <div class="lcars-sidebar">
      <div class="lcars-sidebar__rail">
        <!-- Continuous vertical bar connecting elbow to elbow -->
      </div>
      <nav class="lcars-sidebar__nav" role="navigation" aria-label="Main navigation">
        <!-- Navigation buttons rendered here -->
        <button class="lcars-btn lcars-btn--nav" data-view="home" aria-current="page">
          HOME
        </button>
        <button class="lcars-btn lcars-btn--nav" data-view="devices">
          DEVICES
        </button>
        <!-- Area buttons -->
        <div class="lcars-sidebar__divider"></div>
        <button class="lcars-btn lcars-btn--nav lcars-btn--area" data-area="living_room">
          LIVING ROOM
        </button>
        <!-- ... more area buttons ... -->
        <div class="lcars-sidebar__divider"></div>
        <button class="lcars-btn lcars-btn--nav" data-view="more_page">
          MORE
        </button>
      </nav>
    </div>

    <main class="lcars-content" role="main">
      <!-- HA cards injected here via <slot> -->
      <slot></slot>
    </main>
  </div>

  <!-- ═══ BOTTOM ROW: Elbow + Footer Bar ═══ -->
  <div class="lcars-footer">
    <div class="lcars-elbow lcars-elbow--bottom-left">
      <div class="lcars-elbow__inner"></div>
    </div>
    <div class="lcars-footer-bar">
      <span class="lcars-footer-bar__text">
        <!-- Status text, stardate, or attribution -->
      </span>
      <div class="lcars-footer-bar__endcap"></div>
    </div>
  </div>

</div>
```

### CSS Grid Approach

```css
.lcars-frame {
  display: grid;
  grid-template-rows: var(--lcars-elbow-height) 1fr var(--lcars-elbow-height);
  grid-template-columns: var(--lcars-sidebar-width) 1fr;
  grid-template-areas:
    "elbow-top    header-bar"
    "sidebar      content"
    "elbow-bottom footer-bar";
  gap: var(--lcars-gap);
  width: 100%;
  height: 100vh;
  background: var(--lcars-black);
  overflow: hidden;
  font-family: var(--lcars-font-family);
}

.lcars-header {
  grid-area: elbow-top / elbow-top / elbow-top / header-bar;
  display: flex;
  gap: var(--lcars-gap);
  align-items: stretch;
}

.lcars-body {
  grid-area: sidebar / sidebar / sidebar / content;
  display: flex;
  gap: var(--lcars-gap);
  overflow: hidden;
}

.lcars-footer {
  grid-area: elbow-bottom / elbow-bottom / elbow-bottom / footer-bar;
  display: flex;
  gap: var(--lcars-gap);
  align-items: stretch;
}

.lcars-sidebar {
  width: var(--lcars-sidebar-width);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
}

.lcars-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--lcars-gap);
  scrollbar-width: thin;
  scrollbar-color: var(--lcars-gray) var(--lcars-black);
}
```

### Elbow Construction (CSS)

The elbow is the single most characteristic LCARS element. It uses a `::after` pseudo-element for the inner cutout.

```css
.lcars-elbow {
  position: relative;
  width: var(--lcars-elbow-width);   /* 9.5rem */
  height: var(--lcars-elbow-height); /* 4.5rem */
  flex-shrink: 0;
}

/* ─── Top-Left Elbow ─── */
.lcars-elbow--top-left {
  background: var(--lcars-frame-elbow-top);
  border-radius: var(--lcars-elbow-radius) 0 0 0;  /* 3.75rem top-left only */
}

.lcars-elbow--top-left::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 2rem;
  height: 3rem;
  background: var(--lcars-black);
  border-radius: 0 0 0 1.875rem;
}

/* ─── Bottom-Left Elbow ─── */
.lcars-elbow--bottom-left {
  background: var(--lcars-frame-elbow-bottom);
  border-radius: 0 0 0 var(--lcars-elbow-radius);  /* 3.75rem bottom-left only */
}

.lcars-elbow--bottom-left::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 2rem;
  height: 3rem;
  background: var(--lcars-black);
  border-radius: 1.875rem 0 0 0;
}

/* ─── Elbow Label (inside the solid area) ─── */
.lcars-elbow__label {
  position: absolute;
  bottom: 0.5rem;
  left: 0.75rem;
  font-size: var(--lcars-font-body);
  color: var(--lcars-text-on-button);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### Header/Footer Bar Construction

```css
.lcars-header-bar,
.lcars-footer-bar {
  flex: 1;
  display: flex;
  align-items: center;
  height: var(--lcars-bar-height);  /* 1.5rem */
  align-self: flex-end;              /* Sits at bottom of header row */
  padding: 0 1rem;
}

.lcars-header-bar {
  background: var(--lcars-frame-header-bar);
}

.lcars-footer-bar {
  background: var(--lcars-frame-footer-bar);
  align-self: flex-start;            /* Sits at top of footer row */
}

/* End Cap — the rounded termination */
.lcars-header-bar__endcap,
.lcars-footer-bar__endcap {
  width: var(--lcars-endcap-size);   /* 1.5rem */
  height: var(--lcars-endcap-size);  /* 1.5rem */
  border-radius: var(--lcars-endcap-radius);  /* 0.75rem — fully round */
  flex-shrink: 0;
  margin-left: auto;
}

.lcars-header-bar__endcap {
  background: var(--lcars-frame-header-bar);
}

.lcars-footer-bar__endcap {
  background: var(--lcars-frame-footer-bar);
}

/* Bar title text */
.lcars-header-bar__title {
  font-size: var(--lcars-font-body);
  color: var(--lcars-black);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
}
```

### Sidebar Rail (Thick-Thin Rule)

Per Bracer Jack's fundamental rule: the frame goes thick→thin or thin→thick, NEVER the same thickness on consecutive turns:

```
  Elbow (thick: 9.5rem wide)
    ↓ turns into
  Sidebar rail (thin: 12rem wide — different proportion)
    ↓ turns into
  Elbow (thick: 9.5rem wide)
```

```css
.lcars-sidebar__rail {
  width: var(--lcars-sidebar-width);
  flex-shrink: 0;
  background: var(--lcars-frame-sidebar);
  /* Rail fills the gap between sidebar buttons */
}

.lcars-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: var(--lcars-gap) 0;
  flex: 1;
  overflow-y: auto;
}

.lcars-sidebar__divider {
  height: var(--lcars-gap);  /* 0.25rem — just a gap */
  background: transparent;
}
```

---

## 5. Component Visual Specifications

### 5.1 Buttons (Universal)

```css
.lcars-btn {
  display: flex;
  align-items: center;
  height: var(--lcars-button-height);  /* 3rem = 48px — WCAG 2.5.8 compliant */
  min-width: 5rem;                     /* Minimum touch target width */
  padding: 0 1rem;
  border: none;
  cursor: pointer;
  font-family: var(--lcars-font-family);
  font-size: var(--lcars-font-body);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--lcars-text-on-button);
  background: var(--lcars-button-default);
  transition: filter var(--lcars-transition-speed) var(--lcars-transition-function),
              background-color var(--lcars-transition-speed) var(--lcars-transition-function);
  /* NO gradients. NO box-shadow. NO border. FLAT. */
}

/* Shape: pill with flat left, round right (content-area buttons) */
.lcars-btn--pill-right {
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  text-align: left;
}

/* Shape: pill with round left, flat right (sidebar buttons — docked to sidebar edge) */
.lcars-btn--pill-left {
  border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
  text-align: left;
  padding-left: 1.5rem;
}

/* Hover: brightness shift ONLY */
.lcars-btn:hover {
  filter: brightness(1.2);
}

/* Active/Pressed: gold */
.lcars-btn:active,
.lcars-btn[aria-current="page"] {
  background: var(--lcars-button-active);
}

/* Focus visible: 2px outline for WCAG 2.4.7, 2.4.13 */
.lcars-btn:focus-visible {
  outline: 2px solid var(--lcars-space-white);
  outline-offset: 2px;
}

/* Disabled */
.lcars-btn:disabled {
  background: var(--lcars-button-disabled);
  color: var(--lcars-black);
  cursor: not-allowed;
  filter: none;
}
```

### 5.2 Navigation Buttons (Sidebar)

```css
.lcars-btn--nav {
  width: 100%;
  height: var(--lcars-button-height);   /* 3rem */
  background: var(--lcars-button-nav);  /* african-violet */
  border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
  justify-content: flex-start;
  padding-left: 1rem;
}

/* Area buttons use almond-creme for visual grouping distinction */
.lcars-btn--area {
  background: var(--lcars-frame-sidebar-accent);  /* almond-creme */
}

/* More-page buttons use ice */
.lcars-btn--more {
  background: var(--lcars-button-alt-1);  /* ice */
}
```

### 5.3 `homepage-card` — Visual Structure

The homepage displays area buttons (grid), a favorites section, and house info. Rendered inside `lcars-content`.

```
┌──────────────────────────────────────────────────┐
│  SECTION HEADING: "AREAS"            (sunflower) │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │ AREA    │ │ AREA    │ │ AREA    │            │
│  │ BTN     │ │ BTN     │ │ BTN     │            │
│  │ (pill)  │ │ (pill)  │ │ (pill)  │            │
│  └─────────┘ └─────────┘ └─────────┘            │
│  ┌─────────┐ ┌─────────┐                         │
│  │ AREA    │ │ AREA    │                         │
│  │ BTN     │ │ BTN     │                         │
│  └─────────┘ └─────────┘                         │
│                                                   │
│  SECTION HEADING: "FAVORITES"        (sunflower) │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │ FAV     │ │ FAV     │ │ FAV     │            │
│  │ ENTITY  │ │ ENTITY  │ │ ENTITY  │            │
│  └─────────┘ └─────────┘ └─────────┘            │
│                                                   │
│  SECTION HEADING: "SHIP STATUS"      (sunflower) │
│  ┌──────────────────────────────────────────┐    │
│  │ HOUSE INFORMATION CARD                    │    │
│  │ (embedded dwains-house-information-card)  │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

```css
/* Area button grid */
.lcars-area-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: var(--lcars-gap);
}

/* Individual area button (content pill — rounded right) */
.lcars-area-btn {
  height: calc(var(--lcars-button-height) * 2);  /* 6rem — taller for area prominence */
  background: var(--lcars-almond-creme);
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.5rem 1rem;
}

.lcars-area-btn__name {
  font-size: var(--lcars-font-subtitle);
  color: var(--lcars-text-on-button);
  text-transform: uppercase;
}

.lcars-area-btn__count {
  font-size: var(--lcars-font-body);
  color: var(--lcars-text-on-button);
  opacity: 0.7;
  text-transform: uppercase;
}
```

### 5.4 `dwains-heading-card` — Section Heading

A horizontal rule with text — LCARS style is a thin bar with text overlaid.

```css
.lcars-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0 0.5rem 0;
}

.lcars-heading__text {
  font-family: var(--lcars-font-family);
  font-size: var(--lcars-font-subtitle);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
}

.lcars-heading__line {
  flex: 1;
  height: 2px;
  background: var(--lcars-text-heading);
  opacity: 0.4;
}
```

### 5.5 `devices-card` — Devices Page

Devices page shows entities grouped by device, rendered as a list of LCARS panels.

```
┌──────────────────────────────────────────────────┐
│  HEADING: "DEVICES"                              │
│                                                   │
│  ┌─ DEVICE PANEL ────────────────────────────┐   │
│  │ ┌────────┐  DEVICE NAME            (ice)  │   │
│  │ │ ENTITY │  entity_id       state  (body) │   │
│  │ │ ROW    │  entity_id       state  (body) │   │
│  │ │ BUTTONS│  entity_id       state  (body) │   │
│  │ └────────┘                                 │   │
│  └────────────────────────────────────────────┘   │
│                                                   │
│  ┌─ DEVICE PANEL ────────────────────────────┐   │
│  │ ...                                        │   │
│  └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

```css
/* Device panel — mimics a mini LCARS frame bracket */
.lcars-device-panel {
  background: transparent;
  border-left: 4px solid var(--lcars-ice);
  padding: 0.5rem 0 0.5rem 1rem;
  margin-bottom: 0.5rem;
}

.lcars-device-panel__name {
  font-size: var(--lcars-font-subtitle);
  color: var(--lcars-text-subheading);
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

/* Entity row inside a device panel */
.lcars-entity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 2.5rem;
  padding: 0 0.5rem;
  gap: 0.5rem;
}

.lcars-entity-row__name {
  font-size: var(--lcars-font-body);
  color: var(--lcars-text-primary);
  text-transform: uppercase;
  flex: 1;
}

.lcars-entity-row__state {
  font-size: var(--lcars-font-body);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  text-align: right;
  min-width: 4rem;
}
```

### 5.6 `more-pages-card` — More Pages Navigation

A list of pill buttons, each linking to a custom more-page.

```css
.lcars-more-pages-list {
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: var(--lcars-gap);
}

.lcars-more-page-btn {
  height: var(--lcars-button-height);
  background: var(--lcars-button-alt-1);   /* ice */
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.lcars-more-page-btn__icon {
  color: var(--lcars-text-on-button);
  width: 1.5rem;
  height: 1.5rem;
}

.lcars-more-page-btn__label {
  font-family: var(--lcars-font-family);
  font-size: var(--lcars-font-body);
  color: var(--lcars-text-on-button);
  text-transform: uppercase;
}
```

### 5.7 `dwains-house-information-card`

Displays weather, alarm status, and sensor summaries. Uses a bracket-style mini-frame.

```css
.lcars-house-info {
  display: grid;
  grid-template-columns: 4px 1fr;
  gap: var(--lcars-gap);
  padding: 0.5rem 0;
}

.lcars-house-info__bracket {
  background: var(--lcars-african-violet);
  border-radius: 2px;
}

.lcars-house-info__content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lcars-house-info__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lcars-house-info__label {
  font-size: var(--lcars-font-body);
  color: var(--lcars-text-muted);
  text-transform: uppercase;
}

.lcars-house-info__value {
  font-size: var(--lcars-font-body);
  color: var(--lcars-text-primary);
  text-transform: uppercase;
}
```

### 5.8 `dwains-popup` — Dialog/Modal

Popups should appear as a centered LCARS sub-frame with their own mini elbow structure.

```css
.lcars-popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.lcars-popup {
  width: min(90vw, 40rem);
  max-height: 80vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: var(--lcars-gap);
  background: var(--lcars-black);
  overflow: hidden;
}

/* Popup header — mini horizontal bar + endcap */
.lcars-popup__header {
  display: flex;
  align-items: center;
  gap: var(--lcars-gap);
  height: var(--lcars-bar-height);
  background: var(--lcars-butterscotch);
  padding: 0 1rem;
  border-radius: var(--lcars-endcap-radius) var(--lcars-endcap-radius) 0 0;
}

.lcars-popup__title {
  font-family: var(--lcars-font-family);
  font-size: var(--lcars-font-body);
  color: var(--lcars-text-on-button);
  text-transform: uppercase;
  flex: 1;
}

.lcars-popup__close {
  width: 2rem;
  height: 2rem;
  background: var(--lcars-tomato);
  border: none;
  border-radius: var(--lcars-endcap-radius);
  color: var(--lcars-black);
  font-family: var(--lcars-font-family);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lcars-popup__body {
  padding: 1rem;
  overflow-y: auto;
}

.lcars-popup__footer {
  height: var(--lcars-bar-height);
  background: var(--lcars-african-violet);
  border-radius: 0 0 var(--lcars-endcap-radius) var(--lcars-endcap-radius);
}
```

### 5.9 `dwains-notification-card`

```css
.lcars-notification {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem;
  border-left: 3px solid var(--lcars-golden-orange);
  margin-bottom: var(--lcars-gap);
}

.lcars-notification--error {
  border-left-color: var(--lcars-tomato);
}

.lcars-notification__message {
  font-size: var(--lcars-font-body);
  color: var(--lcars-text-primary);
  /* Body text — mixed case allowed here */
  text-transform: none;
}

.lcars-notification__time {
  font-size: var(--lcars-font-body);
  color: var(--lcars-text-muted);
  text-transform: uppercase;
  white-space: nowrap;
}
```

### 5.10 `dwains-flexbox-card`

Generic flex container wrapper. Inherits LCARS gap.

```css
.lcars-flexbox {
  display: flex;
  flex-wrap: wrap;
  gap: var(--lcars-gap);
}

.lcars-flexbox--column {
  flex-direction: column;
}
```

---

## 6. Color Assignment by UI Role

### Structural Frame

| Element             | Color Variable                   | Hex       | Source Rule                          |
|---------------------|----------------------------------|-----------|--------------------------------------|
| Header elbow        | `--lcars-frame-elbow-top`        | `#ff9966` | TheLCARS.com header structure        |
| Header bar          | `--lcars-frame-header-bar`       | `#ff9966` | Matches elbow — same structural unit |
| Sidebar rail/panels | `--lcars-frame-sidebar`          | `#cc99ff` | TheLCARS.com sidebar                 |
| Footer elbow        | `--lcars-frame-elbow-bottom`     | `#cc99ff` | TheLCARS.com footer                  |
| Footer bar          | `--lcars-frame-footer-bar`       | `#cc99ff` | Matches footer elbow                 |
| Background          | `--lcars-black`                  | `#000000` | Universal — always black             |

### Interactive Elements

| Element                | Color Variable                | Hex       | Rationale                                      |
|------------------------|-------------------------------|-----------|-------------------------------------------------|
| Default button         | `--lcars-button-default`      | `#ffcc99` | Sunflower — standard neutral button              |
| Nav button (sidebar)   | `--lcars-button-nav`          | `#cc99ff` | African-violet — matches sidebar                 |
| Area button (sidebar)  | `--lcars-frame-sidebar-accent`| `#ffbbaa` | Almond-creme — distinct from nav, warm grouping  |
| Active/Selected        | `--lcars-button-active`       | `#ffaa00` | Gold — universally signals active state          |
| Action/Primary CTA     | `--lcars-button-action`       | `#ff9966` | Butterscotch — draws eye to primary action       |
| Alt button (devices)   | `--lcars-button-alt-1`        | `#99ccff` | Ice — cool contrast for device/entity actions    |
| Alt button (more pages)| `--lcars-button-alt-2`        | `#ffaa90` | Almond — warm secondary                         |
| Alt button (config)    | `--lcars-button-alt-3`        | `#cc55ff` | Lilac — distinct from operational buttons        |
| Disabled button        | `--lcars-button-disabled`     | `#666688` | Gray — clearly unavailable                       |
| Hover state            | `filter: brightness(1.2)`     | n/a       | Bracer Jack: simple brightness, nothing more     |

### Text

| Role           | Color Variable             | Hex       |
|----------------|----------------------------|-----------|
| Primary text   | `--lcars-text-primary`     | `#f5f6fa` |
| Heading text   | `--lcars-text-heading`     | `#ffcc99` |
| Sub-heading    | `--lcars-text-subheading`  | `#99ccff` |
| Text on button | `--lcars-text-on-button`   | `#000000` |
| Muted text     | `--lcars-text-muted`       | `#666688` |
| Alert text     | `--lcars-text-alert`       | `#ff5555` |

### Status Indicators

| Status      | Color Variable          | Hex       |
|-------------|-------------------------|-----------|
| OK/Normal   | `--lcars-status-ok`     | `#99ccff` |
| Warning     | `--lcars-status-warn`   | `#ff9900` |
| Error/Alert | `--lcars-status-error`  | `#ff5555` |
| Offline     | `--lcars-status-offline`| `#666688` |

### Color Family Analysis (Bracer Jack Validation)

Total hue families in active use:

1. **Orange/Warm** — butterscotch, sunflower, almond, almond-creme, gold, golden-orange, peach, orange (~1 family, ~8 tints)
2. **Violet/Purple** — african-violet, lilac, violet-creme (~1 family, ~3 tints)
3. **Blue/Cool** — ice, bluey, blue, sky (~1 family, ~4 tints)
4. **Gray** — gray (~1 family, ~1 tint)
5. **White** — space-white (~1 family, ~1 tint)

**Result**: 5 hue families. Per Bracer Jack: "You'd better know what you're doing." We do — each family has symbolic assignment: warm=structure+action, violet=navigation+frame, blue=data+secondary, gray=disabled, white=text. **Red** (tomato) is the 6th but reserved exclusively for alerts — a justified exception per the alert-only rule.

---

## 7. Interaction Design & Animation

### Core Timing Constants

```css
:host {
  --lcars-transition-speed:    200ms;
  --lcars-transition-function: ease-out;
  --lcars-fade-speed:          300ms;
}

@media (prefers-reduced-motion: reduce) {
  :host {
    --lcars-transition-speed:    0ms;
    --lcars-fade-speed:          0ms;
  }
}
```

**Rule**: All animations ≤ 1 second. Most are 200–300ms. LCARS conveys advanced technology through **understated confidence**, not flashy motion.

### v4.13.0 Visual Vocabulary

The following shared animation motifs are introduced in v4.13.0. Each panel spec references these by name. All respect `prefers-reduced-motion: reduce`.

| Motif | Description | Duration | Panels Using |
|---|---|---|---|
| **Frame Breathing Pulse** | Border color oscillates between full and 70% brightness | 3s ease-in-out infinite | Device, Climate (HVAC action), Pool/Spa (heating) |
| **Data Pip Footer** | Row of 4px squares as micro-heatmap or status indicator | Static (transition 500ms) | Device, Climate (24h temp), Alarm (zone status) |
| **Header Numeric Code** | 6-digit pseudo-random code from entity_id hash | Static | Device (shared) |
| **Button Press Ripple** | Circular opacity wave from press point, 300ms | 300ms ease-out, single fire | Device (shared) |
| **Viewscreen Power-On Scanline** | Horizontal bright line sweeps top→bottom on first render | 600ms ease-out, single fire | Device, Climate, Media, Weather |
| **Setpoint Confirm Flash** | Scale 1.05× + gold text-shadow on value change | 400ms ease-out, single fire | Climate (target temp) |
| **Travelling Indicator Bar** | 2px gold bar slides between active items | 300ms ease-out transition | Climate (mode strip), Pool/Spa (IntelliBrite) |
| **Audio Waveform** | 32 vertical bars oscillating at random heights | 400ms alternate infinite | Media (playing state) |
| **Viewscreen Glow** | Pulsing box-shadow spread on active viewscreen | 3s ease-in-out infinite | Media (playing), Atmoscrubber (AQI) |
| **Progress Luminous Head** | 4px gold pip with glow at playback position | 2s ease-in-out infinite | Media (progress bar) |
| **Red Alert Strobe** | Frame + ambient glow rapid pulse | 1s linear infinite | Alarm (triggered) |
| **Shield Reactive Glow** | SVG drop-shadow by security state | 0.5–3s, state-dependent | Alarm |
| **Countdown Urgency** | 4-tier color + pulse escalation | 0.5–2s by tier | Alarm |
| **Condition Ambient Glow** | Radial gradient tinted by weather condition | 1s transition (storm: 3s flicker) | Weather |
| **Wind Compass Needle** | Smooth rotation + gust oscillation on high wind | 800ms transition + 0.8s oscillation | Weather |
| **Forecast Range Bars** | Gradient bars growing with 60ms stagger | 400ms ease-out, single fire | Weather |
| **Sun Arc Tracker** | SVG semicircle with gold dot tracking sun position | 60s linear transition | Weather |
| **Precip Probability Pips** | 10-pip 5×2 grid, lit count = probability/10 | 200ms + 30ms stagger | Weather |
| **Water Caustic Shimmer** | 3 radial gradients drifting at 6% opacity | 12s linear infinite | Pool/Spa |
| **EPS Heat Flow** | Warm gradient bar scrolling left→right | 2s linear infinite | Pool/Spa (heating) |
| **Chemistry Threshold Badges** | Pill badges color-coded by ok/warn/critical | 500ms transition + 1.5s pulse | Pool/Spa |
| **Pump Spinner** | 3 dots rotating when pump ON | 1.2s linear infinite | Pool/Spa |
| **Barberpole Flow** | Diagonal stripes scrolling through fill bar | 0.6s linear infinite | Irrigation (active zone) |
| **Zone Completion Flash** | Row flashes ice-to-dark on cycle end | 2s ease-out, single fire | Irrigation |
| **Schedule Proximity Glow** | Text-shadow intensifies as scheduled run nears | 10s transition (continuous) | Irrigation |
| **Rain Delay Badge** | ☁ pill with 1px bob | 3s ease-in-out infinite | Irrigation |
| **Enhanced Particle Drift** | Varied size/opacity/speed + horizontal drift | 3–6s per particle | Atmoscrubber |
| **AQI Cylinder Glow** | Inset box-shadow by AQI level, unhealthy pulse | 2s pulse (unhealthy only) | Atmoscrubber |
| **Filter Life Segments** | 10-segment discrete bar with threshold colors | 300ms transition + 1s pulse | Atmoscrubber |
| **Sparkline Draw-On** | stroke-dashoffset reveals line left→right | 1.5s + 200ms stagger | Atmoscrubber |
| **Preset Mode Wipe** | ::before width transition on button activation | 250ms ease-out | Atmoscrubber |
| **Sensor Row Stagger** | Cascade-appear for extended sensor columns | 250ms + 80ms stagger | Air Purifier (BlueAir) |
| **CO₂ Threshold Colors** | 3-tier color mapping: ice/sunflower/tomato by ppm | Instant (transition inherited) | Air Purifier (BlueAir) |
| **Filter Expired Flash** | Single-fire tomato box-shadow on filter expiry | 600ms ease-out, single fire | Air Purifier (BlueAir) |
| **Tile Comfort Glow** | Ambient box-shadow by thermal state (warm/cool) | 3s ease-in-out infinite | Temp/Humidity Grid |
| **Floor Label Scan-In** | Horizontal wipe-in on floor group labels | 200ms + 200ms stagger | Temp/Humidity Grid |
| **Tile Sparkline Draw** | stroke-dashoffset draw-on per tile sparkline | 1.2s + 50ms stagger | Temp/Humidity Grid |
| **Summary Row Pulse** | Ship-average border breathing pulse | 4s ease-in-out infinite | Temp/Humidity Grid |
| **Hot/Cold Alert Pulse** | Border pulse on extreme temp tiles only | 1.5s (hot) / 2s (cold) | Temp/Humidity Grid |
| **Value Change Ripple** | Left-border width+color flash on data update | 300ms ease-out, single fire | Temp/Humidity Grid |

#### Performance Budget (per panel)
- ≤ 6 concurrent CSS animations (perceptible; GPU-composited transients during first-render stagger are exempt)
- ≤ 2 `box-shadow` keyframe definitions per panel; instances limited by visual perceptibility (clustered identical animations count as 1 perceptual unit)
- All looping animations gated behind `prefers-reduced-motion`
- Prefer `transform` and `opacity` for GPU-composited animations
- No gradients on interactive controls (buttons, toggles)

### 7.1 View Navigation Transition

When the user taps a sidebar nav button to switch views (Home → Devices → More):

```
1. Current content fades out      (opacity 1→0, 150ms ease-out)
2. New content fades in           (opacity 0→1, 200ms ease-in)
3. Header bar title updates       (instant text swap during fade gap)
4. Active sidebar button changes  (background → gold, 100ms)
```

```css
/* Content area transition */
.lcars-content--exiting {
  opacity: 0;
  transition: opacity 150ms ease-out;
}

.lcars-content--entering {
  opacity: 0;
  animation: lcars-fade-in 200ms ease-in forwards;
}

@keyframes lcars-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

### 7.2 Area Selection (Expand/Contract)

When an area button is tapped in the homepage:

```
1. Button pulses gold briefly       (background → gold, 100ms)
2. Area detail panel slides in      (transform: translateX, 250ms ease-out)
   — OR —
   View navigates to area subview   (uses view navigation transition above)
3. Button returns to normal color   (200ms)
```

```css
/* Area expand animation */
.lcars-area-detail--entering {
  animation: lcars-slide-in-right 250ms ease-out forwards;
}

.lcars-area-detail--exiting {
  animation: lcars-slide-out-right 200ms ease-in forwards;
}

@keyframes lcars-slide-in-right {
  from { transform: translateX(2rem); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

@keyframes lcars-slide-out-right {
  from { transform: translateX(0);    opacity: 1; }
  to   { transform: translateX(2rem); opacity: 0; }
}
```

### 7.3 Button Press Feedback

```
1. On pointerdown: background → gold (instant, no transition)
2. On pointerup:   background → original (200ms ease-out)
```

This mimics the TNG console — buttons flash immediately on press.

### 7.4 Popup Open/Close

```
1. Overlay fades in                  (opacity 0→0.85, 200ms)
2. Popup frame scales from center    (scale 0.95→1, opacity 0→1, 200ms)
3. On close: reverse                 (200ms)
```

```css
.lcars-popup-overlay--entering {
  animation: lcars-overlay-in 200ms ease-out forwards;
}

@keyframes lcars-overlay-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.lcars-popup--entering {
  animation: lcars-popup-scale-in 200ms ease-out forwards;
}

@keyframes lcars-popup-scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}
```

### 7.5 Scrolling Number Decoration (Status Panels)

For decorative data readouts (non-functional — purely aesthetic LCARS chrome):

```javascript
// Generate random scrolling numbers — code-generated, NOT keyframed
// Per System 47 reference: fixed-width monospace numerals
// Tempo: deliberately slow (update every 100-200ms)

function generateLCARSReadout(length = 6) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

// Update at 150ms interval — methodical, not frantic
setInterval(() => {
  readoutEl.textContent = generateLCARSReadout();
}, 150);
```

```css
.lcars-readout {
  font-family: 'Courier New', monospace;  /* Exception: monospace for number readouts only */
  font-size: var(--lcars-font-body);
  color: var(--lcars-text-heading);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
```

---

## 8. Audio Grammar

LCARS has a formalized audio language. Each sound has a specific semantic meaning.

| Event                      | Sound                        | Trigger                                    |
|----------------------------|------------------------------|--------------------------------------------|
| Button press               | `TactileInputAcknowledge`    | Any button tap/click                       |
| View navigation            | `TactileInputAlternateAcknowledge` | Nav button → view change (like pressing Enter) |
| Action denied/disabled     | `TactileInputNegativeAcknowledge`  | Tap on disabled button or unauthorized action  |
| Popup open                 | `TactileInputAcknowledge`    | Modal appearing                            |
| Error notification         | `Alert`                      | Error toast / warning notification         |
| Critical system alert      | `RedAlert`                   | HA system-level failure                    |
| Dashboard loaded           | `Ready`                      | Initial page load complete                 |

### Implementation Approach

```javascript
// Audio files stored as small base64 WAV or loaded from /local/lcars-audio/
const LCARS_AUDIO = {
  acknowledge: new Audio('/local/lcars-audio/input_ok.mp3'),
  alternateAcknowledge: new Audio('/local/lcars-audio/input_enter.mp3'),
  negativeAcknowledge: new Audio('/local/lcars-audio/input_deny.mp3'),
  alert: new Audio('/local/lcars-audio/alert.mp3'),
  redAlert: new Audio('/local/lcars-audio/red_alert.mp3'),
  ready: new Audio('/local/lcars-audio/ready.mp3'),
};

// Play with catch — browsers may block autoplay
function lcarsSound(name) {
  const audio = LCARS_AUDIO[name];
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});  // Silently fail if autoplay blocked
  }
}
```

**Note**: Audio should respect `prefers-reduced-motion` — if reduced motion is preferred, disable non-critical sounds (keep only `Alert` and `RedAlert`).

---

## 9. Accessibility

### WCAG 2.2 Compliance Targets

| Criterion | Level | Implementation |
|-----------|-------|----------------|
| 1.4.3 Contrast (Minimum) | AA | All text meets 4.5:1 or 3:1 for large text on black background |
| 1.4.11 Non-text Contrast | AA | UI components (buttons, elbows) have 3:1 contrast vs background |
| 2.1.1 Keyboard | A | All interactive elements reachable and operable via keyboard |
| 2.4.7 Focus Visible | AA | 2px white outline on `:focus-visible` |
| 2.4.11 Focus Not Obscured | AA | Sticky header/footer must not hide focused elements |
| 2.4.13 Focus Appearance | AAA* | Focus ring 2px thick, `#f5f6fa` on `#000000` = well above 3:1 |
| 2.5.8 Target Size | AA | All buttons ≥ 48px height (3rem), minimum 24×24 for small controls |
| 4.1.2 Name, Role, Value | A | ARIA labels on all custom elements |

### Contrast Validation (Key Pairs)

| Foreground | Background | Ratio | Pass? |
|------------|------------|-------|-------|
| `#f5f6fa` (space-white) | `#000000` (black) | 18.1:1 | AA ✔ |
| `#ffcc99` (sunflower) | `#000000` (black) | 11.3:1 | AA ✔ |
| `#99ccff` (ice) | `#000000` (black) | 9.4:1 | AA ✔ |
| `#cc99ff` (african-violet) | `#000000` (black) | 7.0:1 | AA ✔ |
| `#666688` (gray) | `#000000` (black) | 3.5:1 | AA large text ✔ |
| `#000000` (text-on-button) | `#ffcc99` (sunflower) | 11.3:1 | AA ✔ |
| `#000000` (text-on-button) | `#cc99ff` (african-violet) | 7.0:1 | AA ✔ |
| `#000000` (text-on-button) | `#99ccff` (ice) | 9.4:1 | AA ✔ |
| `#000000` (text-on-button) | `#666688` (gray) | 3.5:1 | AA large text ✔ |

**Note**: Gray text on black (3.5:1) passes for large text (≥18px / 1.125rem bold, or ≥24px / 1.5rem normal) but fails for small body text. Use gray ONLY for labels that are ≥ `--lcars-font-subtitle` (1.5rem) OR supplement with an icon.

### ARIA Patterns

```html
<!-- Layout landmark structure -->
<div class="lcars-frame" role="application" aria-label="LCARS Dashboard">
  <header class="lcars-header" role="banner">...</header>
  <nav class="lcars-sidebar__nav" role="navigation" aria-label="Dashboard navigation">
    <button aria-current="page">HOME</button>
    <button>DEVICES</button>
  </nav>
  <main class="lcars-content" role="main" aria-live="polite">
    <slot></slot>
  </main>
  <footer class="lcars-footer" role="contentinfo">...</footer>
</div>

<!-- Popup -->
<div class="lcars-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="popup-title">
  <div class="lcars-popup">
    <div class="lcars-popup__header">
      <span id="popup-title">ENTITY DETAILS</span>
      <button class="lcars-popup__close" aria-label="Close">✕</button>
    </div>
    ...
  </div>
</div>
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus through sidebar buttons, then content area |
| `Enter` / `Space` | Activate focused button |
| `Escape` | Close popup/modal |
| `Arrow Up/Down` | Navigate within sidebar button group |
| `Home` / `End` | Jump to first/last sidebar button |

---

## 10. Mobile / Responsive Strategy

LCARS's strict geometric frame doesn't naturally reflow. Strategy: **collapse the sidebar into a top navigation bar** on small screens, maintaining the elbow aesthetic as a horizontal element.

### Breakpoints

```css
/* Desktop — full LCARS frame */
@media (min-width: 769px) {
  /* Default styles above — sidebar + elbows */
}

/* Tablet — narrower sidebar */
@media (max-width: 768px) and (min-width: 481px) {
  :host {
    --lcars-sidebar-width: 8rem;
    --lcars-elbow-width: 6rem;
  }

  .lcars-btn--nav {
    font-size: 0.85rem;
    padding-left: 0.5rem;
  }
}

/* Mobile — sidebar collapses to horizontal top nav */
@media (max-width: 480px) {
  .lcars-frame {
    grid-template-rows: auto auto 1fr auto;
    grid-template-columns: 1fr;
    grid-template-areas:
      "header-bar"
      "sidebar"
      "content"
      "footer-bar";
  }

  .lcars-header {
    /* Simplified: just the header bar, no elbow */
    flex-direction: row;
  }

  .lcars-elbow { display: none; }

  .lcars-sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .lcars-sidebar__nav {
    flex-direction: row;
    gap: var(--lcars-gap);
    padding: var(--lcars-gap);
  }

  .lcars-btn--nav {
    white-space: nowrap;
    border-radius: var(--lcars-btn-radius);  /* Fully rounded on mobile */
    width: auto;
    padding: 0 1rem;
    flex-shrink: 0;
  }

  .lcars-footer {
    flex-direction: row;
  }
}
```

---

## 11. File Manifest

Source files to create in `custom_components/lcars_dashboard/js/src/`:

| File | Custom Element | Purpose |
|------|----------------|---------|
| `lcars-dashboard-layout.js` | `lcars-dashboard-layout` | LCARS frame, grid, elbows, sidebar, header/footer bars |
| `dwains-navigation-card.js` | `dwains-navigation-card` | Sidebar nav button generation from HA config |
| `dwains-homepage-card.js` | `homepage-card` | Area grid, favorites section, house info embed |
| `dwains-devicespage-card.js` | `devices-card` | Device panels with entity rows |
| `dwains-more-pages-card.js` | `more-pages-card` | More-page navigation list |
| `dwains-more-page-card.js` | `more-page-card` | Individual more-page container |
| `dwains-house-information-card.js` | `dwains-house-information-card` | Weather, alarm, sensor status |
| `dwains-heading-card.js` | `dwains-heading-card` | LCARS section heading |
| `dwains-flexbox-card.js` | `dwains-flexbox-card` | Generic flex container |
| `dwains-popup.js` | `dwains-popup` | Modal dialog with mini LCARS frame |
| `dwains-notification-card.js` | `dwains-notification-card` | Notification list |
| `translations.js` | (utility) | i18n strings — already exists |
| `lcars-audio.js` | (utility) | Audio grammar playback utility |

### Lit Element Base Pattern

Every component follows this structure:

```javascript
import { LitElement, html, css } from 'lit-element';

class DwainsDashboardLayout extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      narrow: { type: Boolean },
      route: { type: Object },
      panel: { type: Object },
    };
  }

  static get styles() {
    return css`
      /* ═══ LCARS CSS ═══ */
      :host {
        display: block;
        /* All --lcars-* custom properties defined here */
      }
      /* ... component styles ... */
    `;
  }

  render() {
    return html`
      <div class="lcars-frame">
        <!-- LCARS structure -->
      </div>
    `;
  }

  // HA lifecycle hooks
  setConfig(config) { this.config = config; }
  getCardSize() { return 1; }
}

customElements.define('lcars-dashboard-layout', DwainsDashboardLayout);
```

---

## Design Validation Checklist

Before committing any LCARS UI change, verify:

- [ ] Background is `#000000` — no exceptions
- [ ] No gradients, box-shadows, or 3D effects on any element
- [ ] Frame thickness changes at every turn (thick→thin→thick)
- [ ] Elbows use `::after` pseudo-element for inner cutout
- [ ] All text is Antonio font, uppercase (except body prose)
- [ ] Exactly 3 font sizes used (title, subtitle, body)
- [ ] Buttons are pill-shaped with one flat side
- [ ] Hover is `brightness(1.2)` only
- [ ] Active state is gold (`#ffaa00`)
- [ ] Focus indicator is visible: 2px solid white outline
- [ ] Touch targets ≥ 48px tall (3rem)
- [ ] Color contrast meets WCAG AA minimums
- [ ] Animations ≤ 1 second, respect `prefers-reduced-motion`
- [ ] TheLCARS.com attribution is present in footer
- [ ] `aria-label`, `role`, `aria-current` set on interactive/landmark elements

---

## Attribution

```
LCARS Inspired Website Template by www.TheLCARS.com, with modifications.
Design framework references: Bracer Jack (lcars-terminal.de), Jörn Weißenborn (lcars-css),
leonawicz/lcars (R package), Ex Astris Scientia, System 47.
Accessibility standards: WCAG 2.2 (W3C), Section 508, EN 301 549, W3C ARIA APG.
```
