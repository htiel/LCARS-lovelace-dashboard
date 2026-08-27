/**
 * lcars-viewport-panel.js (4X-41)
 *
 * Viewport Controls panel — blinds, shades, curtains, awnings.
 * Per-cover open/close/stop controls with position display.
 *
 * Themed as "Observation Ports" — covers that control visibility/light.
 * Excludes security covers (garage_door, gate, door) which route to Tactical.
 */
import { html } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { showMoreInfo, lcarsLog, defineLcars } from '../../lcars-helpers.js';
import { lcarsFocusRing } from '../../lcars-styles.js';
import { viewportPanelStyles } from './lcars-viewport-panel-styles.js';
import { lcarsAudio } from '../../lcars-audio.js';

import '../../components/lcars-summary-badge/lcars-summary-badge.js';

const TAG = 'ViewportPanel';

// Cover device classes that route to Tactical panel (excluded here)
const TACTICAL_COVER_CLASSES = new Set(['garage_door', 'gate', 'door']);

class LcarsViewportPanel extends LcarsBasePanel {

  get panelType() { return 'viewport'; }
  get defaultPanelTitle() { return 'VIEWPORT CONTROLS'; }
  get frameColor() { return 'var(--lcars-sunflower)'; }

  static get styles() {
    return [
      ...super.styles,
      lcarsFocusRing,
      viewportPanelStyles,
    ];
  }

  /* ─── Entity Filtering ─── */

  _getCoverEntries() {
    const allEntries = this._getAllEntities();
    return allEntries.filter(entry => {
      if (entry.domain !== 'cover') return false;
      const dc = entry.state?.attributes?.device_class || '';
      // Exclude security covers — they go to Tactical
      return !TACTICAL_COVER_CLASSES.has(dc);
    });
  }

  /* ─── Badge ─── */

  renderBadge() {
    const covers = this._getCoverEntries();
    const openCount = covers.filter(e => e.state?.state === 'open').length;
    const total = covers.length;
    if (total === 0) return html``;
    const color = openCount > 0 ? 'var(--lcars-sunflower)' : 'var(--lcars-gray)';
    return html`<lcars-summary-badge value="${openCount}/${total} OPEN" color="${color}"></lcars-summary-badge>`;
  }

  /* ─── Render ─── */

  renderContent() {
    const covers = this._getCoverEntries();

    if (covers.length === 0) {
      return html`<div class="viewport-empty">NO VIEWPORT CONTROLS</div>`;
    }

    return html`
      <div class="viewport-content" role="list" aria-label="Viewport controls">
        ${covers.map(entry => this._renderCoverRow(entry))}
      </div>
    `;
  }

  _renderCoverRow(entry) {
    const eid = entry.entity?.entity_id || '';
    const name = entry.state?.attributes?.friendly_name || eid;
    const state = entry.state?.state || 'unknown';
    const position = entry.state?.attributes?.current_position;
    const hasPosition = position !== undefined && position !== null;
    const isOpen = state === 'open';
    const isClosed = state === 'closed';
    const indicatorColor = isOpen ? 'var(--lcars-sunflower)' : 'var(--lcars-gray)';

    const positionText = hasPosition
      ? `${position}%`
      : state.toUpperCase();

    const supportsOpen = (entry.state?.attributes?.supported_features || 0) & 1;
    const supportsClose = (entry.state?.attributes?.supported_features || 0) & 2;
    const supportsStop = (entry.state?.attributes?.supported_features || 0) & 8;

    return html`
      <div class="viewport-cover-row"
           role="listitem"
           tabindex="0"
           aria-label="${name}: ${positionText}"
           @click=${() => showMoreInfo(eid)}
           @keydown=${(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), showMoreInfo(eid))}>
        <span class="viewport-indicator" style="background:${indicatorColor}"></span>
        <span class="viewport-name">${name}</span>
        <span class="viewport-position">${positionText}</span>
        <span class="viewport-controls" @click=${(e) => e.stopPropagation()}>
          ${supportsOpen ? html`
            <button class="viewport-btn"
                    ?data-active=${isOpen}
                    aria-label="Open ${name}"
                    @click=${() => { lcarsAudio.play('coverAction'); this._callService('cover', 'open_cover', { entity_id: eid }); }}>
              ▲
            </button>
          ` : ''}
          ${supportsStop ? html`
            <button class="viewport-btn"
                    aria-label="Stop ${name}"
                    @click=${() => { lcarsAudio.play('coverAction'); this._callService('cover', 'stop_cover', { entity_id: eid }); }}>
              ■
            </button>
          ` : ''}
          ${supportsClose ? html`
            <button class="viewport-btn"
                    ?data-active=${isClosed}
                    aria-label="Close ${name}"
                    @click=${() => { lcarsAudio.play('coverAction'); this._callService('cover', 'close_cover', { entity_id: eid }); }}>
              ▼
            </button>
          ` : ''}
        </span>
      </div>
    `;
  }
}

defineLcars('lcars-viewport-panel', LcarsViewportPanel);
