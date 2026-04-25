# 5X-TAC-6: Tactical Dashboard Visual Redesign — Creative Vision

**Author**: Wesley Crusher (Creative Engineering)  
**Date**: 2026-04-25  
**Status**: CREATIVE BRIEF — Pending Geordi (design review) + Worf (security review)  
**Depends on**: Current `LCARS-TACTICAL-DASHBOARD-SPEC.md` (5X-2.2)

---

## Executive Summary

The current Tactical dashboard is a **rectangular grid of pills and camera thumbnails grouped by area**. It works. But it looks like a *database admin panel*, not a starship tactical operations center.

Every professional security system — UniFi Protect, SimpliSafe, Alarm.com, Ring — has converged on the same insight: **spatial awareness beats lists**. UniFi's InnerSpace pins cameras to a building blueprint. Ring's neighborhood map shows *where* events happen. SimpliSafe's shield icon communicates system state in a single glance.

The redesign transforms the Tactical dashboard from a sensor inventory into a **living perimeter schematic** — an abstract spatial display inspired by the Enterprise-D's Master Systems Display, where the home's entry points, cameras, and sensors are positioned around a structural outline, and the entire display *breathes* with the current security state.

---

## §1 Design Philosophy

### What Makes a Tactical Display Feel "Real"

On the Enterprise-D bridge, the tactical station behind the captain's chair showed:
1. A **spatial plot** — threats positioned relative to the ship, not listed alphabetically
2. **Shield status** as concentric arcs — not a text label, but a *visual envelope*
3. **Weapons arcs** and sensor sweeps — radiating from the ship's position
4. The display density **increased with threat level** — calm cruise = sparse, red alert = everything

These principles translate directly:

| Trek Tactical Element | Home Security Equivalent |
|---|---|
| Ship cross-section with status at each deck | Home perimeter outline with sensor nodes at each entry point |
| Shield arcs (fore/aft/port/starboard) | Alarm state as a visual envelope around the schematic |
| Weapons targeting overlay | Camera focus mode — main viewscreen with threat tracking |
| Sensor sweep animation | Motion detection ripple effect emanating from sensor locations |
| Threat proximity plot | Activity timeline — recent events as a temporal "approach" readout |
| Crew manifest roster | Presence awareness — who's home, who's away |

### Why Non-Rectangular

LCARS itself is defined by its curves. The elbows, the swept headers, the pill-shaped buttons — these are anti-rectangular by design. The current tactical dashboard puts rectangular camera tiles in a rectangular grid inside the LCARS frame. The frame is doing all the visual work; the content is generic.

The redesign uses:
- **An elliptical perimeter ring** with sensor nodes — the home's outline abstracted into a tactical plot
- **Swept camera brackets** instead of rectangular borders — LCARS corner sweeps that curve away from the camera feed
- **Arc-shaped status indicators** — shield status as concentric arcs, not a summary bar
- **Radial motion ripples** — when a motion sensor fires, a ripple emanates from its position on the schematic

---

## §2 Layout: The Three Modes

The dashboard adapts its visual density based on alarm state, inspired by how a starship bridge shifts from cruise mode to tactical alert to red alert.

### Mode A: CRUISE (Disarmed)

Ambient overview. The home is at rest. Maximum spatial awareness, minimum visual noise.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ╭─────╮  TACTICAL ═══════════════════════════════════════════ [🔇][⚙] │
│ │ELBOW│                                                               │
├─╰─────╯──────────────────────────────────────────────────────────────┐ │
│ ┌───────────────────── PERIMETER SCHEMATIC ──────────────────────┐   │ │
│ │                                                                │   │ │
│ │                    ╭──[FRONT]──╮                                │   │ │
│ │                   ╱  ● ● ●  ●  ╲                               │   │ │
│ │              [SIDE]              [GARAGE]                       │   │ │
│ │             ╱  ●                  ● ●  ╲                       │   │ │
│ │            │      ╭────────────╮      │                        │   │ │
│ │            │      │  ◈ SHIELDS │      │                        │   │ │
│ │            │      │  DISARMED  │      │                        │   │ │
│ │            │      │            │      │                        │   │ │
│ │            │      │ 👤×2 HOME  │      │                        │   │ │
│ │             ╲     ╰────────────╯    ╱                          │   │ │
│ │              [PATIO]          [BACK]                            │   │ │
│ │                ╲  ●          ●  ╱                               │   │ │
│ │                  ╰──[YARD]──╯                                  │   │ │
│ │                       ●                                        │   │ │
│ ├────────────────────── VIEWSCREENS ─────────────────────────────┤   │ │
│ │  ┌╴CAM 1╶─────┐  ┌╴CAM 2╶─────┐  ┌╴CAM 3╶─────┐  ┌╴CAM 4╶┐ │   │ │
│ │  │  thumbnail  │  │  thumbnail  │  │  thumbnail  │  │  thumb │ │   │ │
│ │  └─────────────┘  └─────────────┘  └─────────────┘  └────── ┘ │   │ │
│ ├────────────────────── SENSOR LOG ──────────────────────────────┤   │ │
│ │  ▮▮▮░░░░▮░░░▮▮▮░░░░░░░▮░░░░░░░░░░░░░░░░░░░░░░░░░░░  24H    │   │ │
│ │  ┊ 06:00     ┊ 12:00     ┊ 18:00     ┊ 00:00 ┊ NOW          │   │ │
│ ├──╭─────╮═══════════════════════════════════════ LCARS 5.x ════╯   │
│   │ELBOW│                                                           │
└───╰─────╯───────────────────────────────────────────────────────────┘
```

### Mode B: TACTICAL (Armed Home / Armed Away)

Heightened awareness. Perimeter schematic gains shield arcs. Cameras become more prominent. Sensor nodes show real-time status with labels.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ╭─────╮  TACTICAL ═══════════════════════════════════════════ [🔇][⚙] │
│ │ELBOW│  ▪ SHIELDS: ARMED AWAY  ▪ PERIMETER: 18/20  ▪ CLEAR          │
├─╰─────╯──────────────────────────────────────────────────────────────┐ │
│ ┌─ VIEWSCREEN ──────────────────────┐  ┌─ PERIMETER ──────────────┐ │ │
│ │                                   │  │       ╭──[FRONT]──╮      │ │ │
│ │   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │  │      ╱ ◉ ◉ ◉  ◉  ╲     │ │ │
│ │   ┃                           ┃   │  │  [SD]╱             ╲[GR] │ │ │
│ │   ┃    MAIN CAMERA FEED       ┃   │  │    ╱  ◉    ◈◈◈   ◉◉ ╲   │ │ │
│ │   ┃    (selected/motion)      ┃   │  │   │      SHIELDS      │  │ │ │
│ │   ┃                           ┃   │  │   │     ╱ ◈◈◈◈ ╲     │  │ │ │
│ │   ┃                           ┃   │  │   │    ARMED AWAY     │  │ │ │
│ │   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │  │    ╲  ◉           ◉╱   │ │ │
│ │   ┌─────┐ ┌─────┐ ┌─────┐        │  │  [PT]╲            ╱[BK] │ │ │
│ │   │cam 2│ │cam 3│ │cam 4│ ...    │  │       ╰──[YARD]──╯      │ │ │
│ │   └─────┘ └─────┘ └─────┘        │  │           ◉              │ │ │
│ ├───────────────────────────────────┤  ├───────────────────────────┤ │ │
│ │  CREW MANIFEST      │ SAFETY     │  │  MOTION TRACE            │ │ │
│ │  👤 Leith   HOME    │ 🔥×0 CLEAR │  │  ● FrontYard   3m ago   │ │ │
│ │  👤 Guest   AWAY    │ 💨×0 CLEAR │  │  ○ Driveway    1h ago   │ │ │
│ │  📱 2 phones home   │ 🪟×0 CLEAR │  │  ○ Backyard    4h ago   │ │ │
│ ├──────────────────────────────────────────────────────────────────┤ │ │
│ │  SENSOR TIMELINE ▮▮▮░░▮░░▮▮▮░░░░▮▮░░░░░░░░░░░░░  24H→NOW     │ │ │
│ ├──╭─────╮═══════════════════════════════════════ LCARS 5.x ═════╯ │ │
│   │ELBOW│                                                          │ │
└───╰─────╯──────────────────────────────────────────────────────────┘ │
```

