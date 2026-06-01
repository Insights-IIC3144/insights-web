/*
 * E2E Tests: Authentication
 */
describe("Authentication and route protection", () => {
  context("Unauthenticated user", () => {
    // These tests verify the Auth0 middleware redirect behaviour.
    // They require the server to run WITHOUT CYPRESS_TESTING=true (i.e. with the
    // real middleware active). When the full test suite runs with CYPRESS_TESTING=true
    // the middleware is bypassed so these tests are permanently skipped here.
    // To run them, start the server normally (npm run dev) and open Cypress without
    // the CYPRESS_TESTING env var: npx cypress open
    it.skip("visiting /sales redirects to /login", () => {
      cy.visit("/sales", { failOnStatusCode: false });
      cy.url().should("include", "/login");
    });

    it.skip("visiting /dashboard redirects to /login", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });
      cy.url().should("include", "/login");
    });

    it.skip("visiting / redirects to /login", () => {
      cy.visit("/", { failOnStatusCode: false });
      cy.url().should("include", "/login");
    });
  });

  context("Login page", () => {
    beforeEach(() => {
      cy.visit("/login");
    });

    it("renders the platform title", () => {
      cy.contains("Inicia sesión en Insights").should("be.visible");
    });

    it("renders the correct subtitle", () => {
      cy.contains("Accede al panel analítico de tu marca.").should("be.visible");
    });

    it("shows the Google sign-in button", () => {
      cy.contains("Continuar con Google").should("be.visible");
    });

    it("shows the corporate email sign-in button", () => {
      cy.contains("Continuar con correo corporativo").should("be.visible");
    });

    it("clicking Google initiates the Auth0 redirect with the correct connection", () => {
      // window.location.assign is non-configurable in Chrome/Electron and cannot be stubbed.
      // Instead, intercept the navigation request at the network level so we can assert
      // that clicking the button triggers the correct Auth0 redirect URL.
      cy.intercept("GET", "/api/auth/login*").as("auth0Login");

      cy.contains("Continuar con Google").click();

      cy.wait("@auth0Login")
        .its("request.url")
        .should("include", "connection=google-oauth2");
    });

    it("clicking corporate email initiates the Auth0 redirect", () => {
      cy.intercept("GET", "/api/auth/login*").as("auth0Login");

      cy.contains("Continuar con correo corporativo").click();

      cy.wait("@auth0Login").its("request.url").should("include", "/api/auth/login");
    });

    it("shows the unauthorized access popup when ?error=unauthorized is present", () => {
      cy.visit("/login?error=unauthorized");
      cy.contains("Acceso denegado").should("be.visible");
      cy.contains("no cuenta con una invitación válida").should("be.visible");
    });

    it("closes the unauthorized popup when clicking 'Entendido'", () => {
      cy.visit("/login?error=unauthorized");
      cy.contains("Acceso denegado").should("be.visible");
      cy.contains("Entendido").click();
      cy.contains("Acceso denegado").should("not.exist");
    });
  });
});
