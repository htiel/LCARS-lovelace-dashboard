## 9. Interaction Patterns

### 9.1 Tile Tap / Click

- **Circuit tile tap**: Opens `showMoreInfo(entityId)` — standard HA more-info dialog showing history graph
- **Device row tap (on name/stats area)**: Opens `showMoreInfo(primaryEntityId)` for the power sensor
- **Toggle tap**: Calls `hass.callService('switch', 'toggle', { entity_id })` — no more-info
- **Strip header tap**: Opens `showMoreInfo(parentEntityId)` for the strip parent
- **Strip outlet tap**: Same as device row — tap name/stats for more-info, tap toggle for switch

### 9.2 Long Press (Future)

Reserved for edit mode. Not in v4.15.0 scope.

---
