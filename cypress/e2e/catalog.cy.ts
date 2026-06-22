/*
 * E2E Tests: Catalog Dashboard (/catalog)
 */
describe("Catalog Dashboard (/catalog)", () => {
  context("Role: Retailer Admin", () => {
    beforeEach(() => {
      cy.mockAuthenticatedSession("retailer_admin");
      cy.mockCatalogData();
    });

    context("Initial page load & UI rendering", () => {
      beforeEach(() => {
        cy.visit("/catalog");
        cy.wait(["@catalogKpis", "@catalogProducts", "@catalogInsights"]);
      });

      it("renders title, subtitle, KPI grid, insights, and table", () => {
        // Headers
        cy.contains("Catálogo de Productos").should("be.visible");
        cy.contains("Analiza el rendimiento de tu catálogo").should("be.visible");

        // KPIs
        cy.contains("Total de Productos").should("be.visible");
        cy.contains("Ingreso Total del Catálogo").should("be.visible");
        cy.contains("Tasa Promedio de Devolución").should("be.visible");

        // Table
        cy.contains("Rendimiento por Producto").should("be.visible");
        cy.contains("Classic Crew Neck Tee").should("be.visible");
      });

      it("shows loading skeletons while data is being fetched", () => {
        // Interceptamos con retraso para poder ver los skeletons
        cy.intercept("GET", "/api/proxy/catalog/kpis*", {
          delay: 500,
          fixture: "catalog/catalog-kpis.json",
        }).as("catalogKpisDelayed");
        
        cy.visit("/catalog");
        cy.get(".animate-pulse").should("exist"); // Verifica el skeleton
        cy.wait("@catalogKpisDelayed");
      });
    });

    context("Table interactions: Filters, Search, Sort & Pagination", () => {
      beforeEach(() => {
        cy.visit("/catalog");
        cy.wait(["@catalogKpis", "@catalogProducts", "@catalogInsights"]);
      });

      it("debounces search input and sends correct query param", () => {
        cy.intercept("GET", "/api/proxy/catalog/products*", (req) => {
          const url = new URL(req.url);
          if (url.searchParams.get("search") === "Denim") {
            req.alias = "productSearch";
          }
          req.reply({ fixture: "catalog/catalog-products.json" });
        });

        cy.get('input[placeholder="Buscar producto..."]').type("Denim");
        // Esperamos el debounce de 500ms + la petición
        cy.wait("@productSearch").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("search")).to.eq("Denim");
          // Debería resetear a la página 0
          expect(url.searchParams.get("page")).to.eq("0"); 
        });
      });

      it("sorts table and toggles direction on subsequent clicks", () => {
        cy.intercept("GET", "/api/proxy/catalog/products*", (req) => {
          const url = new URL(req.url);
          if (url.searchParams.get("sortField") === "unitsSold") {
            req.alias = "productSort";
          }
          req.reply({ fixture: "catalog/catalog-products.json" });
        });

        // Primer click: Ordena por unitsSold (desc)
        cy.contains("th", "Unidades Vendidas").click();
        cy.wait("@productSort").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("sortField")).to.eq("unitsSold");
          expect(url.searchParams.get("sortDirection")).to.eq("desc");
        });

        // Segundo click: Cambia a asc
        cy.contains("th", "Unidades Vendidas").click();
        cy.wait("@productSort").then((interception) => {
          const url = new URL(interception.request.url);
          expect(url.searchParams.get("sortDirection")).to.eq("asc");
        });
      });

      it("navigates through pagination correctly", () => {
        // Creamos un producto falso para evitar crasheos de undefined.toLocaleString() en la tabla
        const mockProduct = {
          id: "p1",
          name: "Mock Product",
          brand: "Mock Brand",
          category: "Jeans",
          price: 100,
          unitsSold: 50,
          revenue: 5000,
          returnRate: 2.5
        };

        // Mockeamos la respuesta inicial usando el producto falso
        cy.mockCatalogData({
            products: { data: [mockProduct], totalElements: 45, totalPages: 3, currentPage: 0 }
            });
            cy.visit("/catalog");
            cy.wait("@catalogProducts");

            cy.intercept("GET", "/api/proxy/catalog/products*", (req) => {
            const url = new URL(req.url);
            if (url.searchParams.get("page") === "1") {
                req.alias = "pageTwo";
            }
            req.reply({
                // Respondemos también con el producto falso en la página 2
                body: { data: [mockProduct], totalElements: 45, totalPages: 3, currentPage: 1 }
            });
            });

            // Buscamos el SVG y subimos al botón padre
            cy.get("svg.lucide-chevron-right").closest("button").click();
            
            cy.wait("@pageTwo").then((interception) => {
            const url = new URL(interception.request.url);
            expect(url.searchParams.get("page")).to.eq("1");
            });
        });

      it("shows empty state when no products match filters", () => {
        cy.mockCatalogData({ 
          products: { data: [], totalElements: 0, totalPages: 0, currentPage: 0 } 
        });
        cy.visit("/catalog");
        cy.wait("@catalogProducts");
        
        cy.contains("No se encontraron productos que coincidan").should("be.visible");
      });
    });

    context("AI Action Cards & Insights", () => {
      beforeEach(() => {
        cy.visit("/catalog");
        cy.wait(["@catalogKpis", "@catalogProducts", "@catalogInsights"]);
      });

      it("renders insight cards properly based on the fixture", () => {
        cy.contains("Reducir devoluciones en jeans").should("be.visible");
        cy.contains("Impacto:").should("be.visible");
      });

      it("regenerates an insight successfully avoiding animation interference", () => {
        cy.intercept("POST", "/api/proxy/catalog/insights/regenerate*", {
          statusCode: 200,
          body: {
            id: "ci-99",
            scope: "product",
            type: "opportunity",
            title: "Nuevo insight regenerado",
            description: "Descripción regenerada de prueba.",
            impactScore: 9,
          },
        }).as("regenerateInsight");

        cy.get('[title="Generar nuevo insight distinto"]')
          .first()
          .should("exist")
          .click({ force: true });

        cy.wait("@regenerateInsight").its("response.statusCode").should("eq", 200);
      });

      it("shows empty state when no insights are returned", () => {
        cy.mockCatalogData({ insights: [] });
        cy.visit("/catalog");
        cy.wait("@catalogInsights");
        
        cy.contains("No se obtuvieron insights").should("be.visible");
        cy.contains("Es posible que el modelo de IA necesite unos segundos").should("be.visible");
      });
    });

    context("Backend error resilience (500)", () => {
      it("does not crash the page when endpoints return 500", () => {
        cy.mockCatalogData({ statusCode: 500 });
        cy.visit("/catalog", { failOnStatusCode: false });
        
        cy.contains("Catálogo de Productos").should("be.visible");
        cy.get("body").should("not.contain", "Unhandled Runtime Error");
      });
    });
  });

  context("Role: Brand User", () => {
    beforeEach(() => {
      cy.mockAuthenticatedSession("brand");
      cy.mockCatalogData();
      cy.visit("/catalog");
      cy.wait(["@catalogKpis", "@catalogProducts", "@catalogInsights"]);
    });

    it("does not show the global brand filter for brand users in the table", () => {
      // Como usuario de marca, el filtro de "Marca (Todas)" no debería existir
      cy.get("select").contains("Marca (Todas)").should("not.exist");
    });
  });
});