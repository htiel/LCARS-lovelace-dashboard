/**
 * lcars-illumination-panel.js (4X-11)
 *
 * Area-level lighting control panel — aggregates all light domain entities,
 * lighting switches, and scenes into a unified LCARS console.
 *
 * Sections:
 *   1. Dimmable lights — full-width brightness bars with toggle + slider
 *   2. Scenes — horizontal strip of LCARS endcap activation buttons
 *   3. Switch circuits — simple on/off rows for non-dimmable lighting switches
 *
 * Badge: "3/5 ON" — active count / total count
 * Frame color: var(--lcars-sunflower) — warm light aesthetic
 *
 * Edit mode: drag-and-drop reorder via Pointer Events + FLIP animation.
 * Custom order persisted to localStorage keyed by area ID.
 * // TODO: 5.x — WS persistence for cross-device sync
 */
import { html, css } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { isLightingEntity } from '../../lcars-entity-utils.js';
import { showMoreInfo, fireEvent, lcarsLog } from '../../lcars-helpers.js';
import { createDebouncer, createRateLimiter, clampValue } from '../../lcars-service-utils.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { lcarsFocusRing } from '../../lcars-styles.js';
import { illuminationPanelStyles } from './lcars-illumination-panel-styles.js';

import '../../components/lcars-summary-badge/lcars-summary-badge.js';

const TAG = 'IlluminationPanel';

class LcarsIlluminationPanel extends LcarsBasePanel {

  static get properties() {
    return {
      ...super.properties,
      _expandedLight: { type: String },  // entity_id of expanded brightness slider
      _dragEntityId: { type: String },   // entity_id being dragged
    };
  }

  constructor() {
    super();
    this._expandedLight = null;
    this._dragEntityId = null;
    this._dragState = null;
    this._flipPositions = null;
    this._cachedPartition = null;
    this._partitionDirty = true;
    this._brightnessDebouncer = createDebouncer((eid, pct) => {
      const safePct = clampValue(pct, 1, 100);
      const brightness = Math.round(safePct / 100 * 255);
      this._callService('light', 'turn_on', { entity_id: eid, brightness });
    }, 300);
    this._sceneRateLimiter = createRateLimiter(3, 5000);
    this._lastDragWasDrag = false;
    // Bound handler for pointer capture events
    this._boundPointerMove = this._handlePointerMove.bind(this);
    this._boundPointerUp = this._handlePointerUp.bind(this);
  }

  get panelType() { return 'illumination'; }
  get defaultPanelTitle() { return 'ILLUMINATION CONTROL'; }
  get frameColor() { return 'var(--lcars-sunflower)'; }

  static get styles() {
    return [
      ...super.styles,
      sharedKeyframes,
      sharedReducedMotion,
      lcarsFocusRing,
      illuminationPanelStyles,
    ];
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._cancelDrag();
    this._brightnessDebouncer.cancel();
    this._dragState = null;
    this._flipPositions = null;
  }

  willUpdate(changedProps) {
    super.willUpdate(changedProps);
    // Reset UI state when switching areas
    if (changedProps.has('areaId') && changedProps.get('areaId') !== undefined) {
      this._expandedLight = null;
      this._cancelDrag();
    }
    // Invalidate partition cache only when data-bearing props change
    if (changedProps.has('hass') || changedProps.has('group') ||
        changedProps.has('entities') || changedProps.has('linkedEntities') ||
        changedProps.has('areaId')) {
      this._partitionDirty = true;
    }
  }

  /* ─── Entity Partitioning (cached per render cycle) ─── */

  _getPartition() {
    if (!this._partitionDirty && this._cachedPartition) return this._cachedPartition;
    this._cachedPartition = this._partitionLightingEntities();
    this._partitionDirty = false;
    return this._cachedPartition;
  }

  /**
   * Partition area entities into lights, scenes, and circuits.
   */
  _partitionLightingEntities() {
    const allEntries = this._getAllEntities();

    const dimmableLights = [];  // light domain entities
    const scenes = [];          // scene domain
    const circuits = [];        // switches/booleans controlling lights
    const coveredDeviceIds = new Set();

    // Pass 1: collect light-domain entities (highest fidelity control)
    for (const entry of allEntries) {
      if (entry.domain === 'light' && isLightingEntity(entry)) {
        dimmableLights.push(entry);
        if (entry.entity?.device_id) coveredDeviceIds.add(entry.entity.device_id);
      } else if (entry.domain === 'scene') {
        scenes.push(entry);
      }
    }

    // Pass 2: collect circuits only for devices not already covered by a light entity
    for (const entry of allEntries) {
      if (entry.domain === 'light' || entry.domain === 'scene') continue;
      if (isLightingEntity(entry)) {
        if (!entry.entity?.device_id || !coveredDeviceIds.has(entry.entity.device_id)) {
          circuits.push(entry);
        }
      }
    }

    // Stable sort: custom order (localStorage) → alphabetical fallback
    this._applyCustomOrder(dimmableLights);

    return { dimmableLights, scenes, circuits };
  }

