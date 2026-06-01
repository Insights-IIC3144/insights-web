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

    it("la página de login renderiza el título principal", () => {
      cy.visit("/login");
      cy.get("h1, h2").first().should("be.visible");
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
  
});