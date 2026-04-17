# HA Core Integration Profiles

> Summary of all 58 core integrations installed across user's HA instances.
> Crawled from HA docs and GitHub — last updated 2026-04-16
> Grouped by function to help LCARS Dashboard understand what entity types to expect.

---

## Category: Smart Home Devices

### apple_tv
- **Platforms**: media_player, remote
- **Purpose**: Apple TV media control and remote
- **LCARS Relevance**: Media card target. Play/pause/volume controls.

### blink
- **Platforms**: camera, binary_sensor, sensor, alarm_control_panel
- **Purpose**: Blink home security cameras
- **LCARS Relevance**: Camera feeds, motion detection binary sensors.

### bond
- **Platforms**: fan, light, cover, switch
- **Purpose**: Bond Bridge — RF control for ceiling fans, fireplaces, shades
- **LCARS Relevance**: Fan speed, light brightness, cover position controls.

### broadlink
- **Platforms**: remote, sensor, switch, light
- **Purpose**: Broadlink IR/RF universal remote and smart plugs
- **LCARS Relevance**: Switch entities, remote learning.

### cast
- **Platforms**: media_player
- **Purpose**: Google Cast / Chromecast media devices
- **LCARS Relevance**: Media card target. Casting, volume, now-playing.

### insteon
- **Platforms**: binary_sensor, climate, cover, fan, light, switch
- **Purpose**: Insteon home automation hub (PLM/Hub)
- **LCARS Relevance**: Multi-platform device hub. Various entity types per device.

### nanoleaf
- **Platforms**: light, button
- **Purpose**: Nanoleaf LED light panels
- **LCARS Relevance**: Light control with color/brightness. Scene buttons.

### switchbot
- **Platforms**: binary_sensor, climate, cover, fan, humidifier, light, lock, sensor, switch
- **Purpose**: SwitchBot smart home devices (curtains, plugs, meters, locks, etc.)
- **LCARS Relevance**: Multi-platform. Temperature/humidity sensors from SwitchBot Meter.

### tplink
- **Platforms**: light, switch, sensor, fan
- **Purpose**: TP-Link Kasa/Tapo smart plugs, bulbs, switches, power strips
- **LCARS Relevance**: Smart plug energy monitoring (watts/current/voltage sensors), light control.

### webostv
- **Platforms**: media_player, notify
- **Purpose**: LG webOS Smart TV control
- **LCARS Relevance**: Media card target. Power, volume, source, app control.

### xbox
- **Platforms**: media_player, binary_sensor, remote
- **Purpose**: Xbox console control and status
- **LCARS Relevance**: Media/gaming status. Online presence.

---

## Category: Security & Safety

### simplisafe
- **Platforms**: alarm_control_panel, binary_sensor, lock, button
- **Purpose**: SimpliSafe home security system (V2/V3)
- **Key Entities**: Alarm panel (arm/disarm), entry sensors, motion sensors, CO/smoke/glass break/freeze/water detectors, door locks
- **Services**: `simplisafe.remove_pin`, `simplisafe.set_pin`, `simplisafe.system_properties`
- **Events**: `SIMPLISAFE_EVENT` (timeline events), `SIMPLISAFE_NOTIFICATION`
- **LCARS Relevance**: **Critical for alarm panel**. The LCARS Alarm Panel Spec maps directly to these entities. Binary sensors for each detector, alarm_control_panel for arm/disarm.

### schlage
- **Platforms**: lock, binary_sensor, sensor, switch, select
- **Purpose**: Schlage WiFi smart locks (Encode, Encode Plus)
- **Key Entities**: Lock (lock/unlock), battery sensor, keypad disabled binary sensor, 1-touch locking switch, keypress beep switch, auto-lock time select
- **Services**: `schlage.get_codes`, `schlage.add_code`, `schlage.delete_code`
- **LCARS Relevance**: Lock control entities for door security display.

---

## Category: Climate & Environment

### awair
- **Platforms**: sensor
- **Purpose**: Awair air quality monitors
- **Key Sensors**: Temperature, humidity, CO2, VOC, PM2.5, Awair score
- **LCARS Relevance**: Air quality panel data. Overlaps with Blueair sensors.

### met
- **Platforms**: weather
- **Purpose**: Norwegian Meteorological Institute weather data
- **LCARS Relevance**: Backup weather entity if weatherflow_forecast unavailable.

### vesync
- **Platforms**: fan, light, switch, humidifier, sensor
- **Purpose**: VeSync smart devices (Levoit air purifiers, Etekcity outlets/bulbs)
- **Key Sensors**: PM2.5, air quality, filter life, humidity
- **LCARS Relevance**: **Air purifier control**. The LCARS Air Purifier Verification Spec includes VeSync/Levoit. Fan speed control, PM2.5 monitoring.

---

## Category: Water & Irrigation

