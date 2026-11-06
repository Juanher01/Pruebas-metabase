// TC-FUN-001 — Inicio de sesion con credenciales validas (Metabase OSS v0.64.1)
// Plan: "Ingresar mediante la interfaz web utilizando el correo electronico y la contrasena
// de un usuario registrado y activo." Esperado: "El sistema autentica al usuario y permite
// acceder a las funcionalidades correspondientes a su cuenta."
//
// Cuenta: usuario-qa ("Usuario QA"). Credenciales: CYPRESS_QA_EMAIL / CYPRESS_QA_PASSWORD,
// definidas solo para el proceso por scripts/ejecutar-herramienta.ps1 desde el .env local.
// La autenticacion se realiza por la INTERFAZ (formulario /auth/login). Las llamadas a la API
// solo se usan para comprobar disponibilidad, identidad de la sesion y cerrar la sesion al final.
//
// Selectores verificados en el codigo fuente de v0.64.1:
//   LoginForm.tsx: input[name="username"], input[name="password"], boton type=submit
//   AppBar.tsx:    [data-testid="app-bar"] (barra principal de la aplicacion autenticada)

describe('TC-FUN-001 - Inicio de sesion con credenciales validas', { testIsolation: false }, () => {
  let correo;

  before(() => {
    cy.env(['QA_EMAIL', 'QA_PASSWORD'], { log: false }).then(({ QA_EMAIL, QA_PASSWORD }) => {
      // Sin credenciales no hay evaluacion valida: falla la preparacion, no el caso.
      expect(Boolean(QA_EMAIL), 'precondicion: QA_EMAIL definido').to.eq(true);
      expect(Boolean(QA_PASSWORD), 'precondicion: QA_PASSWORD definido').to.eq(true);
      correo = String(QA_EMAIL).toLowerCase();
    });
    cy.clearCookies();
  });

  it('1. Metabase esta disponible (GET /api/health = ok)', () => {
    cy.request('/api/health').then((r) => {
      expect(r.status, 'codigo HTTP de /api/health').to.eq(200);
      expect(r.body.status, 'estado de salud').to.eq('ok');
    });
  });

  it('2. La pagina de inicio de sesion muestra los campos de correo y contrasena', () => {
    cy.visit('/auth/login');
    cy.location('pathname').should('eq', '/auth/login');
    cy.get('input[name="username"]').should('be.visible').and('have.attr', 'type', 'email');
    cy.get('input[name="password"]').should('be.visible').and('have.attr', 'type', 'password');
    cy.get('button[type="submit"]').should('be.visible');
    cy.screenshot('01-formulario-inicio-sesion', { capture: 'viewport' });
  });

  it('3. El formulario envia credenciales validas de Usuario QA y la autenticacion responde 200', () => {
    cy.intercept('POST', '/api/session').as('login');
    cy.env(['QA_EMAIL', 'QA_PASSWORD'], { log: false }).then(({ QA_EMAIL, QA_PASSWORD }) => {
      cy.get('input[name="username"]').clear().type(QA_EMAIL);
      cy.get('input[name="password"]').clear().type(QA_PASSWORD, { log: false });
    });
    cy.get('button[type="submit"]').should('be.enabled').click();
    cy.wait('@login', { timeout: 30000 }).then(({ response }) => {
      expect(response.statusCode, 'codigo HTTP de POST /api/session desde la interfaz').to.eq(200);
      // Solo se comprueba la existencia del identificador; su valor no se registra.
      expect(Boolean(response.body && response.body.id), 'la respuesta incluye un identificador de sesion').to.eq(true);
    });
  });

  it('4. Se accede a una pagina autenticada (fuera de /auth/login y con la barra principal)', () => {
    cy.location('pathname', { timeout: 30000 }).should('not.include', '/auth/login');
    cy.get('[data-testid="app-bar"]', { timeout: 30000 }).should('be.visible');
    cy.screenshot('02-pagina-autenticada', { capture: 'viewport' });
  });

  it('5. La sesion corresponde a Usuario QA (GET /api/user/current con la sesion del navegador)', () => {
    cy.request('/api/user/current').then(({ status, body }) => {
      expect(status, 'codigo HTTP de /api/user/current').to.eq(200);
      expect(String(body.email).toLowerCase(), 'correo de la sesion').to.eq(correo);
      expect(body.first_name, 'nombre').to.eq('Usuario');
      expect(body.last_name, 'apellido').to.eq('QA');
      expect(body.is_active, 'cuenta activa').to.eq(true);
      expect(body.is_superuser, 'cuenta normal (no administradora)').to.eq(false);
    });
  });

  it('6. No se permanece en el formulario ni aparece un error de autenticacion', () => {
    cy.location('pathname').should('not.include', '/auth/');
    cy.get('input[name="password"]').should('not.exist');
    cy.get('input[name="username"]').should('not.exist');
    cy.get('[data-testid="app-bar"]').should('be.visible');
    cy.screenshot('03-sesion-activa-sin-errores', { capture: 'viewport' });
  });

  after(() => {
    // Limpieza (no forma parte de la evaluacion): cerrar la sesion creada por la interfaz
    // y comprobar que ya no es valida.
    cy.request({ method: 'DELETE', url: '/api/session', failOnStatusCode: false });
    cy.request({ url: '/api/user/current', failOnStatusCode: false }).its('status').should('eq', 401);
  });
});
