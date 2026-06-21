/*
 * E2E Tests: Profile Page (/perfil)
 */
describe("Profile Page (/perfil)", () => {
  context("Role: Retailer Admin", () => {
    beforeEach(() => {
      cy.mockAuthenticatedSession("retailer_admin");
      cy.mockAuth0User({
        name: "Test Admin",
        email: "test-admin@thelook.com",
        picture: "https://example.com/avatar.png",
      });
    });

    context("Initial page load", () => {
      beforeEach(() => {
        cy.visit("/perfil");
        cy.wait(["@userProfile", "@auth0Me"]);
      });

      it("renders the page title and subtitle", () => {
        cy.contains("h1", "Perfil").should("be.visible");
        cy.contains("Información personal y acceso dentro del retailer.").should("be.visible");
      });

      it("displays the user name and email in the sidebar card", () => {
        cy.contains("Test Admin").should("be.visible");
        cy.contains("test-admin@thelook.com").should("be.visible");
      });

      it("shows the correct role badge for retailer_admin", () => {
        cy.contains("Retailer Admin").should("be.visible");
      });

      it("shows retailer name in the sidebar card", () => {
        cy.contains("TheLook").should("be.visible");
      });

      it("shows active status indicator", () => {
        cy.contains("Activo").should("be.visible");
      });

      it("does not show the brand row when role is retailer_admin", () => {
        cy.contains("Marca asignada").should("not.exist");
      });

      it("displays correct values in the data fields panel", () => {
        cy.get("input#name").should("have.value", "Test Admin");
        cy.get("input#email").should("have.value", "test-admin@thelook.com");
        cy.get("input#role").should("have.value", "Retailer Admin");
        cy.get("input#retailer").should("have.value", "TheLook");
      });

      it("shows loading skeletons while data is being fetched", () => {
        cy.intercept("GET", "/api/users/me", { delay: 400, statusCode: 200, body: {
          email: "test-admin@thelook.com",
          name: "Test Admin",
          role: "retailer_admin",
          brand: null,
          isActive: true,
          retailerName: "TheLook",
        }}).as("userProfileDelayed");

        cy.visit("/perfil");
        cy.get(".animate-pulse").should("exist");
        cy.wait("@userProfileDelayed");
      });
    });
  });

  context("Role: Brand User", () => {
    beforeEach(() => {
      cy.mockAuthenticatedSession("brand");
      cy.mockAuth0User({
        name: "Brand User",
        email: "brand@thelook.com",
      });
      cy.visit("/perfil");
      cy.wait(["@userProfile", "@auth0Me"]);
    });

    it("shows the correct role badge for brand", () => {
      cy.contains("Marca").should("be.visible");
    });

    it("shows the brand row with the assigned brand name", () => {
      cy.contains("Marca asignada").should("be.visible");
      cy.get("input#brand").should("have.value", "Calvin Klein");
    });

    it("shows the brand name in the sidebar card", () => {
      cy.get("body").contains("Calvin Klein").should("be.visible");
    });

    it("displays correct values in the data fields panel", () => {
      cy.get("input#name").should("have.value", "Brand User");
      cy.get("input#email").should("have.value", "brand@thelook.com");
      cy.get("input#role").should("have.value", "Marca");
      cy.get("input#retailer").should("have.value", "TheLook");
    });
  });

  context("Inactive user", () => {
    beforeEach(() => {
      cy.intercept("GET", "/api/users/me", {
        statusCode: 200,
        body: {
          email: "inactive@thelook.com",
          name: "Inactive User",
          role: "retailer_admin",
          brand: null,
          isActive: false,
          retailerName: "TheLook",
        },
      }).as("userProfile");
      cy.mockAuth0User({ name: "Inactive User", email: "inactive@thelook.com" });
      cy.intercept("GET", "/api/proxy/filters", { fixture: "filters.json" }).as("filters");
      cy.visit("/perfil");
      cy.wait(["@userProfile", "@auth0Me"]);
    });

    it("shows inactive status", () => {
      cy.contains("Inactivo").should("be.visible");
    });
  });

  context("Avatar fallback and initials", () => {
    it("shows initials fallback when user has no picture", () => {
        cy.mockAuthenticatedSession("retailer_admin");
        cy.intercept("GET", "/api/auth/me", {
        statusCode: 200,
        body: {
            name: "Test Admin",
            email: "test-admin@thelook.com",
            picture: "",
            sub: "auth0|test123",
        },
        }).as("auth0Me");

        cy.visit("/perfil");
        cy.wait(["@userProfile", "@auth0Me"]);

        // AvatarFallback muestra las iniciales
        cy.contains("TA").should("be.visible");
    });

    it("shows single initial when name is one word", () => {
        cy.mockAuthenticatedSession("retailer_admin");
        cy.intercept("GET", "/api/auth/me", {
        statusCode: 200,
        body: {
            name: "Admin",
            email: "test-admin@thelook.com",
            picture: "",
            sub: "auth0|test123",
        },
        }).as("auth0Me");
        cy.intercept("GET", "/api/users/me", {
        statusCode: 200,
        body: {
            email: "test-admin@thelook.com",
            name: "Admin",
            role: "retailer_admin",
            brand: null,
            isActive: true,
            retailerName: "TheLook",
        },
        }).as("userProfile");
        cy.intercept("GET", "/api/proxy/filters", { fixture: "filters.json" }).as("filters");

        cy.visit("/perfil");
        cy.wait(["@userProfile", "@auth0Me"]);

        cy.contains("A").should("be.visible");
        });
    });
    context("Profile is null (no profile loaded)", () => {
        it("shows dashes when profile is not available", () => {
            // Auth0 user existe pero /api/users/me falla
            cy.intercept("GET", "/api/users/me", { statusCode: 500, body: {} }).as("userProfileError");
            cy.intercept("GET", "/api/proxy/filters", { fixture: "filters.json" }).as("filters");
            cy.mockAuth0User({ name: "Test Admin", email: "test-admin@thelook.com" });

            cy.visit("/perfil");
            cy.wait("@auth0Me");

            // profile null -> role input muestra "—"
            cy.get("input#role").should("have.value", "—");
            // profile null -> retailer input muestra "—"
            cy.get("input#retailer").should("have.value", "—");
            // profile null -> retailerName en sidebar muestra "—"
            cy.get("body").contains("—").should("exist");
        });
    });
});