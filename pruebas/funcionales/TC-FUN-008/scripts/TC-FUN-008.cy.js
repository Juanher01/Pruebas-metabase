// TC-FUN-008 — Creacion y organizacion de colecciones (Metabase OSS v0.64.1)
// Plan: "Crear una coleccion y trasladar una pregunta guardada hacia ella mediante una cuenta con permisos
// suficientes." Esperado: "La coleccion se crea correctamente y la pregunta aparece en la ubicacion de
// destino, conservando su contenido y configuracion."
// Datos: pregunta temporal "QA - TC-FUN-008 - Detalle de productos" (Products, sin filtros, tabla) creada en
// "QA - Metabase"; coleccion nueva "QA - TC-FUN-008 - Coleccion de prueba" dentro de "QA - Metabase".
// Cuenta: usuario-qa (Usuario QA), con escritura sobre QA - Metabase (comprobado antes de empezar).
//
// - Creacion de la pregunta, creacion de la coleccion, traslado (Acciones > Mover) y reapertura se hacen en
//   la INTERFAZ. La API solo se usa para lecturas de comprobacion.
// - POST /api/card, POST /api/collection, PUT /api/card/:id y las consultas se OBSERVAN sin modificarlas.
// - Traslado frente a copia: la pregunta debe conservar ID, entity_id y fecha de creacion, existir una sola
//   vez y desaparecer de la coleccion de origen.
// - Los recursos creados se CONSERVAN como evidencia.

const api = (opciones, codigos = [200]) => cy.request({ failOnStatusCode: false, ...opciones }).then((r) => {
  expect(codigos, `codigo HTTP de ${opciones.method || 'GET'} ${opciones.url || opciones}`).to.include(r.status);
  return r;
});

