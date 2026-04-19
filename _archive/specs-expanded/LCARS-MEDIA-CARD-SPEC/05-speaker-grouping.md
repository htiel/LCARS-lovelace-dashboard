## 4. Speaker Grouping

A key feature for HomePod and Sonos setups: showing which speakers are grouped, and allowing group management.

### Group Detection

```javascript
/**
 * Extract group members from a media_player entity.
 * Returns array of entity_ids in the group (including self).
 */
function getGroupMembers(stateObj) {
  if (!stateObj?.attributes?.group_members) return [];
  return stateObj.attributes.group_members;
}

/**
 * Get display name for a grouped speaker.
 */
function getGroupMemberName(hass, entityId) {
  const stateObj = hass.states[entityId];
  if (!stateObj) return entityId.split('.')[1].replace(/_/g, ' ').toUpperCase();
  return (stateObj.attributes.friendly_name || entityId).toUpperCase();
}

/**
 * Check if a media_player supports grouping.
 */
function supportsGrouping(stateObj) {
  return hasFeature(
    stateObj?.attributes?.supported_features || 0,
    MEDIA_FEATURES.GROUPING
  );
}
```

### Group Member List (in Metadata Column)

When grouped, the metadata column shows each member as a dot + name:

```html
<div class="media-group-section">
  <div class="device-sensor-line" role="listitem"
       aria-label="Grouped: ${count} speakers">
    <div class="sensor-indicator" style="background: var(--lcars-african-violet)"></div>
    <span class="sensor-label">GROUPED</span>
    <span class="sensor-state-value"
          style="color: var(--lcars-african-violet)">${count} SPEAKERS</span>
  </div>
  ${groupMembers.map(entityId => html`
    <div class="media-group-member" role="listitem">
      <div class="sensor-indicator"
           style="background: var(--lcars-african-violet)"></div>
      <span class="sensor-label">${getGroupMemberName(hass, entityId)}</span>
    </div>
  `)}
</div>
```

```css
.media-group-member {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 1.5rem;
  padding: 0 0.5rem 0 1rem;           /* Extra left indent for hierarchy */
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-space-white);
  text-transform: uppercase;
}
```

### Multi-Room Stacking

When rendering multiple media panels (e.g., one per room), they stack vertically with generous spacing — same pattern as the Device Panel Spec §6:

```css
.media-panels-column {
  display: flex;
  flex-direction: column;
  gap: calc(var(--lcars-gap) * 4);     /* 1rem between panels */
  align-items: flex-end;
}

.media-panels-column > .lcars-media-panel {
  width: 100%;
  max-width: 48rem;
}
```

---
