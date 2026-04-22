/**
 * lcars-camera-panel-styles.js
 *
 * CSS module for <lcars-camera-panel>.
 * Device panel frame, camera feed viewscreen, sensor readouts, control buttons.
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { css } from 'lit-element';

export const cameraPanelStyles = css`
  :host {
    display: block;
    --panel-frame-color: var(--lcars-butterscotch);
    --media-aspect: 16/9;
  }

  .camera-content {
    display: grid;
    grid-template-columns: minmax(10rem, 14rem) minmax(18rem, 1fr);
    grid-template-rows: 1fr auto;
    grid-template-areas:
      "sensors media"
      "controls controls";
    gap: var(--lcars-gap);
  }

  /* Sensor readouts — left column */
  .device-panel-sensors {
    grid-area: sensors;
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
    overflow-y: auto;
    max-height: 20rem;
    padding: 0.25rem;
  }

  /* Media viewscreen — right column */
  .device-panel-media {
    grid-area: media;
    position: relative;
    border: 3px solid var(--panel-frame-color);
    border-radius: 0.5rem;
    overflow: hidden;
    background: var(--lcars-black);
    aspect-ratio: var(--media-aspect);
  }
  .device-panel-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .device-panel-media[data-offline] {
    border-color: var(--lcars-gray);
  }

  /* Control buttons — bottom row */
  .device-panel-controls {
    grid-area: controls;
    display: flex;
    flex-wrap: wrap;
    gap: var(--lcars-gap);
    padding: 0.25rem 0;
  }
  .device-control-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    height: 2.25rem;
    padding: 0 0.75rem;
    background: var(--lcars-sunflower);
    color: var(--lcars-black);
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    cursor: pointer;
    transition: filter var(--lcars-transition), background var(--lcars-transition);
    white-space: nowrap;
  }
  .device-control-btn:hover { filter: brightness(1.15); }
  .device-control-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .device-control-btn ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
  .device-control-btn[data-on] { background: var(--lcars-gold); }
  .device-control-btn[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }

  /* ═══ Camera Feed ═══ */
  .camera-frame {
    position: relative;
    border: 3px solid var(--lcars-butterscotch);
    border-radius: 0.75rem;
    overflow: hidden;
    background: var(--lcars-black);
    cursor: pointer;
    transition: border-color var(--lcars-transition);
  }
  .camera-frame:hover { border-color: var(--lcars-gold); }
  .camera-frame:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .camera-frame img {
    width: 100%;
    display: block;
    aspect-ratio: 16/9;
    object-fit: cover;
    background: var(--lcars-black);
    position: relative;
    z-index: 0;
  }
  .camera-label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    background: linear-gradient(transparent, rgba(0,0,0,0.85));
    color: var(--lcars-sunflower);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    z-index: 3;
  }
  .camera-label ha-icon { --mdc-icon-size: 14px; }
  .camera-label .cam-state {
    margin-left: auto;
    font-size: 0.65rem;
    color: var(--lcars-space-white);
    opacity: 0.7;
  }

  /* Camera state overlays */
  .camera-connecting-overlay,
  .camera-offline-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--lcars-black);
    z-index: 2;
    opacity: 0;
    visibility: hidden;
    transition: opacity 300ms ease-out, visibility 300ms ease-out;
  }
  /* WES-012: Delay showing connecting overlay to avoid flash when cameras load quickly */
  .camera-frame[data-state="connecting"] .camera-connecting-overlay {
    opacity: 1;
    visibility: visible;
    transition: opacity 300ms ease-out 500ms, visibility 300ms ease-out 500ms;
  }
  .camera-frame[data-state="connecting"] .camera-offline-overlay,
  .camera-frame[data-state="offline"] .camera-connecting-overlay {
    opacity: 0;
    visibility: hidden;
  }
  .camera-frame[data-state="offline"] .camera-offline-overlay {
    opacity: 1;
    visibility: visible;
  }
  .camera-connecting-text {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-ice);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    animation: lcars-viewscreen-breathe 4s ease-in-out infinite;
  }
  @keyframes lcars-viewscreen-breathe {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.4; }
  }
  .camera-offline-overlay ha-icon {
    --mdc-icon-size: 32px;
    color: var(--lcars-gray);
  }
  .camera-offline-text {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    animation: cam-text-breathe 4s ease-in-out infinite;
  }
  /* P3 GEORDI-015: last signal timestamp */
  .camera-last-signal {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data, 0.875rem);
    color: var(--lcars-gray);
    text-transform: uppercase;
    margin-top: 0.25rem;
  }
  @keyframes cam-text-breathe {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  /* State-driven visibility for live state */
  .camera-frame[data-state="live"] .camera-connecting-overlay,
  .camera-frame[data-state="live"] .camera-offline-overlay {
    opacity: 0;
    visibility: hidden;
    transition: opacity 300ms ease-out, visibility 300ms ease-out;
  }
  .camera-frame[data-state="offline"] {
    border-color: var(--lcars-gray);
    opacity: 1;
  }
  /* P3 WESLEY-IDEA-002: CRT static effect for offline cameras */
  .camera-frame[data-state="offline"] .camera-offline-overlay {
    background:
      repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px),
      repeating-linear-gradient(90deg, rgba(120,120,120,0.02) 0px, rgba(80,80,80,0.04) 1px, transparent 2px, transparent 3px),
      linear-gradient(180deg, rgba(40,40,40,1) 0%, rgba(25,25,25,1) 100%);
    will-change: background-position;
    animation: cam-static-drift 8s linear infinite;
  }
  @keyframes cam-static-drift {
    from { background-position: 0 0, 0 0, 0 0; }
    to   { background-position: 0 0, 0 -100px, 0 0; }
  }
  .camera-frame[data-state="offline"]:hover { border-color: var(--lcars-gold); }
  .camera-frame[data-state="connecting"] img { opacity: 0; }
  .camera-frame[data-state="offline"] img { opacity: 0; }
  .camera-spacer { aspect-ratio: 16/9; }
  .device-panel-media .camera-frame {
    border: none;
    border-radius: 0;
    width: 100%;
    height: 100%;
  }

  /* Viewscreen activation animation */
  @keyframes viewscreen-activate {
    0%   { clip-path: inset(50% 0 50% 0); filter: brightness(2) saturate(0); }
    40%  { clip-path: inset(10% 0 10% 0); filter: brightness(1.5) saturate(0.3); }
    100% { clip-path: inset(0 0 0 0); filter: brightness(1) saturate(1); }
  }
  .camera-frame[data-state="live"] img {
    animation: viewscreen-activate 600ms ease-out both;
  }
  .camera-frame[data-state="offline"] img {
    filter: saturate(0) brightness(0.3);
    animation: none;
  }

  .device-panel-media img {
    animation: viewscreen-activate 600ms ease-out both;
  }
  .device-panel-media[data-offline] img {
    filter: saturate(0) brightness(0.3);
    animation: none;
  }

  @media (max-width: 30rem) {
    .camera-content {
      grid-template-areas: "media" "sensors" "controls";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .camera-connecting-text { animation: none; }
    .camera-frame[data-state="live"] img { animation: none; }
    .device-panel-media img { animation: none; }
    .camera-frame[data-state="offline"] .camera-offline-overlay { animation: none; }
    .camera-offline-text { animation: none; }
  }

  /* P3 WESLEY-IDEA-011: Disclosure button for hidden sensor tiers */
  .camera-disclosure-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    width: 100%;
    min-height: 24px;
    padding: 0.25rem 0.5rem;
    background: none;
    border: none;
    border-top: 1px solid var(--lcars-gray);
    color: var(--lcars-gray);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-label, 0.75rem);
    text-transform: uppercase;
    cursor: pointer;
    letter-spacing: 0.05em;
  }
  .camera-disclosure-btn:hover { color: var(--lcars-ice); }
  .camera-disclosure-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .disclosure-triangle {
    display: inline-block;
    transition: transform var(--lcars-transition, 200ms);
  }
  .disclosure-triangle[data-open] {
    transform: rotate(90deg);
  }
  .camera-disclosure-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height var(--lcars-transition, 200ms) ease;
  }
  .camera-disclosure-content[data-open] {
    max-height: 50rem;
  }
  .camera-diag-divider {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-gray);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.25rem 0;
    border-bottom: 1px solid var(--lcars-gray);
    margin: 0.25rem 0;
  }

  /* P3 DATA-014 / WESLEY-UX-001: Configure CTA for long-unavailable cameras */
  .camera-config-cta {
    background: var(--lcars-gold);
    color: var(--lcars-black);
  }
  .camera-config-cta:hover { filter: brightness(1.15); }
`;
