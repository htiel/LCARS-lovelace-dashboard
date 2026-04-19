## 14. Appliance Meter Handling

Some SwitchBot Meters monitor appliances (fridge, freezer) rather than room temperature. These are filtered out by default (`show_appliance_meters: false`) because their temperature ranges are dramatically different (-10°F to 40°F) and would distort the grid's color coding and averages.

### Detection Heuristic

Appliance meters are identified by device name matching:

```javascript
const APPLIANCE_PATTERN = /fridge|freezer|wine\s*cooler|kegerator|deep\s*freeze/i;
```

### When Enabled (`show_appliance_meters: true`)

Appliance meters render with a distinct visual treatment:

```css
.sensor-tile.appliance {
  border-style: dashed;                       /* Dashed border = secondary/utility */
  opacity: 0.7;
}

.sensor-tile.appliance .tile-name::after {
  content: ' ❄';                              /* Snowflake suffix for appliance tiles */
  font-size: 0.75rem;
}
```

Appliance meters use **different color thresholds** (not the room comfort scale):

| Range (°F)   | Status   | LCARS Variable         | Notes                  |
|--------------|----------|------------------------|------------------------|
| < 0          | Too Cold | `--lcars-blue`         | Freezer over-cooling   |
| 0–10         | Nominal  | `--lcars-ice`          | Freezer happy range    |
| 11–38        | Nominal  | `--lcars-ice`          | Fridge happy range     |
| 39–45        | Warm     | `--lcars-sunflower`    | Getting warm for a fridge |
| > 45         | Alert    | `--lcars-tomato`       | Food safety concern    |

Appliance meters are **excluded from whole-home averages** regardless of visibility.

---
