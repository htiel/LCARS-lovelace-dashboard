/**
 * lcars-option-strip.js
 *
 * <lcars-option-strip> — Radiogroup selector for mode/preset/arm controls.
 * Unifies climate HVAC mode, fan mode, alarm arm mode, and env preset strips.
 *
 * Attributes/Properties:
 *   options      — Array<{value, label, disabled?}>
 *   value        — Currently selected option value
 *   label        — Container aria-label (accessibility)
 *   accentColor  — CSS color for the selected option
 *
 * Events:
 *   lcars-option-changed (detail: { value }) — fired when selection changes
 *
 * Accessibility (spec §8.3):
 *   Container: role="radiogroup", aria-label from label property
 *   Buttons: role="radio", aria-checked, aria-disabled
 *   Keyboard: Arrow keys move focus, Enter/Space selects
 *
 * Phase 3 — v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { LitElement, html } from 'lit-element';
import { optionStripStyles } from './lcars-option-strip-styles.js';

class LcarsOptionStrip extends LitElement {

  static get properties() {
    return {
      options:     { type: Array },
      value:       { type: String },
      label:       { type: String },
      accentColor: { type: String, attribute: 'accent-color' },
    };
  }

  constructor() {
    super();
    this.options = [];
    this.value = '';
    this.label = '';
    this.accentColor = '';
  }

  static get styles() {
    return [optionStripStyles];
  }

  _handleSelect(optionValue) {
    if (optionValue === this.value) return;
    this.value = optionValue;
    this.dispatchEvent(new CustomEvent('lcars-option-changed', {
      detail: { value: optionValue },
      bubbles: true,
      composed: true,
    }));
  }

  _handleKeydown(e, optionValue, idx) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleSelect(optionValue);
      return;
    }
    const opts = this.options.filter(o => !o.disabled);
    let newIdx = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const curPos = opts.findIndex(o => o.value === optionValue);
      newIdx = (curPos + 1) % opts.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const curPos = opts.findIndex(o => o.value === optionValue);
      newIdx = (curPos - 1 + opts.length) % opts.length;
    }
    if (newIdx >= 0) {
      this._handleSelect(opts[newIdx].value);
      const buttons = this.shadowRoot.querySelectorAll('.option-btn:not([aria-disabled="true"])');
      buttons[newIdx]?.focus();
    }
  }

  render() {
    const accent = this.accentColor ? `--strip-accent:${this.accentColor}` : '';
    return html`
      <div class="option-strip" role="radiogroup" aria-label="${this.label}" style="${accent}">
        ${(this.options || []).map((opt, idx) => {
          const selected = opt.value === this.value;
          const disabled = opt.disabled || false;
          return html`
            <button class="option-btn"
              role="radio"
              aria-checked="${selected}"
              aria-disabled="${disabled}"
              tabindex="${selected ? '0' : '-1'}"
              ?disabled=${disabled}
              @click=${() => !disabled && this._handleSelect(opt.value)}
              @keydown=${(e) => !disabled && this._handleKeydown(e, opt.value, idx)}>
              ${opt.label}
            </button>
          `;
        })}
      </div>
    `;
  }
}

if (!customElements.get('lcars-option-strip')) {
  customElements.define('lcars-option-strip', LcarsOptionStrip);
}
