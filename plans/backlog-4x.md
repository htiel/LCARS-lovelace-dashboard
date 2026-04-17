# LCARS Dashboard - 4.x Backlog

> Stable branch (`4.0`). Non-breaking feature additions, bug fixes, and optimizations.
> Version: 4.18.8 (current stable)
>
> Completed items through 4.18.8 archived to `_archive/plans/backlog-4x.md`.

---

## Status Key

| Tag | Meaning |
|-----|---------|
| `TODO` | Not started |
| `IN PROGRESS` | Active work |
| `BLOCKED` | Waiting on dependency |
| `DONE` | Shipped - archived after release |

---

## Backlog

### 4X-27 - Clean up hass.data[DOMAIN] in async_unload_entry - `TODO` - Priority: LOW - Size: XS

**GitHub Issue**: [#27](https://github.com/htiel/LCARS-lovelace-dashboard/issues/27)

HA convention is `hass.data.pop(DOMAIN, None)` in `async_unload_entry`. Current code leaves stale data (4 empty OrderedDicts). Found by Data during v4.18.8 review.

**Acceptance criteria**:
- `async_unload_entry` calls `hass.data.pop(DOMAIN, None)` after platform unload

---

### 4X-28 - Migrate remaining open() patterns to helpers - `TODO` - Priority: LOW - Size: S

**GitHub Issue**: [#28](https://github.com/htiel/LCARS-lovelace-dashboard/issues/28)

`more_pages` config loading in `websocket_get_configuration` still uses `async_add_executor_job(open, ...)` instead of the new `_read_yaml_file` helper. Inconsistent with refactored helpers. Found by Data during v4.18.8 review.

**Acceptance criteria**:
- All file I/O in `__init__.py` uses `_read_yaml_file` / `_write_yaml_file` helpers
- No direct `open()` calls remain outside the helper functions

---

### 4X-29 - Add responsive breakpoints to remaining panels - `TODO` - Priority: MEDIUM - Size: M

**GitHub Issue**: [#29](https://github.com/htiel/LCARS-lovelace-dashboard/issues/29)

Only power, life support, illumination, and homepage have responsive breakpoints. 8 panels need single-column fallback below ~480px: alarm, battery, camera, climate, environment, irrigation, media, pool-spa, weather. Found by Geordi during v4.18.7 review.

**Acceptance criteria**:
- All panel grid layouts collapse to single-column below 480px
- No horizontal overflow on mobile viewports
- Existing desktop layouts unchanged

---

### 4X-30 - Reduce gradient usage in legacy homepage card - `TODO` - Priority: LOW - Size: M

**GitHub Issue**: [#30](https://github.com/htiel/LCARS-lovelace-dashboard/issues/30)

20+ gradient uses in `lcars-homepage-card.js` (camera overlays, scroll fades, edit indicators). Some are functional (mask-image for scroll fade) but several are decorative, violating Bracer Jack Rule 1. Found by Geordi during v4.18.7 review.

**Acceptance criteria**:
- Audit all `linear-gradient` / `radial-gradient` uses in homepage card
- Remove purely decorative gradients
- Document functional gradients (scroll fades, mask-image) as intentional exceptions
