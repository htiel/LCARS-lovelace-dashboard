# Home Assistant GitHub Organization & Source Reference
> Compiled 2026-04-11 by Data (research-only, no code changes)
> Sources: GitHub web fetch of 22+ pages across home-assistant/, hacs/, OHF-Voice/ orgs
> HA Core Current: 2026.4.1 | Frontend Current: 20260325.7 | HAOS Current: 17.2

---

## 1. GitHub Org Repo Map

### home-assistant/ (104 repositories total)

| Repo | Language | Stars | Purpose |
|---|---|---|---|
| **core** | Python | 86k | Main backend: integrations, state machine, WebSocket API, entity/device/area registries |
| **frontend** | TypeScript | 5.4k | Lovelace dashboard UI, web components, panels, dialogs |
| **supervisor** | Python | 2.1k | Container orchestrator for HAOS: manages Core, Apps, networking, updates |
| **operating-system** | Python/Shell | 7k | Buildroot-based Linux OS (HAOS): runs Docker with Supervisor + Core |
| **home-assistant.io** | HTML | 9.1k | User-facing documentation site |
| **developers.home-assistant** | JavaScript | 437 | Developer documentation site (Docusaurus) |
| **android** | Kotlin | 3.5k | Android companion app |
| **iOS** | Swift | (pinned) | iOS companion app |
| **brands** | Shell | 382 | Logo/icon assets for all integrations |
| **version** | Shell | 76 | Version tracking files (stable.json, beta.json, dev.json) |
| **docker-base** | Dockerfile | 101 | Base Docker images for HA containers |
| **tempio** | Go | 20 | Template helper for config files (Go-based) |
| **landingpage** | Go | 12 | Supervisor landing page |
| **architecture** | Markdown | — | ADRs (Architectural Decision Records) for the project |
| **addons** | — | — | Official add-on (App) repositories |
| **actions** | — | — | GitHub Actions (hassfest, wheels, etc.) |
| **wheels** | — | — | Pre-built Python wheels for HA Core |
| **cli** | — | — | Supervisor CLI tool |
| **analytics** | — | — | Analytics collection/dashboard |
| **netdisco** | Python | — | Network discovery library |

### Adjacent Orgs
| Repo | Org | Purpose |
|---|---|---|
| **OHF-Voice/intents** | OHF-Voice | Voice assistant intent definitions (594 stars, 351 contributors, 68 releases) |
| **hacs/integration** | hacs | HACS custom component manager (7.3k stars, latest v2.0.5) |
| **hacs/default** | hacs | Default repository list (plain text file of owner/repo pairs) |

---

## 2. Core Repo Structure

### Top-Level: `home-assistant/core`
```
homeassistant/
  __init__.py          # HomeAssistant class, core bootstrap
  core.py              # HomeAssistant, StateMachine, EventBus, ServiceRegistry
  config.py            # Config loading, YAML processing
  loader.py            # Integration/platform loading
  const.py             # Constants (domains, attributes, events)
  components/          # ~2400+ built-in integrations
    websocket_api/     # WS API infrastructure
    lovelace/          # Lovelace dashboard backend
    frontend/          # Frontend panel + JS resource loading
    http/              # HTTP server (aiohttp)
    camera/            # Camera platform
    sensor/            # Sensor platform
    light/             # Light platform
    ...
  helpers/             # Shared infrastructure modules (50+ files)
    entity_registry.py       # EntityRegistry, RegistryEntry (2509 lines)
    device_registry.py       # DeviceRegistry, DeviceEntry (1922 lines)
    area_registry.py         # AreaRegistry, AreaEntry (595 lines)
    floor_registry.py        # FloorRegistry, FloorEntry
    label_registry.py        # LabelRegistry
    category_registry.py     # CategoryRegistry
    storage.py               # Async JSON storage (Store class)
    entity.py                # Base Entity class
    entity_platform.py       # Platform entity management
    entity_component.py      # Component entity management
    config_validation.py     # Voluptuous validators (cv.*)
    config_entry_flow.py     # Config entry flow helpers
    aiohttp_client.py        # Async HTTP client sessions
    collection.py            # Observable collections
    singleton.py             # Singleton pattern helper
    translation.py           # Translation loading
    update_coordinator.py    # DataUpdateCoordinator pattern
    template/                # Jinja2 template engine
    service_info/            # Service discovery info
tests/              # Mirrors homeassistant/ structure
machine/            # Machine type definitions for image builds
pylint/             # Custom pylint rules
script/             # Dev scripts (hassfest, etc.)
```

