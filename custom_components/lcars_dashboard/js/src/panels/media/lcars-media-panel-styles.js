/**
 * lcars-media-panel-styles.js
 *
 * CSS module for <lcars-media-panel>.
 * Album art viewscreen, audio waveform, transport controls, volume bar.
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { css } from 'lit-element';

export const mediaPanelStyles = css`
  :host { display: block; }

  .lcars-device-panel {
    --panel-frame-color: var(--lcars-african-violet);
    display: grid;
    gap: var(--lcars-gap);
    width: 100%; max-width: 42rem;
    border-left: 4px solid var(--panel-frame-color);
    border-bottom: 4px solid var(--panel-frame-color);
    border-top: 2px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0.75rem 0.25rem 0.25rem 0.75rem;
    padding: var(--lcars-gap);
    background: var(--lcars-black);
    position: relative;
  }
  .lcars-device-panel::before {
    content: ''; position: absolute;
    top: -2px; left: -4px; width: 1.5rem; height: 1.5rem;
    border-top: 4px solid var(--panel-frame-color);
    border-left: 4px solid var(--panel-frame-color);
    border-radius: 0.75rem 0 0 0; pointer-events: none;
  }
  .lcars-device-panel::after {
    content: ''; position: absolute;
    bottom: -4px; right: -2px; width: 1.5rem; height: 1.5rem;
    border-bottom: 4px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0 0 0.25rem 0; pointer-events: none;
  }

  .media-content {
    display: grid;
    grid-template-areas:
      "metadata media"
      "waveform waveform"
      "volume   volume";
    grid-template-columns: minmax(8rem, 1fr) minmax(14rem, 2.5fr);
    grid-template-rows: 1fr auto auto;
    gap: var(--lcars-gap);
    transition: border-color 600ms;
  }
  .media-idle { opacity: 0.7; }

  .media-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
  .device-panel-name { font-size: var(--lcars-font-size-sub); color: var(--panel-frame-color); text-transform: uppercase; white-space: nowrap; }
  .device-panel-header-line { flex: 1; height: 2px; background: var(--panel-frame-color); opacity: 0.5; }
  .media-state-badge { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; }
  .panel-numeric-code { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--panel-frame-color); opacity: 0.7; white-space: nowrap; }

  .media-metadata { grid-area: metadata; overflow-y: auto; }
  .device-sensor-line { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; cursor: pointer; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; transition: background var(--lcars-transition); font-size: var(--lcars-font-size-data); text-transform: uppercase; }
  .device-sensor-line:hover { background: rgba(255,255,255,0.05); }
  .device-sensor-line:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .sensor-indicator { width: 0.5rem; height: 0.5rem; border-radius: 50%; flex-shrink: 0; }
  .sensor-label { flex: 1; color: var(--lcars-space-white); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
  .sensor-state-value { flex-shrink: 0; font-weight: 700; font-size: var(--lcars-font-size-data); }

  /* Viewscreen */
  .media-viewscreen {
    grid-area: media; display: flex; flex-direction: column;
    border: 2px solid var(--panel-frame-color); border-radius: 4px;
    overflow: hidden; cursor: pointer; position: relative;
  }
  .media-viewscreen::before, .media-viewscreen::after {
    content: ''; position: absolute; width: 1.5rem; height: 1.5rem;
    border: 2px solid var(--panel-frame-color); z-index: 1;
  }
  .media-viewscreen::before { top: 4px; left: 4px; border-right: none; border-bottom: none; }
  .media-viewscreen::after { bottom: 4px; right: 4px; border-left: none; border-top: none; }
  .media-art { width: 100%; aspect-ratio: 1/1; max-height: 18rem; object-fit: cover; }
  .media-idle-display { display: flex; flex-direction: column; align-items: center; justify-content: center; aspect-ratio: 1/1; max-height: 12rem; color: var(--lcars-gray); }
  .media-idle-glyph { font-size: 3rem; }
  .media-idle-label { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); }
  .media-now-playing { padding: 0.5rem; background: rgba(0,0,0,0.5); }
  .media-title { font-family: var(--lcars-font); font-size: var(--lcars-font-size-sub); color: var(--lcars-sunflower); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .media-artist { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-african-violet); }
  .media-viewscreen-glow { box-shadow: 0 0 12px 4px var(--lcars-african-violet); animation: lcars-media-glow 3s ease-in-out infinite; }
  @keyframes lcars-media-glow {
    0%, 100% { box-shadow: 0 0 6px 2px var(--lcars-african-violet); }
    50%      { box-shadow: 0 0 14px 6px var(--lcars-african-violet); }
  }

  /* Audio waveform */
  .lcars-audio-waveform {
    grid-area: waveform;
    display: flex; align-items: flex-end; justify-content: center;
    gap: 2px; height: 32px; overflow: hidden;
  }
  .lcars-audio-waveform .bar {
    width: 2px; border-radius: 1px 1px 0 0;
    background: var(--lcars-ice); height: 60%;
    transform-origin: bottom; transform: scaleY(var(--bar-min-ratio, 0.17));
    will-change: transform;
    animation: lcars-waveform var(--bar-dur, 400ms) ease-in-out alternate infinite;
    animation-delay: var(--bar-delay, 0ms);
  }
  .lcars-audio-waveform .bar.peak { background: var(--lcars-tomato); }
  .lcars-audio-waveform[data-paused] .bar { animation-play-state: paused; transform: scaleY(0.03); opacity: 0.3; }
  @keyframes lcars-waveform { 0% { transform: scaleY(var(--bar-min-ratio, 0.17)); } 100% { transform: scaleY(1); } }

  /* Controls */
  .media-controls { grid-area: volume; display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem; }
  .media-transport { display: flex; justify-content: center; gap: var(--lcars-gap); }
  .media-transport-btn {
    width: 2.5rem; height: 2.5rem; border: none; border-radius: 50%;
    background: var(--lcars-disabled); color: var(--lcars-space-white);
    font-size: 1rem; cursor: pointer; transition: background 200ms;
  }
  .media-transport-btn:hover { background: var(--lcars-gray); }
  .media-transport-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .media-play-btn { width: 3.5rem; background: var(--lcars-african-violet); color: var(--lcars-black); }
  .media-transport-btn[aria-pressed="true"] { background: var(--lcars-african-violet); color: var(--lcars-black); }
  .media-volume { display: flex; align-items: center; gap: 0.5rem; }
  .media-mute-btn { border: none; background: transparent; font-size: 1.25rem; cursor: pointer; }
  .media-volume-bar { flex: 1; height: 0.75rem; background: var(--lcars-disabled); border-radius: var(--lcars-btn-radius); cursor: pointer; position: relative; overflow: hidden; }
  .media-volume-bar:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .media-volume-fill { height: 100%; background: var(--lcars-african-violet); border-radius: inherit; transition: width 200ms; }
  .media-volume-pct { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-data-accent); min-width: 3rem; text-align: right; }

  .panel-pip-strip { position: absolute; bottom: 4px; right: 4px; width: 2rem; height: 3px; background: var(--panel-frame-color); border-radius: 1.5px; opacity: 0.3; }

  @media (max-width: 30rem) {
    .media-content {
      grid-template-areas: "media" "metadata" "waveform" "volume";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .lcars-audio-waveform .bar { animation: none !important; transform: scaleY(0.17); }
    .media-viewscreen-glow { animation: none; }
  }
`;
