/// <reference types="cypress" />

/**
 * Simula una sesión autenticada interceptando las llamadas de contexto y API.
 *
 * El middleware de Next.js (proxy.ts) corre en el edge y no es interceptable por
 * Cypress. Para esquivarlo, el servidor debe arrancarse con CYPRESS_TESTING=true
 * (ver scripts del package.json). Una vez pasada esa barrera, todas las llamadas
 * de datos del cliente sí son interceptables aquí.
 */

// ─── Declaraciones de tipos para los comandos personalizados ─────────────────

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mockAuthenticatedSession(role?: "retailer_admin" | "brand"): void;
      mockSalesData(overrides?: {
        kpis?: object | null;
        categories?: object | null;
        performance?: object | null;
        statusCode?: number;
      }): void;
      mockCompetitiveData(overrides?: {
        all?: object | null;
        statusCode?: number;
      }): void;
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

// ─── Implementación ──────────────────────────────────────────────────────────

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

    if (statusCode !== 200) {
      cy.intercept("GET", "/api/proxy/competitive/all*", { 
        statusCode, 
        body: { error: "Internal Server Error" } 
      }).as("compAll");
      return;
    }

    if (overrides && "all" in overrides) {
      cy.intercept("GET", "/api/proxy/competitive/all*", { 
        statusCode: 200, 
        body: overrides.all 
      }).as("compAll");
    } else {
      cy.intercept("GET", "/api/proxy/competitive/all*", { 
        fixture: "competitive/competitive-all.json" 
      }).as("compAll");
    }
  }
);

// executive-dashboard
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
      const errorBody = { error: "Internal Server Error" };
      cy.intercept("GET", "/api/proxy/executive/kpis*", { statusCode, body: errorBody }).as("execKpis");
      cy.intercept("GET", "/api/proxy/executive/category-sales*", { statusCode, body: errorBody }).as("execCategorySales");
      cy.intercept("GET", "/api/proxy/executive/audiences*", { statusCode, body: errorBody }).as("execAudiences");
      cy.intercept("GET", "/api/proxy/executive/retention*", { statusCode, body: errorBody }).as("execRetention");
      cy.intercept("GET", "**/api/proxy/competitive/all*", { statusCode, body: errorBody }).as("execCompetitiveCards");
      return;
    }

    if (overrides && "kpis" in overrides) {
      cy.intercept("GET", "/api/proxy/executive/kpis*", { statusCode: 200, body: overrides.kpis }).as("execKpis");
    } else {
      cy.intercept("GET", "/api/proxy/executive/kpis*", { fixture: "executive/executive-kpis.json" }).as("execKpis");
    }

    if (overrides && "categorySales" in overrides) {
      cy.intercept("GET", "/api/proxy/executive/category-sales*", { statusCode: 200, body: overrides.categorySales }).as("execCategorySales");
    } else {
      cy.intercept("GET", "/api/proxy/executive/category-sales*", { fixture: "executive/executive-category-sales.json" }).as("execCategorySales");
    }

    if (overrides && "audiences" in overrides) {
      cy.intercept("GET", "/api/proxy/executive/audiences*", { statusCode: 200, body: overrides.audiences }).as("execAudiences");
    } else {
      cy.intercept("GET", "/api/proxy/executive/audiences*", { fixture: "executive/executive-audiences.json" }).as("execAudiences");
    }

    if (overrides && "retention" in overrides) {
      cy.intercept("GET", "/api/proxy/executive/retention*", { statusCode: 200, body: overrides.retention }).as("execRetention");
    } else {
      cy.intercept("GET", "/api/proxy/executive/retention*", { fixture: "executive/executive-retention.json" }).as("execRetention");
    }

    if (overrides && "competitiveCards" in overrides) {
      cy.intercept("GET", "**/api/proxy/competitive/all*", { statusCode: 200, body: overrides.competitiveCards }).as("execCompetitiveCards");
    } else {
      cy.intercept("GET", "**/api/proxy/competitive/all*", { fixture: "executive/executive-competitive-cards.json" }).as("execCompetitiveCards");
    }
  }
);

export {};