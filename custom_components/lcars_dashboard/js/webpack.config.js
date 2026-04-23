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
    './src/lcars-internal-sensors-grid.js',  // 4X-2: Temp/Humidity Grid
    './src/lcars-illumination-card.js',      // 5X-2.5: Illumination Dashboard
  ],
  mode: 'production',
  output: {
    filename: 'lcars-dashboard.js',
    path: path.resolve(__dirname)
  },
  devtool: false
};
