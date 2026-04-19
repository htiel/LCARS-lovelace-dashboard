## 6. Strip Hierarchy — Parent/Child Nesting

### 6.1 Visual Structure

```
┌─ POWER STRIPS ────────────────────────────────────────── 2/2 ─┐
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  SERVER STACK LOWER STRIP    [ON]    TOTAL: 487 W      │   │ ← Parent header
│  │  ─────────────────────────────────────────────────────  │   │
│  │  ┊  [ON]  OUTLET 1 — NAS              189 W  4.2 kWh  │   │ ← Indented children
│  │  ┊  [ON]  OUTLET 2 — SWITCH            12 W  0.3 kWh  │   │
│  │  ┊  [OFF] OUTLET 3 — UNUSED             0 W  0.0 kWh  │   │
│  │  ┊  [ON]  OUTLET 4 — UPS              186 W  4.1 kWh  │   │
│  │  ┊  [ON]  OUTLET 5 — PI CLUSTER       100 W  2.2 kWh  │   │
│  │  ┊  [OFF] OUTLET 6 — EMPTY              0 W  0.0 kWh  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LS-P2-UPPERSTRIP            [ON]    TOTAL: 119 W      │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  ┊  [ON]  DEVICE A                     85 W  1.8 kWh  │   │
│  │  ┊  [ON]  DEVICE B                     34 W  0.7 kWh  │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### 6.2 Parent Strip Header

The existing `_renderPowerStrip()` already renders the parent header with master toggle + total wattage. **No changes needed** to the strip header renderer — it works correctly.

### 6.3 Child Assignment via `via_device_id`

TP-Link HS300 power strips expose a parent device (the strip hub) and 6 child devices (individual outlets). HA links them via `device.via_device_id`. The `_buildPowerCollection()` method (§1.3 above) uses this relationship.

**Edge case**: If a plug's `via_device_id` points to a device that wasn't classified as a strip (e.g., a hub device that also has non-power entities), the plug becomes an "orphan plug" and renders in the MONITORED DEVICES section. This is safe — no data loss, just potentially suboptimal grouping.

### 6.4 Child Outlet Row — Clickable Watts & Energy

The existing `_renderStripChild()` method renders each child. Enhancement: make watts and energy values individually clickable:

```js
_renderStripChild(childGroup) {
  const name = this._shortDeviceName(childGroup.device) || 'Outlet';
  const { switches, powerSensors, energySensors } = this._partitionPowerEntities(childGroup.entities);
  const watts = powerSensors[0] ? parseFloat(powerSensors[0].state?.state) || 0 : 0;
  const energy = energySensors[0] ? parseFloat(energySensors[0].state?.state) || null : null;
  const thresholds = this._config?.power_thresholds || {};
  const color = getPowerColor(watts, thresholds);
  const childSwitch = switches[0];
  const isOn = childSwitch?.state?.state === 'on';

  const powerEntityId = powerSensors[0]?.entity?.entity_id;
  const energyEntityId = energySensors[0]?.entity?.entity_id;

  return html`
    <div class="power-strip-child-tile" style="--tile-power-color:${color}"
      role="listitem" aria-label="${name}: ${isOn ? 'on' : 'off'}, ${Math.round(watts)} watts">
      <span class="circuit-name">${name}</span>
      <div class="strip-child-controls">
        ${childSwitch ? html`
          <button class="strip-child-toggle"
            ?data-on=${isOn}
            role="switch" aria-checked="${isOn}"
            aria-label="Toggle ${name}"
            @click=${(e) => { e.stopPropagation(); if (this._powerToggleLimiter.allow()) this._handleToggle(childSwitch.entity.entity_id); }}>
            ${isOn ? 'ON' : 'OFF'}
          </button>
        ` : ''}
        ${this._renderClickableValue(powerEntityId, html`
          <span class="circuit-watts" style="color:${color}">
            <span class="power-dot" ?data-zero=${watts === 0} aria-hidden="true"></span>
            ${this._formatWatts(watts)}
          </span>
        `)}
        ${energy != null ? this._renderClickableValue(energyEntityId, html`
          <span class="circuit-energy">${this._formatEnergy(energy)}</span>
        `) : ''}
      </div>
    </div>
  `;
}
```

---
