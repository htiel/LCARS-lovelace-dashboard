// Medical Bay biofunction silhouette path data — extracted so the silhouette
// component can be dashboard-neutral. Hand-authored, gender-neutral; mirrors
// js/src/assets/biofunction-silhouette.svg. Uses 200x480 viewBox (default).

import { svg } from 'lit-html';

export const MEDICAL_SILHOUETTE_PATHS = svg`
  <ellipse cx="100" cy="36" rx="22" ry="28"/>
  <path d="M88 60 L88 78 L112 78 L112 60"/>
  <path d="M88 78 L52 90 L42 200 L36 230 L46 232 L58 200 L66 100"/>
  <path d="M112 78 L148 90 L158 200 L164 230 L154 232 L142 200 L134 100"/>
  <path d="M66 100 L60 240 L82 250"/>
  <path d="M134 100 L140 240 L118 250"/>
  <path d="M82 250 L78 280 L122 280 L118 250"/>
  <path d="M78 280 L72 380 L70 460 L88 460 L92 380 L96 282"/>
  <path d="M122 280 L128 380 L130 460 L112 460 L108 380 L104 282"/>
  <path d="M70 460 L66 470 L92 470 L88 460"/>
  <path d="M130 460 L134 470 L108 470 L112 460"/>
  <line x1="100" y1="64" x2="100" y2="280" stroke-opacity="0.15"/>
`;
