import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    fixturesFolder: "cypress/fixtures",
    viewportWidth: 1440,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: false,
    defaultCommandTimeout: 8000,
    requestTimeout: 15000,
    setupNodeEvents(on, config) {
      return config;
    },
  },
  env: {
    AUTH0_DOMAIN: "your-tenant.us.auth0.com",
    AUTH0_CLIENT_ID: "your_client_id",
    AUTH0_CLIENT_SECRET: "your_client_secret",
    AUTH0_AUDIENCE: "your_api_audience",
    TEST_USER_EMAIL: "test@example.com",
    TEST_USER_PASSWORD: "TestPassword123!",
  },
});