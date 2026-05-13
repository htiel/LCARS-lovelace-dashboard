// Medical Bay biofunction silhouette path data — extracted so the silhouette
// component can be dashboard-neutral. Hand-authored, gender-neutral.
//
// 5.10.0-beta.2 — Wireframe Anatomy / X-Ray Mode redesign per Wesley Option 4.
// 8-head idealized proportions in 200x480 viewBox (1 head = 60px). Landmarks:
// chin y=60, nipples y=120, navel y=180, crotch y=240, knees y=360, ankles y=460.
// Internal anatomy (clavicle, sternum, ribs, cardiac silhouette, diaphragm,
// spine, pelvic ring, femurs, tibias) renders at 35% opacity behind callouts.
// All colors inherit from currentColor; cardiac silhouette uses fill-opacity for
// alert-state recoloring.

import { svg } from 'lit-html';

export const MEDICAL_SILHOUETTE_PATHS = svg`
  <!-- Head + jaw -->
  <ellipse cx="100" cy="30" rx="22" ry="30"/>
  <path d="M82 48 Q100 64 118 48"/>
  <!-- Neck columns -->
  <path d="M92 60 L88 82"/>
  <path d="M108 60 L112 82"/>
  <!-- Trapezius slope to deltoid -->
  <path d="M88 82 Q66 86 46 92"/>
  <path d="M112 82 Q134 86 154 92"/>
  <!-- Outer arm: deltoid → elbow -->
  <path d="M46 92 Q38 130 34 164"/>
  <path d="M154 92 Q162 130 166 164"/>
  <!-- Forearm: elbow → wrist (wrist at crotch level) -->
  <path d="M34 164 Q30 200 28 236"/>
  <path d="M166 164 Q170 200 172 236"/>
  <!-- Hand -->
  <path d="M28 236 Q22 258 26 284 Q34 294 44 288 Q50 272 50 240"/>
  <path d="M172 236 Q178 258 174 284 Q166 294 156 288 Q150 272 150 240"/>
  <!-- Inner arm back to torso -->
  <path d="M50 240 Q52 200 54 164 Q58 130 64 110"/>
  <path d="M150 240 Q148 200 146 164 Q142 130 136 110"/>
  <!-- Pectoral arch -->
  <path d="M64 110 Q100 122 136 110"/>
  <!-- Lateral torso: shoulder → ribcage → waist → hip -->
  <path d="M64 110 Q60 140 64 175 Q70 200 72 215 Q66 230 60 240"/>
  <path d="M136 110 Q140 140 136 175 Q130 200 128 215 Q134 230 140 240"/>
  <!-- Crotch V -->
  <path d="M60 240 Q86 258 100 266 Q114 258 140 240"/>
  <!-- Outer thigh (hip → knee) -->
  <path d="M60 240 Q56 300 68 360"/>
  <path d="M140 240 Q144 300 132 360"/>
  <!-- Inner thigh (crotch → knee inner) -->
  <path d="M100 266 Q94 310 88 360"/>
  <path d="M100 266 Q106 310 112 360"/>
  <!-- Knee caps -->
  <path d="M68 360 Q78 368 88 362"/>
  <path d="M132 360 Q122 368 112 362"/>
  <!-- Calf outer (knee → ankle) -->
  <path d="M68 362 Q60 410 66 458"/>
  <path d="M132 362 Q140 410 134 458"/>
  <!-- Calf inner -->
  <path d="M88 362 Q90 410 88 458"/>
  <path d="M112 362 Q110 410 112 458"/>
  <!-- Ankle + foot -->
  <path d="M66 458 L62 474 Q62 478 70 478 L88 478 Q92 478 92 472 L88 458"/>
  <path d="M134 458 L138 474 Q138 478 130 478 L112 478 Q108 478 108 472 L112 458"/>

  <!-- ===== INTERNAL ANATOMY (X-RAY) — 35% opacity, thinner stroke ===== -->
  <g opacity="0.35" stroke-width="1.4">
    <!-- Clavicle -->
    <path d="M60 94 Q80 100 100 96 Q120 100 140 94"/>
    <!-- Sternum -->
    <line x1="100" y1="108" x2="100" y2="172"/>
    <!-- Ribs (5 pairs) -->
    <path d="M70 118 Q100 124 130 118"/>
    <path d="M68 132 Q100 138 132 132"/>
    <path d="M68 146 Q100 152 132 146"/>
    <path d="M68 160 Q100 166 132 160"/>
    <path d="M70 174 Q100 180 130 174"/>
    <!-- Cardiac silhouette (anchored at heart slot) — fill inherits currentColor -->
    <path d="M84 152 Q78 146 82 140 Q88 136 92 144 Q96 138 100 142 Q104 148 98 154 Q92 164 90 170 Q86 162 84 152 Z"
          fill="currentColor" fill-opacity="0.18"/>
    <!-- Diaphragm arc -->
    <path d="M70 188 Q100 200 130 188"/>
    <!-- Spinal hint (dashed) -->
    <line x1="100" y1="82" x2="100" y2="258" stroke-dasharray="3 3"/>
    <!-- Pelvic ring -->
    <ellipse cx="100" cy="252" rx="24" ry="8"/>
    <!-- Femurs (hip socket → knee) -->
    <line x1="90" y1="262" x2="80" y2="358"/>
    <line x1="110" y1="262" x2="120" y2="358"/>
    <!-- Tibias (knee → ankle) -->
    <line x1="80" y1="368" x2="78" y2="456"/>
    <line x1="120" y1="368" x2="122" y2="456"/>
  </g>
`;
