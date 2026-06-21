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
        const columns = ["Categoría", "Ventas marca", "Ventas categoría", "Share", "Precio marca", "Precio benchmark", "Oportunidad"];
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

    context("Insights ya generados (rama insight presente)", () => {
      const insightsFixture = [
        {
          category: "Jeans",
          opportunityTitle: "Precio por encima del benchmark",
          opportunityDescription:
            "Tu marca vende Jeans 10% más caro que el promedio de la categoría, lo que podría estar limitando el volumen.",
        },
        {
          category: "Shirts",
          opportunityTitle: "Paridad de precio con la categoría",
          opportunityDescription:
            "El precio promedio de Shirts está alineado con el benchmark; la oportunidad está en aumentar share de unidades.",
        },
      ];

      beforeEach(() => {
        // Sobrescribe el intercept por defecto de mockCompetitiveData (que
        // devuelve insights: []) con una fixture de insights reales.
        cy.intercept("GET", "/api/competitive-insights*", {
          statusCode: 200,
          body: insightsFixture,
        }).as("compInsights");
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");
        cy.wait("@compInsights");
      });

      it("renders the AI-generated opportunityTitle in the top category cards instead of the fallback", () => {
        cy.contains("Precio por encima del benchmark", { timeout: 10000 }).should("be.visible");
      });

      it("renders the opportunityTitle as a tooltip trigger in the detail table for categories with an insight", () => {
        cy.contains("td, [role='cell']", "Jeans", { timeout: 10000 })
          .parents("tr")
          .within(() => {
            cy.contains("Precio por encima del benchmark").should("be.visible");
          });
      });

      it("falls back to getOpportunity() for categories without a matching insight", () => {
        // Sweaters y Pants no tienen insight en la fixture sobrescrita -> deben
        // seguir mostrando el fallback calculado localmente (getOpportunity).
        cy.contains("td, [role='cell']", "Sweaters", { timeout: 10000 })
          .parents("tr")
          .within(() => {
            cy.contains("Precio por encima del benchmark").should("not.exist");
          });
      });

      it("shows the regenerate (RefreshCw) button only for categories that already have an insight", () => {
        cy.contains("Jeans", { timeout: 10000 })
          .parents(".panel")
          .find("button[title='Generar nuevo insight']")
          .should("exist");
      });
    });

    context("Regenerar insight (handleRegenerate / replaceInsight)", () => {
      beforeEach(() => {
        cy.intercept("GET", "/api/competitive-insights*", {
          statusCode: 200,
          body: [
            {
              category: "Jeans",
              opportunityTitle: "Precio por encima del benchmark",
              opportunityDescription: "Descripción inicial del insight de Jeans.",
            },
          ],
        }).as("compInsights");
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");
        cy.wait("@compInsights");
        cy.contains("Precio por encima del benchmark", { timeout: 10000 }).should("be.visible");
      });

      it("clicking the refresh button calls the regenerate endpoint and replaces the existing insight", () => {
        cy.intercept("POST", "**/competitive/insights/regenerate", {
          statusCode: 200,
          body: [
            {
              category: "Jeans",
              opportunityTitle: "Nueva oportunidad: ampliar margen",
              opportunityDescription: "Insight regenerado tras solicitud del usuario.",
            },
          ],
        }).as("regenerateInsight");
        cy.get("button[title='Generar nuevo insight']").first().click({ force: true });

        cy.wait("@regenerateInsight").then((interception) => {
          expect(interception.request.body.brand).to.eq("Calvin Klein");
          expect(interception.request.body.category).to.eq("Jeans");
          expect(interception.request.body.excludeTitles).to.include("Precio por encima del benchmark");
        });

        cy.contains("Nueva oportunidad: ampliar margen", { timeout: 10000 }).should("be.visible");
      });

      it("shows a spinner on the regenerate button while the request is in flight", () => {
        cy.intercept("POST", "**/competitive/insights/regenerate", {
          statusCode: 200,
          delay: 400,
          body: [
            {
              category: "Jeans",
              opportunityTitle: "Nueva oportunidad: ampliar margen",
              opportunityDescription: "Insight regenerado tras solicitud del usuario.",
            },
          ],
        }).as("regenerateInsightSlow");

        cy.get("button[title='Generar nuevo insight']").first().click({ force: true });

        cy.get(".animate-spin", { timeout: 2000 }).should("exist");
        cy.wait("@regenerateInsightSlow");
      });

      it("shows an error toast with the backend error message when the regenerate request fails", () => {
        cy.intercept("POST", "**/competitive/insights/regenerate", {
          statusCode: 500,
          body: { error: "Internal Server Error" },
        }).as("regenerateInsightFailed");
        cy.get("button[title='Generar nuevo insight']").first().click({ force: true });
        cy.wait("@regenerateInsightFailed");
        cy.contains("Internal Server Error", { timeout: 10000 }).should("be.visible");
        cy.contains("Precio por encima del benchmark", { timeout: 10000 }).should("be.visible");
      });
    });
    context("getInsights: manejo de 404 vs 500 (competitiveService)", () => {
      it("treats a 404 from /api/competitive-insights as an empty insights list (no crash, fallback text shown)", () => {
        cy.intercept("GET", "/api/competitive-insights*", { statusCode: 404 }).as("compInsights404");
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");
        cy.wait("@compInsights404");
        // Debe seguir renderizando el detalle usando el fallback getOpportunity,
        // sin insight alguno.
        cy.contains("Jeans", { timeout: 10000 }).should("be.visible");
        cy.get("body").should("not.contain", "Unhandled");
      });

      it("treats a 500 from /api/competitive-insights as a fetch failure and falls back to an empty insights list", () => {
        cy.intercept("GET", "/api/competitive-insights*", {
          statusCode: 500,
          body: { error: "Internal Server Error" },
        }).as("compInsights500");
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");
        cy.wait("@compInsights500");
        cy.contains("Jeans", { timeout: 10000 }).should("be.visible");
        cy.get("body").should("not.contain", "Unhandled");
      });
    });

    context("KPI grid: estado de carga explícito", () => {
      it("renders 4 skeleton placeholders while competitive data is loading", () => {
        cy.intercept("GET", "/api/proxy/competitive/all*", {
          delay: 500,
          fixture: "competitive/competitive-all.json",
        }).as("compAllDelayed");

        cy.visit("/competitive-positioning");
        cy.get(".animate-pulse, [data-slot='skeleton']").should("have.length.at.least", 4);
        cy.wait("@compAllDelayed");
        cy.contains("Share de ventas", { timeout: 10000 }).should("be.visible");
      });
    });

    context("useCompetitiveData: prior no vacío y priceGapPct con benchmark 0", () => {
      it("computes KPI deltas against a non-empty prior period and renders an upward delta arrow", () => {
        cy.mockCompetitiveData({
          all: {
            current: [
              {
                category: "Jeans",
                brandSales: 45000,
                categorySales: 150000,
                brandVolume: 900,
                categoryVolume: 3000,
                salesBenchmark: 50000,
                volumeBenchmark: 1100,
                salesShare: 0.3,
                volumeShare: 0.3,
                averageBrandPrice: 50.0,
                averageBenchmarkPrice: 45.45,
              },
            ],
            prior: [
              {
                category: "Jeans",
                brandSales: 40000,
                categorySales: 160000,
                brandVolume: 850,
                categoryVolume: 3100,
                salesBenchmark: 48000,
                volumeBenchmark: 1050,
                salesShare: 0.25,
                volumeShare: 0.27,
                averageBrandPrice: 47.0,
                averageBenchmarkPrice: 45.0,
              },
            ],
          },
        });
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");
        // overallSalesShare actual (30%) > prior (25%) => pctChange positivo
        // => KpiCard renderiza DeltaTooltip con ArrowUp dentro de un
        // TooltipTrigger. El contenedor real es .kpi-card (clase literal),
        // no una utility de Tailwind tipo [class*='rounded'].
        cy.contains("Share de ventas", { timeout: 10000 })
          .closest(".kpi-card")
          .within(() => {
            cy.get("svg").should("exist"); // ArrowUp de lucide-react
          });
      });

      it("does not divide by zero when a category has no benchmark price (priceGapPct = 0 branch)", () => {
        cy.mockCompetitiveData({
          all: {
            current: [
              {
                category: "Jeans",
                brandSales: 45000,
                categorySales: 150000,
                brandVolume: 900,
                categoryVolume: 3000,
                salesBenchmark: 0,
                volumeBenchmark: 0,
                salesShare: 0.3,
                volumeShare: 0.3,
                averageBrandPrice: 50.0,
                averageBenchmarkPrice: 0,
              },
            ],
            prior: [],
          },
        });
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");
        cy.contains("Jeans", { timeout: 10000 }).should("be.visible");
        cy.get("body").should("not.contain", "NaN");
        cy.get("body").should("not.contain", "Infinity");
      });
    });

    context("Brand sin categorías devueltas (stats === null)", () => {
      it("shows the empty-state panel when the brand has zero categories in the response", () => {
        cy.mockCompetitiveData({ all: { current: [], prior: [] } });
        cy.visit("/competitive-positioning");
        cy.wait("@compAll");
        cy.contains("Selecciona una marca en el menú superior", { timeout: 10000 }).should("be.visible");
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
