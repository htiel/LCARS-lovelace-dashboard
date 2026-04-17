## 13. Tile Tap / Click Interaction

Tapping a tile opens the HA `more-info` dialog for the room's temperature entity, giving access to the full history graph and entity details.

```javascript
/**
 * Handle tile tap — fire HA more-info event.
 * @param {Event} e - Click/tap event
 * @param {string} entityId - Primary entity (temperature) to show
 */
function handleTileTap(e, entityId) {
  e.stopPropagation();
  const event = new CustomEvent('hass-more-info', {
    bubbles: true,
    composed: true,
    detail: { entityId },
  });
  this.dispatchEvent(event);
}
```

---
