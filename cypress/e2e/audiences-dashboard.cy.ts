/*
 * E2E Tests: Audiences Dashboard (/audiences)
 */
describe("Audiences Dashboard", () => {
  beforeEach(() => {
    cy.mockAuthenticatedSession("retailer_admin");
    cy.mockAudiencesData();
  });

  // ─────────────────────────────────────────────
  // Initial load
  // ─────────────────────────────────────────────
  context("Initial page load", () => {
    beforeEach(() => {
      cy.visit("/audiences");
      cy.wait(["@audiencesKpis", "@audiencesGender", "@audiencesAge", "@audiencesRfm", "@audiencesFunnel"]);
    });

    it("renders title and all 4 KPI cards with non-empty values", () => {
      cy.contains("Audiencias").should("be.visible");
      ["Clientes Únicos", "Órdenes / Cliente", "Recencia Promedio", "Ticket / Cliente"].forEach((label) => {
        cy.contains(label).should("be.visible");
      });
      cy.get(".kpi-card").should("have.length.at.least", 4);
      cy.get(".kpi-card").each(($card) => {
        cy.wrap($card).find(".text-2xl").should("not.be.empty");
      });
    });

    it("renders the gender breakdown and age breakdown charts", () => {
      cy.contains("Género").should("be.visible");
      cy.contains("Edad").should("be.visible");
    });

    it("shows loading skeletons while data is being fetched", () => {
      cy.intercept("GET", "/api/proxy/audiences/funnel*", {
        delay: 600,
        fixture: "audiences-funnel.json",
      }).as("audiencesFunnelDelayed");

      cy.visit("/audiences");
      cy.get(".animate-pulse").should("exist");
      cy.wait("@audiencesFunnelDelayed");
      cy.contains("Email", { timeout: 15000 }).should("exist");
    });
  });

  // ─────────────────────────────────────────────
  // Funnel de tráfico
  // ─────────────────────────────────────────────
  context("Funnel de tráfico", () => {
    beforeEach(() => {
      cy.visit("/audiences");
      cy.wait(["@audiencesKpis", "@audiencesGender", "@audiencesAge", "@audiencesRfm", "@audiencesFunnel", "@audiencesInsights"]);
    });

    it("renders the panel title, column headers, and all fixture traffic sources", () => {
      cy.contains("Funnel de tráfico").should("be.visible");
      ["Traffic Source", "Visitas", "Product Views", "Add to Cart", "Purchases", "Conv."].forEach((header) => {
        cy.contains(header).should("be.visible");
      });
      ["Email", "Adwords", "YouTube", "Facebook", "Organic"].forEach((source) => {
        cy.contains(source).should("exist");
      });
    });

    it("shows correct conversion rates and a Total row", () => {
      cy.get("table")
        .contains("tr", "Email")
        .within(() => {
          cy.contains("100.00%").should("not.exist");
          cy.contains("12.27%").should("exist");
        });
      cy.contains("td", "Total").should("exist");
    });

    it("shows No hay datos disponibles when funnel returns empty array", () => {
      cy.mockAudiencesData({ funnel: [] });
      cy.visit("/audiences");
      cy.wait("@audiencesFunnel");
      cy.contains("No hay datos disponibles").should("be.visible");
    });
  });

  // ─────────────────────────────────────────────
  // Filters
  // ─────────────────────────────────────────────
  context("Data filters", () => {
    beforeEach(() => {
      cy.visit("/audiences");
      cy.wait(["@audiencesKpis", "@audiencesGender", "@audiencesAge", "@audiencesRfm", "@audiencesFunnel", "@audiencesInsights"]);
    });

    it("the filter panel is visible", () => {
      cy.contains("Filtros").should("be.visible");
    });

    it("applying a Gender filter re-fetches funnel with the gender param", () => {
      cy.mockAudiencesData();
      cy.get("[data-slot='select-trigger']").contains("Género").closest("[data-slot='select-trigger']").click();
      cy.get("[data-slot='select-item']").contains("Mujer").should("be.visible").realClick();
      cy.wait("@audiencesFunnel").then((interception) => {
        expect(interception.request.url).to.include("gender=");
      });
    });

    it("applying a Traffic Source filter re-fetches funnel with the trafficSource param", () => {
      cy.mockAudiencesData();
      cy.get("[data-slot='select-trigger']").contains("Fuente de tráfico").closest("[data-slot='select-trigger']").click();
      cy.get("[data-slot='select-item']").contains("Email").should("be.visible").realClick();
      cy.wait("@audiencesFunnel").then((interception) => {
        expect(interception.request.url).to.include("trafficSource=Email");
      });
    });

    it("'Limpiar' clears filters and re-fetches without filter params", () => {
      cy.mockAudiencesData();
      cy.get("[data-slot='select-trigger']").contains("Género").closest("[data-slot='select-trigger']").click();
      cy.get("[data-slot='select-item']").contains("Mujer").should("be.visible").realClick();
      cy.wait("@audiencesFunnel");

      cy.mockAudiencesData();
      cy.contains("button", "Limpiar").click();
      cy.wait("@audiencesFunnel").then((interception) => {
        expect(interception.request.url).to.not.include("gender=");
      });
    });
  });

  // ─────────────────────────────────────────────
  // Backend error resilience
  // ─────────────────────────────────────────────
  context("Backend error (500)", () => {
    it("the page does not crash when all endpoints return 500", () => {
      cy.mockAudiencesData({ statusCode: 500 });
      cy.visit("/audiences");
      cy.contains("Audiencias").should("be.visible");
      cy.get("body").should("not.contain", "Unhandled");
    });
  });

  // ─────────────────────────────────────────────
  // Sidebar navigation
  // ─────────────────────────────────────────────
  context("Sidebar navigation", () => {
    it("the 'Audiencias' sidebar link is active when the URL is /audiences", () => {
      cy.visit("/audiences");
      cy.wait(["@audiencesKpis", "@audiencesGender", "@audiencesAge", "@audiencesRfm", "@audiencesFunnel", "@audiencesInsights"]);
      cy.contains("a", "Audiencias").should("have.class", "bg-sidebar-accent");
    });
  });

  // ─────────────────────────────────────────────
  // Brand role
  // ─────────────────────────────────────────────
  context("User with 'brand' role", () => {
    it("loads the dashboard and injects the user's brand into the query", () => {
      cy.mockAuthenticatedSession("brand");
      cy.mockAudiencesData();
      cy.intercept("GET", /\/api\/proxy\/audiences\/kpis.*brand=Calvin/).as("audiencesKpisWithBrand");
      cy.visit("/audiences");
      cy.wait("@audiencesKpisWithBrand").then((interception) => {
        expect(interception.request.url).to.include("brand=Calvin+Klein");
      });
      cy.contains("Audiencias").should("be.visible");
    });
  });
});
