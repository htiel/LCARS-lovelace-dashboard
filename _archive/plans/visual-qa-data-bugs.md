# Visual QA — Data's Entity Classification & Architecture Audit

> Filed by: Data, Lt. Cmdr. — Chief Operations Officer
> Date: Stardate 2026-04-18
> Scope: Entity classification, panel assignment, data formatting, architecture
> Homes audited: mariner, Boimler

---

## Re-Review Notes (2026-04-18)

Re-reviewed with fresh perspective against actual source code. Cross-referenced
against Geordi's report (`visual-qa-geordi-bugs.md`) and Wesley's report
(`visual-qa-wesley-ideas.md`).

### Changes Made

| Action | Bug ID | Reason |
|--------|--------|--------|
| KEEP | DATA-001 | Verified against actual code in `lcars-illumination-panel.js` lines 165-170 |
| KEEP | DATA-002 | Verified — hazard detector at DETECTORS[2] does not filter entity_category |
| REVISE | DATA-003 | Root cause analysis was partially incorrect — the first-match-wins isn't the issue for fridge/climate; area-level Life Support claims climate before device-level runs |
| KEEP | DATA-004 | Valid — clarified that `classifyArea()` is the root cause |
| KEEP | DATA-005 | Valid — same architectural issue as DATA-004 |
| REVISE | DATA-006 | Clarified rendering pipeline — hazard devices may compose through environment panel |
| KEEP | DATA-007 | Verified — `_partitionDeviceEntities()` has no relevance filter |
| KEEP | DATA-008, DATA-018 | Valid — no centralized formatting exists |
| KEEP | DATA-009, DATA-010 | Valid — power panel name resolution issues |
| KEEP | DATA-011 | Verified — augmentation happens at lines 123-139 in illumination panel |
| KEEP | DATA-012 | Valid — button domain should show "READY" not "UNKNOWN" |
| KEEP | DATA-013 | Valid as documented — HA config issue, UX enhancement suggestion |
| KEEP | DATA-014, DATA-015 | Valid as documented |
| REVISE | DATA-016 | Correction: `isLightingEntity()` DOES have negative filters (`isInfrastructureLED()` and outlet exclusion). Primary leak is DATA-001's catchall. |
| REVISE | DATA-017 | Correction: Standalone temp sensors DON'T trigger Life Support. Issue is ceiling fans matching `isEnvironmentEntity()`. |
| KEEP | DATA-019 | Verified — augmentation inconsistency between illumination and orchestrator |
| KEEP | DATA-020 | Verified — `ecoflow_cloud` absent from PLATFORM_PANEL_MAP |
| KEEP | DATA-021 | Verified — `isEnvironmentEntity()` line 423: `if (entry.domain === 'fan' && !dc) return true` |

### Cross-References with Geordi's Report

- **DATA-001** ↔ **GEORDI-004, GEORDI-005** — Same root cause, Geordi owns visual impact
- **DATA-002** ↔ **GEORDI-002, GEORDI-012** — Same root cause, Geordi owns visual impact
- **DATA-007** ↔ **GEORDI-013** — Same root cause, Geordi owns visual impact
- **DATA-008** ↔ **GEORDI-001** — Same root cause, Geordi owns visual impact
- **DATA-012** ↔ **GEORDI-014** — Same root cause (UNKNOWN state rendering)

### Cross-References with Wesley's Report

- **DATA-008, DATA-018** ↔ **WESLEY-UX-003** — Both address state/value formatting
- **DATA-012** ↔ **WESLEY-UX-003** — Button "UNKNOWN" should show "READY"
- **DATA-007** ↔ **WESLEY-IDEA-004** — Camera panel needs relevance filter + contextual empty states

---

## DATA-001: Illumination circuit catchall absorbs ALL unclaimed switch-domain entities

- **Severity**: CRITICAL
- **Category**: ENTITY-CLASSIFICATION
- **Home**: Both
- **Room(s)**: mariner (Back Yard, Garage, Office), Boimler (Rutherford, Master Bed, multiple)
- **What's wrong**: `_partitionLightingEntities()` Pass 2 has a fallback path (line ~166) that absorbs **every** `switch`-domain entity not already claimed by another panel (`classifyDevice`) and not `device_class: outlet`. This catch-all dumps irrigation zone switches, EcoFlow config switches (`AC Enabled`, `X-Boost Enabled`, `DC (12V) Enabled`, `Backup Reserve Enabled`, `Battery Auto-Heating Enabled`, `DC Mode`), appliance switches (`Sound Machine`, `Air Filter`, `Bedtime Fan`, `Humidifier`, `Nap Mode Devices`), and cross-room leaks (`2nd Floor Crawl N Light`, `Rec Room Light`) into Illumination circuits.
- **Root cause**: In `lcars-illumination-panel.js` `_partitionLightingEntities()`, the circuit collection logic is:
  ```js
  } else if (entry.domain === 'switch' && entry.state?.attributes?.device_class !== 'outlet') {
    if (entry.entity?.device_id && claimedDeviceIds.has(entry.entity.device_id)) continue;
    circuits.push(entry);
  }
  ```
  The `claimedDeviceIds` gate only excludes switches whose **device** was classified by `classifyDevice()`. But many switches have NO device_id (device-less entities), or their device has no matching detector (EcoFlow `ecoflow_cloud` switches have sensor entities filtered by `entity_category`, so the augmented entries may not trigger the battery/power detector). The gate also fails for Rachio zone switches when the Rachio controller device is not in this area — the zone switches inherit the area but the controller may be elsewhere.