  /* ─── Custom Order (localStorage) ─── */

  _getOrderKey() {
    return `lcars-ilm-order-${this.areaId || 'default'}`;
  }

  _loadOrder(entityIds) {
    try {
      const stored = JSON.parse(localStorage.getItem(this._getOrderKey()));
      if (!Array.isArray(stored)) return null;
      const valid = new Set(entityIds);
      const filtered = stored.filter(id => valid.has(id));
      const missing = entityIds.filter(id => !stored.includes(id));
      missing.sort(); // alphabetical for new entities
      return [...filtered, ...missing];
    } catch { return null; }
  }

  _saveOrder(orderedIds) {
    try {
      localStorage.setItem(this._getOrderKey(), JSON.stringify(orderedIds));
    } catch (e) {
      lcarsLog.warn(TAG, 'Failed to save light order:', e);
    }
  }

  _applyCustomOrder(lights) {
    const ids = lights.map(e => e.entity?.entity_id);
    const order = this._loadOrder(ids);
    if (order) {
      const orderMap = new Map(order.map((id, i) => [id, i]));
      lights.sort((a, b) => {
        const aIdx = orderMap.get(a.entity?.entity_id) ?? 999;
        const bIdx = orderMap.get(b.entity?.entity_id) ?? 999;
        if (aIdx !== bIdx) return aIdx - bIdx;
        return (a.state?.attributes?.friendly_name || '')
          .localeCompare(b.state?.attributes?.friendly_name || '');
      });
    } else {
      // Default: alphabetical only (stable — no on-state or brightness sorting)
      lights.sort((a, b) =>
        (a.state?.attributes?.friendly_name || '')
          .localeCompare(b.state?.attributes?.friendly_name || '')
      );
    }
  }

  /* ─── Badge ─── */

  renderBadge() {
    const { dimmableLights, circuits } = this._getPartition();
    const all = [...dimmableLights, ...circuits];
    const total = all.length;
    // Read LIVE state from hass for accurate badge count
    const active = all.filter(e => {
      const eid = e.entity?.entity_id;
      return (this.hass?.states?.[eid] || e.state)?.state === 'on';
    }).length;
    if (total === 0) return html``;

    return html`
      <lcars-summary-badge
        value="${active}"
        total="${total}"
        label="ON"
        color="var(--lcars-sunflower)">
      </lcars-summary-badge>
    `;
  }

  /* ─── Content ─── */

