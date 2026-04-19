## 7. IntelliBrite Lighting Control (Bottom)

The bottom row contains the IntelliBrite color mode selector. 22 color modes need a compact, horizontally scrollable swatch strip — think the lighting control panel in a holodeck control room.

### 7.1 Layout Structure

```html
<div class="pool-lighting" role="group" aria-label="IntelliBrite pool light controls">
  <div class="pool-lighting-header">
    <span class="pool-lighting-label">INTELLIBRITE</span>
    <span class="pool-lighting-current" style="color: ${currentSwatchColor}">
      ● ${currentModeName}
    </span>
  </div>
  <div class="pool-lighting-swatches"
       role="radiogroup"
       aria-label="Light color mode"
       tabindex="0">
    ${colorModes.map(mode => html`
      <button class="pool-swatch ${mode.key === currentMode ? 'active' : ''}"
              role="radio"
              aria-checked="${mode.key === currentMode}"
              aria-label="${mode.label}"
              style="--swatch-color: ${mode.swatchHex}"
              @click="${() => setColorMode(mode.key)}">
        <span class="pool-swatch-fill" aria-hidden="true"></span>
        <span class="pool-swatch-label">${mode.shortLabel}</span>
      </button>
    `)}
  </div>
</div>
```

### 7.2 CSS

```css
.pool-lighting {
  grid-area: lighting;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding-top: var(--lcars-gap);
  border-top: 2px solid var(--panel-frame-color);
}

.pool-lighting-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pool-lighting-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.pool-lighting-current {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  font-weight: 700;
  white-space: nowrap;
  transition: color var(--lcars-transition);
}

/* Horizontal scrollable swatch strip */
.pool-lighting-swatches {
  display: flex;
  gap: var(--lcars-gap);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.25rem;
  scroll-snap-type: x proximity;

  /* Hide scrollbar but keep scrollable */
  scrollbar-width: thin;
  scrollbar-color: var(--lcars-disabled) transparent;
}

.pool-lighting-swatches::-webkit-scrollbar {
  height: 4px;
}

.pool-lighting-swatches::-webkit-scrollbar-thumb {
  background: var(--lcars-disabled);
  border-radius: 2px;
}

/* Individual color swatch button */
.pool-swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  min-width: 3.5rem;
  padding: 0.25rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  cursor: pointer;
  transition: filter var(--lcars-transition), outline var(--lcars-transition);
  user-select: none;
  scroll-snap-align: start;
  flex-shrink: 0;
}

.pool-swatch:hover {
  filter: brightness(1.2);
}

.pool-swatch:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

/* Active swatch — gold ring */
.pool-swatch.active,
.pool-swatch[aria-checked="true"] {
  outline: 2px solid var(--lcars-gold);
  outline-offset: 1px;
}

/* Color fill circle */
.pool-swatch-fill {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: var(--swatch-color, var(--lcars-disabled));
  border: 2px solid rgba(255, 255, 255, 0.15);
  transition: transform var(--lcars-transition);
}

.pool-swatch.active .pool-swatch-fill {
  transform: scale(1.15);
}

/* Animated swatches for dynamic modes */
.pool-swatch[data-animated] .pool-swatch-fill {
  animation: swatch-color-cycle 3s ease-in-out infinite;
}

@keyframes swatch-color-cycle {
  0%, 100% { filter: hue-rotate(0deg); }
  50%      { filter: hue-rotate(60deg); }
}

@media (prefers-reduced-motion: reduce) {
  .pool-swatch[data-animated] .pool-swatch-fill {
    animation: none !important;
  }
}

/* Swatch label — REMOVED per Geordi: 0.55rem violates Bracer Jack Rule 6.
 * Color identification via swatch color alone + aria-label for accessibility.
 * Optional tooltip on hover/long-press provides the mode name. */
.pool-swatch-label {
  /* Visually hidden but accessible to screen readers */
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 7.3 Color Mode Data

```javascript
/**
 * IntelliBrite color mode definitions.
 * Key matches screenlogic.set_color_mode action parameter.
 */
