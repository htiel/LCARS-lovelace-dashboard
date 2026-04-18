/**
 * lcars-power-panel-styles.js
 *
 * CSS module for <lcars-power-panel>.
 * Consolidated power panel — circuit tiles, device rows, power strips,
 * SVG distribution arc, detail popover, track toggles.
 *
 * v4.17.0 Panel Extraction Architecture (4X-3 / 4X-6)
 */
import { css } from 'lit-element';

export const powerPanelStyles = css`
  :host { display: block; }

  /* ═══ Legacy single-device power panel ═══ */
  .power-content {
    display: grid;
    grid-template-areas:
      "arc"
      "summary"
      "circuits"
      "devices"
      "strips";
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto auto;
    gap: var(--lcars-gap);
  }
  .power-content[data-alert="critical"] {
    animation: lcars-distress-pulse var(--lcars-anim-pulse-urgent, 1s) ease-in-out infinite;
  }

  /* ═══ Consolidated power panel ═══ */
  .consolidated-power-content {
    display: flex; flex-direction: column; gap: var(--lcars-gap, 12px);
  }
  .consolidated-power-content[data-alert="critical"] {
    animation: power-critical-pulse 2s ease-in-out infinite;
  }

  /* Header */
  .power-panel-header, .consolidated-power-header {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.25rem 0.75rem; min-height: var(--lcars-bar-h);
  }
  .consolidated-power-header {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: 1.1rem; text-transform: uppercase;
    color: var(--lcars-butterscotch, #ffcc99); letter-spacing: 0.05em;
  }
  .power-panel-header ha-icon, .consolidated-power-header ha-icon {
    --mdc-icon-size: 20px; color: var(--lcars-butterscotch, #ffcc99); flex-shrink: 0;
  }
  .power-panel-name {
    font-size: var(--lcars-font-size-sub); color: var(--lcars-text-heading);
    text-transform: uppercase; letter-spacing: 0.05em;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .power-panel-header-line { flex: 1; height: 2px; background: var(--panel-frame-color, var(--lcars-butterscotch)); }
  .consolidated-power-header .power-panel-header-line { opacity: 0.3; }
  .power-panel-badge {
    font-size: var(--lcars-font-size-data); color: var(--lcars-data-accent, var(--lcars-ice));
    text-transform: uppercase; white-space: nowrap;
  }
  .consolidated-power-header .power-panel-badge { font-size: 0.7rem; opacity: 0.7; }
  .panel-numeric-code { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--panel-frame-color); opacity: 0.7; white-space: nowrap; }

  /* SVG Arc */
  .power-arc-area { grid-area: arc; display: flex; justify-content: center; }
  .power-distribution-arc { width: 100%; max-width: 15rem; height: auto; }

  /* Summary */
  .power-summary {
    grid-area: summary; display: grid;
    grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr)); gap: var(--lcars-gap);
  }
  .power-summary-card {
    display: flex; flex-direction: column; gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    border-left: 3px solid var(--card-accent, var(--lcars-butterscotch));
    border-radius: 0 0.25rem 0.25rem 0; background: rgba(255, 255, 255, 0.03);
    min-width: 8rem;
  }
  .power-summary-label { font-size: var(--lcars-font-size-data); color: var(--lcars-ice); text-transform: uppercase; letter-spacing: 0.05em; }
  .power-summary-value { font-size: var(--lcars-font-size-title); font-weight: 700; text-transform: uppercase; }
  .power-summary-secondary { font-size: var(--lcars-font-size-data); color: var(--lcars-space-white); opacity: 0.8; }

  /* Section labels */
  .power-section-label { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0; margin-top: 0.25rem; }
  .power-section-label-text { font-size: var(--lcars-font-size-sub); color: var(--lcars-text-heading); text-transform: uppercase; white-space: nowrap; flex-shrink: 0; text-wrap: balance; }
  .power-section-label-rule { flex: 1; height: 2px; background: var(--panel-frame-color, var(--lcars-butterscotch)); opacity: 0.5; }
  .power-section-label-count { font-size: var(--lcars-font-size-data); color: var(--lcars-ice); white-space: nowrap; flex-shrink: 0; }

  /* Section accent bars (consolidated) */
  .lcars-consolidated-power-panel .power-circuits-section { border-left: 3px solid var(--lcars-butterscotch, #ffcc99); padding-left: var(--lcars-gap, 12px); }
  .lcars-consolidated-power-panel .power-devices-section { border-left: 3px solid var(--lcars-ice, #99ccff); padding-left: var(--lcars-gap, 12px); }
  .lcars-consolidated-power-panel .power-strips-section { border-left: 3px solid var(--lcars-african-violet, #cc99ff); padding-left: var(--lcars-gap, 12px); }

  /* Circuit tile grid */
  .power-circuits {
    grid-area: circuits; display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
    gap: var(--lcars-gap); max-height: 24rem; overflow-y: auto;
    mask-image: linear-gradient(to bottom, black calc(100% - 2rem), transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 2rem), transparent 100%);
  }
  .lcars-consolidated-power-panel .power-circuits {
    grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr)); gap: 0.5rem;
  }
  .power-circuit-tile {
    display: flex; flex-direction: column; gap: 0.125rem;
    padding: 0.375rem 0.5rem; background: rgba(255, 255, 255, 0.03);
    border-left: 3px solid var(--circuit-color, var(--lcars-ice));
    border-radius: 0 0.25rem 0.25rem 0; cursor: pointer;
    transition: background var(--lcars-transition); min-height: 3rem;
  }
  .power-circuit-tile:hover { background: rgba(255, 255, 255, 0.06); }
  .power-circuit-tile:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .lcars-consolidated-power-panel .power-circuit-tile:focus-visible { outline: 2px solid var(--lcars-sunflower, #ffcc99); outline-offset: -2px; }
  .power-circuit-name { display: flex; align-items: center; gap: 0.375rem; font-size: var(--lcars-font-size-data); color: var(--lcars-space-white); text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .power-circuit-indicator { flex-shrink: 0; font-size: 0.625rem; color: var(--circuit-color, var(--lcars-ice)); }
  .power-circuit-value-row { display: flex; align-items: center; gap: 0.5rem; }
  .power-circuit-watts { font-size: var(--lcars-font-size-data); font-weight: 700; color: var(--circuit-color, var(--lcars-ice)); white-space: nowrap; }
  .power-circuit-energy { font-size: 0.75rem; color: var(--lcars-space-white); opacity: 0.6; text-transform: uppercase; }

  /* Device rows */
  .power-devices { grid-area: devices; display: flex; flex-direction: column; gap: var(--lcars-gap); }
  .power-device-row {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    transition: background var(--lcars-transition); cursor: pointer; min-height: 2.5rem;
  }
  .power-device-row:hover { background: rgba(255, 255, 255, 0.05); }
  .power-device-row:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .power-device-name { flex: 1; font-size: var(--lcars-font-size-data); color: var(--lcars-space-white); text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .power-device-stats { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
  .power-device-watts { font-size: var(--lcars-font-size-data); font-weight: 700; color: var(--circuit-color, var(--lcars-ice)); white-space: nowrap; min-width: 4rem; text-align: right; }
  .power-device-energy { font-size: var(--lcars-font-size-data); color: var(--lcars-space-white); opacity: 0.7; white-space: nowrap; min-width: 4rem; text-align: right; }

  /* Track toggle */
  .lcars-track-toggle {
    position: relative; display: inline-flex; align-items: center;
    width: 3.25rem; height: 1.5rem; border-radius: 0.75rem;
    border: none; cursor: pointer; background: var(--lcars-gray);
    padding: 0 0.25rem; flex-shrink: 0;
    transition: background var(--lcars-transition); overflow: hidden;
  }
  .lcars-track-toggle[data-on] { background: var(--lcars-gold); }
  .lcars-track-toggle .track-label {
    position: absolute; font-family: var(--lcars-font); font-size: var(--lcars-font-size-label, 0.75rem);
    font-weight: 700; text-transform: uppercase; line-height: 1; pointer-events: none;
    transition: left var(--lcars-transition), right var(--lcars-transition), color var(--lcars-transition);
  }
  .lcars-track-toggle:not([data-on]) .track-label { right: 0.35rem; left: auto; color: var(--lcars-space-white); }
  .lcars-track-toggle[data-on] .track-label { left: 0.35rem; right: auto; color: var(--lcars-black); }
  .lcars-track-toggle .track-thumb {
    position: absolute; width: 1.1rem; height: 1.1rem; border-radius: 50%;
    background: var(--lcars-space-white); top: 0.2rem;
    transition: left var(--lcars-transition); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  }
  .lcars-track-toggle:not([data-on]) .track-thumb { left: 0.2rem; }
  .lcars-track-toggle[data-on] .track-thumb { left: calc(100% - 1.3rem); }
  .lcars-track-toggle:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }

  /* Power strip blocks */
  .power-strips { grid-area: strips; display: flex; flex-direction: column; gap: calc(var(--lcars-gap) * 2); }
  .power-strip-block { border: 1px solid var(--lcars-butterscotch); border-left-width: 3px; border-radius: 0.5rem; padding: var(--lcars-gap); }
  .power-strip-header { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; margin-bottom: var(--lcars-gap); }
  .power-strip-name { font-size: var(--lcars-font-size-sub); color: var(--lcars-text-heading); text-transform: uppercase; text-wrap: balance; flex: 1; }
  .power-strip-total { font-size: var(--lcars-font-size-data); color: var(--lcars-butterscotch); font-weight: 700; white-space: nowrap; }
  .power-strip-divider { height: 1px; background: var(--panel-frame-color, var(--lcars-butterscotch)); opacity: 0.3; margin-bottom: var(--lcars-gap); }
  .power-strip-children { display: grid; grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr)); gap: var(--lcars-gap); }
  .power-strip-child-tile { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.375rem 0.5rem; border-left: 3px solid var(--tile-power-color, var(--lcars-gray)); min-height: 3.5rem; }
  .strip-child-controls { display: flex; align-items: center; justify-content: space-between; gap: 0.25rem; }
  .circuit-name { font-size: var(--lcars-font-size-data); color: var(--lcars-space-white); text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .circuit-watts { font-size: var(--lcars-font-size-data); font-weight: 700; white-space: nowrap; }
  .power-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: currentColor; margin-right: 2px; }
  .power-dot[data-zero] { opacity: 0.3; }

  /* Clickable value */
  .power-clickable-value { cursor: pointer; display: inline; }
  .power-clickable-value:hover, .power-clickable-value:focus-visible { text-decoration: underline; text-decoration-style: dashed; text-underline-offset: 2px; }
  .power-clickable-value:focus-visible { outline: 2px solid var(--lcars-sunflower, #ffcc99); outline-offset: 1px; border-radius: 2px; }

  /* Popover */
  .power-detail-popover {
    margin: auto; padding: 0; border: none; background: transparent;
    overflow: visible; max-width: min(26rem, 90vw); min-width: 18rem;
    opacity: 0; transform: translateY(0.5rem) scale(0.98);
    transition: opacity var(--lcars-transition-slow, 300ms) ease-out,
      transform var(--lcars-transition-slow, 300ms) ease-out,
      overlay var(--lcars-transition-slow, 300ms) allow-discrete,
      display var(--lcars-transition-slow, 300ms) allow-discrete;
  }
  .power-detail-popover:popover-open { opacity: 1; transform: translateY(0) scale(1); }
  .power-detail-popover::backdrop { background: rgba(0, 0, 0, 0.5); }
  .popover-content {
    background: var(--lcars-black); border: 2px solid var(--lcars-butterscotch);
    border-left-width: 4px; border-radius: 0.75rem; padding: 0.75rem;
    font-family: var(--lcars-font); color: var(--lcars-text); text-transform: uppercase;
  }
  .popover-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.5rem; border-bottom: 1px solid var(--lcars-gray); margin-bottom: 0.5rem; }
  .popover-title { font-size: var(--lcars-font-size-sub); color: var(--lcars-text-heading); }
  .popover-status { font-size: var(--lcars-font-size-data); font-weight: 700; }
  .popover-hero-value { font-size: 2.5rem; font-weight: 700; text-align: center; padding: 0.5rem 0; }
  .popover-stats { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.5rem 0; }
  .popover-stat-row { display: flex; justify-content: space-between; font-size: var(--lcars-font-size-data); }
  .popover-stat-label { color: var(--lcars-space-white); opacity: 0.7; }
  .popover-stat-value { color: var(--lcars-ice); font-weight: 700; }
  .popover-history-btn {
    width: 100%; margin-top: 0.5rem; display: flex; justify-content: center;
    background: var(--lcars-butterscotch); color: var(--lcars-black); border: none;
    border-radius: var(--lcars-btn-radius); padding: 0.375rem 0.75rem;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
    text-transform: uppercase; cursor: pointer;
  }

  /* Truncation pill */
  .power-show-all-pill {
    display: block; margin: 0.5rem auto 0; padding: 0.25rem 1rem;
    border: 1px solid var(--lcars-gray, #666688);
    border-radius: 0 1.5rem 1.5rem 0;
    background: rgba(153, 153, 153, 0.15); color: var(--lcars-gray, #666688);
    font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.75rem;
    text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer;
    transition: background 200ms ease, color 200ms ease;
  }
  .power-show-all-pill:hover, .power-show-all-pill:focus-visible { background: var(--lcars-gray, #666688); color: var(--lcars-black, #000000); }
  .power-show-all-pill:focus-visible { outline: 2px solid var(--lcars-sunflower, #ffcc99); outline-offset: 2px; }

  .panel-pip-strip { position: absolute; bottom: 4px; right: 4px; width: 2rem; height: 3px; background: var(--panel-frame-color, var(--lcars-butterscotch)); border-radius: 1.5px; opacity: 0.3; }

  /* Scroll-driven tile animations */
  @supports (animation-timeline: view()) {
    .power-circuit-tile {
      animation: circuit-energize linear both;
      animation-timeline: view(); animation-range: entry 0% entry 40%;
    }
    @keyframes circuit-energize {
      from { opacity: 0; border-left-color: var(--lcars-disabled); transform: translateX(-0.25rem); }
      to { opacity: 1; border-left-color: var(--circuit-color, var(--lcars-ice)); transform: translateX(0); }
    }
  }
  @supports not (animation-timeline: view()) {
    .power-circuit-tile { opacity: 1; }
  }

  /* Responsive */
  @media (max-width: 64rem) {
    .power-circuits { grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr)); }
    .lcars-consolidated-power-panel .power-circuits { grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr)); }
    .power-summary { grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr)); }
  }
  @media (max-width: 48rem) {
    .power-circuits { grid-template-columns: 1fr 1fr; max-height: 16rem; }
    .lcars-consolidated-power-panel .power-circuits { grid-template-columns: 1fr 1fr; }
    .power-summary { grid-template-columns: 1fr; }
    .power-device-row { flex-direction: column; align-items: stretch; }
  }
  @media (max-width: 30rem) {
    .power-circuits { grid-template-columns: 1fr; }
    .lcars-consolidated-power-panel .power-circuits { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    .power-panel[data-alert="critical"] { animation: none; border-color: var(--lcars-tomato); }
    .lcars-consolidated-power-panel[data-alert="critical"] { animation: none; border-color: var(--lcars-tomato); }
    .power-circuit-tile { animation: none !important; opacity: 1; }
    .power-circuit-tile, .power-device-row { transition-duration: 0.01ms !important; }
  }
`;
