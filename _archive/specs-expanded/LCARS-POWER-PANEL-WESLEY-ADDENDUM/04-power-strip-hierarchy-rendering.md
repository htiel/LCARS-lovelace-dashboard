## 3. Power Strip Hierarchy Rendering

### 3.1 The Problem

TP-Link HS300 creates 7 devices in HA: 1 parent strip + 6 child sockets. Each child has `via_device_id` pointing to the parent. The panel must show this hierarchy visually.

### 3.2 Grouping Logic

```js
/**
 * Group strip children under their parent.
 * @param {Array} powerDevices - All power-classified device groups in the area
 * @returns {{ strips: Map<parentId, { parent, children[] }>, standalone: Array }}
 */
_groupPowerStrips(powerDevices) {
  const strips = new Map();
  const standalone = [];

  // First pass: identify parents
  for (const group of powerDevices) {
    if (group.subType === 'strip-parent') {
      strips.set(group.device.id, { parent: group, children: [] });
    }
  }

  // Second pass: assign children, collect standalone
  for (const group of powerDevices) {
    if (group.subType === 'strip-parent') continue;
    if (group.subType === 'strip-child' && group.device.via_device_id) {
      const parentStrip = strips.get(group.device.via_device_id);
      if (parentStrip) {
        parentStrip.children.push(group);
        continue;
      }
    }
    standalone.push(group);
  }

  return { strips, standalone };
}
```

### 3.3 Strip Rendering

```js
_renderPowerStrip(parentGroup, children) {
  const parentName = this._shortDeviceName(parentGroup.device);
  const { powerSensors } = this._partitionPowerEntities(parentGroup.entries);
  const totalWatts = powerSensors.reduce((sum, e) => sum + (parseFloat(e.state?.state) || 0), 0);
  const parentSwitch = parentGroup.entries.find(e => e.domain === 'switch');

  return html`
    <div class="power-strip-block">
      <div class="power-strip-header">
        <span class="power-strip-name">${parentName}</span>
        ${parentSwitch ? html`
          <button class="power-strip-master-toggle lcars-btn"
            ?data-on=${parentSwitch.state?.state === 'on'}
            @click=${() => this._handleToggle(parentSwitch.entity.entity_id)}
            title="Master: ${parentSwitch.state?.state}">
            ${parentSwitch.state?.state === 'on' ? 'ON' : 'OFF'}
          </button>
        ` : ''}
        <span class="power-strip-total">${Math.round(totalWatts)}W</span>
      </div>
      <div class="power-strip-children">
        ${children.map(child => this._renderStripChild(child))}
      </div>
    </div>
  `;
}

_renderStripChild(childGroup) {
  const name = this._shortDeviceName(childGroup.device);
  const { switches, powerSensors } = this._partitionPowerEntities(childGroup.entries);
  const watts = powerSensors[0] ? parseFloat(powerSensors[0].state?.state) || 0 : 0;
  const color = getPowerColor(watts);
  const childSwitch = switches[0];

  return html`
    <div class="power-strip-child-tile" style="--tile-power-color:${color}">
      <span class="circuit-name">${name}</span>
      <div class="strip-child-controls">
        ${childSwitch ? html`
          <button class="strip-child-toggle"
            ?data-on=${childSwitch.state?.state === 'on'}
            @click=${(e) => { e.stopPropagation(); this._handleToggle(childSwitch.entity.entity_id); }}
            aria-label="${name}: ${childSwitch.state?.state}">
            ${childSwitch.state?.state === 'on' ? 'ON' : 'OFF'}
          </button>
        ` : ''}
        <span class="circuit-watts" style="color:${color}">
          <span class="power-dot" ?data-zero=${watts === 0}></span>
          ${Math.round(watts)}W
        </span>
      </div>
    </div>
  `;
}
```

### 3.4 Strip-Specific CSS

```css
.power-strip-block {
  border: 1px solid var(--lcars-butterscotch);
  border-left-width: 3px;
  border-radius: 0.5rem;
  padding: var(--lcars-gap);
  margin-bottom: var(--lcars-gap);
}

.power-strip-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  margin-bottom: var(--lcars-gap);
}

.power-strip-name {
  font-size: var(--lcars-font-size-sub);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  text-wrap: balance;
  flex: 1;
}

.power-strip-master-toggle {
  height: 2rem;
  min-width: 3rem;
  font-size: 0.7rem;
  padding: 0 0.5rem;
}

.power-strip-total {
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-butterscotch);
  font-weight: 700;
  white-space: nowrap;
}

.power-strip-children {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  gap: var(--lcars-gap);
}

.power-strip-child-tile {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  border-left: 3px solid var(--tile-power-color, var(--lcars-gray));
  min-height: 3.5rem;
}

.strip-child-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
}

.strip-child-toggle {
  font-family: var(--lcars-font);
  font-size: 0.6rem;
  text-transform: uppercase;
  padding: 0.125rem 0.375rem;
  border: 1px solid var(--lcars-gray);
  border-radius: var(--lcars-btn-radius);
  background: transparent;
  color: var(--lcars-disabled);
  cursor: pointer;
  transition: all var(--lcars-transition);
}

.strip-child-toggle[data-on] {
  border-color: var(--lcars-ice);
  color: var(--lcars-ice);
  background: rgba(153, 204, 255, 0.1);
}
```

---
