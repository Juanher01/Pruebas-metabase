// TC-VAL-005 — Caracteres especiales en campo de texto (Metabase OSS v0.64.1)
// Plan: "Guardar una pregunta utilizando el nombre Análisis de ventas & costos (2026) y consultar posteriormente el
// recurso creado." Esperado: "El sistema almacena y presenta correctamente el nombre, conservando los caracteres
// especiales y permitiendo recuperar la pregunta sin alteraciones inesperadas."
// Datos: Sample Database > Products, tabla, coleccion QA - Metabase (ID de configuracion/recursos-locales.json).
//
// - Creacion, escritura del nombre, guardado y recuperacion se hacen en la INTERFAZ. La API solo se usa para
//   lecturas de comprobacion.
// - El nombre se compara SIEMPRE por igualdad exacta de cadenas (y codigo a codigo), nunca con contains().
// - POST /api/card y POST /api/card/:id/query se OBSERVAN con cy.intercept sin modificarlos.
// - La pregunta creada se CONSERVA como evidencia.

const api = (opciones, codigos = [200]) => cy.request({ failOnStatusCode: false, ...opciones }).then((r) => {
  expect(codigos, `codigo HTTP de ${opciones.method || 'GET'} ${opciones.url || opciones}`).to.include(r.status);
  return r;
});

