import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
    // cy.wait(alias) uses requestTimeout, not defaultCommandTimeout.
    // Under load (after ~3 min of tests) the dev server can be slow;
    // 15 s gives enough headroom without making the suite flaky.
    requestTimeout: 15000,
    responseTimeout: 15000,
    env: {
      // Se inyecta al iniciar el servidor con CYPRESS_TESTING=true
    },
  },
});
