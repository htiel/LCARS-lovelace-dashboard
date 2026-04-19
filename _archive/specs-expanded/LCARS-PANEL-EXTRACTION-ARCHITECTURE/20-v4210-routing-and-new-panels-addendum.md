## v4.21.0 Addendum — Platform-to-Panel Routing (4X-44), Media Consolidation (4X-43), Weather/Pool Detection (4X-36/37), New Panels (4X-39/40/41)

**Status**: IMPLEMENTED — v4.21.0-rc.1
**Date**: 2026-04-17

---

### D6. Platform-to-Panel Routing Map (4X-44)

`PLATFORM_PANEL_MAP` in `lcars-entity-utils.js` — master routing table:

| Platform | Panel Type | Integration |
|----------|-----------|-------------|
| unifiprotect | camera | UniFi Protect |
| blink | camera | Blink |
| screenlogic, iaqualink, waterguru, pentair, poolmath | aquatics | Pool/Spa controllers |
| weatherflow, weatherlink | weather | Weather stations |
| rachio, rainbird, rainmachine, opensprinkler, flume | irrigation | Irrigation controllers |
| nest_protect | hazard | Nest Protect smoke/CO |
| ge_home, smartthinq_sensors | galley | Smart appliances |
| ha_blueair, vesync | environment | Air purifiers |
| emporia_vue | power | Power monitoring |

Platform-based fallback detector runs last in DETECTORS array.

### D7. Diagnostic Entity Filter (4X-44)

`isDiagnosticEntity(entry)` — returns `true` for `entity_category === 'diagnostic'` or `'config'`. Applied in `_renderAreaContent()` after entity hydration, before any panel rendering.

### D8. Media Consolidation (4X-43)

Media panel promoted to area-level panel type via `classifyArea()`. All `media_player` entities in a room consolidate into one panel.

- `_selectPrimary(players)` — playing > paused > most supported_features
- `_renderSecondaryOutputs(secondaries)` — compact rows with play/pause + volume
- Subsumes per-device media panels via `subsumedDeviceTypes`

### D9. Weather Detection (4X-36)

`WEATHER_PLATFORMS` set + `WEATHER_SENSOR_CLASSES` device_class matching. ≥2 weather sensor classes on a device triggers weather panel. Platform check runs first.

### D10. Pool/Spa Detection (4X-37)

`POOL_SPA_PLATFORMS` set added. Platform check runs before entity_id/preset heuristics.

### D11. Viewport Controls Panel (4X-41)

`PANEL_TYPE_VIEWPORT` — area-level panel for cover entities with blind/shade/curtain/awning/shutter device classes. Excludes security covers (garage_door/gate/door → Tactical). Open/close/stop controls, position display. Left column, priority 4.5.

### D12. Hazard Detection Panel (4X-39)

`PANEL_TYPE_HAZARD` — per-device status cards for smoke/CO/heat detectors. Groups by device_id, shows status indicators + battery overview. Right column, priority 7. Detection: `nest_protect` platform OR ≥1 smoke/CO/heat binary sensor.

### D13. Galley Systems Panel (4X-40)

`PANEL_TYPE_GALLEY` — per-device appliance cards with cook status, temperature, timer display. Left column, priority 4.7. Detection: `ge_home` or `smartthinq_sensors` platform.
