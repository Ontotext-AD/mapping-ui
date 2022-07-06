import {defineConfig} from 'cypress';

export default defineConfig({
  fixturesFolder: 'cypress/fixtures',
  defaultCommandTimeout: 10000,
  video: false,
  numTestsKeptInMemory: 10,
  retries: {
    runMode: 2,
  },
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/test/**/*.cy.{js,jsx,ts,tsx}',
    // Sometimes elements are in detached state, that's why we check in the shadowDom.
    includeShadowDom: true,
  },
});
