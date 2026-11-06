// TC-FUN-010 — Verificacion COMPLEMENTARIA en la interfaz (Cypress) de la ejecucion principal con Newman.
// La ejecucion principal del caso es la coleccion TC-FUN-010.postman_collection.json (POST /api/card/{id}/query).
// Esta especificacion:
//   1. lee el valor devuelto por la API en la ultima ejecucion de Newman (newman-results.json, solo lectura);
//   2. abre la MISMA pregunta guardada desde la interfaz (barra lateral > QA - Metabase > pregunta) y lee el
//      valor presentado;
//   3. compara ambos valores entre si y con una referencia SQL de solo lectura sobre la misma fuente.
// No modifica la pregunta (se comprueba su updated_at antes y despues).

const api = (opciones, codigos = [200]) => cy.request({ failOnStatusCode: false, ...opciones }).then((r) => {
  expect(codigos, `codigo HTTP de ${opciones.method || 'GET'} ${opciones.url || opciones}`).to.include(r.status);
  return r;
});

const ORIGEN = 'QA - Metabase';
const PREGUNTA = 'QA - Conteo de pedidos';
const normalizar = (s) => String(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const exacto = (t) => new RegExp(`^\\s*${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
const entero = (t) => parseInt(String(t).replace(/[^\d-]/g, ''), 10);
const abrirBarraLateral = () => cy.get('[data-testid="main-navbar-root"]').then(($n) => {
  const enlaces = $n.find('a[href^="/collection/"]');
  if (!enlaces.length || !Cypress.dom.isVisible(enlaces.first())) { cy.get('[data-testid="sidebar-toggle"]').click(); }
});
const cerrarAvisos = () => cy.get('body').then(($b) => {
  const boton = [...$b.find('[role="dialog"] button')].find((b) => /^(Empezar a explorar|Ahora no|No, gracias|Omitir)$/i.test(normalizar(b.innerText)));
  if (boton) { cy.wrap(boton).click(); }
});

describe('TC-FUN-010 - Verificacion complementaria: resultado de la pregunta en la interfaz vs API (Newman)', { testIsolation: false }, () => {
  const ref = {};

  before(() => {
    cy.env(['QA_EMAIL', 'QA_PASSWORD'], { log: false }).then(({ QA_EMAIL, QA_PASSWORD }) => {
      expect(Boolean(QA_EMAIL) && Boolean(QA_PASSWORD), 'precondicion: credenciales de usuario-qa definidas').to.eq(true);
      cy.request({ method: 'POST', url: '/api/session', body: { username: QA_EMAIL, password: QA_PASSWORD }, log: false, failOnStatusCode: false })
        .then((r) => expect(r.status, 'inicio de sesion por API de usuario-qa').to.eq(200));
    });
  });

  it('1. Disponibilidad, sesion y pregunta de la configuracion local (solo lectura)', () => {
    api({ url: '/api/health' }).its('body.status').should('eq', 'ok');
    api({ url: '/api/user/current' }).then(({ body }) => {
      expect(`${body.first_name} ${body.last_name}`, 'usuario de la sesion').to.eq('Usuario QA');
      expect(body.is_superuser, 'cuenta normal').to.eq(false);
    });
    cy.readFile('configuracion/recursos-locales.json').then((cfg) => {
      ref.cardId = cfg.preguntas.conteo_pedidos;
      ref.dbId = cfg.sample_database_id;
      expect(Number.isInteger(ref.cardId), 'preguntas.conteo_pedidos definido').to.eq(true);
      return api({ url: `/api/card/${ref.cardId}` });
    }).then(({ body }) => {
      expect(body.name, 'pregunta configurada').to.eq(PREGUNTA);
      ref.actualizada = body.updated_at;
    });
  });

  it('2. Valor devuelto por la API en la ejecucion principal de Newman (newman-results.json)', () => {
    // Esta verificacion se ejecuta inmediatamente despues de Newman: la ejecucion de Newman comparada es la
    // inmediatamente anterior a esta (<AAAAMMDD>-<integrante>-<NN-1>), en la carpeta de resultados del caso.
    const actual = String(Cypress.config('screenshotsFolder')).split(/[\\/]/).filter(Boolean).pop();
    const m = /^(\d{8}-[a-z]+)-(\d{2})$/.exec(actual);
    expect(Boolean(m) && Number(m[2]) > 1, `identificador de ejecucion actual (${actual}) con una ejecucion anterior`).to.eq(true);
    ref.ejecucionNewman = `${m[1]}-${String(Number(m[2]) - 1).padStart(2, '0')}`;
    ref.archivoNewman = `pruebas/funcionales/TC-FUN-010/resultados/${ref.ejecucionNewman}/newman-results.json`;
    cy.readFile(ref.archivoNewman).then((r) => {
      const ex = r.run.executions[0];
      expect(ex.request.method, 'metodo de la solicitud de Newman').to.eq('POST');
      expect(`/${ex.request.url.path.join('/')}`, 'endpoint de la solicitud de Newman').to.eq(`/api/card/${ref.cardId}/query`);
      const cuerpo = JSON.parse(new TextDecoder('utf-8').decode(new Uint8Array(ex.response.stream.data)));
      ref.api = { codigo: ex.response.code, estado: ex.response.status, status: cuerpo.status, valor: cuerpo.data.rows[0][0], columna: cuerpo.data.cols[0].name, tipo: cuerpo.data.cols[0].base_type, filas: cuerpo.data.rows.length };
      expect(ref.api.status, 'consulta de la API completada').to.eq('completed');
      expect(Number.isInteger(ref.api.valor), 'valor numerico de la API').to.eq(true);
    });
  });

  it('3. La misma pregunta abierta desde la interfaz presenta su resultado', () => {
    cy.visit('/');
    cy.get('[data-testid="home-page"]', { timeout: 30000 }).should('be.visible');
    cy.get('[data-testid="main-navbar-root"] a[href^="/collection/"]', { timeout: 30000 }).should('exist');
    abrirBarraLateral();
    cy.get('[data-testid="main-navbar-root"]').contains('a', exacto(ORIGEN)).should('be.visible').click();
    cy.intercept('POST', `/api/card/${ref.cardId}/query`).as('consultaUI'); // solo observacion
    cy.contains('[data-testid="collection-entry-name"]', exacto(PREGUNTA), { timeout: 20000 }).find('a').click();
    cy.location('pathname', { timeout: 20000 }).should('match', new RegExp(`^/question/${ref.cardId}-`));
    cy.wait('@consultaUI', { timeout: 60000 }).then((x) => {
      expect(x.response.body.status, 'consulta de la interfaz completada').to.eq('completed');
      ref.uiRespuesta = { codigo: x.response.statusCode, valor: x.response.body.data.rows[0][0] };
    });
    cerrarAvisos();
    cy.get('[data-testid="saved-question-header-title"]').should('have.value', PREGUNTA);
    cy.get('[data-testid="scalar-value"]', { timeout: 60000 }).should('be.visible').invoke('text').then((t) => {
      ref.uiTexto = normalizar(t);
      ref.uiValor = entero(t);
      expect(Number.isInteger(ref.uiValor), 'valor numerico presentado en la interfaz').to.eq(true);
    });
    cy.screenshot('01-pregunta-en-interfaz-resultado', { capture: 'viewport' });
  });

  it('4. El valor de la API (Newman) coincide con el presentado en la interfaz y con la fuente', () => {
    api({ method: 'POST', url: '/api/dataset', body: { database: ref.dbId, type: 'native', native: { query: 'SELECT COUNT(*) FROM ORDERS' } } }, [200, 202])
      .then(({ body }) => { ref.fuente = body.data.rows[0][0]; });
    cy.then(() => {
      expect(ref.api.valor, 'API (Newman) = valor presentado en la interfaz').to.eq(ref.uiValor);
      expect(ref.uiRespuesta.valor, 'valor presentado = respuesta que recibio la interfaz').to.eq(ref.uiValor);
      expect(ref.api.valor, 'API (Newman) = referencia SQL de la fuente').to.eq(ref.fuente);
    });
    api({ url: `/api/card/${ref.cardId}` }).its('body.updated_at').should('eq', ref.actualizada);
    cy.then(() => {
      const dirResultados = String(Cypress.config('screenshotsFolder')).replace(/([\\/])evidencias([\\/])/, '$1resultados$2');
      cy.writeFile(`${dirResultados}/comparacion-api-interfaz.json`, {
        pregunta: { id: ref.cardId, nombre: PREGUNTA },
        ejecucion_newman_comparada: ref.ejecucionNewman,
        api_newman: ref.api,
        interfaz: { texto_presentado: ref.uiTexto, valor: ref.uiValor, codigo_http_consulta_interfaz: ref.uiRespuesta.codigo, valor_respuesta_interfaz: ref.uiRespuesta.valor },
        referencia_sql_fuente: ref.fuente,
        historico_preparacion: 18760,
        coinciden_api_e_interfaz: ref.api.valor === ref.uiValor,
        pregunta_sin_modificar: true,
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
