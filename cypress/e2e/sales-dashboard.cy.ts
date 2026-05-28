/*
E2E Tests: Sales Dashboard (/sales)
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
      cy.intercept("GET", "/api/proxy/sales/kpis*", (req) => {
        req.reply((res) => {
          res.setDelay(600);
          res.send({ fixture: "sales-kpis.json" });
        });
      }).as("salesKpisDelayed");

      cy.visit("/sales");

      cy.get(".animate-pulse").should("exist");

      cy.wait("@salesKpisDelayed");
      cy.wait("@salesCategories");
      cy.wait("@salesPerformance");
      cy.get(".animate-pulse").should("not.exist");
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

      cy.contains("Ingresos Netos")
        .closest("[class*='rounded']")
        .within(() => {
          cy.get("*").not(":empty").should("exist");
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

    it("renders the 'Ventas por Categoría' pie chart", () => {
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance"]);
      cy.contains("Ventas por Categoría").should("be.visible");
      cy.get(".recharts-pie").should("exist");
    });

    it("renders the 'Órdenes vs Ingresos Netos' composed chart", () => {
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance"]);
      cy.contains("Órdenes vs Ingresos Netos").should("be.visible");
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

      ["Search", "Organic", "Email", "Facebook", "Display"].forEach((source) => {
        cy.contains("td", source).should("be.visible");
      });
    });
  });

  // ─────────────────────────────────────────────
  // Granularity
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
      cy.mockSalesData(); // re-register intercepts for the second call
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
      cy.contains("[role='option']", "Jeans").click();

      cy.wait("@salesKpis").then((interception) => {
        expect(interception.request.url).to.include("category=Jeans");
      });
    });

    it("applying a Country filter re-fetches data with the country param", () => {
      cy.mockSalesData();

      cy.get("[data-slot='select-trigger']").eq(2).click();
      cy.contains("[role='option']", "United States").click();

      cy.wait("@salesKpis").then((interception) => {
        expect(interception.request.url).to.include("country=United+States");
      });
    });

    it("'Limpiar' clears all filters and re-fetches without filter params", () => {
      cy.mockSalesData();

      cy.get("[data-slot='select-trigger']").first().click();
      cy.contains("[role='option']", "Jeans").click();
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
  // Backend error 
  // ─────────────────────────────────────────────
  context("Backend error (500)", () => {
    it("the page does not crash when all 3 endpoints return 500", () => {
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
      cy.mockSalesData();
      cy.visit("/dashboard");

      cy.contains("a", "Dashboard de Ventas").click();
      cy.url().should("include", "/sales");
      cy.contains("h1, h2, h3", "Dashboard de Ventas").should("be.visible");
    });

    it("the 'Dashboard de Ventas' sidebar link is active when the URL is /sales", () => {
      cy.visit("/sales");
      cy.wait(["@salesKpis", "@salesCategories", "@salesPerformance"]);

      cy.contains("a", "Dashboard de Ventas").should("have.class", "bg-sidebar-accent");
    });
  });

  // ─────────────────────────────────────────────
  // Brand role 
  // ─────────────────────────────────────────────
  context("User with 'brand' role", () => {
    it("loads the dashboard and injects the user's brand into the query", () => {
      cy.mockAuthenticatedSession("brand");
      cy.mockSalesData();
      cy.visit("/sales");

      cy.wait("@salesKpis").then((interception) => {
        expect(interception.request.url).to.include("brand=Calvin+Klein");
      });

      cy.contains("Dashboard de Ventas").should("be.visible");
    });
  });
});