const PREGUNTA_BASE = 'QA - TC-FUN-008 - Detalle de productos';
const COLECCION_BASE = 'QA - TC-FUN-008 - Colección de prueba';
const ORIGEN = 'QA - Metabase';
const normalizar = (s) => String(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const exacto = (t) => new RegExp(`^\\s*${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
const abrirBarraLateral = () => cy.get('[data-testid="main-navbar-root"]').then(($n) => {
  if (!Cypress.dom.isVisible($n.find('a[href^="/collection/"]').first())) { cy.get('[data-testid="sidebar-toggle"]').click(); }
});
const cerrarAvisos = () => cy.get('body').then(($b) => {
  const boton = [...$b.find('[role="dialog"] button')].find((b) => /^(Empezar a explorar|Ahora no|No, gracias|Omitir)$/i.test(normalizar(b.innerText)));
  if (boton) { cy.wrap(boton).click(); }
});
const irAOrigen = () => {
  abrirBarraLateral();
  cy.get('[data-testid="main-navbar-root"]').contains('a', exacto(ORIGEN)).should('be.visible').click();
  cy.get('[data-testid="collection-name-heading"]', { timeout: 20000 }).should(($h) => expect(normalizar($h.val() || $h.text())).to.eq(ORIGEN));
};
// Definicion relevante de la consulta (sin identificadores internos lib/uuid)
const definicion = (dq) => {
  const etapa = dq.stages ? dq.stages[0] : dq.query;
  return { database: dq.database, tabla: etapa['source-table'], filtros: (etapa.filters || []).length, agregaciones: (etapa.aggregation || []).length, agrupaciones: (etapa.breakout || []).length };
};

describe('TC-FUN-008 - Creacion y organizacion de colecciones', { testIsolation: false }, () => {
  const ref = {};
  const idEjecucion = String(Cypress.config('screenshotsFolder')).split(/[\\/]/).filter(Boolean).pop();

  before(() => {
    cy.env(['QA_EMAIL', 'QA_PASSWORD'], { log: false }).then(({ QA_EMAIL, QA_PASSWORD }) => {
      expect(Boolean(QA_EMAIL) && Boolean(QA_PASSWORD), 'precondicion: credenciales de usuario-qa definidas').to.eq(true);
      cy.request({ method: 'POST', url: '/api/session', body: { username: QA_EMAIL, password: QA_PASSWORD }, log: false, failOnStatusCode: false })
        .then((r) => expect(r.status, 'inicio de sesion por API de usuario-qa').to.eq(200));
    });
  });

  it('1. Disponibilidad, cuenta, permisos sobre la coleccion de origen y referencia de la fuente (solo lectura)', () => {
    api({ url: '/api/health' }).its('body.status').should('eq', 'ok');
    api({ url: '/api/user/current' }).then(({ body }) => {
      expect(`${body.first_name} ${body.last_name}`, 'usuario de la sesion').to.eq('Usuario QA');
      expect(body.is_superuser, 'cuenta normal (no administradora)').to.eq(false);
    });
    cy.readFile('configuracion/recursos-locales.json').then((cfg) => {
      ref.origenId = cfg.coleccion_qa_id;
      ref.dbId = cfg.sample_database_id;
      ref.principalId = cfg.dashboard_principal_id;
      ref.referencias = Object.values(cfg.preguntas);
      [ref.origenId, ref.dbId, ref.principalId].forEach((v) => expect(Number.isInteger(v), 'ID definido en recursos-locales.json').to.eq(true));
    });
    cy.then(() => api({ url: `/api/collection/${ref.origenId}` })).then(({ body }) => {
      expect(body.name, 'coleccion de origen').to.eq(ORIGEN);
      // Permiso suficiente: escritura sobre QA - Metabase (crear subcolecciones y mover elementos dentro)
      expect(body.can_write, 'Usuario QA puede escribir en la coleccion de origen').to.eq(true);
      ref.origenUbicacion = body.location;
    });
    cy.then(() => api({ url: `/api/database/${ref.dbId}/metadata` })).then(({ body }) => {
      ref.productsId = body.tables.find((t) => t.name === 'PRODUCTS').id;
    });
    cy.then(() => api({ method: 'POST', url: '/api/dataset', body: { database: ref.dbId, type: 'native', native: { query: 'SELECT COUNT(*) FROM PRODUCTS' } } }, [200, 202]))
      .then(({ body }) => { ref.totalProductos = body.data.rows[0][0]; expect(ref.totalProductos, 'productos en la fuente').to.be.gt(0); });
    ref.estadoReferencias = {};
    cy.then(() => ref.referencias.forEach((id) => api({ url: `/api/card/${id}` }).then(({ body }) => { ref.estadoReferencias[id] = body.updated_at; })));
    cy.then(() => api({ url: `/api/dashboard/${ref.principalId}` })).then(({ body }) => { ref.principal = body.updated_at; });
  });

  it('2. Nombres libres para la pregunta y la coleccion (solo lectura)', () => {
    api({ url: `/api/collection/${ref.origenId}/items` }).then(({ body }) => {
      const items = body.data || body;
      const preguntas = items.filter((i) => i.model === 'card').map((i) => i.name);
      const colecciones = items.filter((i) => i.model === 'collection').map((i) => i.name);
      ref.pregunta = preguntas.includes(PREGUNTA_BASE) ? `${PREGUNTA_BASE} - ${idEjecucion}` : PREGUNTA_BASE;
      ref.coleccion = colecciones.includes(COLECCION_BASE) ? `${COLECCION_BASE} - ${idEjecucion}` : COLECCION_BASE;
      expect(preguntas, 'nombre de pregunta libre').not.to.include(ref.pregunta);
      expect(colecciones, 'nombre de coleccion libre').not.to.include(ref.coleccion);
    });
    // La pregunta de un intento anterior puede estar ya en otra coleccion: el nombre se elige globalmente
    api({ url: '/api/search', qs: { q: 'TC-FUN-008' } }).then(({ body }) => {
      const nombres = (body.data || []).filter((i) => i.model === 'card').map((i) => i.name);
      if (nombres.includes(ref.pregunta)) { ref.pregunta = `${PREGUNTA_BASE} - ${idEjecucion}`; }
      expect(nombres, 'el nombre de la pregunta no existe en ninguna coleccion').not.to.include(ref.pregunta);
    });
  });

  it('3. Preparacion: se crea y guarda en QA - Metabase la pregunta temporal (Products, sin filtros, tabla)', () => {
    cy.visit('/');
    cy.get('[data-testid="app-bar"]').contains('button', 'Nuevo').click();
    cy.contains('[role="menu"] *', /^Pregunta$/).click();
    cy.get('[data-testid="mini-picker"]', { timeout: 20000 }).should('be.visible').contains('Sample Database').click();
    cy.get('[data-testid="mini-picker"]').contains(/^Products$/).click();
    cy.get('[data-testid="data-step-cell"]', { timeout: 20000 }).should('contain', 'Products');
    cy.intercept('POST', '/api/dataset').as('consulta');
    cy.contains('button', 'Visualizar').click();
    cy.wait('@consulta', { timeout: 60000 }).then((x) => {
      expect(x.response.body.status, 'estado de la consulta').to.eq('completed');
      expect(x.response.body.data.rows.length, 'registros de Products').to.eq(ref.totalProductos);
    });
    cy.get('[data-testid="table-root"]', { timeout: 60000 }).should('be.visible');
    cy.get('[data-testid="filter-pill"]').should('not.exist');
    cy.get('[data-testid="qb-save-button"]').click();
    cy.get('[data-testid="save-question-modal"]').should('be.visible').within(() => {
      cy.get('input[name="name"]').clear().type(ref.pregunta).should('have.value', ref.pregunta);
      cy.get('[data-testid="dashboard-and-collection-picker-button"]').click();
    });
    cy.contains('[data-testid="picker-item"]', exacto('Nuestros análisis')).click();
    cy.contains('[data-testid="picker-item"]', exacto(ORIGEN)).click();
    cy.get('[data-testid="entity-picker-select-button"]').should('have.text', 'Seleccionar esta colección').click();
    cy.get('[data-testid="save-question-modal"] [data-testid="dashboard-and-collection-picker-button"]').should('contain', ORIGEN);
    cy.intercept('POST', '/api/card').as('guardar');
    cy.get('[data-testid="save-question-modal"] [data-testid="save-question-button"]').click();
    cy.wait('@guardar', { timeout: 30000 }).then((x) => {
      expect(x.response.statusCode, 'codigo HTTP de POST /api/card').to.eq(200);
      const c = x.response.body;
      expect(c.name, 'nombre guardado').to.eq(ref.pregunta);
      expect(c.collection_id, 'coleccion de origen').to.eq(ref.origenId);
      expect(c.display, 'visualizacion').to.eq('table');
      expect(definicion(c.dataset_query), 'definicion: Products sin filtros ni resumen').to.deep.eq({ database: ref.dbId, tabla: ref.productsId, filtros: 0, agregaciones: 0, agrupaciones: 0 });
      ref.inicial = { id: c.id, entity_id: c.entity_id, created_at: c.created_at, name: c.name, collection_id: c.collection_id, display: c.display, definicion: definicion(c.dataset_query) };
      ref.preguntaId = c.id;
    });
    cy.get('[data-testid="save-question-modal"]').should('not.exist');
    cerrarAvisos();
  });

  it('4. La pregunta temporal aparece en QA - Metabase y se abre mostrando resultados', () => {
    irAOrigen();
    cy.contains('[data-testid="collection-entry-name"]', exacto(ref.pregunta), { timeout: 20000 })
      .find('a').should('have.attr', 'href').and('match', new RegExp(`^/question/${ref.preguntaId}-`));
    cy.contains('[data-testid="collection-entry-name"]', exacto(ref.pregunta)).scrollIntoView();
    cy.screenshot('01-pregunta-en-coleccion-origen', { capture: 'viewport' });
    cy.intercept('POST', `/api/card/${ref.preguntaId}/query`).as('abrirOrigen');
    cy.contains('[data-testid="collection-entry-name"]', exacto(ref.pregunta)).find('a').click();
    cy.wait('@abrirOrigen', { timeout: 60000 }).then((x) => {
      expect(x.response.body.status, 'consulta desde la ubicacion de origen').to.eq('completed');
      expect(x.response.body.data.rows.length, 'registros desde la ubicacion de origen').to.eq(ref.totalProductos);
      ref.filasOrigen = x.response.body.data.rows.length;
    });
    cerrarAvisos();
    cy.get('[data-testid="saved-question-header-title"]').should('have.value', ref.pregunta);
    cy.get('[data-testid="app-bar"]').should('contain', ORIGEN); // ruta de navegacion: coleccion actual
    cy.get('[data-testid="table-root"]', { timeout: 60000 }).should('be.visible');
  });

  it('5. Se crea la coleccion de prueba dentro de QA - Metabase desde la interfaz', () => {
    irAOrigen();
    cy.get('[aria-label="Crear una nueva colección"]').filter(':visible').first().click();
    cy.contains('[role="dialog"]', 'Nueva colección').should('be.visible').within(() => {
      cy.get('input[name="name"]').clear().type(ref.coleccion).should('have.value', ref.coleccion);
      cy.get('[data-testid="collection-picker-button"]').should('contain', ORIGEN);
    });
    cy.screenshot('02-creacion-de-coleccion', { capture: 'viewport' });
    cy.intercept('POST', '/api/collection').as('crearColeccion');
    cy.contains('[role="dialog"] button', /^Crear$/).should('be.enabled').click();
    cy.wait('@crearColeccion', { timeout: 30000 }).then((x) => {
      expect(x.response.statusCode, 'codigo HTTP de POST /api/collection').to.eq(200);
      const c = x.response.body;
      expect(c.name, 'nombre de la coleccion').to.eq(ref.coleccion);
      expect(c.location, 'ubicacion: dentro de QA - Metabase').to.eq(`${ref.origenUbicacion}${ref.origenId}/`);
      ref.destinoId = c.id;
      ref.coleccionCreada = { id: c.id, name: c.name, location: c.location, entity_id: c.entity_id };
    });
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('6. La coleccion aparece en la ubicacion seleccionada (QA - Metabase)', () => {
    irAOrigen();
    cy.contains('[data-testid="collection-entry-name"]', exacto(ref.coleccion), { timeout: 20000 })
      .find('a').should('have.attr', 'href').and('match', new RegExp(`^/collection/${ref.destinoId}-`));
    api({ url: `/api/collection/${ref.destinoId}` }).then(({ body }) => {
      expect(body.name, 'coleccion registrada').to.eq(ref.coleccion);
      expect(body.location, 'coleccion superior').to.eq(`${ref.origenUbicacion}${ref.origenId}/`);
      expect(body.archived, 'coleccion activa').to.eq(false);
    });
  });

  it('7. Acciones > Mover: se selecciona la coleccion nueva como destino y se confirma el traslado', () => {
    cy.contains('[data-testid="collection-entry"]', ref.pregunta).should('be.visible').within(() => {
      cy.get('[data-testid="collection-entry-name"]').should('have.text', ref.pregunta);
      cy.get('button[aria-label="Acciones"]').click({ force: true });
    });
    cy.get('[role="menu"]').filter(':visible').contains('button', /^Mover$/).click();
    cy.get('[data-testid="entity-picker-modal"]').should('be.visible').and('contain', ref.pregunta);
    cy.contains('[data-testid="picker-item"]', exacto(ORIGEN), { timeout: 20000 }).click();
    cy.contains('[data-testid="picker-item"]', exacto(ref.coleccion), { timeout: 20000 }).click();
    cy.get('[data-testid="entity-picker-select-button"]').should('have.text', 'Mover').and('be.enabled');
    cy.screenshot('03-seleccion-de-destino', { capture: 'viewport' });
    cy.intercept('PUT', `/api/card/${ref.preguntaId}`).as('mover');
    cy.get('[data-testid="entity-picker-select-button"]').click();
    cy.wait('@mover', { timeout: 30000 }).then((x) => {
      expect(x.response.statusCode, 'codigo HTTP de PUT /api/card/:id').to.eq(200);
      expect(x.response.body.id, 'misma pregunta').to.eq(ref.preguntaId);
      expect(x.response.body.collection_id, 'coleccion de destino').to.eq(ref.destinoId);
      expect(x.response.body.dashboard_id == null, 'trasladada a la coleccion (no a un dashboard)').to.eq(true);
    });
    cy.get('[data-testid="entity-picker-modal"]').should('not.exist');
  });

  it('8. La pregunta aparece en la coleccion de destino', () => {
    cy.contains('[data-testid="collection-entry-name"]', exacto(ref.coleccion), { timeout: 20000 }).find('a').click();
    cy.location('pathname', { timeout: 20000 }).should('match', new RegExp(`^/collection/${ref.destinoId}-`));
    cy.get('[data-testid="collection-name-heading"]').should(($h) => expect(normalizar($h.val() || $h.text())).to.eq(ref.coleccion));
    cy.contains('[data-testid="collection-entry-name"]', exacto(ref.pregunta), { timeout: 20000 }).should('be.visible')
      .find('a').should('have.attr', 'href').and('match', new RegExp(`^/question/${ref.preguntaId}-`));
    cy.get('[data-testid="collection-entry-name"]').should('have.length', 1);
    cy.screenshot('04-pregunta-en-coleccion-destino', { capture: 'viewport' });
  });

  it('9. Abierta desde la nueva ubicacion: conserva nombre, fuente, visualizacion y resultados', () => {
    cy.intercept('POST', `/api/card/${ref.preguntaId}/query`).as('abrirDestino');
    cy.contains('[data-testid="collection-entry-name"]', exacto(ref.pregunta)).find('a').click();
    cy.location('pathname', { timeout: 20000 }).should('match', new RegExp(`^/question/${ref.preguntaId}-`));
    cy.wait('@abrirDestino', { timeout: 60000 }).then((x) => {
      expect([200, 202], 'codigo HTTP de la consulta').to.include(x.response.statusCode);
      expect(x.response.body.status, 'consulta desde la nueva ubicacion').to.eq('completed');
      expect(x.response.body.data.rows.length, 'registros = mismos que en origen = fuente').to.eq(ref.filasOrigen);
      ref.filasDestino = x.response.body.data.rows.length;
    });
    cerrarAvisos();
    cy.get('[data-testid="saved-question-header-title"]').should('have.value', ref.pregunta);
    cy.get('[data-testid="app-bar"]').should('contain', ref.coleccion); // ruta de navegacion: coleccion actual
    cy.get('[data-testid="question-table-badges"]').should('contain', 'Products');
    cy.get('[data-testid="table-root"]', { timeout: 60000 }).should('be.visible');
    cy.get('[data-testid="filter-pill"]').should('not.exist');
    cy.then(() => cy.get('[data-testid="question-row-count"]').should('contain', String(ref.filasDestino)));
    cy.screenshot('05-pregunta-abierta-tras-traslado', { capture: 'viewport' });
    cy.get('[data-testid="notebook-button"]').click();
    cy.get('[data-testid="data-step-cell"]', { timeout: 20000 }).should('contain', 'Products');
    cy.screenshot('06-configuracion-conservada', { capture: 'viewport' });
    cy.get('[data-testid="notebook-button"]').click();
    cy.get('[data-testid="table-root"]', { timeout: 60000 }).should('be.visible');
  });

  it('10. La pregunta ya no es elemento directo de QA - Metabase', () => {
    irAOrigen();
    cy.contains('[data-testid="collection-entry-name"]', exacto(ref.coleccion), { timeout: 20000 }).should('be.visible');
    cy.get('[data-testid="collection-entry-name"]').each(($e) => expect(normalizar($e.text()), 'elemento de la coleccion de origen').not.to.eq(ref.pregunta));
    cy.screenshot('07-origen-sin-la-pregunta', { capture: 'viewport' });
  });

  it('11. Traslado y no copia: misma identidad, definicion conservada y recursos protegidos (solo lectura)', () => {
    api({ url: `/api/card/${ref.preguntaId}` }).then(({ body }) => {
      expect(body.id, 'mismo ID').to.eq(ref.inicial.id);
      expect(body.entity_id, 'mismo entity_id').to.eq(ref.inicial.entity_id);
      expect(body.created_at, 'misma fecha de creacion').to.eq(ref.inicial.created_at);
      expect(body.name, 'mismo nombre').to.eq(ref.inicial.name);
      expect(body.display, 'misma visualizacion').to.eq(ref.inicial.display);
      expect(definicion(body.dataset_query), 'misma definicion de consulta').to.deep.eq(ref.inicial.definicion);
      expect(body.collection_id, 'coleccion actual = destino').to.eq(ref.destinoId);
      expect(body.archived, 'pregunta activa').to.eq(false);
      ref.final = { id: body.id, entity_id: body.entity_id, created_at: body.created_at, name: body.name, collection_id: body.collection_id, display: body.display, definicion: definicion(body.dataset_query) };
    });
    api({ url: `/api/collection/${ref.origenId}/items`, qs: { models: 'card' } }).then(({ body }) => {
      expect((body.data || body).map((i) => i.id), 'la pregunta no esta en el origen').not.to.include(ref.preguntaId);
    });
    api({ url: `/api/collection/${ref.destinoId}/items`, qs: { models: 'card' } }).then(({ body }) => {
      expect((body.data || body).map((i) => i.id), 'la pregunta esta en el destino').to.deep.eq([ref.preguntaId]);
    });
    api({ url: '/api/search', qs: { q: ref.pregunta, models: 'card' } }).then(({ body }) => {
      const iguales = (body.data || []).filter((i) => i.name === ref.pregunta);
      expect(iguales.map((i) => i.id), 'una sola pregunta con ese nombre (sin copias)').to.deep.eq([ref.preguntaId]);
    });
    cy.then(() => ref.referencias.forEach((id) => api({ url: `/api/card/${id}` }).its('body.updated_at').should('eq', ref.estadoReferencias[id])));
    api({ url: `/api/dashboard/${ref.principalId}` }).its('body.updated_at').should('eq', ref.principal);
    cy.then(() => {
      const dirResultados = String(Cypress.config('screenshotsFolder')).replace(/([\\/])evidencias([\\/])/, '$1resultados$2');
      cy.writeFile(`${dirResultados}/traslado-coleccion.json`, {
        id_ejecucion: idEjecucion,
        cuenta: 'usuario-qa (Usuario QA, no administradora; escritura sobre QA - Metabase)',
        coleccion_origen: { id: ref.origenId, nombre: ORIGEN },
        coleccion_creada: ref.coleccionCreada,
        pregunta_antes_del_traslado: ref.inicial,
        pregunta_despues_del_traslado: ref.final,
        registros_desde_origen: ref.filasOrigen,
        registros_desde_destino: ref.filasDestino,
        registros_fuente_sql: ref.totalProductos,
        traslado_no_copia: true,
        recursos_protegidos_sin_cambios: true,
        conservados_como_evidencia: true,
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
