## 10. Panel Communication Contract

Every panel component accepts these properties (set by the orchestrator):

```js
/**
 * @property {Object} hass — Home Assistant object (states, services, etc.)
 * @property {Array} entities — Array of {entity, state, domain, device_class, category} entries
 * @property {Object} device — HA device registry entry for this device group
 * @property {String} area — Currently selected area ID (or null)
 * @property {Boolean} editMode — Whether the dashboard is in edit mode
 * @property {Object} data — Full LCARS dashboard configuration object
 */
```

Events fired upward (via `fireEvent` or `CustomEvent`):

```js
// Entity interaction
this.dispatchEvent(new CustomEvent('lcars-show-more-info', {
  detail: { entityId }, bubbles: true, composed: true
}));

// Edit mode actions
this.dispatchEvent(new CustomEvent('lcars-edit-device', {
  detail: { deviceId }, bubbles: true, composed: true
}));
```

This is the standard Lit "properties down, events up" pattern.

---
