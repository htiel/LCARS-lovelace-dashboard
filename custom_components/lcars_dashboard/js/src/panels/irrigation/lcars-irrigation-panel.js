/**
 * lcars-irrigation-panel.js
 *
 * Extracted irrigation device panel — Phase 1 proof-of-pattern.
 * Renders zone controls, schedule sensors, and standby toggle
 * for irrigation controller devices (e.g. Rachio, OpenSprinkler).
 *
 * Imported as a side-effect from the orchestrator (lcars-homepage-card.js).
 * No webpack entry point needed — bundled via the existing entry.
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { html } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { getIrrigationZoneColor } from '../../lcars-color-utils.js';
import { createRateLimiter } from '../../lcars-service-utils.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { irrigationPanelStyles } from './lcars-irrigation-panel-styles.js';

class LcarsIrrigationPanel extends LcarsBasePanel {

  #irrigationLimiter = createRateLimiter(5, 10000);

  get panelType() { return 'irrigation'; }
  get defaultPanelTitle() { return 'Irrigation'; }
  get frameColor() { return 'var(--lcars-ice)'; }

  static get styles() {
    return [...super.styles, sharedKeyframes, sharedReducedMotion, irrigationPanelStyles];
  }

  /* ─── Partition irrigation entities into zones, sensors, controller ─── */

  _partitionIrrigationEntities(entries) {
    const zones = [];
    const sensors = [];
    const controller = [];

    for (const entry of entries) {
      const domain = entry.domain;
      const eid = entry.entity.entity_id;
      const attrs = entry.state?.attributes || {};

      if (domain === 'switch') {
        if (attrs.zone_number != null || /zone/i.test(eid)) {
          zones.push(entry);
        } else {
          controller.push(entry);
        }
        continue;
      }
      if (domain === 'binary_sensor' && !controller.some(() => true)) {
        controller.push(entry);
        continue;
      }
      sensors.push(entry);
    }

    zones.sort((a, b) => {
      const za = a.state?.attributes?.zone_number ?? 999;
      const zb = b.state?.attributes?.zone_number ?? 999;
      return za - zb;
    });

    return { zones, sensors, controller };
  }

  _handleIrrigationZone(entityId, turnOn) {
    if (!this.#irrigationLimiter.allow()) return;
    this._callService('switch', turnOn ? 'turn_on' : 'turn_off', { entity_id: entityId });
  }

  renderBadge() {
    const { zones, controller } = this._partitionIrrigationEntities(this.group.entities);
    const activeZone = zones.find(z => z.state?.state === 'on');
    const isStandby = controller.some(c => c.domain === 'switch' && c.state?.state === 'off');
    const color = activeZone ? 'var(--lcars-ice)' : isStandby ? 'var(--lcars-gray)' : 'var(--lcars-sunflower)';
    const label = activeZone ? `WATERING ${this._friendlyName(activeZone.state, activeZone.entity)}` : isStandby ? 'STANDBY' : 'IDLE';
    return html`<span style="color:${color}">${label}</span>`;
  }

  renderContent() {
    const { zones, sensors, controller } = this._partitionIrrigationEntities(this.group.entities);
    const activeZone = zones.find(z => z.state?.state === 'on');
    const isStandby = controller.some(c => c.domain === 'switch' && c.state?.state === 'off');

    return html`
      <div class="irrigation-content">
        <!-- Schedule (left) -->
        <div class="irrigation-schedule" role="list" aria-label="Schedule info">
          ${sensors.map(({ entity, state }) => {
            const name = this._friendlyName(state, entity);
            const unit = state.attributes?.unit_of_measurement || '';
            const color = this._getSensorIndicatorColor(state);
            return html`
              <lcars-sensor-row
                label="${name}"
                value="${state.state}${unit ? ' ' + unit : ''}"
                color="${color}"
                entity-id="${entity.entity_id}">
              </lcars-sensor-row>
            `;
          })}
        </div>

        <!-- Zones (right) -->
        <div class="irrigation-zones" role="list" aria-label="Irrigation zones">
          ${zones.map(({ entity, state }) => {
            const name = this._friendlyName(state, entity);
            const isOn = state.state === 'on';
            const zoneColor = getIrrigationZoneColor(state.state, isStandby);
            return html`
              <div class="irrigation-zone-row" role="listitem" tabindex="0"
                aria-label="${name}: ${isOn ? 'watering' : 'idle'}">
                <button class="irrigation-zone-btn" ?data-on=${isOn}
                  style="--zone-color:${zoneColor}"
                  ?disabled=${isStandby}
                  aria-label="${isOn ? 'Stop' : 'Start'} watering ${name}"
                  @click=${() => this._handleIrrigationZone(entity.entity_id, !isOn)}>
                  ${isOn ? 'STOP' : 'START'}
                </button>
                <span class="irrigation-zone-name">${name}</span>
                <span class="irrigation-zone-status" style="color:${zoneColor}">
                  ${isStandby ? 'STANDBY' : isOn ? 'WATERING' : 'IDLE'}
                </span>
                ${isOn ? html`
                  <div class="irrigation-zone-fill" role="progressbar"
                    aria-label="Zone active" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"
                    style="background:var(--lcars-ice)"></div>
                ` : ''}
              </div>
            `;
          })}
        </div>

        <!-- Standby Toggle (bottom) -->
        ${controller.filter(c => c.domain === 'switch').map(({ entity, state }) => {
          const isOff = state.state === 'off';
          return html`
            <div class="irrigation-standby">
              <button class="irrigation-standby-btn" role="switch"
                aria-checked="${isOff}" ?data-on=${!isOff}
                @click=${() => this._handleToggle(entity.entity_id)}
                title="Standby mode: ${isOff ? 'ON' : 'OFF'}">
                <ha-icon icon="mdi:water-off"></ha-icon>
                <span>STANDBY ${isOff ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          `;
        })}
      </div>
    `;
  }
}

if (!customElements.get('lcars-irrigation-panel')) {
  customElements.define('lcars-irrigation-panel', LcarsIrrigationPanel);
}
