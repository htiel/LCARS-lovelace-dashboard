/**
 * lcars-media-panel.js
 *
 * Extracted media device panel — album art viewscreen, audio waveform,
 * transport controls, volume slider.
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { html } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { SENSOR_DOMAINS } from '../../lcars-entity-utils.js';
import { getPlaybackStateColor } from '../../lcars-color-utils.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { mediaPanelStyles } from './lcars-media-panel-styles.js';

class LcarsMediaPanel extends LcarsBasePanel {

  get panelType() { return 'media'; }
  get defaultPanelTitle() { return 'Media'; }
  get frameColor() { return 'var(--lcars-african-violet)'; }

  static get styles() {
    return [...super.styles, sharedKeyframes, sharedReducedMotion, mediaPanelStyles];
  }

  _isValidArtworkUrl(url) {
    if (!url) return false;
    return url.startsWith('/api/') || url.startsWith('/local/');
  }

  _getMediaTransportSymbol(state) {
    switch (state) {
      case 'playing': return '▶';
      case 'paused':  return '❚❚';
      default:        return '■';
    }
  }

  _partitionMediaEntities(entries) {
    // Only include media_player and remote entities, plus sensors from the same device
    // that are NOT camera detection sensors (those belong on the camera panel).
    const CAMERA_DETECTION_CLASSES = new Set([
      'motion', 'occupancy', 'sound', 'tamper', 'safety',
      'smoke', 'carbon_monoxide', 'gas', 'door', 'window',
    ]);

    const player = [];
    const sensors = [];
    const controls = [];
    const remotes = [];
    for (const entry of entries) {
      if (entry.domain === 'media_player') { player.push(entry); continue; }
      if (entry.domain === 'remote') { remotes.push(entry); continue; }

      // Skip camera-related binary sensors even if on same device
      if (entry.domain === 'binary_sensor') {
        const dc = entry.state?.attributes?.device_class || '';
        const eid = entry.entity?.entity_id || '';
        // Skip if it has a camera detection device_class
        if (CAMERA_DETECTION_CLASSES.has(dc)) continue;
        // Skip common camera entity patterns
        if (/is_dark|doorbell|person_detected|vehicle_detected|animal_detected|smoke_alarm|co_alarm|baby_cry|speaking|glass_break|siren|car_horn|car_alarm/i.test(eid)) continue;
        sensors.push(entry);
        continue;
      }

      // Skip camera domain entirely
      if (entry.domain === 'camera') continue;

      if (SENSOR_DOMAINS.has(entry.domain)) { sensors.push(entry); continue; }
      controls.push(entry);
    }
    return { player, sensors, controls, remotes };
  }

  _handleMediaService(entityId, service, data = {}) {
    this.hass.callService('media_player', service, { entity_id: entityId, ...data });
  }

  _handleVolumeChange(entityId, e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    this._handleMediaService(entityId, 'volume_set', { volume_level: Math.round(pct * 100) / 100 });
  }

  renderBadge() {
    const mp = this.group?.entities?.find(e => e.domain === 'media_player');
    if (!mp) return html``;
    const playerState = mp.state?.state || 'unavailable';
    const stateColor = getPlaybackStateColor(playerState);
    const transportSymbol = this._getMediaTransportSymbol(playerState);
    return html`<span style="color:${stateColor}">${transportSymbol} ${playerState.toUpperCase()}</span>`;
  }

  renderContent() {
    const { player, sensors } = this._partitionMediaEntities(this.group.entities);
    const deviceName = this._shortDeviceName(this.group.device) || 'Media';

    if (player.length === 0) return html``;

    // 4X-43: Designate primary player (playing > paused > first) and secondary speakers
    const primary = this._selectPrimary(player);
    const secondaries = player.filter(e => e !== primary);
    const ms = primary.state;
    const attrs = ms?.attributes || {};
    const playerState = ms?.state || 'unavailable';
    const stateColor = getPlaybackStateColor(playerState);
    const transportSymbol = this._getMediaTransportSymbol(playerState);
    const isPlaying = playerState === 'playing';
    const isPaused = playerState === 'paused';
    const isIdle = !isPlaying && !isPaused;
    const artUrl = attrs.entity_picture;
    const validArt = this._isValidArtworkUrl(artUrl);
    const title = attrs.media_title || '';
    const artist = attrs.media_artist || '';
    const source = attrs.source || '';
    const volume = attrs.volume_level != null ? Number(attrs.volume_level) : 0;
    const isMuted = attrs.is_volume_muted || false;
    const features = attrs.supported_features || 0;
    const supportsPrev = (features & 16) !== 0;
    const supportsNext = (features & 32) !== 0;
    const supportsVolume = (features & 4) !== 0;
    const supportsShuffle = (features & 32768) !== 0;
    const supportsRepeat = (features & 262144) !== 0;
    const shuffle = attrs.shuffle || false;
    const repeat = attrs.repeat || 'off';

    return html`
      <div class="media-content ${isIdle ? 'media-idle' : ''}">

        <div class="media-metadata" role="list" aria-label="${deviceName} info">
          ${source ? html`<div class="device-sensor-line" role="listitem"><div class="sensor-indicator" style="background:var(--lcars-african-violet)"></div><span class="sensor-label">Source</span><span class="sensor-state-value">${source}</span></div>` : ''}
          ${supportsShuffle ? html`<div class="device-sensor-line" role="listitem"><div class="sensor-indicator" style="background:${shuffle ? 'var(--lcars-african-violet)' : 'var(--lcars-gray)'}"></div><span class="sensor-label">Shuffle</span><span class="sensor-state-value">${shuffle ? 'ON' : 'OFF'}</span></div>` : ''}
          ${supportsRepeat ? html`<div class="device-sensor-line" role="listitem"><div class="sensor-indicator" style="background:${repeat !== 'off' ? 'var(--lcars-african-violet)' : 'var(--lcars-gray)'}"></div><span class="sensor-label">Repeat</span><span class="sensor-state-value">${repeat.toUpperCase()}</span></div>` : ''}
          ${sensors.map(({ entity, state }) => {
            const name = this._friendlyName(state, entity);
            const color = this._getSensorIndicatorColor(state);
            return html`
              <div class="device-sensor-line" tabindex="0" role="listitem"
                @click=${() => this._handleEntityClick(entity.entity_id)}
                @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(entity.entity_id); } }}>
                <div class="sensor-indicator" style="background:${color}"></div>
                <span class="sensor-label">${name}</span>
                <span class="sensor-state-value" style="color:${color}">${state.state}</span>
              </div>
            `;
          })}
        </div>

        <div class="media-viewscreen ${isPlaying ? 'media-viewscreen-glow' : ''}" @click=${() => this._handleEntityClick(primary.entity.entity_id)}>
          ${validArt && !isIdle ? html`
            <img class="media-art" src="${artUrl}" alt="Album art"
              crossorigin="anonymous" referrerpolicy="no-referrer" loading="lazy"
              @error=${(e) => { e.target.style.display = 'none'; }} />
          ` : html`
            <div class="media-idle-display">
              <span class="media-idle-glyph">&#9834;</span>
              <span class="media-idle-label">STANDBY</span>
            </div>
          `}
          ${!isIdle ? html`
            <div class="media-now-playing">
              ${title ? html`<div class="media-title">${title}</div>` : ''}
              ${artist ? html`<div class="media-artist">${artist}</div>` : ''}
            </div>
          ` : ''}
        </div>

        <div class="lcars-audio-waveform" ?data-paused=${!isPlaying} aria-hidden="true">
          ${Array.from({ length: 12 }, (_, i) => {
            const group = Math.floor(i / 3);
            const baseDur = [380, 420, 350, 460][group];
            return html`<div class="bar ${i === 2 || i === 8 ? 'peak' : ''}"
              style="--bar-dur:${baseDur + (i % 3) * 30}ms;--bar-delay:${i * 50}ms;--bar-min-ratio:${0.1 + group * 0.05}"></div>`;
          })}
        </div>

        <div class="media-controls">
          <div class="media-transport" role="toolbar" aria-label="Transport controls">
            ${supportsShuffle ? html`<button class="media-transport-btn" aria-pressed="${shuffle}" title="Shuffle" @click=${() => this._handleMediaService(primary.entity.entity_id, 'shuffle_set', { shuffle: !shuffle })}>⇄</button>` : ''}
            ${supportsPrev ? html`<button class="media-transport-btn" title="Previous" @click=${() => this._handleMediaService(primary.entity.entity_id, 'media_previous_track')}>⏮</button>` : ''}
            <button class="media-transport-btn media-play-btn" title="${isPlaying ? 'Pause' : 'Play'}"
              @click=${() => this._handleMediaService(primary.entity.entity_id, isPlaying ? 'media_pause' : 'media_play')}>
              ${isPlaying ? '❚❚' : '▶'}
            </button>
            ${supportsNext ? html`<button class="media-transport-btn" title="Next" @click=${() => this._handleMediaService(primary.entity.entity_id, 'media_next_track')}>⏭</button>` : ''}
            ${supportsRepeat ? html`<button class="media-transport-btn" aria-pressed="${repeat !== 'off'}" title="Repeat: ${repeat}" @click=${() => this._handleMediaService(primary.entity.entity_id, 'repeat_set', { repeat: repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off' })}>🔁</button>` : ''}
          </div>
          ${supportsVolume ? html`
            <div class="media-volume" aria-label="Volume: ${Math.round(volume * 100)}%">
              <button class="media-mute-btn" aria-pressed="${isMuted}" title="${isMuted ? 'Unmute' : 'Mute'}"
                @click=${() => this._handleMediaService(primary.entity.entity_id, 'volume_mute', { is_volume_muted: !isMuted })}>
                ${isMuted ? '🔇' : '🔊'}
              </button>
              <div class="media-volume-bar" tabindex="0" role="slider"
                aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(volume * 100)}"
                @click=${(e) => this._handleVolumeChange(primary.entity.entity_id, e)}
                @keydown=${(e) => {
                  if (e.key === 'ArrowRight') { e.preventDefault(); this._handleMediaService(primary.entity.entity_id, 'volume_set', { volume_level: Math.min(1, volume + 0.05) }); }
                  if (e.key === 'ArrowLeft') { e.preventDefault(); this._handleMediaService(primary.entity.entity_id, 'volume_set', { volume_level: Math.max(0, volume - 0.05) }); }
                  if (e.key === 'Home') { e.preventDefault(); this._handleMediaService(primary.entity.entity_id, 'volume_set', { volume_level: 0 }); }
                  if (e.key === 'End') { e.preventDefault(); this._handleMediaService(primary.entity.entity_id, 'volume_set', { volume_level: 1 }); }
                  if (e.key === 'PageUp') { e.preventDefault(); this._handleMediaService(primary.entity.entity_id, 'volume_set', { volume_level: Math.min(1, volume + 0.1) }); }
                  if (e.key === 'PageDown') { e.preventDefault(); this._handleMediaService(primary.entity.entity_id, 'volume_set', { volume_level: Math.max(0, volume - 0.1) }); }
                }}>
                <div class="media-volume-fill" style="width:${Math.round(volume * 100)}%"></div>
              </div>
              <span class="media-volume-pct">${Math.round(volume * 100)}%</span>
            </div>
          ` : ''}
        </div>
      </div>

      ${secondaries.length > 0 ? this._renderSecondaryOutputs(secondaries) : ''}
    `;
  }

  /* ─── 4X-43: Select primary player (playing > paused > most features > first) ─── */

  _selectPrimary(players) {
    const playing = players.find(e => e.state?.state === 'playing');
    if (playing) return playing;
    const paused = players.find(e => e.state?.state === 'paused');
    if (paused) return paused;
    // Prefer the one with the most supported features (Apple TV > HomePod)
    return players.reduce((best, cur) => {
      const bestFeatures = best.state?.attributes?.supported_features || 0;
      const curFeatures = cur.state?.attributes?.supported_features || 0;
      return curFeatures > bestFeatures ? cur : best;
    }, players[0]);
  }

  /* ─── 4X-43: Render secondary speaker outputs (HomePods, etc.) ─── */

  _renderSecondaryOutputs(secondaries) {
    return html`
      <div class="media-secondary-outputs" role="list" aria-label="Additional speakers">
        ${secondaries.map(entry => {
          const eid = entry.entity?.entity_id || '';
          const name = entry.state?.attributes?.friendly_name || eid;
          const state = entry.state?.state || 'unavailable';
          const volume = entry.state?.attributes?.volume_level != null
            ? Number(entry.state.attributes.volume_level) : 0;
          const isMuted = entry.state?.attributes?.is_volume_muted || false;
          const isPlaying = state === 'playing';
          const isPaused = state === 'paused';
          const supportsVolume = ((entry.state?.attributes?.supported_features || 0) & 4) !== 0;
          const stateColor = getPlaybackStateColor(state);
          const transportSymbol = this._getMediaTransportSymbol(state);

          return html`
            <div class="media-secondary-row" role="listitem"
                 tabindex="0"
                 aria-label="${name}: ${state}"
                 @click=${() => this._handleEntityClick(eid)}
                 @keydown=${(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), this._handleEntityClick(eid))}>
              <span class="media-secondary-indicator" style="background:${stateColor}"></span>
              <span class="media-secondary-name">${name}</span>
              <span class="media-secondary-state" style="color:${stateColor}">${transportSymbol}</span>
              ${isPlaying || isPaused ? html`
                <button class="media-secondary-playpause"
                        aria-label="${isPlaying ? 'Pause' : 'Play'} ${name}"
                        @click=${(e) => { e.stopPropagation(); this._handleMediaService(eid, isPlaying ? 'media_pause' : 'media_play'); }}>
                  ${isPlaying ? '❚❚' : '▶'}
                </button>
              ` : ''}
              ${supportsVolume ? html`
                <div class="media-secondary-volume">
                  <div class="media-volume-bar" tabindex="0" role="slider"
                    aria-label="${name} volume"
                    aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(volume * 100)}"
                    @click=${(e) => { e.stopPropagation(); this._handleVolumeChange(eid, e); }}>
                    <div class="media-volume-fill" style="width:${Math.round(volume * 100)}%"></div>
                  </div>
                  <span class="media-volume-pct">${Math.round(volume * 100)}%</span>
                </div>
              ` : ''}
            </div>
          `;
        })}
      </div>
    `;
  }
}

if (!customElements.get('lcars-media-panel')) {
  customElements.define('lcars-media-panel', LcarsMediaPanel);
}
