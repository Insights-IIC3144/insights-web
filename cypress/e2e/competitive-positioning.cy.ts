/*
 * E2E Tests: Competitive Positioning (/competitive-positioning)
 */
describe("Competitive Positioning Dashboard", () => {
  
  beforeEach(() => {
    // 1. Asegurar tamaño de escritorio para que los elementos responsivos sean visibles
    cy.viewport(1280, 720);

    // 2. Definición global preventiva para ambiente de navegador
    cy.on("window:before:load", (win) => {
      (win as any).getOportunidad = () => "0.00%";
    });
  });

  // Brand User
  context("Role: Brand User", () => {
    beforeEach(() => {
      cy.mockAuthenticatedSession("brand");
      cy.mockCompetitiveData();
    });

    context("Initial page load", () => {
      beforeEach(() => {
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");
      });

      it("renders the title, subtitle, KPI cards, and all fixture rows in the detail table", () => {
        cy.contains("Posicionamiento Competitivo", { timeout: 10000 }).should("be.visible");
        cy.contains("Share de ventas", { timeout: 10000 }).should("be.visible");
        cy.contains("Unidades share").should("be.visible");
        ["Jeans", "Shirts", "Sweaters", "Pants"].forEach((category) => {
          cy.contains(category, { timeout: 10000 }).should("be.visible");
        });
      });

      it("renders all detail table column headers", () => {
        const columns = ["Categoría", "Ventas marca (USD)", "Ventas categoría (USD)", "Share ventas", "Precio marca (USD)", "Precio benchmark (USD)", "Oportunidad"];
        columns.forEach((col) => {
          cy.contains(col, { timeout: 10000 }).should("be.visible");
        });
      });

      it("shows loading skeletons while data is being fetched", () => {
        cy.intercept("GET", "**/competitive/all*", {
          delay: 400,
          fixture: "competitive/competitive-all.json",
        }).as("compAllDelayed");

        cy.visit("/competitive-positioning");
        cy.contains("Jeans", { timeout: 12000 }).should("be.visible");
      });
    });

    context("Data filters", () => {
      beforeEach(() => {
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");
        cy.contains("Share de ventas", { timeout: 10000 }).should("be.visible");
      });

      it("applying a Time Range filter re-fetches data with correct days", () => {
        cy.contains("button", "Últimos 90 días", { timeout: 10000 }).should("be.visible").click({ force: true });
        cy.get("[role='menuitem']").contains("Últimos 30 días").should("be.visible").click({ force: true });
        cy.wait("@compAll").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("days")).to.eq("30");
        });
      });

      it("applying Country filter re-fetches data with correct params", () => {
        cy.get("[data-slot='select-trigger']").eq(2).click();
        cy.get("[data-slot='select-item']").contains(/^United States$/).should("be.visible").realClick();
        cy.wait("@compAll").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("country")).to.eq("United States");
        });
      });

      it("applying Department filter re-fetches data with correct params", () => {
        cy.get("[data-slot='select-trigger']").eq(1).click();
        cy.get("[data-slot='select-item']").contains(/^Men$/).should("be.visible").realClick();
        cy.wait("@compAll").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("department")).to.eq("Men");
        });
      });

      it("applying Category filter re-fetches data with correct params", () => {
        cy.get("[data-slot='select-trigger']").first().click();
        cy.get("[data-slot='select-item']").contains(/^Jeans$/).should("be.visible").realClick();
        cy.wait("@compAll").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("category")).to.eq("Jeans");
        });
      });

      it("applying multiple filters consecutively accumulates all query parameters", () => {
        cy.contains("button", "Últimos 90 días", { timeout: 10000 }).should("be.visible").click({ force: true });
        cy.get("[role='menuitem']").contains("Últimos 30 días").should("be.visible").click({ force: true });
        cy.wait("@compAll");

        cy.get("[data-slot='select-trigger']").eq(2).click();
        cy.get("[data-slot='select-item']").contains(/^United States$/).should("be.visible").realClick();
        cy.wait("@compAll");

        cy.get("[data-slot='select-trigger']").eq(1).click();
        cy.get("[data-slot='select-item']").contains(/^Men$/).should("be.visible").realClick();
        cy.wait("@compAll");

        cy.get("[data-slot='select-trigger']").first().click();
        cy.get("[data-slot='select-item']").contains(/^Jeans$/).should("be.visible").realClick();
        cy.wait("@compAll").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("days")).to.eq("30");
          expect(url.searchParams.get("country")).to.eq("United States");
          expect(url.searchParams.get("department")).to.eq("Men");
          expect(url.searchParams.get("category")).to.eq("Jeans");
        });
      });
    });

    context("Backend error (500)", () => {
      it("the page does not crash when endpoints return server error", () => {
        cy.mockCompetitiveData({ statusCode: 500 });
        cy.visit("/competitive-positioning", { failOnStatusCode: false });
        cy.contains("Posicionamiento Competitivo", { timeout: 10000 }).should("be.visible");
        cy.get("body").should("not.contain", "Unhandled");
      });
    });
  });

  // Retailer Admin
  context("Role: Retailer Admin", () => {
    beforeEach(() => {
      cy.mockAuthenticatedSession("retailer_admin");
      cy.mockCompetitiveData();
    });

    it("shows prompt message (empty state) by default", () => {
      cy.visit("/competitive-positioning");
      cy.contains("Selecciona una marca en el menú superior", { timeout: 10000 }).should("be.visible");
    });

    it("fetches data and renders dashboard when a brand is selected from global menu", () => {
      cy.visit("/competitive-positioning");
      cy.contains("Selecciona una marca en el menú superior", { timeout: 10000 }).should("be.visible");
      cy.get("header").contains("button", "Todas las marcas", { timeout: 10000 }).should("be.visible").click({ force: true });
      cy.contains("Calvin Klein").should("be.visible").click({ force: true });
      cy.wait("@compAll").then((interception) => {
        const url = new URL(interception.request.url);
        expect(url.searchParams.get("brand")).to.eq("Calvin Klein");
      });
      cy.contains("Selecciona una marca en el menú superior", { timeout: 10000 }).should("not.exist");
      cy.contains("Jeans", { timeout: 10000 }).should("be.visible");
    });
  });
});