### Components Directory Structure (per integration)
```
homeassistant/components/<domain>/
  __init__.py          # async_setup / async_setup_entry
  manifest.json        # Integration metadata
  config_flow.py       # Config flow UI
  const.py             # Constants
  sensor.py            # Sensor platform
  light.py             # Light platform (etc.)
  strings.json         # English translations
  services.yaml        # Service definitions
  diagnostics.py       # Diagnostics download
  icons.json           # MDI icons for entities
```

### Key Helper Modules for LCARS Dashboard
| Module | Size | Purpose |
|---|---|---|
| `entity_registry.py` | 2509 lines, 95.7 KB | Entity CRUD, indexing by device/area/config_entry/label |
| `device_registry.py` | 1922 lines, 75.2 KB | Device CRUD, collision detection, config entry management |
| `area_registry.py` | 595 lines, 20.8 KB | Area CRUD, floor/label indexing, reorder support |
| `storage.py` | — | `Store` class: async JSON persistence with versioned migration |
| `collection.py` | — | Observable collection pattern (used by Lovelace dashboards) |
| `config_validation.py` | — | `cv.*` validators for voluptuous schemas |

---

## 3. Frontend Repo Structure

### Top-Level: `home-assistant/frontend`
```
src/
  types.ts              # HomeAssistant interface definition (371 lines)
  auth/                 # Auth UI
  cast/                 # Chromecast support
  common/               # Shared utilities
    entity/             # Entity name computation, domain detection
    string/             # String compare, slugify
    translations/       # LocalizeFunc
    util/               # Debounce, time cache
  components/           # Reusable web components (ha-card, ha-icon, etc.)
  data/                 # Data types and WS API calls
    area/               # AreaRegistryEntry, CRUD functions
      area_registry.ts
    device/             # DeviceRegistryEntry, CRUD functions
      device_registry.ts
    entity/             # EntityRegistryEntry, CRUD + display functions
      entity_registry.ts
      entity_sources.ts
    ws-area_registry.ts      # WS subscribe/fetch for areas
    ws-device_registry.ts    # WS subscribe/fetch for devices
    camera.ts           # Camera WS commands + types
    lovelace.ts         # Lovelace config types
    lovelace/           # Lovelace config sub-types
      config/
        types.ts        # LegacyLovelaceConfig, fetchConfig
        section.ts      # LovelaceSectionConfig
        view.ts         # LovelaceViewConfig
    frontend.ts         # CoreFrontendUserData, SystemData
    translation.ts      # FrontendLocaleData, getHassTranslations
    ws-themes.ts        # Themes type
    registry.ts         # Base RegistryEntry type
    config_entries.ts   # ConfigEntry type
    auth.ts             # getSignedPath
  dialogs/              # Dialog components (more-info, confirmation, etc.)
  entrypoints/          # Build entry points
  external_app/         # ExternalMessaging for companion apps
  layouts/              # Layout components
  managers/             # State managers
  mixins/               # LitElement mixins
  panels/               # Top-level panel components
    lovelace/           # Lovelace panel
      cards/            # Built-in card elements (hui-card, etc.)
      badges/           # Badge elements
      sections/         # Section elements
      create-element/   # Factory functions for cards/badges/rows
      custom-card-helpers.ts  # Exported helpers for custom cards
      types.ts          # Lovelace panel internal types
  resources/            # CSS, static resources
  state/                # State management
  state-control/        # State control web components
  state-display/        # State display components
  state-summary/        # State summary components
  translations/         # en.json and translation infrastructure
  types/                # Additional TypeScript types
  util/                 # General utilities
build-scripts/          # Webpack/Rspack build configuration
gallery/                # Component gallery (dev tool)
demo/                   # Demo mode
cast/                   # Cast entrypoint
```

### Build Stack
- **Node.js**: v24.14.1 (per .nvmrc)
- **Package manager**: Yarn v4.13.0
- **TypeScript**: v6
- **Build**: Webpack + Rspack
- **UI framework**: LitElement (web components)
- **Latest release**: 20260325.7

---

## 4. Frontend TypeScript Types

### `HomeAssistant` Interface (the `hass` object)

The `HomeAssistant` interface is composed of multiple sub-interfaces:

