/// <reference types="cypress" />

/**
 * Simula una sesión autenticada interceptando las llamadas de contexto y API.
 */


declare global {
  namespace Cypress {
    interface Chainable {
      mockAuthenticatedSession(role?: "retailer_admin" | "brand"): void;
      mockSalesData(overrides?: {
        kpis?: object | null;
        categories?: object | null;
        performance?: object | null;
        topProducts?: object | null;
        statusCode?: number;
      }): void;
      mockAudiencesData(overrides?: {
        kpis?: object | null;
        gender?: object | null;
        age?: object | null;
        rfm?: object | null;
        funnel?: object | null;
        insights?: object | null;
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
      mockAuth0User(overrides?: { 
        name?: string; email?: 
        string; picture?: string 
      }): void;
    }

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
    topProducts?: object | null;
    statusCode?: number;
  }) => {
    const statusCode = overrides?.statusCode ?? 200;

    if (statusCode !== 200) {
      cy.intercept("GET", "/api/proxy/sales/kpis*", { statusCode, body: { error: "Server error" } }).as("salesKpis");
      cy.intercept("GET", "/api/proxy/sales/category-sales*", { statusCode, body: { error: "Server error" } }).as("salesCategories");
      cy.intercept("GET", "/api/proxy/sales/performance*", { statusCode, body: { error: "Server error" } }).as("salesPerformance");
      cy.intercept("GET", "/api/proxy/sales/top-products*", { statusCode, body: { error: "Server error" } }).as("salesTopProducts");
      return;
    }

    if (overrides && "kpis" in overrides) {
      const body = Array.isArray(overrides.kpis) ? { current: overrides.kpis, prior: [] } : overrides.kpis;
      cy.intercept("GET", "/api/proxy/sales/kpis*", { statusCode: 200, body }).as("salesKpis");
    } else {
      cy.intercept("GET", "/api/proxy/sales/kpis*", { fixture: "sales-kpis.json" }).as("salesKpis");
    }

    if (overrides && "categories" in overrides) {
      cy.intercept("GET", "/api/proxy/sales/category-sales*", { statusCode: 200, body: overrides.categories }).as("salesCategories");
    } else {
      cy.intercept("GET", "/api/proxy/sales/category-sales*", { fixture: "sales-categories.json" }).as("salesCategories");
    }

    if (overrides && "performance" in overrides) {
      cy.intercept("GET", "/api/proxy/sales/performance*", { statusCode: 200, body: overrides.performance }).as("salesPerformance");
    } else {
      cy.intercept("GET", "/api/proxy/sales/performance*", { fixture: "sales-performance.json" }).as("salesPerformance");
    }

    if (overrides && "topProducts" in overrides) {
      cy.intercept("GET", "/api/proxy/sales/top-products*", { statusCode: 200, body: overrides.topProducts }).as("salesTopProducts");
    } else {
      cy.intercept("GET", "/api/proxy/sales/top-products*", { fixture: "sales-top-products.json" }).as("salesTopProducts");
    }
  }
);

Cypress.Commands.add(
  "mockAudiencesData",
  (overrides?: {
    kpis?: object | null;
    gender?: object | null;
    age?: object | null;
    rfm?: object | null;
    funnel?: object | null;
    insights?: object | null;
    statusCode?: number;
  }) => {
    const statusCode = overrides?.statusCode ?? 200;

    if (statusCode !== 200) {
      cy.intercept("GET", "/api/proxy/audiences/kpis*", { statusCode, body: { error: "Server error" } }).as("audiencesKpis");
      cy.intercept("GET", "/api/proxy/audiences/gender-breakdown*", { statusCode, body: { error: "Server error" } }).as("audiencesGender");
      cy.intercept("GET", "/api/proxy/audiences/age-breakdown*", { statusCode, body: { error: "Server error" } }).as("audiencesAge");
      cy.intercept("GET", "/api/proxy/audiences/rfm-cohorts*", { statusCode, body: { error: "Server error" } }).as("audiencesRfm");
      cy.intercept("GET", "/api/proxy/audiences/funnel*", { statusCode, body: { error: "Server error" } }).as("audiencesFunnel");
      cy.intercept("GET", "/api/proxy/audiences/insights*", { statusCode, body: { error: "Server error" } }).as("audiencesInsights");
      return;
    }

    if (overrides && "kpis" in overrides) {
      cy.intercept("GET", "/api/proxy/audiences/kpis*", { statusCode: 200, body: overrides.kpis }).as("audiencesKpis");
    } else {
      cy.intercept("GET", "/api/proxy/audiences/kpis*", {
        statusCode: 200,
        body: { uniqueCustomers: 12480, ordersPerCustomer: 1.8, avgRecencyDays: 42, avgTicketPerCustomer: 128.5 },
      }).as("audiencesKpis");
    }

    if (overrides && "gender" in overrides) {
      cy.intercept("GET", "/api/proxy/audiences/gender-breakdown*", { statusCode: 200, body: overrides.gender }).as("audiencesGender");
    } else {
      cy.intercept("GET", "/api/proxy/audiences/gender-breakdown*", {
        statusCode: 200,
        body: [
          { gender: "F", customerCount: 7120, percentage: 57.1 },
          { gender: "M", customerCount: 5360, percentage: 42.9 },
        ],
      }).as("audiencesGender");
    }

    if (overrides && "age" in overrides) {
      cy.intercept("GET", "/api/proxy/audiences/age-breakdown*", { statusCode: 200, body: overrides.age }).as("audiencesAge");
    } else {
      cy.intercept("GET", "/api/proxy/audiences/age-breakdown*", {
        statusCode: 200,
        body: [
          { ageRange: "18-24", customerCount: 2100 },
          { ageRange: "25-34", customerCount: 4300 },
          { ageRange: "35-44", customerCount: 3200 },
          { ageRange: "45+", customerCount: 2880 },
        ],
      }).as("audiencesAge");
    }

    if (overrides && "rfm" in overrides) {
      cy.intercept("GET", "/api/proxy/audiences/rfm-cohorts*", { statusCode: 200, body: overrides.rfm }).as("audiencesRfm");
    } else {
      cy.intercept("GET", "/api/proxy/audiences/rfm-cohorts*", {
        statusCode: 200,
        body: [
          { recencyDays: 15, avgFrequency: 3.2, avgTicket: 145.0, customerCount: 980 },
          { recencyDays: 60, avgFrequency: 1.8, avgTicket: 112.0, customerCount: 2340 },
        ],
      }).as("audiencesRfm");
    }

    if (overrides && "funnel" in overrides) {
      cy.intercept("GET", "/api/proxy/audiences/funnel*", { statusCode: 200, body: overrides.funnel }).as("audiencesFunnel");
    } else {
      cy.intercept("GET", "/api/proxy/audiences/funnel*", { fixture: "audiences-funnel.json" }).as("audiencesFunnel");
    }

    if (overrides && "insights" in overrides) {
      cy.intercept("GET", "/api/proxy/audiences/insights*", { statusCode: 200, body: overrides.insights }).as("audiencesInsights");
    } else {
      cy.intercept("GET", "/api/proxy/audiences/insights*", { statusCode: 200, body: [] }).as("audiencesInsights");
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
        body: { error: "Internal Server Error" },
      }).as("compAll");
      cy.intercept("GET", "/api/proxy/competitive/insights*", {
        statusCode,
        body: { error: "Internal Server Error" },
      }).as("compInsights");
      return;
    }

    if (overrides && "all" in overrides) {
      const body = Array.isArray(overrides.all) ? { current: overrides.all, prior: [] } : overrides.all;
      cy.intercept("GET", "/api/proxy/competitive/all*", {
        statusCode: 200,
        body,
      }).as("compAll");
    } else {
      cy.intercept("GET", "/api/proxy/competitive/all*", {
        fixture: "competitive/competitive-all.json",
      }).as("compAll");
    }
    cy.intercept("GET", "/api/proxy/competitive/insights*", {
      body: [],
    }).as("compInsights");
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
      cy.intercept("GET", "/api/proxy/competitive/performance-cards*", { statusCode, body: errorBody }).as("execCompetitiveCards");
      return;
    }
 
    if (overrides && "kpis" in overrides) {
      const body = Array.isArray(overrides.kpis) ? { current: overrides.kpis, prior: [] } : overrides.kpis;
      cy.intercept("GET", "/api/proxy/executive/kpis*", { statusCode: 200, body }).as("execKpis");
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
      cy.intercept("GET", "/api/proxy/competitive/performance-cards*", { statusCode: 200, body: overrides.competitiveCards }).as("execCompetitiveCards");
    } else {
      cy.intercept("GET", "/api/proxy/competitive/performance-cards*", { fixture: "executive/executive-competitive-cards.json" }).as("execCompetitiveCards");
    }
  }
);

//TODO: profile (perfil)
Cypress.Commands.add("mockAuth0User", (overrides?: { name?: string; email?: string; picture?: string }) => {
  const user = {
    name: overrides?.name ?? "Test Admin",
    email: overrides?.email ?? "test-admin@thelook.com",
    picture: overrides?.picture ?? "https://example.com/avatar.png",
    sub: "auth0|test123",
  };
  cy.intercept("GET", "/api/auth/me", { statusCode: 200, body: user }).as("auth0Me");
});

export {};
