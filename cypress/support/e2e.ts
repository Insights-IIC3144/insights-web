import "./commands";

Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("ResizeObserver loop")) { return false; }
  if (err.message.includes("Hydration failed")) { return false; }
  return true;
});

beforeEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();
});