### Mode C: RED ALERT (Triggered / Pending)

Battle stations. All non-essential information suppressed. The breached sensor is highlighted. Main viewscreen auto-switches to the nearest camera. Everything pulses.

```
┌─════════════════════════════════════════════════════════════════════════┐
│ ╭▓▓▓▓▓╮  ▓▓▓ RED ALERT — INTRUSION DETECTED ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ [🔇][⚙] │
│ │▓▓▓▓▓│  FRONT DOOR — BREACH — 00:42 ELAPSED                         │
├─╰▓▓▓▓▓╯──────────────────────────────────────────────────────────────┐ │
│ ┌─ VIEWSCREEN ──────────────────────────────────────────────────────┐ │ │
│ │                                                                   │ │ │
│ │   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │ │ │
│ │   ┃                                                           ┃   │ │ │
│ │   ┃         FRONT DOOR CAMERA — LIVE FEED                     ┃   │ │ │
│ │   ┃         (auto-selected — nearest to breach)               ┃   │ │ │
│ │   ┃                                                           ┃   │ │ │
│ │   ┃                                                           ┃   │ │ │
│ │   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │ │ │
│ │    ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐    │ │ │
│ │    │cam 2 │  │cam 3 │  │cam 4 │  │cam 5 │  │cam 6 │  │cam 7 │    │ │ │
│ │    └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘    │ │ │
│ ├───────────────────────────────────────────────────────────────────┤ │ │
│ │  ▓ BREACH: FRONT DOOR   ▓ PERIMETER: 17/20   ▓ ELAPSED: 00:42  │ │ │
│ ├──╭▓▓▓▓▓╮═▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ LCARS 5.x ▓▓▓▓═╯ │ │
│   │▓▓▓▓▓│                                                          │ │
└───╰▓▓▓▓▓╯──────────────────────────────────────────────────────────┘ │
  (▓ = pulsing tomato ↔ black at 1Hz)
```

---

## §3 Component Deep Dives

### §3.1 The Perimeter Schematic

This is the centerpiece — the component that makes this dashboard *not a list*.

**Concept**: An abstract, flattened outline of the home's perimeter rendered as an SVG path. Entry points (doors, windows) are positioned as **nodes** along the path. The shape isn't a literal floor plan — it's a stylized tactical plot, like a ship's cross-section simplified to its structural outline.

**How it works**:
- The component reads all `binary_sensor` entities with `device_class: door | window` from the tactical entity set
- Entities are grouped by their HA **area** assignment
- Areas are mapped to **perimeter segments** — FRONT, SIDE, BACK, GARAGE, etc.
- Each segment is an arc of the SVG outline
- Each entity within a segment becomes a **node** (filled circle) on that arc

**Node states** (color-coded, matching existing spec):

