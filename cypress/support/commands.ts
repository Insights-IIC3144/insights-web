declare global {
  namespace Cypress {
    interface Chainable {
      mockSession(): Chainable<void>;
      interceptCompetitiveApi(scenario?: "default" | "empty" | "error"): Chainable<void>;
      clearSession(): Chainable<void>;
    }
  }
}
 
Cypress.Commands.add("clearSession", () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.window().then((win) => win.sessionStorage.clear());
});
 
Cypress.Commands.add("mockSession", () => {
  cy.intercept("GET", "**/api/users/me", {
    fixture: "user-me.json",
    statusCode: 200,
  }).as("getUserMe");
 
  cy.intercept("GET", "**/api/proxy/filters*", {
    body: { brands: ["MyBrand", "OtherBrand"] },
    statusCode: 200,
  }).as("getFilters");
});
 
Cypress.Commands.add("interceptCompetitiveApi", (scenario = "default") => {
  if (scenario === "default") {
    cy.intercept("GET", "**/api/proxy/competitive/all**", {
      fixture: "competitive-all.json",
      statusCode: 200,
    }).as("getCompetitiveAll");
 
    cy.intercept("GET", "**/api/proxy/competitive/performance-cards**", {
      fixture: "competitive-cards.json",
      statusCode: 200,
    }).as("getCompetitiveCards");
  }
 
  if (scenario === "empty") {
    cy.intercept("GET", "**/api/proxy/competitive/all**", {
      body: [],
      statusCode: 200,
    }).as("getCompetitiveAllEmpty");
 
    cy.intercept("GET", "**/api/proxy/competitive/performance-cards**", {
      body: {
        topShareCategory: null,
        topSharePercentage: null,
        bestGrowthCategory: null,
        bestGrowthPercentage: null,
        worstGrowthCategory: null,
        worstGrowthPercentage: null,
      },
      statusCode: 200,
    }).as("getCompetitiveCardsEmpty");
  }
 
  if (scenario === "error") {
    cy.intercept("GET", "**/api/proxy/competitive/all**", {
      statusCode: 500,
      body: { error: "Internal Server Error" },
    }).as("getCompetitiveAllError");
 
    cy.intercept("GET", "**/api/proxy/competitive/performance-cards**", {
      statusCode: 500,
      body: { error: "Internal Server Error" },
    }).as("getCompetitiveCardsError");
  }
});
 
export {};