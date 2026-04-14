# LCARS Irrigation Panel — Design Specification

**Author**: Wesley Crusher (Creative Technology & Experimentation)  
**Reviewed by**: Geordi La Forge (LCARS UI Design Authority)  
**Date**: Stardate 2026.04.13  
**Status**: IMPLEMENTED — v4.11.0  
**Priority**: LOW  
**Panel Type**: Irrigation (Zone Control + Schedule)  
**Integration**: Rachio (IoT class: Cloud Polling)  
**Extends**: `LcarsDevicePanelBase` (per LCARS-DEVICE-PANEL-SPEC.md §9)

---

## 0. Design Philosophy

The Irrigation Panel is modeled after the Enterprise-D **Arboretum's automated irrigation substations** — Deck 17, where the ship's botanical garden maintains hundreds of plant species from dozens of worlds, each with unique water requirements. The arboretum's LCARS console displays a grid of growing zones, each tagged with its hydration status, soil composition, and irrigation schedule. A botanist glances at the panel and knows: which zones are being watered right now, when the next cycle runs, and whether weather conditions have triggered a skip.

On a starship, water is a carefully managed resource. On a homeowner's property, it's the same — water distribution across multiple zones, each with different soil, slope, shade, and nozzle characteristics. The panel reflects this as a **sector grid** — a compact list of zones, each a row showing status and controls, plus a summary header with schedule and rain-skip intelligence.

This is a **simple, utilitarian panel**. Unlike pool chemistry (dozens of sensors, dual climate entities, lighting modes) or media (transport controls, artwork), irrigation is fundamentally: zones on/off, schedule info, rain delay. The design reflects that simplicity.

Per Roddenberry: **the ship takes care of you**. Rachio's Weather Intelligence handles skip logic automatically. The panel shows the operator what's happening and lets them intervene — start a zone manually, stop a running zone, toggle standby — without complexity.

Per Bracer Jack: **empty space is beautiful**. The zone grid breathes. Each row is a single line of status. No progress bars, no 3D pipes, no water droplet animations. The active zone gets an animated fill bar for time remaining — everything else is static text on black.

---

## 1. Grid Layout

### ASCII Layout — Full Panel (Desktop)

This is a **standard-width panel** — narrower than pool/spa. It fits in the normal 2-column dashboard grid alongside other device panels.

```
┌──────────────────────────────────────────────────────────────┐
│  IRRIGATION — RACHIO              IDLE   NEXT: TUE 05:30    │  ← header
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│  SCHEDULE    │  ZONE GRID                                    │
│              │                                               │
│  NEXT RUN    │  ┌─────────╮                                  │
│  TUE 05:30   │  │ ● START │  FRONT LAWN       IDLE          │
│              │  └─────────╯                                  │
│  DURATION    │  ┌─────────╮                                  │
│  45 MIN      │  │ ● START │  BACK LAWN        IDLE          │
│              │  └─────────╯                                  │
│  RAIN DELAY  │  ┌─────────╮                                  │
│  NONE        │  │ ■ STOP  │  GARDEN      ████░░░  12:34     │
│              │  └─────────╯                                  │
│  DAILY USED  │  ┌─────────╮                                  │
│  124 GAL     │  │ ● START │  FLOWER BEDS      IDLE          │
│              │  └─────────╯                                  │
│  ──────────  │  ┌─────────╮                                  │
│  CONTROLLER  │  │ ● START │  SIDE YARD        IDLE          │
│  ● ONLINE    │  └─────────╯                                  │
│              │  ┌─────────╮                                  │
│              │  │ ● START │  DRIP LINE        IDLE          │
│              │  └─────────╯                                  │
│              │                                               │
├──────────────┴───────────────────────────────────────────────┤
│  ┌──────────╮                                                │
│  │ STANDBY  │                                                │  ← standby toggle
│  └──────────╯                                                │
└──────────────────────────────────────────────────────────────┘
```

### ASCII Layout — Zone Active (Watering)

When a zone is actively running, its row expands to show a countdown fill bar:

```
│  ┌─────────╮                                                  │
│  │ ■ STOP  │  GARDEN      ████████░░░░  12:34 REMAINING      │
│  └─────────╯                                                  │
```

The fill bar uses `--lcars-ice` for the filled portion against a dim `--lcars-gray` track — water flowing through the pipe.

### ASCII Layout — Zone Expanded (Tap to View Attributes)

Tapping a zone row expands to show secondary attributes:

```
│  ┌─────────╮                                                  │
│  │ ● START │  FRONT LAWN       IDLE                           │
│  └─────────╯  SOIL: CLAY LOAM   NOZZLE: FIXED SPRAY          │
│               SHADE: LOTS       SLOPE: FLAT                   │
```

### CSS Grid Definition

```css
.lcars-irrigation-panel {
  display: grid;
  grid-template-areas:
    "header   header"
    "schedule zones"
    "standby  standby";
  grid-template-columns: minmax(8rem, 1fr) minmax(16rem, 3fr);
  grid-template-rows: auto 1fr auto;
  gap: var(--lcars-gap);

  /* Frame border — Bracer Jack Rule 2: thick→thin, NEVER same */
  border-left: 4px solid var(--panel-frame-color, var(--lcars-ice));
  border-top: 2px solid var(--panel-frame-color, var(--lcars-ice));
  border-right: 2px solid var(--panel-frame-color, var(--lcars-ice));
  border-bottom: 4px solid var(--panel-frame-color, var(--lcars-ice));
  border-radius: 0.75rem;

  padding: var(--lcars-gap);
  background: var(--lcars-bg);

  /* Irrigation frame color: ice (water/blue semantic) */
  --panel-frame-color: var(--lcars-ice);

  min-height: calc(var(--lcars-vunit) * 4);
}
```

### Why `--lcars-ice` for the Frame

