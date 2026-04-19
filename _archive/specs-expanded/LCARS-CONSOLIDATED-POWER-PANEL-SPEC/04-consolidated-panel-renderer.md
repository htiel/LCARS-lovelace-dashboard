## 3. Consolidated Panel Renderer

### 3.1 `_renderConsolidatedPowerPanel(collection)` — New Method

This replaces per-device `_renderPowerPanel(group)` calls with a single area-wide panel:

```js
_renderConsolidatedPowerPanel(collection) {
  const { circuits, plugs, strips, totalWatts, totalEnergy, deviceCount } = collection;
  const thresholds = this._config?.power_thresholds || {};
  const panelColor = getPowerColor(totalWatts, thresholds);
  const hasCritical = totalWatts > (thresholds.highMax || 3000);

  // Section counts for the header badge
  const sectionCounts = [];
  if (circuits.length) sectionCounts.push(`${circuits.length} CIRCUIT${circuits.length !== 1 ? 'S' : ''}`);
  if (plugs.length) sectionCounts.push(`${plugs.length} DEVICE${plugs.length !== 1 ? 'S' : ''}`);
  if (strips.length) sectionCounts.push(`${strips.length} STRIP${strips.length !== 1 ? 'S' : ''}`);

  return html`
    <div class="lcars-consolidated-power-panel"
      data-alert="${hasCritical ? 'critical' : ''}"
      role="region" aria-label="Power Systems">

      <!-- ═══ HEADER ═══ -->
      <div class="power-panel-header" role="heading" aria-level="3">
        <ha-icon icon="mdi:flash"></ha-icon>
        <span class="power-panel-name">POWER SYSTEMS</span>
        <div class="power-panel-header-line" aria-hidden="true"></div>
        <span class="power-panel-badge">${sectionCounts.join(' · ')}</span>
      </div>

      <!-- ═══ SUMMARY ROW ═══ -->
      <div class="power-summary" role="group" aria-label="Power Summary">
        ${this._renderPowerSummaryCard(
          'TOTAL USAGE', totalWatts, totalEnergy > 0 ? totalEnergy : null,
          panelColor, 'mdi:sigma'
        )}
      </div>

      <!-- ═══ ARC (when ≥3 total items) ═══ -->
      ${(circuits.length + plugs.length + strips.length) >= 3
        ? this._renderConsolidatedPowerArc(collection)
        : ''}

      <!-- ═══ CIRCUITS SECTION (Vue-type) ═══ -->
      ${circuits.length > 0 ? html`
        <div class="power-circuits-section">
          <div class="power-section-label" role="heading" aria-level="4">
            <span class="power-section-label-text">CIRCUITS</span>
            <div class="power-section-label-rule" aria-hidden="true"></div>
            <span class="power-section-label-count">${circuits.length}/${circuits.length}</span>
          </div>
          <div class="power-circuits" role="list" aria-label="Circuit Monitors">
            ${circuits.map(c => this._renderCircuitTile(c))}
          </div>
        </div>
      ` : ''}

      <!-- ═══ MONITORED DEVICES SECTION (orphan plugs) ═══ -->
      ${plugs.length > 0 ? html`
        <div class="power-devices-section">
          <div class="power-section-label" role="heading" aria-level="4">
            <span class="power-section-label-text">MONITORED DEVICES</span>
            <div class="power-section-label-rule" aria-hidden="true"></div>
            <span class="power-section-label-count">${plugs.length}/${plugs.length}</span>
          </div>
          <div class="power-devices" role="list" aria-label="Monitored Devices">
            ${plugs.map(p => this._renderPowerDeviceRow(p))}
          </div>
        </div>
      ` : ''}

      <!-- ═══ POWER STRIPS SECTION ═══ -->
      ${strips.length > 0 ? html`
        <div class="power-strips-section">
          <div class="power-section-label" role="heading" aria-level="4">
            <span class="power-section-label-text">POWER STRIPS</span>
            <div class="power-section-label-rule" aria-hidden="true"></div>
            <span class="power-section-label-count">${strips.length}/${strips.length}</span>
          </div>
          <div class="power-strips" role="list" aria-label="Power Strips">
            ${strips.map(({ parent, children }) => this._renderPowerStrip(parent, children))}
          </div>
        </div>
      ` : ''}

      <!-- Singleton popover element (Data C-5) -->
      <div popover id="power-detail-popover" class="power-detail-popover"
        role="dialog" aria-label="Circuit detail">
        <div class="popover-content"></div>
      </div>

      <div class="panel-pip-strip" aria-hidden="true"></div>
    </div>
  `;
}
```

### 3.2 `_renderConsolidatedPowerArc()` — Arc Across All Device Types

The existing `_renderPowerArc()` only accepts circuit groups. The consolidated version feeds it ALL power sources:

```js
_renderConsolidatedPowerArc(collection) {
  const { circuits, plugs, strips, totalWatts } = collection;

  // Build a unified list of power sources for the arc
  const allSources = [
    ...circuits.map(c => ({
      name: this._shortDeviceName(c.device) || 'Unknown',
      watts: c.combinedWatts != null ? c.combinedWatts : (this._getPrimaryPower(c) || 0),
    })),
    ...plugs.map(p => ({
      name: this._shortDeviceName(p.device) || 'Unknown',
      watts: this._getPrimaryPower(p) || 0,
    })),
    ...strips.map(({ parent }) => ({
      name: this._shortDeviceName(parent.device) || 'Strip',
      watts: this._getPrimaryPower(parent) || 0,
    })),
  ].filter(s => s.watts > 0);

  // Reuse existing arc renderer
  return this._renderPowerArc(
    allSources.map(s => ({ device: { name: s.name }, entities: [], combinedWatts: s.watts })),
    totalWatts
  );
}
```

---