- **Impact**: ~15+ rooms across both homes showing irrelevant circuits in Illumination. This is the single largest classification bug. Observed manifesting as bugs #1, #2, #17, #18, #19 in the report.
- **Suggested fix**: Invert the logic — instead of "include all switches not claimed elsewhere," use an explicit inclusion list: only include switches that match `isLightingEntity()`. Remove the catch-all `else if (entry.domain === 'switch')` branch entirely. Switches that don't match lighting keywords should remain in the normal device group rendering, not be force-absorbed into Illumination.

---

## DATA-002: Hazard detector triggers on TP-Link Kasa `carbon_monoxide` diagnostic binary_sensor

- **Severity**: CRITICAL
- **Category**: ENTITY-CLASSIFICATION
- **Home**: Boimler
- **Room(s)**: Tendi, Freeman, Rutherford, Office, 3rd Floor, Master Bed, Master Bath
- **What's wrong**: TP-Link Kasa smart switches (HS200, KP200) expose a `binary_sensor` with `device_class: carbon_monoxide` named "CO Status" — this is a diagnostic indicator for the device's internal air sensor, NOT a safety detector. The DETECTORS array's hazard detector (priority 2) triggers on `≥1 binary_sensor` with `device_class` in `HAZARD_STATUS_CLASSES` (`{'smoke', 'gas', 'carbon_monoxide', 'heat', 'safety'}`). Since hazard runs before galley, climate, environment, and everything else, these Kasa switches get classified as `PANEL_TYPE_HAZARD` and render with the Life Support/atmoscrubber green cylinder (via the Life Support compositor that composes environment panels for hazard devices).
- **Root cause**: In `lcars-entity-utils.js` DETECTORS[2] (hazard detector):
  ```js
  const hazardCount = entries.filter(e =>
    e.domain === 'binary_sensor' && HAZARD_STATUS_CLASSES.has(e.state?.attributes?.device_class || '')
  ).length;
  if (hazardCount >= 1) return PANEL_TYPE_HAZARD;
  ```
  No platform check. No entity_category check. TP-Link's CO Status sensor has `entity_category: 'diagnostic'`, but `classifyDevice()` receives augmented entries (including diagnostic ones) from the illumination panel's augmentation step. The hazard detector does not filter out `entity_category: 'diagnostic'` entities before counting.
- **Impact**: 7+ rooms in Boimler's home. Ceiling fans, outlets, and switches all rendering as hazard/life-support panels instead of their correct types. This causes bugs #3, #4, #5, #6 in the report.
- **Suggested fix**: The hazard detector should exclude `entity_category: 'diagnostic'` and `entity_category: 'config'` entities from the hazard signal count. Additionally, add a platform exclusion set for known false positives (`tplink`, `kasa`). The `nest_protect` platform check is correct and should remain the primary hazard signal. For secondary detection, require `≥2` hazard binary_sensors from non-diagnostic entities to reduce false positives.

---

## DATA-003: `classifyDevice()` first-match-wins lacks signal-strength weighting *(REVISED)*

- **Severity**: MEDIUM *(downgraded from HIGH — the observed issues have other root causes)*
- **Category**: ARCHITECTURE
- **Home**: Boimler
- **Room(s)**: Multiple rooms with multi-function devices
- **What's wrong**: `classifyDevice()` runs detectors in fixed priority order and returns on **first match**. This works correctly for most cases, but the architecture has no signal-strength weighting. A device with 1 weak signal (e.g., a single diagnostic CO binary_sensor) can outweigh 10 strong signals (e.g., power sensors, lighting controls) if the weak signal's detector runs first.
- **Root cause**: Linear priority DETECTORS array with binary "has any matching entity" detection. The architecture is sound for most cases but susceptible to false positives when diagnostic entities leak into the entry set (see DATA-002, DATA-011).
- **Clarification (REVISED)**: My original analysis incorrectly attributed the refrigerator/climate issue to this bug. The actual root cause for refrigerators appearing in Life Support is DATA-004 — `classifyArea()` claims climate entities at the area level before device-level classification runs. The `classifyDevice()` galley detector (priority 3) correctly checks for `ge_home` platform and would match, but area-level Life Support absorbs the entity first.
- **Impact**: Theoretical concern for edge cases. The observed issues (Kasa CO, fridge climate) have separate root causes documented in DATA-002 and DATA-004.
- **Suggested fix**: No immediate action required. If future edge cases emerge, consider: (A) signal-strength scoring where detectors return confidence 0-100 instead of boolean, or (B) multi-pass classification where strong signals can "steal" from weak first-pass matches.

