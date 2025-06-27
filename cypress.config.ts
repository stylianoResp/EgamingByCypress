import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    experimentalStudio: true,
    supportFile: 'cypress/support/index.ts',
    viewportWidth: 1440,
    viewportHeight: 900,
    defaultCommandTimeout: 10000,
    baseUrl: 'https://brands-slottio.gaem-dev.org', // or your app's URL
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});


