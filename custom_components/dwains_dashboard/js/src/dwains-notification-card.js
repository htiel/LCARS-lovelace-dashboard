/**
 * LCARS Notification Card — Displays dashboard notifications
 * Styled as LCARS data readout with alert-colored indicators
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';

const waitForHelpers = [
  customElements.whenDefined('hui-masonry-view'),
  customElements.whenDefined('hc-lovelace'),
];

Promise.race(waitForHelpers).then(async () => {
  await new Promise((r) => setTimeout(r, 2000));

  class LcarsNotificationCard extends LitElement {
    static get properties() {
      return {
        _hass: { type: Object },
        _notifications: { type: Array },
      };
    }

    constructor() {
      super();
      this._notifications = [];
    }

    set hass(hass) {
      this._hass = hass;
      this._loadNotifications();
    }

    setConfig(config) {
      this._config = config;
    }

    async _loadNotifications() {
      if (!this._hass) return;
      try {
        const result = await this._hass.callWS({
          type: 'dwains_dashboard/notification/get',
        });
        if (Array.isArray(result)) {
          this._notifications = result;
        }
      } catch (e) {
        // Notification endpoint may not exist in all installations
      }
    }

    _dismissNotification(id) {
      if (!this._hass) return;
      this._hass.callWS({
        type: 'dwains_dashboard/notification/dismiss',
        notification_id: id,
      }).then(() => {
        this._notifications = this._notifications.filter((n) => n.id !== id);
      }).catch(() => {});
    }

    static get styles() {
      return [
        lcarsBaseStyles,
        css`
          :host { display: block; }

          .notification-list {
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
          }

          .notification {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: var(--lcars-orange);
            color: var(--lcars-black);
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
          }

          .notification.alert {
            background: var(--lcars-red-alert);
            color: var(--lcars-space-white);
          }

          .notification.info {
            background: var(--lcars-sky);
          }

          .notification-message { flex: 1; }

          .notification-dismiss {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            padding: 0.25rem;
            font-family: var(--lcars-font);
            font-size: 0.75rem;
            text-transform: uppercase;
            opacity: 0.7;
            transition: opacity var(--lcars-transition);
          }

          .notification-dismiss:hover { opacity: 1; }

          .lcars-empty {
            color: var(--lcars-gray);
            font-size: var(--lcars-font-size-data);
            padding: 1rem 0;
            text-align: center;
          }
        `,
      ];
    }

    render() {
      if (this._notifications.length === 0) {
        return html``;
      }

      return html`
        <div class="notification-list" role="log" aria-label="Notifications">
          ${this._notifications.map(
            (n) => html`
              <div
                class="notification ${n.type || 'info'}"
                role="status"
              >
                <ha-icon .icon=${n.type === 'alert' ? 'mdi:alert' : 'mdi:information-outline'}></ha-icon>
                <span class="notification-message">${n.message || n.title || 'Notification'}</span>
                <button
                  class="notification-dismiss"
                  @click=${() => this._dismissNotification(n.id)}
                  aria-label="Dismiss"
                >
                  &#x2715;
                </button>
              </div>
            `
          )}
        </div>
      `;
    }

    getCardSize() { return this._notifications.length || 0; }
  }

  if (!customElements.get('dwains-notification-card')) {
    customElements.define('dwains-notification-card', LcarsNotificationCard);
  }
});
