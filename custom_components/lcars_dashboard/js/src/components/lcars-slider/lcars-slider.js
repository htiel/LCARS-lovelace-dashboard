/**
 * lcars-slider.js
 *
 * Shared LCARS segmented slider component.
 * Visual: filled segments with black gaps (TNG WARP SYS dimmer pattern)
 * plus a pill-shaped thumb at the fill edge.
 *
 * Events:
 *   lcars-slider-input  — live value during drag (debounce in consumer)
 *   lcars-slider-change — committed value on pointer release / keyboard
 *
 * WCAG: role="slider", keyboard arrows, Home/End, focus-visible.
 * v5.0.0 — Illumination Dashboard
 */
import { defineLcars } from '../../lcars-helpers.js';
import { LitElement, html, css } from 'lit-element';

const SEGMENTS = 16;

class LcarsSlider extends LitElement {

  static get properties() {
    return {
      value:    { type: Number },
      min:      { type: Number },
      max:      { type: Number },
      step:     { type: Number },
      color:    { type: String },
      label:    { type: String },
      disabled: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    this.value = 0;
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.color = 'var(--lcars-sunflower, #ffcc99)';
    this.label = '';
    this.disabled = false;
    this._dragging = false;
    this._boundMove = this._onPointerMove.bind(this);
    this._boundUp = this._onPointerUp.bind(this);
  }

  get _pct() {
    const range = this.max - this.min;
    if (range <= 0) return 0;
    return Math.max(0, Math.min(100, ((this.value - this.min) / range) * 100));
  }

  _valueFromPct(pct) {
    const range = this.max - this.min;
    let val = this.min + (pct / 100) * range;
    val = Math.round(val / this.step) * this.step;
    return Math.max(this.min, Math.min(this.max, val));
  }

  /* ─── Pointer Events ─── */

  _onPointerDown(e) {
    if (this.disabled) return;
    e.preventDefault();
    e.stopPropagation();
    const bar = this.shadowRoot.querySelector('.lcars-slider');
    bar.setPointerCapture(e.pointerId);
    bar.addEventListener('pointermove', this._boundMove);
    bar.addEventListener('pointerup', this._boundUp);
    bar.addEventListener('pointercancel', this._boundUp);
    this._dragging = true;
    this._updateFromPointer(e);
    this.requestUpdate();
  }

  _onPointerMove(e) {
    if (!this._dragging) return;
    this._updateFromPointer(e);
  }

  _onPointerUp(e) {
    if (!this._dragging) return;
    const bar = this.shadowRoot.querySelector('.lcars-slider');
    try { bar.releasePointerCapture(e.pointerId); } catch {}
    bar.removeEventListener('pointermove', this._boundMove);
    bar.removeEventListener('pointerup', this._boundUp);
    bar.removeEventListener('pointercancel', this._boundUp);
    this._dragging = false;
    this._updateFromPointer(e);
    this.dispatchEvent(new CustomEvent('lcars-slider-change', {
      detail: { value: this.value }, bubbles: true, composed: true
    }));
    this.requestUpdate();
  }

  _updateFromPointer(e) {
    const bar = this.shadowRoot.querySelector('.lcars-slider');
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const newVal = this._valueFromPct(pct);
    if (newVal !== this.value) {
      this.value = newVal;
      this.dispatchEvent(new CustomEvent('lcars-slider-input', {
        detail: { value: this.value }, bubbles: true, composed: true
      }));
    }
  }

  /* ─── Keyboard ─── */

  _onKeyDown(e) {
    if (this.disabled) return;
    const step = this.step;
    const bigStep = Math.max(step, Math.round((this.max - this.min) / 4));
    let newVal = this.value;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowUp':
        newVal = Math.min(this.max, this.value + step); break;
      case 'ArrowLeft': case 'ArrowDown':
        newVal = Math.max(this.min, this.value - step); break;
      case 'PageUp':
        newVal = Math.min(this.max, this.value + bigStep); break;
      case 'PageDown':
        newVal = Math.max(this.min, this.value - bigStep); break;
      case 'Home': newVal = this.min; break;
      case 'End':  newVal = this.max; break;
      default: return;
    }
    e.preventDefault();
    e.stopPropagation();
    newVal = Math.round(newVal / this.step) * this.step;
    if (newVal !== this.value) {
      this.value = newVal;
      this.dispatchEvent(new CustomEvent('lcars-slider-input', {
        detail: { value: this.value }, bubbles: true, composed: true
      }));
      this.dispatchEvent(new CustomEvent('lcars-slider-change', {
        detail: { value: this.value }, bubbles: true, composed: true
      }));
    }
  }

  /* ─── Render ─── */

  render() {
    const pct = this._pct;
    return html`
      <div class="lcars-slider ${this._dragging ? 'dragging' : ''}"
           role="slider"
           tabindex="0"
           aria-label="${this.label}"
           aria-valuemin="${this.min}"
           aria-valuemax="${this.max}"
           aria-valuenow="${this.value}"
           aria-valuetext="${Math.round(this.value)}%"
           style="--slider-pct:${pct}%; --slider-color:${this.color}"
           @pointerdown=${this._onPointerDown}
           @keydown=${this._onKeyDown}>
        <div class="lcars-slider__fill"></div>
        <div class="lcars-slider__segments"></div>
        <div class="lcars-slider__thumb"></div>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
        touch-action: none;
        user-select: none;
      }

      :host([disabled]) {
        opacity: 0.4;
        pointer-events: none;
      }

      .lcars-slider {
        position: relative;
        display: flex;
        align-items: center;
        height: 2.5rem;
        border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
        background: rgba(102, 102, 136, 0.15);
        overflow: hidden;
        cursor: pointer;
      }

      .lcars-slider:focus-visible {
        outline: 2px solid var(--lcars-ice, #99ccff);
        outline-offset: 2px;
      }

      /* Flat fill bar — width set by --slider-pct */
      .lcars-slider__fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: var(--slider-pct, 0%);
        background: var(--slider-color, var(--lcars-sunflower, #ffcc99));
        opacity: 0.35;
        transition: width 150ms ease;
        pointer-events: none;
      }

      .dragging .lcars-slider__fill {
        transition: none;
      }

      /* Segment tick marks — black gaps creating |==|==|==| pattern */
      .lcars-slider__segments {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: repeating-linear-gradient(
          to right,
          transparent 0,
          transparent calc(6.25% - 2px),
          var(--lcars-bg, #000) calc(6.25% - 2px),
          var(--lcars-bg, #000) 6.25%
        );
        pointer-events: none;
      }

      /* Pill thumb at fill edge */
      .lcars-slider__thumb {
        position: absolute;
        top: 50%;
        left: var(--slider-pct, 0%);
        transform: translate(-50%, -50%);
        width: 0.75rem;
        height: 1.75rem;
        background: var(--lcars-space-white, #f5f6fa);
        border-radius: var(--lcars-btn-radius, 1.5rem);
        pointer-events: none;
        transition: left 150ms ease;
        box-shadow: 0 0 6px 2px rgba(255, 204, 153, 0.5);
        z-index: 2;
      }

      .dragging .lcars-slider__thumb {
        transition: none;
        box-shadow: 0 0 8px 4px rgba(255, 204, 153, 0.7);
      }

      @media (prefers-reduced-motion: reduce) {
        .lcars-slider__fill,
        .lcars-slider__thumb {
          transition-duration: 0.01ms;
        }
      }
    `;
  }
}

defineLcars('lcars-slider', LcarsSlider);
