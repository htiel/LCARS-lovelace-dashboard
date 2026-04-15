## 1. Target Entity Inventory

### The Admiral's SwitchBot Meter Fleet (from `core.device_registry`)

All devices use model `WoTHP` (SwitchBot Meter / Meter Plus), platform `switchbot`, connected via Bluetooth.

#### Room Environment Meters

| Device Name         | Device ID      | Area ID          | Entity Prefix        |
|---------------------|----------------|------------------|----------------------|
| Meter - Network Closet | `fe2a7f45...` | `utility`        | `sensor.meter_502c_` |
| Meter - T'Lyn Bath  | `2489c248...`  | `t_e`            | `sensor.meter_3888_` |
| Meter - Garage      | `80e60a2b...`  | `garage`         | `sensor.meter_1eda_` |
| Meter - Office      | `171b51b0...`  | `the_office`     | `sensor.meter_e06d_` |
| Meter - Boimler     | `dd1c449f...`  | `boimler`        | `sensor.meter_d3ab_` |
| Meter - Cmd Quarters| `c7b132ae...`  | `rutherford`     | `sensor.meter_c4c8_` |
| Meter - Living Room | `22491c77...`  | `shared_spaces`  | `sensor.meter_d487_` |
| Meter - Master Bed  | `ddf7900d...`  | `master_bed`     | `sensor.meter_2790_` |
| Meter - Mariner     | `61194ccd...`  | `mariner`        | `sensor.meter_3380_` |
| Meter - Master Bath | `bece20cb...`  | `master_bath`    | `sensor.meter_cc32_` |
| Meter - South Bath  | `0087a47d...`  | `south_bath`     | `sensor.meter_450a_` |
| Meter - Tendi Bath  | `97eb75e3...`  | `tendi`          | `sensor.meter_ab6e_` |
| Meter - Attic       | `83874841...`  | `attic`          | `sensor.meter_5e03_` |
| Meter - Crawl Space | `020f0733...`  | `outside`        | `sensor.meter_4cb8_` |

#### Appliance Monitors (excluded from room grid by default)

| Device Name              | Area ID    | Entity Prefix          | Notes                    |
|--------------------------|------------|------------------------|--------------------------|
| Meter - Kitchen Freezer  | `kitchen`  | `sensor.meter_2095_`   | Appliance, not room temp |
| Meter - Kitchen Fridge   | `kitchen`  | `sensor.meter_fb57_`   | Appliance, not room temp |
| Meter - Garage Fridge    | `garage`   | `sensor.meter_55f0_`   | Appliance, not room temp |

### Entity Pattern Per Device

Each SwitchBot Meter exposes 4 entities:

| Entity Suffix      | Device Class       | Category     | Unit | Used in Grid |
|---------------------|--------------------|-------------|------|--------------|
| `_temperature`      | `temperature`      | —           | °F   | Primary      |
| `_humidity`         | `humidity`         | —           | %    | Primary      |
| `_battery`          | `battery`          | `diagnostic`| %    | Badge only   |
| `_bluetooth_signal_strength` | `signal_strength` | `diagnostic` | dBm | Hidden |

### Floor Registry (from `core.floor_registry`)

| Floor ID    | Name      | Level | Icon               |
|-------------|-----------|-------|--------------------|
| `main`      | Main      | 1     | `mdi:stairs-down`  |
| `upstairs`  | Upstairs  | 2     | `mdi:stairs-up`    |

---