```typescript
export interface HomeAssistant
  extends
    HomeAssistantRegistries,         // entities, devices, areas, floors
    HomeAssistantInternationalization, // language, locale, localize, translations
    HomeAssistantApi,                // callService, callApi, callWS, sendWS, fetchWithAuth
    HomeAssistantFormatters,         // formatEntityState, formatEntityAttributeValue, etc.
    HomeAssistantConnection,         // connection, connected, hassUrl
    HomeAssistantUI,                 // themes, panels, panelUrl, dockedSidebar, etc.
    HomeAssistantConfig {            // auth, config, user, userData, systemData
  states: HassEntities;              // {entity_id: HassEntity}
  services: HassServices;            // available service definitions
  resources: Resources;              // translation resources
}
```

#### `HomeAssistantRegistries`
```typescript
export interface HomeAssistantRegistries {
  entities: Record<string, EntityRegistryDisplayEntry>;
  devices: Record<string, DeviceRegistryEntry>;
  areas: Record<string, AreaRegistryEntry>;
  floors: Record<string, FloorRegistryEntry>;
}
```

#### `HomeAssistantApi`
```typescript
export interface HomeAssistantApi {
  callService<T = any>(
    domain: string, service: string,
    serviceData?: Record<string, any>,
    target?: HassServiceTarget,
    notifyOnError?: boolean,
    returnResponse?: boolean
  ): Promise<ServiceCallResponse<T>>;
  callApi<T>(method: "GET"|"POST"|"PUT"|"DELETE", path: string,
    parameters?: Record<string, any>, headers?: Record<string, string>): Promise<T>;
  callApiRaw(method: "GET"|"POST"|"PUT"|"DELETE", path: string,
    parameters?: Record<string, any>, headers?: Record<string, string>,
    signal?: AbortSignal): Promise<Response>;  // introduced 2024.11
  fetchWithAuth(path: string, init?: Record<string, any>): Promise<Response>;
  sendWS(msg: MessageBase): void;
  callWS<T>(msg: MessageBase): Promise<T>;
}
```

#### `HomeAssistantConnection`
```typescript
export interface HomeAssistantConnection {
  connection: Connection;     // home-assistant-js-websocket Connection
  connected: boolean;
  debugConnection: boolean;
  hassUrl(path?): string;     // Resolve relative path to full HA URL
}
```

#### `HomeAssistantUI`
```typescript
export interface HomeAssistantUI {
  themes: Themes;
  selectedTheme: ThemeSettings | null;
  panels: Panels;             // Record<string, PanelInfo>
  panelUrl: string;
  dockedSidebar: "docked" | "always_hidden" | "auto";
  kioskMode: boolean;
  enableShortcuts: boolean;
  vibrate: boolean;
  suspendWhenHidden: boolean;
}
```

#### `HomeAssistantConfig`
```typescript
export interface HomeAssistantConfig {
  auth: Auth & { external?: ExternalMessaging };
  config: HassConfig;         // latitude, longitude, unit_system, etc.
  user?: CurrentUser;         // id, is_owner, is_admin, name, credentials
  userData?: CoreFrontendUserData;
  systemData?: CoreFrontendSystemData;
}
```

#### `HomeAssistantInternationalization`
```typescript
export interface HomeAssistantInternationalization {
  language: string;
  selectedLanguage: string | null;
  locale: FrontendLocaleData;
  localize: LocalizeFunc;
  translationMetadata: TranslationMetadata;
  loadBackendTranslation(category, integrations?, configFlow?): Promise<LocalizeFunc>;
  loadFragmentTranslation(fragment: string): Promise<LocalizeFunc | undefined>;
}
```

#### `HomeAssistantFormatters`
```typescript
export interface HomeAssistantFormatters {
  formatEntityState(stateObj: HassEntity, state?: string): string;
  formatEntityStateToParts(stateObj: HassEntity, state?: string): ValuePart[];
  formatEntityAttributeValue(stateObj: HassEntity, attribute: string, value?: any): string;
  formatEntityAttributeValueToParts(stateObj: HassEntity, attribute: string, value?: any): ValuePart[];
  formatEntityAttributeName(stateObj: HassEntity, attribute: string): string;
  formatEntityName(stateObj: HassEntity, type, separator?): string;
}
```

#### `PanelInfo`
```typescript
export interface PanelInfo<T = Record<string, any> | null> {
  component_name: string;
  config: T;
  icon: string | null;
  title: string | null;
  url_path: string;
  config_panel_domain?: string;
  default_visible?: boolean;
  require_admin?: boolean;
  show_in_sidebar?: boolean;
}
```

