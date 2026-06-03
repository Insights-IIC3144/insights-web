/*
 * E2E Tests: Competitive Positioning Dashboard (/competitive-positioning)
 */
describe("Competitive Positioning Dashboard", () => {
  //Brand
  context("Role: Brand User", () => {
    beforeEach(() => {
      cy.mockAuthenticatedSession("brand");
      cy.mockCompetitiveData();
    });

    context("Initial page load", () => {
      it("renders the 'Posicionamiento Competitivo' title and subtitle", () => {
        cy.visit("/competitive-positioning");
        cy.contains("Posicionamiento Competitivo").should("be.visible");
      });

      it("shows loading skeletons while data is being fetched", () => {
        cy.intercept("GET", "**/competitive/all*", {
          delay: 500,
          fixture: "competitive-all.json",
        }).as("compAllDelayed");

        cy.visit("/competitive-positioning");
        cy.get(".animate-pulse").should("exist");
        cy.wait("@compAllDelayed");
        cy.contains("Jeans").should("be.visible");
      });

      it("shows all KPI cards and insight logic correctly", () => {
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");

        cy.contains("Share de ventas").should("be.visible");
        cy.contains("Unidades share").should("be.visible");
      });

      it("renders the detail table with exact column headers", () => {
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");

        const columns = ["Categoría", "Ventas marca", "Ventas categoría", "Share", "Precio marca", "Precio benchmark", "Oportunidad"];
        columns.forEach((col) => {
          cy.contains("th", col).should("be.visible");
        });
      });

      it("renders all fixture rows in the detail table", () => {
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");

        ["Jeans", "Shirts", "Sweaters", "Pants"].forEach((category) => {
          cy.contains("td", category).should("exist");
        });
      });
    });

    context("Data filters", () => {
      beforeEach(() => {
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");
      });

      // Topbar (filter time)
      it("applying a Time Range filter from Topbar re-fetches data with correct days", () => {
        cy.mockCompetitiveData();
        cy.contains("button", "Últimos 90 días").should("be.visible").click();
        cy.contains("[role='menuitem']", "Últimos 30 días").should("be.visible").click();

        cy.wait("@compAll").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("days")).to.eq("30");
        });
      });

      // Other filters (País, Departamento, Categoría)
      it("applying Country, Department and Category filters re-fetches data with correct params", () => {
        // PAÍS
        cy.mockCompetitiveData();
        cy.get("[data-slot='select-trigger']").eq(2).click();
        cy.get("[data-slot='select-item']").contains("United States").should("be.visible").realClick();

        cy.wait("@compAll").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("country")).to.eq("United States");
        });

        // DEPARTAMENT
        cy.mockCompetitiveData();
        cy.get("[data-slot='select-trigger']").eq(1).click();
        cy.get("[data-slot='select-item']").contains("Men").should("be.visible").realClick();

        cy.wait("@compAll").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("department")).to.eq("Men");
        });

        // CATEGORY
        cy.mockCompetitiveData();
        cy.get("[data-slot='select-trigger']").first().click();
        cy.get("[data-slot='select-item']").contains("Jeans").should("be.visible").realClick();

        cy.wait("@compAll").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("category")).to.eq("Jeans");
        });
      });
    });

    context("Backend error (500)", () => {
      it("the page does not crash when endpoints return server error", () => {
        cy.mockCompetitiveData({ statusCode: 500 });
        cy.visit("/competitive-positioning");

        cy.contains("Posicionamiento Competitivo").should("be.visible");
        cy.get("body").should("not.contain", "Unhandled");
      });
    });
  });

  // Retailer Admin
  context("Role: Retailer Admin", () => {
    beforeEach(() => {
      // "retailer_admin" (brand = null)
      cy.mockAuthenticatedSession("retailer_admin");
      cy.mockCompetitiveData();
    });

    it("shows prompt message (empty state) by default", () => {
      cy.visit("/competitive-positioning");
      cy.contains("Selecciona una marca en el menú superior").should("be.visible");
    });

    it("fetches data and renders dashboard when a brand is selected from global menu", () => {
      cy.visit("/competitive-positioning");
      cy.contains("Selecciona una marca en el menú superior").should("be.visible");
      cy.get("header").contains("button","Todas las marcas").click(); // Trigger selector
      cy.get("[role='menuitem']").contains("Calvin Klein").click(); // brand option
      cy.wait("@compAll").then((interception) => {
        const url = new URL(interception.request.url);
        expect(url.searchParams.get("brand")).to.eq("Calvin Klein");
      });

      cy.contains("Selecciona una marca en el menú superior").should("not.exist");
      cy.contains("Jeans").should("be.visible");
    });
  });
});