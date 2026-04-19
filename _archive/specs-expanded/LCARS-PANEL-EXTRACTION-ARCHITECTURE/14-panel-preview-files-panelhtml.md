## 13. Panel Preview Files (`panel.html`)

Each panel directory includes a **`panel.html`** file — a standalone, static HTML page that renders the panel's look and feel with hardcoded sample data. These are development/review aids, not shipped to users.

### 12.1 Purpose

- **Visual verification**: Open in any browser (Edge, Chrome) to see the panel without running Home Assistant
- **Design review**: Allows Geordi (UI review) and the Admiral to inspect look & feel at any time
- **Living documentation**: Updated whenever panel CSS or HTML structure changes
- **Regression catch**: Visual side-by-side comparison before/after refactor

### 12.2 Structure

Each `panel.html` is a self-contained file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>LCARS [Panel Name] — Preview</title>
  <style>
    /* LCARS base tokens (copy of lcars-styles.js custom properties) */
    /* Panel frame CSS (from Tier 2 — lcars-base-panel) */
    /* Panel-specific CSS (from Tier 3 — this panel) */
  </style>
</head>
<body style="background: #000; margin: 0; padding: 24px;">
  <!-- Static HTML matching the panel's lit-html template output -->
  <!-- Hardcoded sample entity values (realistic HA data) -->
</body>
</html>
```

### 12.3 Rules

1. **No JavaScript dependencies** — pure HTML + CSS, opens via `file://` in any browser
2. **Sample data must be realistic** — use plausible HA entity states, not lorem ipsum
3. **Must stay in sync** — whenever a panel's render template or CSS changes, update its `panel.html`
4. **Not in webpack build** — excluded from bundle. Add `panels/**/panel.html` to webpack `exclude` if needed
5. **Git-tracked** — these are checked in, not generated

### 12.4 Gallery Index

`panels/index.html` links to all 10 panel previews with thumbnail descriptions. Opening it shows a navigation page to quickly jump to any panel's preview.

---