#### `CurrentUser`
```typescript
export interface CurrentUser {
  id: string;
  is_owner: boolean;
  is_admin: boolean;
  name: string;
  credentials: Credential[];
  mfa_modules: MFAModule[];
}
```

### `EntityRegistryEntry` (Full)
```typescript
export interface EntityRegistryEntry extends RegistryEntry {
  id: string;
  entity_id: string;
  name: string | null;
  icon: string | null;
  platform: string;
  config_entry_id: string | null;
  config_subentry_id: string | null;
  device_id: string | null;
  area_id: string | null;
  labels: string[];
  disabled_by: "user" | "device" | "integration" | "config_entry" | null;
  hidden_by: Exclude<EntityRegistryEntry["disabled_by"], "config_entry">;
  entity_category: "config" | "diagnostic" | null;
  has_entity_name: boolean;
  original_name?: string;
  unique_id: string;
  translation_key?: string;
  options: EntityRegistryOptions | null;
  categories: Record<string, string>;
}
```

### `EntityRegistryDisplayEntry` (Compact, on hass.entities)
```typescript
export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string;
  icon?: string;
  device_id?: string;
  area_id?: string;
  labels: string[];
  hidden?: boolean;
  entity_category?: "config" | "diagnostic";
  translation_key?: string;
  platform?: string;
  display_precision?: number;
  has_entity_name?: boolean;
}
```

### `ExtEntityRegistryEntry` (Extended, fetched on demand)
```typescript
export interface ExtEntityRegistryEntry extends EntityRegistryEntry {
  capabilities: Record<string, unknown>;
  original_icon?: string;
  device_class?: string;
  original_device_class?: string;
  aliases: (string | null)[];
}
```

### `DeviceRegistryEntry`
```typescript
export interface DeviceRegistryEntry extends RegistryEntry {
  id: string;
  config_entries: string[];
  config_entries_subentries: Record<string, (string | null)[]>;
  connections: [string, string][];
  identifiers: [string, string][];
  manufacturer: string | null;
  model: string | null;
  model_id: string | null;
  name: string | null;
  labels: string[];
  sw_version: string | null;
  hw_version: string | null;
  serial_number: string | null;
  via_device_id: string | null;
  area_id: string | null;
  name_by_user: string | null;
  entry_type: "service" | null;
  disabled_by: "user" | "integration" | "config_entry" | null;
  configuration_url: string | null;
  primary_config_entry: string | null;
}
```

### `AreaRegistryEntry`
```typescript
export interface AreaRegistryEntry extends RegistryEntry {
  aliases: string[];
  area_id: string;
  floor_id: string | null;
  humidity_entity_id: string | null;
  icon: string | null;
  labels: string[];
  name: string;
  picture: string | null;
  temperature_entity_id: string | null;
}
```

### `CameraEntity`
```typescript
interface CameraEntityAttributes extends HassEntityAttributeBase {
  model_name: string;
  access_token: string;
  brand: string;
  motion_detection: boolean;
  frontend_stream_type: string;  // "hls" | "web_rtc"
}

export interface CameraEntity extends HassEntityBase {
  attributes: CameraEntityAttributes;
}

export interface CameraPreferences {
  preload_stream: boolean;
  orientation: number;
}

export interface Stream {
  url: string;
}
```

### Base `RegistryEntry` Type
```typescript
// From src/data/registry.ts
export interface RegistryEntry {
  created_at: number;   // timestamp
  modified_at: number;  // timestamp
}
```

---

## 5. How HA Frontend Fetches Registry Data

### Pattern: createCollection + subscribeEvents

All registries follow the same pattern from `home-assistant-js-websocket`:

1. **Initial fetch**: Send WS command to get full list
2. **Subscribe to updates**: Listen for `*_registry_updated` events
3. **On update event**: Debounce (500ms) → re-fetch full list → update store
4. **Collection name**: Used as cache key to avoid duplicate subscriptions

### Entity Registry

**Fetch command**: `config/entity_registry/list` → `EntityRegistryEntry[]`
**Display fetch**: `config/entity_registry/list_for_display` → compact format (see Section D of ha-core-architecture.md)
**Subscribe event**: `entity_registry_updated`
**Collection key**: `_entityRegistry`