### rachio
- **Platforms**: binary_sensor, switch, calendar
- **Purpose**: Rachio irrigation system control
- **Key Entities**: Zone switches (on/off per zone), schedule switches, standby mode, rain delay, controller status
- **Services**: `rachio.start_watering`, `rachio.start_multiple_zone_schedule`, `rachio.set_zone_moisture_percent`, `rachio.pause_watering`, `rachio.resume_watering`, `rachio.stop_watering`
- **Calendar**: Smart hose timer schedule events (upcoming/past)
- **LCARS Relevance**: **Critical for irrigation panel**. The LCARS Irrigation Panel V2 was rewritten for Rachio. Zone switches, run duration, moisture percent, pause/resume.

### screenlogic
- **Platforms**: binary_sensor, climate, sensor, switch
- **Purpose**: Pentair ScreenLogic pool/spa automation
- **Key Entities**: Pool/spa temperature (climate), pump/heater/cleaner switches, chemistry sensors, circuit switches, freeze protection
- **Services**: `screenlogic.set_color_mode`, `screenlogic.start_super_chlorination`, `screenlogic.stop_super_chlorination`
- **Color Modes**: party, romance, caribbean, american, sunset, royal, blue, green, red, white, magenta
- **LCARS Relevance**: **Critical for pool/spa panel**. The LCARS Pool/Spa Panel Spec maps directly to ScreenLogic. Climate entity for temperature control, switches for pumps/lights, color mode service.

### phyn
- **Platforms**: sensor, switch, valve
- **Purpose**: Phyn smart water monitor and shutoff valve
- **Key Sensors**: Water usage, flow rate, pressure, temperature
- **LCARS Relevance**: Water monitoring. Leak detection, usage tracking.

### flume
- **Platforms**: sensor
- **Purpose**: Flume smart water monitor
- **Key Sensors**: Water usage (gallons per minute/hour/day)
- **LCARS Relevance**: Water usage monitoring. Complements Phyn data.

---

## Category: Energy & Power

### energy
- **Platforms**: (HA built-in energy dashboard data)
- **Purpose**: HA Energy Dashboard — aggregates energy consumption/production/cost
- **LCARS Relevance**: Energy data source for power panels. Works with emporia_vue sensors.

---

## Category: Networking & Infrastructure

### esphome
- **Platforms**: binary_sensor, sensor, switch, light, fan, cover, climate, number, select, text, button, lock, media_player, alarm_control_panel, camera, event, valve, update, datetime, time, date
- **Purpose**: ESPHome firmware devices — DIY IoT sensors and controllers
- **LCARS Relevance**: Universal — any entity type. mmWave presence, custom sensors, LED strips. Entity types depend on user's ESPHome YAML config.

### unifi
- **Platforms**: device_tracker, switch, button, image, sensor, update
- **Purpose**: UniFi network device tracking and management
- **LCARS Relevance**: Presence detection via device tracking. Network client counts. PoE switch control.

### unifiprotect
- **Platforms**: binary_sensor, button, camera, event, light, lock, media_player, number, select, sensor, switch
- **Purpose**: UniFi Protect camera/NVR system
- **LCARS Relevance**: Security cameras. Motion events, doorbell rings. Could feed into alarm panel.

### synology_dsm
- **Platforms**: binary_sensor, sensor, switch, camera, button, update
- **Purpose**: Synology NAS monitoring
- **Key Sensors**: CPU load, memory usage, disk temperature, volume usage, network traffic
- **LCARS Relevance**: NAS infrastructure monitoring. Similar to Proxmox — suitable for "Computer Core" panel.

### hassio
- **Platforms**: binary_sensor, sensor, update
- **Purpose**: Home Assistant Supervisor add-on management
- **LCARS Relevance**: System health. Add-on status, HA Core update availability.

### homeassistant
- **Platforms**: (core HA functions)
- **Purpose**: Core HA services — reload, restart, scene, script execution
- **LCARS Relevance**: System control services.

### homeassistant_sky_connect / homeassistant_yellow
- **Platforms**: (hardware detection)
- **Purpose**: HA hardware — SkyConnect Zigbee/Thread dongle, Yellow board
- **LCARS Relevance**: None directly. Hardware presence detection.

---

## Category: Home Automation Helpers

### automation
- **Platforms**: automation (state: on/off, last_triggered)
- **Purpose**: HA automation engine
- **LCARS Relevance**: Automation status display. Last triggered timestamps.

### script
- **Platforms**: script (trigger-only entities)
- **Purpose**: HA script execution
- **LCARS Relevance**: Action buttons in dashboard.

### group
- **Platforms**: group (aggregated state from member entities)
- **Purpose**: Entity grouping
- **LCARS Relevance**: Grouped entity display (e.g., all lights in area).

### input_boolean / input_button / input_number
- **Platforms**: input_boolean (toggle), input_button (momentary), input_number (slider)
- **Purpose**: User-defined helper entities for automations
- **LCARS Relevance**: Dashboard controls — toggles, buttons, sliders for user-created helpers.