  renderContent() {
    const { dimmableLights, scenes, circuits } = this._getPartition();

    if (dimmableLights.length === 0 && circuits.length === 0) {
      return html`<div class="ilm-empty">NO LIGHTING ENTITIES</div>`;
    }

    return html`
      <div class="ilm-content">
        ${this.editMode ? html`
          <div class="ilm-reorder-status" role="status" aria-live="polite">
            ${this._dragEntityId ? '' : 'DRAG TO REORDER \u2022 ALT+ARROWS TO MOVE'}
          </div>
        ` : ''}
        ${dimmableLights.length > 0 ? html`
          <div class="ilm-lights" role="list" aria-label="Dimmable lights">
            ${dimmableLights.map(entry => this._renderLightBar(entry))}
          </div>
        ` : ''}

        ${scenes.length > 0 ? html`
          <div class="ilm-section-divider">
            <span class="ilm-section-label">SCENES</span>
            <span class="ilm-section-line"></span>
          </div>
          <div class="ilm-scenes" role="list" aria-label="Scene presets">
            ${scenes.map(entry => this._renderSceneButton(entry))}
          </div>
        ` : ''}

        ${circuits.length > 0 ? html`
          <div class="ilm-section-divider">
            <span class="ilm-section-label">CIRCUITS</span>
            <span class="ilm-section-line"></span>
          </div>
          <div class="ilm-circuits" role="list" aria-label="Lighting circuits">
            ${circuits.map(entry => this._renderCircuitRow(entry))}
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ─── FLIP Animation (after render) ─── */

  updated(changedProps) {
    super.updated(changedProps);
    if (!this._flipPositions) return;
    const items = this.shadowRoot.querySelectorAll('.ilm-light-bar');
    const flip = this._flipPositions;
    this._flipPositions = null;
    requestAnimationFrame(() => {
      for (const el of items) {
        const id = el.dataset.entityId;
        const oldTop = flip.get(id);
        if (oldTop == null) continue;
        const newTop = el.getBoundingClientRect().top;
        const deltaY = oldTop - newTop;
        if (Math.abs(deltaY) < 1) continue;
        el.style.transform = `translateY(${deltaY}px)`;
        el.style.transition = 'none';
        el.offsetHeight; // force reflow
        el.style.transition = 'transform 200ms cubic-bezier(0.2, 0, 0.2, 1)';
        el.style.transform = '';
      }
    });
  }

  /* ─── Light Brightness Bar ─── */

  _renderLightBar(entry) {
    const eid = entry.entity?.entity_id;
    // Read LIVE state from hass — cached entry.state may be stale after toggle
    const state = this.hass?.states?.[eid] || entry.state;
    const isOn = state?.state === 'on';
    const brightness = isOn ? Math.round((state?.attributes?.brightness || 0) / 255 * 100) : 0;
    const name = this._shortEntityName(entry);
    const expanded = this._expandedLight === eid;
    const isDragging = this._dragEntityId === eid;

    // Color temperature awareness
    const colorTemp = state?.attributes?.color_temp_kelvin;
    const barColor = this._getBarColor(colorTemp, isOn, state);

    // Effect support
    const effectList = state?.attributes?.effect_list;
    const activeEffect = state?.attributes?.effect;
    const hasEffects = Array.isArray(effectList) && effectList.length > 0;

    // Color mode support
    const supportedModes = state?.attributes?.supported_color_modes || [];
    const hasColorControl = supportedModes.some(m => m === 'hs' || m === 'rgb' || m === 'xy');
    const hasBrightness = supportedModes.some(m => m === 'brightness' || m === 'color_temp' || m === 'hs' || m === 'rgb' || m === 'xy');
    const activeHue = state?.attributes?.hs_color?.[0];
    // Toggle-only lights (onoff only) don't get expanded controls
    const isExpandable = hasBrightness || hasEffects || hasColorControl;

    // Bar display: show effect name when active, brightness % for dimmable, ON/OFF for toggles
    const barValueText = isOn
      ? (activeEffect && activeEffect !== 'none' ? activeEffect.toUpperCase()
         : hasBrightness ? `${brightness}%` : 'ON')
      : 'OFF';

    return html`
      <div class="ilm-light-item">
        <div class="ilm-light-bar ${isOn ? 'on' : 'off'} ${isDragging ? 'dragging' : ''}"
           role="listitem"
           aria-roledescription="${this.editMode ? 'reorderable light' : ''}"
           tabindex="0"
           data-entity-id="${eid}"
           style="--brightness:${isOn && !hasBrightness ? 100 : brightness}%; --bar-color:${barColor}"
           @click=${(e) => { if (!this._lastDragWasDrag && !this._dragState?.didDrag) this._toggleLight(eid); }}
           @contextmenu=${(e) => { e.preventDefault(); showMoreInfo(eid); }}
           @keydown=${(e) => this._handleLightKeydown(e, eid, brightness)}>
        ${this.editMode ? html`
          <span class="ilm-grip"
                aria-label="Drag to reorder ${name}"
                @pointerdown=${(e) => this._onPointerDown(e, eid)}>
            <span></span><span></span><span></span>
          </span>
        ` : html`
          <span class="ilm-indicator ${isOn ? 'active' : ''}"
                aria-hidden="true"></span>
        `}
        <span class="ilm-light-name">${name}</span>
        ${isExpandable ? html`
          <span class="ilm-light-value"
                tabindex="0"
                role="button"
                aria-expanded="${expanded}"
                aria-label="${name} ${barValueText} — click to ${expanded ? 'collapse' : 'expand'} controls"
                @click=${(e) => { e.stopPropagation(); this._expandedLight = expanded ? null : eid; }}>
            ${barValueText}
          </span>
        ` : html`
          <span class="ilm-light-value">${barValueText}</span>
        `}
      </div>
      ${expanded && isExpandable ? html`
        <div class="ilm-expanded-controls">
          ${hasBrightness ? html`
            <div class="ilm-slider-row">
              <input type="range" min="1" max="100" .value=${String(brightness)}
                     aria-label="${name} brightness slider"
                     @input=${(e) => { e.stopPropagation(); this._brightnessDebouncer.call(eid, parseInt(e.target.value)); }}
                     @click=${(e) => e.stopPropagation()}
                     @change=${(e) => { e.stopPropagation(); this._setBrightness(eid, parseInt(e.target.value)); }}>
            </div>
          ` : ''}
          ${hasColorControl ? html`
            <div class="ilm-color-presets" role="listbox" aria-label="${name} color presets">
              ${LcarsIlluminationPanel.COLOR_PRESETS.map(p => html`
                <button class="ilm-color-preset ${this._isActivePreset(activeHue, p.hs[0]) ? 'active' : ''}"
                        style="--preset-color:${p.color}"
                        role="option"
                        aria-selected="${this._isActivePreset(activeHue, p.hs[0])}"
                        aria-label="Set ${p.name.toLowerCase()} color"
                        @click=${(e) => { e.stopPropagation(); this._setColor(eid, p.hs); }}>
                  ${p.name}
                </button>
              `)}
            </div>
          ` : ''}
          ${hasEffects ? html`
            <div class="ilm-effects-strip" role="listbox" aria-label="${name} effects">
              <button class="ilm-effect-btn ${!activeEffect || activeEffect === 'none' ? 'active' : ''}"
                      role="option"
                      aria-selected="${!activeEffect || activeEffect === 'none'}"
                      @click=${(e) => { e.stopPropagation(); this._clearEffect(eid); }}>
                SOLID
              </button>
              ${effectList.map(fx => html`
                <button class="ilm-effect-btn ${activeEffect === fx ? 'active' : ''}"
                        role="option"
                        aria-selected="${activeEffect === fx}"
                        @click=${(e) => { e.stopPropagation(); this._setEffect(eid, fx); }}>
                  ${fx.toUpperCase()}
                </button>
              `)}
            </div>
          ` : ''}
        </div>
      ` : ''}
      </div>
    `;
  }

  /* ─── Drag-and-Drop Reorder (Pointer Events + setPointerCapture) ─── */

  _onPointerDown(e, entityId) {
    if (!this.editMode) return;
    e.preventDefault();
    e.stopPropagation();
    const bar = e.target.closest('.ilm-light-bar');
    if (!bar) return;

    bar.setPointerCapture(e.pointerId);
    bar.addEventListener('pointermove', this._boundPointerMove);
    bar.addEventListener('pointerup', this._boundPointerUp);
    bar.addEventListener('pointercancel', this._boundPointerUp);

    const { dimmableLights } = this._getPartition();
    const orderedIds = dimmableLights.map(en => en.entity?.entity_id);

    const currentIndex = orderedIds.indexOf(entityId);
    this._dragState = {
      entityId,
      pointerId: e.pointerId,
      startY: e.clientY,
      barEl: bar,
      currentIndex,
      hoverIndex: currentIndex,
      orderedIds: [...orderedIds],
      didDrag: false,
    };
    this._dragEntityId = entityId;
  }

  _handlePointerMove(e) {
    if (!this._dragState) return;
    const dy = e.clientY - this._dragState.startY;
    // Require minimum 8px movement before activating drag
    if (!this._dragState.didDrag && Math.abs(dy) < 8) return;
    this._dragState.didDrag = true;

    const bars = this.shadowRoot.querySelectorAll('.ilm-light-bar');
    if (!bars.length) return;
    const itemHeight = bars[0].getBoundingClientRect().height + 4; // + gap
    const indexShift = Math.round(dy / itemHeight);
    const newIndex = clampValue(
      this._dragState.currentIndex + indexShift,
      0,
      this._dragState.orderedIds.length - 1
    );

    if (newIndex !== this._dragState.hoverIndex) {
      this._dragState.hoverIndex = newIndex;
      // Capture FLIP positions before reorder
      this._captureFlipPositions();
      // Reorder the array
      const ids = [...this._dragState.orderedIds];
      const fromIdx = ids.indexOf(this._dragState.entityId);
      ids.splice(fromIdx, 1);
      ids.splice(newIndex, 0, this._dragState.entityId);
      this._saveOrder(ids);
      this._partitionDirty = true;
      this.requestUpdate();
    }
  }

  _handlePointerUp(e) {
    if (!this._dragState) return;
    const bar = this._dragState.barEl;
    if (bar) {
      try { bar.releasePointerCapture(this._dragState.pointerId); } catch {}
      bar.removeEventListener('pointermove', this._boundPointerMove);
      bar.removeEventListener('pointerup', this._boundPointerUp);
      bar.removeEventListener('pointercancel', this._boundPointerUp);
    }
    const didDrag = this._dragState.didDrag;
    this._lastDragWasDrag = didDrag;
    this._dragState = null;
    this._dragEntityId = null;
    if (didDrag) {
      requestAnimationFrame(() => { this._lastDragWasDrag = false; });
      this._partitionDirty = true;
      this.requestUpdate();
    }
  }

  _cancelDrag() {
    if (this._dragState?.barEl) {
      const bar = this._dragState.barEl;
      try { bar.releasePointerCapture(this._dragState.pointerId); } catch {}
      bar.removeEventListener('pointermove', this._boundPointerMove);
      bar.removeEventListener('pointerup', this._boundPointerUp);
      bar.removeEventListener('pointercancel', this._boundPointerUp);
    }
    this._dragState = null;
    this._dragEntityId = null;
  }

  _captureFlipPositions() {
    this._flipPositions = new Map();
    const bars = this.shadowRoot.querySelectorAll('.ilm-light-bar');
    for (const bar of bars) {
      const id = bar.dataset.entityId;
      if (id) this._flipPositions.set(id, bar.getBoundingClientRect().top);
    }
  }

  /* ─── Keyboard Reorder (Alt+Arrow — WCAG 2.5.7) ─── */

  _handleLightKeydown(e, entityId, currentBrightness) {
    // Edit mode: Alt+Arrow reorders
    if (this.editMode && e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      this._keyboardReorder(entityId, e.key === 'ArrowUp' ? -1 : 1);
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._toggleLight(entityId);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentBrightness > 0) {
        this._setBrightness(entityId, Math.min(100, currentBrightness + 5));
      }
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentBrightness > 0) {
        this._setBrightness(entityId, Math.max(1, currentBrightness - 5));
      }
    }
  }

  _keyboardReorder(entityId, direction) {
    const { dimmableLights } = this._getPartition();
    const ids = dimmableLights.map(e => e.entity?.entity_id);
    const idx = ids.indexOf(entityId);
    if (idx < 0) return;
    const newIdx = clampValue(idx + direction, 0, ids.length - 1);
    if (newIdx === idx) return;

    this._captureFlipPositions();
    ids.splice(idx, 1);
    ids.splice(newIdx, 0, entityId);
    this._saveOrder(ids);
    this._partitionDirty = true;
    this.requestUpdate();

    // Announce position change
    const status = this.shadowRoot.querySelector('.ilm-reorder-status');
    if (status) {
      const name = dimmableLights.find(e => e.entity?.entity_id === entityId);
      const displayName = name ? this._shortEntityName(name) : entityId;
      status.textContent = `${displayName} MOVED TO POSITION ${newIdx + 1} OF ${ids.length}`;
    }

    // Re-focus the moved element after render
    this.updateComplete.then(() => {
      const bar = this.shadowRoot.querySelector(`[data-entity-id="${CSS.escape(entityId)}"]`);
      if (bar) bar.focus();
    });
  }

  /* ─── Scene Button ─── */

  _renderSceneButton(entry) {
    const eid = entry.entity?.entity_id;
    const name = this._shortEntityName(entry);
    return html`
      <div role="listitem">
        <button class="ilm-scene-btn"
                aria-label="Activate ${name} scene"
                @click=${() => this._activateScene(eid)}>
          ${name}
        </button>
      </div>
    `;
  }

  /* ─── Circuit Row ─── */

  _renderCircuitRow(entry) {
    const eid = entry.entity?.entity_id;
    // Read LIVE state from hass — cached entry.state may be stale after toggle
    const isOn = (this.hass?.states?.[eid] || entry.state)?.state === 'on';
    const name = this._shortEntityName(entry);
    return html`
      <div class="ilm-circuit-row ${isOn ? 'on' : 'off'}"
           role="listitem"
           tabindex="0"
           @click=${() => this._toggleLight(eid)}
           @contextmenu=${(e) => { e.preventDefault(); showMoreInfo(eid); }}
           @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._toggleLight(eid); } }}>
        <span class="ilm-indicator ${isOn ? 'active' : ''}"
              aria-hidden="true"></span>
        <span class="ilm-circuit-name">${name}</span>
        <span class="ilm-circuit-state">${isOn ? 'ON' : 'OFF'}</span>
      </div>
    `;
  }

  /* ─── Color Temperature Bar Color ─── */

  _getBarColor(colorTempK, isOn, state) {
    if (!isOn) return 'var(--lcars-gray, #666688)';

    // Priority: HS color mode → color_temp → default
    const colorMode = state?.attributes?.color_mode;
    if (colorMode === 'hs' || colorMode === 'rgb' || colorMode === 'xy') {
      const hs = state?.attributes?.hs_color;
      if (hs) return this._hueToLcarsColor(hs[0], hs[1]);
    }

    if (!colorTempK) return 'var(--lcars-sunflower)';
    const t = Math.max(0, Math.min(1, (colorTempK - 2000) / 4500));
    if (t < 0.5) return 'var(--lcars-butterscotch)';
    if (t < 0.8) return 'var(--lcars-sunflower)';
    return 'var(--lcars-ice)';
  }

  /** Map hue (0–360) to nearest LCARS palette color */
  _hueToLcarsColor(hue, saturation) {
    if (saturation != null && saturation < 15) return 'var(--lcars-sunflower)';
    if (hue < 30)  return 'var(--lcars-tomato)';
    if (hue < 60)  return 'var(--lcars-butterscotch)';
    if (hue < 90)  return 'var(--lcars-sunflower)';
    if (hue < 160) return '#66bb6a';
    if (hue < 220) return 'var(--lcars-ice)';
    if (hue < 270) return 'var(--lcars-bluey)';
    if (hue < 330) return 'var(--lcars-lilac)';
    return 'var(--lcars-tomato)';
  }

  /* ─── Color Presets ─── */

  static get COLOR_PRESETS() {
    return [
      { name: 'WARM',   hs: [30, 80],   color: 'var(--lcars-butterscotch, #ff9966)' },
      { name: 'COOL',   hs: [210, 20],  color: 'var(--lcars-ice, #99ccff)' },
      { name: 'RED',    hs: [0, 100],   color: 'var(--lcars-tomato, #ff5555)' },
      { name: 'GREEN',  hs: [120, 100], color: '#66bb6a' },
      { name: 'BLUE',   hs: [240, 100], color: 'var(--lcars-bluey, #3366cc)' },
      { name: 'PURPLE', hs: [280, 80],  color: 'var(--lcars-lilac, #cc55ff)' },
    ];
  }

  _isActivePreset(activeHue, presetHue) {
    if (activeHue == null) return false;
    const diff = Math.abs(activeHue - presetHue);
    return diff < 20 || diff > 340;
  }

  /* ─── Effect & Color Actions ─── */

  _setEffect(entityId, effect) {
    if (!this.hass || !entityId) return;
    this._callService('light', 'turn_on', { entity_id: entityId, effect });
  }

  _clearEffect(entityId) {
    if (!this.hass || !entityId) return;
    this._callService('light', 'turn_on', { entity_id: entityId, effect: 'none' });
  }

  _setColor(entityId, hs) {
    if (!this.hass || !entityId) return;
    this._callService('light', 'turn_on', { entity_id: entityId, hs_color: hs });
  }

  /* ─── Actions ─── */

  _toggleLight(entityId) {
    if (!this.hass || !entityId) return;
    const domain = entityId.split('.')[0];
    this._callService(domain, 'toggle', { entity_id: entityId });
  }

  _setBrightness(entityId, pct) {
    if (!this.hass || !entityId) return;
    const safePct = clampValue(pct, 1, 100);
    const brightness = Math.round(safePct / 100 * 255);
    this._callService('light', 'turn_on', { entity_id: entityId, brightness });
  }

  _activateScene(entityId) {
    if (!this.hass || !entityId) return;
    if (!this._sceneRateLimiter.allow()) return;
    this._callService('scene', 'turn_on', { entity_id: entityId });
  }

  /* ─── Utility ─── */

  _shortEntityName(entry) {
    const raw = entry.state?.attributes?.friendly_name || entry.entity?.entity_id || '';
    return this._shortenName(raw, entry.entity).toUpperCase();
  }
}

customElements.define('lcars-illumination-panel', LcarsIlluminationPanel);
export { LcarsIlluminationPanel };
