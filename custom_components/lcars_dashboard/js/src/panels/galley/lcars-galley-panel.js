/**
 * lcars-galley-panel.js (4X-40)
 *
 * Galley Systems panel — smart kitchen appliances.
 * GE Home SmartHQ (ovens, microwaves, ice makers),
 * LG SmartThinQ (fridges, washers, dryers).
 *
 * Groups entities by device, shows cook status, timers, temperatures.
 */
import { html } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { showMoreInfo, lcarsLog, defineLcars } from '../../lcars-helpers.js';
import { lcarsFocusRing } from '../../lcars-styles.js';
import { galleyPanelStyles } from './lcars-galley-panel-styles.js';

import '../../components/lcars-summary-badge/lcars-summary-badge.js';

const TAG = 'GalleyPanel';

// Known appliance platforms (#226: thermoworks_cloud added as third ecosystem)
const GALLEY_PLATFORMS = new Set(['ge_home', 'smartthinq_sensors', 'thermoworks_cloud']);
const PROBE_PLATFORM = 'thermoworks_cloud';

// >15min last_seen → STALE
const PROBE_STALE_MS = 15 * 60 * 1000;

// Interesting sensor device classes for appliances
const GALLEY_SENSOR_CLASSES = new Set(['temperature', 'duration', 'enum']);

class LcarsGalleyPanel extends LcarsBasePanel {

  static get properties() {
    const base = (super.properties && typeof super.properties === 'object') ? super.properties : {};
    return { ...base, _showStaleProbes: { type: Boolean, state: true } };
  }

  constructor() {
    super();
    this._showStaleProbes = false;
  }

  get panelType() { return 'galley'; }
  get defaultPanelTitle() { return 'GALLEY SYSTEMS'; }
  get frameColor() { return 'var(--lcars-butterscotch)'; }

  static get styles() {
    return [
      ...super.styles,
      lcarsFocusRing,
      galleyPanelStyles,
    ];
  }

  /* ─── Entity Partitioning ─── */

  _partitionEntities() {
    const allEntries = this._getAllEntities();
    const devices = this.hass?.devices || {};

    // Group by device_id, split appliances vs probes by platform
    const applianceMap = new Map();
    const probeMap = new Map();
    for (const entry of allEntries) {
      const devId = entry.entity?.device_id;
      if (!devId) continue;
      const isProbe = entry.entity?.platform === PROBE_PLATFORM;
      const target = isProbe ? probeMap : applianceMap;
      if (!target.has(devId)) {
        target.set(devId, { device: devices[devId] || null, entries: [] });
      }
      target.get(devId).entries.push(entry);
    }

    // Keep deviceMap alias for any external callers / badge code
    const deviceMap = new Map([...applianceMap, ...probeMap]);
    return { deviceMap, applianceMap, probeMap };
  }

  /* ─── Badge ─── */

  renderBadge() {
    const allEntries = this._getAllEntities();
    // Active appliances (cooking/running)
    const activeAppliances = allEntries.filter(e => {
      if (e.entity?.platform === PROBE_PLATFORM) return false;
      const state = (e.state?.state || '').toLowerCase();
      return state === 'running' || state === 'cooking' || state === 'preheat' ||
             state === 'on' || state === 'drying' || state === 'washing';
    }).length;
    // Active probes = devices that reported within stale window AND have a temp reading
    const { probeMap } = this._partitionEntities();
    let activeProbes = 0;
    for (const group of probeMap.values()) {
      if (this._probeFreshness(group) === 'fresh') activeProbes++;
    }
    const parts = [];
    if (activeAppliances > 0) parts.push(`${activeAppliances} COOK`);
    if (activeProbes > 0) parts.push(`${activeProbes} PROBE`);
    if (parts.length === 0) {
      return html`<lcars-summary-badge value="STANDBY" color="var(--lcars-gray)"></lcars-summary-badge>`;
    }
    return html`<lcars-summary-badge value="${parts.join(' · ')}" color="var(--lcars-gold)"></lcars-summary-badge>`;
  }

  /* ─── Render ─── */

