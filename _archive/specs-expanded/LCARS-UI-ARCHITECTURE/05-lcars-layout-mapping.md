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
