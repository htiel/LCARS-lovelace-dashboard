const path = require('path');

module.exports = {
  entry: [
    './src/lcars-navigation-card.js',
    './src/lcars-dashboard.js',
    './src/lcars-dashboard-layout.js',
    './src/lcars-homepage-card.js',
    './src/lcars-more-pages-card.js',
    './src/lcars-more-page-card.js',
    './src/lcars-edit-more-page-card.js',
    './src/lcars-notification-card.js',
    './src/lcars-house-information-card.js',
    './src/lcars-house-information-more-info-card.js',
    './src/lcars-blueprint-card.js',
    './src/lcars-devicespage-card.js',
    './src/lcars-flexbox-card.js',
    './src/lcars-heading-card.js',
    './src/lcars-create-custom-card-card.js',
    './src/lcars-edit-area-button-card.js',
    './src/lcars-edit-entity-card-card.js',
    './src/lcars-edit-entity-card.js',
    './src/lcars-edit-entity-popup-card.js',
    './src/lcars-edit-homepage-header-card.js',
    './src/lcars-edit-device-card-card.js',
    './src/lcars-edit-device-popup-card.js',
    './src/lcars-edit-device-button-card.js',
    './src/lcars-edit-panel-order-card.js',
    './src/lcars-popup.js',
    './src/lcars-sidebar-reorder.js',
    './src/lcars-internal-sensors-grid.js',  // 4X-2: Temp/Humidity Grid
    './src/lcars-illumination-card.js',      // 5X-2.5: Illumination Dashboard
    './src/lcars-illumination-layout.js',    // 5X-2.5: Illumination Layout (filter sidebar)
    './src/lcars-tactical-card.js',          // 5X-2.2: Tactical (Security) Dashboard
    './src/lcars-tactical-layout.js',        // 5X-2.2: Tactical Layout
    './src/lcars-engineering-card.js',       // 5X-2.3: Engineering (Power) Dashboard
    './src/lcars-engineering-layout.js',     // 5X-2.3: Engineering Layout
    './src/lcars-lifesupport-card.js',       // 5X-2.4: Life Support (Environmental) Dashboard
    './src/lcars-lifesupport-layout.js',     // 5X-2.4: Life Support Layout
    './src/lcars-cetacean-card.js',          // 5X-3.1: Cetacean Ops (Pool & Spa) Dashboard
    './src/lcars-cetacean-layout.js',        // 5X-3.1: Cetacean Ops Layout
  ],
  mode: 'production',
  output: {
    filename: 'lcars-dashboard.js',
    path: path.resolve(__dirname, 'dist')
  },
  // The 244 KiB default targets public 3G mobile web apps. This bundle is
  // served once-per-frontend-session over LAN (or HTTPS w/ aggressive cache)
  // to a kiosk/desktop browser inside Home Assistant — the original threshold
  // is irrelevant here. Raised to 1.5 MiB; revisit chunk-splitting only if
  // we exceed it. See Data's analysis (beta.36 review).
  performance: {
    maxAssetSize: 1500000,
    maxEntrypointSize: 1500000,
    hints: 'warning'
  },
  devtool: false
};