```typescript
// From src/data/entity/entity_registry.ts
export const fetchEntityRegistry = (conn: Connection) =>
  conn.sendMessagePromise<EntityRegistryEntry[]>({
    type: "config/entity_registry/list",
  });

export const subscribeEntityRegistry = (conn, onChange) =>
  createCollection<EntityRegistryEntry[]>(
    "_entityRegistry",
    fetchEntityRegistry,
    subscribeEntityRegistryUpdates,  // listens to "entity_registry_updated"
    conn, onChange
  );
```

**CRUD WS commands**:
- `config/entity_registry/get` → `ExtEntityRegistryEntry` (single, extended)
- `config/entity_registry/get_entries` → `Record<string, ExtEntityRegistryEntry>` (batch)
- `config/entity_registry/update` → `UpdateEntityRegistryEntryResult`
- `config/entity_registry/remove` → void
- `config/entity_registry/get_automatic_entity_ids` → `Record<string, string | null>`

### Device Registry

**Fetch command**: `config/device_registry/list` → `DeviceRegistryEntry[]`
**Subscribe event**: `device_registry_updated`
**Collection key**: `_dr`

```typescript
// From src/data/ws-device_registry.ts
export const fetchDeviceRegistry = (conn: Connection) =>
  conn.sendMessagePromise<DeviceRegistryEntry[]>({
    type: "config/device_registry/list",
  });

export const subscribeDeviceRegistry = (conn, onChange) =>
  createCollection<DeviceRegistryEntry[]>(
    "_dr",
    fetchDeviceRegistry,
    subscribeDeviceRegistryUpdates,  // listens to "device_registry_updated"
    conn, onChange
  );
```

**CRUD WS commands**:
- `config/device_registry/update` → `DeviceRegistryEntry`
- `config/device_registry/remove_config_entry` → `DeviceRegistryEntry`

### Area Registry

**Fetch command**: `config/area_registry/list` → `AreaRegistryEntry[]`
**Subscribe event**: `area_registry_updated`
**Collection key**: `_areaRegistry`

```typescript
// From src/data/ws-area_registry.ts
export const subscribeAreaRegistry = (conn, onChange) =>
  createCollection<AreaRegistryEntry[]>(
    "_areaRegistry",
    fetchAreaRegistry,
    subscribeAreaRegistryUpdates,  // listens to "area_registry_updated"
    conn, onChange
  );
```

**CRUD WS commands**:
- `config/area_registry/create` → `AreaRegistryEntry`
- `config/area_registry/update` → `AreaRegistryEntry`
- `config/area_registry/delete` → void
- `config/area_registry/reorder` → void

### How hass.entities/devices/areas Are Populated
The HA frontend subscribes to all registries during app initialization.
- `hass.entities` = `Record<string, EntityRegistryDisplayEntry>` (compact display format)
- `hass.devices` = `Record<string, DeviceRegistryEntry>` (full entries, keyed by id)
- `hass.areas` = `Record<string, AreaRegistryEntry>` (full entries, keyed by area_id)
- `hass.floors` = `Record<string, FloorRegistryEntry>` (full entries, keyed by floor_id)

These are populated via `createCollection` and kept in sync automatically.

### Summary of WS Commands Used for Registry Data
| Command | Returns | Event for Updates |
|---|---|---|
| `config/entity_registry/list` | `EntityRegistryEntry[]` | `entity_registry_updated` |
| `config/entity_registry/list_for_display` | Compact format | `entity_registry_updated` |
| `config/device_registry/list` | `DeviceRegistryEntry[]` | `device_registry_updated` |
| `config/area_registry/list` | `AreaRegistryEntry[]` | `area_registry_updated` |
| `config/floor_registry/list` | `FloorRegistryEntry[]` | `floor_registry_updated` |
| `config/label_registry/list` | `LabelRegistryEntry[]` | `label_registry_updated` |

---

## 6. Camera Frontend Integration

### Architecture
Camera rendering uses three approaches depending on camera capabilities:
1. **MJPEG stream** — simple, server-push image stream
2. **HLS stream** — adaptive bitrate via `camera/stream` WS command
3. **WebRTC** — peer-to-peer via `camera/webrtc/offer` + ICE candidates

