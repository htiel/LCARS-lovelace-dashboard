DOMAIN = "lcars_dashboard"
VERSION = "5.2.0-beta.2"

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
    # 5X-3.3 / 5.2.0 — Subspace Relay (Network) per LCARS-SUBSPACE-RELAY-DASHBOARD-SPEC.md
    # require_admin=True per Worf spec §15 — client/host/MAC data is sensitive even for read-only
    "network":       {"default_title": "Subspace Relay", "default_icon": "mdi:lan",         "url_path": "lcars-network",      "require_admin": True},
}

MAX_DASHBOARDS = len(DASHBOARD_REGISTRY)  # 7
