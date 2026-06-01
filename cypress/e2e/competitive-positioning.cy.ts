Cypress.on('uncaught:exception', (err, runnable) => {
  console.error("Error capturado en la app:", err.message);
  return false;
});

function visitAuthenticated(apiState: "default" | "empty" | "error" = "default") {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.mockSession();

  cy.intercept("GET", "**/api/users/me",    { fixture: "user-me.json" }).as("getUsersMe");
  cy.intercept("GET", "**/api/auth/me",      { fixture: "user-me.json" }).as("getAuthMe");
  cy.intercept("GET", "**/api/auth/session", { fixture: "user-me.json" }).as("getAuthSession");

  cy.interceptCompetitiveApi(apiState);

  cy.visit("/competitive-positioning");

  cy.url().then((url) => {
    cy.log("URL ACTUAL DURANTE LA VISITA:", url);
  });
  cy.screenshot("estado-antes-del-wait");

  cy.wait("@getUsersMe", { timeout: 10000 });

  if (apiState === "default") {
    cy.wait("@getCompetitiveAll",   { timeout: 15000 });
    cy.wait("@getCompetitiveCards", { timeout: 10000 });
  }
  if (apiState === "empty") {
    cy.wait("@getCompetitiveAllEmpty",   { timeout: 15000 });
    cy.wait("@getCompetitiveCardsEmpty", { timeout: 10000 });
  }
  if (apiState === "error") {
    cy.wait("@getCompetitiveAllError",   { timeout: 15000 });
    cy.wait("@getCompetitiveCardsError", { timeout: 10000 });
  }

}

describe("Posicionamiento Competitivo", () => {
  context("Validación de Contratos de API (Fixtures)", () => {

    it("fixtures deben cumplir con modelo", () => {
      cy.fixture("competitive-all.json").then((data: any[]) => {
        expect(data).to.be.an("array").and.not.be.empty;

        const requiredKeys = [
          "category",
          "brandSales",
          "categorySales",
          "salesShare",
          "volumeShare",
          "averageBrandPrice",
          "averageBenchmarkPrice",
        ];

        data.forEach((item, idx) => {
          expect(item, `item[${idx}]`).to.include.keys(...requiredKeys);
          expect(item.salesShare, `salesShare[${idx}]`).to.be.within(0, 100);
          expect(item.brandSales, `brandSales[${idx}] debe ser <= categorySales`)
            .to.be.lte(item.categorySales);
        });
      });

      cy.fixture("competitive-cards.json").then((data: any) => {
        if (data.topSharePercentage !== null) {
          expect(data.topSharePercentage)
            .to.be.a("number")
            .and.within(0, 100);
        }
      });
    });
  });
});