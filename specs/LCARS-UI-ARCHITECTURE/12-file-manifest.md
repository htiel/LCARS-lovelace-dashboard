## 11. File Manifest

Source files to create in `custom_components/lcars_dashboard/js/src/`:

| File | Custom Element | Purpose |
|------|----------------|---------|
| `lcars-dashboard-layout.js` | `lcars-dashboard-layout` | LCARS frame, grid, elbows, sidebar, header/footer bars |
| `dwains-navigation-card.js` | `dwains-navigation-card` | Sidebar nav button generation from HA config |
| `dwains-homepage-card.js` | `homepage-card` | Area grid, favorites section, house info embed |
| `dwains-devicespage-card.js` | `devices-card` | Device panels with entity rows |
| `dwains-more-pages-card.js` | `more-pages-card` | More-page navigation list |
| `dwains-more-page-card.js` | `more-page-card` | Individual more-page container |
| `dwains-house-information-card.js` | `dwains-house-information-card` | Weather, alarm, sensor status |
| `dwains-heading-card.js` | `dwains-heading-card` | LCARS section heading |
| `dwains-flexbox-card.js` | `dwains-flexbox-card` | Generic flex container |
| `dwains-popup.js` | `dwains-popup` | Modal dialog with mini LCARS frame |
| `dwains-notification-card.js` | `dwains-notification-card` | Notification list |
| `translations.js` | (utility) | i18n strings — already exists |
| `lcars-audio.js` | (utility) | Audio grammar playback utility |

### Lit Element Base Pattern

Every component follows this structure:

```javascript
import { LitElement, html, css } from 'lit-element';

class DwainsDashboardLayout extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      narrow: { type: Boolean },
      route: { type: Object },
      panel: { type: Object },
    };
  }

  static get styles() {
    return css`
      /* ═══ LCARS CSS ═══ */
      :host {
        display: block;
        /* All --lcars-* custom properties defined here */
      }
      /* ... component styles ... */
    `;
  }

  render() {
    return html`
      <div class="lcars-frame">
        <!-- LCARS structure -->
      </div>
    `;
  }

  // HA lifecycle hooks
  setConfig(config) { this.config = config; }
  getCardSize() { return 1; }
}

customElements.define('lcars-dashboard-layout', DwainsDashboardLayout);
```

---
