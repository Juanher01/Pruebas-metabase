// TC-VAL-002 — Parametro invalido en filtro numerico (Metabase OSS v0.64.1)
// Plan: "Intentar introducir un valor alfabetico, como abc, en un filtro que requiere informacion numerica."
// Esperado: "El sistema impide utilizar el valor como una entrada numerica valida o informa de su
// incompatibilidad, sin producir errores inesperados ni resultados incorrectos."
// Datos: Sample Database > Orders > Subtotal (numerica), operador "Mayor que", valor invalido "abc".
//
// La prueba OBSERVA el comportamiento sin presuponerlo y lo clasifica:
//   A) bloqueo de caracteres: el control no admite "abc";
//   B) validacion explicita: admite el texto pero lo senala como invalido o impide confirmar el filtro;
//   C) error funcional: acepta "abc" como numero valido o ejecuta una consulta con el valor invalido.
// - Interaccion real (cy.type, una tecla cada vez); NO se fuerzan valores en el DOM ni el estado interno.
// - POST /api/dataset se OBSERVA (sin modificarlo) para detectar cualquier consulta con el valor invalido.
// - No se guarda ninguna pregunta.

const api = (opciones, codigos = [200]) => cy.request({ failOnStatusCode: false, ...opciones }).then((r) => {
  expect(codigos, `codigo HTTP de ${opciones.method || 'GET'} ${opciones.url || opciones}`).to.include(r.status);
  return r;
});

const INVALIDO = 'abc';
const CAMPO = 'input[aria-label="Valor del filtro"]';
const SELECTOR_MENSAJES = '[role="alert"], [class*="-error"], [class*="Error"]';

