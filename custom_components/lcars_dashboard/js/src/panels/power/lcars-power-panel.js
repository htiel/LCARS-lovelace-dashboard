/**
 * lcars-power-panel.js
 *
 * Extracted power device panel — energy monitoring, circuit tiles,
 * power strips, SVG distribution arc, detail popover.
 * Supports both legacy single-device and consolidated multi-device modes.
 *
 * v4.17.0 Panel Extraction Architecture (4X-3 / 4X-6)
 */
import { html, svg, render as litRender } from 'lit-html';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { getPowerColor, getPowerLabel } from '../../lcars-color-utils.js';
import { createRateLimiter } from '../../lcars-service-utils.js';
import { showMoreInfo } from '../../lcars-helpers.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { powerPanelStyles } from './lcars-power-panel-styles.js';

class LcarsPowerPanel extends LcarsBasePanel {

  static get properties() {
    return {
      ...super.properties,
      /** Pre-built collection for consolidated mode (optional). */
      collection: { type: Object },
      /** Array of power groups for consolidated mode (optional). */
      powerGroups: { type: Array },
    };
  }

  get panelType() { return 'power'; }
  get defaultPanelTitle() { return 'Power Systems'; }
  get frameColor() {
    const thresholds = this.config?.power_thresholds || {};
    if (this.collection || this.powerGroups) {
      const collection = this.collection || this._buildPowerCollection(this.powerGroups);
      return getPowerColor(collection.totalWatts, thresholds);
    }
    if (this.group) {
      const watts = this._getPrimaryPower(this.group);
      return getPowerColor(watts, thresholds);
    }
    return 'var(--lcars-orange)';
  }

  static get styles() {
    return [...super.styles, sharedKeyframes, sharedReducedMotion, powerPanelStyles];
  }

  _powerToggleLimiter = createRateLimiter(10, 10000);
  _expandedPowerSections = new Set();

  /* ── Format helpers ── */

  _formatWatts(watts) {
    if (watts == null) return '—';
    const w = Number(watts);
    if (!Number.isFinite(w)) return '—';
    if (Math.abs(w) >= 10000) return `${(w / 1000).toFixed(1)} kW`;
    return `${Math.round(w)} W`;
  }

  _formatEnergy(kwh) {
    if (kwh == null) return '—';
    const v = Number(kwh);
    if (!Number.isFinite(v)) return '—';
    return `${v.toFixed(1)} kWh`;
  }

  _getPowerIndicator(watts) {
    if (watts == null || isNaN(watts)) return '✕';
    const w = Math.abs(Number(watts));
    if (w <= 0) return '○';
    if (w <= 500) return '●';
    if (w <= 1500) return '●━';
    if (w <= 3000) return '●━━';
    return '●━━━';
  }

  /* ── Partition power entities ── */

  _partitionPowerEntities(entries) {
    const switches = [];
    const powerSensors = [];
    const energySensors = [];
    const voltageSensors = [];
    const currentSensors = [];
    const diagnostics = [];

    for (const entry of entries) {
      if (entry.disabled_by || entry.hidden_by) continue;
      const domain = entry.entity?.entity_id?.split('.')[0] || entry.domain;
      const dc = entry.state?.attributes?.device_class || '';
      const unit = entry.state?.attributes?.unit_of_measurement || '';

      if (domain === 'switch') {
        switches.push(entry);
      } else if (dc === 'power' && (unit === 'W' || unit === 'kW')) {
        powerSensors.push(entry);
      } else if (dc === 'energy' && (unit === 'kWh' || unit === 'Wh')) {
        energySensors.push(entry);
      } else if (dc === 'voltage' && unit === 'V') {
        voltageSensors.push(entry);
      } else if (dc === 'current' && unit === 'A') {
        currentSensors.push(entry);
      } else {
        diagnostics.push(entry);
      }
    }

    return { switches, powerSensors, energySensors, voltageSensors, currentSensors, diagnostics };
  }

  /* ── Device classification ── */

  _classifyPowerDevice(entries, device) {
    const hasPowerSensor = entries.some(e => {
      const dc = e.state?.attributes?.device_class || '';
      return e.domain === 'sensor' && (dc === 'power' || dc === 'energy' || dc === 'voltage' || dc === 'current');
    });
    if (!hasPowerSensor) return null;

    const manufacturer = (device?.manufacturer || '').toLowerCase();
    const model = (device?.model || '').toLowerCase();

    if (manufacturer.includes('emporia') || model.includes('vue')) return 'vue';

    const switchCount = entries.filter(e => e.domain === 'switch').length;
    if (switchCount >= 4 || model.includes('hs300') || model.includes('power strip')) return 'strip';

    const hasSwitch = entries.some(e => e.domain === 'switch');
    if (hasSwitch) return 'plug';

    return 'vue';
  }

