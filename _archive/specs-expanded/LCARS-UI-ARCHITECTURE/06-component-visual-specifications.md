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
