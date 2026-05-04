/**
 * lcars-hazard-panel.js (4X-39)
 *
 * Hazard Detection panel — smoke/CO/heat detectors (Nest Protect, etc.)
 * Per-room detector status, battery overview, safety alerts.
 *
 * Themed as "Fire Suppression" / "Hazard Detection".
 * Detects nest_protect platform entities and smoke/CO/heat binary sensors.
 */
import { html } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { showMoreInfo, lcarsLog } from '../../lcars-helpers.js';
import { lcarsFocusRing } from '../../lcars-styles.js';
import { hazardPanelStyles } from './lcars-hazard-panel-styles.js';

import '../../components/lcars-summary-badge/lcars-summary-badge.js';

const TAG = 'HazardPanel';

// Safety-critical device classes
const HAZARD_STATUS_CLASSES = new Set(['smoke', 'gas', 'carbon_monoxide', 'heat', 'safety']);
const HAZARD_BATTERY_CLASSES = new Set(['battery']);

class LcarsHazardPanel extends LcarsBasePanel {

  get panelType() { return 'hazard'; }
  get defaultPanelTitle() { return 'HAZARD DETECTION'; }

  get frameColor() {
    const allEntries = this._getAllEntities();
    const hasAlert = allEntries.some(e => {
      const dc = e.state?.attributes?.device_class || '';
      return HAZARD_STATUS_CLASSES.has(dc) && e.state?.state === 'on';
    });
    return hasAlert ? 'var(--lcars-tomato)' : 'var(--lcars-sunflower)';
  }

  static get styles() {
    return [
      ...super.styles,
      lcarsFocusRing,
      hazardPanelStyles,
    ];
  }

  /* ─── Entity Partitioning ─── */

  _partitionEntities() {
    const allEntries = this._getAllEntities();
    const devices = this.hass?.devices || {};

    // Group by device_id to create per-detector cards
    const deviceMap = new Map();
    const ungrouped = [];

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
      } else {
        ungrouped.push(entry);
      }
    }

    return { deviceMap, ungrouped };
  }

  /* ─── Badge ─── */

  renderBadge() {
    const allEntries = this._getAllEntities();
    const alertCount = allEntries.filter(e => {
      const dc = e.state?.attributes?.device_class || '';
      return HAZARD_STATUS_CLASSES.has(dc) && e.state?.state === 'on';
    }).length;

    // Safety-critical: wrap in aria-live region so screen readers announce
    // CLEAR ↔ ALERT transitions. role="alert" + assertive => interrupt SR queue.
    // (5X-B35 / #105 — beta.38)
    if (alertCount > 0) {
      return html`<div role="alert" aria-live="assertive" aria-atomic="true"><lcars-summary-badge value="⚠ ${alertCount} ALERT" color="var(--lcars-tomato)"></lcars-summary-badge></div>`;
    }
    return html`<div role="status" aria-live="polite" aria-atomic="true"><lcars-summary-badge value="ALL CLEAR" color="var(--lcars-sunflower)"></lcars-summary-badge></div>`;
  }

  /* ─── Render ─── */

  renderContent() {
    const { deviceMap, ungrouped } = this._partitionEntities();

    if (deviceMap.size === 0 && ungrouped.length === 0) {
      return html`<div class="hazard-empty">NO HAZARD DETECTORS</div>`;
    }

    return html`
      <div class="hazard-content">
        <div class="hazard-section-label">DETECTORS</div>
        <div class="hazard-detectors">
          ${Array.from(deviceMap.values()).map(group => this._renderDetectorCard(group))}
        </div>
        ${this._renderBatteryOverview(deviceMap)}
      </div>
    `;
  }

  /* ─── Per-Detector Card ─── */

  _renderDetectorCard(group) {
    const deviceName = group.device?.name_by_user || group.device?.name || 'Detector';
    const statusEntries = group.entries.filter(e => {
      const dc = e.state?.attributes?.device_class || '';
      return HAZARD_STATUS_CLASSES.has(dc);
    });
    const occupancyEntry = group.entries.find(e =>
      e.state?.attributes?.device_class === 'occupancy'
    );
    const hasAlert = statusEntries.some(e => e.state?.state === 'on');
    const primaryEid = group.entries[0]?.entity?.entity_id || '';

    return html`
      <div class="hazard-detector-card"
           tabindex="0"
           role="group"
           aria-label="${deviceName}"
           ?data-alert=${hasAlert}
           style="--detector-color: ${hasAlert ? 'var(--lcars-tomato)' : 'var(--lcars-sunflower)'}"
           @click=${() => showMoreInfo(primaryEid)}
           @keydown=${(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), showMoreInfo(primaryEid))}>
        <div class="hazard-detector-name">${deviceName}</div>
        ${statusEntries.map(entry => {
          const dc = entry.state?.attributes?.device_class || '';
          const isTriggered = entry.state?.state === 'on';
          const label = dc.replace(/_/g, ' ').toUpperCase();
          const stateText = isTriggered ? 'DETECTED' : 'CLEAR';
          const color = isTriggered ? 'var(--lcars-tomato)' : 'var(--lcars-sunflower)';
          return html`
            <div class="hazard-status-row">
              <span class="hazard-status-indicator" style="background:${color}"></span>
              <span class="hazard-status-label">${label}</span>
              <span class="hazard-status-value" style="color:${color}">${stateText}</span>
            </div>
          `;
        })}
        ${occupancyEntry ? html`
          <div class="hazard-status-row">
            <span class="hazard-status-indicator" style="background:${occupancyEntry.state?.state === 'on' ? 'var(--lcars-ice)' : 'var(--lcars-gray)'}"></span>
            <span class="hazard-status-label">OCCUPANCY</span>
            <span class="hazard-status-value">${occupancyEntry.state?.state === 'on' ? 'DETECTED' : 'CLEAR'}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ─── Battery Overview ─── */

  _renderBatteryOverview(deviceMap) {
    const batteryEntries = [];
    for (const group of deviceMap.values()) {
      for (const entry of group.entries) {
        const dc = entry.state?.attributes?.device_class || '';
        if (dc === 'battery' && entry.domain === 'sensor') {
          batteryEntries.push({
            name: group.device?.name_by_user || group.device?.name || 'Detector',
            level: parseFloat(entry.state?.state) || 0,
            entity: entry,
          });
        }
      }
    }

    if (batteryEntries.length === 0) return html``;

    return html`
      <div>
        <div class="hazard-section-label">BATTERY STATUS</div>
        <div class="hazard-batteries">
          ${batteryEntries.map(b => {
            const color = b.level > 50 ? 'var(--lcars-sunflower)' : b.level > 20 ? 'var(--lcars-butterscotch)' : 'var(--lcars-tomato)';
            return html`
              <div class="hazard-battery-chip" tabindex="0"
                   @click=${() => showMoreInfo(b.entity.entity?.entity_id)}
                   @keydown=${(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), showMoreInfo(b.entity.entity?.entity_id))}>
                <span style="color:var(--lcars-gray)">${b.name}:</span>
                <div class="hazard-battery-bar">
                  <div class="hazard-battery-fill" style="width:${b.level}%;background:${color}"></div>
                </div>
                <span style="color:${color}">${Math.round(b.level)}%</span>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }
}

customElements.define('lcars-hazard-panel', LcarsHazardPanel);
