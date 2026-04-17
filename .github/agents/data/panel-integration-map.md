T# Integration → LCARS Panel Cross-Reference

> Maps which integrations feed into which LCARS Dashboard panels/specs.
> Use this to understand entity availability when building or modifying panels.
> Last updated: 2026-04-16

---

## LCARS Homepage Card
| Integration | Entity Types | Usage |
|---|---|---|
| person | person | Crew presence indicators |
| sun | sun | Day/night theming, stardate display |
| time_date | sensor | Clock/stardate |
| mobile_app | sensor | Phone battery indicators |
| automation | automation | Automation status counts |

## LCARS Alarm Panel
| Integration | Entity Types | Usage |
|---|---|---|
| simplisafe | alarm_control_panel, binary_sensor, lock | Arm/disarm, all sensor zones (entry, motion, smoke, CO, glass, water, freeze) |
| schlage | lock, binary_sensor, sensor | Door locks, keypad status, battery |
| blink | camera, binary_sensor | Camera feeds, motion detection |
| unifiprotect | camera, binary_sensor, event | Security cameras, doorbell events |
| nest_protect (HACS) | binary_sensor, sensor | Smoke/CO/heat status, occupancy |
| zha | binary_sensor | Zigbee contact/motion sensors |

## LCARS Climate Panel
| Integration | Entity Types | Usage |
|---|---|---|
| nest | climate, sensor | Thermostats |
| esphome | sensor | Temperature/humidity (custom sensors) |
| switchbot | sensor | SwitchBot Meter temperature/humidity |
| awair | sensor | Air quality (CO2, VOC, PM2.5, temp, humidity) |
| zha | sensor | Zigbee temperature/humidity sensors |
| min_max | sensor | Averaged temperature across rooms |

## LCARS Air Purifier / Atmoscrubber Panel
| Integration | Entity Types | Usage |
|---|---|---|
| ha_blueair (HACS) | fan, sensor, light, switch | Fan speed, PM1/PM2.5/PM10/VOC, LED, child lock, germ shield |
| vesync | fan, sensor | Levoit purifiers — fan speed, PM2.5, filter life |
| smartthinq_sensors (HACS) | fan, sensor | LG air purifier — fan speed, PM2.5 |
| weatherlink (HACS) | sensor | AirLink PM2.5/PM10 (outdoor air quality) |

## LCARS Power Panel / Consolidated Power
| Integration | Entity Types | Usage |
|---|---|---|
| ecoflow_cloud (HACS) | sensor, switch, number, select | Battery %, input/output watts, charge time, solar |
| emporia_vue (HACS) | sensor | Per-circuit power (watts), whole-home consumption |
| energy | (dashboard data) | Aggregated energy consumption/production/cost |
| nut | sensor | UPS battery, load, runtime, voltage |
| tplink | sensor | Smart plug energy monitoring (watts/current/voltage) |

## LCARS Irrigation Panel
| Integration | Entity Types | Usage |
|---|---|---|
| rachio | switch, binary_sensor, calendar | Zone on/off, schedule switches, standby, rain delay |
| rachio | (services) | start_watering, start_multiple_zone_schedule, pause, resume, stop, set_zone_moisture_percent |

## LCARS Pool/Spa Panel
| Integration | Entity Types | Usage |
|---|---|---|
| screenlogic | climate, switch, sensor, binary_sensor | Pool/spa temp control, pump/heater/cleaner switches, chemistry |
| screenlogic | (services) | set_color_mode (pool lights), super_chlorination |
| waterguru (HACS) | sensor | Pool water chemistry (pH, ORP, chlorine, temperature) |

## LCARS Weather Panel
| Integration | Entity Types | Usage |
|---|---|---|
| weatherflow_forecast (HACS) | weather, sensor, binary_sensor | Current conditions, forecast, all weather sensors (temp, wind, rain, UV, lightning, etc.) |
| weatherflow | sensor | Core HA WeatherFlow UDP — local sensor data |
| weatherlink (HACS) | sensor | Davis WeatherLink — backup weather source |
| met | weather | Norwegian Met weather — fallback forecast |
| sun | sun | Solar elevation, sunrise/sunset |

## LCARS Media Card
| Integration | Entity Types | Usage |
|---|---|---|
| apple_tv | media_player, remote | ATV control/now-playing |
| cast | media_player | Chromecast/Google TV |
| webostv | media_player | LG TV control |
| xbox | media_player, remote | Xbox status |

## LCARS Device Panel (Appliances)
| Integration | Entity Types | Usage |
|---|---|---|
| ge_home (HACS) | sensor, switch, climate, select, binary_sensor | GE/SmartHQ appliances (fridge, oven, washer, dryer, A/C, etc.) |
| smartthinq_sensors (HACS) | sensor, binary_sensor, climate, fan | LG ThinQ appliances (washer, dryer, fridge, dishwasher, A/C) |
| bond | fan, light, cover | Ceiling fans, fireplaces, shades |

## LCARS Temp/Humidity Grid
| Integration | Entity Types | Usage |
|---|---|---|
| esphome | sensor | ESP32 temperature/humidity sensors |
| switchbot | sensor | SwitchBot Meter readings |
| zha | sensor | Zigbee temp/humidity sensors |
| awair | sensor | Awair temperature/humidity |
| ha_blueair (HACS) | sensor | Blueair temperature/humidity |
| min_max | sensor | Averaged readings per area |

## Infrastructure / Ship Systems (potential more-page)
| Integration | Entity Types | Usage |
|---|---|---|
| proxmoxve (HACS) | binary_sensor, sensor, button | VM/CT status, CPU/memory/disk |
| synology_dsm | sensor, binary_sensor | NAS health, disk temps, volume usage |
| nut | sensor | UPS power status |
| cloudflare_ddns (HACS) | sensor, button | DNS sync status |
| unifi | device_tracker, sensor | Network clients, switch status |
| hassio | sensor, update | HA system health |
| hacs (HACS) | update | Custom component update status |

## Voice / AI (potential more-page)
| Integration | Entity Types | Usage |
|---|---|---|
| ollama | conversation | Local LLM voice assistant |
| wyoming | (protocol) | Wake word, STT, TTS pipeline |
| google_translate | tts | Text-to-speech output |
