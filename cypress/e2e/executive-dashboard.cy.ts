/*
 * E2E Tests: Executive Dashboard (/dashboard)
 */
describe("Executive Dashboard (/dashboard)", () => {
  context("Role: Brand User", () => {
    beforeEach(() => {
      cy.mockAuthenticatedSession("brand");
      cy.mockExecutiveData();
    });
 
    context("Initial page load", () => {
      beforeEach(() => {
        cy.visit("/dashboard");
        cy.wait([
          "@execKpis",
          "@execCategorySales",
          "@execAudiences",
          "@execRetention",
          "@execCompetitiveCards",
        ]);
      });
 
      it("renders title, subtitle and basic layout structures", () => {
        cy.contains("h1", "Dashboard").should("be.visible");
        cy.contains("Visión ejecutiva del desempeño de tu marca").should("be.visible");
      });
 
      it("shows loading skeletons while data is being fetched", () => {
        cy.intercept("GET", "/api/proxy/executive/kpis*", {
          delay: 400,
          fixture: "executive/executive-kpis.json",
        }).as("execKpisDelayed");
 
        cy.visit("/dashboard");
        cy.get(".animate-pulse").should("exist");
        cy.wait("@execKpisDelayed");
      });
 
      it("calculates and displays aggregated KPI cards accurately from grid data", () => {
        const customKpis = [
          { revenue: 10000, totalOrders: 50, unitsSold: 100, uniqueCustomers: 40 },
          { revenue: 5000, totalOrders: 25, unitsSold: 50, uniqueCustomers: 20 },
        ];
        cy.mockExecutiveData({ kpis: customKpis });
        cy.visit("/dashboard");
        cy.wait("@execKpis");
 
        cy.contains("Ventas totales").should("be.visible");
        cy.get("body").contains("15").should("be.visible");
        cy.contains("Órdenes").should("be.visible");
        cy.contains("75").should("be.visible");
        cy.contains("Ticket promedio").should("be.visible");
        cy.get("body").contains("200").should("be.visible");
      });
 
      it("renders sales trend and top categories charts safely within containers", () => {
        cy.contains("Tendencia de ventas", { timeout: 10000 }).should("be.visible");
        cy.contains("Ingresos por categoría", { timeout: 10000 }).should("be.visible");
        cy.get(".recharts-wrapper", { timeout: 10000 }).should("have.length.at.least", 2);
      });
 
      it("displays descriptive sub-metrics inside audiences and customer retention panels", () => {
        const customAudiences = {
          mainChannel: "Online",
          mainCity: "Santiago",
          mainAgeRange: "25-34",
          ageRangePercentage: 42.5,
        };
        const customRetention = {
          recurringBuyers: 1250,
          avgProductsPerClient: 2.34,
          topRetentionChannel: "Retail",
        };
 
        cy.mockExecutiveData({ audiences: customAudiences, retention: customRetention });
        cy.visit("/dashboard");
        cy.wait(["@execAudiences", "@execRetention"]);
 
        cy.contains("Audiencias").should("be.visible");
        cy.contains("Online").should("be.visible");
        cy.contains("Santiago").should("be.visible");
        cy.contains("25-34").should("be.visible");
        cy.contains("Retención de clientes").should("be.visible");
        cy.get("body").contains("250").should("be.visible");
      });

      it("displays competitive positioning panel since brand context is active", () => {
        const customCompetitive = {
          topShareCategory: "Shoes",
          topSharePercentage: 15.4,
          bestGrowthCategory: "Shirts",
          bestGrowthPercentage: 8.2,
          worstGrowthCategory: "Caps",
          worstGrowthPercentage: -2.1,
        };
        cy.mockExecutiveData({ competitiveCards: customCompetitive });
        cy.visit("/dashboard");
        cy.wait(["@execKpis", "@execCategorySales", "@execAudiences", "@execRetention"]);
 
        cy.contains("Posicionamiento competitivo", { timeout: 10000 }).should("be.visible");
        cy.contains("Shoes", { timeout: 10000 }).should("be.visible");
        cy.contains("Shirts", { timeout: 10000 }).should("be.visible");
      });
 
      it("displays dashes fallback safely across components when data contains null properties", () => {
        cy.mockExecutiveData({
          kpis: [],
          audiences: {
            mainChannel: null,
            mainCity: undefined,
            mainAgeRange: null,
            ageRangePercentage: null,
          },
          retention: {
            recurringBuyers: null,
            avgProductsPerClient: null,
            topRetentionChannel: null,
          },
        });
        cy.visit("/dashboard");
        cy.wait(["@execKpis", "@execAudiences", "@execRetention"]);
 
        cy.contains("Ticket promedio").should("be.visible");
        cy.get("body").contains("—").should("exist");
      });
    });
 
    context("Data filters", () => {
      beforeEach(() => {
        cy.visit("/dashboard");
        cy.wait([
          "@execKpis",
          "@execCategorySales",
          "@execAudiences",
          "@execRetention",
          "@execCompetitiveCards",
        ]);
      });

      it("applying a Time Range filter from Topbar re-fetches data with correct days query param", () => {
        cy.intercept("GET", "/api/proxy/executive/kpis*", (req) => {
          const url = new URL(req.url);
          if (url.searchParams.get("days") === "30") {
            req.alias = "timeFilterUpdate";
          }
          req.reply({ fixture: "executive/executive-kpis.json" });
        });
 
        cy.contains("button", "Últimos 90 días").should("be.visible").click();
        cy.get("[role='menuitem']").contains("Últimos 30 días").should("be.visible").click();
 
        cy.wait("@timeFilterUpdate").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("days")).to.eq("30");
        });
      });
 
      it("applying Country, Department and Category filters updates network query parameters", () => {
        cy.intercept("GET", "/api/proxy/executive/kpis*", (req) => {
          const url = new URL(req.url);
          if (url.searchParams.get("category") === "Jeans") {
            req.alias = "cascadeFilterUpdate";
          }
          req.reply({ fixture: "executive/executive-kpis.json" });
        });
 
        cy.get("[data-slot='select-trigger']").first().click();
        cy.get("[data-slot='select-item']")
          .contains("Jeans")
          .should("be.visible")
          .scrollIntoView()
          .realClick();
 
        cy.wait("@cascadeFilterUpdate").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("category")).to.eq("Jeans");
        });
      });
    });
 
    context("Backend error (500)", () => {
      it("does not crash the interface when endpoints return server error", () => {
        cy.mockExecutiveData({ statusCode: 500 });
        cy.visit("/dashboard", { failOnStatusCode: false });
 
        cy.contains("h1", "Dashboard").should("be.visible");
        cy.get("body").should("not.contain", "Unhandled");
      });
    });
  });
 
  context("Role: Retailer Admin", () => {
    beforeEach(() => {
      cy.mockAuthenticatedSession("retailer_admin");
      cy.mockExecutiveData();
    });
 
    it("shows generic prompt message (empty state) by default inside panels", () => {
      cy.visit("/dashboard");
      cy.contains(
        "Selecciona una marca específica para ver su posicionamiento competitivo."
      ).should("be.visible");
    });
 
    it("fetches dataset with brand query param upon selecting a brand from global top menu", () => {
      cy.visit("/dashboard");
      cy.wait("@execKpis");
 
      // FIX: mismo patrón de request handler — el menú puede disparar re-fetches
      // intermedios; solo aliasamos la request que tiene brand=Calvin+Klein.
      cy.intercept("GET", "/api/proxy/executive/kpis*", (req) => {
        const url = new URL(req.url);
        if (url.searchParams.get("brand") === "Calvin Klein") {
          req.alias = "adminBrandSelection";
        }
        req.reply({ fixture: "executive/executive-kpis.json" });
      });
 
      cy.get("header").contains("button", "Todas las marcas").click();
      cy.get("[role='menuitem']").contains("Calvin Klein").click();
 
      cy.wait("@adminBrandSelection").then((interception) => {
        const url = new URL(interception.request.url);
        expect(url.searchParams.get("brand")).to.eq("Calvin Klein");
      });
    });
  });
});