/**
 * lcars-illumination-panel-styles.js (4X-11)
 *
 * Styles for the Illumination Control panel.
 * Full-width brightness bars, scene strip, circuit rows.
 *
 * Geordi rules: no gradients (flat fill bars), LCARS endcap pills,
 * asymmetric borders, Antonio font, 3-tier font system.
 */
import { css } from 'lit-element';

export const illuminationPanelStyles = css`
  /* ─── Content Container ─── */

  .ilm-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .ilm-empty {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    color: var(--lcars-gray, #666688);
    text-transform: uppercase;
    text-align: center;
    padding: 2rem 1rem;
  }

  /* ─── Light Brightness Bars ─── */

  .ilm-lights {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(20rem, 100%), 1fr));
    gap: 0.375rem;
  }

  .ilm-light-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .ilm-light-bar {
    display: flex;
    align-items: center;
    height: 2.5rem;
    padding: 0 0.75rem;
    border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
    cursor: pointer;
    transition: opacity 200ms ease;
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    text-transform: uppercase;
    position: relative;
    overflow: hidden;
    /* Flat fill bar — no gradients per Bracer Jack Rule 1 */
    background: var(--lcars-gray-alpha, rgba(102, 102, 136, 0.15));
    min-height: 2.5rem;
  }

  .ilm-light-bar::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: var(--brightness, 0%);
    background: var(--bar-color, var(--lcars-sunflower, #ffcc99));
    opacity: 0.25;
    transition: width 300ms ease;
    pointer-events: none;
  }

  .ilm-light-bar.on::before {
    opacity: 0.35;
  }

  .ilm-light-bar:hover {
    opacity: 0.85;
  }

  .ilm-light-bar:active {
    opacity: 0.7;
  }

  /* ─── Indicator Dot ─── */

  .ilm-indicator {
    display: inline-block;
    width: 2px;
    height: 1rem;
    border-radius: 1px;
    background: var(--lcars-gray, #666688);
    margin-right: 0.5rem;
    flex-shrink: 0;
    transition: background 200ms ease;
    z-index: 1;
  }

  .ilm-indicator.active {
    background: var(--lcars-sunflower, #ffcc99);
  }

  /* ─── Light Name & Value ─── */

  .ilm-light-name {
    flex: 1;
    color: var(--lcars-text, #f5f6fa);
    z-index: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ilm-light-bar.off .ilm-light-name {
    color: var(--lcars-gray, #666688);
  }

  .ilm-light-value {
    color: var(--lcars-sunflower, #ffcc99);
    font-variant-numeric: tabular-nums;
    z-index: 1;
    cursor: pointer;
    padding: 0.25rem 0.375rem;
    border-radius: var(--lcars-btn-radius, 1.5rem);
    min-width: 3rem;
    text-align: right;
  }

  .ilm-light-bar.off .ilm-light-value {
    color: var(--lcars-gray, #666688);
  }

  .ilm-light-value:hover {
    background: rgba(245, 246, 250, 0.08);
  }

  /* ─── Brightness Slider ─── */

  .ilm-expanded-controls {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding-bottom: 0.25rem;
  }

  .ilm-slider-row {
    padding: 0.25rem 0.75rem 0.375rem 0.75rem;
  }

  .ilm-slider-row input[type="range"] {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--lcars-gray, #666688);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }

  .ilm-slider-row input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 1.5rem;
    height: 1.5rem;
    background: var(--lcars-sunflower, #ffcc99);
    border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
    border: none;
    cursor: pointer;
  }

  .ilm-slider-row input[type="range"]::-moz-range-thumb {
    width: 1.5rem;
    height: 1.5rem;
    background: var(--lcars-sunflower, #ffcc99);
    border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
    border: none;
    cursor: pointer;
  }

  /* ─── Section Dividers ─── */

  .ilm-section-divider {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.375rem;
  }

  .ilm-section-label {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-gray, #666688);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    white-space: nowrap;
  }

  .ilm-section-line {
    flex: 1;
    height: 0.375rem;
    background: var(--lcars-gray, #666688);
    border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
    opacity: 0.3;
  }

  /* ─── Scene Buttons ─── */

  .ilm-scenes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .ilm-scene-btn {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    text-transform: uppercase;
    color: var(--lcars-black, #000);
    background: var(--lcars-sunflower, #ffcc99);
    border: none;
    padding: 0.375rem 1rem;
    border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 150ms ease;
    min-height: 2rem;
  }

  .ilm-scene-btn:first-child {
    border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 var(--lcars-btn-radius, 1.5rem);
  }

  .ilm-scene-btn:hover {
    opacity: 0.8;
  }

  .ilm-scene-btn:active {
    opacity: 0.6;
  }

  /* ─── Circuit Rows ─── */

  .ilm-circuits {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(20rem, 100%), 1fr));
    gap: 0.375rem;
  }

  .ilm-circuit-row {
    display: flex;
    align-items: center;
    height: 2rem;
    padding: 0 0.75rem;
    cursor: pointer;
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    text-transform: uppercase;
    transition: opacity 200ms ease;
  }

  .ilm-circuit-row:hover {
    opacity: 0.8;
  }

  .ilm-circuit-name {
    flex: 1;
    color: var(--lcars-text, #f5f6fa);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ilm-circuit-row.off .ilm-circuit-name {
    color: var(--lcars-gray, #666688);
  }

  .ilm-circuit-state {
    color: var(--lcars-sunflower, #ffcc99);
    font-variant-numeric: tabular-nums;
    min-width: 2.5rem;
    text-align: right;
  }

  .ilm-circuit-row.off .ilm-circuit-state {
    color: var(--lcars-gray, #666688);
  }

  /* ─── Effect Strip — 2-column grid of LCARS pill buttons ─── */

  .ilm-effects-strip {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.375rem;
    padding: 0.25rem 0.75rem 0.375rem 0.75rem;
  }

  .ilm-effect-btn {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    text-transform: uppercase;
    color: var(--lcars-text, #f5f6fa);
    background: rgba(102, 102, 136, 0.3);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: var(--lcars-btn-radius, 1.5rem);
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 2.5rem;
    transition: opacity 150ms ease;
    text-align: center;
  }

  .ilm-effect-btn.active {
    background: var(--lcars-gold, #ffaa00);
    color: var(--lcars-black, #000);
  }

  .ilm-effect-btn:hover {
    filter: brightness(1.2);
  }

  .ilm-effect-btn:focus-visible {
    outline: 2px solid var(--lcars-sunflower, #ffcc99);
    outline-offset: 2px;
  }

  /* ─── Color Presets — single row of LCARS pills ─── */

  .ilm-color-presets {
    display: flex;
    gap: 0.375rem;
    padding: 0.25rem 0.75rem 0.375rem 0.75rem;
    flex-wrap: wrap;
  }

  .ilm-color-preset {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    text-transform: uppercase;
    color: var(--lcars-black, #000);
    background: var(--preset-color);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: var(--lcars-btn-radius, 1.5rem);
    cursor: pointer;
    white-space: nowrap;
    min-height: 2.5rem;
    flex: 1;
    min-width: 4rem;
    transition: opacity 150ms ease;
    opacity: 0.6;
    text-align: center;
  }

  .ilm-color-preset.active {
    opacity: 1;
    outline: 2px solid var(--lcars-text, #f5f6fa);
    outline-offset: 1px;
  }

  .ilm-color-preset:hover {
    filter: brightness(1.2);
  }

  .ilm-color-preset:focus-visible {
    outline: 2px solid var(--lcars-sunflower, #ffcc99);
    outline-offset: 2px;
  }

  /* ─── Effect name truncation in bar value ─── */

  .ilm-light-value {
    max-width: 8rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ─── Reduced Motion ─── */

  @media (prefers-reduced-motion: reduce) {
    .ilm-light-bar,
    .ilm-light-bar::before,
    .ilm-indicator,
    .ilm-circuit-row,
    .ilm-scene-btn,
    .ilm-effect-btn,
    .ilm-color-preset {
      transition-duration: 0.01ms !important;
    }
  }

  /* ─── Edit Mode: Drag-and-Drop Reorder ─── */

  /* Reorder status bar */
  .ilm-reorder-status {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-gold, #ffaa00);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.25rem 0;
    min-height: 1.25rem;
  }

  /* Grip handle — 3-pip vertical pattern (LCARS-native, Geordi spec) */
  .ilm-grip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    min-width: 2.5rem;
    height: 100%;
    flex-shrink: 0;
    cursor: grab;
    touch-action: none;
    -webkit-touch-callout: none;
    padding: 0 0.5rem;
    margin-right: 0.25rem;
    z-index: 1;
  }

  .ilm-grip span {
    display: block;
    width: 4px;
    height: 4px;
    border-radius: 1px;
    background: var(--lcars-gray, #666688);
    transition: background 150ms ease;
  }

  .ilm-grip:hover span {
    background: var(--lcars-sunflower, #ffcc99);
  }

  .ilm-grip:active {
    cursor: grabbing;
  }

  .ilm-grip:active span {
    background: var(--lcars-gold, #ffaa00);
  }

  /* Dragging state on the active bar */
  .ilm-light-bar.dragging {
    opacity: 0.5;
    z-index: 10;
  }

  /* Edit mode: indicator becomes full-height gold rail */
  :host([edit-mode]) .ilm-light-bar .ilm-indicator {
    height: 100%;
    background: var(--lcars-gold, #ffaa00);
  }
`;
