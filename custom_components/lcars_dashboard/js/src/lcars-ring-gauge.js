/**
 * lcars-ring-gauge.js — Shared SVG ring gauge renderer.
 * Used by Life Support, Tactical, and Engineering dashboard cards.
 */
import { svg } from 'lit-element';

/**
 * Render a flat LCARS-compliant SVG ring gauge (no glows, no drop-shadows).
 * @param {number} value - Current value
 * @param {number} max - Maximum value
 * @param {number} size - SVG size in pixels (64, 80, 96)
 * @param {string} color - Hex color for stroke and text (e.g. '#99ccff')
 * @param {string} label - Center label text (e.g. '85%')
 * @param {string} sublabel - Sublabel below center (e.g. 'CHARGING')
 * @returns {import('lit-element').TemplateResult}
 */
export function renderRingGauge(value, max, size, color, label, sublabel) {
  const strokeW = 8;
  const r = (size - strokeW * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  const dashOffset = circumference * (1 - pct);
  const cx = size / 2, cy = size / 2;
  const trackColor = `${color}22`;
  return svg`
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="ring-gauge"
         role="meter" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="${max}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${trackColor}" stroke-width="${strokeW}" />
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeW}"
              stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
              stroke-linecap="butt" transform="rotate(-90 ${cx} ${cy})"
              style="transition: stroke-dashoffset 500ms ease" />
      <text x="${cx}" y="${cy - 5}" text-anchor="middle" dominant-baseline="central"
            class="ring-value" style="fill:${color}">${label}</text>
      ${sublabel ? svg`<text x="${cx}" y="${cy + 11}" text-anchor="middle" dominant-baseline="central"
            class="ring-sublabel" style="fill:${color}; opacity:0.7">${sublabel}</text>` : ''}
    </svg>`;
}