describe('TC-VAL-002 - Parametro invalido en filtro numerico', { testIsolation: false }, () => {
  const ref = { pulsaciones: [], consultas: [], excepciones: [] };

  before(() => {
    // Excepciones no controladas de la aplicacion: se registran (y se evaluan en la prueba 6)
    cy.on('uncaught:exception', (err) => { ref.excepciones.push(String(err && err.message).slice(0, 300)); return false; });
    cy.env(['QA_EMAIL', 'QA_PASSWORD'], { log: false }).then(({ QA_EMAIL, QA_PASSWORD }) => {
      expect(Boolean(QA_EMAIL) && Boolean(QA_PASSWORD), 'precondicion: credenciales de usuario-qa definidas').to.eq(true);
      cy.request({ method: 'POST', url: '/api/session', body: { username: QA_EMAIL, password: QA_PASSWORD }, log: false, failOnStatusCode: false })
        .then((r) => expect(r.status, 'inicio de sesion por API de usuario-qa').to.eq(200));
    });
  });

  it('1. Metabase disponible, sesion de Usuario QA y Subtotal es una columna numerica', () => {
    api({ url: '/api/health' }).its('body.status').should('eq', 'ok');
    api({ url: '/api/user/current' }).then(({ body }) => {
      expect(`${body.first_name} ${body.last_name}`, 'usuario de la sesion').to.eq('Usuario QA');
      expect(body.is_superuser, 'cuenta normal').to.eq(false);
    });
    cy.readFile('configuracion/recursos-locales.json').then((cfg) => api({ url: `/api/database/${cfg.sample_database_id}/metadata` }))
      .then(({ body }) => {
        const subtotal = body.tables.find((t) => t.name === 'ORDERS').fields.find((f) => f.name === 'SUBTOTAL');
        ref.tipoCampo = subtotal.base_type;
        expect(subtotal.base_type, 'Subtotal es numerica').to.match(/^type\/(Float|Decimal|Integer|BigInteger|Number)$/);
      });
  });

  it('2. Editor grafico: Orders, filtro sobre Subtotal con el operador Mayor que (selector numerico)', () => {
    // Observacion de TODAS las consultas de la interfaz a partir de aqui (sin modificar la respuesta)
    cy.intercept('POST', '/api/dataset', (req) => { ref.consultas.push(JSON.stringify(req.body)); });
    cy.visit('/');
    cy.get('[data-testid="app-bar"]').contains('button', 'Nuevo').click();
    cy.contains('[role="menu"] *', /^Pregunta$/).click();
    cy.location('pathname', { timeout: 20000 }).should('eq', '/question/notebook');
    cy.get('[data-testid="mini-picker"]', { timeout: 20000 }).should('be.visible').contains('Sample Database').click();
    cy.get('[data-testid="mini-picker"]').contains(/^Orders$/).click();
    cy.get('[data-testid="data-step-cell"]', { timeout: 20000 }).should('contain', 'Orders');
    cy.get('[data-testid="step-filter-0-0"]').contains('Añade filtros para acotar tu respuesta').click();
    cy.get('[data-testid="clause-popover"]').filter(':visible').contains(/^Subtotal$/).click();
    cy.get('[data-testid="number-filter-picker"]', { timeout: 20000 }).should('be.visible').within(() => {
      cy.get('[aria-label="Operador de filtro"]').click();
    });
    cy.contains('[role="menu"] *', /^Mayor que$/).click();
    cy.get('[data-testid="number-filter-picker"]').within(() => {
      cy.get('[aria-label="Operador de filtro"]').should('contain', 'Mayor que');
      cy.get(CAMPO).should('be.visible').and('have.value', '').then(($i) => {
        ref.control = { tag: $i[0].tagName, type: $i.attr('type'), inputmode: $i.attr('inputmode') || null, aria_invalid: $i.attr('aria-invalid') || null };
      });
      cy.get('button[type="submit"]').then(($b) => { ref.botonAntes = { texto: $b.text().trim(), habilitado: !$b.prop('disabled') }; });
    });
    cy.screenshot('01-filtro-numerico-subtotal-mayor-que', { capture: 'viewport' });
  });

  it('3. Se intenta introducir "abc" (interaccion real, tecla por tecla) y se registra la reaccion', () => {
    cy.get('[data-testid="number-filter-picker"]').find(CAMPO).click();
    INVALIDO.split('').forEach((tecla) => {
      cy.get('[data-testid="number-filter-picker"]').find(CAMPO).type(tecla, { delay: 50 });
      cy.get('[data-testid="number-filter-picker"]').then(($p) => {
        const i = $p.find(CAMPO);
        const b = $p.find('button[type="submit"]');
        ref.pulsaciones.push({
          tecla,
          valor_del_control: i.val(),
          aria_invalid: i.attr('aria-invalid') || null,
          mensajes: [...$p.find(SELECTOR_MENSAJES)].map((e) => e.innerText.trim()).filter(Boolean),
          boton_confirmar_habilitado: b.length ? !b.prop('disabled') : null,
        });
      });
    });
    cy.get('[data-testid="number-filter-picker"]').then(($p) => {
      const i = $p.find(CAMPO);
      const b = $p.find('button[type="submit"]');
      ref.trasEscribir = {
        valor_del_control: i.val(),
        contiene_letras: /[a-z]/i.test(String(i.val())),
        aria_invalid: i.attr('aria-invalid') || null,
        mensajes: [...$p.find(SELECTOR_MENSAJES)].map((e) => e.innerText.trim()).filter(Boolean),
        boton_confirmar_habilitado: b.length ? !b.prop('disabled') : null,
        texto_boton: b.text().trim(),
      };
    });
    cy.screenshot('02-intento-de-introducir-abc', { capture: 'viewport' });
  });

  it('4. Se intenta confirmar el filtro (si la interfaz lo permite) y se registra el resultado', () => {
    cy.then(() => {
      if (ref.trasEscribir.boton_confirmar_habilitado) {
        ref.intentoConfirmar = 'boton habilitado: se pulsa Anadir filtro';
        cy.get('[data-testid="number-filter-picker"] button[type="submit"]').click();
      } else {
        // Confirmacion por teclado (Enter) sobre el campo: interaccion real que tampoco debe aplicar el valor
        ref.intentoConfirmar = 'boton deshabilitado: se intenta confirmar con la tecla Enter';
        cy.get('[data-testid="number-filter-picker"]').find(CAMPO).type('{enter}');
      }
    });
    cy.wait(1000, { log: false });
    cy.get('body').then(($b) => {
      const paso = $b.find('[data-testid="step-filter-0-0"]');
      ref.trasConfirmar = {
        selector_sigue_abierto: $b.find('[data-testid="number-filter-picker"]').length > 0,
        texto_paso_filtro: paso.text().replace(/\s+/g, ' ').trim().slice(0, 200),
        paso_filtro_sin_filtros: paso.text().includes('Añade filtros para acotar tu respuesta'),
        paso_filtro_contiene_abc: /abc/i.test(paso.text()),
      };
    });
    cy.screenshot('03-reaccion-al-intento-de-confirmar', { capture: 'viewport' });
  });

  it('5. Control: el mismo campo admite un numero valido (sin confirmarlo)', () => {
    // Demuestra que el bloqueo/validacion es selectivo y no un campo inutilizable. No se anade el filtro.
    cy.get('body').then(($b) => {
      if (!$b.find('[data-testid="number-filter-picker"]').length) {
        cy.get('[data-testid="step-filter-0-0"]').contains('Añade filtros para acotar tu respuesta').click();
        cy.get('[data-testid="clause-popover"]').filter(':visible').contains(/^Subtotal$/).click();
      }
    });
    cy.get('[data-testid="number-filter-picker"]').find(CAMPO).clear().type('100');
    cy.get('[data-testid="number-filter-picker"]').then(($p) => {
      ref.control_numero_valido = { valor_del_control: $p.find(CAMPO).val(), boton_confirmar_habilitado: !$p.find('button[type="submit"]').prop('disabled') };
    });
    cy.then(() => {
      expect(ref.control_numero_valido.valor_del_control, 'el campo admite un numero').to.eq('100');
      expect(ref.control_numero_valido.boton_confirmar_habilitado, 'con un numero valido se puede confirmar').to.eq(true);
    });
    cy.get('[data-testid="number-filter-picker"]').find(CAMPO).clear();
    cy.get('body').type('{esc}');
  });

  it('6. Clasificacion: "abc" no se aplica como numero valido, sin consultas con el valor ni errores inesperados', () => {
    cy.get('[data-testid="step-filter-0-0"]').should('contain', 'Añade filtros para acotar tu respuesta').and('not.contain', 'abc');
    cy.then(() => {
      const t = ref.trasEscribir;
      const consultasConInvalido = ref.consultas.filter((c) => /"abc"|\babc\b/i.test(c));
      let escenario;
      if (!t.contiene_letras) { escenario = 'A'; } else if (t.aria_invalid === 'true' || t.mensajes.length || !t.boton_confirmar_habilitado) { escenario = 'B'; } else { escenario = 'C'; }
      if (ref.trasConfirmar.paso_filtro_contiene_abc || consultasConInvalido.length) { escenario = 'C'; }
      ref.escenario = escenario;
      ref.consultasConInvalido = consultasConInvalido.length;
      expect(ref.trasConfirmar.paso_filtro_contiene_abc, 'el filtro no queda aplicado con "abc"').to.eq(false);
      expect(consultasConInvalido.length, 'consultas enviadas con el valor invalido').to.eq(0);
      expect(ref.excepciones, 'excepciones no controladas de la aplicacion').to.deep.eq([]);
      expect(escenario, `escenario observado (${escenario})`).to.be.oneOf(['A', 'B']);
      const dirResultados = String(Cypress.config('screenshotsFolder')).replace(/([\\/])evidencias([\\/])/, '$1resultados$2');
      cy.writeFile(`${dirResultados}/comportamiento-entrada-invalida.json`, {
        valor_invalido: INVALIDO,
        columna: { nombre: 'Subtotal', tipo: ref.tipoCampo, selector: 'number-filter-picker' },
        operador: 'Mayor que',
        control: ref.control,
        boton_confirmar_antes_de_escribir: ref.botonAntes,
        pulsaciones: ref.pulsaciones,
        tras_escribir_abc: ref.trasEscribir,
        intento_de_confirmar: ref.intentoConfirmar,
        tras_intentar_confirmar: ref.trasConfirmar,
        control_numero_valido: ref.control_numero_valido,
        consultas_observadas: ref.consultas.length,
        consultas_con_valor_invalido: ref.consultasConInvalido,
        excepciones_no_controladas: ref.excepciones,
        escenario: ref.escenario,
      });
    });
  });

  afterEach(function detenerSiFalla() {
    if (this.currentTest.state === 'failed') { Cypress.stop(); }
  });

  after(() => {
    cy.request({ method: 'DELETE', url: '/api/session', failOnStatusCode: false });
    cy.request({ url: '/api/user/current', failOnStatusCode: false }).its('status').should('eq', 401);
  });
});
