describe("Autenticación - Flujo de Auth0", () => {
  context("Usuario no autenticado", () => {
    beforeEach(() => {
      // limpiar sesión Auth0 antes de cada test
      cy.clearSession();
    });

    it("redirige /competitive-positioning a /login cuando no hay sesión", () => {
      cy.visit("/competitive-positioning", { failOnStatusCode: false });
      cy.url().should("include", "/login");
    });

    it("la página de login muestra el botón de Google", () => {
      cy.visit("/login");
      cy.contains(
        /iniciar sesión|sign in|continuar con google|google/i
      ).should("be.visible");
    });

    it("las rutas del dashboard redirigen a /login", () => {
      const protectedRoutes = [
        "/dashboard",
        "/competitive-positioning",
        "/sales",
      ];
      protectedRoutes.forEach((route) => {
        cy.visit(route, { failOnStatusCode: false });
        cy.url().should("include", "/login");
      });
    });
  });
  context("Logout", () => {
    it("el endpoint /api/auth/logout responde", () => {
      cy.request({
        url: "/api/auth/logout",
        followRedirect: false,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 302, 307]);
      });
    });
  });

  // TODO: Protección de endpoints API
  /*
  context("Protección de endpoints API (sin sesión)", () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.window().then((win) => win.sessionStorage.clear()).then(() => {});
    });

    it("/api/proxy/competitive/all retorna 401 o 500 sin token", () => {
      cy.request({
        method: "GET",
        url: "/api/proxy/competitive/all",
        failOnStatusCode: false,
        headers: {
          Cookie: "",
        },
      }).then((response) => {
        expect(response.status).to.not.eq(200);
      });
    });

    it("/api/proxy/competitive/performance-cards retorna error sin token", () => {
      cy.request({
        method: "GET",
        url: "/api/proxy/competitive/performance-cards",
        qs: { brand: "TestBrand" },
        failOnStatusCode: false,
        headers: {
          Cookie: "",
        },
      }).then((response) => {
        expect(response.status).to.not.eq(200);
      });
    });
  });
  */
});