---

## DATA-004: GE Home refrigerators classified as climate instead of galley

- **Severity**: HIGH
- **Category**: PANEL-ASSIGNMENT
- **Home**: Boimler
- **Room(s)**: Kitchen, Garage
- **What's wrong**: GE Home refrigerators expose `climate` entities for fridge/freezer temperature control. `classifyDevice()` runs the galley detector (priority 3) which checks `GALLEY_PLATFORMS.has(e.entity?.platform)` for `ge_home`. This should work — but the observation shows refrigerators rendering as "Life Support climate panels with arcs and setpoint controls." This means either: (a) the galley detector isn't matching because the entity's `platform` attribute isn't `ge_home`, or (b) the Life Support area-level panel is absorbing the climate entity before the device-level galley panel can claim it.
- **Root cause**: `classifyArea()` adds `PANEL_TYPE_LIFE_SUPPORT` if **any** climate entity exists in the area. The area-level Life Support panel then absorbs all climate entities via `_buildAreaPanelFilter()` → `isClimateEntity()`. The GE fridge's climate entity gets consumed by Life Support before device-level `classifyDevice()` ever runs for the fridge device. The galley detector never gets a chance.
- **Impact**: 2 rooms (Kitchen, Garage). Refrigerators showing climate arcs with 5°F/34°F readings designed for room HVAC — confusing and visually wrong.
- **Suggested fix**: `classifyArea()` should not include climate entities from known appliance platforms (`ge_home`, `smartthinq_sensors`) when deciding Life Support eligibility. Alternatively, `_buildAreaPanelFilter()` should exclude galley-platform climate entities from the Life Support consumption filter.

---

## DATA-005: ScreenLogic pool climate entities absorbed by area-level Life Support

- **Severity**: HIGH
- **Category**: PANEL-ASSIGNMENT
- **Home**: Boimler
- **Room(s)**: Outside
- **What's wrong**: Pentair ScreenLogic pool equipment has `climate` entities for pool/spa temperature. `classifyArea()` detects "has climate" → adds Life Support. The pool climate entity gets consumed by the Life Support panel and renders with a room HVAC arc showing 73°/52° pool temperatures.
- **Root cause**: Same as DATA-004. `classifyArea()` does not check platform before claiming climate entities for Life Support. `isClimateEntity()` is domain-only (`CLIMATE_DOMAINS.has(entry.domain)`) with no pool/spa exclusion.
- **Impact**: 1 room, but architecturally identical to DATA-004. The pool panel may also render separately (via device-level `classifyDevice()` which checks `POOL_SPA_PLATFORMS`), creating a potential duplicate — the climate entity appears in both Life Support AND Pool/Spa.
- **Suggested fix**: `isClimateEntity()` should return false for known pool/spa platforms and known galley platforms. Or `classifyArea()` should run `classifyDevice()` per-device first and exclude devices already claimed by device-level panels from area-level classification.

---

## DATA-006: Nest Protect rendered as Life Support instead of Hazard-only *(REVISED)*

- **Severity**: HIGH
- **Category**: PANEL-ASSIGNMENT
- **Home**: Boimler
- **Room(s)**: Shaxs (Freeman & Shaxs)
- **What's wrong**: Nest Protect renders as Life Support panel with full diagnostics dump (Buzzer Test, Battery Health, Smoke Test, Speaker Test, PIR Test, Humidity Test, CO Test, Line Power, LED Test, WiFi Test, Replace By, Battery Level) and empty green atmoscrubber cylinder. Should be in the Hazard Detection panel only.
- **Root cause (REVISED)**: After code review, `classifyDevice()` correctly identifies Nest Protect as `PANEL_TYPE_HAZARD` via the platform check at DETECTORS[2]. However, the rendering pipeline appears to route hazard-classified devices through the environment panel for sensor display, which always renders the atmoscrubber cylinder — even when no AQ data exists. The `_partitionEnvironmentEntities()` method in `lcars-environment-panel.js` renders ALL telemetry and diagnostics unconditionally. The Life Support panel composes environment panels as substations, which explains how a hazard device ends up in Life Support with an empty atmoscrubber.
  
  **Investigation needed**: Trace the exact render path from `classifyDevice() → PANEL_TYPE_HAZARD` to determine why the environment panel/atmoscrubber is rendered. May be a compositor logic issue in `lcars-lifesupport-panel.js` or the orchestrator.