### WS Commands
| Command | Purpose | Response |
|---|---|---|
| `camera/stream` | Get HLS stream URL | `{ url: string }` |
| `camera/webrtc/offer` | Subscribe to WebRTC session | Events: `session`, `answer`, `candidate`, `error` |
| `camera/webrtc/candidate` | Send ICE candidate | void |
| `camera/get_prefs` | Get camera preferences | `CameraPreferences` |
| `camera/update_prefs` | Update preferences (preload_stream, orientation) | `CameraPreferences` |
| `camera/capabilities` | Get camera capabilities | `{ frontend_stream_types: StreamType[] }` |
| `camera/webrtc/get_client_config` | Get WebRTC client config | `WebRTCClientConfiguration` |

### REST Endpoints
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/camera_proxy/<entity_id>` | GET | Still image (signed URL) |
| `/api/camera_proxy_stream/<entity_id>?token=<access_token>` | GET | MJPEG stream |

### Thumbnail Fetching
```typescript
// Uses signed path for security
export const fetchThumbnailUrl = async (hass, entityId) => {
  const path = await getSignedPath(hass, `/api/camera_proxy/${entityId}`);
  return hass.hassUrl(path.path);
};

// With caching (9 second TTL)
export const fetchThumbnailUrlWithCache = async (hass, entityId, width, height) => {
  const base_url = await timeCacheEntityPromiseFunc(
    "_cameraTmbUrl", 9000, fetchThumbnailUrl, hass, entityId
  );
  return cameraUrlWithWidthHeight(base_url, width, height);
};
```

### WebRTC Flow
```typescript
// 1. Offer → subscribe for answer/candidates
const unsub = await webRtcOffer(hass, entity_id, sdpOffer, (event) => {
  switch (event.type) {
    case "session":   // session_id received
    case "answer":    // SDP answer received → peerConnection.setRemoteDescription
    case "candidate": // ICE candidate → peerConnection.addIceCandidate
    case "error":     // error during negotiation
  }
});

// 2. Send local ICE candidates
await addWebRtcCandidate(hass, entity_id, session_id, candidate);

// 3. Get WebRTC configuration
const config = await fetchWebRtcClientConfiguration(hass, entity_id);
// config.configuration → RTCConfiguration (STUN/TURN servers)
```

### Camera Entity Attributes (from state)
- `access_token` — required for MJPEG stream URLs
- `frontend_stream_type` — `"hls"` or `"web_rtc"`
- `model_name`, `brand`, `motion_detection`

### Camera Support Flags
```typescript
export const CAMERA_SUPPORT_ON_OFF = 1;   // Supports turn_on/turn_off
export const CAMERA_SUPPORT_STREAM = 2;   // Supports HLS streaming
export const CAMERA_ORIENTATIONS = [1, 2, 3, 4, 6, 8];  // EXIF orientation values
```

---

## 7. HACS Patterns

### HACS Integration Structure (`hacs/integration`)
```
custom_components/hacs/
  __init__.py              # async_setup_entry → sets up WS API, frontend
  manifest.json            # domain: "hacs", min HA: 2025.3.0
  config_flow.py           # User config flow
  ...
