// TC-VAL-003 — Campo obligatorio incompleto en autenticacion (Metabase OSS v0.64.1)
// Plan: "Intentar iniciar sesion mediante la interfaz web proporcionando un correo electronico registrado y
// dejando vacio el campo de contrasena." Esperado: "El sistema no permite completar la autenticacion e informa
// que la informacion requerida esta incompleta, sin conceder acceso a los recursos protegidos."
//
// - Se parte de un contexto SIN sesion (cookies y almacenamiento borrados; /api/user/current = 401).
// - Solo se escribe el correo de Usuario QA (CYPRESS_QA_EMAIL, del .env local). La contrasena NO se usa.
// - El envio se intenta con el mecanismo normal de la interfaz (boton o Enter), sin forzar el DOM.
// - POST /api/session se OBSERVA (sin modificarlo) para saber si el formulario llega a enviarse.
// - Se registra que mecanismo de validacion aplica la version evaluada (boton deshabilitado, validacion nativa
//   del navegador y/o mensaje de Metabase) sin presuponer un texto concreto.
// Selectores (LoginForm de v0.64.1): input[name="username"], input[name="password"], button[type="submit"].

describe('TC-VAL-003 - Campo obligatorio incompleto en autenticacion', { testIsolation: false }, () => {
  const ref = { solicitudesSesion: [], excepciones: [] };
  let correo;

  const estadoFormulario = (etiqueta) => cy.document().then((d) => {
    const u = d.querySelector('input[name="username"]');
    const p = d.querySelector('input[name="password"]');
    const b = d.querySelector('button[type="submit"]');
    const form = p && p.closest('form');
    const mensajes = [...d.querySelectorAll('[role="alert"], [class*="-error"], [class*="Error"], [data-testid*="error"]')]
      .map((e) => e.innerText.trim()).filter(Boolean);
    ref[etiqueta] = {
      ruta: d.location.pathname,
      correo_introducido: u ? u.value === correo : null,
      contrasena_vacia: p ? p.value === '' : null,
      contrasena_required: p ? p.required : null,
      contrasena_valida_nativa: p ? p.checkValidity() : null,
      contrasena_value_missing: p ? p.validity.valueMissing : null,
      contrasena_mensaje_nativo: p ? p.validationMessage : null,
      contrasena_aria_invalid: p ? p.getAttribute('aria-invalid') : null,
      formulario_novalidate: form ? form.noValidate : null,
      boton_texto: b ? b.innerText.trim() : null,
      boton_habilitado: b ? !b.disabled : null,
      mensajes_visibles: mensajes,
    };
  });

  before(() => {
    cy.on('uncaught:exception', (err) => { ref.excepciones.push(String(err && err.message).slice(0, 300)); return false; });
    cy.env(['QA_EMAIL'], { log: false }).then(({ QA_EMAIL }) => {
      expect(Boolean(QA_EMAIL), 'precondicion: correo de Usuario QA definido').to.eq(true);
      correo = String(QA_EMAIL);
    });
    // Contexto limpio: sin cookies ni datos de autenticacion previos
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  it('1. Metabase disponible y el contexto de Cypress no tiene sesion autenticada', () => {
    cy.request('/api/health').its('body.status').should('eq', 'ok');
    cy.getCookies().then((c) => expect(c.map((x) => x.name), 'sin cookie de sesion').not.to.include('metabase.SESSION'));
    cy.request({ url: '/api/user/current', failOnStatusCode: false }).its('status').should('eq', 401);
  });

  it('2. La pantalla de inicio de sesion muestra el formulario', () => {
    cy.intercept('POST', '/api/session', (req) => {
      // Solo se registra si hubo envio y si llevaba contrasena (nunca su valor)
      ref.solicitudesSesion.push({ con_contrasena: Boolean(req.body && req.body.password) });
    }).as('login');
    cy.visit('/auth/login');
    cy.location('pathname').should('eq', '/auth/login');
    cy.get('input[name="username"]').should('be.visible').and('have.attr', 'type', 'email');
    cy.get('input[name="password"]').should('be.visible').and('have.attr', 'type', 'password').and('have.value', '');
    cy.get('button[type="submit"]').should('be.visible');
    estadoFormulario('inicial');
  });

  it('3. Se introduce el correo registrado de Usuario QA y la contrasena queda vacia', () => {
    cy.get('input[name="username"]').clear().type(correo);
    cy.get('input[name="username"]').should(($i) => expect($i.val(), 'correo introducido').to.eq(correo));
    cy.get('input[name="password"]').should('have.value', '');
    // Se toca el campo de contrasena sin escribir nada (interaccion normal) para que la interfaz pueda validarlo
    cy.get('input[name="password"]').focus().blur();
    estadoFormulario('conCorreo');
    cy.screenshot('01-correo-introducido-contrasena-vacia', { capture: 'viewport' });
  });

  it('4. Se intenta enviar el formulario con el mecanismo normal de la interfaz', () => {
    cy.then(() => {
      if (ref.conCorreo.boton_habilitado) {
        ref.intentoEnvio = 'boton habilitado: se pulsa el boton de inicio de sesion';
        cy.get('button[type="submit"]').click();
      } else {
        ref.intentoEnvio = 'boton deshabilitado: se intenta enviar con la tecla Enter en el campo de contrasena';
        cy.get('input[name="password"]').type('{enter}');
      }
    });
    cy.wait(1500, { log: false });
    estadoFormulario('trasEnvio');
    cy.screenshot('02-respuesta-de-validacion', { capture: 'viewport' });
  });

  it('5. La autenticacion no se completa y existe una senal verificable de informacion obligatoria', () => {
    cy.location('pathname').should('eq', '/auth/login');
    cy.get('[data-testid="app-bar"]').should('not.exist');
    cy.get('input[name="password"]').should('have.value', '');
    cy.then(() => {
      const t = ref.trasEnvio;
      const solicitudesSinContrasena = ref.solicitudesSesion.filter((s) => !s.con_contrasena);
      ref.mecanismos = [];
      if (t.boton_habilitado === false) { ref.mecanismos.push('boton de envio deshabilitado mientras falta la contrasena'); }
      if (t.contrasena_required && t.contrasena_value_missing) { ref.mecanismos.push(`campo obligatorio nativo (required, valueMissing; mensaje del navegador: "${t.contrasena_mensaje_nativo}")`); }
      if (t.contrasena_aria_invalid === 'true') { ref.mecanismos.push('campo marcado como invalido (aria-invalid)'); }
      if (t.mensajes_visibles.length) { ref.mecanismos.push(`mensaje de Metabase: ${t.mensajes_visibles.join(' | ')}`); }
      expect(ref.solicitudesSesion.length, 'solicitudes de inicio de sesion enviadas').to.eq(0);
      expect(solicitudesSinContrasena.length, 'solicitudes enviadas sin contrasena').to.eq(0);
      expect(ref.mecanismos.length, 'senal verificable de informacion obligatoria').to.be.gt(0);
      expect(ref.excepciones, 'excepciones no controladas').to.deep.eq([]);
    });
  });

  it('6. No se establece una sesion autenticada', () => {
    cy.getCookies().then((c) => {
      ref.cookies = c.map((x) => x.name); // solo nombres, nunca valores
      expect(ref.cookies, 'sin cookie de sesion metabase.SESSION').not.to.include('metabase.SESSION');
    });
    cy.request({ url: '/api/user/current', failOnStatusCode: false }).then((r) => {
      ref.usuarioActual = r.status;
      expect(r.status, 'GET /api/user/current sin sesion').to.eq(401);
    });
  });

  it('7. Los recursos protegidos no son accesibles: la API los rechaza y la interfaz redirige al inicio de sesion', () => {
    cy.readFile('configuracion/recursos-locales.json').then((cfg) => {
      ref.recursos = [`/api/card/${cfg.preguntas.conteo_pedidos}`, `/api/dashboard/${cfg.dashboard_principal_id}`, `/api/collection/${cfg.coleccion_qa_id}`];
      ref.paginas = [`/collection/${cfg.coleccion_qa_id}`, `/dashboard/${cfg.dashboard_principal_id}`];
    });
    cy.then(() => {
      ref.respuestasApi = {};
      ref.recursos.forEach((u) => cy.request({ url: u, failOnStatusCode: false }).then((r) => {
        ref.respuestasApi[u.replace(/\d+$/, '{id}')] = r.status;
        expect(r.status, `${u.replace(/\d+$/, '{id}')} sin sesion`).to.eq(401);
      }));
      ref.redirecciones = {};
      ref.paginas.forEach((p) => {
        cy.visit(p);
        cy.location('pathname', { timeout: 20000 }).should('eq', '/auth/login');
        cy.location('search').then((s) => { ref.redirecciones[p.replace(/\d+$/, '{id}')] = `/auth/login${s}`; });
        cy.get('input[name="password"]').should('be.visible');
        cy.get('[data-testid="app-bar"]').should('not.exist');
      });
    });
    cy.screenshot('03-acceso-protegido-denegado', { capture: 'viewport' });
    cy.then(() => {
      const dirResultados = String(Cypress.config('screenshotsFolder')).replace(/([\\/])evidencias([\\/])/, '$1resultados$2');
      const sinCorreo = (o) => JSON.parse(JSON.stringify(o));
      cy.writeFile(`${dirResultados}/comportamiento-formulario.json`, {
        cuenta: 'usuario-qa (Usuario QA); solo se introdujo el correo; contrasena vacia',
        formulario_inicial: sinCorreo(ref.inicial),
        formulario_con_correo: sinCorreo(ref.conCorreo),
        intento_de_envio: ref.intentoEnvio,
        formulario_tras_intento: sinCorreo(ref.trasEnvio),
        solicitudes_post_api_session: ref.solicitudesSesion.length,
        mecanismos_de_validacion: ref.mecanismos,
        cookies_tras_intento: ref.cookies,
        api_user_current: ref.usuarioActual,
        recursos_protegidos_api: ref.respuestasApi,
        paginas_protegidas_redirigen_a: ref.redirecciones,
        excepciones_no_controladas: ref.excepciones,
      });
    });
  });

  afterEach(function detenerSiFalla() {
    if (this.currentTest.state === 'failed') { Cypress.stop(); }
  });
});
