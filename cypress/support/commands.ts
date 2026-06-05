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

      // cmds de executive-dashboard
      mockExecutiveData(overrides?: {
        kpis?: object | null;
        categorySales?: object | null;
        audiences?: object | null;
        retention?: object | null;
        competitiveCards?: object | null;
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
      cy.intercept("GET", "/api/proxy/sales/kpis*", { fixture: "sales/sales-kpis.json" }).as("salesKpis");
    }

    if (overrides && "categories" in overrides) {
      cy.intercept("GET", "/api/proxy/sales/category-sales*", {
        statusCode: 200,
        body: overrides.categories,
      }).as("salesCategories");
    } else {
      cy.intercept("GET", "/api/proxy/sales/category-sales*", { fixture: "sales/sales-categories.json" }).as(
        "salesCategories"
      );
    }

    if (overrides && "performance" in overrides) {
      cy.intercept("GET", "/api/proxy/sales/performance*", {
        statusCode: 200,
        body: overrides.performance,
      }).as("salesPerformance");
    } else {
      cy.intercept("GET", "/api/proxy/sales/performance*", { fixture: "sales/sales-performance.json" }).as("salesPerformance");
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
        fixture: "competitive/competitive-all.json"
      }).as("compAll");
    }
  }
);

// executive
Cypress.Commands.add(
  "mockExecutiveData",
  (overrides?: {
    kpis?: object | null;
    categorySales?: object | null;
    audiences?: object | null;
    retention?: object | null;
    competitiveCards?: object | null;
    statusCode?: number;
  }) => {
    const statusCode = overrides?.statusCode ?? 200;

    if (statusCode !== 200) {
      const errorResponse = { statusCode, body: { error: "Server error" } };
      cy.intercept("GET", "/api/proxy/executive/kpis*", errorResponse).as("execKpis");
      cy.intercept("GET", "/api/proxy/executive/category-sales*", errorResponse).as("execCategorySales");
      cy.intercept("GET", "/api/proxy/executive/audiences*", errorResponse).as("execAudiences");
      cy.intercept("GET", "/api/proxy/executive/retention*", errorResponse).as("execRetention");
      return;
    }

    // KPIs
    if (overrides && "kpis" in overrides) {
      cy.intercept("GET", "/api/proxy/executive/kpis*", { statusCode: 200, body: overrides.kpis }).as("execKpis");
    } else {
      cy.intercept("GET", "/api/proxy/executive/kpis*", { fixture: "executive/executive-kpis.json" }).as("execKpis");
    }

    // Category Sales
    if (overrides && "categorySales" in overrides) {
      cy.intercept("GET", "/api/proxy/executive/category-sales*", { statusCode: 200, body: overrides.categorySales }).as("execCategorySales");
    } else {
      cy.intercept("GET", "/api/proxy/executive/category-sales*", { fixture: "executive/executive-sales-categories.json" }).as("execCategorySales");
    }

    // Audiences
    if (overrides && "audiences" in overrides) {
      cy.intercept("GET", "/api/proxy/executive/audiences*", { statusCode: 200, body: overrides.audiences }).as("execAudiences");
    } else {
      cy.intercept("GET", "/api/proxy/executive/audiences*", { fixture: "executive/executive-audiences.json" }).as("execAudiences");
    }

    // Retention
    if (overrides && "retention" in overrides) {
      cy.intercept("GET", "/api/proxy/executive/retention*", { statusCode: 200, body: overrides.retention }).as("execRetention");
    } else {
      cy.intercept("GET", "/api/proxy/executive/retention*", { fixture: "executive/executive-retention.json" }).as("execRetention");
    }

    // Competitive Cards
    if (overrides && "competitiveCards" in overrides) {
      cy.intercept("GET", "/api/proxy/competitive/performance-cards*", { statusCode: 200, body: overrides.competitiveCards }).as("execCompetitiveCards");
    } else {
      cy.intercept("GET", "/api/proxy/competitive/performance-cards*", { fixture: "competitive/competitive-cards.json" }).as("execCompetitiveCards");
    }
  }
);

export {};