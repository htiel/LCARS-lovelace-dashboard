## Data — Architecture Review

**Reviewer**: Data (Project Architect & Performance Engineer)  
**Date**: Stardate 2026.04.13  
**Assessment**: SOUND WITH ADVISORIES

### Component Architecture
- The extension of `LcarsDevicePanelBase` is correctly specified. The 2-column asymmetric grid (metadata | media+transport) follows the Device Panel Spec §2 pattern precisely. The idle-vs-active state split via CSS class toggling (`.idle`) is efficient — it avoids conditional DOM construction and leverages Lit's attribute-based rendering.
- The `classifyMediaEntities()` function (§8) correctly separates `media_player`, `remote`, `sensor`, and control domains. The early `continue` pattern is efficient. However, the function accepts raw entities but does not specify whether these are entity registry entries or `hass.states` objects — this ambiguity should be clarified during implementation.
- The `MEDIA_FEATURES` bitmask approach (§3.5) is correct and matches the HA `MediaPlayerEntityFeature` enum. The `hasFeature()` utility is a clean pattern that should be extracted to a shared utility module — it will be needed by future panels.

### Performance Considerations
- **Progress bar interpolation** (§3.4, `getMediaProgress()`): The `Date.now()` call in `getMediaProgress()` is invoked on every render when state is `playing`. Lit will call `render()` whenever `hass` updates (which occurs on every state change globally). This creates unnecessary recomputation. **Advisory**: Gate progress interpolation behind a 1-second `setInterval` timer that triggers `requestUpdate()`, rather than recomputing on every `hass` property change. This reduces interpolation calls from ~50/sec (HA state churn) to 1/sec.
- **Album art image loading**: The `entity_picture` attribute provides a URL proxied through HA at `/api/media_player_proxy/`. Image decoding is the browser's responsibility. The crossfade animation (400ms) is lightweight. No concern.
- **Volume bar drag interaction** (§3.7): `handleVolumeInteraction()` is called on every `mousemove` during drag. Each call triggers `hass.callService('media_player', 'volume_set')`. **Advisory**: Throttle volume service calls to max 1 per 100ms using a simple timestamp guard. HA WebSocket can handle rapid calls, but the media player device (HomePod, Sonos) may not.
- **Bundle impact estimate**: ~4.5 KiB minified/gzipped. The CSS is declarative (no runtime generation), helpers are pure functions, and the `MEDIA_FEATURES` bitmask is a static const. The `MEDIA_ACTIONS` map (§8) avoids string concatenation at runtime. Acceptable addition to the 203 KiB bundle — roughly 2.2% increase.

### HA Integration Patterns
- All service calls (§8) correctly use `hass.callService(domain, service, data)` format. The `MEDIA_ACTIONS` map is a clean pattern for dispatching transport commands.
- The `supported_features` bitmask check before rendering transport buttons is correct — this prevents rendering buttons for unsupported features, reducing DOM nodes.
- Speaker grouping via `group_members` attribute is correctly read from state attributes. The `supportsGrouping()` check uses the proper feature flag. No WebSocket subscription beyond the standard `hass` property is needed — grouping data flows through entity state.
- The source selector uses `source_list` from entity attributes — no separate API call required. This is correct and efficient.

### Code Quality & Reusability
- **DRY compliance**: `getMediaStateColor()`, `getMediaStateLabel()`, `isActivePlayback()` follow the same switch-statement pattern as other panel specs. These utility functions should be extracted to a shared `lcars-state-colors.js` module rather than duplicated per panel file. I count 6 specs that each define a `get*Color()` function with identical structure.
- **KISS compliance**: The track info display (§3.3) is clean — text overflow handled by CSS `text-overflow: ellipsis`. No JavaScript truncation needed.
- **YAGNI flag**: The sound mode selector for Sonos (§9) adds conditional complexity for a single device type. Consider deferring this to a future iteration unless the Admiral has Sonos devices.
- **Configuration schema**: No custom YAML config beyond what `LcarsDevicePanelBase` provides. The panel is auto-discovered via `media_player` domain. This is correct — the media panel should not require manual configuration.

### Recommendations
1. **P1**: Extract `hasFeature()`, `getMediaStateColor()`, and time formatting utilities to a shared `lcars-helpers.js` or `lcars-state-utils.js` module. These patterns recur across media, climate, alarm, weather, and irrigation panels. Estimated dedup savings: ~1.2 KiB across all panels.
2. **P1**: Throttle volume service calls during drag to max 10/sec (100ms debounce). Use `this._lastVolumeCall` timestamp comparison — no external deps needed.
3. **P2**: Gate progress interpolation behind a dedicated 1-second timer rather than recomputing on every `hass` update. Start the timer when state transitions to `playing`, stop on any other state. Clean up in `disconnectedCallback()`.
4. **P2**: Clarify in the spec whether `classifyMediaEntities()` expects entity registry entries (from `config/entity_registry/list`) or `hass.states` objects. The property access patterns differ (`original_device_class` vs `attributes.device_class`).
5. **P3**: Defer Sonos sound mode selector (§9) unless validated against the Admiral's device inventory. Apply YAGNI.

---
