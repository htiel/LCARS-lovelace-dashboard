## 4. Python Backend for Multi-Dashboard

### 4.1 Current Architecture

`load_dashboard.py` registers ONE dashboard:

```python
hass.data["lovelace"].dashboards[dashboard_url] = LovelaceYAML(hass, dashboard_url, dashboard_config)
_register_panel(hass, dashboard_url, "yaml", dashboard_config, False)
```

`load_plugins.py` registers the JS bundle ONCE globally:

```python
add_extra_js_url(hass, js_url)  # Available to ALL dashboards
```

### 4.2 Multi-Dashboard Extension (v5.0)

Registration is trivially extensible — call `LovelaceYAML` + `_register_panel()` in a loop:

```python
DASHBOARDS = {
    "lcars-habitat":       {"title": "Habitat",       "icon": "mdi:home",          "filename": "lovelace/habitat.yaml"},
    "lcars-environmental": {"title": "Environmental", "icon": "mdi:leaf",           "filename": "lovelace/environmental.yaml"},
    "lcars-security":      {"title": "Security",      "icon": "mdi:shield",         "filename": "lovelace/security.yaml"},
    "lcars-power":         {"title": "Power Systems", "icon": "mdi:lightning-bolt",  "filename": "lovelace/power.yaml"},
    # ...
}

for url, cfg in DASHBOARDS.items():
    hass.data["lovelace"].dashboards[url] = LovelaceYAML(hass, url, {
        "mode": "yaml", "icon": cfg["icon"], "title": cfg["title"],
        "filename": f"custom_components/lcars_dashboard/{cfg['filename']}",
        "show_in_sidebar": True, "require_admin": False,
    })
    _register_panel(hass, url, "yaml", cfg, False)
```

The JS bundle is registered once — `add_extra_js_url()` adds it to the global frontend, so all dashboards get it automatically.

**Each dashboard's YAML template** references the same custom elements but with different entity filtering. The panel components receive entities as properties — they don't care which dashboard instantiated them.

### 4.3 Architectural Implication for Panel Extraction

This confirms the panel extraction is the **prerequisite** for multi-dashboard. Without reusable panel components, each dashboard YAML would need to inline its own rendering logic — defeating the purpose.

The extraction enables: Dashboard YAML → custom layout element → panel sub-components. Change a panel once → all dashboards update.

---
