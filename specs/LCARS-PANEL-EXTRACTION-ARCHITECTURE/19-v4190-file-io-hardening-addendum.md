## v4.19.0 Addendum — File I/O Hardening

**Backlog Item**: 4X-28 (Migrate remaining open() patterns to helpers)
**Status**: IMPLEMENTED — v4.19.0
**Date**: 2026-04-17

---

### D1. File I/O Helper Architecture

All file operations in `__init__.py` now use two centralized helpers:

```python
async def _read_yaml_file(hass, rel_path):
    """Read a YAML config file safely with proper file handle management."""
    # Entire open→read→close executes inside executor thread
    # Returns OrderedDict() for missing or empty files
    # Uses hass.config.path(rel_path) for absolute resolution

async def _write_yaml_file(hass, rel_path, data):
    """Write a dict to a YAML config file, creating dirs as needed."""
    # os.makedirs + open→write→close inside executor
    # sort_keys=False preserves frontend ordering
```

**Key invariant**: No raw `open()` calls exist outside these helpers and the card/blueprint executor closures. All filesystem I/O runs in the executor thread pool — never blocking the HA event loop.

---

### D2. Migration Scope

| Category | Count | Pattern |
|----------|-------|---------|
| Config YAML reads | 18 | `_read_yaml_file(hass, rel_path)` |
| Config YAML writes | 17 | `_write_yaml_file(hass, rel_path, data)` |
| Card YAML writes | 6 | `def _write_card()` closure in executor |
| Blueprint writes | 3 | `_write_yaml_file(hass, rel_path, data)` |
| **Total** | **44** | |

**Additional blocking calls fixed:**
- 5 `os.remove()` → executor lambdas
- 4 `os.path.isdir()` → `async_add_executor_job(os.path.isdir, ...)`
- 1 `os.path.exists()` + `os.remove()` → executor closure (`ws_handle_delete_blueprint`)

---

### D3. Card Write Closures

Six handlers write card YAML to dynamic paths (area/device/entity cards, more-page pages). These use `def _write_card()` closures passed to `async_add_executor_job` because the file path may be computed at write time (e.g., timestamp-suffixed filenames for collision avoidance).

**Critical pattern**: These closures are `def`, NOT `async def`. An `async def` closure returns a coroutine object that the executor never awaits — the write silently never executes.

**`nonlocal` usage**: `ws_handle_add_card` and `ws_handle_edit_more_page` use `nonlocal filename` / `nonlocal path_to_more_page, more_page_folder` because the closure conditionally reassigns the path variable. Without `nonlocal`, Python treats it as a local variable, causing `UnboundLocalError` on the first read.

---

### D4. Eliminated Anti-Patterns

| Anti-Pattern | Occurrences Removed | Replacement |
|-------------|---------------------|-------------|
| `os.path.exists()` on event loop | ~25 | `_read_yaml_file` handles missing files |
| `os.stat().st_size != 0` on event loop | ~12 | `yaml.safe_load` returns `None` for empty; `or OrderedDict()` handles it |
| `os.makedirs()` on event loop | ~12 | `_write_yaml_file` calls `makedirs(exist_ok=True)` inside executor |
| `yaml.safe_load(json.dumps(x))` | 6 | Dropped — `json.loads()` already produces YAML-safe types |
| `open()` in executor, I/O on event loop | 44 | Entire I/O lifecycle in executor |

---

### D5. Security Fix — sortType Validation

`ws_handle_sort_entity` previously accepted any string as `sortType`:
```python
vol.Required("sortType"): str  # ← any arbitrary string becomes a YAML key
```

Fixed to:
```python
vol.Required("sortType"): vol.In(ALLOWED_SORT_TYPES)  # {"sort_order", "sort_order_floor"}
```

Consistent with `ws_handle_sort_area_button` and `ws_handle_sort_device_button` which already used `vol.In(ALLOWED_SORT_TYPES)`.
