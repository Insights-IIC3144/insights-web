declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      // cmds de sales-dashboard
      mockAuthenticatedSession(role?: "retailer_admin" | "brand"): void;
      mockSalesData(overrides?: {
        kpis?: object | null;
        categories?: object | null;
        performance?: object | null;
        statusCode?: number;
      }): void;

      // cmds de competitive-positioning
      mockCompetitiveData(overrides?: {
        all?: object | null;
        statusCode?: number;
      }): void;
    }

    // Typed env variables — enables the non-deprecated Cypress.env('KEY') overload
    interface DefineCustomEnvVariables {
      CYPRESS_TESTING: boolean;
    }
  }
}

// sales-dashboard
Cypress.Commands.add("mockAuthenticatedSession", (role: "retailer_admin" | "brand" = "retailer_admin") => {
  const profile =
    role === "brand"
      ? {
          email: "brand@thelook.com",
          name: "Brand User",
          role: "brand",
          brand: "Calvin Klein",
          isActive: true,
          retailerName: "TheLook",
        }
      : {
          email: "test-admin@thelook.com",
          name: "Test Admin",
          role: "retailer_admin",
          brand: null,
          isActive: true,
          retailerName: "TheLook",
        };

  cy.intercept("GET", "/api/users/me", { statusCode: 200, body: profile }).as("userProfile");
  cy.intercept("GET", "/api/proxy/filters", { fixture: "filters.json" }).as("filters");
});

Cypress.Commands.add(
  "mockSalesData",
  (overrides?: {
    kpis?: object | null;
    categories?: object | null;
    performance?: object | null;
    statusCode?: number;
  }) => {
    const statusCode = overrides?.statusCode ?? 200;

    if (statusCode !== 200) {
      cy.intercept("GET", "/api/proxy/sales/kpis*", { statusCode, body: { error: "Server error" } }).as("salesKpis");
      cy.intercept("GET", "/api/proxy/sales/category-sales*", {
        statusCode,
        body: { error: "Server error" },
      }).as("salesCategories");
      cy.intercept("GET", "/api/proxy/sales/performance*", {
        statusCode,
        body: { error: "Server error" },
      }).as("salesPerformance");
      return;
    }

    if (overrides && "kpis" in overrides) {
      cy.intercept("GET", "/api/proxy/sales/kpis*", { statusCode: 200, body: overrides.kpis }).as("salesKpis");
    } else {
      cy.intercept("GET", "/api/proxy/sales/kpis*", { fixture: "sales-kpis.json" }).as("salesKpis");
    }

    if (overrides && "categories" in overrides) {
      cy.intercept("GET", "/api/proxy/sales/category-sales*", {
        statusCode: 200,
        body: overrides.categories,
      }).as("salesCategories");
    } else {
      cy.intercept("GET", "/api/proxy/sales/category-sales*", { fixture: "sales-categories.json" }).as(
        "salesCategories"
      );
    }

    if (overrides && "performance" in overrides) {
      cy.intercept("GET", "/api/proxy/sales/performance*", {
        statusCode: 200,
        body: overrides.performance,
      }).as("salesPerformance");
    } else {
      cy.intercept("GET", "/api/proxy/sales/performance*", { fixture: "sales-performance.json" }).as("salesPerformance");
    }
  }
);

// competitive-positioning
Cypress.Commands.add(
  "mockCompetitiveData",
  (overrides?: {
    all?: object | null;
    statusCode?: number;
  }) => {
    const statusCode = overrides?.statusCode ?? 200;

    // competitive/all
    if (statusCode !== 200) {
      cy.intercept("GET", "**/competitive/all*", {
        statusCode,
        body: { error: "Server error" }
      }).as("compAll");
      return;
    }

    if (overrides && "all" in overrides) {
      cy.intercept("GET", "**/competitive/all*", {
        statusCode: 200,
        body: overrides.all
      }).as("compAll");
    } else {
      cy.intercept("GET", "**/competitive/all*", {
        fixture: "competitive-all.json"
      }).as("compAll");
    }
  }
);

export {};
