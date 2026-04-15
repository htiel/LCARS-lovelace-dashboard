## 15. Error States & Edge Cases

### No Sensors Found

If auto-discovery returns zero SwitchBot Meter devices:

```html
<div class="sensors-empty" role="alert">
  <span class="sensors-empty-title">NO INTERNAL SENSORS</span>
  <span class="sensors-empty-detail">
    NO SWITCHBOT METER DEVICES DETECTED.
    VERIFY BLUETOOTH INTEGRATION STATUS.
  </span>
</div>
```

```css
.sensors-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  min-height: calc(var(--lcars-vunit) * 4);
}

.sensors-empty-title {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-sub);
  color: var(--lcars-sunflower);
  text-transform: uppercase;
}

.sensors-empty-detail {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-gray);
  text-transform: uppercase;
  text-align: center;
}
```

### Partial Unavailability

If some sensors go offline (state = `unavailable` / `unknown`):
- Tile renders with gray border and 50% opacity
- "OFFLINE" overlay text
- Tile is sorted to the end of its floor group
- Excluded from averages
- Battery badge hidden (no data)

### Area Not Assigned

If a device has no `area_id` in the device registry:
- Room name falls back to the device name with "Meter - " prefix stripped
- Floor group = "UNASSIGNED" — rendered last, below all known floors

### All Sensors Offline

If all discovered sensors are `unavailable`:
- Summary row shows: `SHIP AVG — — 0 SENSORS ONLINE`
- All tiles grayed out
- No averages computed

---
