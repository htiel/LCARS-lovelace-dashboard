# LCARS Tactical Dashboard Spec (5X-2.2)

> Security / Tactical — "Single pane of glass" for all security entities.
> Frame color: `--lcars-ice` (#99ccff). Sidebar: african-violet.
> Filters: ALL / ACCESS / ZONES

---

## §1 Entity Scope

| Domain | Device Classes | Count (this instance) |
|--------|---------------|----------------------|
| `alarm_control_panel` | — | 1 |
| `lock` | — | 0 |
| `camera` | — | 7 (UniFi Protect) |
| `binary_sensor` | door, window | 20+ (Insteon entry sensors) |
| `binary_sensor` | motion, occupancy | 8+ (camera motion sensors) |
| `binary_sensor` | smoke | 4+ (Nest Protect) |
| `binary_sensor` | safety (glass break) | 2 |

**Entity classifier**: `isTacticalEntity(entry)` + `isSecurityEntity(entry)` from `lcars-entity-utils.js`.

---

## §2 Layout Structure

```
┌──────────────────────────────────────────────────────────┐
│ [Elbow]  SITE NAME ════════════════════════ [🔇][⚙]    │
├──────────┬───────────────────────────────────────────────┤
│          │  TACTICAL SUMMARY BAR                        │
│ TACTICAL │  SHIELDS: ARMED AWAY | PERIMETER: 18/20 | ✓ │
│          ├───────────────────────────────────────────────┤
│ ┌──────┐ │  CAMERA GRID (2×3)                           │
│ │ ALL  │ │  ┌─────┐ ┌─────┐ ┌─────┐                    │
│ │      │ │  │ CAM │ │ CAM │ │ CAM │                    │
│ ├──────┤ │  └─────┘ └─────┘ └─────┘                    │
│ │ACCESS│ │  ┌─────┐ ┌─────┐ ┌─────┐                    │
│ │      │ │  │ CAM │ │ CAM │ │ CAM │                    │
│ ├──────┤ │  └─────┘ └─────┘ └─────┘                    │
│ │ZONES │ ├──MAIN─────────────────────────────────────────┤
│ │      │ │  ENTRANCE ──────── [FRONT DOOR·CLOSED]       │
│ ├──────┤ │                    [SIDE DOOR·CLOSED]         │
│ │▓▓▓▓▓▓│ │  GARAGE ────────── [GARAGE·CLOSED]           │
│ │filler│ │                    [GARAGE WIN·CLOSED]        │
├──────────┤──SMOKE/SAFETY─────────────────────────────────┤
│ [Elbow]  │  ⚠ FAMILY ROOM SMOKE · CLEAR                │
│ ═════════╪══ LCARS 5.0.0 ══════════════════             │
└──────────┴───────────────────────────────────────────────┘
```

---

## §3 Device Elements

### §3.1 Door/Window Sensor Pill
- LCARS pill button: `0 1.5rem 1.5rem 0` (content area style)
- Closed: `--lcars-ice` background, black text, label `SEALED`
- Open: `--lcars-tomato` background, black text, label `BREACH`
- Text label required alongside color (WCAG 1.4.1)
- Open items float to top of area group
- Sort change announced via `aria-live="polite"`

### §3.2 Smoke/Gas/Safety Sensor
- Same pill style as door/window
- Idle: `--lcars-gray`, label `CLEAR`
- Triggered: `--lcars-tomato`, `⚠` prefix glyph, label `ALERT`

### §3.3 Motion Sensor Dot
- Small circular indicator per camera/area
- `●` = motion detected: `--lcars-sunflower`, 3s CSS fade-out
- `○` = clear: `--lcars-gray`

### §3.4 Camera Tile
- 2×3 CSS grid of `<img>` elements
- Source: `entity.attributes.entity_picture` (HA-proxied, not direct camera IP)
- LCARS corner brackets: 4 L-shapes at corners, `--lcars-butterscotch`, 2px solid
- Motion detected: brackets shift to `--lcars-tomato`
- Camera name label bottom-left
- `alt` text: area name + camera name (WCAG 1.1.1)
- Tap → `showMoreInfo(entityId)`

### §3.5 Alarm Panel
- Reuse `<lcars-alarm-panel>` component from Habitat
- PIN keypad with rate limiting (3 attempts / 60s lockout)
- Arm mode whitelist: `['away', 'home', 'night', 'vacation']` (Worf: prevent service call injection)

---

## §4 Hero Element: Tactical Summary Bar

Full-width strip below header elbow. Three data blocks:

| Block | Content | Source |
|-------|---------|--------|
| SHIELDS | Alarm state (DISARMED / ARMED HOME / ARMED AWAY / TRIGGERED) | `alarm_control_panel` state |
| PERIMETER | `{closed}/{total} SECURE` | Count of door/window sensors |
| SENSORS | `ALL CLEAR` or `{count} ALERTS` | Count of triggered smoke/safety sensors |
| VIEWSCREENS | `{active}/{total} ACTIVE` | Count of active camera entities (5X-B19) |

**Background color** = alarm state color:
- Disarmed: `--lcars-ice`
- Armed Home: `--lcars-butterscotch`
- Armed Away: `--lcars-sunflower`
- Pending: `--lcars-sunflower` (pulsing)
- Triggered: `--lcars-tomato`

---

## §5 Red Alert Mode

When `alarm_control_panel.state === 'triggered'` or `alarm_control_panel.state === 'pending'`:
- **Scope:** Red Alert visual treatment is **confined to the Tactical card region** (inner shield core / summary bar). The dashboard frame elbows, header band, and footer band **remain neutral** and do NOT enter the red-alert state. (Captain decision 2026-05-10 — full-frame escalation was deemed visually overwhelming.)
- Inner shield core pulses `tomato ↔ black` at 1Hz
- Summary bar: `RED ALERT — INTRUSION DETECTED` (tomato background)
- `prefers-reduced-motion`: static tomato, no pulse

```css
@keyframes redAlert {
  0%, 100% { background: var(--lcars-tomato); }
  50% { background: var(--lcars-bg); }
}
@media (prefers-reduced-motion: reduce) {
  .red-alert { animation: none; background: var(--lcars-tomato); }
}
```

---

## §6 Filter Behavior

| Filter | Shows |
|--------|-------|
| ALL | All tactical entities + cameras |
| ACCESS | `lock` + `alarm_control_panel` + alarm panel |
| ZONES | `binary_sensor` (door/window/motion/smoke/gas/safety) |

Cameras always visible in ALL mode. In ZONES mode, cameras hidden.

---

## §7 Reused Components

- `<lcars-alarm-panel>` — full alarm keypad + mode strip
- `<lcars-camera-panel>` — camera tile rendering (if available, else raw `<img>`)
- `<lcars-tactical-panel>` — sensor grouping logic (reference for entity classification)
