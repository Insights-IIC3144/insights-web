/*
 * E2E Tests: Sales Dashboard (/sales)
 */
describe("Sales Dashboard", () => {
  beforeEach(() => {
    cy.mockAuthenticatedSession("retailer_admin");
    cy.mockSalesData();
  });

  // ─────────────────────────────────────────────
  // Initial load
  // ─────────────────────────────────────────────
  context("Initial page load", () => {
    it("renders the 'Dashboard de Ventas' title", () => {
      cy.visit("/sales");
      cy.contains("Dashboard de Ventas").should("be.visible");
    });

    it("shows loading skeletons while data is being fetched", () => {
      cy.intercept("GET", "/api/proxy/sales/kpis*", {
        delay: 600,
        fixture: "sales-kpis.json",
      }).as("salesKpisDelayed");

      cy.visit("/sales");

      cy.get(".animate-pulse").should("exist");

      cy.wait("@salesKpisDelayed");
      cy.wait("@salesCategories");
      cy.wait("@salesPerformance");
      cy.contains("$239,830", { timeout: 15000 }).should("exist");
    });

    it("shows all 6 KPI cards with the correct labels", () => {
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance"]);

      const labels = [
        "Ingresos Netos",
        "Total Pedidos",
        "Tasa de Pérdida",
        "Ticket Promedio",
        "Clientes Únicos",
        "Unidades Vendidas",
      ];
      labels.forEach((label) => {
        cy.contains(label).should("be.visible");
      });
    });

    it("shows non-empty KPI values", () => {
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance"]);

      cy.contains("$239,830").should("exist");

      cy.get(".kpi-card").should("have.length.at.least", 6);
      cy.get(".kpi-card").each(($card) => {
        cy.wrap($card).find(".text-2xl").should("not.be.empty");
      });
    });

    it("renders the 'Ventas en el Tiempo' area chart", () => {
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance"]);
      cy.contains("Ventas en el Tiempo").should("be.visible");
      cy.get(".recharts-area").should("exist");
    });

    it("renders the 'Ticket Promedio en el Tiempo' line chart", () => {
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance"]);
      cy.contains("Ticket Promedio en el Tiempo").should("be.visible");
    });

    it("renders the 'Ventas por Categoría' bar chart", () => {
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance"]);
      cy.contains("Ventas por Categoría").should("be.visible");
      cy.get(".recharts-bar").should("exist");
    });

    it("renders the 'Ingresos Netos vs Órdenes' composed chart", () => {
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance"]);
      cy.contains("Ingresos Netos vs Órdenes").should("be.visible");
    });

    it("renders the performance table with correct column headers", () => {
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance"]);

      cy.contains("Rendimiento por Fuente de Tráfico").should("be.visible");
      cy.contains("Fuente de Tráfico").should("be.visible");
      cy.contains("Órdenes").should("be.visible");
      cy.contains("Unidades").should("be.visible");
      cy.contains("Ticket Promedio").should("be.visible");
      cy.contains("Ingresos").should("be.visible");
    });

    it("renders all fixture rows in the performance table (Search, Organic, Email, Facebook, Display)", () => {
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance"]);

      cy.contains("Search", { timeout: 15000 }).should("exist");

      ["Search", "Organic", "Email", "Facebook", "Display"].forEach((source) => {
        cy.contains(source).should("exist");
      });
    });
  });

  // ─────────────────────────────────────────────
  // Granularity selector (inside chart cards)
  // ─────────────────────────────────────────────
  context("Granularity selector", () => {
    beforeEach(() => {
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance"]);
    });

    it("shows all 4 granularity options", () => {
      ["Diario", "Semanal", "Mensual", "Anual"].forEach((label) => {
        cy.contains("button", label).should("be.visible");
      });
    });

    it("'Mensual' is active by default", () => {
      cy.contains("button", "Mensual").should("have.class", "bg-primary");
    });

    it("selecting 'Diario' re-fetches KPIs with granularity=daily", () => {
      cy.mockSalesData();
      cy.contains("button", "Diario").click();

      cy.wait("@salesKpis").then((interception) => {
        expect(interception.request.url).to.include("granularity=daily");
      });
    });

    it("selecting 'Semanal' re-fetches KPIs with granularity=weekly", () => {
      cy.mockSalesData();
      cy.contains("button", "Semanal").click();

      cy.wait("@salesKpis").then((interception) => {
        expect(interception.request.url).to.include("granularity=weekly");
      });
    });

    it("selecting 'Anual' re-fetches KPIs with granularity=yearly", () => {
      cy.mockSalesData();
      cy.contains("button", "Anual").click();

      cy.wait("@salesKpis").then((interception) => {
        expect(interception.request.url).to.include("granularity=yearly");
      });
    });

    it("the selected button receives the active class (bg-primary)", () => {
      cy.contains("button", "Semanal").click();
      cy.contains("button", "Semanal").should("have.class", "bg-primary");
      cy.contains("button", "Mensual").should("not.have.class", "bg-primary");
    });
  });

  // ─────────────────────────────────────────────
  // Filters
  // ─────────────────────────────────────────────
  context("Data filters", () => {
    beforeEach(() => {
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance"]);
    });

    it("the filter panel is visible", () => {
      cy.contains("Filtros").should("be.visible");
    });

    it("applying a Category filter re-fetches data with the category param", () => {
      cy.mockSalesData();

      cy.get("[data-slot='select-trigger']").first().click();
      cy.get("[data-slot='select-item']").contains("Jeans").should("be.visible").realClick();

      cy.wait("@salesKpis").then((interception) => {
        expect(interception.request.url).to.include("category=Jeans");
      });
    });

    it("applying a Country filter re-fetches data with the country param", () => {
      cy.mockSalesData();

      cy.get("[data-slot='select-trigger']").eq(2).click();
      cy.get("[data-slot='select-item']").contains("United States").should("be.visible").realClick();

      cy.wait("@salesKpis").then((interception) => {
        expect(interception.request.url).to.include("country=United+States");
      });
    });

    it("'Limpiar' clears all filters and re-fetches without filter params", () => {
      cy.mockSalesData();

      cy.get("[data-slot='select-trigger']").first().click();
      cy.get("[data-slot='select-item']").contains("Jeans").should("be.visible").realClick();
      cy.wait("@salesKpis");

      cy.mockSalesData();
      cy.contains("button", "Limpiar").click();

      cy.wait("@salesKpis").then((interception) => {
        expect(interception.request.url).to.not.include("category=");
      });
    });
  });

  // ─────────────────────────────────────────────
  // Empty state
  // ─────────────────────────────────────────────
  context("Empty state", () => {
    it("shows 'No hay datos disponibles' when performance returns an empty array", () => {
      cy.mockSalesData({ performance: [] });
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance"]);

      cy.contains("No hay datos disponibles").should("be.visible");
    });
  });

  // ─────────────────────────────────────────────
  // Backend error resilience
  // ─────────────────────────────────────────────
  context("Backend error (500)", () => {
    it("the page does not crash when all endpoints return 500", () => {
      cy.mockSalesData({ statusCode: 500 });
      cy.visit("/sales");

      cy.contains("Dashboard de Ventas").should("be.visible");
      cy.contains("Ingresos Netos").should("be.visible");
      cy.get("body").should("not.contain", "Unhandled");
    });
  });

  // ─────────────────────────────────────────────
  // Sidebar navigation
  // ─────────────────────────────────────────────
  context("Sidebar navigation", () => {
    it("clicking 'Dashboard de Ventas' in the sidebar navigates to /sales", () => {
      cy.intercept("GET", "/api/proxy/executive/kpis*", { statusCode: 200, body: [] }).as("executiveKpis");
      cy.intercept("GET", "/api/proxy/executive/category-sales*", { statusCode: 200, body: [] }).as("executiveCategorySales");
      cy.intercept("GET", "/api/proxy/executive/audiences*", { statusCode: 200, body: [] }).as("executiveAudiences");
      cy.intercept("GET", "/api/proxy/executive/retention*", { statusCode: 200, body: [] }).as("executiveRetention");
      cy.intercept("GET", "/api/proxy/executive/trend*", { statusCode: 200, body: [] }).as("executiveTrend");
      cy.intercept("GET", "/api/proxy/filters*", { statusCode: 200, fixture: "filters.json" }).as("filters");

      cy.mockSalesData();
      cy.visit("/dashboard");

      cy.wait("@filters");
      cy.contains("a", "Dashboard de Ventas").should("be.visible").click();

      cy.url({ timeout: 20000 }).should("include", "/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance"]);
      cy.contains("Dashboard de Ventas").should("be.visible");
    });

    it("the 'Dashboard de Ventas' sidebar link is active when the URL is /sales", () => {
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance"]);

      cy.contains("a", "Dashboard de Ventas").should("have.class", "bg-sidebar-accent");
    });
  });

  // ─────────────────────────────────────────────
  // Brand role (restricted to a single brand)
  // ─────────────────────────────────────────────
  context("User with 'brand' role", () => {
    it("loads the dashboard and injects the user's brand into the query", () => {
      cy.mockAuthenticatedSession("brand");
      cy.mockSalesData();
      cy.intercept("GET", /\/api\/proxy\/sales\/kpis.*brand=Calvin/).as("salesKpisWithBrand");

      cy.visit("/sales");
      cy.wait("@salesKpisWithBrand");

      cy.contains("Dashboard de Ventas").should("be.visible");
    });
  });

  // ─────────────────────────────────────────────
  // Best and worst products section
  // ─────────────────────────────────────────────
  context("Best and worst products section", () => {
    beforeEach(() => {
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance", "@salesTopProducts"]);
    });

    it("renders the section title", () => {
      cy.contains("Mejores y Peores Productos").should("be.visible");
    });

    it("renders the 'Mejores Productos' and 'Peores Productos' column headers", () => {
      cy.contains("Mejores Productos").should("be.visible");
      cy.contains("Peores Productos").should("be.visible");
    });

    it("shows the top-ranked best product from the fixture", () => {
      cy.contains("Slim Fit Jeans").should("be.visible");
      cy.contains("Jeans").should("be.visible");
    });

    it("shows the top-ranked worst product from the fixture", () => {
      cy.contains("Basic Tee White").should("be.visible");
    });

    it("formats revenue as currency", () => {
      cy.contains("$4,201").should("be.visible");
    });

    it("shows units sold for a product", () => {
      cy.contains("42 uds.").should("be.visible");
    });

    it("shows loading skeletons while top-products data is being fetched", () => {
      cy.intercept("GET", "/api/proxy/sales/top-products*", {
        delay: 600,
        fixture: "sales-top-products.json",
      }).as("salesTopProductsDelayed");

      cy.visit("/sales");
      cy.get(".animate-pulse").should("exist");
      cy.wait("@salesTopProductsDelayed");
    });
  });

  // ─────────────────────────────────────────────
  // Top limit selector
  // ─────────────────────────────────────────────
  context("Top limit selector", () => {
    beforeEach(() => {
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance", "@salesTopProducts"]);
    });

    it("shows all 3 limit options", () => {
      ["Top 3", "Top 5", "Top 10"].forEach((label) => {
        cy.contains("button", label).should("be.visible");
      });
    });

    it("'Top 5' is active by default", () => {
      cy.contains("button", "Top 5").should("have.class", "bg-primary");
    });

    it("selecting 'Top 3' re-fetches top-products with limit=3", () => {
      cy.mockSalesData();
      cy.contains("button", "Top 3").click();

      cy.wait("@salesTopProducts").then((interception) => {
        expect(interception.request.url).to.include("limit=3");
      });
    });

    it("selecting 'Top 10' re-fetches top-products with limit=10", () => {
      cy.mockSalesData();
      cy.contains("button", "Top 10").click();

      cy.wait("@salesTopProducts").then((interception) => {
        expect(interception.request.url).to.include("limit=10");
      });
    });

    it("the selected button receives the active class", () => {
      cy.mockSalesData();
      cy.contains("button", "Top 3").click();
      cy.wait("@salesTopProducts");

      cy.contains("button", "Top 3").should("have.class", "bg-primary");
      cy.contains("button", "Top 5").should("not.have.class", "bg-primary");
    });
  });

  // ─────────────────────────────────────────────
  // Top products empty state
  // ─────────────────────────────────────────────
  context("Top products empty state", () => {
    it("shows 'No hay datos disponibles' in both columns when lists are empty", () => {
      cy.mockSalesData({ topProducts: { best: [], worst: [] } });
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance", "@salesTopProducts"]);

      cy.contains("Mejores y Peores Productos").should("be.visible");
      cy.get("p").filter(":contains('No hay datos disponibles')").should("have.length", 2);
    });
  });

  // ─────────────────────────────────────────────
  // Top products backend error resilience
  // ─────────────────────────────────────────────
  context("Top products backend error (500)", () => {
    it("the page does not crash when only top-products returns 500", () => {
      cy.intercept("GET", "/api/proxy/sales/top-products*", {
        statusCode: 500,
        body: { error: "Server error" },
      }).as("salesTopProductsError");

      cy.visit("/sales");

      cy.contains("Dashboard de Ventas").should("be.visible");
      cy.contains("Ingresos Netos").should("be.visible");
      cy.get("body").should("not.contain", "Unhandled");
    });
  });
});
