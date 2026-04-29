DOMAIN = "lcars_dashboard"
VERSION = "5.1.0-beta.25"

# Configuration keys
CONF_DASHBOARDS = "dashboards"
CONF_DASHBOARD_ORDER = "dashboard_order"
DEFAULT_DASHBOARDS = ["habitat"]

# Dashboard registry — canonical definitions
# url_path uses "lcars-" prefix to avoid collisions with user-created HA dashboards
DASHBOARD_REGISTRY = {
    "habitat":       {"default_title": "Habitat",       "default_icon": "mdi:home",        "url_path": "lcars-habitat"},
    "security":      {"default_title": "Tactical",      "default_icon": "mdi:shield",      "url_path": "lcars-security"},
    "power":         {"default_title": "Power Distribution", "default_icon": "mdi:flash",  "url_path": "lcars-power"},
    "environmental": {"default_title": "Life Support",  "default_icon": "mdi:thermometer",  "url_path": "lcars-environmental"},
    "lighting":      {"default_title": "Illumination",  "default_icon": "mdi:lightbulb",   "url_path": "lcars-lighting"},
    "cetacean":      {"default_title": "Cetacean Ops",  "default_icon": "mdi:dolphin",     "url_path": "lcars-cetacean"},
}

MAX_DASHBOARDS = len(DASHBOARD_REGISTRY)  # 6