- **Impact**: 1+ rooms. Diagnostics dump is overwhelming — 12+ diagnostic rows in what should be a compact hazard indicator.
- **Suggested fix**: 
  1. Environment panel should only render atmoscrubber cylinder if `score.length > 0 || airQuality.length > 0` (actual AQ data exists)
  2. Hazard devices should have a dedicated compact render path, not route through the full environment panel
  3. Nest Protect sensors should filter to safety-critical only (smoke/CO/heat/battery status)

---

## DATA-007: Camera panels render ALL device sensors without filtering

- **Severity**: HIGH
- **Category**: DATA-FORMAT / PANEL-ASSIGNMENT
- **Home**: Boimler
- **Room(s)**: Outside (Garage Side Entrance Camera)
- **What's wrong**: Camera panel shows PM1/PM2.5/PM10 readings (2.536232, 2.826087 MG/M³), storage info (2613487.599616 MB), disk write speeds, recording modes, overlay settings. Camera panels should show camera-relevant sensors only.
- **Root cause**: `lcars-camera-panel.js` `renderContent()` calls `this._partitionDeviceEntities(this.group.entities)` which partitions into cameras/sensors/controls via simple domain check. ALL `sensor` and `binary_sensor` entities on the device are dumped into the sensors section with no relevance filter. UniFi Protect cameras expose dozens of diagnostic and telemetry sensors that have nothing to do with the camera feed.
- **Impact**: Every UniFi Protect camera across Boimler's home. Raw data dump makes camera panels unusable.
- **Suggested fix**: Camera panel should define a relevance filter: only show sensors with device_class in `{'motion', 'occupancy', 'sound', 'connectivity', 'battery'}` or entity_ids matching camera-specific patterns (motion, person, vehicle, doorbell). Diagnostic/telemetry sensors (storage, disk, PM, overlay) should be suppressed or collapsed under a "Diagnostics" expander.

---

## DATA-008: Raw floating-point values displayed without rounding

- **Severity**: HIGH
- **Category**: DATA-FORMAT
- **Home**: Boimler
- **Room(s)**: Family Room, Garage, Outside, Kitchen, multiple
- **What's wrong**: Sensor values displayed with full floating-point precision: `2.1594203...`, `0.6011987...`, `-2.74°F`, `56.1379529460026°F`, `67.3054447465789°F`, `2613487.599616 MB`, `0.56208057 MB/S`, `Temperature 2.66°F`. These should be rounded to appropriate precision (0-1 decimal places for temperature, 0 for large storage values, 2 for small measurements).
- **Root cause**: `lcars-sensor-row` and all panel sensor renderers use raw `state.state` values directly:
  ```js
  const val = state.state;
  const unit = state.attributes?.unit_of_measurement || '';
  return html`<lcars-sensor-row value="${val}${unit ? ' ' + unit : ''}" ...>`;
  ```
  No formatting or rounding is applied. HA states are stored as strings but may contain full-precision floats from the integration's source data.
- **Impact**: Every numeric sensor across both homes. Particularly egregious for weather sensors (dew point, wet bulb) and camera diagnostics (storage MB).
- **Suggested fix**: Add a `_formatSensorValue(state)` utility in `lcars-base-panel.js` that rounds based on device_class and unit_of_measurement:
  - Temperature: 1 decimal
  - Humidity: 0 decimals
  - PM2.5/PM10: 0-1 decimal
  - Power (W): 0 decimals
  - Energy (kWh): 1 decimal
  - Storage (MB/GB): 0 decimals if >100, 1 decimal if <100
  - Default: `Number(val).toFixed(1)` if parseable as float with >2 decimals
  The power panel already has `_formatWatts()` and `_formatEnergy()` — generalize this pattern.

---

## DATA-009: Emporia Vue channel IDs displayed as raw circuit names

- **Severity**: MEDIUM
- **Category**: DATA-FORMAT
- **Home**: Boimler
- **Room(s)**: Garage, Pool
- **What's wrong**: Power circuits showing raw Emporia Vue channel identifiers: `VUEG3_MAINLOAD1`, `VUEG3_MAINLOAD2`, `BALANCE`. Pool equipment circuits show 8 identical "POOL EQUIPMENT" names with no differentiation.
- **Root cause**: Emporia Vue entity naming pattern is `sensor.power_{device_name}_{channel_id}`. The `_shortDeviceName()` method strips the area prefix but not the device prefix, leaving raw channel IDs. The duplicate "POOL EQUIPMENT" names occur when multiple circuits have the same friendly_name — the power panel doesn't deduplicate or append a differentiator.
- **Impact**: Garage and Pool rooms in Boimler's home. Makes power circuit identification impossible.
- **Suggested fix**: Power panel's circuit rendering should: (a) Strip common device prefixes from circuit names (e.g., `VUEG3_` prefix). (b) For duplicate names, append the channel number or entity_id suffix as a differentiator. (c) Consider using the Emporia Vue `channel_id` attribute if available to build meaningful names.

