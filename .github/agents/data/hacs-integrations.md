# HACS / Custom Integration Profiles

> Crawled from GitHub READMEs — last updated 2026-04-16
> These integrations are installed via HACS on the user's HA instances.
> Understanding their entity types helps LCARS Dashboard render the correct panels.

---

## 1. cloudflare_ddns
- **Repo**: https://github.com/htiel/LocalCloudFlareUpdate-HA
- **Author**: @htiel (this project's owner)
- **Purpose**: Dynamic DNS updater — keeps Cloudflare DNS A records pointed at home IP
- **Platforms**: sensor, button
- **Entities**:
  - `sensor.last_sync` — timestamp of last successful sync
  - `sensor.sync_status` — text: Pending / Up to date / X record(s) updated / Failed (attr: `records_updated`)
  - `button.sync_now` — trigger immediate DNS update
- **Services**: `cloudflare_ddns.update_records` — instant manual update from automations
- **IoT Class**: Cloud Polling (polls Cloudflare API)
- **Config Flow**: Yes, 3-step wizard (API token → zones → records)
- **Options Flow**: Yes — change zones/records/poll interval without reinstall
- **HA Min**: 2024.1
- **LCARS Relevance**: Infrastructure/network monitoring sensor. Not device-oriented. Suitable for a "Network Status" more-page or homepage status indicator.

## 2. ecoflow_cloud
- **Repo**: https://github.com/tolwi/hassio-ecoflow-cloud (812★)
- **Purpose**: Monitor and control EcoFlow portable power stations via MQTT broker
- **Platforms**: sensor, switch, number (sliders), select
- **Entity Counts (per device)**:
  - DELTA_2: 47 sensors, 8 switches, 6 sliders, 5 selects
  - DELTA_PRO: 71 sensors, 6 switches, 6 sliders, 4 selects
  - RIVER_2: 32 sensors, 5 switches, 4 sliders, 5 selects
  - PowerStream: 58 sensors, 6 sliders
  - Smart Plug: 4 sensors, 1 switch, 1 slider
- **Key Sensors**: Battery level, input/output watts, charge remaining time, solar input, AC output
- **IoT Class**: Cloud Push (MQTT via mqtt.ecoflow.com)
- **Config Flow**: Yes (API credentials)
- **HA Min**: Not specified in README
- **LCARS Relevance**: **Critical for power monitoring**. High entity count per device. The LCARS Power Panel spec was designed for these entities. Need sensor grouping by device.

## 3. emporia_vue
- **Repo**: https://github.com/magico13/ha-emporia-vue (697★)
- **Purpose**: Energy monitoring from Emporia Vue smart energy monitors
- **Platforms**: sensor, switch
- **Key Sensors**: Power per channel (watts), named by device + channel ID (e.g., `sensor.power_home_123`)
- **Entity Naming**: `Power {Device_Name} {Channel_Id}` / `sensor.power_{Device_Id}_{Channel_Id}`
- **IoT Class**: Cloud Polling (Emporia API via PyEmVue)
- **Config Flow**: Yes (email/password)
- **Options Flow**: Yes
- **HA Min**: Not specified
- **LCARS Relevance**: **Critical for energy dashboard**. Whole-home and per-circuit energy data. Powers the consolidated power panel. Entity IDs use numeric device/channel IDs — need friendly name mapping.

## 4. ge_home
- **Repo**: https://github.com/simbaja/ha_gehome (544★)
- **Purpose**: GE/SmartHQ WiFi appliance control — kitchen and laundry
- **Supported Devices**: Fridge, Oven, Dishwasher, Washer, Dryer, A/C, Range Hood, Microwave, Ice Maker, Coffee Maker, Beverage Center
- **Platforms**: sensor, switch, climate, water_heater, select, number, binary_sensor, light
- **IoT Class**: Cloud Push (SmartHQ websocket API)
- **Config Flow**: Yes (SmartHQ credentials + region)
- **HA Min**: Tracks HA releases (v2026.2.0 current)
- **LCARS Relevance**: **Device panel targets**. Each appliance creates multiple entities. The LCARS Device Panel spec covers rendering these. Cycle status sensors (washer/dryer) need special handling for progress display.

## 5. ha_blueair
- **Repo**: https://github.com/dahlb/ha_blueair (102★)
- **Purpose**: Blueair air purifier monitoring and control
- **Platforms**: fan, light, sensor, switch, climate, humidifier
- **Entities**:
  - **Fan**: speed, on/off, preset modes (night/auto)
  - **Light**: brightness, on/off (LED indicator)
  - **Sensors**: Filter replacement %, humidity, connectivity, temperature, PM1, PM2.5, PM10, VOC
  - **Switches**: child lock, germ shield, wick dry
  - **Climate**: T10i/T20i models only
  - **Humidifier**: H35i/H76i models only
- **IoT Class**: Cloud Polling (Blueair cloud API)
- **Config Flow**: Yes (username/password)
- **HA Min**: Not specified
- **LCARS Relevance**: **Critical for air quality panels**. The LCARS Air Purifier Verification Spec was built around this integration. PM2.5/PM10/VOC sensors drive the atmoscrubber panel. Fan speed control needs slider rendering.

## 6. hacs
- **Repo**: https://github.com/hacs/integration (7.3k★)
- **Purpose**: Home Assistant Community Store — package manager for custom integrations, cards, themes
- **Platforms**: update (exposes update entities for each installed custom component)
- **IoT Class**: N/A (internal)
- **Config Flow**: Yes
- **HA Min**: 2025.3.0
- **LCARS Relevance**: Infrastructure only. No dashboard-visible entities. The update entities could be shown in a system status panel.

## 7. lcars_dashboard
- **Repo**: https://github.com/htiel/LCARS-lovelace-dashboard
- **Purpose**: THIS PROJECT — Star Trek LCARS-themed auto-generating dashboard
- **Platforms**: sensor (dashboard status)
- **LCARS Relevance**: Self — this is the integration we're building.

## 8. nest_protect
- **Repo**: https://github.com/iMicknl/ha-nest-protect (453★)
- **Purpose**: Nest Protect smoke/CO/heat detector monitoring via unofficial Nest API
- **Platforms**: sensor, binary_sensor
- **Entities**:
  - **Binary Sensors**: smoke status, CO status, heat status, occupancy (wired models)
  - **Sensors**: battery level, color status, room temperature
  - **Diagnostic**: firmware, serial, last test time
- **Auth Method**: Cookie-based (Google account OAuth workaround)
- **IoT Class**: Cloud Push (Nest protobuf streaming API)
- **Config Flow**: Yes (issue_token + cookies)
- **HA Min**: Not specified
- **LCARS Relevance**: Safety sensors. Binary sensor states (smoke/CO/heat) should map to alarm panel indicators. Occupancy could feed presence detection. The LCARS Alarm Panel Spec covers rendering these.

## 9. proxmoxve
- **Repo**: https://github.com/dougiteixeira/proxmoxve (927★)
- **Purpose**: Proxmox VE server virtualization monitoring and control
- **Platforms**: binary_sensor, sensor, button, update
- **Entities**:
  - **Binary Sensors**: node/VM/CT online status
  - **Sensors**: CPU usage, memory, disk, network, uptime, failed tasks (last 24h)
  - **Buttons**: start/stop/restart VMs and CTs (disabled by default, require permissions)
  - **Update**: node update availability
- **IoT Class**: Local Polling (Proxmox REST API, supports token auth)
- **Config Flow**: Yes (host/port/credentials/token + node/VM/CT selection)
- **HA Min**: Not specified
- **LCARS Relevance**: Infrastructure monitoring. Server status sensors could populate a "Ship Systems" or "Computer Core" more-page. CPU/memory/disk sensors are numeric — suitable for gauge/bar display.

## 10. scheduler
- **Repo**: https://github.com/nielsfaber/scheduler-component (872★)
- **Purpose**: Time-based automation scheduler — creates switch entities that trigger actions at set times
- **Platforms**: switch (scheduler entities as `switch.schedule_<token>`)
- **Services**: `scheduler.add`, `scheduler.edit`, `scheduler.remove`, `scheduler.copy`, `scheduler.run_action`, `scheduler.reload_storage`
- **States**: off (disabled), on (timer running, attr: next_trigger), triggered (executing), unknown
- **IoT Class**: Local Push (local .storage file)
- **Config Flow**: Yes
- **HA Min**: Not specified
- **LCARS Relevance**: Automation infrastructure. Schedule entities are switches — could be shown in an automation status panel. The `next_trigger` attribute is useful for display.

## 11. smartthinq_sensors
- **Repo**: https://github.com/ollo69/ha-smartthinq-sensors (1.3k★)
- **Purpose**: LG ThinQ smart appliance monitoring — washer, dryer, fridge, dishwasher, A/C, air purifier, dehumidifier, range, microwave, fan, hood, styler, water heater
- **Platforms**: sensor, binary_sensor, climate, switch, fan, humidifier
- **Key Entities**:
  - **Washer/Dryer**: cycle name, remaining time, wash/dry completed (binary), error state
  - **Fridge**: temperatures, door open status
  - **A/C**: climate entity with temperature, fan speed, swing
  - **Air Purifier**: fan entity with PM2.5 sensor
- **IoT Class**: Cloud Polling (LG ThinQ API via WideQ)
- **Config Flow**: Yes (LG account + country/language codes)
- **HA Min**: 2025.1
- **LCARS Relevance**: **Major device source**. Similar to ge_home — exposes kitchen/laundry appliance entities. Cycle progress (remaining time) needs special rendering. Air purifier entities overlap with ha_blueair.

## 12. waterguru
- **Repo**: https://github.com/dwradcliffe/home-assistant-waterguru (31★)
- **Purpose**: WaterGuru automated smart pool water monitor
- **Platforms**: sensor
- **Key Sensors**: Water chemistry readings (pH, ORP, free chlorine, temperature), battery, measurement timestamp, device status
- **IoT Class**: Cloud Polling (WaterGuru API)
- **Config Flow**: Yes
- **HA Min**: 2024.4
- **No Releases Published** — installs from branch HEAD
- **LCARS Relevance**: Pool monitoring. Feeds into the LCARS Pool/Spa Panel Spec alongside screenlogic. Chemistry sensors are numeric — suitable for gauge display.

## 13. weatherflow_forecast
- **Repo**: https://github.com/briis/weatherflow_forecast (89★)
- **Purpose**: WeatherFlow Tempest weather station — cloud REST API for forecast + sensor data
- **Platforms**: weather, sensor, binary_sensor
- **Key Entities**:
  - **Weather**: current conditions + daily/hourly forecast
  - **Sensors**: temperature, humidity, dewpoint, wind speed/gust/lull/direction, rain rate/today/yesterday, solar radiation, UV, illuminance, lightning strikes, pressure, visibility, battery, beaufort, cloud base, heat index, wind chill, WBGT, delta T
  - **Binary Sensors**: data available, is freezing, is lightning, is raining
- **IoT Class**: Cloud Polling (WeatherFlow REST API, requires personal token + station ownership)
- **Config Flow**: Yes (station ID + API token)
- **HA Min**: 2023.9 (uses new Weather forecast types)
- **LCARS Relevance**: **Critical for weather panel**. The LCARS Weather Panel Spec depends on this. Rich sensor set for detailed weather display. The weather entity provides forecast data.

## 14. weatherlink
- **Repo**: https://github.com/siku2/hass-weatherlink (33★)
- **Purpose**: Davis Instruments WeatherLink and AirLink weather stations
- **Platforms**: sensor
- **Key Sensors**: Temperature, humidity, wind, rain, solar, UV, barometric pressure, AirLink PM2.5/PM10
- **IoT Class**: Local Polling (WeatherLink Live local API)
- **Config Flow**: Yes
- **HA Min**: Not specified
- **Limitations**: Multiple instances of same data structure not well handled; older AirLink firmware may not work
- **LCARS Relevance**: Additional weather data source. AirLink PM sensors overlap with air quality panel. Could augment weatherflow_forecast data.