  /* ── Primary power/energy extraction ── */

  _getPrimaryPower(group) {
    for (const entry of group.entities) {
      const dc = entry.state?.attributes?.device_class || '';
      const unit = entry.state?.attributes?.unit_of_measurement || '';
      if (dc === 'power' && (unit === 'W' || unit === 'kW')) {
        const val = parseFloat(entry.state?.state);
        if (!isNaN(val)) return unit === 'kW' ? val * 1000 : val;
      }
    }
    return null;
  }

  _getPrimaryEnergy(group) {
    for (const entry of group.entities) {
      const dc = entry.state?.attributes?.device_class || '';
      const unit = entry.state?.attributes?.unit_of_measurement || '';
      if (dc === 'energy' && (unit === 'kWh' || unit === 'Wh')) {
        const val = parseFloat(entry.state?.state);
        if (!isNaN(val)) return unit === 'Wh' ? val / 1000 : val;
      }
    }
    return null;
  }

  /* ── 240V pair detection ── */

  _detect240VPairs(circuits) {
    const L1L2_PATTERN = /^(.+?)[\s_]*(l[12]|line[\s_]*[12])$/i;
    const pairs = new Map();
    const unpaired = [];

    for (const c of circuits) {
      const name = this._shortDeviceName(c.device) || '';
      const match = name.match(L1L2_PATTERN);
      if (match) {
        const baseName = match[1].trim();
        if (!pairs.has(baseName)) pairs.set(baseName, []);
        pairs.get(baseName).push(c);
      } else {
        unpaired.push(c);
      }
    }

    const result = [...unpaired];
    for (const [name, pair] of pairs) {
      if (pair.length === 2) {
        const watts = pair.reduce((sum, p) => sum + (this._getPrimaryPower(p) || 0), 0);
        const kwhToday = pair.reduce((sum, p) => sum + (this._getPrimaryEnergy(p) || 0), 0);
        result.push({
          device: { ...pair[0].device, name },
          entities: pair.flatMap(p => p.entities),
          is240V: true,
          combinedWatts: watts,
          combinedEnergy: kwhToday,
        });
      } else {
        result.push(...pair);
      }
    }

    return result;
  }

  _sortCircuits(circuits) {
    return [...circuits].sort((a, b) => {
      const wA = a.combinedWatts != null ? a.combinedWatts : (this._getPrimaryPower(a) || 0);
      const wB = b.combinedWatts != null ? b.combinedWatts : (this._getPrimaryPower(b) || 0);
      if (wB !== wA) return wB - wA;
      const nA = (a.device?.name || '').toLowerCase();
      const nB = (b.device?.name || '').toLowerCase();
      return nA.localeCompare(nB);
    });
  }

  /* ── Power strip grouping ── */

