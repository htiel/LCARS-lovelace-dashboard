## 4. Layout Structure — CSS

### 4.1 Consolidated Panel Frame

The consolidated panel uses the same frame style as the existing power panel, but it lives in the left content flow instead of the right panel column:

```css
/* ═══ Consolidated Power Panel (left-column, full-width) ═══ */
.lcars-consolidated-power-panel {
  --panel-frame-color: var(--lcars-butterscotch);

  display: grid;
  grid-template-areas:
    "header"
    "summary"
    "arc"
    "circuits"
    "devices"
    "strips"
    "pip";
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto auto auto auto auto;
  gap: var(--lcars-gap);

  border-left: 4px solid var(--panel-frame-color);
  border-top: 2px solid var(--panel-frame-color);
  border-right: 2px solid var(--panel-frame-color);
  border-bottom: 4px solid var(--panel-frame-color);
  border-radius: 0.75rem;
  padding: var(--lcars-gap);
  background: var(--lcars-black);
  min-height: calc(var(--lcars-vunit) * 4);
  margin-top: var(--lcars-gap);

  /* Transition to critical state */
  transition: border-color 0.3s ease;
}

.lcars-consolidated-power-panel[data-alert="critical"] {
  --panel-frame-color: var(--lcars-tomato);
}
```

### 4.2 Section Grid Areas

```css
/* Assign grid areas to sections */
.lcars-consolidated-power-panel > .power-panel-header   { grid-area: header; }
.lcars-consolidated-power-panel > .power-summary         { grid-area: summary; }
.lcars-consolidated-power-panel > .power-arc-area        { grid-area: arc; }
.lcars-consolidated-power-panel > .power-circuits-section { grid-area: circuits; }
.lcars-consolidated-power-panel > .power-devices-section  { grid-area: devices; }
.lcars-consolidated-power-panel > .power-strips-section   { grid-area: strips; }
.lcars-consolidated-power-panel > .panel-pip-strip        { grid-area: pip; }
```

### 4.3 Circuit Tile Grid — Wider in Left Column

In the right panel column, circuit tiles were constrained to ~380px width. In the left column, they have more room. Adjust `minmax` for wider tiles:

```css
/* Circuits fill available width in left column */
.lcars-consolidated-power-panel .power-circuits {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: var(--lcars-gap);
  max-height: 24rem;
  overflow-y: auto;
  mask-image: linear-gradient(to bottom, black calc(100% - 2rem), transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 2rem), transparent 100%);
}
```

### 4.4 Power Device Rows — Full Width

Plug rows stretch to fill the left column:

```css
.lcars-consolidated-power-panel .power-devices {
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
}

.lcars-consolidated-power-panel .power-device-row {
  display: flex;
  align-items: center;
  gap: var(--lcars-gap);
  padding: 0.35rem 0.5rem;
  border-left: 3px solid var(--circuit-color, var(--lcars-gray));
  cursor: pointer;
  transition: background 0.15s ease;
}

.lcars-consolidated-power-panel .power-device-row:hover,
.lcars-consolidated-power-panel .power-device-row:focus-visible {
  background: rgba(255, 255, 255, 0.04);
  outline: 2px solid var(--lcars-sunflower);
  outline-offset: -2px;
}
```

### 4.5 Power Strip Block — Nested Hierarchy

Strips render as a bordered block containing their child outlets:

```css
.lcars-consolidated-power-panel .power-strip-block {
  border: 1px solid var(--lcars-gray);
  border-radius: 0.5rem;
  padding: var(--lcars-gap);
  background: rgba(102, 102, 136, 0.05);
}

.lcars-consolidated-power-panel .power-strip-header {
  display: flex;
  align-items: center;
  gap: var(--lcars-gap);
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--lcars-gray);
  margin-bottom: var(--lcars-gap);
}

.lcars-consolidated-power-panel .power-strip-children {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 0.75rem;       /* Indent children under parent */
  border-left: 2px solid var(--lcars-gray);
  margin-left: 0.5rem;
}
```

---
