## 6. Controls Column (Right)

### Structure

For purifier devices (VeSync Core400S, LAP-C601S-WUS), the right column shows fan controls:

```
┌────────────────────┐
│  PRESET MODE       │  ← heading (sub-header font)
│  ○ AUTO            │  ← option strip (radio-style pills)
│  ● SLEEP           │
│  ○ TURBO           │
│  ○ PET             │
│                    │
│  DISPLAY     [■]   │  ← toggle switch
│  CHILD LOCK  [□]   │  ← toggle switch
│                    │
│  FILTER LIFE       │  ← progress bar
│  ████████░░  78%   │
└────────────────────┘
```

### Preset Mode Option Strip

A vertical list of pill-shaped radio buttons for fan preset modes. Only one active at a time.

```css
.atmos-controls {
  grid-area: controls;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
}

.atmos-control-heading {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0;
}

/* Preset mode option strip */
.atmos-preset-strip {
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
}

.atmos-preset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.25rem;                         /* Slightly shorter than main buttons */
  padding: 0 0.75rem;
  min-width: 6rem;                         /* WCAG 2.5.8: ≥24px target */

  background: var(--lcars-disabled);       /* Default: gray (unselected) */
  color: var(--lcars-space-white);
  border: none;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  text-align: left;
  cursor: pointer;
  transition: filter var(--lcars-transition), background var(--lcars-transition);
  user-select: none;
}

.atmos-preset-btn:hover {
  filter: brightness(1.2);
}

.atmos-preset-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

/* Active/selected preset */
.atmos-preset-btn[aria-pressed="true"],
.atmos-preset-btn.active {
  background: var(--lcars-btn-active);     /* --lcars-gold */
  color: var(--lcars-black);
}
```

### Toggle Switches (Display, Child Lock)

```css
.atmos-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.25rem 0;
  min-height: 2.25rem;                    /* WCAG 2.5.8 */
}

.atmos-toggle-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text);
  text-transform: uppercase;
}

/* LCARS toggle — flat pill, no iOS-style sliding */
.atmos-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 1.75rem;
  border-radius: var(--lcars-btn-radius);
  border: none;
  cursor: pointer;
  transition: background var(--lcars-transition);
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
}

.atmos-toggle[aria-checked="true"] {
  background: var(--lcars-btn-active);     /* Gold = on */
  color: var(--lcars-black);
}

.atmos-toggle[aria-checked="false"] {
  background: var(--lcars-disabled);       /* Gray = off */
  color: var(--lcars-space-white);
}

.atmos-toggle:hover {
  filter: brightness(1.2);
}

.atmos-toggle:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}
```

### Filter Life Progress Bar

```css
.atmos-filter-bar-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.25rem 0;
}

.atmos-filter-bar {
  height: 0.5rem;
  background: var(--lcars-disabled);
  border-radius: 0.25rem;
  overflow: hidden;
}

.atmos-filter-bar-fill {
  height: 100%;
  background: var(--lcars-data-accent);
  border-radius: 0.25rem;
  transition: width var(--lcars-transition-slow);
  /* Width set by JS: style="width: ${filterPct}%" */
}

/* Low filter warning */
.atmos-filter-bar-fill.low {
  background: var(--lcars-butterscotch);   /* < 20% */
}

.atmos-filter-bar-fill.critical {
  background: var(--lcars-alert);          /* < 5% */
}

.atmos-filter-value {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-data-accent);
  text-transform: uppercase;
}
```

---