const INTELLIBRITE_MODES = [
  // Dynamic modes (shown first — most used)
  { key: 'party',      label: 'PARTY',       shortLabel: 'PAR', swatchHex: '#ff44cc', animated: true },
  { key: 'romance',    label: 'ROMANCE',     shortLabel: 'ROM', swatchHex: '#cc88ff', animated: true },
  { key: 'caribbean',  label: 'CARIBBEAN',   shortLabel: 'CAR', swatchHex: '#44ccbb', animated: true },
  { key: 'american',   label: 'AMERICAN',    shortLabel: 'AMR', swatchHex: '#ff4466', animated: true },
  { key: 'sunset',     label: 'SUNSET',      shortLabel: 'SUN', swatchHex: '#ff8844', animated: true },
  { key: 'royal',      label: 'ROYAL',       shortLabel: 'ROY', swatchHex: '#8844cc', animated: true },
  { key: 'color_swim', label: 'COLOR SWIM',  shortLabel: 'SWM', swatchHex: '#88ccff', animated: true },
  { key: 'color_sync', label: 'COLOR SYNC',  shortLabel: 'SYN', swatchHex: '#88aaff', animated: true },
  { key: 'color_set',  label: 'COLOR SET',   shortLabel: 'SET', swatchHex: '#ffaa44', animated: false },

  // Fixed colors
  { key: 'blue',       label: 'BLUE',        shortLabel: 'BLU', swatchHex: '#4488ff', animated: false },
  { key: 'green',      label: 'GREEN',       shortLabel: 'GRN', swatchHex: '#44cc88', animated: false },
  { key: 'red',        label: 'RED',         shortLabel: 'RED', swatchHex: '#ff4444', animated: false },
  { key: 'white',      label: 'WHITE',       shortLabel: 'WHT', swatchHex: '#ffffff', animated: false },
  { key: 'magenta',    label: 'MAGENTA',     shortLabel: 'MAG', swatchHex: '#cc44ff', animated: false },

  // Control modes (shown last)
  { key: 'all_on',     label: 'ALL ON',      shortLabel: 'ON',  swatchHex: '#ffaa00', animated: false },
  { key: 'all_off',    label: 'ALL OFF',     shortLabel: 'OFF', swatchHex: '#666688', animated: false },
  { key: 'save',       label: 'SAVE',        shortLabel: 'SAV', swatchHex: '#ffcc99', animated: false },
  { key: 'recall',     label: 'RECALL',      shortLabel: 'RCL', swatchHex: '#ffcc99', animated: false },
  { key: 'next_mode',  label: 'NEXT MODE',   shortLabel: '▶',   swatchHex: '#aaaaff', animated: false },
  { key: 'hold',       label: 'HOLD',        shortLabel: 'HLD', swatchHex: '#aaaaff', animated: false },
  { key: 'reset',      label: 'RESET',       shortLabel: 'RST', swatchHex: '#ff8866', animated: false },
  { key: 'thumper',    label: 'THUMPER',     shortLabel: 'TMP', swatchHex: '#aaaaff', animated: false },
];
```

### 7.4 Color Mode Service Call

```javascript
/**
 * Set IntelliBrite color mode via ScreenLogic action.
 * @param {object} hass - Home Assistant instance
 * @param {string} configEntryId - ScreenLogic integration config_entry ID
 * @param {string} colorMode - One of the INTELLIBRITE_MODES keys
 */
function setColorMode(hass, configEntryId, colorMode) {
  hass.callService('screenlogic', 'set_color_mode', {
    config_entry: configEntryId,
    color_mode: colorMode,
  });
}
```

### 7.5 Super Chlorination Controls

Super chlorination is triggered via dedicated ScreenLogic actions. This gets a small control row in the chemistry column or as a modal popup.

```javascript
/**
 * Start super chlorination with runtime hours.
 * ⚠ Worf Security Requirement: This is an irreversible chemical action.
 * The UI must require a 2-second press-and-hold before executing.
 * Implementation: use a press-and-hold interaction pattern on the
 * super chlorination button, not a simple click.
 */
function startSuperChlor(hass, configEntryId, hours = 24) {
  hass.callService('screenlogic', 'start_super_chlorination', {
    config_entry: configEntryId,
    runtime: hours,
  });
}

/**
 * Stop super chlorination.
 */
function stopSuperChlor(hass, configEntryId) {
  hass.callService('screenlogic', 'stop_super_chlorination', {
    config_entry: configEntryId,
  });
}
```

---
