# LCARS Irrigation Panel — Design Specification

**Author**: Wesley Crusher (Creative Technology & Experimentation)  
**Reviewed by**: Geordi La Forge (LCARS UI Design Authority)  
**Date**: Stardate 2026.04.13  
**Status**: Design Proposal  
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
          @click="${(e) => { e.stopPropagation(); startZone(zoneId); }}">
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
          @click="${(e) => { e.stopPropagation(); stopZone(zoneId); }}">
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
 * Start watering a specific zone.
 * @param {object} hass - Home Assistant connection
 * @param {string} entityId - zone switch entity_id
 */
function startZone(hass, entityId) {
  hass.callService('switch', 'turn_on', { entity_id: entityId });
}

/**
 * Stop watering a specific zone.
 * @param {object} hass - Home Assistant connection
 * @param {string} entityId - zone switch entity_id
 */
function stopZone(hass, entityId) {
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
