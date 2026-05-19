# Sickbay (Medical Bay) Dashboard

> Biofunction monitor — vitals, sleep, mobility, audio exposure, heart-rate notifications, ECG events.

[← Back to README](../README.md) · [Spec: LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md](../specs/LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md)

## Sidebar Metadata

| Field | Value |
|-------|-------|
| Default sidebar title | **Sickbay** |
| Frame color | gold + african-violet |
| Sidebar filters | SUMMARY / ANATOMICAL / BIOMEDICAL |
| Enabled by default | No (enable via integration options) |

## What It Shows

Per-person biomedical overview built around Apple Health metrics relayed through HA. Vitals appear as gauge tiles (heart rate, blood oxygen, respiratory rate, body temperature), with composite tiles for sleep, weight/body composition, activity rings, ECG history, heart-rate notifications, and audio exposure. A multi-user profile binding editor in the dashboard header endcap maps Apple Health source devices to HA `person.*` profiles.

## Data Sources

The Medical Bay supports **two ingestion paths**, both routed to the same binding-aware tiles:

### 1. HealthyApps MQTT Bridge (recommended)

Live, managed sensors created from MQTT payloads pushed by the **Health Auto Export** iOS app. Each metric becomes a first-class HA entity with `device_class`, `state_class`, and long-term statistics. This is the primary path for new installs — see **[MQTT Sensor Setup](#mqtt-sensor-setup)** below.

### 2. Legacy `hae.*` / `apple_health.*` state-only entities

Pre-existing state-only entities created by older Health Auto Export integrations are still recognised. Each integration is bound by `via_device` chain back to the per-iPhone root device, and the dashboard derives a stable `hae:<userTag>` binding key from that root so legacy and MQTT users land on the same per-person tile.

## Composite Vital Tiles

- **READINESS** — sleep score + HRV + resting HR (shrinks to a single-column tile when sub-lozenges are missing)
- **SLEEP** — composite of sleep duration, sleep score, sleep breathing disturbances, sleeping wrist temperature; SLEEP TIME on row-1 col-4, SLEEP SCORE on row-2 col-1
- **WEIGHT** — absorbs body comp children (body fat %, lean mass, BMI)
- **ACTIVITY** — steps, active energy, distance, flights, exercise minutes, stand minutes/hours
- **HR NOTIFICATIONS** — high / low / irregular events today plus latest detail
- **ECG** — sinus / AFib / inconclusive counts, latest classification + avg HR + timestamp
- **AUDIO EXPOSURE** — headphone + environmental dB
- **DATA LINK** — last push timestamps (metrics, workouts, ECG, HRN) — diagnostic composite confirming pipeline health
- **MOBILITY** — walking speed, step length, asymmetry, double support, stair speed, six-minute walk, VO₂ max, cardio recovery

## Imperial → Metric Normalization

Inbound MQTT samples in imperial units (mi, mph, in, ft, ft/s, lb, °F) are normalised inside the dashboard via `convertImperial()` to km, km/h, cm, m, m/s, kg, and °C respectively. The HA entity keeps its original unit; the normalisation is display-only.

## Multi-User Profile Binding

Gear icon in the Sickbay header opens a binding editor that maps each discovered medical source (`hae:<userTag>`) to a `person.*` profile. The mapping is stored alongside other dashboard config and persists across restarts.

---

## MQTT Sensor Setup

This section covers wiring the **HealthyApps Health Auto Export** iOS app into Home Assistant so the Medical Bay can render live tiles. The reference YAML lives at `<HA config>/packages/health_auto_export.yaml` in the operator's HomeAssistantConfig repo — copy and adapt it for your setup.

### Prerequisites

1. **MQTT broker** — Mosquitto (HA add-on or external) reachable from the iPhone
2. **HA MQTT integration** — installed and connected to the broker
3. **HA Packages enabled** — in `configuration.yaml`:
   ```yaml
   homeassistant:
     packages: !include_dir_named packages
   ```
4. **Health Auto Export** by HealthyApps — installed on iPhone (paid tier required for MQTT export)

### iOS App Configuration

In Health Auto Export, create **one MQTT automation per data type**. Recommended automations and topics:

| Data Type | Topic | Date Range | Cadence | Notes |
|-----------|-------|-----------|---------|-------|
| Health Metrics | `<user>/health/metrics` | **Default** or **Today** | 1 min | All vitals + activity + audio + respiratory |
| Workouts | `<user>/health/workouts` | **Today** | 5 min | Include Workout Metrics: OFF, Include Route Data: OFF |
| ECG | `<user>/health/ecg` | **Today** | 15 min | Summary fields only (voltage arrays are stripped by templates) |
| Heart Rate Notifications | `<user>/health/heart_rate_notifications` | **Today** | 15 min | High / low / irregular rhythm events |

> **Critical: Date Range = "Default" or "Today" (not "Since Last Sync").**
> Cumulative-per-day sensors (steps, active energy, distance, exercise minutes, stand minutes, flights climbed, basal energy, stand hours) compute state as the **sum of today's samples in the payload**. If the app only pushes deltas since the last sync, totals will be wrong.

Broker, port, username, password, and topic-prefix are user-specific; the reference YAML uses `mariner/health/...` as the topic prefix.

### MQTT Payload Shape

The iOS app publishes a single JSON blob per cycle (QoS 0, **retain=false**):

```json
{
  "data": {
    "metrics": [
      {
        "name": "step_count",
        "units": "count",
        "data": [
          { "date": "2025-04-27 09:00:00 -0500", "qty": 421 },
          { "date": "2025-04-27 09:01:00 -0500", "qty": 38 }
        ]
      },
      { "name": "resting_heart_rate", "data": [{ "date": "...", "qty": 58 }] }
    ],
    "workouts": [ { "name": "Walking", "start": "...", "end": "...", "duration": 1820, "distance": {"qty": 1.21, "units": "mi"}, ... } ],
    "ecg":      [ { "start": "...", "classification": "Sinus Rhythm", "averageHeartRate": 62, ... } ],
    "heartRateNotifications": [ { "start": "...", "end": "...", "threshold": 120, "heartRate": [...], "heartRateVariation": [...] } ]
  }
}
```

### Sensor Patterns (3 shapes)

Every sensor in the package falls into one of these three templates.

#### A. Cumulative-per-day (sum of today's samples)

`state_class: total_increasing` — promoted to long-term statistics. State = sum of samples whose `date` starts with today.

```yaml
- name: "Steps Today"
  unique_id: hae_steps_today
  state_topic: "mariner/health/metrics"
  value_template: >-
    {% set m = (value_json.data.metrics
                | selectattr('name','equalto','step_count')
                | first | default(none)) %}
    {% if m and m.data %}
      {% set today = now().strftime('%Y-%m-%d') %}
      {{ (m.data | selectattr('date','search', today)
                 | map(attribute='qty') | sum) | round(0) }}
    {% endif %}
  unit_of_measurement: "steps"
  state_class: total_increasing
  icon: mdi:walk
  device: &hae_activity
    identifiers: [hae_iphone_activity]
    name: "Activity"
    manufacturer: "HealthyApps"
    model: "Apple Watch / iPhone"
    via_device: hae_iphone_mariner
```

Apply this shape to: `step_count`, `active_energy`, `basal_energy_burned`, `walking_running_distance`, `flights_climbed`, `apple_exercise_time`, `apple_stand_time`, `apple_stand_hour`.

#### B. Instantaneous (latest sample)

`state_class: measurement`. State = the qty of the most recent sample for that metric.

```yaml
- name: "Resting Heart Rate"
  unique_id: hae_resting_heart_rate
  state_topic: "mariner/health/metrics"
  value_template: >-
    {% set m = (value_json.data.metrics
                | selectattr('name','equalto','resting_heart_rate')
                | first | default(none)) %}
    {{ (m.data | last).qty | round(0) if m and m.data else none }}
  unit_of_measurement: "bpm"
  state_class: measurement
  icon: mdi:heart-pulse
  device: &hae_heart
    identifiers: [hae_iphone_heart]
    name: "Heart Health"
    manufacturer: "HealthyApps"
    model: "Apple Watch / iPhone"
    via_device: hae_iphone_mariner
```

Apply this shape to: heart rate variants, blood oxygen saturation, HRV, respiratory rate, walking speed, walking step length, walking asymmetry, walking double support, stair speed, six-minute walking test, VO₂ max, cardio recovery, breathing disturbances, sleeping wrist temperature, headphone audio exposure, environmental audio exposure, physical effort.

#### C. Composite events (latest item from a list)

For ECG, workouts, and heart-rate notifications — sort the list by start time and pull fields from the last item.

```yaml
- name: "Latest ECG Classification"
  unique_id: hae_ecg_latest_classification
  state_topic: "mariner/health/ecg"
  value_template: >-
    {% set es = value_json.data.ecg | default([]) %}
    {% if es %}{{ (es | sort(attribute='start') | last).classification }}{% endif %}
  icon: mdi:heart-pulse
  device: *hae_heart
```

For "today-count" aggregates over these event lists, use a `selectattr('start','search', today)` filter and emit the length:

```yaml
- name: "ECG AFib Today"
  unique_id: hae_ecg_afib_today
  state_topic: "mariner/health/ecg"
  value_template: >-
    {% set today = now().strftime('%Y-%m-%d') %}
    {{ value_json.data.ecg | default([])
       | selectattr('start','search', today)
       | selectattr('classification','equalto','Atrial Fibrillation')
       | list | length }}
  unit_of_measurement: "readings"
  state_class: total_increasing
  device: *hae_heart
```

### Device Topology

Sensors are grouped into 5 child devices, all chained via `via_device: hae_iphone_mariner` to a single parent device. The dashboard's medical classifier walks this `via_device` chain to derive the binding key `hae:<userTag>` (e.g. `hae:mariner`).

```yaml
# Parent (diagnostic-only — owns the four "Last * Push" timestamp sensors)
device: &hae_device
  identifiers: [hae_iphone_mariner]
  name: "Health Auto Export (iPhone)"
  manufacturer: "HealthyApps"
  model: "Health Auto Export"

# Children (each carries its domain's sensors)
&hae_activity     -> identifiers: [hae_iphone_activity]      name: "Activity"
&hae_heart        -> identifiers: [hae_iphone_heart]         name: "Heart Health"
&hae_respiratory  -> identifiers: [hae_iphone_respiratory]   name: "Respiratory"
&hae_audio        -> identifiers: [hae_iphone_audio]         name: "Audio Exposure"
&hae_workouts     -> identifiers: [hae_iphone_workouts]      name: "Workouts"
```

> **Naming convention.** The parent device's identifier suffix (`_mariner` in the reference) is what the dashboard turns into the user tag. For multi-user installs, give each iPhone its own parent device with a unique suffix, e.g. `hae_iphone_alice` → `hae:alice`.

### Diagnostic: Last Push Timestamps

One diagnostic sensor per MQTT topic, used by the **DATA LINK** composite tile to verify the pipeline is alive:

```yaml
- name: "Last Metrics Push"
  unique_id: hae_last_push
  state_topic: "mariner/health/metrics"
  value_template: "{{ now().isoformat() }}"
  device_class: timestamp
  entity_category: diagnostic
  device: *hae_device
```

Replicate for `workouts`, `ecg`, and `heart_rate_notifications` topics, each with `entity_category: diagnostic` so they group into the device's diagnostic pane in HA's UI but still drive the dashboard's freshness tile.

### Binary Sensors

For latching "AFib seen today" / "irregular rhythm seen today" alerts, use a sibling `mqtt: binary_sensor:` block under the same package:

```yaml
mqtt:
  binary_sensor:
    - name: "ECG AFib Detected Today"
      unique_id: hae_ecg_afib_today_binary
      state_topic: "mariner/health/ecg"
      value_template: >-
        {% set today = now().strftime('%Y-%m-%d') %}
        {% set hits = value_json.data.ecg | default([])
                      | selectattr('start','search', today)
                      | selectattr('classification','equalto','Atrial Fibrillation')
                      | list %}
        {{ 'ON' if hits else 'OFF' }}
      payload_on: "ON"
      payload_off: "OFF"
      device_class: problem
      device: *hae_heart
```

### Verification

After saving the package and restarting HA:

1. **Entities exist** — Settings → Devices & Services → MQTT shows the parent device plus 5 children; a search for `health_auto_export_` returns the full sensor set (~60 entities in the reference setup).
2. **First payload populates state** — Trigger an export from the iOS app (Manual Sync, or wait one cadence). Entities transition from `unknown` to live values within ~1 push interval.
3. **Long-term statistics** — Within a few minutes the `total_increasing` sensors appear in HA's Statistics view, even if current state is `unknown` after a restart.
4. **Dashboard binding** — Sickbay → gear → confirm `hae:<userTag>` is listed as an available source and map it to the correct `person.*` profile.

### Known Constraints

- **`unknown` after restart.** The iOS app publishes with `retain=false`, so after a HA restart sensors stay `unknown` until the next push (~60 s on a 1-min cadence). LTS persists across restarts independent of current state.
- **No retain-relay workaround.** HA's template engine caps rendered template output at **262 144 chars**, smaller than a typical full payload (~400 KB with all metrics + minute granularity). An automation that "republishes with retain=true" cannot fit the payload through a template.
- **Cumulative sensors need Date Range = Default/Today.** "Since Last Sync" makes totals incorrect because the sum sees only deltas, not the full set of today's samples.
- **Voltage arrays.** ECG payloads can include ~512 samples/sec × 30 sec ≈ 15K voltage entries per reading. The reference templates **never** output these — only summary fields (classification, average HR, severity, start timestamp).

### Related Specs

- [LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md](../specs/LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md)
- [LCARS-MEDICAL-INTEGRATIONS-BRIEFING.md](../specs/LCARS-MEDICAL-INTEGRATIONS-BRIEFING.md)
- [LCARS-MEDICAL-PROFILE-BINDING-EDITOR-SPEC.md](../specs/LCARS-MEDICAL-PROFILE-BINDING-EDITOR-SPEC.md)