  _groupPowerStrips(powerDevices) {
    const strips = new Map();
    const standalone = [];

    for (const group of powerDevices) {
      if (group.subType === 'strip') {
        strips.set(group.device.id, { parent: group, children: [] });
      }
    }

    for (const group of powerDevices) {
      if (group.subType === 'strip') continue;
      if (group.device?.via_device_id) {
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

  /* ── SVG half-arc power distribution ── */

  _renderPowerArc(circuits, totalWatts) {
    if (!circuits.length || !totalWatts || totalWatts <= 0) return '';

    const thresholds = this.config?.power_thresholds || {};
    const sorted = circuits
      .map(c => ({
        name: this._shortDeviceName(c.device) || 'Unknown',
        watts: c.combinedWatts != null ? c.combinedWatts : (this._getPrimaryPower(c) || 0),
      }))
      .filter(c => c.watts > 0)
      .sort((a, b) => b.watts - a.watts);

    if (sorted.length === 0) return '';

    const top5 = sorted.slice(0, 5);
    const otherWatts = sorted.slice(5).reduce((sum, c) => sum + c.watts, 0);
    if (otherWatts > 0) top5.push({ name: 'OTHER', watts: otherWatts });

    const cx = 120, cy = 100, r = 80;
    const startAngle = Math.PI;
    const totalAngle = Math.PI;
    const GAP = 0.02;

    let currentAngle = startAngle;
    const segments = top5.map(seg => {
      const fraction = seg.watts / totalWatts;
      const sweep = Math.max(fraction * totalAngle - GAP, 0.01);
      const endAngle = currentAngle - sweep;
      const color = getPowerColor(seg.watts, thresholds);

      const x1 = cx + r * Math.cos(currentAngle);
      const y1 = cy - r * Math.sin(currentAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy - r * Math.sin(endAngle);
      const largeArc = sweep > Math.PI ? 1 : 0;

      const path = `M ${x1.toFixed(1)},${y1.toFixed(1)} A ${r},${r} 0 ${largeArc},1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
      currentAngle = endAngle - GAP;

      return { path, color, name: seg.name, watts: seg.watts, fraction };
    });

    return html`
      <div class="power-arc-area">
        <svg class="power-distribution-arc" viewBox="0 0 240 120"
          role="img" aria-label="Power distribution: ${this._formatWatts(totalWatts)} total">
          <path d="M ${cx - r},${cy} A ${r},${r} 0 1,1 ${cx + r},${cy}"
            fill="none" stroke="var(--lcars-gray)" stroke-width="10"
            stroke-linecap="butt" opacity="0.15" />
          ${segments.map(seg => svg`
            <path d="${seg.path}" fill="none" stroke="${seg.color}"
              stroke-width="10" stroke-linecap="butt">
              <title>${seg.name}: ${Math.round(seg.watts)}W (${Math.round(seg.fraction * 100)}%)</title>
            </path>
          `)}
          <text x="${cx}" y="${cy - 15}" text-anchor="middle"
            fill="var(--lcars-text-heading)" font-family="var(--lcars-font)"
            font-size="28" font-weight="bold">
            ${this._formatWatts(totalWatts)}
          </text>
          <text x="${cx}" y="${cy + 5}" text-anchor="middle"
            fill="var(--lcars-space-white)" font-family="var(--lcars-font)"
            font-size="10" opacity="0.7">TOTAL</text>
        </svg>
      </div>
    `;
  }

  /* ── Popover ── */

  _showCircuitPopover(circuit) {
    const popover = this.shadowRoot?.querySelector('#power-detail-popover');
    if (!popover) return;

    const watts = circuit.combinedWatts != null ? circuit.combinedWatts : this._getPrimaryPower(circuit);
    const energy = circuit.combinedEnergy != null ? circuit.combinedEnergy : this._getPrimaryEnergy(circuit);
    const thresholds = this.config?.power_thresholds || {};
    const color = getPowerColor(watts, thresholds);
    const label = getPowerLabel(watts, thresholds);
    const name = this._shortDeviceName(circuit.device) || 'Unknown';
    const entityId = circuit.entities?.[0]?.entity?.entity_id;

    const content = popover.querySelector('.popover-content');
    if (content) {
      litRender(html`
        <div class="popover-header">
          <span class="popover-title">${name}</span>
          <span class="popover-status" style="color:${color}">${label}</span>
        </div>
        <div class="popover-hero-value" style="color:${color}">
          ${watts != null ? this._formatWatts(watts) : 'UNAVAILABLE'}
        </div>
        <div class="popover-stats">
          ${energy != null ? html`
            <div class="popover-stat-row">
              <span class="popover-stat-label">TODAY</span>
              <span class="popover-stat-value">${this._formatEnergy(energy)}</span>
            </div>
          ` : ''}
          ${circuit.is240V ? html`
            <div class="popover-stat-row">
              <span class="popover-stat-label">CIRCUIT TYPE</span>
              <span class="popover-stat-value" style="color:var(--lcars-butterscotch)">240V PAIRED</span>
            </div>
          ` : ''}
        </div>
        ${entityId ? html`
          <button class="popover-history-btn"
            @click=${() => { showMoreInfo(entityId); try { popover.hidePopover(); } catch (_) {} }}>
            VIEW FULL HISTORY
          </button>
        ` : ''}
      `, content);
    }

    try {
      popover.showPopover();
    } catch (_) {
      if (entityId) showMoreInfo(entityId);
    }
  }

  /* ── Sub-renderers ── */

  _renderTrackToggle(isOn, ariaLabel, onClick) {
    return html`
      <button class="lcars-track-toggle" ?data-on=${isOn}
        role="switch" aria-checked="${isOn}" aria-label="${ariaLabel}"
        @click=${(e) => { e.stopPropagation(); onClick(); }}
        @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}>
        <span class="track-label">${isOn ? 'ON' : 'OFF'}</span>
        <span class="track-thumb" aria-hidden="true"></span>
      </button>
    `;
  }

  _renderClickableValue(entityId, ariaLabel, displayHtml) {
    if (!entityId) return displayHtml;
    return html`
      <span class="power-clickable-value" role="button" tabindex="0" aria-label="${ariaLabel}"
        @click=${(e) => { e.stopPropagation(); this._handleEntityClick(entityId); }}
        @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(entityId); } }}>
        ${displayHtml}
      </span>
    `;
  }

  _renderCircuitTile(circuit) {
    const watts = circuit.combinedWatts != null ? circuit.combinedWatts : this._getPrimaryPower(circuit);
    const energy = circuit.combinedEnergy != null ? circuit.combinedEnergy : this._getPrimaryEnergy(circuit);
    const thresholds = this.config?.power_thresholds || {};
    const color = getPowerColor(watts, thresholds);
    const tier = getPowerLabel(watts, thresholds);
    const indicator = this._getPowerIndicator(watts);
    const name = this._shortDeviceName(circuit.device) || 'Unknown';
    const supportsPopover = typeof HTMLElement.prototype.showPopover === 'function';
    const { powerSensors, energySensors } = this._partitionPowerEntities(circuit.entities || []);
    const powerEntityId = powerSensors[0]?.entity?.entity_id;
    const energyEntityId = energySensors[0]?.entity?.entity_id;

    return html`
      <div class="power-circuit-tile" style="--circuit-color:${color}" role="listitem" tabindex="0"
        aria-label="${name}: ${watts != null ? Math.round(watts) + ' watts, ' + tier.toLowerCase() : 'unavailable'}${energy != null ? ', ' + energy.toFixed(1) + ' kilowatt hours today' : ''}"
        @click=${() => supportsPopover ? this._showCircuitPopover(circuit) : showMoreInfo(circuit.entities?.[0]?.entity?.entity_id)}
        @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); supportsPopover ? this._showCircuitPopover(circuit) : showMoreInfo(circuit.entities?.[0]?.entity?.entity_id); } }}>
        <div class="power-circuit-name">
          <span class="power-circuit-indicator" aria-hidden="true">${circuit.is240V ? '●●' : indicator}</span>
          <span>${name}</span>
        </div>
        <div class="power-circuit-value-row">
          ${this._renderClickableValue(powerEntityId, `View ${name} power: ${watts != null ? Math.round(watts) + ' watts' : 'unavailable'}`, html`<span class="power-circuit-watts">${this._formatWatts(watts)}</span>`)}
        </div>
        ${energy != null ? this._renderClickableValue(energyEntityId, `View ${name} energy: ${energy.toFixed(1)} kWh today`, html`<span class="power-circuit-energy">${this._formatEnergy(energy)} TODAY</span>`) : ''}
      </div>
    `;
  }

  _renderPowerDeviceRow(group) {
    const { switches, powerSensors, energySensors } = this._partitionPowerEntities(group.entities);
    const sw = switches[0];
    const watts = powerSensors[0] ? parseFloat(powerSensors[0].state?.state) || 0 : null;
    const energy = energySensors[0] ? parseFloat(energySensors[0].state?.state) || null : null;
    const thresholds = this.config?.power_thresholds || {};
    const color = getPowerColor(watts, thresholds);
    const name = this._shortDeviceName(group.device) || 'Unknown';
    const isOn = sw?.state?.state === 'on';
    const powerEntityId = powerSensors[0]?.entity?.entity_id;
    const energyEntityId = energySensors[0]?.entity?.entity_id;

    return html`
      <div class="power-device-row" role="listitem" tabindex="0" style="--circuit-color:${color}"
        aria-label="${name}: ${sw ? (isOn ? 'on' : 'off') + ', ' : ''}${watts != null ? Math.round(watts) + ' watts' : 'unknown'}">
        ${sw ? this._renderTrackToggle(isOn, `Toggle ${name}`,
          () => { if (this._powerToggleLimiter.allow()) this._handleToggle(sw.entity.entity_id); }
        ) : ''}
        <span class="power-device-name">${name}</span>
        <div class="power-device-stats">
          ${this._renderClickableValue(powerEntityId, `View ${name} power: ${watts != null ? Math.round(watts) + ' watts' : 'unknown'}`, html`<span class="power-device-watts" style="color:${color}">${this._formatWatts(watts)}</span>`)}
          ${energy != null ? this._renderClickableValue(energyEntityId, `View ${name} energy: ${energy.toFixed(1)} kWh`, html`<span class="power-device-energy">${this._formatEnergy(energy)}</span>`) : ''}
        </div>
      </div>
    `;
  }

  _renderPowerStrip(parentGroup, children) {
    const parentName = this._shortDeviceName(parentGroup.device) || 'Power Strip';
    const { powerSensors: parentPower, switches: parentSwitches } = this._partitionPowerEntities(parentGroup.entities);
    const totalWatts = parentPower.reduce((sum, e) => sum + (parseFloat(e.state?.state) || 0), 0);
    const thresholds = this.config?.power_thresholds || {};
    const totalColor = getPowerColor(totalWatts, thresholds);
    const parentSwitch = parentSwitches[0];

    return html`
      <div class="power-strip-block" role="listitem">
        <div class="power-strip-header" role="heading" aria-level="5">
          <span class="power-strip-name">${parentName}</span>
          ${parentSwitch ? this._renderTrackToggle(
            parentSwitch.state?.state === 'on', `Master toggle ${parentName}`,
            () => { if (this._powerToggleLimiter.allow()) this._handleToggle(parentSwitch.entity.entity_id); }
          ) : ''}
          <span class="power-strip-total" style="color:${totalColor}">TOTAL: ${this._formatWatts(totalWatts)}</span>
        </div>
        <div class="power-strip-divider" aria-hidden="true"></div>
        <div class="power-strip-children" role="list" aria-label="${parentName} outlets">
          ${children.map(child => this._renderStripChild(child, parentSwitches))}
        </div>
      </div>
    `;
  }

  _renderStripChild(childGroup, parentSwitches) {
    const name = this._shortDeviceName(childGroup.device) || 'Outlet';
    const { switches: childSwitches, powerSensors, energySensors } = this._partitionPowerEntities(childGroup.entities);
    const watts = powerSensors[0] ? parseFloat(powerSensors[0].state?.state) || 0 : 0;
    const energy = energySensors[0] ? parseFloat(energySensors[0].state?.state) || null : null;
    const thresholds = this.config?.power_thresholds || {};
    const color = getPowerColor(watts, thresholds);
    const powerEntityId = powerSensors[0]?.entity?.entity_id;
    const energyEntityId = energySensors[0]?.entity?.entity_id;

    let childSwitch = childSwitches[0];
    if (!childSwitch && parentSwitches?.length > 0) {
      const childName = (childGroup.device?.name || '').toLowerCase().replace(/[\s\-_]+/g, '');
      childSwitch = parentSwitches.find(s => {
        const eid = (s.entity?.entity_id || '').toLowerCase().replace(/[\s\-_]+/g, '');
        const fn = (s.state?.attributes?.friendly_name || '').toLowerCase().replace(/[\s\-_]+/g, '');
        return eid.includes(childName) || fn.includes(childName);
      });
    }

    const isOn = childSwitch?.state?.state === 'on';

    return html`
      <div class="power-strip-child-tile" style="--tile-power-color:${color}"
        role="listitem" aria-label="${name}: ${isOn ? 'on' : 'off'}, ${Math.round(watts)} watts">
        <span class="circuit-name">${name}</span>
        <div class="strip-child-controls">
          ${childSwitch ? this._renderTrackToggle(isOn, `Toggle ${name}`,
            () => { if (this._powerToggleLimiter.allow()) this._handleToggle(childSwitch.entity.entity_id); }
          ) : ''}
          ${this._renderClickableValue(powerEntityId, `View ${name} power: ${Math.round(watts)} watts`, html`
            <span class="circuit-watts" style="color:${color}">
              <span class="power-dot" ?data-zero=${watts === 0} aria-hidden="true"></span>
              ${this._formatWatts(watts)}
            </span>
          `)}
          ${energy != null ? this._renderClickableValue(energyEntityId, `View ${name} energy: ${energy.toFixed(1)} kWh`, html`<span class="power-device-energy">${this._formatEnergy(energy)}</span>`) : ''}
        </div>
      </div>
    `;
  }

  _renderPowerSummaryCard(label, watts, energy, accentColor, icon) {
    const thresholds = this.config?.power_thresholds || {};
    const color = label === 'TOTAL USAGE' ? getPowerColor(watts, thresholds) : accentColor;

    return html`
      <div class="power-summary-card" role="status" style="--card-accent:${accentColor}"
        aria-label="${label}: ${watts != null ? Math.round(watts) + ' watts' : 'unavailable'}${energy != null ? ', ' + energy.toFixed(1) + ' kilowatt hours today' : ''}"
        aria-live="polite">
        <span class="power-summary-label">
          <ha-icon icon="${icon}" style="--mdc-icon-size:14px; vertical-align:middle; color:${accentColor}"></ha-icon>
          ${label}
        </span>
        <span class="power-summary-value" style="color:${color}">${this._formatWatts(watts)}</span>
        ${energy != null ? html`<span class="power-summary-secondary">${this._formatEnergy(energy)} TODAY</span>` : ''}
      </div>
    `;
  }

  /* ── Build power collection from groups ── */

  _buildPowerCollection(powerGroups) {
    const circuits = [];
    const plugs = [];
    const allStrips = [];

    for (const group of powerGroups) {
      const deviceType = this._classifyPowerDevice(group.entities || [], group.device);
      if (deviceType === 'vue') {
        circuits.push(group);
      } else if (deviceType === 'strip') {
        allStrips.push(group);
      } else {
        plugs.push(group);
      }
    }

    const stripDeviceIds = new Set(allStrips.map(g => g.device?.id).filter(Boolean));
    const stripParents = [];
    const stripChildren = [];
    for (const group of allStrips) {
      if (group.device?.via_device_id && stripDeviceIds.has(group.device.via_device_id)) {
        stripChildren.push(group);
      } else {
        stripParents.push({ ...group, subType: 'strip' });
      }
    }

    const { strips: stripMap, standalone } = this._groupPowerStrips([...stripParents, ...stripChildren, ...plugs]);
    const strips = [];
    for (const [, entry] of stripMap) {
      strips.push({ parent: entry.parent, children: entry.children || [] });
    }

    const orphanPlugs = standalone;
    const processedCircuits = this._sortCircuits(this._detect240VPairs(circuits));

    const stripChildIds = new Set();
    for (const { children } of strips) {
      for (const child of children) {
        if (child.device?.id) stripChildIds.add(child.device.id);
      }
    }

    const AGGREGATE_PATTERN = /^(balance|total|main[s]?|net|whole[\s_-]?home)$/i;
    const aggregateCircuitIds = new Set();
    for (const c of processedCircuits) {
      const name = this._shortDeviceName(c.device) || '';
      if (AGGREGATE_PATTERN.test(name.trim())) {
        if (c.device?.id) aggregateCircuitIds.add(c.device.id);
      }
    }

    const upsParentIds = new Set();
    for (const group of powerGroups) {
      const dc = (group.device?.model || '').toLowerCase();
      const mfr = (group.device?.manufacturer || '').toLowerCase();
      const isUps = group.entities?.some(e =>
        e.state?.attributes?.device_class === 'battery' ||
        (e.domain === 'sensor' && (e.state?.attributes?.device_class || '') === 'battery')
      ) || dc.includes('ups') || mfr.includes('ups') || mfr.includes('cyberpower') ||
        mfr.includes('apc') || mfr.includes('tripp');
      if (!isUps || !group.device?.id) continue;
      const hasChildren = powerGroups.some(
        g => g !== group && g.device?.via_device_id === group.device.id
      );
      if (hasChildren) upsParentIds.add(group.device.id);
    }

    let totalWatts = 0;
    let totalEnergy = 0;
    for (const group of powerGroups) {
      const devId = group.device?.id;
      if (devId && aggregateCircuitIds.has(devId)) continue;
      if (devId && upsParentIds.has(devId)) continue;
      if (devId && stripChildIds.has(devId)) continue;
      const w = this._getPrimaryPower(group);
      const e = this._getPrimaryEnergy(group);
      if (w != null) totalWatts += w;
      if (e != null) totalEnergy += e;
    }

    return {
      circuits: processedCircuits,
      plugs: orphanPlugs,
      strips,
      totalWatts,
      totalEnergy: totalEnergy || null,
      deviceCount: powerGroups.length,
    };
  }

  /* ── Arc adapter for consolidated panel ── */

  _renderConsolidatedPowerArc(collection) {
    const allSources = [];
    for (const c of collection.circuits) {
      allSources.push({
        device: c.device,
        entities: c.entities,
        combinedWatts: c.combinedWatts != null ? c.combinedWatts : this._getPrimaryPower(c),
        combinedEnergy: c.combinedEnergy,
      });
    }
    for (const p of collection.plugs) {
      allSources.push({
        device: p.device,
        entities: p.entities,
        combinedWatts: this._getPrimaryPower(p),
      });
    }
    for (const { parent } of collection.strips) {
      allSources.push({
        device: parent.device,
        entities: parent.entities,
        combinedWatts: this._getPrimaryPower(parent),
      });
    }
    return this._renderPowerArc(allSources, collection.totalWatts);
  }

  renderBadge() {
    if (this.collection || this.powerGroups) {
      const collection = this.collection || this._buildPowerCollection(this.powerGroups);
      const thresholds = this.config?.power_thresholds || {};
      const panelColor = getPowerColor(collection.totalWatts, thresholds);
      return html`<span style="color:${panelColor}">${this._formatWatts(collection.totalWatts)}</span>`;
    }
    if (this.group) {
      const watts = this._getPrimaryPower(this.group);
      const thresholds = this.config?.power_thresholds || {};
      const panelColor = getPowerColor(watts, thresholds);
      return html`<span style="color:${panelColor}">${this._formatWatts(watts)}</span>`;
    }
    return html``;
  }

  /* ── Main render ── */

  render() {
    // Consolidated mode: collection or powerGroups provided
    if (this.collection || this.powerGroups) {
      const collection = this.collection || this._buildPowerCollection(this.powerGroups);
      return html`
        <lcars-panel-frame
          panel-name="POWER SYSTEMS"
          panel-code="${this._generatePanelCode('power-consolidated')}"
          frame-color="${this.frameColor}"
          panel-type="power">
          <span slot="badge">${this.renderBadge()}</span>
          ${this._renderConsolidatedPowerContent(collection)}
        </lcars-panel-frame>
      `;
    }

    // Legacy single-device mode: use base class render() → renderContent()
    if (this.group) {
      return super.render();
    }

    return html``;
  }

  renderContent() {
    // Called by super.render() for legacy single-device mode
    return this._renderLegacyPowerContent(this.group);
  }

  /* ── Consolidated Power Panel ── */

  _renderConsolidatedPowerContent(collection) {
    const { circuits, plugs, strips, totalWatts, totalEnergy } = collection;
    const thresholds = this.config?.power_thresholds || {};
    const panelColor = getPowerColor(totalWatts, thresholds);
    const hasCritical = totalWatts != null && Math.abs(totalWatts) > (thresholds.highMax || 3000);
    const totalSources = circuits.length + plugs.length + strips.length;

    const MAX_VISIBLE = 12;
    const circuitsExpanded = this._expandedPowerSections.has('circuits');
    const visibleCircuits = circuitsExpanded ? circuits : circuits.slice(0, MAX_VISIBLE);
    const circuitsHasMore = circuits.length > MAX_VISIBLE;
    const plugsExpanded = this._expandedPowerSections.has('plugs');
    const visiblePlugs = plugsExpanded ? plugs : plugs.slice(0, MAX_VISIBLE);
    const plugsHasMore = plugs.length > MAX_VISIBLE;

    return html`
      <div class="consolidated-power-content" data-alert="${hasCritical ? 'critical' : ''}">

        <div class="power-summary" role="group" aria-label="Power Summary">
          ${this._renderPowerSummaryCard('TOTAL USAGE', totalWatts, totalEnergy, panelColor, 'mdi:sigma')}
        </div>

        ${totalSources >= 3 ? this._renderConsolidatedPowerArc(collection) : ''}

        ${circuits.length > 0 ? html`
          <div class="power-circuits-section">
            <div class="power-section-label" role="heading" aria-level="4">
              <span class="power-section-label-text">CIRCUITS</span>
              <div class="power-section-label-rule" aria-hidden="true"></div>
              <span class="power-section-label-count">${circuits.length}</span>
            </div>
            <div class="power-circuits" role="list">
              ${visibleCircuits.map(c => this._renderCircuitTile(c))}
            </div>
            ${circuitsHasMore && !circuitsExpanded ? html`
              <button class="power-show-all-pill" aria-label="Show all ${circuits.length} circuits"
                @click=${() => { this._expandedPowerSections.add('circuits'); this.requestUpdate(); }}>
                SHOW ALL (${circuits.length})
              </button>
            ` : ''}
          </div>
        ` : ''}

        ${plugs.length > 0 ? html`
          <div class="power-devices-section">
            <div class="power-section-label" role="heading" aria-level="4">
              <span class="power-section-label-text">MONITORED DEVICES</span>
              <div class="power-section-label-rule" aria-hidden="true"></div>
              <span class="power-section-label-count">${plugs.length}</span>
            </div>
            <div class="power-devices" role="list">
              ${visiblePlugs.map(p => this._renderPowerDeviceRow(p))}
            </div>
            ${plugsHasMore && !plugsExpanded ? html`
              <button class="power-show-all-pill" aria-label="Show all ${plugs.length} devices"
                @click=${() => { this._expandedPowerSections.add('plugs'); this.requestUpdate(); }}>
                SHOW ALL (${plugs.length})
              </button>
            ` : ''}
          </div>
        ` : ''}

        ${strips.length > 0 ? html`
          <div class="power-strips-section">
            <div class="power-section-label" role="heading" aria-level="4">
              <span class="power-section-label-text">POWER STRIPS</span>
              <div class="power-section-label-rule" aria-hidden="true"></div>
              <span class="power-section-label-count">${strips.length}</span>
            </div>
            <div class="power-strips" role="list">
              ${strips.map(({ parent, children }) => this._renderPowerStrip(parent, children))}
            </div>
          </div>
        ` : ''}

        <div popover id="power-detail-popover" class="power-detail-popover"
          role="dialog" aria-label="Circuit detail">
          <div class="popover-content"></div>
        </div>
      </div>
    `;
  }

  /* ── Legacy single-device power panel ── */

  _renderLegacyPowerContent(group) {
    const allEntries = group.entities || [];
    const deviceName = this._shortDeviceName(group.device) || 'Power';
    const thresholds = this.config?.power_thresholds || {};

    const deviceType = this._classifyPowerDevice(allEntries, group.device);
    const { powerSensors, energySensors, switches } = this._partitionPowerEntities(allEntries);

    const watts = this._getPrimaryPower(group);
    const energy = this._getPrimaryEnergy(group);
    const panelColor = getPowerColor(watts, thresholds);
    const hasCritical = watts != null && Math.abs(watts) > (thresholds.highMax || 3000);

    const circuits = deviceType === 'vue' ? [group] : [];
    const processedCircuits = this._sortCircuits(this._detect240VPairs(circuits));
    const totalWatts = watts || 0;

    const hasCircuits = processedCircuits.length > 0;
    const isPlug = deviceType === 'plug';
    const isStrip = deviceType === 'strip';

    return html`
      <div class="power-content" data-alert="${hasCritical ? 'critical' : ''}">

        ${hasCircuits && processedCircuits.length > 1 ? this._renderPowerArc(processedCircuits, totalWatts) : ''}

        <div class="power-summary" role="group" aria-label="Power Summary">
          ${this._renderPowerSummaryCard('TOTAL USAGE', totalWatts, energy, panelColor, 'mdi:sigma')}
        </div>

        ${hasCircuits ? html`
          <div class="power-circuits-section">
            <div class="power-section-label" role="heading" aria-level="4">
              <span class="power-section-label-text">CIRCUITS</span>
              <div class="power-section-label-rule" aria-hidden="true"></div>
              <span class="power-section-label-count">${processedCircuits.length}/${processedCircuits.length}</span>
            </div>
            <div class="power-circuits" role="list">
              ${processedCircuits.map(c => this._renderCircuitTile(c))}
            </div>
          </div>
        ` : ''}

        ${isPlug ? html`
          <div class="power-devices-section">
            <div class="power-section-label" role="heading" aria-level="4">
              <span class="power-section-label-text">MONITORED DEVICES</span>
              <div class="power-section-label-rule" aria-hidden="true"></div>
              <span class="power-section-label-count">1/1</span>
            </div>
            <div class="power-devices" role="list">
              ${this._renderPowerDeviceRow(group)}
            </div>
          </div>
        ` : ''}

        ${isStrip ? html`
          <div class="power-strips-section">
            <div class="power-section-label" role="heading" aria-level="4">
              <span class="power-section-label-text">POWER STRIPS</span>
              <div class="power-section-label-rule" aria-hidden="true"></div>
            </div>
            <div class="power-strips" role="list">
              ${this._renderPowerStrip(group, [])}
            </div>
          </div>
        ` : ''}

        <div popover id="power-detail-popover" class="power-detail-popover"
          role="dialog" aria-label="Circuit detail">
          <div class="popover-content"></div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('lcars-power-panel')) {
  customElements.define('lcars-power-panel', LcarsPowerPanel);
}