| State | Node Style | Color |
|---|---|---|
| Sealed (closed) | Filled circle | `--lcars-ice` (#99ccff) |
| Breach (open) | Filled circle, pulsing ring | `--lcars-tomato` (#ff5555) |
| Offline/Unknown | Hollow circle, dashed | `--lcars-gray` (#666688) |

**Perimeter segment labels** are positioned at the compass points of the ellipse, styled as LCARS pills with the segment name.

**Shield arcs** (only visible when armed): Concentric arcs outside the perimeter that represent the alarm system's active protection. They follow the LCARS color for the current alarm state:
- Armed Home: `--lcars-butterscotch` arcs with 40% opacity
- Armed Away: `--lcars-sunflower` arcs with 60% opacity, double-line
- Triggered: `--lcars-tomato` arcs, broken/flickering (shields failing)

**Motion ripples**: When a motion sensor fires, a `@keyframes` animation emanates from the motion sensor's position on the schematic — an expanding ring that fades out over 3 seconds, colored `--lcars-sunflower`. Multiple simultaneous motion events create overlapping ripples, like sonar pings on a tactical plot.

```css
@keyframes motionRipple {
  0%   { r: 4; stroke-opacity: 0.8; stroke-width: 2; }
  100% { r: 30; stroke-opacity: 0; stroke-width: 0.5; }
}
/* SVG circle animated on motion detection */
.perimeter-ripple {
  fill: none;
  stroke: var(--lcars-sunflower);
  animation: motionRipple 3s ease-out forwards;
}
```

**Area mapping strategy**: The schematic doesn't need a literal floor plan. Instead, it uses the HA area hierarchy:
1. Query all areas that contain tactical entities
2. Sort areas by floor (if assigned) — upper floors toward top, lower toward bottom
3. Assign each area to a segment of the perimeter ellipse based on its name heuristics:
   - Names containing "front", "entry", "porch" → top arc
   - Names containing "garage", "driveway" → top-right
   - Names containing "side" → left or right arcs
   - Names containing "back", "rear", "patio", "yard" → bottom arc
   - Names containing "basement", "cellar" → inner ring (interior)
   - Fallback: distribute evenly around the ellipse
4. Allow manual override via dashboard YAML config for exact positioning

**SVG approach** (not CSS-only):
- The schematic is rendered as an inline SVG within the Lit template
- The ellipse/path is computed from the number of perimeter segments
- Nodes are `<circle>` elements positioned along the path using `getPointAtLength()`
- Labels are `<text>` elements with LCARS font styling
- Shield arcs are `<path>` elements with CSS transitions
- Motion ripples are animated `<circle>` elements appended on motion events

**Interaction**:
- Tap a node → `showMoreInfo(entityId)` for that sensor
- Tap a segment label → filter to show only that area's entities
- Tap the center shield icon → open alarm panel (arm/disarm)

**Progressive enhancement**: On narrow viewports (< 600px), the schematic collapses to a simplified horizontal "perimeter bar" — a single horizontal strip with nodes arranged linearly, like a warp core status bar.

---

### §3.2 The Viewscreen Array

Inspired by the Enterprise bridge: one large **main viewscreen** and a row of **auxiliary displays**.

**Cruise mode**: Camera thumbnails in a horizontal strip below the perimeter schematic. All cameras equally sized (current 2×3 grid behavior, but as a single scrollable row with LCARS brackets).

**Tactical mode (armed)**: Split layout:
- **Main viewscreen** (60% width): Shows the most recently active camera (triggered by motion detection), or the first camera if all are idle. Large, 16:9, with LCARS swept corner brackets.
- **Filmstrip** (40% width): Vertical stack of remaining camera thumbnails, smaller, with camera name labels.
- **Auto-switch**: When a motion sensor fires, the main viewscreen cross-fades to the camera in that area. The previously-shown camera slides into the filmstrip. This is the "Computer, on screen!" moment.

**Red Alert mode**: Main viewscreen goes full-width, showing the camera nearest to the breached sensor. Filmstrip collapses to a minimal row of dots.

**Camera brackets** — LCARS-style corner sweeps instead of rectangular borders:

```
     ╭─── FRONT DOOR ─────────────────────╮
    ╱                                       ╲
   │                                         │
   │         camera feed image               │
   │                                         │
    ╲                                       ╱
     ╰─── ● MOTION ──────── 00:14:32 ─────╯
```

The brackets are CSS `border-radius` + `border` with only two corners rounded (top-left + bottom-right, or top-right + bottom-left) to create a swept parallelogram feel. The motion indicator and timestamp sit in the bottom bracket.

```css
.viewscreen-main {
  border-radius: 1rem 0 1rem 0;  /* swept parallelogram */
  border: 2px solid var(--lcars-butterscotch);
  overflow: hidden;
}
.viewscreen-main.motion {
  border-color: var(--lcars-tomato);
  box-shadow: 0 0 12px rgba(255, 85, 85, 0.3);
}
```

---

### §3.3 The Shield Status Core

The center of the perimeter schematic. Replaces the current summary bar as the primary system state indicator.

**Concept**: Instead of a horizontal bar with text blocks, the alarm state is a **visual icon** at the center of the perimeter — like SimpliSafe's shield, but rendered in LCARS style.

**States**:

| Alarm State | Core Visual |
|---|---|
| Disarmed | Hexagonal outline, `--lcars-ice`, label "DISARMED", crew count below |
| Armed Home | Filled hexagon, `--lcars-butterscotch`, slow breathing animation, "ARMED HOME" |
| Armed Away | Filled hexagon, `--lcars-sunflower`, double border, "ARMED AWAY" |
| Pending | Hexagon with countdown timer ring, pulsing `--lcars-sunflower`, seconds remaining |
| Triggered | Hexagon shattered/broken, `--lcars-tomato`, pulsing at 1Hz, "BREACH" |

The **countdown timer** during pending state is a critical UX element borrowed from SimpliSafe — a circular arc that depletes clockwise around the shield, showing how many seconds remain before the alarm arms or triggers. This gives the user immediate visual feedback on the entry/exit delay.

```css
.shield-countdown {
  stroke: var(--lcars-sunflower);
  stroke-dasharray: 283;  /* 2πr for r=45 */
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 1s linear;
}
```

**Tap interaction**: Tapping the shield core opens the alarm panel overlay (arm/disarm keypad).

---

### §3.4 The Sensor Timeline

A horizontal strip at the bottom of the dashboard — a temporal readout of sensor activity over the past 24 hours.

**Concept**: Like a warp signature analysis or subspace frequency scan — a horizontal bar divided into time segments, with colored blocks representing sensor events.

```
  ▮▮▮░░░░▮░░░▮▮▮░░░░░░░▮▮░░░░░░░░░░░░░░░░░░░░░░░░░░░  24H → NOW
  ┊ 06:00     ┊ 12:00     ┊ 18:00     ┊ 00:00 ┊ NOW
```

**Event color coding**:

| Event Type | Color | Block Style |
|---|---|---|
| Door/window open+close | `--lcars-ice` | Solid block |
| Motion detection | `--lcars-sunflower` | Thin pip |
| Alarm state change | `--lcars-butterscotch` | Tall block (full height) |
| Smoke/safety alert | `--lcars-tomato` | Tall block + glow |
| Camera motion event | `--lcars-lilac` | Thin pip |
| Lock state change | `--lcars-bluey` | Solid block |

**Data source**: HA's `history` API — `GET /api/history/period/{start}?filter_entity_id=...`  
**Technical note**: This requires the HA history integration to be loaded and the `recorder` to be configured. The timeline queries the last 24 hours of state changes for all tactical entities and renders them as positioned blocks on a horizontal axis.

**Interaction**:
- Hover a block → tooltip showing entity name, event type, timestamp
- Tap a block → `showMoreInfo()` for that entity
- The rightmost edge is "now" — new events appear with a slide-in animation from the right

**Implementation**: Canvas rendering (for performance with many events) or a simple CSS grid of `<div>` blocks if event count is manageable (< 200 events/24h). Canvas is preferred for smooth scrolling on older tablets.

**Progressive disclosure**: In Cruise mode, the timeline is a thin 1.5rem strip. In Tactical mode, it expands to 3rem with tick marks and labels. In Red Alert, it's hidden (irrelevant — the focus is NOW).

---

### §3.5 Crew Manifest

A compact panel showing presence awareness — who's home and who isn't.

**Concept**: Like a bridge officer roster or a "personnel locator" display. Shows tracked persons with their home/away status.

**Data source**: `person` entities from HA. Each person entity has a `state` of `home`, `not_home`, or a zone name.

| State | Display |
|---|---|
| `home` | Avatar + name, `--lcars-ice`, "HOME" badge |
| `not_home` | Avatar + name, `--lcars-gray`, "AWAY" badge |
| Zone name | Avatar + name, `--lcars-sunflower`, zone name badge |

**Layout**: Compact horizontal strip, fits 2-4 persons. In Tactical mode, expands to show last-changed timestamp.

**Interaction**: Tap a person → `showMoreInfo()` for the person entity, showing location history.

**Trek flavor**: The header reads "CREW MANIFEST" with a small Starfleet delta glyph. Person avatars are shown in circular frames with LCARS border styling.

**Privacy note for Worf**: Person entity data is already available in HA and follows HA's existing access controls. No new data exposure. However, this panel should be suppressible via config for users who don't want presence displayed on a wall-mounted dashboard.

```yaml
# Dashboard YAML config
tactical:
  show_crew_manifest: true  # default: true
  crew_entities:
    - person.leith
    - person.guest
```

---

### §3.6 Motion Trace Panel

When in Tactical (armed) mode, a compact list showing the most recent motion detections across all cameras/motion sensors, with relative timestamps.

**Concept**: Like a sensor trace log on the tactical console — "Contact bearing 127 mark 4, range closing."

```
 MOTION TRACE
 ● Front Yard        3m ago    ←  recent = bright sunflower dot
 ○ Driveway          1h ago    ←  older = dim gray dot
 ○ Backyard          4h ago
 ○ Side Entrance     12h ago
```

**Behavior**: 
- Sorted by recency (most recent first)
- Dots transition from `--lcars-sunflower` (active/recent) to `--lcars-gray` (stale) via CSS `transition` over 60 seconds
- Only shown in Tactical mode (armed). In Cruise mode, this space is used by the perimeter schematic. In Red Alert, it's suppressed.

---

## §4 Color & Animation Language

### Color Mapping (extends current spec)

| Element | Cruise (Disarmed) | Tactical (Armed) | Red Alert (Triggered) |
|---|---|---|---|
| Frame elbows | `--lcars-butterscotch` | `--lcars-butterscotch` | `--lcars-tomato` (pulsing) |
| Perimeter outline | `--lcars-ice` @ 40% | `--lcars-ice` @ 80% | `--lcars-tomato` @ 100% |
| Shield arcs | Hidden | `--lcars-sunflower` | `--lcars-tomato` (broken) |
| Shield core | `--lcars-ice` outline | `--lcars-sunflower` fill | `--lcars-tomato` pulsing |
| Sensor nodes (sealed) | `--lcars-ice` | `--lcars-ice` (brighter) | `--lcars-ice` |
| Sensor nodes (breach) | `--lcars-tomato` | `--lcars-tomato` + ripple | `--lcars-tomato` + pulse |
| Camera brackets | `--lcars-butterscotch` | `--lcars-butterscotch` | `--lcars-tomato` |
| Camera brackets (motion) | `--lcars-tomato` | `--lcars-tomato` + glow | `--lcars-tomato` + pulse |
| Timeline background | `--lcars-bg` | `--lcars-bg` | Hidden |
| Overall brightness | Dim/ambient | Full | Full + pulsing |

### Animation Catalog

| Animation | Trigger | Duration | CSS |
|---|---|---|---|
| Motion ripple | Motion sensor → on | 3s ease-out | SVG `<circle>` expansion + fade |
| Shield breathing | Armed Home/Away | 4s ease-in-out infinite | opacity 0.7 ↔ 1.0 |
| Countdown arc | Pending state | Linear, matches exit delay | `stroke-dashoffset` depletion |
| Node pulse | Breach detected | 1s ease-in-out infinite | scale 1 ↔ 1.3, opacity 0.7 ↔ 1 |
| Red alert pulse | Triggered | 1s ease-in-out infinite | background tomato ↔ black |
| Camera cross-fade | Motion → auto-switch viewscreen | 300ms ease | opacity swap |
| Timeline event slide-in | New event recorded | 300ms ease-out | translateX from right |
| Shield shatter | Triggered | 500ms | shield icon → cracked variant + shake |

**Reduced motion**: All animations respect `prefers-reduced-motion: reduce`. In reduced-motion mode:
- Ripples → instant color change
- Breathing → static at full opacity
- Countdown → numeric text countdown
- Pulsing → static alert color
- Cross-fade → instant swap

---

## §5 Professional Pattern → LCARS Translation Table

| Professional Pattern | Source | LCARS Translation |
|---|---|---|
| InnerSpace floor plan with device pins | UniFi Protect | Perimeter Schematic with sensor nodes — abstracted, not literal blueprint |
| Shield icon as central status | SimpliSafe | Shield Status Core at center of perimeter schematic |
| Timeline scrubber with colored event blocks | UniFi, Alarm.com | Sensor Timeline strip — horizontal, 24h, color-coded by event type |
| Camera grid with AI detection overlays | UniFi, Ring | Viewscreen Array with LCARS brackets, motion indicator in bracket |
| Countdown timer for arm/disarm delays | SimpliSafe | Countdown arc animation around Shield Core during pending state |
| Activity feed with icons + timestamps | SimpliSafe, Ring | Motion Trace panel — sorted by recency, sunflower→gray fade |
| Home/Away presence indicator | Google Nest, Alarm.com | Crew Manifest — person entities with home/away badges |
| Sensor health monitoring (battery, signal) | SimpliSafe, Ring | Extend sensor nodes — long-press/hover shows battery + signal |
| Dark theme with bright alert accents | All | Already LCARS. Black background, ice/sunflower/tomato accents |
| Auto-select camera on event | UniFi, Alarm.com | Viewscreen auto-switch on motion — "Computer, on screen!" |
| Geo-fencing visualization | Alarm.com | Not needed — Crew Manifest covers presence awareness |
| Neighborhood activity map | Ring | Out of scope — home perimeter is sufficient |
| Quick arm/disarm buttons | SimpliSafe, Ring | Shield Core tap → alarm panel overlay |
| 24/7 ambient mode | Google Nest | Cruise mode — dim, spatial, ambient perimeter display |
| Adaptive density by threat level | Derived from all | Three-mode layout: Cruise → Tactical → Red Alert |

---

## §6 Responsive Behavior

### Desktop (≥ 1024px)
Full layout as shown in Mode A/B/C mockups. Perimeter schematic is the hero element.

### Tablet (600–1023px)
- Perimeter schematic shrinks but stays visible
- Cameras shift to a horizontal scrollable strip below schematic
- Crew manifest and motion trace stack vertically below cameras
- Timeline remains as a thin strip

### Mobile (< 600px)
- Perimeter schematic collapses to a **Perimeter Bar** — a horizontal strip with sensor nodes arranged linearly, grouped by segment
- Shield core becomes a pill-shaped summary at the top (same as current summary bar, but styled as a pill)
- Cameras become a horizontal swipeable carousel
- Timeline hidden (insufficient width to be useful)
- Crew manifest becomes icon-only (avatars, no names)

```
Mobile Layout:
┌────────────────────────────────┐
│ ◈ ARMED AWAY │ 18/20 │ CLEAR  │  ← Shield pill
├────────────────────────────────┤
│ ◉ ◉ ◉ ● ◉ │ ◉ ◉ │ ◉ ◉ ◉    │  ← Perimeter bar (nodes)
│ FRONT       │ SIDE│ BACK      │
├────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ←→   │  ← Camera carousel
│  │ cam 1  │  │ cam 2  │       │
│  └────────┘  └────────┘       │
├────────────────────────────────┤
│  ● Front Door   SEALED        │  ← Sensor list (pills)
│  ● Side Door    SEALED        │
│  ● Garage       SEALED        │
└────────────────────────────────┘
```

---

## §7 Data Architecture

### New Data Requirements

| Data | Source | API | Notes |
|---|---|---|---|
| Person entities | HA `person` domain | WebSocket `subscribe_entities` | Already available via hass object |
| Sensor event history | HA `recorder` | REST `/api/history/period/` | Needed for timeline; consider performance — batch query once, update incrementally |
| Camera → area mapping | HA area registry | Already in `getAreaEntities()` | Used for viewscreen auto-switch |
| Motion → camera correlation | Area co-location | Match `binary_sensor.*_motion` to `camera.*` in same area | Already partially implemented in current code |
| Alarm exit/entry delay | `alarm_control_panel` attributes | `pending` state + `code_arm_required` | Needed for countdown arc |
| Area position hints | Dashboard YAML config | `tactical.area_positions` map | Optional manual override for schematic positioning |

### Config Schema Extension

```yaml
tactical:
  # Existing
  filter: all  # all | access | zones

  # New — Schematic positioning
  area_positions:
    front_yard: { segment: "front", position: 0.5 }
    garage: { segment: "front-right", position: 0.3 }
    side_entrance: { segment: "left", position: 0.5 }
    back_yard: { segment: "back", position: 0.5 }
    patio: { segment: "back-left", position: 0.7 }

  # New — Feature toggles
  show_crew_manifest: true
  show_timeline: true
  show_perimeter_schematic: true  # false = fall back to current list layout
  viewscreen_auto_switch: true    # auto-switch main camera on motion

  # New — Timeline
  timeline_hours: 24  # how many hours of history to show
```

---

## §8 Implementation Phases

### Phase 1: Perimeter Schematic (Core)
- SVG-based perimeter outline with sensor nodes
- Area-to-segment mapping (heuristic + config override)
- Node states: sealed/breach/offline
- Shield core with alarm state
- Tap interactions
- **Estimate**: Largest single component. Replaces the area-grouped pill list.

### Phase 2: Viewscreen Refactor
- Main viewscreen + filmstrip layout
- Auto-switch on motion detection
- LCARS swept brackets
- Camera states: connecting/live/offline (reuse existing)

### Phase 3: Adaptive Modes
- Three-mode rendering: Cruise → Tactical → Red Alert
- Layout transitions between modes
- Summary bar integration into schematic (shield core replaces bar)

### Phase 4: Timeline Strip
- History API integration
- Event rendering (Canvas or CSS blocks)
- Color coding by event type
- Hover tooltips

### Phase 5: Crew Manifest + Motion Trace
- Person entity integration
- Home/away badges
- Motion trace with recency fading
- Config toggles for privacy

### Phase 6: Polish
- Shield countdown arc animation
- Motion ripple animations
- Red alert shield shatter effect
- Responsive breakpoints
- `prefers-reduced-motion` audit

---

## §9 What Makes This Feel Like a Real Tactical Operations Center

1. **Spatial, not tabular.** The perimeter schematic transforms a list of sensors into a *map of your fortress*. You don't read it — you scan it. A single glance tells you if any part of your perimeter is compromised. This is the difference between a security guard reading a log and an officer looking at a tactical plot.

2. **The shield is visceral.** The Shield Status Core at the center isn't a text label — it's a visual object with state. It glows when armed. It breathes. When breached, it *shatters*. You feel the state change before you read it.

3. **Cameras serve the mission.** In Tactical mode, the viewscreen doesn't show all cameras equally — it shows the one that matters *right now*. Auto-switching on motion is the "on screen!" moment. The filmstrip keeps the others accessible but de-prioritized.

4. **Time has a shape.** The timeline strip gives sensor activity a visual form — like a long-range sensor scan showing the last 24 hours of contacts. Dense blocks mean high activity. Gaps mean quiet. You can spot patterns without reading a single event.

5. **The display adapts to threat level.** A cruise-mode dashboard is calm and ambient — just the perimeter outline and some camera thumbnails. An armed dashboard gains shield arcs, motion traces, and crew awareness. A triggered dashboard goes to battle stations — everything irrelevant is suppressed, and the single most critical camera fills the viewscreen. The dashboard itself *tells you how serious the situation is*.

6. **Motion ripples are sonar pings.** When a motion sensor fires, a ripple emanates from its position on the schematic. Multiple simultaneous triggers create overlapping ripples. It looks like an active sensor sweep, and it conveys spatial information instantly — "movement at the perimeter, north-west quadrant."

7. **The crew knows who's aboard.** The Crew Manifest isn't just a nice-to-have — it contextualizes every other piece of information. Motion at the front door at 8am when Leith is showing "AWAY" means something different than when they're "HOME." A real tactical officer knows who's on the ship.

8. **LCARS design language, not generic dashboards.** Swept camera brackets, pill-shaped perimeter labels, hexagonal shield core, elliptical schematic — nothing is default-rectangular. Every visual element uses the curves, sweeps, and rounded geometries that define LCARS. The frame isn't decoration — it's *part of the display*.

---

## §10 Open Questions for Team Review

### For Geordi (Design Authority)
- [ ] Does the SVG perimeter schematic maintain LCARS visual language sufficiently, or does it risk looking too generic/modern?
- [ ] Should the shield core be hexagonal (Trek tactical), circular (SimpliSafe-inspired), or pill-shaped (more LCARS)?
- [ ] Camera brackets: swept parallelogram corners vs. standard LCARS pill-radius corners?
- [ ] Is the three-mode adaptive layout too complex for the existing frame system, or can it work within `lcars-dashboard-layout`?
- [ ] Color validation: do the shield arc opacity levels maintain sufficient contrast on OLED/LCD mounted displays?

### For Worf (Security)
- [ ] Crew Manifest exposes person entity presence data. Should it be gated behind a config flag, or always visible?
- [ ] Timeline history API calls — should these be rate-limited to prevent excessive recorder queries?
- [ ] Camera auto-switch on motion: does this create a timing side-channel where camera selection reveals which sensor triggered before the event is logged?
- [ ] Alarm countdown arc reveals the exact entry/exit delay timing. Is this an information disclosure concern for a wall-mounted display?

### For Engineering
- [ ] SVG rendering within lit-html 1.x: any known issues with inline SVG + lit-html template bindings? Need to verify SVG `<circle>` and `<path>` elements work correctly as lit-html template expressions.
- [ ] History API performance: querying 24h of history for 30+ entities on every dashboard load could be heavy. Consider: initial load + WebSocket `state_changed` subscription for incremental updates.
- [ ] Canvas vs CSS for timeline: Canvas gives better performance for 200+ events but breaks shadow DOM isolation. CSS grid of `<div>` blocks is simpler but may stutter on low-power tablets.
- [ ] `getPointAtLength()` for SVG node positioning: this is a synchronous layout-triggering call. May need to pre-compute positions and cache them.

---

## Appendix A: Inspiration Reference Mapping

```
Enterprise-D Tactical Display          →  Perimeter Schematic
Enterprise-D Main Viewscreen           →  Viewscreen Array (main + filmstrip)
Enterprise-D Shield Status Indicator   →  Shield Status Core
Enterprise-D Long-Range Sensor Scan    →  Sensor Timeline
Bridge Officer Crew Rotation Display   →  Crew Manifest
Red Alert Battle Stations Protocol     →  Red Alert Mode (adaptive density)
Master Systems Display (MSD)           →  Full dashboard in Cruise mode

UniFi InnerSpace Blueprint             →  Perimeter Schematic (spatial awareness)
SimpliSafe Shield Icon                 →  Shield Status Core (central state)
SimpliSafe Countdown Timer             →  Shield Countdown Arc (pending state)
Alarm.com Unified Timeline             →  Sensor Timeline (24h history strip)
Ring Event Thumbnails                  →  Camera motion brackets
Google Nest Ambient Mode               →  Cruise Mode (dim, ambient, spatial)
```

---

## Addendum B: Okuda Reference Study — Radial Arc Display & Structural Bars

**Date**: 2026-04-25  
**Source images**: `localinfo/inspiration/` — TNG tactical console prop, Engineering II panel, Main Engineering Primary Functions, viewscreen frame, status bar strip, warp core reactor  
**Impact**: Supersedes §1 "elliptical perimeter ring" concept. Refines §3.1 Perimeter Schematic, §3.2 Viewscreen Array layout, and overall structural framing.

---

### B.1 The Radial Arc Display (replaces elliptical perimeter)

The TNG tactical console prop (`53491351_1.jpg`) reveals the canonical Okuda tactical pattern: **concentric arc segments arranged radially around a central status indicator** — NOT a closed ellipse, and NOT concentric circles. The arcs have **gaps between them**, creating a segmented compass rose effect.

Key observations from the prop:
- **3–4 concentric rings** of arc segments, each spanning roughly 30–60° of arc
- Segments are **color-coded** (butterscotch/violet/orange) with **numeric codes** printed on each segment
- **Directional arrows** (▲▼◄►) at the cardinal points for mode navigation
- A **central crosshair/pip** at the origin — the "you are here" anchor
- "MODE SELECT" label below — the arcs represent selectable sensor/targeting modes
- The arcs are **asymmetric** — the upper-left quadrant has more segments than lower-right, reflecting non-uniform data density

**Translation to Tactical Dashboard:**

The perimeter schematic should be rendered as a **radial arc display** — concentric arc segments where each arc represents a perimeter zone (FRONT, SIDE, BACK, GARAGE, YARD), and each **segment within an arc** represents a sensor/entry point in that zone.

```
     Radial Arc Display (replaces elliptical perimeter)

                        ▲ FRONT
                    ╭━━━━━━━━╮
                 ╭──┤ ● ● ● ●├──╮
              ╭──┤  ╰━━━━━━━━╯  ├──╮
           ╭──┤  │              │  ├──╮
      ◄ ───┤  │  │    ◈◈◈◈     │  │  ├─── ►
   SIDE    │  │  │   SHIELDS    │  │  │   GARAGE
           │  │  │   ARMED      │  │  │
           ╰──┤  │              │  ├──╯
              ╰──┤  ╭━━━━━━━━╮  ├──╯
                 ╰──┤ ● ●    ├──╯
                    ╰━━━━━━━━╯
                        ▼ BACK/YARD

   Legend:
   ━━━  Arc segment (one per zone)
   ●    Sensor node on arc (sealed = ice, breach = tomato)
   ◈◈◈  Shield Status Core (center)
   Concentric rings = multiple ring layers per zone
   Gaps between arcs = visual breathing room
```

**SVG Implementation Change:**

Instead of a single `<ellipse>` path with nodes placed via `getPointAtLength()`, the display is constructed from individual `<path>` elements — one arc per zone:

```javascript
// Each zone = an arc segment at a specific radius and angle range
const zones = [
  { name: 'FRONT',  startAngle: -60,  endAngle: 60,   radius: 120 },
  { name: 'GARAGE', startAngle: 60,   endAngle: 120,  radius: 120 },
  { name: 'SIDE',   startAngle: -120, endAngle: -60,  radius: 120 },
  { name: 'BACK',   startAngle: 140,  endAngle: 220,  radius: 120 },
  { name: 'YARD',   startAngle: 170,  endAngle: 190,  radius: 160 },
];

// Render as SVG arc paths with gaps between them
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end   = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}
```

Sensor nodes are placed **on** the arc segments (not as separate floating circles). The prop shows numeric values printed directly onto the arc fill — we translate this to sensor state pips embedded within each segment.

**Multiple concentric rings** serve distinct purposes:
- **Inner ring** (smallest radius): Shield status arcs — armed state visualization
- **Middle ring**: Sensor node arcs — the actual door/window/motion sensors per zone
- **Outer ring**: Motion detection arcs — briefly flash when motion fires in that zone

This layered ring structure directly mirrors the prop's 3–4 concentric layers, where each ring shows a different class of information at a different depth.

**Key difference from the original vision**: The elliptical perimeter suggested a continuous outline with nodes sprinkled on it — like a fence with sensors on the posts. The radial arc display is fundamentally different: it's a **compass/targeting display** where the arcs themselves encode zone identity and the gaps between arcs provide visual separation. It's the difference between a map and a radar scope.

---

### B.2 Structural LCARS Bars (from `general.png`)

The Main Engineering Primary Functions panel reveals something critical about LCARS layout: **the thick butterscotch bars aren't decoration or borders — they're load-bearing structural elements** that physically connect and separate display sections.

Observations:
- A thick horizontal bar spans the full width, with **vertical bar drops** descending from it to frame the globe visualization and the Dilithium/Plasma/Warp Core readout columns
- The bars form **T-junctions** where vertical meets horizontal — the vertical doesn't just abut the horizontal; it connects flush, creating an architectural joint
- **Cutouts** in the bars create windows for content — the globe sits in a cutout framed by the bar structure
- The bars have **variable thickness** — header bars are thicker than framing bars
- The corners use **standard LCARS elbow radius** where bars turn 90°

**Translation to Tactical Dashboard layout:**

Instead of CSS `border` or `gap` to separate the radial arc display from the viewscreen array, use **rendered structural bars** — thick `<div>` elements with `background: var(--lcars-butterscotch)` and standard LCARS border-radius that physically form the grid:

```
  Structural Bar Layout (Tactical Mode B):

  ╭─────╮ ═══════════════════════════════════════════════ TACTICAL
  │ELBOW│
  ╰─────╯──┬────────────────────┬──────────────────────────────┐
            │                    │                              │
            │   RADIAL ARC       │   VIEWSCREEN                │
            │   DISPLAY          │   (main + filmstrip)        │
            │                    │                              │
            │   ◈ center core    │   ┌──────────────────────┐  │
            │                    │   │  camera feed          │  │
            │                    │   └──────────────────────┘  │
   ═════════┤════════════════════┤══════════════════════════════╡
     ▓▓▓▓▓▓▓│  STRUCTURAL BAR    │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
   ═════════┤════════════════════╧══════════════════════════════╡
            │                                                   │
            │   SENSOR TIMELINE  ▮▮▮░░▮░░▮▮▮░░░░▮▮░░░░  24H  │
            │                                                   │
  ╭─────╮ ═╧══════════════════════════════════════════ LCARS 5.x
  │ELBOW│
  ╰─────╯

  ▓▓▓ = Rendered structural bar (butterscotch, ~6px height)
  ─── = T-junction / intersection where bars connect
```

The structural bar between the arc display and the timeline isn't just a visual separator — it contains the **Crew Manifest** and **Motion Trace** data, rendered as LCARS pill labels *within* the bar itself, like how the Engineering II panel embeds numbered readouts in its horizontal bars:

```
  ═══╡ 👤 Leith HOME │ 👤 Guest AWAY │ ● FrontYard 3m │ ○ Driveway 1h ╞═══
       ^--- crew manifest pills ---^   ^--- motion trace pills --------^
```

This collapses two separate panels (Crew Manifest + Motion Trace) into a single structural element, keeping the layout clean and deeply LCARS.

---

### B.3 Viewscreen Frame (from `viewport.jpg`)

The viewscreen frame image confirms the camera presentation approach: **minimal LCARS framing with the feed dominating**. The frame has:
- A left sidebar of colored labels stacked vertically (zone labels in our case)
- Thin horizontal rules crossing the viewport with floating data pills
- The viewport area itself is vast — 85%+ of the space

**Refinement for camera brackets:**

Drop the "swept parallelogram" concept from §3.2. Instead, use the viewport pattern:

```
  ┌╴FRONT DOOR╶─────────────────────────────────┐
  │                                               │
  │                                               │
  │          camera feed — maximum area           │
  │                                               │
  │                                               │
  │─── ● MOTION ─────────────── 00:14:32 ────────│
  └───────────────────────────────────────────────┘
```

- **Top**: Thin LCARS bar with camera name as a pill label, left-justified
- **Bottom**: Thin LCARS bar with motion indicator pill (left) and timestamp pill (right)
- **Sides**: No visible border — the camera feed bleeds to the edge, separated from adjacent cameras by a 2px gap (the structural bar grid handles separation)
- The top/bottom bars use `--lcars-butterscotch` by default, switching to `--lcars-tomato` on motion

This is more authentically LCARS than rounded parallelogram corners. The frame is **architectural, not ornamental**.

---

### B.4 Dense Data Grid (from `d36acaf2165b11ac52c0f8d2cf6c54ba.jpg`)

The Engineering II panel shows how Okuda handles **high-density data**: horizontal bars of varying widths with numeric codes and abbreviated labels. Key pattern:

- Each data row is a **colored pill of variable width** — wider = more important or higher value
- Labels use **abbreviated 2–3 letter codes** (RI BER, KR FER, AP NUC)
- Large numeric values are set in bold, offset to the left of the label
- The overall grid is asymmetric — some rows are full-width, some are narrow, creating visual rhythm

**Translation to Sensor Timeline (§3.4 refinement):**

Instead of a simple block-per-event strip, render the timeline using the **Okuda data bar** pattern — each event is a variable-width pill whose width encodes duration (how long a door was open, how long motion was detected):

```
  SENSOR TIMELINE — 24H ──────────────────────────────────────────────
  ██░░░████░░░░░░░░░██░░░░░░░░░░░░░░░░░░░░░░░██████░░░░░░░░████░░░█
  FR                 GR                        BK                  SD
  ┊ 06:00     ┊ 12:00     ┊ 18:00     ┊ 00:00    ┊ NOW
```

Where `FR` = Front, `GR` = Garage, `BK` = Back, `SD` = Side — abbreviated Okuda-style codes. Event pills are stacked vertically per zone if they overlap in time, using the same dense visual language as the Engineering II scan readout.

---

### B.5 Status Bar Strip (from `dashboard.png`)

The thin LCARS status bar shows a horizontal run of segmented data blocks — butterscotch dominant with colored pips and numeric codes. This is the **footer/header pattern**.

**Application**: The Sensor Timeline in its compact form (Cruise mode, 1.5rem height) should follow this exact pattern — a single-height strip of colored pips on a butterscotch background, with no labels. Only when expanded (Tactical mode, 3rem) does it gain tick marks and zone codes. This creates a natural progressive disclosure that mirrors the original LCARS density hierarchy.

---

### B.6 Updated Radial Arc Mockups (Three Modes)

#### Cruise Mode — Radial Arc Display

```
                              FRONT
                         ╭━━━━━━━━━━╮
                      ╭──┤ ○  ○  ○  ├──╮
                   ╭──┤  ╰━━━━━━━━━━╯  ├──╮
                ╭──┤  │                 │  ├──╮
  SIDE  ────────┤  │  │    DISARMED     │  │  ├──────── GARAGE
                │  │  │    👤×2 HOME    │  │  │
                ╰──┤  │                 │  ├──╯
                   ╰──┤  ╭━━━━━━━━━━╮  ├──╯
                      ╰──┤ ○     ○  ├──╯
                         ╰━━━━━━━━━━╯
                             BACK

  ○ = sealed sensor (dim ice)
  All arcs dim, single-ring, no shield layer
```

#### Tactical Mode — Radial Arc Display (Armed Away)

```
                              FRONT
                    ·····╭━━━━━━━━━━━━╮·····
                 ╭──╭────┤ ◉  ◉  ◉ ◉ ├────╮──╮
              ╭──┤  │    ╰━━━━━━━━━━━━╯    │  ├──╮
           ╭──┤  │  │                      │  │  ├──╮
  SIDE  ───┤  │  │  │   ╔══════════════╗   │  │  │  ├─── GARAGE
           │  │  │  │   ║  ◈◈ SHIELDS  ║   │  │  │  │
           │  │  │  │   ║  ARMED AWAY  ║   │  │  │  │
           ╰──┤  │  │   ╚══════════════╝   │  │  ├──╯
              ╰──┤  │                      │  ├──╯
                 ╰──╰────┤ ◉       ◉ ├────╯──╯
                    ·····╰━━━━━━━━━━━━╯·····
                              BACK

  ◉ = sealed sensor (bright ice)
  ····· = shield arcs (outer ring, sunflower, breathing)
  ╔══╗ = shield core (double border, sunflower fill)
  Three concentric rings visible: shields / sensors / motion
```

#### Red Alert Mode — Radial Arc Display (Breach)

```
                              FRONT
                    ▓▓▓▓▓╭━━━━━━━━━━━━╮▓▓▓▓▓
                 ╭──╭────┤ ◉  ✦  ◉ ◉ ├────╮──╮
              ╭──┤  │    ╰━━━━━━━━━━━━╯    │  ├──╮
           ╭──┤  │  │          ))          │  │  ├──╮
  SIDE  ───┤  │  │  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  │  │  ├─── GARAGE
           │  │  │  │   ▓  ⚠ BREACH   ▓   │  │  │  │
           │  │  │  │   ▓ FRONT DOOR  ▓   │  │  │  │
           ╰──┤  │  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  │  ├──╯
              ╰──┤  │                      │  ├──╯
                 ╰──╰────┤ ◉       ◉ ├────╯──╯
                    ▓▓▓▓▓╰━━━━━━━━━━━━╯▓▓▓▓▓
                              BACK

  ✦ = breached node (tomato, pulsing at 1Hz)
  )) = motion ripple emanating from breach
  ▓▓▓ = shield arcs BROKEN (tomato, flickering)
  ⚠ BREACH = shield core shattered
```

---

### B.7 Revised §3.1 — Perimeter Schematic Implementation Notes

**What changes from original §3.1:**

| Original Concept | Revised Concept | Reason |
|---|---|---|
| Single elliptical outline path | Multiple concentric arc segments per zone | Matches Okuda tactical prop (53491351_1.jpg) |
| Nodes placed on ellipse via `getPointAtLength()` | Nodes embedded within arc segment fill | Okuda places data ON the arcs, not beside them |
| Shield arcs as separate concentric rings outside ellipse | Shield arcs as the OUTERMOST ring of the radial display | Integrates shields into the arc system naturally |
| Motion ripples as expanding circles from node positions | Motion ripples as arc FLASH — the zone's arc briefly brightens and expands | Keeps the radial language consistent; expanding circles break the arc idiom |
| Hexagonal shield core | **Keep hexagonal** — confirmed by Okuda's central crosshair motif | The prop's center pip is geometric, not rounded. Hexagonal is correct |
| Area-to-segment via perimeter position heuristics | Area-to-arc-segment via **angular position** around the compass | Same heuristics, but mapped to angle ranges instead of path positions |

**New SVG structure:**

```html
<svg viewBox="0 0 300 300" class="radial-arc-display">
  <!-- Shield ring (outermost) — only when armed -->
  <g class="shield-ring" opacity="0.6">
    <path d="..." class="shield-arc front" />
    <path d="..." class="shield-arc side" />
    <path d="..." class="shield-arc back" />
    <path d="..." class="shield-arc garage" />
  </g>

  <!-- Sensor ring (middle) -->
  <g class="sensor-ring">
    <path d="..." class="zone-arc front" />
      <!-- sensor nodes ON this arc -->
      <circle cx="..." cy="..." r="4" class="sensor-node sealed" />
      <circle cx="..." cy="..." r="4" class="sensor-node sealed" />
    <path d="..." class="zone-arc side" />
    <path d="..." class="zone-arc back" />
    <path d="..." class="zone-arc garage" />
  </g>

  <!-- Motion ring (innermost data ring) — flashes on detection -->
  <g class="motion-ring">
    <path d="..." class="motion-arc front" opacity="0" />
    <path d="..." class="motion-arc side" opacity="0" />
  </g>

  <!-- Center: Shield Status Core -->
  <g class="shield-core" transform="translate(150,150)">
    <polygon points="..." class="shield-hex" />
    <text class="shield-label">DISARMED</text>
    <text class="crew-count">👤×2 HOME</text>
  </g>

  <!-- Zone labels at compass points -->
  <text x="150" y="20" class="zone-label">FRONT</text>
  <text x="280" y="150" class="zone-label">GARAGE</text>
  <text x="150" y="280" class="zone-label">BACK</text>
  <text x="20" y="150" class="zone-label">SIDE</text>
</svg>
```

**Motion detection animation** — revised to match arc language:

```css
/* Instead of expanding circles, the zone's arc flashes */
@keyframes arcFlash {
  0%   { stroke-width: 8;  stroke-opacity: 1.0; filter: brightness(1.5); }
  100% { stroke-width: 12; stroke-opacity: 0.3; filter: brightness(1.0); }
}
.motion-arc.active {
  stroke: var(--lcars-sunflower);
  animation: arcFlash 2s ease-out forwards;
}
```

This is more authentically LCARS than expanding circles. The arc system stays self-consistent — everything is arcs, not a mix of arcs and circles.

---

### B.8 Geordi / Worf Review Items (Addendum)

**For Geordi:**
- [ ] Validate radial arc approach vs. elliptical — does the segmented arc display maintain LCARS consistency with existing dashboard panels?
- [ ] Structural bar thickness: 4px vs 6px vs 8px — what matches the existing LCARS frame system?
- [ ] Arc segment gap angle: how many degrees of gap between adjacent zone arcs? The prop shows ~5° gaps.
- [ ] Should zone labels use the Okuda abbreviated style (FR, GR, SD, BK) or full names (FRONT, GARAGE, SIDE, BACK)?

**For Worf:**
- [ ] The dense data bar pattern from Engineering II shows numeric codes on each segment. If we add sensor entity IDs or last-changed timestamps to the arcs, is that an information disclosure concern for wall-mounted displays?
- [ ] Structural bars containing crew manifest inline — does this make the presence data MORE visible (always on screen in the bar) vs. the original separate panel approach?
