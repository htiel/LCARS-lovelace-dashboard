## 7. Testing Checklist

### 7.1 Detection & Rendering

| # | Test Case                                          | Expected Result                                    | Pass? |
|---|----------------------------------------------------|----------------------------------------------------|-------|
| 1 | BlueAir device appears in an area                  | Environment panel renders (not generic/camera/battery) | ☐    |
| 2 | Panel shows 3-column layout (sensors/cylinder/controls) | Not sensor-only mode (fan entity present)      | ☐    |
| 3 | All BlueAir sensors appear in left column          | PM2.5, PM1, PM10, CO₂, VOC, Temp, Humidity visible | ☐    |
| 4 | Fan toggle button appears in right column          | Shows fan state (on/off) + percentage              | ☐    |
| 5 | Preset mode strip shows `auto` and `night`         | Two buttons, correct one highlighted               | ☐    |
| 6 | Child lock switch renders in controls              | Toggle button with current state                   | ☐    |
| 7 | Germ shield switch renders (if model supports it)  | Toggle button, or absent if not supported          | ☐    |
| 8 | Filter life sensor renders in sensor column        | Shows percentage value                             | ☐    |

### 7.2 Cylinder Visualization

| # | Test Case                                          | Expected Result                                    | Pass? |
|---|----------------------------------------------------|----------------------------------------------------|-------|
| 9 | Cylinder color reflects air quality (PM2.5-based)  | Blue(good) → amber → orange → red as PM2.5 rises  | ☐    |
| 10| Particle animation speed tracks fan percentage     | Faster particles at higher fan speed               | ☐    |
| 11| Fan off → cylinder shows idle state                | Slow ambient particle drift, `scrubber-idle` class | ☐    |
| 12| PM2.5 value shown inside cylinder                  | Numeric readout centered in cylinder               | ☐    |

### 7.3 Controls & Interactions

| # | Test Case                                          | Expected Result                                    | Pass? |
|---|----------------------------------------------------|----------------------------------------------------|-------|
| 13| Tap fan toggle → fan turns on/off                  | `fan.toggle` service called, state updates         | ☐    |
| 14| Tap "auto" preset → fan goes to auto mode          | `fan.set_preset_mode` called with `auto`           | ☐    |
| 15| Tap "night" preset → fan goes to night mode        | `fan.set_preset_mode` called with `night`          | ☐    |
| 16| Tap child lock → toggle state                      | `switch.toggle` service called                     | ☐    |
| 17| Tap any sensor line → more-info dialog opens       | Standard HA entity dialog with history             | ☐    |

### 7.4 Sparklines & History

| # | Test Case                                          | Expected Result                                    | Pass? |
|---|----------------------------------------------------|----------------------------------------------------|-------|
| 18| Sparklines render for PM2.5, PM1, CO₂, VOC        | 24h trend traces with correct colors               | ☐    |
| 19| Sparklines update after cache expiry (5 min)       | New data fetched, traces updated                   | ☐    |
| 20| Missing history (new device) → sparklines hidden   | No broken SVG or empty boxes                       | ☐    |

### 7.5 Edge Cases

| # | Test Case                                          | Expected Result                                    | Pass? |
|---|----------------------------------------------------|----------------------------------------------------|-------|
| 21| BlueAir device offline (`binary_sensor.online` off)| Sensors show `unavailable`, indicator tomato        | ☐    |
| 22| Filter expired (`binary_sensor.filter_expired` on) | Filter life shows low/critical state               | ☐    |
| 23| Preset mode `null` (manual speed, no preset active)| No preset button highlighted                       | ☐    |
| 24| Both VeSync AND BlueAir in same area               | Two separate environment panels render              | ☐    |
| 25| Mobile viewport (<768px)                           | Panel stacks vertically per responsive CSS          | ☐    |

---