  renderContent() {
    const { applianceMap, probeMap } = this._partitionEntities();

    if (applianceMap.size === 0 && probeMap.size === 0) {
      return html`<div class="galley-empty">NO GALLEY SYSTEMS</div>`;
    }

    // Sort + stale-hide probes
    const probeGroups = Array.from(probeMap.values()).map(g => ({
      ...g,
      freshness: this._probeFreshness(g),
      maxTempC: this._probeMaxTempC(g),
    }));
    const visibleProbes = this._showStaleProbes
      ? probeGroups
      : probeGroups.filter(g => g.freshness !== 'stale');
    // Active first, then fresh, then stale; within group sort by max temp desc
    visibleProbes.sort((a, b) => {
      const rank = { fresh: 0, recent: 1, stale: 2 };
      const r = (rank[a.freshness] ?? 3) - (rank[b.freshness] ?? 3);
      if (r !== 0) return r;
      return (b.maxTempC ?? -Infinity) - (a.maxTempC ?? -Infinity);
    });
    const staleHidden = probeGroups.length - visibleProbes.length;

    return html`
      <div class="galley-content">
        ${applianceMap.size > 0 ? html`
          <div class="galley-section-label">APPLIANCES</div>
          <div class="galley-appliances">
            ${Array.from(applianceMap.values()).map(group => this._renderApplianceCard(group))}
          </div>
        ` : ''}

        ${probeMap.size > 0 ? html`
          <div class="galley-section-header">
            <span class="galley-section-label">PROBES · ${probeMap.size}</span>
            ${staleHidden > 0 || this._showStaleProbes ? html`
              <button class="galley-stale-toggle"
                      type="button"
                      aria-pressed="${this._showStaleProbes ? 'true' : 'false'}"
                      @click=${() => { this._showStaleProbes = !this._showStaleProbes; }}>
                ${this._showStaleProbes ? 'HIDE STALE' : `SHOW ALL (${staleHidden} STALE)`}
              </button>
            ` : ''}
          </div>
          <div class="galley-probes">
            ${visibleProbes.length === 0
              ? html`<div class="galley-empty galley-empty-inline">NO ACTIVE PROBES</div>`
              : visibleProbes.map(group => this._renderProbeCard(group))}
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ─── Per-Appliance Card ─── */

  _renderApplianceCard(group) {
    const deviceName = group.device?.name_by_user || group.device?.name || 'Appliance';
    const primaryEid = group.entries[0]?.entity?.entity_id || '';

    // Find key entities
    const tempEntries = group.entries.filter(e =>
      e.state?.attributes?.device_class === 'temperature' && e.entity_category !== 'diagnostic'
    );
    const timerEntries = group.entries.filter(e =>
      e.state?.attributes?.device_class === 'duration'
    );
    const stateEntries = group.entries.filter(e => {
      const eid = e.entity?.entity_id || '';
      return /cook_mode|current_state|status/i.test(eid) && e.entity_category !== 'diagnostic';
    });

    // Is the appliance active?
    const isActive = group.entries.some(e => {
      const state = (e.state?.state || '').toLowerCase();
      return state === 'running' || state === 'cooking' || state === 'preheat' ||
             state === 'on' || state === 'drying' || state === 'washing';
    });

    return html`
      <div class="galley-appliance-card"
           tabindex="0"
           role="group"
           aria-label="${deviceName}"
           ?data-active=${isActive}
           @click=${() => showMoreInfo(primaryEid)}
           @keydown=${(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), showMoreInfo(primaryEid))}>
        <div class="galley-appliance-name">${deviceName}</div>

        ${stateEntries.slice(0, 2).map(entry => {
          const name = entry.state?.attributes?.friendly_name?.replace(deviceName, '').trim() || 'Status';
          const value = entry.state?.state || 'unknown';
          const color = isActive ? 'var(--lcars-gold)' : 'var(--lcars-gray)';
          return html`
            <div class="galley-status-row">
              <span class="galley-status-indicator" style="background:${color}"></span>
              <span class="galley-status-label">${name}</span>
              <span class="galley-status-value" style="color:${color}">${value}</span>
            </div>
          `;
        })}

        ${tempEntries.slice(0, 2).map(entry => {
          const name = entry.state?.attributes?.friendly_name?.replace(deviceName, '').trim() || 'Temperature';
          const value = entry.state?.state || '--';
          const unit = entry.state?.attributes?.unit_of_measurement || '';
          return html`
            <div class="galley-status-row">
              <span class="galley-status-indicator" style="background:var(--lcars-butterscotch)"></span>
              <span class="galley-status-label">${name}</span>
              <span class="galley-status-value" style="color:var(--lcars-butterscotch)">${value}${unit}</span>
            </div>
          `;
        })}

        ${timerEntries.slice(0, 1).map(entry => {
          const value = entry.state?.state || '--';
          return html`
            <div class="galley-timer" aria-label="Timer: ${value}">⏱ ${value}</div>
          `;
        })}
      </div>
    `;
  }

  /* ─── Probe helpers ─── */

  _probeChannelEntries(group) {
    return group.entries
      .filter(e => /_ch_\d+_temperature$/.test(e.entity?.entity_id || ''))
      .sort((a, b) => a.entity.entity_id.localeCompare(b.entity.entity_id));
  }

  _probeBatteryEntry(group) {
    return group.entries.find(e => /_battery$/.test(e.entity?.entity_id || ''));
  }

  _probeSignalEntry(group) {
    return group.entries.find(e => /_signal$/.test(e.entity?.entity_id || ''));
  }

  _probeLastSeenEntry(group) {
    return group.entries.find(e => /_last_seen$/.test(e.entity?.entity_id || ''));
  }

  /** fresh = reported <15min AND has a temp reading; recent = <15min no temp; stale = >=15min or unknown */
  _probeFreshness(group) {
    const last = this._probeLastSeenEntry(group);
    let ageMs = Infinity;
    if (last?.state?.state && last.state.state !== 'unknown' && last.state.state !== 'unavailable') {
      const t = Date.parse(last.state.state);
      if (!isNaN(t)) ageMs = Date.now() - t;
    } else {
      // Fall back to last_updated on a channel reading
      const ch = this._probeChannelEntries(group)[0];
      if (ch?.state?.last_updated) {
        const t = Date.parse(ch.state.last_updated);
        if (!isNaN(t)) ageMs = Date.now() - t;
      }
    }
    if (ageMs >= PROBE_STALE_MS) return 'stale';
    const hasTemp = this._probeChannelEntries(group).some(e => {
      const v = parseFloat(e.state?.state);
      return !isNaN(v);
    });
    return hasTemp ? 'fresh' : 'recent';
  }

  _probeMaxTempC(group) {
    let max = null;
    for (const ch of this._probeChannelEntries(group)) {
      const v = parseFloat(ch.state?.state);
      if (isNaN(v)) continue;
      const unit = (ch.state?.attributes?.unit_of_measurement || '').toUpperCase();
      const c = unit.includes('F') ? ((v - 32) * 5) / 9 : v;
      if (max === null || c > max) max = c;
    }
    return max;
  }

  _probeBorderColor(maxC, freshness) {
    if (freshness === 'stale') return 'var(--lcars-gray)';
    if (maxC === null) return 'var(--lcars-gray)';
    if (maxC < 60) return 'var(--lcars-butterscotch)';
    if (maxC < 90) return 'var(--lcars-gold)';
    return 'var(--lcars-tomato, #ff5555)';
  }

  /* ─── Per-Probe Card ─── */

  _renderProbeCard(group) {
    const deviceName = group.device?.name_by_user || group.device?.name || 'Probe';
    const devShort = (group.device?.id || '').slice(-4).toUpperCase();
    const channels = this._probeChannelEntries(group);
    const battery = this._probeBatteryEntry(group);
    const signal = this._probeSignalEntry(group);
    const last = this._probeLastSeenEntry(group);
    const freshness = group.freshness ?? this._probeFreshness(group);
    const maxC = group.maxTempC ?? this._probeMaxTempC(group);
    const borderColor = this._probeBorderColor(maxC, freshness);
    const primaryEid = channels[0]?.entity?.entity_id
      || battery?.entity?.entity_id
      || group.entries[0]?.entity?.entity_id
      || '';
    const batteryVal = battery ? parseFloat(battery.state?.state) : NaN;
    const batteryColor = !isNaN(batteryVal) && batteryVal < 20
      ? 'var(--lcars-tomato, #ff5555)' : 'var(--lcars-gray)';

    return html`
      <div class="galley-probe-card"
           tabindex="0"
           role="group"
           aria-label="${deviceName}"
           style="--probe-color:${borderColor}"
           ?data-stale=${freshness === 'stale'}
           @click=${() => primaryEid && showMoreInfo(primaryEid)}
           @keydown=${(e) => (e.key === 'Enter' || e.key === ' ') && primaryEid && (e.preventDefault(), showMoreInfo(primaryEid))}>
        <div class="galley-probe-head">
          <span class="galley-probe-name">${deviceName}</span>
          ${devShort ? html`<span class="galley-probe-id">·${devShort}</span>` : ''}
          ${freshness === 'stale' ? html`<span class="galley-probe-stale">STALE</span>` : ''}
        </div>
        <div class="galley-probe-channels">
          ${channels.map(ch => {
            const v = parseFloat(ch.state?.state);
            if (isNaN(v)) {
              return html`<span class="galley-probe-chip galley-probe-chip-empty">—</span>`;
            }
            const unit = ch.state?.attributes?.unit_of_measurement || '°';
            const label = (ch.entity.entity_id.match(/_ch_(\d+)_/) || [])[1] || '?';
            return html`
              <span class="galley-probe-chip" title="Channel ${label}">
                <span class="galley-probe-chip-ch">CH${label}</span>
                <span class="galley-probe-chip-val">${Math.round(v)}${unit}</span>
              </span>
            `;
          })}
        </div>
        <div class="galley-probe-foot">
          ${!isNaN(batteryVal) ? html`
            <span class="galley-probe-meta" style="color:${batteryColor}">BAT ${Math.round(batteryVal)}%</span>
          ` : ''}
          ${signal?.state?.state && signal.state.state !== 'unknown' ? html`
            <span class="galley-probe-meta">SIG ${signal.state.state}</span>
          ` : ''}
          ${freshness === 'stale' && last?.state?.state ? html`
            <span class="galley-probe-meta">LAST ${this._formatRelTime(last.state.state)}</span>
          ` : ''}
        </div>
      </div>
    `;
  }

  _formatRelTime(iso) {
    const t = Date.parse(iso);
    if (isNaN(t)) return '—';
    const ageMin = Math.round((Date.now() - t) / 60000);
    if (ageMin < 60) return `${ageMin}M`;
    const ageHr = Math.round(ageMin / 60);
    if (ageHr < 48) return `${ageHr}H`;
    return `${Math.round(ageHr / 24)}D`;
  }
}

defineLcars('lcars-galley-panel', LcarsGalleyPanel);