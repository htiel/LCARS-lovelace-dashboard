/**
 * lcars-camera-tile.js
 *
 * Token-safe LCARS camera tile (issue #99, #223).
 *
 * Two render modes — selected by the `mode` attribute:
 *   mode="stream"  → <ha-camera-stream> for focused viewscreens / dwell views
 *   mode="snap"    → fetch(/api/camera_proxy) + Blob + URL.createObjectURL
 *                    for grid tiles (instant frame, no HLS latency)
 *
 * Hybrid rationale: stream-only has 2–6 s HLS handshake (bad in grid);
 * blob-only cannot carry MJPEG (blob can't be a long-lived multipart).
 * See specs/LCARS-CAMERA-TOKEN-MIGRATION-SPEC.md §2.
 *
 * State machine: ESTABLISHING → LIVE / OFFLINE.
 *   8 s connect timeout → OFFLINE
 *   while OFFLINE: 30 s auto-retry
 *   onLoad / onCanPlay → LIVE
 *
 * Security: NEVER puts access_token in URL. NEVER logs payload. Revokes
 * blob URLs on every refresh + on disconnect.
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';

const CONNECT_TIMEOUT_MS = 8000;
const RETRY_INTERVAL_MS = 30000;
const ACTIVE_REFRESH_MS = 3000;
const IDLE_REFRESH_MS = 30000;

export class LcarsCameraTile extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      entityId: { type: String, attribute: 'entity-id' },
      mode: { type: String, reflect: true },        // 'stream' | 'snap'
      label: { type: String },
      active: { type: Boolean, reflect: true },     // motion / detection → faster refresh
      _state: { state: true },                      // 'establishing' | 'live' | 'offline'
      _blobUrl: { state: true },
      _streamElement: { state: true },
    };
  }

  static get styles() {
    return [
      lcarsBaseStyles,
      css`
        :host {
          display: block;
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #000;
        }
        .frame, ::slotted(img), .frame img, .frame ha-camera-stream {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 0.25rem;
          background: rgba(0,0,0,0.85);
          color: var(--lcars-butterscotch, #ff9966);
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          text-transform: uppercase; letter-spacing: 0.1em;
          font-size: 0.75rem;
          pointer-events: none;
          transition: opacity 200ms ease;
        }
        .overlay.hidden { opacity: 0; }
        .establishing-text::after {
          content: ''; display: inline-block; width: 0;
          animation: lcars-cam-dots 1.2s infinite steps(4);
        }
        @keyframes lcars-cam-dots {
          0%   { content: ''; }
          25%  { content: '.'; }
          50%  { content: '..'; }
          75%  { content: '...'; }
          100% { content: ''; }
        }
        .offline-text { color: var(--lcars-tomato, #ff5555); }
        @media (prefers-reduced-motion: reduce) {
          .establishing-text::after { animation: none; content: '...'; }
        }
      `
    ];
  }

  constructor() {
    super();
    this.mode = 'snap';
    this.active = false;
    this._state = 'establishing';
    this._blobUrl = null;
    this._streamElement = null;
    this._connectTimer = null;
    this._retryTimer = null;
    this._refreshTimer = null;
    this._abortCtrl = null;
    this._streamAvailable = (typeof customElements !== 'undefined') && !!customElements.get('ha-camera-stream');
  }

  connectedCallback() {
    super.connectedCallback();
    this._armConnectTimeout();
    if (this.mode === 'snap') {
      this._refreshSnap();
    } else {
      this._setupStream();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._teardown();
  }

  updated(changed) {
    if (changed.has('entityId') || changed.has('mode')) {
      this._teardown();
      this._state = 'establishing';
      this._armConnectTimeout();
      if (this.mode === 'snap') this._refreshSnap();
      else this._setupStream();
    } else if (changed.has('active') && this.mode === 'snap' && this._state === 'live') {
      this._scheduleNextRefresh();
    }
  }

  _teardown() {
    if (this._connectTimer) { clearTimeout(this._connectTimer); this._connectTimer = null; }
    if (this._retryTimer) { clearTimeout(this._retryTimer); this._retryTimer = null; }
    if (this._refreshTimer) { clearTimeout(this._refreshTimer); this._refreshTimer = null; }
    if (this._abortCtrl) { try { this._abortCtrl.abort(); } catch (_) {} this._abortCtrl = null; }
    if (this._blobUrl) { try { URL.revokeObjectURL(this._blobUrl); } catch (_) {} this._blobUrl = null; }
    this._streamElement = null;
  }

  _armConnectTimeout() {
    if (this._connectTimer) clearTimeout(this._connectTimer);
    this._connectTimer = setTimeout(() => {
      if (this._state !== 'live') this._goOffline();
    }, CONNECT_TIMEOUT_MS);
  }

  _scheduleRetry() {
    if (this._retryTimer) clearTimeout(this._retryTimer);
    this._retryTimer = setTimeout(() => {
      if (!this.isConnected) return;
      this._state = 'establishing';
      this._armConnectTimeout();
      if (this.mode === 'snap') this._refreshSnap();
      else this._setupStream();
    }, RETRY_INTERVAL_MS);
  }

  _scheduleNextRefresh() {
    if (this.mode !== 'snap') return;
    if (this._refreshTimer) clearTimeout(this._refreshTimer);
    const interval = this.active ? ACTIVE_REFRESH_MS : IDLE_REFRESH_MS;
    this._refreshTimer = setTimeout(() => {
      if (this.isConnected) this._refreshSnap();
    }, interval);
  }

  _goLive() {
    if (this._connectTimer) { clearTimeout(this._connectTimer); this._connectTimer = null; }
    if (this._retryTimer) { clearTimeout(this._retryTimer); this._retryTimer = null; }
    this._state = 'live';
    this._scheduleNextRefresh();
  }

  _goOffline() {
    if (this._connectTimer) { clearTimeout(this._connectTimer); this._connectTimer = null; }
    this._state = 'offline';
    this._scheduleRetry();
  }

  async _refreshSnap() {
    if (!this.entityId || !this.isConnected) return;
    if (this._abortCtrl) { try { this._abortCtrl.abort(); } catch (_) {} }
    this._abortCtrl = new AbortController();
    const ctrl = this._abortCtrl;
    try {
      const url = `/api/camera_proxy/${encodeURIComponent(this.entityId)}`;
      const resp = await fetch(url, {
        credentials: 'include',
        signal: ctrl.signal,
        headers: { 'Accept': 'image/jpeg,image/png,image/*;q=0.8' },
      });
      if (ctrl.signal.aborted) return;
      if (!resp.ok) { this._goOffline(); return; }
      const blob = await resp.blob();
      if (ctrl.signal.aborted) return;
      const next = URL.createObjectURL(blob);
      const prev = this._blobUrl;
      this._blobUrl = next;
      this.requestUpdate();
      // Revoke prev only after the new frame is painted to avoid flash
      if (prev) {
        requestAnimationFrame(() => {
          try { URL.revokeObjectURL(prev); } catch (_) {}
        });
      }
      this._goLive();
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      this._goOffline();
    }
  }

  _setupStream() {
    if (!this.entityId || !this.hass) return;
    if (!this._streamAvailable) {
      // Feature-detect fallback — silently drop to snap mode
      this.mode = 'snap';
      this._refreshSnap();
      return;
    }
    const el = document.createElement('ha-camera-stream');
    el.hass = this.hass;
    el.stateObj = this.hass.states?.[this.entityId];
    el.controls = false;
    el.muted = true;
    el.allowExoPlayer = true;
    el.addEventListener('load', () => this._goLive(), { once: true });
    el.addEventListener('canplay', () => this._goLive(), { once: true });
    el.addEventListener('error', () => this._goOffline(), { once: true });
    this._streamElement = el;
    this.requestUpdate();
  }

  render() {
    const isLive = this._state === 'live';
    const isEstablishing = this._state === 'establishing';
    const isOffline = this._state === 'offline';

    let frame = '';
    if (this.mode === 'stream' && this._streamElement) {
      // Append stream element manually so we can manage its lifecycle
      frame = html`<div class="frame" .innerStream=${this._streamElement}>${this._streamElement}</div>`;
    } else if (this._blobUrl) {
      frame = html`<img class="frame" src=${this._blobUrl}
                        alt=${this.label || this.entityId || 'camera'}
                        @load=${this._goLive}
                        @error=${this._goOffline} />`;
    }

    return html`
      ${frame}
      <div class="overlay ${isLive ? 'hidden' : ''}" aria-live="polite">
        ${isEstablishing
          ? html`<span class="establishing-text">ESTABLISHING LINK</span>`
          : isOffline
            ? html`<span class="offline-text">VIEWSCREEN OFFLINE</span>`
            : ''}
      </div>
    `;
  }

  // ── Lifecycle hooks for hidden-tab pause ──
  static get _docListenersInstalled() { return LcarsCameraTile.__docListeners === true; }
}

customElements.define('lcars-camera-tile', LcarsCameraTile);