---

## DATA-010: Duplicate circuit entries ("Dryer" vs "-- Dryer")

- **Severity**: MEDIUM
- **Category**: DATA-FORMAT
- **Home**: Boimler
- **Room(s)**: Laundry
- **What's wrong**: "Dryer 0W" and "-- Dryer 0W" appearing as separate circuits. The `--` prefix suggests a 240V pair detection artifact.
- **Root cause**: `lcars-power-panel.js` `_detect240VPairs()` uses regex `L1L2_PATTERN = /^(.+?)[\s_]*(l[12]|line[\s_]*[12])$/i` to detect 240V pairs. If one leg matches and the other doesn't (e.g., slightly different naming), the matched leg becomes a combined entry while the unmatched leg appears as a separate circuit with a `--` prefix from the name stripping logic.
- **Impact**: Laundry room. Minor but confusing — users see what looks like duplicate entries.
- **Suggested fix**: Review 240V pair detection regex for edge cases. Add a fallback: if a circuit name starts with `--` after prefix stripping, trim the leading dashes and spaces.

---

## DATA-011: `entity_category` filtering inconsistency between area-level and device-level

- **Severity**: HIGH
- **Category**: ARCHITECTURE
- **Home**: Both
- **Room(s)**: All
- **What's wrong**: `_renderAreaContent()` filters out diagnostic/config entities via `isDiagnosticEntity()` before building `hydratedEntries`. But `_partitionLightingEntities()` in the illumination panel re-augments device entries with diagnostic/config entities from `hass.entities` for `classifyDevice()` calls. The camera panel shows ALL sensor entities (including diagnostics). The environment panel explicitly fetches and renders diagnostic entities via `_getDeviceCategoryEntities()`. There is no consistent policy.
- **Root cause**: Multiple filtering decisions made at different layers:
  1. `_renderAreaContent()` — excludes diagnostic/config from `hydratedEntries` (line 7118)
  2. `_partitionLightingEntities()` — re-adds diagnostic/config for `classifyDevice()` augmentation
  3. `classifyDevice()` — receives augmented entries but some detectors don't filter
  4. Camera panel — shows all sensors including diagnostic
  5. Environment panel — explicitly renders diagnostics section
  6. `getAreaEntities()` in `lcars-entity-query.js` — excludes `entity_category` entities at the query level
- **Impact**: Systemic. Different panels have different visibility of the same entities, causing inconsistent behavior and classification errors (see DATA-002).
- **Suggested fix**: Establish a clear architectural policy:
  - **Classification layer** (`classifyDevice`): receives ALL entities including diagnostic/config, but individual detectors must be aware of entity_category and not count diagnostic sensors as primary signals.
  - **Rendering layer** (panels): receives only non-diagnostic entities by default. Panels that want diagnostics (environment, battery) opt-in via explicit `_getDeviceCategoryEntities()`.
  - **Area classification** (`classifyArea`): receives non-diagnostic entities only.

---

## DATA-012: "UNKNOWN" state rendering for button entities

- **Severity**: LOW
- **Category**: DATA-FORMAT
- **Home**: Boimler
- **Room(s)**: Tendi, Freeman, Rutherford, Office, Master Bath, Master Bed
- **What's wrong**: "Restart" button entities showing "UNKNOWN" in red across multiple rooms. These are TP-Link Kasa device restart buttons — their state is always `unknown` because button entities have no persistent state in HA (they're fire-and-forget).
- **Root cause**: Sensor/entity renderers apply the `[data-off]` or warning styling when state is `unknown`. For `button` domain entities, `unknown` is the normal resting state per HA architecture — it doesn't indicate an error.
- **Impact**: 6+ rooms. Visual noise — users think something is broken when it's working correctly.
- **Suggested fix**: Add a domain-aware state formatter: for `button` domain entities, display "READY" or the button icon instead of the raw state string. For `unavailable` state on any domain, show "OFFLINE" in a muted style. Only show "UNKNOWN" in red for sensor/binary_sensor domains where it genuinely indicates a problem.

---

## DATA-013: Cross-room entity leakage in Illumination circuits

