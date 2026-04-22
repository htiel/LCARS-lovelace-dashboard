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
import { showMoreInfo, lcarsLog } from '../../lcars-helpers.js';
import { lcarsFocusRing } from '../../lcars-styles.js';
import { galleyPanelStyles } from './lcars-galley-panel-styles.js';

import '../../components/lcars-summary-badge/lcars-summary-badge.js';

const TAG = 'GalleyPanel';

// Known appliance platforms
const GALLEY_PLATFORMS = new Set(['ge_home', 'smartthinq_sensors']);

// Interesting sensor device classes for appliances
const GALLEY_SENSOR_CLASSES = new Set(['temperature', 'duration', 'enum']);

class LcarsGalleyPanel extends LcarsBasePanel {

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

    // Group by device_id
    const deviceMap = new Map();
    for (const entry of allEntries) {
      const devId = entry.entity?.device_id;
      if (devId) {
        if (!deviceMap.has(devId)) {
          deviceMap.set(devId, {
            device: devices[devId] || null,
            entries: [],
          });
        }
        deviceMap.get(devId).entries.push(entry);
      }
    }

    return { deviceMap };
  }

  /* ─── Badge ─── */

  renderBadge() {
    const allEntries = this._getAllEntities();
    // Check for any active cooking/running appliance
    const activeCount = allEntries.filter(e => {
      const state = (e.state?.state || '').toLowerCase();
      return state === 'running' || state === 'cooking' || state === 'preheat' ||
             state === 'on' || state === 'drying' || state === 'washing';
    }).length;

    if (activeCount > 0) {
      return html`<lcars-summary-badge value="${activeCount} ACTIVE" color="var(--lcars-gold)"></lcars-summary-badge>`;
    }
    return html`<lcars-summary-badge value="STANDBY" color="var(--lcars-gray)"></lcars-summary-badge>`;
  }

  /* ─── Render ─── */

  renderContent() {
    const { deviceMap } = this._partitionEntities();

    if (deviceMap.size === 0) {
      return html`<div class="galley-empty">NO GALLEY SYSTEMS</div>`;
    }

    return html`
      <div class="galley-content">
        <div class="galley-section-label">APPLIANCES</div>
        <div class="galley-appliances">
          ${Array.from(deviceMap.values()).map(group => this._renderApplianceCard(group))}
        </div>
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
}

customElements.define('lcars-galley-panel', LcarsGalleyPanel);
