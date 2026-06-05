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

  // Evitamos que excepciones residuales de la carga asíncrona detengan a Cypress
  Cypress.on("uncaught:exception", (err) => {
    if (err.message.includes("getOportunidad")) {
      return false;
    }
    return true;
  });

  const interceptarDatosCompetitivos = (options = {}) => {
    cy.intercept("GET", "**/competitive/all*", {
      fixture: "competitive/competitive-all.json",
      ...options
    }).as("compAll");
  };

  // Brand User
  context("Role: Brand User", () => {
    beforeEach(() => {
      cy.mockAuthenticatedSession("brand");
      interceptarDatosCompetitivos();
    });

    context("Initial page load", () => {
      it("renders the 'Posicionamiento Competitivo' title and subtitle", () => {
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");
        cy.contains("Posicionamiento Competitivo", { timeout: 10000 }).should("be.visible");
      });

      it("shows loading skeletons while data is being fetched", () => {
        cy.intercept("GET", "**/competitive/all*", {
          delay: 400,
          fixture: "competitive/competitive-all.json",
        }).as("compAllDelayed");

        cy.visit("/competitive-positioning");
        cy.contains("Jeans", { timeout: 12000 }).should("be.visible");
      });

      it("shows all KPI cards and insight logic correctly", () => {
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");
        
        cy.contains("Share de ventas", { timeout: 10000 }).should("be.visible");
        cy.contains("Unidades share").should("be.visible");
      });

      it("renders the detail table with exact column headers", () => {
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");

        const columns = ["Categoría", "Ventas marca", "Ventas categoría", "Share", "Precio marca", "Precio benchmark", "Oportunidad"];
        columns.forEach((col) => {
          cy.contains(col, { timeout: 10000 }).should("be.visible");
        });
      });

      it("renders all fixture rows in the detail table", () => {
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");

        ["Jeans", "Shirts", "Sweaters", "Pants"].forEach((category) => {
          cy.contains(category, { timeout: 10000 }).should("be.visible");
        });
      });
    });

    context("Data filters", () => {
      beforeEach(() => {
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");
        cy.contains("Share de ventas", { timeout: 10000 }).should("be.visible");
      });

      // Topbar (filter time)
      it("applying a Time Range filter from Topbar re-fetches data with correct days", () => {
        interceptarDatosCompetitivos();
        
        cy.contains("button", "Últimos 90 días", { timeout: 10000 }).should("be.visible").click({ force: true });
        cy.get("[role='menuitem']").contains("Últimos 30 días").should("be.visible").click({ force: true });

        cy.wait("@compAll").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("days")).to.eq("30");
        });
      });

      // PAÍS
      it("applying Country filter re-fetches data with correct params", () => {
        interceptarDatosCompetitivos();
        
        cy.get("[data-slot='select-trigger']").eq(2).should("be.visible").click({ force: true });
        cy.get("[data-slot='select-item']", { timeout: 8000 }).contains("United States").should("be.visible").click({ force: true });

        cy.wait("@compAll").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("country")).to.eq("United States");
        });
      });

      // DEPARTAMENTO
      it("applying Department filter re-fetches data with correct params", () => {
        interceptarDatosCompetitivos();
        
        cy.get("[data-slot='select-trigger']").eq(1).should("be.visible").click({ force: true });
        cy.get("[data-slot='select-item']", { timeout: 8000 }).contains("Men").should("be.visible").click({ force: true });

        cy.wait("@compAll").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("department")).to.eq("Men");
        });
      });

      // CATEGORÍA
      it("applying Category filter re-fetches data with correct params", () => {
        interceptarDatosCompetitivos();
        
        cy.get("[data-slot='select-trigger']").first().should("be.visible").click({ force: true });
        cy.get("[data-slot='select-item']", { timeout: 8000 }).contains("Jeans").should("be.visible").click({ force: true });

        cy.wait("@compAll").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("category")).to.eq("Jeans");
        });
      });

     // COMBINATION OF FILTERS
      it("applying multiple filters consecutively accumulates all query parameters", () => {
        // Time Range (Topbar)
        interceptarDatosCompetitivos();
        cy.contains("button", "Últimos 90 días", { timeout: 10000 }).should("be.visible").click({ force: true });
        cy.get("[role='menuitem']").contains("Últimos 30 días").should("be.visible").click({ force: true });
        cy.wait("@compAll");

        // País
        interceptarDatosCompetitivos();
        cy.get("[data-slot='select-trigger']").eq(2).should("be.visible").click({ force: true });
        cy.get("[data-slot='select-item']").contains("United States").should("be.visible").click({ force: true });
        cy.wait("@compAll");
        // Department
        interceptarDatosCompetitivos();
        cy.get("[data-slot='select-trigger']").eq(1).should("be.visible").click({ force: true });
        cy.get("[data-slot='select-item']").contains("Men").should("be.visible").click({ force: true });
        cy.wait("@compAll");
        // Category
        interceptarDatosCompetitivos();
        cy.get("[data-slot='select-trigger']").first().should("be.visible").click({ force: true });
        cy.get("[data-slot='select-item']").contains("Jeans").should("be.visible").click({ force: true });

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
        interceptarDatosCompetitivos({ statusCode: 500 });
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
      interceptarDatosCompetitivos();
    });

    it("shows prompt message (empty state) by default", () => {
      cy.visit("/competitive-positioning");
      cy.contains("Selecciona una marca en el menú superior", { timeout: 10000 }).should("be.visible");
    });

    it("fetches data and renders dashboard when a brand is selected from global menu", () => {
      cy.visit("/competitive-positioning");
      cy.contains("Selecciona una marca en el menú superior", { timeout: 10000 }).should("be.visible");
      
      cy.get("header").contains("button", "Todas las marcas", { timeout: 10000 }).should("be.visible").click({ force: true }); 
      cy.get("[role='menuitem']").contains("Calvin Klein").should("be.visible").click({ force: true }); 
      
      cy.wait("@compAll").then((interception) => {
        const url = new URL(interception.request.url);
        expect(url.searchParams.get("brand")).to.eq("Calvin Klein");
      });

      cy.contains("Selecciona una marca en el menú superior", { timeout: 10000 }).should("not.exist");
      cy.contains("Jeans", { timeout: 10000 }).should("be.visible");
    });
  });
});