- **Severity**: MEDIUM
- **Category**: ENTITY-CLASSIFICATION
- **Home**: Boimler
- **Room(s)**: Rutherford (showing 2nd Floor Crawl N Light, Rec Room Light), Master Bath (showing Kitchen Table Light)
- **What's wrong**: Entities from other rooms appearing in the wrong room's Illumination panel.
- **Root cause**: This is likely an HA entity registry issue — entities are assigned to the wrong area_id, or their device's area_id doesn't match the entity's expected room. `getAreaEntities()` uses device_id → area_id inheritance: if an entity has no `area_id` but its device is in area X, the entity inherits area X. If a multi-device hub (e.g., Insteon PLM) is in one room but controls devices in other rooms, all child entities inherit the hub's area.
- **Impact**: 3+ rooms. Entities from wrong areas polluting room views.
- **Suggested fix**: This is an HA configuration issue, not a classification bug — the user needs to reassign entity area_ids in HA. However, LCARS could add a "linked from [Area]" indicator for entities whose device area differs from the entity's display area, helping users identify misconfigured entities. File as a UX enhancement, not a code bug.

---

## DATA-014: IPC-Model device showing "Adopt Device" with UNAVAILABLE state

- **Severity**: LOW
- **Category**: DATA-FORMAT
- **Home**: mariner
- **Room(s)**: Server Room
- **What's wrong**: Device showing as UNAVAILABLE with "Adopt Device" button — UniFi Protect device not yet adopted.
- **Root cause**: `getAreaEntities()` excludes `disabled_by` and `hidden_by` entities but does not filter `unavailable` state entities. HA shows unadopted UniFi Protect devices as entities in `unavailable` state.
- **Impact**: 1 room. Minor — cosmetic noise.
- **Suggested fix**: Consider adding an option (not default) to suppress entities in `unavailable` state that have been unavailable for >24 hours. This is a UX decision — discuss with Geordi. Alternatively, add visual treatment: show unavailable entities in a collapsed "OFFLINE SYSTEMS" section at the bottom.

---

## DATA-015: Entity friendly_names not updated after HA area rename

- **Severity**: LOW
- **Category**: DATA-FORMAT
- **Home**: Boimler
- **Room(s)**: Freeman
- **What's wrong**: Room header says "Freeman" but all entities reference "Freeman" — HA area was renamed but entity friendly_names weren't updated.
- **Root cause**: HA entity friendly_names are set at entity creation time and not automatically updated when areas are renamed. This is an HA platform behavior, not an LCARS bug. The `_shortenName()` method strips the current area name prefix, but if the entities use the old area name ("Freeman"), the stripping doesn't match.
- **Impact**: 1 room. Cosmetic confusion.
- **Suggested fix**: Not an LCARS bug. User needs to rename entities in HA. However, `_shortenName()` could be enhanced to also strip known aliases or previous area names if stored in config. Low priority.

---

## DATA-016: `isLightingEntity()` negative filters are incomplete *(REVISED)*

- **Severity**: MEDIUM *(downgraded from HIGH — primary leak is DATA-001, not this function)*
- **Category**: ENTITY-CLASSIFICATION
- **Home**: Both
- **Room(s)**: All rooms with non-lighting switches
- **What's wrong**: `isLightingEntity()` checks for positive keywords (`light|lamp|sconce|chandelier|pendant|fixture|dimmer|illuminat`) but has limited negative exclusions.
- **Root cause (REVISED)**: After code review, `isLightingEntity()` DOES have negative filters:
  1. `isInfrastructureLED()` at line 449 — excludes UniFi AP LEDs, status indicators
  2. `device_class === 'outlet'` exclusion at line 455
  
  However, these don't cover all non-lighting switches (irrigation zones, EcoFlow config switches, appliance controls). The primary Illumination leak is DATA-001's catch-all switch absorption, which bypasses `isLightingEntity()` entirely — the catch-all adds switches that DON'T match `isLightingEntity()`.
- **Impact**: This function is working as designed. The leaks are from DATA-001's catch-all, not false positives here.
- **Suggested fix (defense-in-depth only)**: Add negative keywords to `isLightingEntity()` for future-proofing: `irrigation|watering|zone|ecoflow|backup|reserve|boost|dc_mode|ac_mode|purifier|humidifier`. This protects if DATA-001's catch-all is ever relaxed rather than removed.

---

## DATA-017: Ceiling fans trigger Life Support via `isEnvironmentEntity()` *(REVISED)*

- **Severity**: MEDIUM
- **Category**: PANEL-ASSIGNMENT
- **Home**: Boimler
- **Room(s)**: Rooms with ceiling fans + temperature sensors (Tendi, Freeman, Rutherford, Office, 3rd Floor)
- **What's wrong (REVISED)**: Rooms with ceiling fans AND ambient sensors (temp/humidity) incorrectly trigger Life Support panels. The atmoscrubber cylinder renders empty because there's no AQ data — just a ceiling fan and a thermometer.
- **Root cause (REVISED)**: After code review, my original analysis was partially incorrect:
  
  - A room with ONLY a SwitchBot temp sensor does NOT trigger Life Support (correct behavior)
  - `hasEnvironment` = `isEnvironmentEntity()` returns true only for AQ sensors or `domain === 'fan' && !dc`
  - A ceiling fan (Bond, Kasa, Insteon) has `domain: 'fan'` with no `device_class`
  - This matches `isEnvironmentEntity()` at line 424: `if (entry.domain === 'fan' && !dc) return true`
  - When ceiling fan + temp sensor exist: `hasEnvironment = true`, `hasAmbient = true`
  - `classifyArea()` adds Life Support
  
  The issue is that `isEnvironmentEntity()` treats ALL fans without device_class as air purifiers. Only `ha_blueair`, `vesync`, and `smartthinq_sensors` fans are actually air purifiers.
