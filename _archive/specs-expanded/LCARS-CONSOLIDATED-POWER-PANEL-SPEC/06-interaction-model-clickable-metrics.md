## 5. Interaction Model — Clickable Metrics

### 5.1 Click Targets

Every power reading must open the HA more-info dialog for its backing entity. This is the Admiral's #6 requirement.

| Element | Click Action | Entity Source |
|---------|-------------|---------------|
| Circuit tile | Popover (if supported) → `showMoreInfo()` via "VIEW FULL HISTORY" button | First `device_class: power` sensor in the circuit's entity list |
| Circuit tile watts value | Direct `showMoreInfo()` on the power sensor entity | `sensor.*_power` |
| Circuit tile energy value | Direct `showMoreInfo()` on the energy sensor entity | `sensor.*_energy` |
| Plug row watts value | `showMoreInfo()` on the power sensor entity | `sensor.*_power` |
| Plug row energy value | `showMoreInfo()` on the energy sensor entity | `sensor.*_energy` |
| Plug row toggle | `switch.toggle` service call (existing behavior) | `switch.*` |
| Strip total watts | `showMoreInfo()` on the strip's primary power sensor | Parent device power sensor |
| Strip child outlet watts | `showMoreInfo()` on the child's power sensor | Child device power sensor |
| Strip child toggle | `switch.toggle` service call | Child device switch |
| Summary total watts | `showMoreInfo()` on the highest-wattage device's power sensor | Best-effort: first power sensor |
| Summary total energy | No action (aggregate, no single entity) | — |

### 5.2 Implementation Pattern for Clickable Values

Add a click handler wrapper for individual sensor values. Reuse the existing `_handleEntityClick()`:

```js
// Clickable power value — wraps the numeric display
_renderClickableValue(entityId, displayHtml) {
  if (!entityId) return displayHtml;
  return html`
    <span class="power-clickable-value"
      role="button" tabindex="0"
      aria-label="View details"
      @click=${(e) => { e.stopPropagation(); this._handleEntityClick(entityId); }}
      @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(entityId); } }}>
      ${displayHtml}
    </span>
  `;
}
```

CSS for clickable values:

```css
.power-clickable-value {
  cursor: pointer;
  text-decoration: none;
  border-bottom: 1px dashed transparent;
  transition: border-color 0.15s ease;
}

.power-clickable-value:hover,
.power-clickable-value:focus-visible {
  border-bottom-color: var(--lcars-sunflower);
}
```

### 5.3 Updated Circuit Tile with Per-Metric Clicks

```js
_renderCircuitTile(circuit) {
  const watts = circuit.combinedWatts != null ? circuit.combinedWatts : this._getPrimaryPower(circuit);
  const energy = circuit.combinedEnergy != null ? circuit.combinedEnergy : this._getPrimaryEnergy(circuit);
  const thresholds = this._config?.power_thresholds || {};
  const color = getPowerColor(watts, thresholds);
  const tier = getPowerLabel(watts, thresholds);
  const indicator = this._getPowerIndicator(watts);
  const name = this._shortDeviceName(circuit.device) || 'Unknown';
  const supportsPopover = typeof HTMLElement.prototype.showPopover === 'function';

  // Find individual entity IDs for per-metric clicks
  const powerEntityId = circuit.entities?.find(e =>
    e.state?.attributes?.device_class === 'power')?.entity?.entity_id;
  const energyEntityId = circuit.entities?.find(e =>
    e.state?.attributes?.device_class === 'energy')?.entity?.entity_id;

  return html`
    <div class="power-circuit-tile"
      style="--circuit-color:${color}"
      role="listitem"
      tabindex="0"
      aria-label="${name}: ${watts != null ? Math.round(watts) + ' watts, ' + tier.toLowerCase() : 'unavailable'}"
      @click=${() => supportsPopover ? this._showCircuitPopover(circuit) : showMoreInfo(powerEntityId)}
      @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); supportsPopover ? this._showCircuitPopover(circuit) : showMoreInfo(powerEntityId); }}}>
      <div class="power-circuit-name">
        <span class="power-circuit-indicator" aria-hidden="true">${circuit.is240V ? '●●' : indicator}</span>
        <span>${name}</span>
      </div>
      <div class="power-circuit-value-row">
        ${this._renderClickableValue(powerEntityId, html`
          <span class="power-circuit-watts">${this._formatWatts(watts)}</span>
        `)}
      </div>
      ${energy != null ? this._renderClickableValue(energyEntityId, html`
        <span class="power-circuit-energy">${this._formatEnergy(energy)} TODAY</span>
      `) : ''}
    </div>
  `;
}
```

---