hacs.json                  # At repo root: {"name": "HACS", "homeassistant": "2025.3.0"}
```

### How HACS Discovers & Loads Custom Components
1. **Default store**: HACS reads `hacs/default` repo → plain text list of `owner/repo` pairs
2. **Metadata fetch**: For each repo, HACS fetches `hacs.json` (root) + `manifest.json` (custom_components dir) via GitHub API
3. **Version resolution**: Prefers GitHub Releases with semver tags (shows 5 latest)
4. **Download**: Downloads all files in `custom_components/<domain>/` to user's config dir
5. **Update detection**: Compares installed `manifest.json` version against latest GitHub Release tag

### hacs.json Fields
| Field | Required | Purpose |
|---|---|---|
| `name` | Yes | Display name in HACS UI |
| `homeassistant` | No | Minimum HA version (must match manifest.json) |
| `render_readme` | No | Show README.md in HACS UI (default: false) |
| `persistent_directory` | No | Subdirectory to preserve across upgrades |
| `content_in_root` | No | For plugins: content is in repo root, not a subdirectory |
| `filename` | No | For plugins: specific filename to use |
| `zip_release` | No | Download release zip instead of source |

### How HACS Loads JS Resources
For **dashboard** type repos (ours is "integration" type):
- HACS doesn't manage our JS loading — our integration does it via `load_plugins.py`
- `add_extra_js_url()` from `frontend` component injects `<script>` tag
- Static path registered via `async_register_static_paths()` with `StaticPathConfig`
- Cache busting via `?version=VERSION` query parameter

For **plugin** type repos (Lovelace cards):
- HACS registers resources via Lovelace resource storage
- Resources are served from `/hacsfiles/<domain>/` static path
- HACS manages the Lovelace resource entries

### HACS Validation Requirements (Must Pass)
1. `hacs.json` exists at repo root with at least `name`
2. `manifest.json` exists with: `domain`, `name`, `version`, `documentation`, `issue_tracker`, `codeowners`
3. `version` in `manifest.json` is valid semver matching GitHub Release tag
4. `homeassistant` keys in `hacs.json` and `manifest.json` must be compatible
5. Repo is public, not archived, has description, has topics, has issues enabled
6. At least one GitHub Release published (not just a tag)
7. HACS Action + Hassfest validation must pass

---

## 8. Lovelace Backend Architecture

### `homeassistant/components/lovelace/__init__.py` (483 lines)

#### Setup Flow
```python
async def async_setup(hass, config):
    mode = config[DOMAIN][CONF_MODE]        # "storage" or "yaml"
    resource_mode = config[DOMAIN].get(CONF_RESOURCE_MODE, mode)
    
    # Resource management (YAML or storage)
    if resource_mode == MODE_YAML:
        resource_collection = ResourceYAMLCollection(yaml_resources)
    else:
        resource_collection = ResourceStorageCollection(hass, default_config)
    
    # Register WS commands
    websocket_api.async_register_command(hass, websocket_lovelace_info)
    websocket_api.async_register_command(hass, websocket_lovelace_config)
    websocket_api.async_register_command(hass, websocket_lovelace_save_config)
    websocket_api.async_register_command(hass, websocket_lovelace_delete_config)
    
    # Process YAML dashboards
    for url_path, dashboard_conf in yaml_dashboards.items():
        lovelace_config = LovelaceYAML(hass, url_path, dashboard_conf)
        _register_panel(hass, url_path, MODE_YAML, dashboard_conf, False)
    
    # Process storage dashboards
    dashboards_collection = DashboardsCollection(hass)
    await dashboards_collection.async_load()
```

#### Panel Registration
```python
def _register_panel(hass, url_path, mode, config, update):
    frontend.async_register_built_in_panel(hass, DOMAIN,
        frontend_url_path=url_path,
        require_admin=config[CONF_REQUIRE_ADMIN],
        show_in_sidebar=config[CONF_SHOW_IN_SIDEBAR],
        sidebar_title=config[CONF_TITLE],
        sidebar_icon=config.get(CONF_ICON, DEFAULT_ICON),
        config={"mode": mode},
        update=update,
    )
```

#### KEY DEPRECATION WARNING (affects LCARS Dashboard)
```
YAML mode is deprecated as of 2026.4, removal targeted for 2026.8.0
_async_create_yaml_mode_repair() creates a repair issue for YAML mode
```
This means our `LovelaceYAML` panel registration pattern may break in ~4 months.

### Lovelace WS Commands (built-in)
| Command | Purpose |
|---|---|
| `lovelace/info` | Get dashboard info (mode, etc.) |
| `lovelace/config` | Get dashboard config |
| `lovelace/config/save` | Save dashboard config |
| `lovelace/config/delete` | Delete dashboard config |
| `lovelace/resources` | List resources (deprecated for storage mode) |
| `lovelace/resources/list` | List resources (deprecated alias) |

---

## 9. Custom Card Helper Exports

From `src/panels/lovelace/custom-card-helpers.ts`:
```typescript
export { showEnterCodeDialog } from "../../dialogs/enter-code/show-enter-code-dialog";
export { showAlertDialog, showConfirmationDialog, showPromptDialog } from "../../dialogs/generic/show-dialog-box";
export { importMoreInfoControl } from "../../dialogs/more-info/state_more_info_control";
export { createBadgeElement } from "./create-element/create-badge-element";
export { createCardElement } from "./create-element/create-card-element";
export { createHeaderFooterElement } from "./create-element/create-header-footer-element";
export { createHuiElement } from "./create-element/create-hui-element";
export { createRowElement } from "./create-element/create-row-element";
```

These are the official exports available to custom cards via the `custom-card-helpers` module.

---

## 10. WebSocket API Infrastructure

### `homeassistant/components/websocket_api/__init__.py` (74 lines)

Minimal init — delegates to submodules:
```python
from . import commands, connection, const, decorators, http, messages