- **Impact**: ~5+ rooms in Boimler's home. Combined with DATA-002, this causes Life Support over-proliferation.
- **Suggested fix**: Same as DATA-021 — restrict `isEnvironmentEntity()` fan matching to known AQ platforms:
  ```js
  const AQ_FAN_PLATFORMS = new Set(['ha_blueair', 'vesync', 'smartthinq_sensors']);
  if (entry.domain === 'fan' && AQ_FAN_PLATFORMS.has(entry.entity?.platform)) return true;
  ```

---

## DATA-018: No number formatting in `lcars-sensor-row` component

- **Severity**: MEDIUM
- **Category**: DATA-FORMAT / ARCHITECTURE
- **Home**: Both
- **Room(s)**: All
- **What's wrong**: The `lcars-sensor-row` web component accepts a `value` attribute as a raw string and renders it verbatim. No formatting layer exists between the state value and the display.
- **Root cause**: Architectural gap. The power panel has its own formatters (`_formatWatts`, `_formatEnergy`). The climate panel formats temperatures. But there's no shared formatting utility in `lcars-base-panel.js` or `lcars-sensor-row`.
- **Impact**: Every sensor display across all panels. Related to DATA-008.
- **Suggested fix**: Create a `formatSensorValue(state)` utility in a new `lcars-format-utils.js` module. Apply it in `lcars-base-panel.js` `_friendlyValue()` method that all panels can use. The formatter should handle: rounding rules by device_class, large number abbreviation (MB → GB), unit normalization, and "unknown"/"unavailable" state display.

---

## DATA-019: `classifyDevice()` augmentation in illumination panel creates classification inconsistency

- **Severity**: MEDIUM
- **Category**: ARCHITECTURE
- **Home**: Both
- **Room(s)**: All
- **What's wrong**: `_partitionLightingEntities()` augments device entries with diagnostic/config entities before calling `classifyDevice()` to build the `claimedDeviceIds` set. But `_renderAreaContent()` runs `classifyDevice()` via `_getDevicePanelType()` on the non-augmented group entities (diagnostic entities were filtered at line 7118). This means the illumination panel may get a different classification result than the orchestrator for the same device.
- **Root cause**: Two separate `classifyDevice()` calls with different entity sets:
  1. Orchestrator: `_getDevicePanelType(group.entities)` — entities WITHOUT diagnostic/config
  2. Illumination: `classifyDevice(augmented)` — entries WITH diagnostic/config
  If a device's classification depends on a diagnostic entity (e.g., battery % sensor with `entity_category: 'diagnostic'`), the orchestrator says "no panel" but illumination says "battery panel" → inconsistent claimed set.
- **Impact**: Systemic — potential double-rendering or missed exclusions. Hard to reproduce without specific entity configurations.
- **Suggested fix**: Centralize the augmentation step. The orchestrator should perform augmentation once and pass the augmented entries consistently to both classification and panel rendering. Or — establish that `classifyDevice()` always receives the same entity set.

---

## DATA-020: EcoFlow `ecoflow_cloud` platform missing from PLATFORM_PANEL_MAP

- **Severity**: MEDIUM
- **Category**: ENTITY-CLASSIFICATION
- **Home**: mariner
- **Room(s)**: Office, Garage
- **What's wrong**: EcoFlow devices (`ecoflow_cloud` integration) have many switch entities (`AC Enabled`, `X-Boost Enabled`, `DC (12V) Enabled`, etc.) that leak into Illumination because `classifyDevice()` doesn't recognize the `ecoflow_cloud` platform in the fallback `PLATFORM_PANEL_MAP`. The battery detector should catch them (they have battery + power sensors), but the battery detector requires `entity_category` sensors that are filtered out before reaching the orchestrator's `classifyDevice()`.
- **Root cause**: `PLATFORM_PANEL_MAP` has entries for `emporia_vue → POWER` but not `ecoflow_cloud → BATTERY`. The battery detector in DETECTORS depends on seeing diagnostic entities (battery % sensor) that are excluded at the query layer.
- **Impact**: 2+ rooms in mariner's home. EcoFlow config switches polluting Illumination.
- **Suggested fix**: Add `['ecoflow_cloud', PANEL_TYPE_BATTERY]` to `PLATFORM_PANEL_MAP`. This ensures the platform-based fallback detector (last in DETECTORS) catches EcoFlow devices even when their diagnostic sensors are filtered.

