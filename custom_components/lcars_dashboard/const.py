DOMAIN = "lcars_dashboard"
VERSION = "5.0.0-beta.1"

# Configuration keys
CONF_DASHBOARDS = "dashboards"
DEFAULT_DASHBOARDS = ["habitat"]

# Dashboard registry — canonical definitions
# url_path uses "lcars-" prefix to avoid collisions with user-created HA dashboards
DASHBOARD_REGISTRY = {
    "habitat":       {"default_title": "Habitat",       "default_icon": "mdi:home",        "url_path": "lcars-habitat"},
    "security":      {"default_title": "Tactical",      "default_icon": "mdi:shield",      "url_path": "lcars-security"},
    "power":         {"default_title": "Engineering",   "default_icon": "mdi:flash",       "url_path": "lcars-power"},
    "environmental": {"default_title": "Life Support",  "default_icon": "mdi:thermometer",  "url_path": "lcars-environmental"},
    "lighting":      {"default_title": "Illumination",  "default_icon": "mdi:lightbulb",   "url_path": "lcars-lighting"},
}

MAX_DASHBOARDS = len(DASHBOARD_REGISTRY)  # Hard cap = 5