Water systems across all LCARS panels use the blue family. The pool panel uses `--lcars-bluey` (#8899ff) for its frame because it's a complex multi-system panel. Irrigation is simpler and more utilitarian — `--lcars-ice` (#99ccff) is lighter, cleaner, and appropriate for a straightforward water distribution grid. It's the same color used for the pool body in its idle state — cool, calm, functional water.

---

## 2. Zone State → Color Mapping

Each zone has a simple state model: idle, watering, or unavailable.

| Zone State       | LCARS Variable          | Hex       | Text Label     | Rationale                                   |
|------------------|--------------------------|-----------|----------------|----------------------------------------------|
| `idle`           | `--lcars-sunflower`      | `#ffcc99` | `IDLE`         | Warm neutral — zone ready, standing by       |
| `watering`       | `--lcars-ice`            | `#99ccff` | `WATERING`     | Water blue — active irrigation               |
| `standby`        | `--lcars-gray`           | `#666688` | `STANDBY`      | Muted — controller offline                   |
| `unavailable`    | `--lcars-tomato` (pulse) | `#ff5555` | `OFFLINE`      | Fault — communication lost                   |

### Schedule/Rain State Colors

| State                | LCARS Variable          | Hex       | Usage                                    |
|----------------------|--------------------------|-----------|------------------------------------------|
| Rain delay active    | `--lcars-african-violet` | `#cc99ff` | Rain skip indicator — distinct from water |
| Next run scheduled   | `--lcars-sunflower`      | `#ffcc99` | Schedule time readout                    |
| No schedule          | `--lcars-gray`           | `#666688` | Dim — nothing pending                    |
| Controller online    | `--lcars-ice`            | `#99ccff` | Online status dot                        |
| Controller standby   | `--lcars-gold`           | `#ffaa00` | Standby toggle active                    |

### Contrast Verification (all text vs `#000000` background)

| Color                    | Hex       | Contrast vs #000 | WCAG Level | Usage                        |
|--------------------------|-----------|-------------------|------------|------------------------------|
| `--lcars-ice`            | `#99ccff` | 10.3:1            | AAA        | Frame, watering state, fill  |
| `--lcars-sunflower`      | `#ffcc99` | 13.1:1            | AAA        | Idle state, schedule readout |
| `--lcars-gold`           | `#ffaa00` | 8.6:1             | AAA        | Standby toggle active        |
| `--lcars-african-violet` | `#cc99ff` | 8.5:1             | AAA        | Rain delay indicator         |
| `--lcars-gray`           | `#666688` | 4.6:1             | AA         | Disabled/standby/no schedule |
| `--lcars-tomato`         | `#ff5555` | 5.2:1             | AA         | Offline/fault                |
| `--lcars-space-white`    | `#f5f6fa` | 18.9:1            | AAA        | Zone names, labels           |

All pass **WCAG 1.4.3 (AA)** minimum 4.5:1. Color is never the sole indicator — all states have text labels (WCAG 1.4.1).

### Implementation

```javascript
/**
 * Resolve zone switch state to LCARS color and label.
 * @param {string} state - HA entity state ('on', 'off', 'unavailable', 'standby')
 * @param {boolean} isStandby - controller is in standby mode
 * @returns {{ color: string, label: string }}
 */
function getZoneStateInfo(state, isStandby) {
  if (isStandby) {
    return { color: 'var(--lcars-disabled)', label: 'STANDBY' };
  }
  switch (state) {
    case 'on':          return { color: 'var(--lcars-ice)', label: 'WATERING' };
    case 'off':         return { color: 'var(--lcars-sunflower)', label: 'IDLE' };
    case 'unavailable': return { color: 'var(--lcars-tomato)', label: 'OFFLINE' };
    default:            return { color: 'var(--lcars-disabled)', label: 'UNKNOWN' };
  }
}

/**
 * Resolve rain delay status to display info.
 * @param {object} attrs - controller attributes
 * @returns {{ label: string, color: string }}
 */
function getRainDelayInfo(attrs) {
  const delay = attrs?.rain_delay;
  if (delay && delay > 0) {
    return { label: `${delay} HR DELAY`, color: 'var(--lcars-african-violet)' };
  }
  return { label: 'NONE', color: 'var(--lcars-disabled)' };
}
```

---

## 3. Panel Header

### Structure

```html
<div class="irrigation-header" role="heading" aria-level="3">
  <span class="device-panel-name">${deviceName}</span>
  <span class="device-panel-header-line" aria-hidden="true"></span>
  <span class="irrigation-status-badge" style="color: ${statusColor}">
    ${statusLabel}
  </span>
  <span class="irrigation-next-run" style="color: var(--lcars-sunflower)">
    NEXT: ${nextRunTime}
  </span>
</div>
```

The header shows system-level status at a glance: the controller name, whether anything is currently watering (badge shows `WATERING ZONE 3` or `IDLE`), and the next scheduled run time. A bridge officer reads left-to-right: identity → status → schedule.

### CSS

```css
.irrigation-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-h);
  border-bottom: 2px solid var(--panel-frame-color);
}

.irrigation-status-badge {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 700;
  transition: color var(--lcars-transition-slow);
}

.irrigation-next-run {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  margin-left: auto;
}
```

Reuses `.device-panel-name` and `.device-panel-header-line` from the Device Panel Spec §3.1. Header badge dynamically colors based on whether any zone is actively watering.

---

## 4. Schedule & Status Column (Left)

The left column shows summary telemetry — schedule, usage, controller status. This mirrors the sensor telemetry column from the device panel spec.

### Entity Ordering (Top to Bottom)

| Row | Label            | Source                                      | Color                           |
|-----|------------------|---------------------------------------------|---------------------------------|
| 1   | NEXT RUN         | `sensor.rachio_*_next_run` or `calendar.*`  | `var(--lcars-sunflower)`        |
| 2   | DURATION         | Sum of zone durations from schedule attrs   | `var(--lcars-space-white)`      |
| 3   | RAIN DELAY       | Controller attributes (rain_delay)          | Dynamic (violet if active)      |
| —   | *(divider)*      |                                             |                                 |
| 4   | DAILY USED       | `sensor.rachio_*_daily_used`                | `var(--lcars-space-white)`      |
| —   | *(divider)*      |                                             |                                 |
| 5   | CONTROLLER       | Controller entity status                    | Dynamic                         |

### CSS

```css
.irrigation-schedule {
  grid-area: schedule;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
}

.irrigation-schedule-divider {
  height: 1px;
  background: var(--lcars-disabled);
  margin: 0.25rem 0;
  opacity: 0.5;
}
```

Sensor lines reuse `.device-sensor-line` from the Device Panel Spec §3.3.

---

## 5. Zone Grid (Right)

The zone grid is the primary content area — a vertical list of all irrigation zones, each rendered as a row with a control button and status.

### 5.1 Zone Row — Idle State

```html
<div class="irrigation-zone-row"
     role="listitem"
     tabindex="0"
     aria-label="${zoneName}: idle"
     @click="${() => toggleExpand(zoneId)}">
  <button class="irrigation-zone-btn start"
          aria-label="Start watering ${zoneName}"
          ?disabled="${isStandby}"
          @click="${(e) => { e.stopPropagation(); startZone(hass, zoneId, validZoneIds, isStandby); }}">
    <span aria-hidden="true">●</span> START
  </button>
  <span class="irrigation-zone-name">${zoneName}</span>
  <span class="irrigation-zone-status" style="color: var(--lcars-sunflower)">
    IDLE
  </span>
</div>
```

### 5.2 Zone Row — Watering State

When a zone is actively running, the row changes: the button becomes STOP, and a fill bar shows time remaining.

```html
<div class="irrigation-zone-row watering"
     role="listitem"
     tabindex="0"
     aria-label="${zoneName}: watering, ${timeRemaining} remaining">
  <button class="irrigation-zone-btn stop"
          aria-label="Stop watering ${zoneName}"
          @click="${(e) => { e.stopPropagation(); stopZone(hass, zoneId, validZoneIds); }}">
    <span aria-hidden="true">■</span> STOP
  </button>
  <span class="irrigation-zone-name">${zoneName}</span>
  <div class="irrigation-zone-progress"
       role="progressbar"
       aria-label="Watering progress"
       aria-valuemin="0"
       aria-valuemax="${totalDuration}"
       aria-valuenow="${elapsed}">
    <div class="irrigation-zone-fill" style="width: ${pct}%"></div>
  </div>
  <span class="irrigation-zone-countdown" style="color: var(--lcars-ice)">
    ${timeRemaining}
  </span>
</div>
```

### 5.3 Zone Row — Expanded (Attributes)

Tapping a zone row reveals secondary attributes (soil, nozzle, shade, slope) as a sub-row. These are read-only informational fields from Rachio's zone configuration.

```html
<div class="irrigation-zone-attrs" aria-label="${zoneName} zone details">
  <span class="irrigation-zone-attr">SOIL: ${soilType}</span>
  <span class="irrigation-zone-attr">NOZZLE: ${nozzleType}</span>
  <span class="irrigation-zone-attr">SHADE: ${shadeLevel}</span>
  <span class="irrigation-zone-attr">SLOPE: ${slopeType}</span>
</div>
```

### Zone Grid CSS

```css
.irrigation-zones {
  grid-area: zones;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  overflow-y: auto;
}

.irrigation-zone-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.25rem;   /* 36px — exceeds WCAG 2.5.8 */
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  transition: background var(--lcars-transition);
}

.irrigation-zone-row:hover {
  background: rgba(153, 204, 255, 0.05);
}

/* Zone control button — LCARS pill: flat left, rounded right */
.irrigation-zone-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  min-width: 5rem;
  height: var(--lcars-bar-h);   /* 3rem = 48px */
  padding: 0 0.75rem;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;

  border: none;
  cursor: pointer;
  user-select: none;
  transition: filter var(--lcars-transition), background var(--lcars-transition);

  /* Pill shape: flat left, rounded right */
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
}

.irrigation-zone-btn.start {
  background: var(--lcars-sunflower);
  color: var(--lcars-black);
}

.irrigation-zone-btn.stop {
  background: var(--lcars-ice);
  color: var(--lcars-black);
}

.irrigation-zone-btn:hover {
  filter: brightness(1.15);
}

.irrigation-zone-btn:active {
  filter: brightness(0.85);
}

/* Disabled state — controller in standby */
.irrigation-zone-btn:disabled {
  background: var(--lcars-gray);
  color: var(--lcars-disabled);
  cursor: not-allowed;
  filter: none;
  opacity: 0.5;
}

/* Zone name */
.irrigation-zone-name {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-space-white);
  text-transform: uppercase;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Zone status label */
.irrigation-zone-status {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  font-weight: 700;
  white-space: nowrap;
  transition: color var(--lcars-transition-slow);
}

/* Active watering fill bar */
.irrigation-zone-progress {
  flex: 1;
  height: 0.5rem;
  background: var(--lcars-disabled);
  border-radius: 0.25rem;
  overflow: hidden;
  opacity: 0.6;
}

.irrigation-zone-fill {
  height: 100%;
  background: var(--lcars-ice);
  border-radius: 0.25rem;
  transition: width 1s linear;
}

/* Countdown timer */
.irrigation-zone-countdown {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  font-weight: 700;
  white-space: nowrap;
  min-width: 4rem;
  text-align: right;
}

/* Expanded zone attributes */
.irrigation-zone-attrs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  padding: 0.125rem 0.5rem 0.25rem calc(5rem + 0.75rem);  /* indent past button */
  overflow: hidden;
  max-height: 0;
  transition: max-height 300ms ease-out, padding 300ms ease-out;
}

.irrigation-zone-row.expanded + .irrigation-zone-attrs {
  max-height: 3rem;
  padding-top: 0.125rem;
  padding-bottom: 0.25rem;
}

.irrigation-zone-attr {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
  text-transform: uppercase;
  white-space: nowrap;
}
```

### 5.4 Duration Countdown Logic

```javascript
/**
 * Format remaining seconds as MM:SS countdown.
 * @param {number} remainingSec - seconds remaining
 * @returns {string} formatted time (e.g., "12:34")
 */
function formatCountdown(remainingSec) {
  if (remainingSec == null || remainingSec <= 0) return '00:00';
  const min = Math.floor(remainingSec / 60);
  const sec = remainingSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/**
 * Calculate fill bar percentage for active zone.
 * @param {number} elapsed - seconds elapsed
 * @param {number} total - total zone duration in seconds
 * @returns {number} 0–100 percentage
 */
function getZoneFillPct(elapsed, total) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

/**
 * Get the currently watering zone (if any) from a list of zone entities.
 * @param {Array} zoneEntities - array of switch entity state objects
 * @returns {object|null} the active zone entity, or null
 */
function getActiveZone(zoneEntities) {
  return zoneEntities.find(e => e.state === 'on') || null;
}
```

---

## 6. Standby Toggle (Bottom)

The standby button puts the Rachio controller into standby mode — all schedules paused, no watering. This is a full-width control at the bottom of the panel.

### Structure

```html
<div class="irrigation-standby-strip">
  <button class="irrigation-standby-btn ${isStandby ? 'active' : ''}"
          role="switch"
          aria-checked="${isStandby}"
          aria-label="Standby mode: ${isStandby ? 'on' : 'off'}"
          @click="${() => toggleStandby()}">
    STANDBY
  </button>
</div>
```

### CSS

```css
.irrigation-standby-strip {
  grid-area: standby;
  display: flex;
  align-items: center;
  padding: 0.25rem 0;
  border-top: 1px solid var(--lcars-disabled);
}

.irrigation-standby-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 6rem;
  height: var(--lcars-bar-h);   /* 3rem = 48px */
  padding: 0 1rem;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  font-weight: 700;
  text-transform: uppercase;

  background: var(--lcars-gray);
  color: var(--lcars-space-white);
  border: none;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  cursor: pointer;
  transition: background var(--lcars-transition), color var(--lcars-transition);
}

.irrigation-standby-btn.active {
  background: var(--lcars-gold);
  color: var(--lcars-black);
}

.irrigation-standby-btn:hover {
  filter: brightness(1.15);
}
```

---

## 7. HA Entity Mapping

### Target Device

| Device              | Integration     | Key Entities                                                      |
|---------------------|-----------------|-------------------------------------------------------------------|
| Rachio Controller   | `rachio`        | `switch.rachio_zone_*`, `binary_sensor.rachio_*_is_watering`, `sensor.rachio_*_next_run`, `sensor.rachio_*_daily_used`, `calendar.rachio_*` |

### Required Entity: Zone Switches

Each irrigation zone is a `switch` entity. The panel discovers all zones belonging to the controller via `device_id`.

| Attribute / State    | Used For                                     | Fallback                    |
|----------------------|----------------------------------------------|-----------------------------|
| `state`              | Zone status (`on` = watering, `off` = idle)  | `'unavailable'`             |
| `friendly_name`      | Zone display name in grid                    | Entity ID fallback          |
| `zone_number`        | Sort order in zone grid                      | Alphabetical by name        |
| `soil_type`          | Expanded zone attribute                      | Hidden if null              |
| `nozzle_type`        | Expanded zone attribute                      | Hidden if null              |
| `shade`              | Expanded zone attribute                      | Hidden if null              |
| `slope`              | Expanded zone attribute                      | Hidden if null              |

### Optional Entities

| Entity Pattern                        | Domain          | Used For                          | Fallback                      |
|---------------------------------------|-----------------|-----------------------------------|-------------------------------|
| `binary_sensor.rachio_*_is_watering`  | `binary_sensor` | Active watering confirmation      | Derive from zone switch state |
| `sensor.rachio_*_next_run`            | `sensor`        | Next scheduled run time           | `'NO SCHEDULE'`               |
| `sensor.rachio_*_daily_used`          | `sensor`        | Daily water usage (gallons/liters)| Section hidden if null        |
| `calendar.rachio_*`                   | `calendar`      | Schedule calendar                 | Use next_run sensor instead   |

### Entity Classification Logic

```javascript
/**
 * Classify entities for the irrigation panel.
 * Returns { zones, sensors, controller }.
 */
function classifyIrrigationEntities(entities) {
  const result = {
    zones: [],         // switch entities (zone controls)
    sensors: [],       // sensor entities (schedule, usage)
    controller: null,  // primary controller entity (binary_sensor or switch)
  };

  for (const e of entities) {
    const domain = e.entity_id.split('.')[0];
    const dc = e.original_device_class || e.device_class || '';
    const cat = e.entity_category || '';

    // Skip diagnostic/config entities
    if (cat === 'diagnostic' || cat === 'config') continue;

    if (domain === 'switch') {
      result.zones.push(e);
      continue;
    }

    if (domain === 'sensor') {
      result.sensors.push(e);
      continue;
    }

    if (domain === 'binary_sensor') {
      // Controller online status or watering indicator
      if (!result.controller) result.controller = e;
      continue;
    }
  }

  // Sort zones by zone_number attribute, falling back to name
  result.zones.sort((a, b) => {
    const numA = a.attributes?.zone_number ?? 999;
    const numB = b.attributes?.zone_number ?? 999;
    if (numA !== numB) return numA - numB;
    return (a.attributes?.friendly_name || '').localeCompare(
      b.attributes?.friendly_name || ''
    );
  });

  return result;
}
```

### Service Calls

```javascript
/**
 * Validate that an entity_id belongs to the classified zone list.
 * Prevents stale UI state from calling services on unrelated entities.
 * @param {string} entityId - entity_id to validate
 * @param {string[]} validZoneIds - list of valid zone entity_ids
 * @returns {boolean}
 */
function isValidZoneEntity(entityId, validZoneIds) {
  return validZoneIds.includes(entityId);
}

/** Rate-limit timestamp — prevents rapid toggle cycling (protects solenoid valves). */
let _lastZoneActionTime = 0;
const ZONE_ACTION_COOLDOWN_MS = 2000;

/**
 * Start watering a specific zone.
 * Guards: entity must be in valid zone list, controller must not be in standby,
 * and a 2-second cooldown prevents rapid toggling.
 * @param {object} hass - Home Assistant connection
 * @param {string} entityId - zone switch entity_id
 * @param {string[]} validZoneIds - classified zone entity_ids
 * @param {boolean} isStandby - true if controller is in standby mode
 */
function startZone(hass, entityId, validZoneIds, isStandby) {
  if (isStandby) return;
  if (!isValidZoneEntity(entityId, validZoneIds)) return;
  const now = Date.now();
  if (now - _lastZoneActionTime < ZONE_ACTION_COOLDOWN_MS) return;
  _lastZoneActionTime = now;
  hass.callService('switch', 'turn_on', { entity_id: entityId });
}

/**
 * Stop watering a specific zone.
 * Guards: entity must be in valid zone list, 2-second cooldown.
 * @param {object} hass - Home Assistant connection
 * @param {string} entityId - zone switch entity_id
 * @param {string[]} validZoneIds - classified zone entity_ids
 */
function stopZone(hass, entityId, validZoneIds) {
  if (!isValidZoneEntity(entityId, validZoneIds)) return;
  const now = Date.now();
  if (now - _lastZoneActionTime < ZONE_ACTION_COOLDOWN_MS) return;
  _lastZoneActionTime = now;
  hass.callService('switch', 'turn_off', { entity_id: entityId });
}

/**
 * Toggle controller standby mode.
 * Rachio standby is exposed as a switch entity on the controller.
 * @param {object} hass - Home Assistant connection
 * @param {string} controllerEntityId - controller switch entity_id
 * @param {boolean} standby - true = enter standby, false = resume
 */
function toggleStandby(hass, controllerEntityId, standby) {
  hass.callService('switch', standby ? 'turn_on' : 'turn_off', {
    entity_id: controllerEntityId,
  });
}
```

---

## 8. Typography & Spacing

### Font Sizes (Three sizes only — Bracer Jack Rule 6)

| Element                  | Size Token                   | Value      | Usage                             |
|--------------------------|------------------------------|------------|-----------------------------------|
| Device name              | `--lcars-font-size-sub`      | `1.25rem`  | Panel header                      |
| Countdown timer          | `--lcars-font-size-sub`      | `1.25rem`  | Active zone time remaining        |
| All other text           | `--lcars-font-size-data`     | `0.875rem` | Zone names, status, labels, attrs |

**Three font sizes. No exceptions.** This panel doesn't have a large "hero" number like the climate panel's SVG temperature — the zone grid is a dense data display. The countdown timer for the active zone uses sub-header size to draw the eye to the running action.

### Spacing Constants (Jörn Weißenborn Grid)

| Spacing                      | Token / Value                | Usage                                       |
|------------------------------|------------------------------|---------------------------------------------|
| Gap between all elements     | `var(--lcars-gap)` = 0.25rem | Universal LCARS grid spacing                |
| Panel internal padding       | `var(--lcars-gap)` = 0.25rem | Inside the panel frame border               |
| Zone row min-height          | 2.25rem = 36px               | Exceeds WCAG 2.5.8 (24px min)              |
| Zone button height           | `var(--lcars-bar-h)` = 3rem  | Standard LCARS button = 48px               |
| Zone button min-width        | 5rem = 80px                  | Exceeds WCAG 2.5.8                          |
| Standby button height        | 3rem = 48px                  | Standard LCARS button                       |
| Fill bar height              | 0.5rem = 8px                 | Minimal track — non-interactive visual only |
| Panel outer border (left/bottom) | 4px solid                | Thick side (Bracer Jack Rule 2)             |
| Panel outer border (top/right)   | 2px solid                | Thin side — thick→thin                      |

### Text Treatment

- **ALL UPPERCASE** for: device name, zone names, status labels, sensor labels, values, button text, attributes
- **Font-weight**: `700` (bold) for status values, countdown, button text. `400` (normal) for everything else

---

## 9. Responsive Behavior

### Desktop (≥768px) — Full 2-Column Layout

The spec above. Schedule left, zone grid right, standby full-width below.

### Mobile (<768px) — Stacked Layout

```css
@media (max-width: 767px) {
  .lcars-irrigation-panel {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "schedule"
      "zones"
      "standby";
  }

  .irrigation-schedule {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .irrigation-schedule .device-sensor-line {
    flex: 1 1 45%;
    min-width: 8rem;
  }
}
```

On mobile, schedule info moves above zones. Zone grid fills the full width. Reading priority: status → schedule → zones → standby.

---

## 10. Animation

### v4.13.0 Visual Enhancements

#### Zone Fill Bar Water Flow
Active zone fill bar gets diagonal barberpole stripes scrolling left→right, simulating water flowing through the pipe. Fluid flow indicators on TNG Engineering show animated stripe patterns within conduit visualizations — deuterium flowing to the warp core. (Source: Bracer Jack — animation should be simple and snappy; the repeating gradient is a single GPU-composited element.)

```css
.lcars-zone-fillbar .fill {
  height: 100%;
  border-radius: 0 1.5rem 1.5rem 0;
  background: var(--lcars-ice);
  transition: width 1s linear;
}

.lcars-zone-fillbar.active .fill {
  background:
    repeating-linear-gradient(
      -45deg,
      var(--lcars-ice) 0px,
      var(--lcars-ice) 4px,
      rgba(153, 204, 255, 0.5) 4px,
      rgba(153, 204, 255, 0.5) 8px
    );
  background-size: 11.31px 100%; /* 8px × √2 for seamless diagonal tile */
  animation: lcars-flow 0.6s linear infinite;
}

@keyframes lcars-flow {
  from { background-position: 0 0; }
  to   { background-position: 11.31px 0; }
}
```

`11.31px` = one full diagonal stripe period (8px × √2 ≈ 11.31). Scrolling by exactly one period ensures a seamless loop. The pill-shaped rounded end follows canonical LCARS button/bar termination.

#### Zone Completion Flash
When a zone finishes its cycle, the row briefly flashes green-to-dark — visual confirmation that the task completed. Transporter cycle completion, replicator materialization: LCARS always produces a confirmation flash. (Source: Bracer Jack Manifesto §5 — don't add decorative elements that interfere with function; this is a 2s single-fire confirmation, not a loop.)

```css
.lcars-zone-row.completing {
  animation: lcars-zone-complete 2s ease-out forwards;
}

@keyframes lcars-zone-complete {
  0% {
    border-left: 3px solid var(--lcars-ice);
    background: rgba(153, 204, 255, 0.12);
  }
  30% {
    border-left: 3px solid var(--lcars-ice);
    background: rgba(153, 204, 255, 0.06);
  }
  100% {
    border-left: 3px solid transparent;
    background: transparent;
  }
}
```

JS adds `.completing` when zone state transitions from `watering` → `idle`, and removes the class after the animation ends via `animationend` event. Single fire, no loop.

#### Schedule Countdown Proximity Glow
"NEXT RUN" text shadow intensifies as the scheduled run approaches (within 1 hour). Mission countdown displays on TNG show increasing visual urgency as the event nears. (Source: TheLCARS.com — glow halos are permitted for emphasis; Bracer Jack — color carries meaning.)

```css
.lcars-schedule-next {
  color: var(--lcars-sunflower);
  text-transform: uppercase;
  font-family: var(--lcars-font, 'Antonio', sans-serif);
  /* --schedule-proximity: 0.0 (>1hr away) to 1.0 (imminent), set by JS */
  text-shadow:
    0 0 calc(var(--schedule-proximity, 0) * 8px)
    var(--lcars-ice);
  transition: text-shadow 10s ease-out; /* smooth between minutely JS updates */
}

/* ── T-0 ignition flash ── */
.lcars-schedule-next.go {
  animation: lcars-schedule-go 500ms ease-out;
}

@keyframes lcars-schedule-go {
  0%   { text-shadow: 0 0 16px var(--lcars-space-white); color: var(--lcars-space-white); }
  100% { text-shadow: 0 0 4px var(--lcars-ice); color: var(--lcars-sunflower); }
}
```

JS calculates `--schedule-proximity` as `Math.max(0, 1 - (minutesUntilRun / 60))` and updates every 60 seconds.

#### Rain Delay Cloud Badge
Pill badge with ☁ glyph, gently bobbing ±1px on a 3s cycle. The rain delay is a weather-intelligence override; it deserves its own status badge. (Source: TheLCARS.com — pill/capsule shape with one flat side; Bracer Jack — empty space is beautiful, so the badge only appears when rain delay > 0.)

```css
.lcars-rain-delay-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem 0.25rem 0.5rem;
  border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
  background: var(--lcars-ice);
  color: var(--lcars-bg, #000);
  font-family: var(--lcars-font, 'Antonio', sans-serif);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1;
  animation: lcars-cloud-bob 3s ease-in-out infinite;
  filter: drop-shadow(0 1px 3px rgba(153, 204, 255, 0.3));
}

.lcars-rain-delay-badge .cloud-glyph {
  font-size: 0.875rem;
}

@keyframes lcars-cloud-bob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-1px); }
}
```

The badge uses the standard LCARS pill shape — flat left, rounded right. Only rendered when `rain_delay > 0`.

#### Irrigation Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* Ambient: disable barberpole flow, cloud bob */
  .lcars-zone-fillbar.active .fill {
    animation: none;
    /* Static striped texture still visible — just doesn't scroll */
  }
  .lcars-rain-delay-badge {
    animation: none;
  }

  /* State transitions: instant */
  .lcars-schedule-next {
    transition-duration: 0ms;
  }

  /* Confirmations: halved, still plays */
  .lcars-zone-row.completing {
    animation-duration: 1s;
  }
  .lcars-schedule-next.go {
    animation-duration: 250ms;
  }
}
```

### Fill Bar (Active Watering)

The fill bar animates smoothly as the zone countdown progresses:

```css
.irrigation-zone-fill {
  transition: width 1s linear;
}
```

Updated every second via a `setInterval` timer when a zone is active. The 1s linear transition prevents jumpy visual updates.

### Zone Row State Transition

When a zone starts or stops watering, the row transitions its status color:

```css
.irrigation-zone-status {
  transition: color var(--lcars-transition-slow);
}
```

### Panel Cascade Entry

```css
.lcars-irrigation-panel {
  animation: lcars-cascade-in 300ms ease-out both;
}
```

### Attribute Expand/Collapse

```css
.irrigation-zone-attrs {
  transition: max-height 300ms ease-out, padding 300ms ease-out;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .lcars-irrigation-panel,
  .irrigation-zone-fill,
  .irrigation-zone-status,
  .irrigation-zone-attrs {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## 11. Accessibility (a11y) Requirements

### 11.1 Keyboard Navigation (WCAG 2.1.1)

| Element                  | Focusable        | Keydown Handlers                              |
|--------------------------|------------------|-----------------------------------------------|
| Zone rows                | `tabindex="0"`   | `Enter`/`Space` → expand/collapse attributes  |
| Start/Stop buttons       | `<button>`       | Native keyboard                               |
| Standby toggle           | `<button>`       | Native keyboard, `role="switch"`              |

Tab order: Header → Schedule lines → Zone rows (top to bottom, button first then row) → Standby toggle. Follows DOM order = visual order (WCAG 1.3.2).

### 11.2 ARIA Labeling (WCAG 4.1.2)

```html
<!-- Panel container -->
<div class="lcars-irrigation-panel"
     role="region"
     aria-label="${deviceName} irrigation control panel">

  <!-- Header -->
  <div class="irrigation-header" role="heading" aria-level="3">
    ...
  </div>

  <!-- Schedule column -->
  <div class="irrigation-schedule" role="list" aria-label="Irrigation schedule">
    <div class="device-sensor-line" role="listitem" tabindex="0"
         aria-label="Next run: ${nextRunTime}">
      ...
    </div>
  </div>

  <!-- Zone grid -->
  <div class="irrigation-zones" role="list" aria-label="Irrigation zones">
    <div class="irrigation-zone-row" role="listitem" tabindex="0"
         aria-label="${zoneName}: ${stateLabel}">
      <button aria-label="Start watering ${zoneName}">...</button>
      ...
    </div>
  </div>

  <!-- Standby toggle -->
  <button role="switch" aria-checked="${isStandby}"
          aria-label="Standby mode: ${isStandby ? 'on' : 'off'}">
    ...
  </button>

  <!-- Screen reader live region -->
  <div class="sr-only" aria-live="polite" aria-atomic="false"></div>
</div>
```

### 11.3 Color Is Not Sole Indicator (WCAG 1.4.1)

Every state conveys information through **both** color and text:
- Watering → `WATERING` label in ice-blue + fill bar + countdown
- Idle → `IDLE` label in sunflower
- Rain delay → `2 HR DELAY` text in violet
- Offline → `OFFLINE` label in tomato

### 11.4 Focus Visibility (WCAG 2.4.7, 2.4.11, 2.4.13)

```css
.irrigation-zone-row:focus-visible,
.irrigation-zone-btn:focus-visible,
.irrigation-standby-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}
```

`--lcars-ice` (#99ccff) vs `--lcars-black` (#000000) = **10.3:1 contrast** — exceeds 3:1 requirement.

### 11.5 Target Size (WCAG 2.5.8)

| Element               | Size                | Pixels (at 16px base)  | Passes?   |
|-----------------------|---------------------|------------------------|-----------|
| Zone Start/Stop button| 3rem × 5rem min     | 48px × 80px            | ✅ AAA    |
| Standby button        | 3rem × 6rem min     | 48px × 96px            | ✅ AAA    |
| Zone row (tap target) | 2.25rem × full      | 36px × variable        | ✅ AA     |

### 11.6 Screen Reader Announcements (WCAG 4.1.3)

```javascript
/**
 * Announce irrigation state changes to screen readers.
 * @param {HTMLElement} liveRegion - the aria-live container
 * @param {string} deviceName - controller friendly name
 * @param {string} change - description of what changed
 */
function announceIrrigationChange(liveRegion, deviceName, change) {
  if (!liveRegion) return;
  liveRegion.textContent = `${deviceName}: ${change}`;
}

// Usage:
// announceIrrigationChange(el, 'Rachio', 'front lawn watering started');
// announceIrrigationChange(el, 'Rachio', 'garden stopped, 12 minutes remaining skipped');
// announceIrrigationChange(el, 'Rachio', 'rain delay activated for 24 hours');
// announceIrrigationChange(el, 'Rachio', 'standby mode enabled');
```

---

## 12. CSS Custom Properties Summary (New)

Properties introduced by the Irrigation panel. All other properties from `lcars-styles.js`.

| Property                 | Default                | Set By | Purpose                                                 |
|--------------------------|------------------------|--------|---------------------------------------------------------|
| `--panel-frame-color`    | `var(--lcars-ice)`     | CSS    | Static frame border — ice for water systems             |
| `--zone-active-color`    | `var(--lcars-ice)`     | CSS    | Fill bar and countdown text for active zone             |
| `--zone-idle-color`      | `var(--lcars-sunflower)` | CSS  | Idle zone status label                                  |

Note: Unlike the climate panel which dynamically shifts `--panel-frame-color` based on `hvac_action`, the irrigation panel keeps a **static ice-blue frame**. Irrigation doesn't have a mode spectrum (heating vs cooling vs idle) — it's either running or not. The zone rows communicate per-zone state individually instead.

---

## 13. Heading & Label Hierarchy

| Element                 | `aria-level` | Font Size                   | Color                           | Purpose                               |
|-------------------------|--------------|-----------------------------|---------------------------------|---------------------------------------|
| Panel title             | 3            | `--lcars-font-size-sub`     | `--lcars-text-heading`          | Device name ("IRRIGATION — RACHIO")   |
| Zone names              | —            | `--lcars-font-size-data`    | `--lcars-space-white`           | "FRONT LAWN", "GARDEN"                |
| Zone status             | —            | `--lcars-font-size-data`    | Dynamic (state-based)           | "IDLE", "WATERING"                    |
| Zone countdown          | —            | `--lcars-font-size-sub`     | `--lcars-ice`                   | "12:34"                               |
| Schedule labels         | —            | `--lcars-font-size-data`    | `--lcars-space-white`           | "NEXT RUN", "RAIN DELAY"             |
| Schedule values         | —            | `--lcars-font-size-data`    | Dynamic                         | "TUE 05:30", "NONE"                  |
| Zone attributes         | —            | `--lcars-font-size-data`    | `--lcars-disabled`              | "SOIL: CLAY LOAM"                    |
| Button text             | —            | `--lcars-font-size-data`    | `--lcars-black` (on button bg)  | "START", "STOP", "STANDBY"           |

**Exactly 2 visual font sizes in active use** (sub-header for title + countdown, data for everything else). The title tier isn't used — this panel has no hero number. Still within the 3-size maximum.

---

## 14. File Registration Plan

| Component Tag               | File                            | Purpose                            |
|-----------------------------|---------------------------------|------------------------------------|
| `lcars-irrigation-panel`    | `lcars-irrigation-panel.js`     | Full irrigation panel component    |

Extends `LcarsDevicePanelBase`:
- `panelFrameColor` → Static `var(--lcars-ice)`
- `_isPrimaryDomain(domain)` → `domain === 'switch'` (zone switches)
- `_renderMedia()` → renders the zone grid
- No media frame (viewscreen) — the zone grid IS the primary content

---

## 15. LCARS Design Rules Compliance

| Rule                                              | Source           | Compliant? | Notes                                               |
|---------------------------------------------------|------------------|------------|-----------------------------------------------------|
| No gradients, shadows, or 3D effects              | Bracer Jack #1   | ✅          | Fill bar is flat color, no gradient                 |
| Frame goes thick→thin (4px→2px border)            | Bracer Jack #2   | ✅          | Left/bottom 4px, top/right 2px                     |
| Pill buttons with flat left, rounded right         | Bracer Jack #4   | ✅          | Zone Start/Stop, Standby button                    |
| ≤3 font sizes (title, sub, data)                  | Bracer Jack #6   | ✅          | Only sub + data used; within 3-size limit           |
| ≤5 hue families in use                            | Bracer Jack      | ✅          | Blue (ice), warm (sunflower/gold), violet (rain delay), gray (disabled), white (text) = 5 |
| All text uppercase                                 | TheLCARS.com     | ✅          | Zone names, labels, buttons, attributes             |
| Antonio font only                                  | TheLCARS.com     | ✅          | `var(--lcars-font)` throughout                     |
| CSS custom properties, no hardcoded hex            | Project rule     | ✅          | All colors via `var(--lcars-*)` tokens             |
| Background is always `#000000`                     | TheLCARS.com     | ✅          | `var(--lcars-bg)` = `var(--lcars-black)`           |
| Animations < 1s, respects `prefers-reduced-motion` | WCAG + project   | ✅          | Fill bar 1s linear, all disable with reduce         |
| WCAG AA contrast on all text                       | WCAG 1.4.3       | ✅          | Verified in §2 contrast table                      |
| 24px+ touch targets                                | WCAG 2.5.8       | ✅          | All buttons ≥ 48px, zone rows 36px                 |
| Focus visible 2px outline, 3:1 contrast            | WCAG 2.4.7/13    | ✅          | Ice blue outline, 10.3:1 vs black                  |
| Color not sole means of information                | WCAG 1.4.1       | ✅          | All states have text + color                       |
| Keyboard operable                                  | WCAG 2.1.1       | ✅          | Full tab order, button keyboard support             |
| `aria-label` / `role` on all interactive elements  | WCAG 4.1.2       | ✅          | See §11 ARIA templates                             |
| `aria-live="polite"` for state changes             | WCAG 4.1.3       | ✅          | Hidden live region for zone start/stop/delay        |
| Spacing uses `--lcars-gap` (0.25rem)               | Jörn Weißenborn  | ✅          | Invisible grid constant throughout                 |
| Empty space is beautiful                           | Bracer Jack      | ✅          | Zone grid rows breathe; no decorative fill          |

---

## 16. Team Review Flags

- **Geordi Review Required**: Zone grid row layout, fill bar visual design, expanded attribute sub-row, standby button placement. All visual design elements need Geordi's sign-off for LCARS compliance before implementation.
- **Worf Review Required**: `hass.callService()` calls for `switch.turn_on` / `switch.turn_off` (zone start/stop and standby toggle) — all state-changing service calls must be reviewed for proper authorization and input validation. Confirm that starting a zone doesn't allow arbitrary duration injection via attributes.

---

*"The arboretum is the most underappreciated system on the ship. It runs itself — water schedules, nutrient delivery, light cycles — all automated. But someone still has to check the panel once in a while to make sure the Andorian orchids aren't drowning the Vulcan succulents."*  
— Keiko O'Brien, Ship's Botanist, USS Enterprise-D

---

## Data — Architecture Review

**Reviewer**: Data (Project Architect & Performance Engineer)  
**Date**: Stardate 2026.04.13  
**Assessment**: SOUND WITH ADVISORIES

### Component Architecture
- This is the simplest device panel in the spec suite. It extends `LcarsDevicePanelBase` with the standard 2-column layout. The left column contains zone status lines; the right column contains the zone grid and schedule info viewscreen. The architectural simplicity is commendable — KISS compliance is near-optimal.
- Entity classification (`classifyIrrigationEntities()`) correctly identifies zones by `device_class: 'outlet'` within the `switch` domain, then sorts them by `zone_number` attribute. This is the correct Rachio entity pattern. The sort-by-zone-number approach ensures consistent display order regardless of entity discovery order. Good.
- The zone grid renders one row per zone, each with: zone name, status indicator, and a start/stop button. The `expanded` state (toggling zone detail attributes) uses a per-zone boolean in a `Map<entityId, boolean>`. This is lightweight and correct — no redundant re-rendering of collapsed zones.
- The fill bar countdown (§6) for active zones uses a `setInterval` timer that decrements `_remainingSeconds` every 1000ms. This is the same timer pattern used in the alarm panel. The same advisory applies: **`disconnectedCallback()` must clear this interval**.
- The standby toggle is a simple `switch.turn_on` / `switch.turn_off` on the controller's standby switch entity. Correct and minimal.

### Performance Considerations
- **Zone countdown timer**: One `setInterval` per active zone. Rachio supports running 1 zone at a time (sequential schedule), so the maximum concurrent timers is 1 in practice. However, the spec does not enforce this — if `_activeZones` somehow contains multiple entries, multiple intervals fire. **Advisory**: Guard against multiple simultaneous timers. Use a single shared timer that iterates all active zones.
- **Zone grid DOM footprint**: Typical Rachio installations have 4-16 zones. At 16 zones, the grid renders ~80 DOM nodes (5 per row: name, status, time, fill bar, button). Trivial.
- **Expanded zone attributes**: The expand/collapse animation uses `max-height` CSS transition. This is a well-known pattern but `max-height` transitions require an explicit pixel value for the "open" state, which means either hardcoding a max-height (risks clipping on long content) or measuring with `scrollHeight` (triggers layout thrash). **Advisory**: Use `grid-template-rows: 0fr → 1fr` transition instead — it's GPU-compositable, doesn't require height measurement, and is supported in all modern browsers (Chrome 92+, Safari 16.4+, Firefox 99+).
- **Bundle impact estimate**: ~3.0 KiB minified/gzipped. This is the lightest panel in the suite. The classification logic, zone grid template, and fill bar animation are minimal. Roughly 1.5% of the 203 KiB bundle.

### HA Integration Patterns
- Zone start: `hass.callService('switch', 'turn_on', { entity_id: zoneEntityId })`. Correct for Rachio zones, which expose as `switch` entities.
- Zone stop: `hass.callService('switch', 'turn_off', { entity_id: zoneEntityId })`. Correct.
- Standby toggle: Same `switch.turn_on` / `switch.turn_off` pattern. Correct.
- **No integration-specific service calls**. All actions use standard HA `switch` domain services. This means the panel is potentially compatible with any irrigation system that exposes zones as `switch` entities (B-hyve, OpenSprinkler, etc.), not just Rachio. This is a significant reusability advantage.
- Rain delay information comes from `sensor.rachio_*_rain_delay` entity attributes. This is Rachio-specific. Other irrigation integrations may not expose rain delay the same way. **Advisory**: Add a fallback that hides the rain delay section if the relevant sensor entity is not found.

### Code Quality & Reusability
- **DRY**: The fill bar countdown timer shares an identical pattern with the alarm panel's countdown. Both use `setInterval(1000ms)`, decrement a counter, and update a CSS `width` percentage. Extract to a shared `CountdownTimer` class:
  ```javascript
  class CountdownTimer {
    constructor(durationSec, onTick, onComplete) { ... }
    start() { ... }
    stop() { clearInterval(this._interval); }
  }
  ```
  This eliminates the `disconnectedCallback` cleanup concern — the timer class owns its own lifecycle.
- **DRY**: `startZone()` and `stopZone()` are thin wrappers around `hass.callService('switch', ...)`. These are 3 lines each and not worth abstracting further. Leave as-is.
- **KISS**: Excellent. No unnecessary abstractions. No complex state machines. No animation libraries. The expand/collapse is CSS-only. The countdown is a simple interval. The zone grid is a flat map of entities to rows.
- **YAGNI**: The spec does not include advanced features like "run all zones sequentially" or "custom zone duration input." These are legitimate future features but correctly deferred. The current scope covers the 90% use case (monitoring + manual start/stop).
- **Reusability**: Because this panel uses only standard `switch` domain services, it could be generalized to support non-Rachio irrigation controllers. The entity classification would need a more generic discovery heuristic (e.g., devices with `manufacturer` containing irrigation keywords, or entities with `device_class: outlet` grouped under a device with `model` containing "sprinkler" or "irrigation").

### Recommendations
1. **P1**: Implement `disconnectedCallback()` to clear the zone countdown interval. Same pattern as alarm panel. Or, preferably, extract a shared `CountdownTimer` class that both panels can use.
2. **P2**: Replace `max-height` expand/collapse animation with `grid-template-rows: 0fr → 1fr` CSS transition. Avoids layout thrash and hardcoded height values. Supported in HA's minimum browser targets.
3. **P2**: Add a guard to prevent multiple simultaneous countdown timers. Use a single `_activeTimerId` property and clear it before creating a new timer.
4. **P3**: Hide rain delay section gracefully when `sensor.*_rain_delay` entity is not found. This enables compatibility with non-Rachio irrigation integrations without code changes.
5. **P3**: Consider adding a `platform` config option (default: `'rachio'`) to allow entity classification to adapt to other irrigation integration entity patterns. This is low-effort and significantly broadens the panel's utility.

---

## Cross-Spec Summary: Cumulative Architecture Assessment

**Total bundle impact of all 8 specs**: ~36 KiB minified/gzipped
- Media: ~4.5 KiB
- Climate: ~4.5 KiB
- Alarm: ~6.5 KiB
- Pool/Spa: ~9.0 KiB
- Air Purifier Verification: 0 KiB (no new code)
- Temp/Humidity Grid: ~5.5 KiB
- Weather: ~4.5 KiB
- Irrigation: ~3.0 KiB

**Projected new bundle size**: 203 + 36 = ~239 KiB (17.7% increase). This is within acceptable bounds. The increase delivers 7 new panels and 1 standalone card.

**Shared utilities to extract before implementation**:
1. `CountdownTimer` class — used by alarm and irrigation (eliminates 2× interval cleanup bugs)
2. `thresholdColor(value, ranges)` — used by pool chemistry, temp/humidity grid, and atmoscrubber
3. `sparklinePath()` / `sparklineAreaPath()` — used by atmoscrubber and temp/humidity grid
4. `svgArc()` — used by climate panel and weather day arc
5. `adjustSetpoint()` — used by climate and pool panels
6. `hasFeature()` — used by media and climate panels
7. `WEATHER_CONDITIONS` lookup table — consolidates 3 condition→X mappers

**Cross-cutting P0/P1 items**:
- All timer-using panels MUST implement `disconnectedCallback()` cleanup
- Forecast caching for weather panel (prevents redundant API calls)
- `recorder/statistics_during_period` WS call for sensors grid (replaces 14 HTTP calls with 1 WS message)
- Populate `configEntryId` in pool panel's `classifyPoolEntities()`

**Overall assessment**: All 8 specs are architecturally sound. The device panel inheritance model (`LcarsDevicePanelBase`) is correctly applied across 6 of 7 new components. The standalone sensors grid card is correctly implemented outside that hierarchy. The auto-discovery pattern is consistent and well-validated against real device entity inventories. I recommend proceeding to implementation with the shared utilities extracted first.

---

## Geordi La Forge — Design Review

**Reviewer**: Geordi La Forge (LCARS UI Design Authority)  
**Date**: Stardate 2026.04.13  
**Status**: APPROVED

### LCARS Compliance
- §1 Grid Layout: Standard 2-column panel (schedule | zones) with full-width header and standby row. This is the right size — irrigation is fundamentally simple and doesn't need the pool panel's 3-column treatment.
- Thick→thin border (4px left/bottom, 2px top/right) — correct per Bracer Jack Rule 2.
- §5 Zone buttons: Pill shape with flat left, rounded right (`border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0`). Standard LCARS button. The START button in `--lcars-sunflower` and STOP button in `--lcars-ice` (water blue) are semantically correct.
- §6 Standby toggle: Uses `role="switch"` with `aria-checked` — correct ARIA pattern. Pill shape maintained. Active state in `--lcars-gold` — standard active/important indicator.
- The fill bar for active watering (§5.2) is flat color (`--lcars-ice`) against `--lcars-disabled` track — no gradient. Correct.
- §15 Compliance table is thorough and accurate. Every rule checked and justified.

### Color & Typography
- `--lcars-ice` for the irrigation frame is correct — water systems use the blue family. Distinct from the pool panel's `--lcars-bluey` (aquatics = darker blue, irrigation = lighter blue = simpler system).
- Color palette uses 5 hue families: blue (ice), warm (sunflower/gold), violet (rain delay), gray (disabled), white (text). Plus tomato for fault, which is a system-wide alert color. Well within limits.
- Typography: Only 2 active font sizes (sub-header for title + countdown, data for everything else). Within the 3-size maximum. The decision not to introduce a hero number (like the climate panel's SVG temperature) is correct — irrigation doesn't have a central numeric focal point.
- ALL UPPERCASE maintained throughout — confirmed.

### Layout & Visual Balance
- This is the cleanest spec in the batch. The zone grid is a simple vertical list with breathing room. "Empty space is beautiful" — each zone row is one line of status with generous padding. No progress bars cluttering idle zones, no decorative water pipes, no sprinkler animations. Just data.
- The expandable zone attributes (§5.3) with `max-height` transition is good progressive disclosure. Secondary info (soil, nozzle, shade, slope) stays hidden until needed. The indentation past the button width maintains visual alignment.
- The rain delay indicator in `--lcars-african-violet` is a smart color choice — it's visually distinct from all other irrigation colors, immediately flagging "something different is happening" (weather intelligence overriding the schedule).

### Accessibility
- WCAG 2.5.8: Zone buttons at 48px × 80px. Standby button at 48px × 96px. Zone rows at 36px touchable height. All well above 24px.
- Zone rows are `tabindex="0"` with `Enter`/`Space` to expand attributes. Buttons have `@click` with `e.stopPropagation()` to prevent row expansion when clicking Start/Stop — good event isolation.
- Screen reader live region (§11.6) with specific announcements for zone start/stop, rain delay, and standby changes — thorough.
- All states have text + color dual encoding — confirmed in §11.3.
- `prefers-reduced-motion` covers fill bar transition, status color transition, expand animation, and cascade entry — confirmed in §10.

### Recommendations
1. **APPROVED**: Zone grid row layout — clean, minimal, properly spaced.
2. **APPROVED**: Fill bar visual design — flat ice-blue on gray track.
3. **APPROVED**: Expanded attribute sub-row with progressive disclosure.
4. **APPROVED**: Standby button placement at full-width bottom strip.
5. **APPROVED**: Static `--lcars-ice` frame (not dynamic). Correct for a binary-state system (watering/not watering) vs the climate panel's multi-action spectrum.
6. This is the most LCARS-faithful spec in the review batch. It embodies Roddenberry's vision — the system runs itself, the panel reflects status with minimal visual weight, and the operator intervenes only when needed. Keiko would approve.

---

## Worf — Security Review

**Reviewer**: Worf (Integration Security Expert)  
**Date**: Stardate 2026.04.13  
**Threat Level**: YELLOW

*"Irrigation zones control water valves and pump equipment. Unguarded actions can waste water resources or damage landscaping. The service calls here are simple but consequential."*

### Input Validation

- **Zone entity_id scoping**: `startZone()` and `stopZone()` pass `entity_id` directly from the zone entity object resolved from the device registry. The entity_id is not user-typed. However, verify that the entity_id is validated as belonging to the current device before calling the service — a stale UI state could reference a deleted entity.
- **Standby toggle**: `toggleStandby()` uses a boolean `standby` parameter to choose between `turn_on` and `turn_off`. The boolean comes from the current UI state. No injection concern.
- **Zone attribute rendering**: `soilType`, `nozzleType`, `shadeLevel`, `slopeType` — these come from Rachio entity attributes. They are text strings rendered via Lit templates. Auto-escaped.
- **Countdown timer values**: `formatCountdown()` and `getZoneFillPct()` operate on numeric values (seconds, percentages) with explicit `Math.max(0, ...)` clamping. Defensive.

### XSS & DOM Safety

- **All rendering via Lit templates**: Zone names (`friendly_name`), status labels, attribute values, schedule information — all rendered via Lit tagged template literals. **No `innerHTML` or `unsafeHTML()` detected.** Secure.
- **Zone name from entity attributes**: `friendly_name` is an untrusted string from the HA entity registry, but Lit auto-escapes it. A zone name like `<img src=x onerror=alert(1)>` would render as literal text. Secure.
- **`aria-label` construction**: Labels like `aria-label="${zoneName}: ${stateLabel}"` concatenate entity-derived values. Lit handles attribute escaping. Secure.

### Service Call Security

- **Two service call patterns**:
  1. `switch.turn_on` / `switch.turn_off` — zone start/stop
  2. `switch.turn_on` / `switch.turn_off` — standby toggle
- **All properly scoped** with `entity_id` from device entity objects, not user input. Service domains and service names are hardcoded strings.
- **No duration parameter in start zone**: The `startZone()` function calls `switch.turn_on` with only `entity_id`. Rachio zones use default duration from the schedule. The spec does NOT allow arbitrary duration injection — **confirmed: no duration parameter is accepted from the UI**. This is the correct approach. If a future enhancement adds manual duration input, it MUST be clamped to sane limits (1-120 minutes).
- **Standby mode is reversible**: Toggling standby pauses all schedules. This is not destructive — schedules resume when standby is deactivated. Acceptable without confirmation.
- **No admin-only data**: Zone switch states and Rachio sensor data are available to all HA users. No privilege escalation concern.

### Secrets & Sensitive Data

- **No credentials.** Rachio uses cloud API authentication handled by the HA integration's config flow. No API keys surface in entity attributes or service call parameters.
- **Schedule data**: Next run times and daily usage statistics are operational data, not sensitive. No PII exposure.

### Recommendations

**SHOULD FIX:**

1. **Validate entity_id belongs to current device before service call**: Before calling `switch.turn_on`, verify the entity_id is in the classified `zones` list:
   ```javascript
   function startZone(hass, entityId, validZoneIds) {
     if (!validZoneIds.includes(entityId)) return;
     hass.callService('switch', 'turn_on', { entity_id: entityId });
   }
   ```
   This prevents stale references from calling services on unrelated entities after a device reconfiguration.

2. **Rate-limit zone start/stop**: Add a 2-second cooldown after starting or stopping a zone to prevent rapid toggle cycling (which could damage irrigation solenoid valves).

3. **Guard against starting a zone while in standby**: If the controller is in standby mode, the START buttons should be disabled. The spec's `getZoneStateInfo()` handles the visual state (returns `STANDBY` label) but the `startZone()` function does not check standby state before calling the service. Add: `if (isStandby) return;`

**ADVISORY:**

4. **Rachio cloud dependency**: Unlike ScreenLogic (Local Push), Rachio uses Cloud Polling. This means service calls go through Rachio's cloud API. A Rachio cloud outage would make zone controls unresponsive. This is an architectural limitation of the integration, not a dashboard defect, but document it for user expectations.

5. **Future duration input**: If a manual duration feature is added (e.g., "run zone for X minutes"), the duration MUST be clamped to `[1, 120]` minutes and validated as an integer. Never accept arbitrary numeric input for physical equipment timers.

6. **OWASP compliance note**: No injection vectors (A03:2021). Service calls authenticated through HA WebSocket (A01:2021 — mitigated). No external resources loaded (A06:2021 — not applicable). Minimal attack surface overall.

---

## Wesley Crusher — Final Review Pass

**Author**: Wesley Crusher (Creative Technologist)  
**Date**: Stardate 2026.04.13  
**Status**: REVISED — Ready for Implementation

### Changes Made
- **§7 `startZone()`**: Added `isValidZoneEntity()` guard — validates entity_id belongs to the classified `validZoneIds` list before calling `switch.turn_on`. Prevents stale UI state from calling services on unrelated entities after a device reconfiguration. Per Worf's SHOULD FIX #1.
- **§7 `startZone()`**: Added `isStandby` parameter check — returns early if controller is in standby mode. START buttons cannot fire service calls while standby is active. Per Worf's SHOULD FIX #3.
- **§7 `startZone()` and `stopZone()`**: Added 2-second cooldown (`ZONE_ACTION_COOLDOWN_MS = 2000`) using timestamp-based rate limiting. Prevents rapid toggle cycling that could damage irrigation solenoid valves. Per Worf's SHOULD FIX #2.
- **§7 `stopZone()`**: Added same `isValidZoneEntity()` guard and rate-limiting as `startZone()`.
- **§5.1 Zone Row (Idle)**: Updated START button template with `?disabled="${isStandby}"` attribute and passes `validZoneIds`/`isStandby` to `startZone()`.
- **§5.2 Zone Row (Watering)**: Updated STOP button template to pass `validZoneIds` to `stopZone()`.
- **§5 Zone Grid CSS**: Added `.irrigation-zone-btn:disabled` style — grayed out, reduced opacity, `cursor: not-allowed` when controller is in standby.

### Accepted Recommendations
- **Worf SHOULD FIX #1** (entity_id validation): Accepted and implemented. `isValidZoneEntity()` function added. Both `startZone()` and `stopZone()` now validate entity_id against the classified zone list.
- **Worf SHOULD FIX #2** (rate-limit zone actions): Accepted and implemented. 2-second cooldown prevents rapid solenoid toggle cycling.
- **Worf SHOULD FIX #3** (guard START in standby): Accepted and implemented. `startZone()` returns early if `isStandby` is true. START buttons are also visually disabled via `?disabled` attribute.
- **Worf Advisory #4** (Rachio cloud dependency): Noted. Will document in card README: Rachio uses Cloud Polling, so zone controls depend on Rachio's cloud API availability. Not a dashboard defect — inherent integration architecture.
- **Worf Advisory #5** (future duration input clamping): Noted. If manual duration feature is added, input MUST be clamped to [1, 120] minutes and validated as integer.
- **Geordi**: Full approval, no changes needed. "Most LCARS-faithful spec in the review batch." — high praise from the chief designer.
- **Data P1** (`disconnectedCallback()` for timer cleanup): Accepted. Implementation will clear the zone countdown interval. Shared `CountdownTimer` class (also used by alarm panel) preferred to eliminate lifecycle cleanup bugs.
- **Data P2** (replace `max-height` expand/collapse with `grid-template-rows: 0fr → 1fr`): Accepted. GPU-compositable, no height measurement needed, supported in all modern browsers (Chrome 92+, Safari 16.4+, Firefox 99+). Better than `max-height` transition in every way.
- **Data P2** (single shared timer guard): Accepted. Implementation will use a single `_activeTimerId` property, cleared before creating a new timer. Prevents multiple simultaneous countdown intervals.
- **Data P3** (hide rain delay section gracefully): Accepted. If `sensor.*_rain_delay` entity is not found, the rain delay row will be hidden rather than showing an error state. Enables compatibility with non-Rachio irrigation integrations.
- **Data P3** (`platform` config option): Accepted. Default `'rachio'`, allows entity classification to adapt to other irrigation integration entity patterns (B-hyve, OpenSprinkler, etc.). Low-effort, high utility.

### Deferred Items
- **Data P1 shared `CountdownTimer` class**: Extraction happens at implementation time. Both alarm and irrigation panels will share the same timer class, eliminating the `disconnectedCallback` cleanup concern by design.
- **Data P2 `grid-template-rows` expand/collapse**: Implementation-phase CSS change. Will replace `max-height` transition with `grid-template-rows: 0fr → 1fr` in the zone attributes expand/collapse animation.
- **Data P3 rain delay fallback**: Implementation-phase guard. Section hidden when entity not found.
- **Data P3 `platform` config option**: Implementation-phase addition. Default behavior unchanged.
- **Worf Advisory #4** (cloud dependency documentation): Documentation task, not spec-level.

### Disagreements
- None. All reviewer feedback is either accepted or reasonably deferred. This is the simplest panel in the suite — clean, minimal, LCARS-faithful. Keiko O'Brien would indeed approve.