DOMAIN = "websocket_api"
DEPENDENCIES = ("http",)

def async_register_command(hass, command_or_handler, handler=None, schema=None):
    """Register a WS command."""
    if handler is None:
        # Decorator-based: extract from handler attributes
        handler = command_or_handler
        command = handler._ws_command
        schema = handler._ws_schema
    else:
        command = command_or_handler
    
    handlers = hass.data.setdefault(DOMAIN, {})
    handlers[command] = (handler, schema)

async def async_setup(hass, config):
    hass.http.register_view(WebsocketAPIView())
    commands.async_register_commands(hass, async_register_command)
    return True
```

Key exports:
- `ActiveConnection`, `current_connection` — from connection module
- Error codes: `ERR_NOT_FOUND`, `ERR_NOT_ALLOWED`, `ERR_INVALID_FORMAT`, etc.
- Decorators: `async_response`, `require_admin`, `websocket_command`, `ws_require_user`
- Messages: `BASE_COMMAND_MESSAGE_SCHEMA`, `error_message`, `event_message`, `result_message`

---

## 11. Entity/Device/Area Registry Python Source Details

### Entity Registry (`entity_registry.py`)
- **Storage**: `core.entity_registry` (version 1.22)
- **2509 lines**, 95.7 KB
- **Key class**: `RegistryEntry` (attrs-based, frozen)
  - Fields match TypeScript `EntityRegistryEntry` exactly
  - Additional Python fields: `capabilities`, `compat_aliases`, `original_name_unprefixed`
  - `_as_display_dict` property → compact JSON for `list_for_display` command
  - `as_partial_dict` → full JSON for `list` command
- **Indexing**: `EntityRegistryItems` maintains 6 indexes:
  - `id → entry`, `(domain, platform, unique_id) → entity_id`
  - `config_entry_id → dict`, `device_id → dict`, `area_id → dict`, `label → dict`
- **Events**: `entity_registry_updated` with actions: `create`, `remove`, `update`
- **Auto-cleanup**: Orphaned entities purged after 30 days

### Device Registry (`device_registry.py`)
- **Storage**: `core.device_registry` (version 1.12)
- **1922 lines**, 75.2 KB
- **Key class**: `DeviceEntry` (attrs-based, frozen)
  - `suggested_area` property **deprecated**, removal targeted for 2026.9
  - `dict_repr` property → full JSON representation
  - Collision detection for identifiers and connections
- **Indexing**: `DeviceRegistryItems` maintains:
  - `connections → entry`, `identifiers → entry`, `area_id → entries`, `label → entries`
- **Events**: `device_registry_updated` with actions: `create`, `remove`, `update`

### Area Registry (`area_registry.py`)
- **Storage**: `core.area_registry` (version 1.9)
- **595 lines**, 20.8 KB
- **Key class**: `AreaEntry` (dataclass-based, frozen)
  - New fields: `humidity_entity_id`, `temperature_entity_id` (climate sensors per area)
- **Indexing**: `AreaRegistryItems` maintains:
  - `name → entry`, `aliases → entries`, `labels → entries`, `floor_id → entries`
- **CRUD**: `async_create`, `async_update`, `async_delete`, `async_reorder`
- **Events**: `area_registry_updated` with actions: `create`, `remove`, `update`, `reorder`
- **Auto**: `async_get_or_create(name)` — creates area if not found by name

---

## 12. Supervisor Architecture

### `home-assistant/supervisor`
- **Container orchestrator** running on HAOS
- Manages: Core container, App containers, networking, updates, backups
- Communicates with Core via **Unix socket** (recently changed from TCP)
- Release channels: dev → beta → stable (via version repo JSON files)
- Latest release: 2026.04.0

### HAOS Components
- **Bootloader**: GRUB (UEFI) or U-Boot
- **OS**: Buildroot LTS Linux
- **Filesystems**: SquashFS (read-only, LZ4), ZRAM (tmp/var/swap, LZ4)
- **Container**: Docker Engine
- **Updates**: RAUC (OTA + USB)
- **Security**: AppArmor

---

## 13. Intents (Voice)

### Now under `OHF-Voice/intents` (moved from home-assistant)
- Training data for local voice control
- 68 releases (latest: 2026.3.24)
- 351 contributors
- Sentence templates per language + intent
- Test infrastructure for parsing and validation
- Used by HA Assist pipeline