const NOMBRE = 'Análisis de ventas & costos (2026)';
const COLECCION = 'QA - Metabase';
const codigos = (s) => [...String(s)].map((c) => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
const exacto = (t) => new RegExp(`^\\s*${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
const abrirBarraLateral = () => cy.get('[data-testid="main-navbar-root"]').then(($n) => {
  const enlaces = $n.find('a[href^="/collection/"]');
  if (!enlaces.length || !Cypress.dom.isVisible(enlaces.first())) { cy.get('[data-testid="sidebar-toggle"]').click(); }
});
const cerrarAvisos = () => cy.get('body').then(($b) => {
  const boton = [...$b.find('[role="dialog"] button')].find((b) => /^(Empezar a explorar|Ahora no|No, gracias|Omitir)$/i.test(String(b.innerText).trim()));
  if (boton) { cy.wrap(boton).click(); }
});

// Comprobacion completa de un nombre observado frente al esperado (igualdad exacta y caracteres especiales)
const comprobarNombre = (observado, contexto) => {
  expect(observado, `${contexto}: igualdad exacta`).to.eq(NOMBRE);
  expect(observado.length, `${contexto}: longitud (sin truncamiento)`).to.eq(NOMBRE.length);
  expect(codigos(observado), `${contexto}: mismos codigos de caracteres`).to.deep.eq(codigos(NOMBRE));
  expect(observado.normalize('NFC'), `${contexto}: forma Unicode NFC`).to.eq(observado);
  expect(observado, `${contexto}: tilde de "Análisis" (U+00E1)`).to.include('Análisis');
  expect(observado, `${contexto}: simbolo &`).to.include(' & ');
  expect(observado, `${contexto}: parentesis y 2026`).to.include('(2026)');
  ['&amp;', '&#38;', '&#x26;', '%26', '&aacute;', 'Ã'].forEach((m) => expect(observado, `${contexto}: sin "${m}"`).not.to.include(m));
};

describe('TC-VAL-005 - Caracteres especiales en campo de texto', { testIsolation: false }, () => {
  const ref = { nombres: {} };

  before(() => {
    cy.env(['QA_EMAIL', 'QA_PASSWORD'], { log: false }).then(({ QA_EMAIL, QA_PASSWORD }) => {
      expect(Boolean(QA_EMAIL) && Boolean(QA_PASSWORD), 'precondicion: credenciales de usuario-qa definidas').to.eq(true);
      cy.request({ method: 'POST', url: '/api/session', body: { username: QA_EMAIL, password: QA_PASSWORD }, log: false, failOnStatusCode: false })
        .then((r) => expect(r.status, 'inicio de sesion por API de usuario-qa').to.eq(200));
    });
  });

  it('1. Disponibilidad, sesion, coleccion de destino y nombre libre (solo lectura)', () => {
    api({ url: '/api/health' }).its('body.status').should('eq', 'ok');
    api({ url: '/api/user/current' }).then(({ body }) => {
      expect(`${body.first_name} ${body.last_name}`, 'usuario de la sesion').to.eq('Usuario QA');
      expect(body.is_superuser, 'cuenta normal').to.eq(false);
    });
    cy.readFile('configuracion/recursos-locales.json').then((cfg) => {
      ref.coleccionId = cfg.coleccion_qa_id;
      ref.dbId = cfg.sample_database_id;
      ref.referencias = Object.values(cfg.preguntas);
      return api({ url: `/api/collection/${cfg.coleccion_qa_id}` });
    }).then(({ body }) => {
      expect(body.name, 'coleccion de destino').to.eq(COLECCION);
      expect(body.can_write, 'precondicion: escritura en la coleccion').to.eq(true);
    });
    cy.then(() => api({ url: `/api/database/${ref.dbId}/metadata` })).then(({ body }) => {
      ref.productsId = body.tables.find((t) => t.name === 'PRODUCTS').id;
    });
    cy.then(() => api({ url: `/api/collection/${ref.coleccionId}/items`, qs: { models: 'card' } })).then(({ body }) => {
      const items = body.data || body;
      expect(items.map((i) => i.name), 'no existe una pregunta con el nombre exacto en la coleccion').not.to.include(NOMBRE);
      ref.previas = items.map((i) => i.id);
    });
    ref.estadoReferencias = {};
    cy.then(() => ref.referencias.forEach((id) => api({ url: `/api/card/${id}` }).then(({ body }) => { ref.estadoReferencias[id] = body.updated_at; })));
    cy.then(() => api({ method: 'POST', url: '/api/dataset', body: { database: ref.dbId, type: 'native', native: { query: 'SELECT COUNT(*) FROM PRODUCTS' } } }, [200, 202]))
      .then(({ body }) => { ref.totalProductos = body.data.rows[0][0]; });
  });

  it('2. Editor grafico: Sample Database > Products, consulta valida con resultados en tabla', () => {
    cy.visit('/');
    cy.get('[data-testid="app-bar"]').contains('button', 'Nuevo').click();
    cy.contains('[role="menu"] *', /^Pregunta$/).click();
    cy.location('pathname', { timeout: 20000 }).should('eq', '/question/notebook');
    cy.get('[data-testid="mini-picker"]', { timeout: 20000 }).should('be.visible').contains('Sample Database').click();
    cy.get('[data-testid="mini-picker"]').contains(/^Products$/).click();
    cy.get('[data-testid="data-step-cell"]', { timeout: 20000 }).should('contain', 'Products');
    cy.intercept('POST', '/api/dataset').as('consulta');
    cy.contains('button', 'Visualizar').click();
    cy.wait('@consulta', { timeout: 60000 }).then((x) => {
      expect(x.response.body.status, 'consulta completada').to.eq('completed');
      expect(x.response.body.data.rows.length, 'resultados de Products').to.eq(ref.totalProductos);
    });
    cy.get('[data-testid="table-root"]', { timeout: 60000 }).should('be.visible');
  });

  it('3. Formulario Guardar: el campo Nombre acepta y contiene exactamente el nombre con caracteres especiales', () => {
    cy.get('[data-testid="qb-save-button"]').should('be.visible').click();
    cy.get('[data-testid="save-question-modal"]').should('be.visible').within(() => {
      cy.get('input[name="name"]').clear().type(NOMBRE, { delay: 20 });
      cy.get('input[name="name"]').should(($i) => {
        ref.nombres.introducido = $i.val();
        expect($i.attr('aria-invalid'), 'campo Nombre no marcado como invalido').not.to.eq('true');
      });
      cy.get('[role="alert"], [class*="-error"]').should('not.exist');
    });
    cy.then(() => comprobarNombre(ref.nombres.introducido, 'nombre introducido en el formulario'));
    cy.get('[data-testid="save-question-modal"] [data-testid="dashboard-and-collection-picker-button"]').click();
    cy.contains('[data-testid="picker-item"]', exacto('Nuestros análisis')).click();
    cy.contains('[data-testid="picker-item"]', exacto(COLECCION)).click();
    cy.get('[data-testid="entity-picker-select-button"]').should('have.text', 'Seleccionar esta colección').click();
    cy.get('[data-testid="save-question-modal"] [data-testid="dashboard-and-collection-picker-button"]').should('contain', COLECCION);
    cy.get('[data-testid="save-question-modal"] input[name="name"]').should('have.value', NOMBRE);
    cy.screenshot('01-formulario-guardar-nombre-completo', { capture: 'viewport' });
  });

  it('4. Se guarda la pregunta: POST /api/card 200 con el nombre exacto en QA - Metabase', () => {
    cy.intercept('POST', '/api/card').as('guardar'); // solo observacion
    cy.get('[data-testid="save-question-modal"] [data-testid="save-question-button"]').should('be.enabled').click();
    cy.wait('@guardar', { timeout: 30000 }).then((x) => {
      expect(x.response.statusCode, 'codigo HTTP de POST /api/card').to.eq(200);
      expect(x.request.body.name, 'nombre enviado al guardar').to.eq(NOMBRE);
      const c = x.response.body;
      expect(ref.previas, 'ID nuevo').not.to.include(c.id);
      expect(c.collection_id, 'coleccion de destino').to.eq(ref.coleccionId);
      expect(c.display, 'visualizacion').to.eq('table');
      ref.cardId = c.id;
      ref.nombres.guardado = c.name;
      ref.entityId = c.entity_id;
    });
    cy.then(() => comprobarNombre(ref.nombres.guardado, 'nombre guardado (respuesta de POST /api/card)'));
    cy.get('[data-testid="save-question-modal"]').should('not.exist');
    cy.location('pathname', { timeout: 20000 }).should((p) => expect(p).to.match(new RegExp(`^/question/${ref.cardId}-`)));
    cerrarAvisos();
    cy.get('[data-testid="saved-question-header-title"]').should(($t) => { ref.nombres.encabezadoTrasGuardar = $t.val(); expect($t.val()).to.eq(NOMBRE); });
    cy.then(() => comprobarNombre(ref.nombres.encabezadoTrasGuardar, 'encabezado tras guardar'));
    cy.screenshot('02-pregunta-guardada', { capture: 'viewport', disableTimersAndAnimations: false });
  });

  it('5. Navegar fuera (Inicio) y localizar la pregunta en QA - Metabase por su nombre exacto', () => {
    abrirBarraLateral();
    cy.get('[data-testid="main-navbar-root"]').contains('a', exacto('Inicio')).should('be.visible').click();
    cy.location('pathname', { timeout: 20000 }).should('eq', '/');
    cy.get('[data-testid="home-page"]', { timeout: 20000 }).should('be.visible');
    abrirBarraLateral();
    cy.get('[data-testid="main-navbar-root"]').contains('a', exacto(COLECCION)).should('be.visible').click();
    cy.location('pathname', { timeout: 20000 }).should('match', new RegExp(`^/collection/${ref.coleccionId}-`));
    // Localizacion por igualdad exacta del texto de la fila (no por coincidencia parcial)
    cy.get('[data-testid="collection-entry-name"]', { timeout: 20000 }).should(($e) => {
      const fila = [...$e].find((e) => e.textContent.trim() === NOMBRE);
      expect(Boolean(fila), 'fila con el nombre exacto').to.eq(true);
    }).then(($e) => {
      const fila = [...$e].find((e) => e.textContent.trim() === NOMBRE);
      ref.nombres.coleccion = fila.textContent.trim();
      ref.hrefColeccion = fila.querySelector('a').getAttribute('href');
      expect(ref.hrefColeccion, 'enlace a la pregunta guardada').to.match(new RegExp(`^/question/${ref.cardId}-`));
      fila.scrollIntoView({ block: 'center' });
    });
    cy.then(() => comprobarNombre(ref.nombres.coleccion, 'nombre en la lista de la coleccion'));
    cy.screenshot('03-pregunta-en-coleccion', { capture: 'viewport' });
  });

  it('6. Se reabre desde la coleccion: nombre exacto, misma consulta y visualizacion, ejecucion correcta', () => {
    cy.intercept('POST', `/api/card/${ref.cardId}/query`).as('recuperar'); // solo observacion
    cy.get('[data-testid="collection-entry-name"]').then(($e) => {
      cy.wrap([...$e].find((e) => e.textContent.trim() === NOMBRE)).find('a').click();
    });
    cy.location('pathname', { timeout: 20000 }).should('match', new RegExp(`^/question/${ref.cardId}-`));
    cy.wait('@recuperar', { timeout: 60000 }).then((x) => {
      expect([200, 202], 'codigo HTTP de la consulta recuperada').to.include(x.response.statusCode);
      expect(x.response.body.status, 'la pregunta recuperada se ejecuta correctamente').to.eq('completed');
      expect(x.response.body.error, 'sin error').to.eq(undefined);
      expect(x.response.body.data.rows.length, 'registros de la pregunta recuperada').to.eq(ref.totalProductos);
      ref.recuperada = { codigo: x.response.statusCode, status: x.response.body.status, filas: x.response.body.data.rows.length };
    });
    cerrarAvisos();
    cy.get('[data-testid="saved-question-header-title"]').should(($t) => { ref.nombres.recuperado = $t.val(); expect($t.val()).to.eq(NOMBRE); });
    cy.then(() => comprobarNombre(ref.nombres.recuperado, 'nombre de la pregunta recuperada'));
    // Titulo de la pestana: se espera a que Metabase sustituya el texto de carga ("Haciendo ciencia...")
    cy.title({ timeout: 30000 }).should('include', NOMBRE).then((t) => { ref.nombres.tituloPestana = t; });
    cy.get('[data-testid="question-table-badges"]').should('contain', 'Products');
    cy.get('[data-testid="table-root"]', { timeout: 60000 }).should('be.visible');
    cy.get('[data-testid="filter-pill"]').should('not.exist');
    cy.get('[data-testid="question-row-count"]').should('contain', String(ref.totalProductos));
    cy.screenshot('04-pregunta-recuperada-nombre-original', { capture: 'viewport' });
    cy.get('[data-testid="run-button"]').filter(':visible').first().click();
    cy.wait('@recuperar', { timeout: 60000 }).its('response.body.status').should('eq', 'completed');
    cy.get('[data-testid="table-root"]', { timeout: 60000 }).should('be.visible');
    cy.screenshot('05-consulta-ejecutada-tras-recuperar', { capture: 'viewport' });
  });

  it('7. Lectura por API del recurso: nombre exacto, consulta y visualizacion conservadas; referencias intactas', () => {
    api({ url: `/api/card/${ref.cardId}` }).then(({ body }) => {
      ref.nombres.api = body.name;
      expect(body.collection_id, 'coleccion').to.eq(ref.coleccionId);
      expect(body.display, 'visualizacion').to.eq('table');
      expect(body.archived, 'activa').to.eq(false);
      const dq = body.dataset_query;
      const etapa = dq.stages ? dq.stages[0] : dq.query;
      expect(etapa['source-table'], 'tabla PRODUCTS').to.eq(ref.productsId);
      expect((etapa.filters || []).length, 'sin filtros').to.eq(0);
    });
    cy.then(() => comprobarNombre(ref.nombres.api, 'nombre devuelto por GET /api/card/:id'));
    cy.then(() => {
      expect(ref.nombres.tituloPestana.split(' · ')[0], 'titulo de la pestana del navegador = nombre exacto').to.eq(NOMBRE);
      ref.referencias.forEach((id) => api({ url: `/api/card/${id}` }).its('body.updated_at').should('eq', ref.estadoReferencias[id]));
    });
    cy.then(() => {
      const dirResultados = String(Cypress.config('screenshotsFolder')).replace(/([\\/])evidencias([\\/])/, '$1resultados$2');
      cy.writeFile(`${dirResultados}/comparacion-nombres.json`, {
        nombre_esperado: NOMBRE,
        longitud_esperada: NOMBRE.length,
        codigos_esperados: codigos(NOMBRE),
        nombres_observados: ref.nombres,
        todos_exactos: Object.entries(ref.nombres).filter(([k]) => k !== 'tituloPestana').every(([, v]) => v === NOMBRE),
        pregunta: { id: ref.cardId, entity_id: ref.entityId, coleccion: { id: ref.coleccionId, nombre: COLECCION }, enlace_en_coleccion: ref.hrefColeccion },
        consulta_recuperada: ref.recuperada,
        registros_fuente: ref.totalProductos,
        conservada_como_evidencia: true,
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