### template
- **Platforms**: binary_sensor, sensor, number, select, button, image, switch, trigger, weather, alarm_control_panel, cover, fan, light, lock, vacuum, valve
- **Purpose**: Template entities — derived from other entities via Jinja2
- **LCARS Relevance**: Custom calculated entities. Any entity type possible.

### timer
- **Platforms**: timer (state: idle/active/paused, remaining time)
- **Purpose**: Countdown timers
- **LCARS Relevance**: Timer display — countdown visualization.

### schedule
- **Platforms**: schedule (weekly time blocks, state: on/off)
- **Purpose**: Weekly schedule helper — define time ranges per day
- **LCARS Relevance**: Schedule visualization.

### switch_as_x
- **Platforms**: (converts switch entities to other platforms)
- **Purpose**: Expose switch entities as cover, fan, light, lock, siren, valve
- **LCARS Relevance**: Transparent — entities appear as their target type.

### min_max
- **Platforms**: sensor
- **Purpose**: Min/max/mean/median/range of numeric sensors
- **LCARS Relevance**: Aggregated sensor display (e.g., average temperature across rooms).

### time_date
- **Platforms**: sensor
- **Purpose**: Current time and date sensors
- **LCARS Relevance**: Stardate / clock display on dashboard.

### sun
- **Platforms**: sun (state: above_horizon/below_horizon, attrs: next_rising/next_setting/elevation/azimuth)
- **Purpose**: Sun position tracking
- **LCARS Relevance**: Day/night theming. Sunrise/sunset in weather panel.

### shopping_list
- **Platforms**: todo
- **Purpose**: Built-in shopping list
- **LCARS Relevance**: Todo list panel.

### local_todo
- **Platforms**: todo
- **Purpose**: Local file-based todo lists
- **LCARS Relevance**: Todo list panel alongside shopping_list.

---

## Category: People & Presence

### person
- **Platforms**: person (state: home/not_home/zone, source: device_trackers)
- **Purpose**: Person presence tracking
- **LCARS Relevance**: **Crew manifest**. Who's home. Avatar display.

### mobile_app
- **Platforms**: binary_sensor, sensor, device_tracker, notify
- **Purpose**: HA Companion App — phone sensors and tracking
- **Key Sensors**: Battery level, WiFi BSSID, geocoded location, activity, steps, BLE
- **LCARS Relevance**: Phone battery, location tracking, push notifications.

### tile
- **Platforms**: device_tracker
- **Purpose**: Tile Bluetooth trackers
- **LCARS Relevance**: Item tracking — keys, wallet, pets.

---

## Category: Voice & AI

### ollama
- **Platforms**: conversation
- **Purpose**: Local LLM via Ollama for voice assistant
- **LCARS Relevance**: Voice control backend. Could power a "Computer" voice interface.

### wyoming
- **Platforms**: (voice assistant protocol)
- **Purpose**: Wyoming protocol for voice assistants (wake word, STT, TTS)
- **LCARS Relevance**: Voice pipeline infrastructure.

### google_translate
- **Platforms**: tts
- **Purpose**: Google Translate text-to-speech
- **LCARS Relevance**: TTS output for notifications/announcements.

---

## Category: Zigbee & Radio

### zha
- **Platforms**: binary_sensor, climate, cover, fan, light, lock, number, select, sensor, siren, switch, button, update
- **Purpose**: Zigbee Home Automation — direct Zigbee device control
- **LCARS Relevance**: Universal Zigbee device support. Motion sensors, contact sensors, temperature/humidity, smart bulbs, plugs. Entity types depend on paired devices.

### homekit_controller
- **Platforms**: binary_sensor, camera, climate, cover, fan, humidifier, light, lock, media_player, number, select, sensor, switch
- **Purpose**: HomeKit device control (HA as controller)
- **LCARS Relevance**: Additional device source for HomeKit-only devices.

---

## Category: System & Backup

### backup
- **Platforms**: (HA backup management)
- **Purpose**: Create and manage HA backups
- **LCARS Relevance**: System administration — not dashboard-visible.

### cloud
- **Platforms**: (Nabu Casa cloud services)
- **Purpose**: HA Cloud — remote access, Google/Alexa voice, TTS
- **LCARS Relevance**: Cloud connection status sensor.

### nest
- **Platforms**: camera, climate, sensor
- **Purpose**: Google Nest devices via SDM API (thermostats, cameras — NOT Nest Protect)
- **LCARS Relevance**: Thermostat climate entities, camera feeds. Note: Nest Protect uses separate HACS integration.

### nut
- **Platforms**: sensor
- **Purpose**: Network UPS Tools — UPS monitoring
- **Key Sensors**: Battery charge, input/output voltage, load, runtime remaining, status
- **LCARS Relevance**: Power/UPS monitoring for "Ship Power" panel. Critical infrastructure.
