# LCARS Dashboard — Development Setup

> Last verified: 2026-04-15

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | v24.x LTS | `winget install OpenJS.NodeJS.LTS` |
| **npm** | 11.x (bundled) | Comes with Node.js |
| **Python** | 3.12.x | `winget install Python.Python.3.12` |
| **Git** | 2.53+ | `winget install Git.Git` |

### PowerShell Execution Policy

Scripts (venv activation, npm) require at least `RemoteSigned`:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

---

## Quick Start

```powershell
# 1. Clone
git clone https://github.com/htiel/LCARS-lovelace-dashboard.git
cd LCARS-lovelace-dashboard

# 2. Python virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install homeassistant voluptuous jinja2 pyyaml annotatedyaml aiohttp aiofiles

# 3. Node.js dependencies (JS build toolchain)
cd custom_components\lcars_dashboard\js
npm install

# 4. Build the JS bundle
npm run build        # production build → lcars-dashboard.js
npm run watch        # dev mode with auto-rebuild
```

---

## Git Configuration

This repo is configured to push as **htiel** with no login prompt:

```powershell
git config --local user.name "htiel"
git config --local user.email "htiel@users.noreply.github.com"
git config --local credential.https://github.com.username htiel
```

These settings are already applied to this clone.

---

## Project Structure

```
LCARS-lovelace-dashboard/
├── custom_components/lcars_dashboard/   # HA integration (Python)
│   ├── __init__.py                      # Integration setup, websocket API, services
│   ├── config_flow.py                   # HA config flow UI
│   ├── const.py                         # DOMAIN, VERSION constants
│   ├── load_dashboard.py                # Lovelace panel registration
│   ├── load_plugins.py                  # Frontend JS plugin loading
│   ├── notifications.py                 # Notification websocket handlers
│   ├── process_yaml.py                  # YAML/Jinja2 template processing
│   ├── sensor.py                        # HA sensor entity
│   ├── manifest.json                    # HA integration manifest (v4.16.6)
│   ├── services.yaml                    # HA service definitions
│   ├── js/                              # Frontend (JavaScript)
│   │   ├── package.json                 # npm deps & build scripts
│   │   ├── webpack.config.js            # Webpack 5 config (28 entry points)
│   │   ├── src/                         # 34 LitElement web component sources
│   │   │   ├── lcars-dashboard.js       # Main dashboard orchestrator
│   │   │   ├── lcars-homepage-card.js   # Homepage + all panel renderers (~3140 lines)
│   │   │   ├── lcars-styles.js          # LCARS CSS theme/variables
│   │   │   └── ...                      # Cards, popups, editors, utils
│   │   └── vendor/                      # Vendored HA/lovelace helpers
│   ├── lovelace/                        # YAML view definitions
│   │   ├── ui-lovelace.yaml
│   │   └── views/                       # 4 view files (homepage, devices, more pages)
│   ├── translations/                    # i18n: en, bg, pl, zh
│   └── brand/                           # Icons/branding assets
├── plans/                               # Implementation plans & backlogs
├── specs/                               # 16 spec documents (panels, architecture)
├── screenshots/                         # UI screenshots
├── hacs.json                            # HACS distribution config
├── CHANGELOG.md
└── README.md
```

---

## Build Commands

| Command | Location | Description |
|---------|----------|-------------|
| `npm run build` | `custom_components/lcars_dashboard/js/` | Production webpack build → `lcars-dashboard.js` |
| `npm run watch` | `custom_components/lcars_dashboard/js/` | Dev mode with file watching |

The webpack config bundles 28 entry points into a single `lcars-dashboard.js` file (~203 KiB).

---

## Python Dependencies

| Package | Purpose |
|---------|---------|
| `homeassistant` | Core HA APIs (config, components, websocket, helpers) |
| `voluptuous` | Schema validation for services & config |
| `jinja2` | Template processing in YAML views |
| `pyyaml` | YAML parsing/writing |
| `annotatedyaml` | HA's annotated YAML loader |
| `aiohttp` | Async HTTP (HA dependency) |
| `aiofiles` | Async file I/O |

---

## Node.js Dependencies

**Runtime:**
- `lit-element` / `lit-html` — Web component framework
- `custom-card-helpers` — HA Lovelace card utilities
- `card-tools` — Lovelace card tools (thomasloven)
- `@mdi/js` — Material Design Icons
- `js-cookie` — Cookie management
- `sortablejs` — Drag-and-drop sorting

**Build:**
- `webpack` / `webpack-cli` — Module bundler
- `css-loader` / `style-loader` — CSS processing
- `postcss` / `autoprefixer` / `tailwindcss` — CSS toolchain

---

## Current Version

- **Integration**: v4.16.6
- **HA minimum**: 2025.4.0
- **Architecture**: LitElement v2 web components, Webpack 5, single-bundle HACS distribution