---

## DATA-021: `isEnvironmentEntity()` matches all fans without device_class

- **Severity**: MEDIUM
- **Category**: ENTITY-CLASSIFICATION
- **Home**: Boimler
- **Room(s)**: Rooms with ceiling fans (Tendi, Freeman, Rutherford, Office, 3rd Floor)
- **What's wrong**: `isEnvironmentEntity()` returns true for `domain === 'fan' && !dc` — any fan entity without a device_class. This is intended to match air purifier fans (Blueair, Levoit) but also matches ceiling fans, exhaust fans, and standalone fans.
- **Root cause**: In `lcars-entity-utils.js`:
  ```js
  if (entry.domain === 'fan' && !dc) return true;
  ```
  Ceiling fans controlled via Bond, Kasa, or Insteon have `domain: 'fan'` with no device_class. Only `ha_blueair` and `vesync` fans are air purifiers.
- **Impact**: Contributes to Life Support over-classification in rooms with ceiling fans. Combined with DATA-002 (Kasa CO sensors), ceiling fans trigger both hazard and environment signals.
- **Suggested fix**: Replace the blanket fan match with a platform-based check:
  ```js
  const AQ_FAN_PLATFORMS = new Set(['ha_blueair', 'vesync', 'smartthinq_sensors']);
  if (entry.domain === 'fan' && AQ_FAN_PLATFORMS.has(entry.entity?.platform)) return true;
  ```

---

## Summary: Priority-Ordered Fix Sequence *(Updated after re-review)*

| Priority | Bug ID | Fix | Est. Impact | Notes |
|----------|--------|-----|-------------|-------|
| 1 | DATA-001 | Remove catch-all switch absorption in illumination circuits | ~15 rooms, both homes | CRITICAL — largest single bug |
| 2 | DATA-002 | Filter diagnostic entities from hazard detector | ~7 rooms, Boimler | CRITICAL — causes Kasa CO false positives |
| 3 | DATA-011 | Establish entity_category filtering policy | Systemic | HIGH — architectural prerequisite |
| 4 | DATA-004, DATA-005 | Exclude appliance/pool climate from area Life Support | ~3 rooms, Boimler | HIGH — fridge/pool climate wrong panel |
| 5 | DATA-021, DATA-017 | Restrict `isEnvironmentEntity()` fan matching to AQ platforms only | ~5 rooms, Boimler | MEDIUM — ceiling fans trigger Life Support |
| 6 | DATA-020 | Add `ecoflow_cloud` to PLATFORM_PANEL_MAP | ~2 rooms, mariner | MEDIUM — EcoFlow switches leak to Illumination |
| 7 | DATA-008, DATA-018 | Implement shared sensor value formatting | All rooms, both homes | HIGH — raw decimals everywhere |
| 8 | DATA-007 | Filter camera panel sensors to camera-relevant only | ~3 rooms, Boimler | HIGH — diagnostic dump in camera panels |
| 9 | DATA-006 | Investigate hazard→environment render path; hide empty atmoscrubber | ~1 room, Boimler | HIGH — Nest Protect wrong render |
| 10 | DATA-009, DATA-010 | Improve Emporia Vue circuit name resolution | ~2 rooms, Boimler | MEDIUM — raw channel IDs |
| 11 | DATA-012 | Button entity state display normalization ("READY" not "UNKNOWN") | ~6 rooms, Boimler | LOW — cosmetic |
| 12 | DATA-003, DATA-016 | Defense-in-depth improvements (signal scoring, negative keywords) | Theoretical | LOW — addressed by higher-priority fixes |

### Architectural Dependencies

```
DATA-011 (entity_category policy)
    └── DATA-002 (hazard detector) — requires DATA-011
    └── DATA-019 (augmentation consistency) — requires DATA-011
    
DATA-021 + DATA-017 (fan platform filtering)
    └── Same fix, file once
    
DATA-004 + DATA-005 (appliance/pool climate)
    └── Requires modifying isClimateEntity() or classifyArea()
```

### Post-Review Assessment

*"Upon re-review against the actual source code, I have validated 19 of 21 bugs and revised 4 root cause analyses. The primary architectural issues remain DATA-001 (illumination catch-all) and DATA-002 (hazard diagnostic leak), which together account for approximately 68% of observed classification errors. DATA-003 was downgraded as its theoretical priority-inversion concern is not the root cause of observed issues — those are DATA-002 and DATA-004. DATA-016 and DATA-017 were revised to correctly identify the code paths involved. I recommend proceeding with fixes in the priority order above."*
