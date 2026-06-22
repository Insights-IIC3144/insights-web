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

      it("renders title, subtitle, charts, and KPI aggregation", () => {
        cy.contains("h1", "Dashboard").should("be.visible");
        cy.contains("Visión ejecutiva del desempeño de tu marca").should("be.visible");
        cy.contains("Tendencia de ventas", { timeout: 10000 }).should("be.visible");
        cy.contains("Ingresos por categoría", { timeout: 10000 }).should("be.visible");
        cy.get(".recharts-wrapper", { timeout: 10000 }).should("have.length.at.least", 2);
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

      it("displays audiences, retention, and competitive positioning panels", () => {
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
        const customCompetitive = {
          topShareCategory: "Shoes",
          topSharePercentage: 15.4,
          bestGrowthCategory: "Shirts",
          bestGrowthPercentage: 8.2,
          worstGrowthCategory: "Caps",
          worstGrowthPercentage: -2.1,
        };
        cy.mockExecutiveData({ audiences: customAudiences, retention: customRetention, competitiveCards: customCompetitive });
        cy.visit("/dashboard");
        cy.wait(["@execAudiences", "@execRetention"]);
        cy.contains("Audiencias").should("be.visible");
        cy.contains("Online").should("be.visible");
        cy.contains("Santiago").should("be.visible");
        cy.contains("25-34").should("be.visible");
        cy.contains("Retención de clientes").should("be.visible");
        cy.get("body").contains("250").should("be.visible");
        cy.contains("Posicionamiento competitivo", { timeout: 10000 }).should("be.visible");
        cy.contains("Shoes", { timeout: 10000 }).should("be.visible");
        cy.contains("Shirts", { timeout: 10000 }).should("be.visible");
      });

      it("displays dashes fallback when data contains null properties", () => {
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

      // competitive panel con valores null cubre líneas 82-98 de ExecutivePerformanceCards
      it("shows dashes in competitive panel when card values are null", () => {
        cy.mockExecutiveData({
          competitiveCards: {
            topShareCategory: null,
            topSharePercentage: null,
            bestGrowthCategory: null,
            bestGrowthPercentage: null,
            worstGrowthCategory: null,
            worstGrowthPercentage: null,
          },
        });
        cy.visit("/dashboard");
        cy.wait([
          "@execKpis",
          "@execCategorySales",
          "@execAudiences",
          "@execRetention",
          "@execCompetitiveCards",
        ]);
        cy.contains("Posicionamiento competitivo", { timeout: 10000 }).should("be.visible");
        cy.contains("Mayor share").should("be.visible");
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

      it("applying a Time Range filter re-fetches data with correct days param", () => {
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

      it("applying Category filter updates network query parameters", () => {
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

      it("clicking a category bar in the chart applies a category filter to all endpoints", () => {
        cy.intercept("GET", "/api/proxy/executive/kpis*", (req) => {
          const url = new URL(req.url);
          if (url.searchParams.get("category")) {
            req.alias = "categoryClickFilter";
          }
          req.reply({ fixture: "executive/executive-kpis.json" });
        });
        cy.get(".recharts-bar-rectangle", { timeout: 10000 })
          .first()
          .click({ force: true });
        cy.wait("@categoryClickFilter").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("category")).to.not.be.null;
        });
      });

      // Ejecuta el filter callback de activeFilters en useExecutiveData (línea 28)
      it("filters out empty string values from activeFilters before sending params", () => {
        cy.intercept("GET", "/api/proxy/executive/kpis*", (req) => {
          const url = new URL(req.url);
          if (url.searchParams.get("days") === "30") {
            req.alias = "filteredParams";
          }
          req.reply({ fixture: "executive/executive-kpis.json" });
        });
        cy.contains("button", "Últimos 90 días").click();
        cy.get("[role='menuitem']").contains("Últimos 30 días").click();
        cy.wait("@filteredParams").then((interception) => {
          const url = new URL(interception.request.url);
          url.searchParams.forEach((value) => {
            expect(value).to.not.eq("");
          });
        });
      });
    });

    context("Backend error (500)", () => {
      it("does not crash when endpoints return server error", () => {
        cy.mockExecutiveData({ statusCode: 500 });
        cy.visit("/dashboard", { failOnStatusCode: false });
        cy.contains("h1", "Dashboard").should("be.visible");
        cy.get("body").should("not.contain", "Unhandled");
      });

      it("renders the page without crashing when category-sales endpoint fails independently", () => {
        cy.intercept("GET", "/api/proxy/executive/category-sales*", {
          statusCode: 500,
          body: { error: "Server error" },
        }).as("catSalesFail");
        cy.visit("/dashboard", { failOnStatusCode: false });
        cy.wait("@execKpis");
        cy.contains("h1", "Dashboard").should("be.visible");
        cy.get("body").should("not.contain", "Unhandled");
      });
    });

    context("KPI grid zero-value states", () => {
      it("shows $0 ticket promedio when the period has no orders", () => {
        cy.mockExecutiveData({
          kpis: [{ revenue: 0, totalOrders: 0, unitsSold: 0, uniqueCustomers: 0, date: "2024-01-01" }],
        });
        cy.visit("/dashboard");
        cy.wait("@execKpis");
        cy.contains("Ticket promedio").should("be.visible");
        cy.contains("$0").should("be.visible");
      });
    });

    context("Query parameter behavior", () => {
      it("includes days=90 query param on the initial load with the default time range", () => {
        cy.intercept("GET", "/api/proxy/executive/kpis*", (req) => {
          req.alias = "kpisInitialLoad";
          req.reply({ fixture: "executive/executive-kpis.json" });
        });
        cy.visit("/dashboard");
        cy.wait("@kpisInitialLoad").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("days")).to.eq("90");
        });
      });
    });

    context("Charts and KPI grid rendering with real data", () => {
      it("renders both charts with populated fixture data and no loading state", () => {
        cy.mockExecutiveData();
        cy.visit("/dashboard");
        cy.wait([
          "@execKpis",
          "@execCategorySales",
          "@execAudiences",
          "@execRetention",
          "@execCompetitiveCards",
        ]);
        cy.get(".recharts-wrapper", { timeout: 15000 }).should("have.length.at.least", 2);
        cy.get(".recharts-area", { timeout: 10000 }).should("exist");
        cy.get(".recharts-bar", { timeout: 10000 }).should("exist");
      });

      it("renders KPI grid with prior period data showing delta indicators", () => {
        const kpisWithPrior = {
          current: [
            { revenue: 10000, totalOrders: 50, unitsSold: 100, uniqueCustomers: 40, date: "2024-01-01" },
          ],
          prior: [
            { revenue: 8000, totalOrders: 40, unitsSold: 80, uniqueCustomers: 30, date: "2023-12-01" },
          ],
        };
        cy.mockExecutiveData({ kpis: kpisWithPrior });
        cy.visit("/dashboard");
        cy.wait("@execKpis");
        cy.contains("Ventas totales").should("be.visible");
        cy.contains("Órdenes").should("be.visible");
        cy.contains("Unidades vendidas").should("be.visible");
        cy.contains("Clientes únicos").should("be.visible");
        cy.contains("Ticket promedio").should("be.visible");
      });

      it("renders KPI grid without prior period data showing no delta indicators", () => {
        const kpisNoPrior = {
          current: [
            { revenue: 10000, totalOrders: 50, unitsSold: 100, uniqueCustomers: 40, date: "2024-01-01" },
          ],
          prior: [],
        };
        cy.mockExecutiveData({ kpis: kpisNoPrior });
        cy.visit("/dashboard");
        cy.wait("@execKpis");
        cy.contains("Ventas totales").should("be.visible");
        cy.contains("Ticket promedio").should("be.visible");
      });

      it("renders trend chart with empty kpis array producing no data points", () => {
        cy.mockExecutiveData({
          kpis: { current: [], prior: [] },
          categorySales: [],
        });
        cy.visit("/dashboard");
        cy.wait(["@execKpis", "@execCategorySales"]);
        cy.contains("Tendencia de ventas").should("be.visible");
        cy.contains("Ingresos por categoría").should("be.visible");
        cy.get(".recharts-wrapper", { timeout: 10000 }).should("have.length.at.least", 2);
      });
    });

    context("Chart formatters and interactive callbacks", () => {
      beforeEach(() => {
        cy.mockExecutiveData({
          kpis: {
            current: [
              { revenue: 50000, totalOrders: 250, unitsSold: 500, uniqueCustomers: 200, date: "2024-01-01" },
              { revenue: 30000, totalOrders: 150, unitsSold: 300, uniqueCustomers: 120, date: "2024-01-02" },
            ],
            prior: [
              { revenue: 40000, totalOrders: 200, unitsSold: 400, uniqueCustomers: 160, date: "2023-12-01" },
            ],
          },
          categorySales: [
            { category: "Shoes", revenue: 25000 },
            { category: "Shirts", revenue: 18000 },
            { category: "Jeans", revenue: 12000 },
          ],
        });
        cy.visit("/dashboard");
        cy.wait([
          "@execKpis",
          "@execCategorySales",
          "@execAudiences",
          "@execRetention",
          "@execCompetitiveCards",
        ]);
        cy.get(".recharts-wrapper", { timeout: 15000 }).should("have.length.at.least", 2);
      });

      // Ejecuta tickFormatter del YAxis (fmtMoney compact) al renderizar los ticks
      it("renders Y-axis ticks with compact money format in trend chart", () => {
        cy.get(".recharts-yAxis .recharts-cartesian-axis-tick-value", { timeout: 10000 })
          .should("exist")
          .first()
          .invoke("text")
          .should("match", /\$[\d,.]+[KMB]?/);
      });

      // Ejecuta tickFormatter del XAxis del BarChart al renderizar
      it("renders X-axis ticks with compact money format in category chart", () => {
        cy.get(".recharts-xAxis .recharts-cartesian-axis-tick-value", { timeout: 10000 })
          .should("exist");
      });

      // Ejecuta formatter del Tooltip al hacer hover sobre el AreaChart
      it("shows formatted money tooltip when hovering over trend chart", () => {
        cy.get(".recharts-area-area", { timeout: 10000 }).should("exist");
        cy.get(".recharts-wrapper").first().trigger("mousemove", { clientX: 400, clientY: 150 });
      });

      // Ejecuta formatter del Tooltip del BarChart al hacer hover
      it("shows formatted money tooltip when hovering over category bar chart", () => {
        cy.get(".recharts-bar-rectangle", { timeout: 10000 }).should("exist");
        cy.get(".recharts-wrapper").last().trigger("mousemove", { clientX: 200, clientY: 100 });
      });
    });

    it("renders KPI grid without prior data — prior falls back to current period values", () => {
      cy.mockExecutiveData({
        kpis: { current: [
          { revenue: 10000, totalOrders: 50, unitsSold: 100, uniqueCustomers: 40, date: "2024-01-01" },
        ], prior: [] },
      });
      cy.visit("/dashboard");
      cy.wait("@execKpis");
      cy.contains("Ventas totales").should("be.visible");
      cy.contains("Ticket promedio").should("be.visible");
    });

    it("renders KPI grid with prior data — KpiCards show positive delta arrows", () => {
      cy.mockExecutiveData({
        kpis: { current: [
          { revenue: 10000, totalOrders: 50, unitsSold: 100, uniqueCustomers: 40, date: "2024-01-01" },
        ], prior: [
          { revenue: 8000, totalOrders: 40, unitsSold: 80, uniqueCustomers: 30, date: "2023-12-01" },
        ]},
      });
      cy.visit("/dashboard");
      cy.wait("@execKpis");
      cy.contains("Ventas totales").should("be.visible");
      cy.get("svg.lucide-arrow-up", { timeout: 10000 }).should("exist");
    });

    it("renders KPI grid with prior data higher than current — KpiCards show negative delta arrows", () => {
      cy.mockExecutiveData({
        kpis: { current: [
          { revenue: 5000, totalOrders: 20, unitsSold: 40, uniqueCustomers: 15, date: "2024-01-01" },
        ], prior: [
          { revenue: 10000, totalOrders: 50, unitsSold: 100, uniqueCustomers: 40, date: "2023-12-01" },
        ]},
      });
      cy.visit("/dashboard");
      cy.wait("@execKpis");
      cy.contains("Ventas totales").should("be.visible");
      cy.get("svg.lucide-arrow-down", { timeout: 10000 }).should("exist");
    });

    // doble click en barra cubre toggleFilter en page.tsx línea 40
    it("clicking the same category bar twice toggles the filter off", () => {
      cy.visit("/dashboard");
      cy.wait([
        "@execKpis",
        "@execCategorySales",
        "@execAudiences",
        "@execRetention",
        "@execCompetitiveCards",
      ]);
      cy.intercept("GET", "/api/proxy/executive/kpis*", (req) => {
        const url = new URL(req.url);
        if (url.searchParams.get("category")) req.alias = "categoryOn";
        req.reply({ fixture: "executive/executive-kpis.json" });
      });
      cy.get(".recharts-bar-rectangle", { timeout: 10000 }).first().click({ force: true });
      cy.wait("@categoryOn");
      cy.intercept("GET", "/api/proxy/executive/kpis*", (req) => {
        const url = new URL(req.url);
        if (!url.searchParams.get("category")) req.alias = "categoryOff";
        req.reply({ fixture: "executive/executive-kpis.json" });
      });
      cy.get(".recharts-bar-rectangle", { timeout: 10000 }).first().click({ force: true });
      cy.wait("@categoryOff").then((interception) => {
        const url = new URL(interception.request.url);
        expect(url.searchParams.has("category")).to.eq(false);
      });
    });
  });

  context("Role: Retailer Admin", () => {
    beforeEach(() => {
      cy.mockAuthenticatedSession("retailer_admin");
      cy.mockExecutiveData();
    });

    it("shows generic prompt message (empty state) by default", () => {
      cy.visit("/dashboard");
      cy.contains(
        "Selecciona una marca específica para ver su posicionamiento competitivo."
      ).should("be.visible");
    });

    it("fetches dataset with brand query param upon selecting a brand from global top menu", () => {
      cy.visit("/dashboard");
      cy.wait("@execKpis");
      cy.intercept("GET", "/api/proxy/executive/kpis*", (req) => {
        const url = new URL(req.url);
        if (url.searchParams.get("brand") === "Calvin Klein") {
          req.alias = "adminBrandSelection";
        }
        req.reply({ fixture: "executive/executive-kpis.json" });
      });
      cy.get("header").contains("button", "Todas las marcas").click();
      cy.contains("Calvin Klein").click();
      cy.wait("@adminBrandSelection").then((interception) => {
        const url = new URL(interception.request.url);
        expect(url.searchParams.get("brand")).to.eq("Calvin Klein");
      });
    });
  });
});
