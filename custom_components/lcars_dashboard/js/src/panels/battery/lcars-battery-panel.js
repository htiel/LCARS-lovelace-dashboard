/**
 * lcars-battery-panel.js
 *
 * Extracted battery device panel — warp core visualization,
 * I/O flow conduits, telemetry readouts, and config controls.
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { defineLcars } from '../../lcars-helpers.js';
import { html } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { TOGGLE_DOMAINS } from '../../lcars-entity-utils.js';
import { formatNumber } from '../../lcars-format-utils.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { batteryPanelStyles } from './lcars-battery-panel-styles.js';
import { lcarsAudio } from '../../lcars-audio.js';

class LcarsBatteryPanel extends LcarsBasePanel {

  get panelType() { return 'battery'; }
  get defaultPanelTitle() { return 'Battery'; }
  get frameColor() { return 'var(--lcars-ice)'; }

  static get styles() {
    return [...super.styles, sharedKeyframes, sharedReducedMotion, batteryPanelStyles];
  }

  /* ─── Classify power entity as input/output ─── */

  _classifyPowerEntity(name) {
    const n = (name || '').toLowerCase();
    if (/total\s*in\s*power/.test(n)) return { side: 'in', type: 'total' };
    if (/total\s*out\s*power/.test(n)) return { side: 'out', type: 'total' };
    if (/solar.*in.*power/.test(n)) return { side: 'in', type: 'solar' };
    if (/ac.*in.*power/.test(n)) return { side: 'in', type: 'ac' };
    if (/ac.*out.*power/.test(n)) return { side: 'out', type: 'ac' };
    if (/dc.*out.*power/.test(n)) return { side: 'out', type: 'dc' };
    if (/usb.*out.*power/.test(n)) return { side: 'out', type: 'usb' };
    if (/type.*c.*out.*power/.test(n)) return { side: 'out', type: 'usbc' };
    if (/power.*i.*o.*input.*power/.test(n)) return { side: 'in', type: 'pio' };
    if (/power.*i.*o.*output.*power/.test(n)) return { side: 'out', type: 'pio' };
    if (/anderson.*out.*power/.test(n)) return { side: 'out', type: 'dc' };
    if (/alternator.*in.*power/.test(n)) return { side: 'in', type: 'alt' };
    if (/station.*power/.test(n)) return { side: 'out', type: 'station' };
    if (/\bin\b/.test(n)) return { side: 'in', type: 'other' };
    if (/\bout\b/.test(n)) return { side: 'out', type: 'other' };
    return null;
  }

  /* ─── Detect if this is a NUT UPS device ─── */

  _isNutDevice(entries) {
    let hasBattery = false;
    let hasPowerClass = false;
    let hasNutSignal = false;
    for (const e of entries) {
      const attrs = e.state?.attributes || {};
      const dc = attrs.device_class || '';
      const unit = attrs.unit_of_measurement || '';
      if (dc === 'battery' && unit === '%') hasBattery = true;
      if (dc === 'power' && unit === 'W') hasPowerClass = true;
      const eid = e.entity?.entity_id || '';
      if (/ups[._]load|ups[._]status/i.test(eid)) hasNutSignal = true;
      if (dc === 'voltage' && unit === 'V') hasNutSignal = true;
    }
    return hasBattery && !hasPowerClass && hasNutSignal;
  }

  /* ─── Parse NUT status codes ─── */

  _parseNutStatus(statusStr) {
    const s = (statusStr || '').toUpperCase();
    return {
      online: s.includes('OL'),
      onBattery: s.includes('OB'),
      charging: s.includes('CHRG'),
      lowBattery: s.includes('LB'),
      shutdown: s.includes('FSD'),
      off: s === 'OFF',
    };
  }

  /* ─── Format NUT runtime (seconds → Xh Ym) ─── */

  _formatNutRuntime(seconds) {
    const s = parseInt(seconds, 10);
    if (isNaN(s) || s < 0) return 'N/A';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  /* ─── Partition battery entities ─── */

  _partitionBatteryEntities(entries, categoryEntities) {
    const soc = [];
    const powerIn = [];
    const powerOut = [];
    const telemetry = [];
    const controls = [];
    const configControls = [];
    const diagnostics = [];
    const isNut = this._isNutDevice(entries);

    // NUT-specific entity collectors
    let nutLoadEntry = null;
    let nutStatusEntry = null;
    let nutStatusDataEntry = null;
    let nutNominalPower = null;
    let nutRuntimeEntry = null;

    for (const entry of entries) {
      const attrs = entry.state?.attributes || {};
      const dc = attrs.device_class || '';
      const unit = attrs.unit_of_measurement || '';
      const domain = entry.domain;
      const name = attrs.friendly_name || entry.entity.entity_id;
      const eid = entry.entity?.entity_id || '';

      if (['switch', 'number', 'button', 'select'].includes(domain)) {
        controls.push(entry);
        continue;
      }
      if (dc === 'battery' && unit === '%') {
        soc.push(entry);
        continue;
      }

      if (isNut) {
        // Capture NUT-specific entities
        if (/ups[._]load$/i.test(eid) || /\bload\b/i.test(name) && unit === '%') {
          nutLoadEntry = entry;
          continue;
        }
        if (/ups[._]status_data$/i.test(eid) || /status\s*data/i.test(name)) {
          nutStatusDataEntry = entry;
          continue;
        }
        if (/ups[._]status$/i.test(eid) && !/status_data/i.test(eid)) {
          nutStatusEntry = entry;
          continue;
        }
        if (/nominal.*real.*power|realpower.*nominal/i.test(name)) {
          nutNominalPower = parseFloat(entry.state?.state) || null;
          telemetry.push(entry);
          continue;
        }
        if (dc === 'duration' || /battery.*runtime/i.test(eid)) {
          nutRuntimeEntry = entry;
          telemetry.push(entry);
          continue;
        }
        if (dc === 'voltage' && unit === 'V') {
          telemetry.push(entry);
          continue;
        }
        telemetry.push(entry);
        continue;
      }

      if (dc === 'power' && unit === 'W') {
        const cls = this._classifyPowerEntity(name);
        if (cls) {
          if (cls.side === 'in') powerIn.push({ ...entry, ioType: cls.type });
          else powerOut.push({ ...entry, ioType: cls.type });
        } else {
          telemetry.push(entry);
        }
        continue;
      }
      telemetry.push(entry);
    }

    // For NUT devices, synthesize power flow from status + load
    if (isNut) {
      const statusRaw = nutStatusDataEntry?.state?.state || '';
      const nutStatus = this._parseNutStatus(statusRaw);
      const loadPct = nutLoadEntry ? parseFloat(nutLoadEntry.state?.state) || 0 : 0;
      const computedWatts = nutNominalPower ? Math.round(loadPct * nutNominalPower / 100) : null;

      // Synthesize a total-out power entry from load
      if (nutLoadEntry) {
        const label = computedWatts != null ? `${computedWatts}W (${loadPct}%)` : `${loadPct}%`;
        powerOut.push({
          ...nutLoadEntry,
          ioType: 'total',
          _nutSynthetic: true,
          _nutDisplayValue: label,
          _nutWatts: computedWatts || loadPct,
        });
      }

      // Store parsed status for render
      this._nutStatus = nutStatus;
      this._nutStatusEntry = nutStatusEntry;
      this._nutRuntimeEntry = nutRuntimeEntry;
      this._nutLoadEntry = nutLoadEntry;
      this._nutComputedWatts = computedWatts;
    } else {
      this._nutStatus = null;
    }

    if (categoryEntities) {
      for (const e of categoryEntities.config) {
        const state = this._getEntityState(e.entity_id);
        if (!state) continue;
        configControls.push({ entity: e, domain: e.entity_id.split('.')[0], state });
      }
      for (const e of categoryEntities.diagnostic) {
        const state = this._getEntityState(e.entity_id);
        if (!state) continue;
        diagnostics.push({ entity: e, domain: e.entity_id.split('.')[0], state });
      }
    }

    return { soc, powerIn, powerOut, telemetry, controls, configControls, diagnostics };
  }

  /* ─── Warp core helpers ─── */

  _getCoreColor(charge) {
    if (charge >= 80) return 'var(--lcars-ice)';
    if (charge >= 60) return 'var(--lcars-sky)';
    if (charge >= 40) return 'var(--lcars-bluey)';
    if (charge >= 20) return 'var(--lcars-butterscotch)';
    if (charge >= 10) return 'var(--lcars-peach)';
    return 'var(--lcars-tomato)';
  }

  _getFlowSpeed(watts) {
    const w = Math.abs(parseFloat(watts) || 0);
    if (w === 0) return 'flow-stopped';
    if (w > 1000) return 'flow-fast';
    if (w > 100) return 'flow-medium';
    return 'flow-slow';
  }

  /* ─── Render ─── */

  renderBadge() {
    const { soc } = this._partitionBatteryEntities(this.group.entities, this._getDeviceCategoryEntities(this.group.device.id));
    const socEntry = soc[0];
    const charge = socEntry ? parseFloat(socEntry.state.state) || 0 : 0;
    const chargeAvailable = socEntry && socEntry.state.state !== 'unavailable' && socEntry.state.state !== 'unknown';
    const coreColor = chargeAvailable ? this._getCoreColor(charge) : 'var(--lcars-gray)';
    return html`<span style="color:${coreColor}">${chargeAvailable ? `${Math.round(charge)}%` : 'N/A'}</span>`;
  }

  renderContent() {
    const categoryEntities = this._getDeviceCategoryEntities(this.group.device.id);
    const { soc, powerIn, powerOut, telemetry, controls, configControls, diagnostics } = this._partitionBatteryEntities(this.group.entities, categoryEntities);
    const deviceName = this._shortDeviceName(this.group.device) || 'Battery';

    const socEntry = soc[0];
    const charge = socEntry ? parseFloat(socEntry.state.state) || 0 : 0;
    const chargeAvailable = socEntry && socEntry.state.state !== 'unavailable' && socEntry.state.state !== 'unknown';
    const coreColor = chargeAvailable ? this._getCoreColor(charge) : 'var(--lcars-gray)';

    const totalIn = powerIn.find(e => e.ioType === 'total');
    const totalOut = powerOut.find(e => e.ioType === 'total');
    const totalInW = totalIn ? parseFloat(totalIn.state.state) || 0 : 0;
    const totalOutW = totalOut && !totalOut._nutSynthetic ? parseFloat(totalOut.state.state) || 0 : 0;

    // NUT UPS: derive charge state from NUT status codes
    let isCharging, isDischarging, isIdle;
    if (this._nutStatus) {
      isCharging = this._nutStatus.charging;
      isDischarging = this._nutStatus.onBattery;
      isIdle = !isCharging && !isDischarging;
    } else {
      isCharging = totalInW > 5;
      isDischarging = totalOutW > 5;
      isIdle = !isCharging && !isDischarging;
    }

    const ioTypes = new Set();
    powerIn.filter(e => e.ioType !== 'total').forEach(e => ioTypes.add(e.ioType));
    powerOut.filter(e => e.ioType !== 'total').forEach(e => ioTypes.add(e.ioType));
    const ioPairs = [...ioTypes].map(type => ({
      type,
      label: type.toUpperCase(),
      inEntry: powerIn.find(e => e.ioType === type),
      outEntry: powerOut.find(e => e.ioType === type),
    }));

    const keyTelemetry = telemetry.filter(e => {
      const dc = e.state?.attributes?.device_class || '';
      const name = (e.state?.attributes?.friendly_name || '').toLowerCase();
      return dc === 'temperature' || dc === 'duration' || dc === 'voltage' ||
        /state.*health|cycles|remain.*time|status|error.*code|battery.*count|runtime|load/.test(name);
    }).slice(0, 8);

    const keyDiagnostics = diagnostics.filter(e => {
      const dc = e.state?.attributes?.device_class || '';
      const name = (e.state?.attributes?.friendly_name || '').toLowerCase();
      return dc === 'temperature' || /cycles|status|error|battery.*count|charging.*state|power.*diff/.test(name);
    }).slice(0, 8);

    return html`
      <div class="battery-content">
        <!-- Telemetry (left) -->
        <div class="battery-telemetry" role="list" aria-label="${deviceName} telemetry">
          ${this._nutStatus && this._nutStatusEntry ? html`
            <div class="battery-total-line" tabindex="0" role="button"
              @click=${() => this._handleEntityClick(this._nutStatusEntry.entity.entity_id)}
              @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(this._nutStatusEntry.entity.entity_id); } }}>
              <ha-icon icon="mdi:${this._nutStatus.onBattery ? 'battery-alert' : 'power-plug'}" style="--mdc-icon-size:14px;color:${this._nutStatus.onBattery ? 'var(--lcars-butterscotch)' : 'var(--lcars-ice)'}"></ha-icon>
              <span class="sensor-label">Status</span>
              <span class="sensor-state-value" style="color:${this._nutStatus.onBattery ? 'var(--lcars-butterscotch)' : 'var(--lcars-ice)'}">${this._nutStatusEntry.state.state}</span>
            </div>
          ` : ''}
          ${this._nutStatus && this._nutLoadEntry ? html`
            <div class="battery-total-line" tabindex="0" role="button"
              @click=${() => this._handleEntityClick(this._nutLoadEntry.entity.entity_id)}
              @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(this._nutLoadEntry.entity.entity_id); } }}>
              <ha-icon icon="mdi:gauge" style="--mdc-icon-size:14px;color:var(--lcars-butterscotch)"></ha-icon>
              <span class="sensor-label">Load</span>
              <span class="sensor-state-value" style="color:var(--lcars-butterscotch)">${totalOut?._nutDisplayValue || this._nutLoadEntry.state.state + '%'}</span>
            </div>
          ` : ''}
          ${this._nutStatus && this._nutRuntimeEntry ? html`
            <div class="battery-total-line" tabindex="0" role="button"
              @click=${() => this._handleEntityClick(this._nutRuntimeEntry.entity.entity_id)}
              @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(this._nutRuntimeEntry.entity.entity_id); } }}>
              <ha-icon icon="mdi:timer-outline" style="--mdc-icon-size:14px;color:var(--lcars-sky)"></ha-icon>
              <span class="sensor-label">Runtime</span>
              <span class="sensor-state-value" style="color:var(--lcars-sky)">${this._formatNutRuntime(this._nutRuntimeEntry.state.state)}</span>
            </div>
          ` : ''}
          ${!this._nutStatus && totalIn ? html`
            <div class="battery-total-line" tabindex="0" role="button"
              @click=${() => this._handleEntityClick(totalIn.entity.entity_id)}
              @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(totalIn.entity.entity_id); } }}>
              <ha-icon icon="mdi:transmission-tower-import" style="--mdc-icon-size:14px;color:var(--lcars-ice)"></ha-icon>
              <span class="sensor-label">Total In</span>
              <span class="sensor-state-value" style="color:var(--lcars-ice)">${formatNumber(totalIn.state.state, 'power')} W</span>
            </div>
          ` : ''}
          ${!this._nutStatus && totalOut ? html`
            <div class="battery-total-line" tabindex="0" role="button"
              @click=${() => this._handleEntityClick(totalOut.entity.entity_id)}
              @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(totalOut.entity.entity_id); } }}>
              <ha-icon icon="mdi:transmission-tower-export" style="--mdc-icon-size:14px;color:var(--lcars-butterscotch)"></ha-icon>
              <span class="sensor-label">Total Out</span>
              <span class="sensor-state-value" style="color:var(--lcars-butterscotch)">${formatNumber(totalOut.state.state, 'power')} W</span>
            </div>
          ` : ''}
          ${keyTelemetry.map(({ entity, state }) => {
            const name = this._friendlyName(state, entity);
            const val = formatNumber(state.state, state.attributes?.device_class || '');
            const unit = state.attributes?.unit_of_measurement || '';
            const color = this._getSensorIndicatorColor(state);
            return html`
              <lcars-sensor-row
                label="${name}"
                value="${val}${unit ? ' ' + unit : ''}"
                color="${color}"
                entity-id="${entity.entity_id}">
              </lcars-sensor-row>
            `;
          })}
          ${keyDiagnostics.length > 0 ? html`
            <lcars-section-divider label="DIAGNOSTICS"></lcars-section-divider>
            ${keyDiagnostics.map(({ entity, state }) => {
              const name = this._friendlyName(state, entity);
              const val = formatNumber(state.state, state.attributes?.device_class || '');
              const unit = state.attributes?.unit_of_measurement || '';
              const color = this._getSensorIndicatorColor(state);
              return html`
                <lcars-sensor-row
                  label="${name}"
                  value="${val}${unit ? ' ' + unit : ''}"
                  color="${color}"
                  entity-id="${entity.entity_id}">
                </lcars-sensor-row>
              `;
            })}
          ` : ''}
        </div>

        <!-- Warp Core (center) -->
        <div class="warp-core-container" role="meter"
          aria-valuenow="${chargeAvailable ? charge : ''}" aria-valuemin="0" aria-valuemax="100"
          aria-valuetext="${chargeAvailable ? `${Math.round(charge)} percent` : 'OFFLINE'}"
          aria-label="${chargeAvailable ? `Battery charge level: ${Math.round(charge)} percent` : 'Battery offline'}">
          <div class="warp-core" style="--core-color:${coreColor};--core-charge:${chargeAvailable ? charge : 0}">
            <div class="warp-core-fill ${isIdle ? 'core-idle' : ''} ${isCharging ? 'core-charging' : ''}">
              <div class="warp-core-stream"></div>
            </div>
            <div class="warp-core-tick" style="bottom:25%"></div>
            <div class="warp-core-tick" style="bottom:50%"></div>
            <div class="warp-core-tick" style="bottom:75%"></div>
          </div>
        </div>

        <!-- Controls (right) -->
        <div class="battery-controls" aria-label="${deviceName} controls">
          ${controls.map(({ entity, state }) => {
            const name = this._friendlyName(state, entity);
            const domain = entity.entity_id.split('.')[0];
            if (domain === 'number') {
              const min = state.attributes?.min || 0;
              const max = state.attributes?.max || 100;
              const val = parseFloat(state.state) || 0;
              const unit = state.attributes?.unit_of_measurement || '';
              const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
              return html`
                <div class="battery-slider-control">
                  <span class="battery-slider-label" id="slider-${entity.entity_id}">${name}</span>
                  <div class="battery-slider-track"
                    tabindex="0" role="slider"
                    aria-labelledby="slider-${entity.entity_id}"
                    aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${val}"
                    @click=${(ev) => {
                      const rect = ev.currentTarget.getBoundingClientRect();
                      const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
                      const newVal = Math.round(min + ratio * (max - min));
                      this.hass.callService('number', 'set_value', { entity_id: entity.entity_id, value: newVal });
                    }}
                    @keydown=${(ev) => {
                      let newVal = val;
                      if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') { newVal = Math.min(max, val + 1); }
                      else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') { newVal = Math.max(min, val - 1); }
                      else if (ev.key === 'Home') { newVal = min; }
                      else if (ev.key === 'End') { newVal = max; }
                      else return;
                      ev.preventDefault();
                      this.hass.callService('number', 'set_value', { entity_id: entity.entity_id, value: newVal });
                    }}>
                    <div class="battery-slider-fill" style="width:${pct}%"></div>
                    <div class="battery-slider-thumb" style="left:${pct}%"></div>
                  </div>
                  <span class="battery-slider-value">${formatNumber(String(val), state.attributes?.device_class || '')}${unit ? ' ' + unit : ''}</span>
                </div>
              `;
            }
            const isOn = state.state === 'on';
            const isOff = this._isOff(state);
            return html`
              <button class="device-control-btn" ?data-on=${isOn} ?data-off=${isOff}
                @click=${() => TOGGLE_DOMAINS.has(domain)
                  ? this._handleToggle(entity.entity_id)
                  : this._handleEntityClick(entity.entity_id)}
                title="${name}: ${state.state}">
                <ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>
                <span>${name}</span>
              </button>
            `;
          })}
          ${configControls.length > 0 ? html`
            <lcars-section-divider label="CONFIG"></lcars-section-divider>
            ${configControls.map(({ entity, state }) => {
              const name = this._friendlyName(state, entity);
              const domain = entity.entity_id.split('.')[0];
              if (domain === 'number') {
                const min = state.attributes?.min || 0;
                const max = state.attributes?.max || 100;
                const step = state.attributes?.step || 1;
                const val = parseFloat(state.state) || 0;
                const unit = state.attributes?.unit_of_measurement || '';
                const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
                return html`
                  <div class="battery-slider-control">
                    <span class="battery-slider-label" id="slider-${entity.entity_id}">${name}</span>
                    <div class="battery-slider-track"
                      tabindex="0" role="slider"
                      aria-labelledby="slider-${entity.entity_id}"
                      aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${val}"
                      @click=${(ev) => {
                        const rect = ev.currentTarget.getBoundingClientRect();
                        const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
                        let newVal = min + ratio * (max - min);
                        newVal = Math.round(newVal / step) * step;
                        newVal = Math.max(min, Math.min(max, newVal));
                        this.hass.callService('number', 'set_value', { entity_id: entity.entity_id, value: newVal });
                      }}
                      @keydown=${(ev) => {
                        let newVal = val;
                        if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') { newVal = Math.min(max, val + step); }
                        else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') { newVal = Math.max(min, val - step); }
                        else if (ev.key === 'Home') { newVal = min; }
                        else if (ev.key === 'End') { newVal = max; }
                        else return;
                        ev.preventDefault();
                        this.hass.callService('number', 'set_value', { entity_id: entity.entity_id, value: newVal });
                      }}>
                      <div class="battery-slider-fill" style="width:${pct}%"></div>
                      <div class="battery-slider-thumb" style="left:${pct}%"></div>
                    </div>
                    <span class="battery-slider-value">${formatNumber(String(val), state.attributes?.device_class || '')}${unit ? ' ' + unit : ''}</span>
                  </div>
                `;
              }
              if (domain === 'select') {
                const options = state.attributes?.options || [];
                const current = state.state;
                return html`
                  <div class="lcars-option-strip" role="radiogroup" aria-label="${name}">
                    <span class="lcars-option-strip-label">${name}</span>
                    <div class="lcars-option-strip-btns">
                      ${options.map(opt => html`
                        <button class="lcars-option-btn"
                          role="radio"
                          aria-checked="${opt === current}"
                          ?data-selected=${opt === current}
                          @click=${() => { lcarsAudio.play('switchToggle'); this.hass.callService('select', 'select_option', {
                            entity_id: entity.entity_id, option: opt
                          }); }}>
                          ${opt}
                        </button>
                      `)}
                    </div>
                  </div>
                `;
              }
              const isOn = state.state === 'on';
              const isOff = this._isOff(state);
              return html`
                <button class="device-control-btn" ?data-on=${isOn} ?data-off=${isOff}
                  @click=${() => TOGGLE_DOMAINS.has(domain)
                    ? this._handleToggle(entity.entity_id)
                    : this._handleEntityClick(entity.entity_id)}
                  title="${name}: ${state.state}">
                  <ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>
                  <span>${name}</span>
                </button>
              `;
            })}
          ` : ''}
        </div>

        <!-- Power I/O Flow (bottom) -->
        <div class="battery-io-flow" aria-label="Power flow">
          ${this._nutStatus ? html`
            <div class="io-pair-row">
              <div class="io-port io-in" aria-label="Grid input: ${this._nutStatus.online ? 'online' : 'offline'}">
                <span class="io-label">GRID</span>
                <span class="io-watts" style="color:${this._nutStatus.online ? 'var(--lcars-ice)' : 'var(--lcars-tomato)'}">${this._nutStatus.online ? 'ONLINE' : 'OFFLINE'}</span>
              </div>
              <div class="io-conduit io-conduit-in ${this._nutStatus.online ? 'flow-medium' : 'flow-stopped'}"></div>
              <div class="io-core-gap"></div>
              <div class="io-conduit io-conduit-out ${this._nutLoadEntry && parseFloat(this._nutLoadEntry.state?.state) > 0 ? 'flow-medium' : 'flow-stopped'}"></div>
              <div class="io-port io-out" aria-label="Load output: ${this._nutComputedWatts ? this._nutComputedWatts + ' watts' : (this._nutLoadEntry?.state?.state || '0') + ' percent'}">
                <span class="io-label">LOAD</span>
                <span class="io-watts" style="color:var(--lcars-butterscotch)">${totalOut?._nutDisplayValue || '—'}</span>
              </div>
            </div>
          ` : html`
          ${ioPairs.map(pair => {
            const inW = pair.inEntry ? parseFloat(pair.inEntry.state.state) || 0 : 0;
            const outW = pair.outEntry ? parseFloat(pair.outEntry.state.state) || 0 : 0;
            const inSpeed = this._getFlowSpeed(inW);
            const outSpeed = this._getFlowSpeed(outW);
            return html`
              <div class="io-pair-row">
                <div class="io-port io-in" aria-label="${pair.label} input: ${inW} watts">
                  <span class="io-label">${pair.label} IN</span>
                  <span class="io-watts" style="color:var(--lcars-ice)">${inW > 0 ? `${Math.round(inW)}W` : '—'}</span>
                </div>
                <div class="io-conduit io-conduit-in ${inSpeed}"></div>
                <div class="io-core-gap"></div>
                <div class="io-conduit io-conduit-out ${outSpeed}"></div>
                <div class="io-port io-out" aria-label="${pair.label} output: ${outW} watts">
                  <span class="io-label">${pair.label} OUT</span>
                  <span class="io-watts" style="color:var(--lcars-butterscotch)">${outW > 0 ? `${Math.round(outW)}W` : '—'}</span>
                </div>
              </div>
            `;
          })}
          `}
        </div>
      </div>
    `;
  }
}

if (!customElements.get('lcars-battery-panel')) {
  defineLcars('lcars-battery-panel', LcarsBatteryPanel);
}
