## 9. HA Entity Mapping — Complete Reference

### Climate Entities (2)

| Entity Pattern             | Body  | Domain    | Key Attributes                                    |
|----------------------------|-------|-----------|---------------------------------------------------|
| `climate.*_pool_heat`      | Pool  | `climate` | `current_temperature`, `temperature`, `hvac_mode`, `hvac_action`, `preset_mode`, `preset_modes` |
| `climate.*_spa_heat`       | Spa   | `climate` | Same as above                                     |

**Supported HVAC modes**: `heat`, `off`  
**Supported preset modes**: `heater`, `solar`, `solar_preferred` (from device, via `preset_modes` attribute)

### Sensor Entities

| Entity Pattern                      | Purpose              | Unit  | Domain   | Notes                      |
|-------------------------------------|----------------------|-------|----------|----------------------------|
| `sensor.*_air_temperature`          | Air temperature      | °F/°C | `sensor` | Controller sensor           |
| `sensor.*_controller_state`         | System state         | enum  | `sensor` | ready/sync/service          |
| `sensor.*_orp`                      | ORP (basic)          | mV    | `sensor` | SCG/basic chemistry         |
| `sensor.*_ph`                       | pH (basic)           | pH    | `sensor` | SCG/basic chemistry         |
| `sensor.*_orp_now`                  | ORP (IntelliChem)    | mV    | `sensor` | Real-time IntelliChem       |
| `sensor.*_ph_now`                   | pH (IntelliChem)     | pH    | `sensor` | Real-time IntelliChem       |
| `sensor.*_orp_supply_level`         | ORP tank level       | 0–4   | `sensor` | IntelliChem supply          |
| `sensor.*_ph_supply_level`          | pH tank level        | 0–4   | `sensor` | IntelliChem supply          |
| `sensor.*_saturation`               | Saturation index     | SI    | `sensor` | Langelier saturation index  |
| `sensor.*_salt_tds_ppm`             | Salt / TDS           | ppm   | `sensor` | Salt chlorine generator     |
| `sensor.*_ph_probe_water_temp`      | Probe water temp     | °F/°C | `sensor` | IntelliChem                 |
| `sensor.*_calcium_hardness`         | Calcium hardness     | ppm   | `sensor` | IntelliChem config          |
| `sensor.*_cya`                      | Cyanuric acid        | ppm   | `sensor` | IntelliChem config          |
| `sensor.*_orp_setpoint`             | ORP target           | mV    | `sensor` | IntelliChem config          |
| `sensor.*_ph_setpoint`              | pH target            | pH    | `sensor` | IntelliChem config          |
| `sensor.*_total_alkalinity`         | Total alkalinity     | ppm   | `sensor` | IntelliChem config          |
| `sensor.*_super_chlor_timer`        | Super chlor timer    | hrs   | `sensor` | SCG sensor                  |

### Pump Sensors (per pump, index 0–N)

| Entity Pattern                      | Purpose           | Unit   | Notes                        |
|-------------------------------------|-------------------|--------|------------------------------|
| `sensor.*_pump_*_watts_now`         | Current power     | W      | All pump types               |
| `sensor.*_pump_*_rpm_now`           | Current RPM       | RPM    | VS pumps (not VF)            |
| `sensor.*_pump_*_gpm_now`           | Current flow      | GPM    | VF pumps (not VS)            |

### Binary Sensors

| Entity Pattern                      | Purpose              | Device Class | Notes                     |
|-------------------------------------|----------------------|-------------|---------------------------|
| `binary_sensor.*_freeze_mode`       | Freeze protection    | —           | Core sensor               |
| `binary_sensor.*_pool_delay`        | Pool startup delay   | —           | Core sensor               |
| `binary_sensor.*_spa_delay`         | Spa startup delay    | —           | Core sensor               |
| `binary_sensor.*_pump_*_state`      | Pump running state   | —           | Per pump                  |
| `binary_sensor.*_flow_alarm`        | Flow sensor alarm    | `problem`   | IntelliChem               |
| `binary_sensor.*_orp_high_alarm`    | ORP high alarm       | `problem`   | IntelliChem               |
| `binary_sensor.*_orp_low_alarm`     | ORP low alarm        | `problem`   | IntelliChem               |
| `binary_sensor.*_ph_high_alarm`     | pH high alarm        | `problem`   | IntelliChem               |
| `binary_sensor.*_ph_low_alarm`      | pH low alarm         | `problem`   | IntelliChem               |
| `binary_sensor.*_probe_fault_alarm` | Probe sensor fault   | `problem`   | IntelliChem               |
| `binary_sensor.*_orp_chem_limit`    | ORP dosing limit     | —           | IntelliChem alert         |
| `binary_sensor.*_ph_chem_limit`     | pH dosing limit      | —           | IntelliChem alert         |
| `binary_sensor.*_ph_lockout`        | pH dosing lockout    | —           | IntelliChem alert         |

### Switch Entities (Circuit-Based)

| Entity Pattern                      | Purpose              | Domain   | Notes                      |
|-------------------------------------|----------------------|----------|----------------------------|
| `switch.*_pool_pump`                | Main pool pump       | `switch` | Primary circuit 505        |
| `switch.*_spa_pump`                 | Spa pump/jets        | `switch` | Primary circuit 500        |
| `switch.*_aux_*`                    | Auxiliary circuits   | `switch` | Spillover, cleaner, etc.   |

### Light Entities

| Entity Pattern                      | Purpose              | Domain  | Notes                       |
|-------------------------------------|----------------------|---------|-----------------------------|
| `light.*_intellibrite`              | Pool lights          | `light` | On/off via standard light   |
| `light.*_*`                         | Other light circuits | `light` | Landscape, etc.             |

### Actions (Integration-Level)

| Action                                   | Parameters                         | Purpose                      |
|------------------------------------------|------------------------------------|------------------------------|
| `screenlogic.set_color_mode`             | `config_entry`, `color_mode`       | IntelliBrite lighting control|
| `screenlogic.start_super_chlorination`   | `config_entry`, `runtime` (hrs)    | Start super chlor            |
| `screenlogic.stop_super_chlorination`    | `config_entry`                     | Stop super chlor             |

### Number Entities (IntelliChem Configuration)

| Entity Pattern                      | Purpose                | Notes                     |
|-------------------------------------|------------------------|---------------------------|
| `number.*_orp_setpoint`             | ORP target setpoint    | Configurable via HA       |
| `number.*_ph_setpoint`              | pH target setpoint     | Configurable via HA       |
| `number.*_calcium_hardness`         | Calcium hardness config| IntelliChem               |
| `number.*_cya`                      | CYA config             | IntelliChem               |
| `number.*_total_alkalinity`         | Total alkalinity config| IntelliChem               |
| `number.*_pool_setpoint`            | Pool temp setpoint     | Alternative to climate    |
| `number.*_spa_setpoint`             | Spa temp setpoint      | Alternative to climate    |

---
