// TC-FUN-004 — Guardado y recuperacion de una pregunta (Metabase OSS v0.64.1)
// Plan: "Crear una consulta valida, guardarla con un nombre en una coleccion autorizada y abrirla
// nuevamente." Esperado: "La pregunta queda almacenada y puede recuperarse conservando su
// configuracion y los resultados correspondientes a la consulta."
// Datos: Sample Database > Products, filtro Category "Es" Gadget, visualizacion tabla, coleccion
// "QA - Metabase" (ID leido de configuracion/recursos-locales.json), nombre
// "QA - TC-FUN-004 - Productos Gadget" (con sufijo del ID de ejecucion si ya existiera).
//
// - Creacion, guardado y reapertura se hacen en la INTERFAZ (editor grafico, dialogo Guardar,
//   barra lateral > coleccion > pregunta). La API solo se usa para verificaciones de solo lectura.
// - POST /api/dataset, POST /api/card y POST /api/card/:id/query se OBSERVAN con cy.intercept sin
//   modificarlos: los datos son los reales.
// - La pregunta creada se CONSERVA como evidencia (no se elimina al terminar).
// Selectores verificados en v0.64.1 (exploracion de la interfaz en espanol):
//   app-bar, mini-picker, step-filter-0-0, clause-popover, string-filter-picker, table-root,
//   filter-pill, question-row-count, qb-save-button, save-question-modal,
//   dashboard-and-collection-picker-button, picker-item, entity-picker-select-button,
//   save-question-button, main-logo-link, main-navbar-root, collection-name-heading,
//   collection-entry-name, notebook-button, data-step-cell.

// Todas las solicitudes usan failOnStatusCode:false y comprueban el codigo explicitamente: asi un fallo
// no vuelca la solicitud (con sus cookies de sesion) en el mensaje de error ni en el reporte.
const api = (opciones, codigos = [200]) => cy.request({ failOnStatusCode: false, ...opciones }).then((r) => {
  expect(codigos, `codigo HTTP de ${opciones.method || 'GET'} ${opciones.url || opciones}`).to.include(r.status);
  return r;
});

const NOMBRE_BASE = 'QA - TC-FUN-004 - Productos Gadget';
const COLECCION = 'QA - Metabase';
const CATEGORIA = 'Gadget';
const normalizar = (s) => String(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const exacto = (t) => new RegExp(`^\\s*${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);

// Avisos opcionales de la interfaz: el consejo de primera visita a una pregunta guardada ("Esta bien
// trastear con las preguntas guardadas" > "Empezar a explorar") u ofertas posteriores al guardado
// (p. ej. anadir a un dashboard). Se cierran sin aceptar ningun cambio sobre recursos.
const cerrarAvisos = () => cy.get('body').then(($b) => {
  const boton = [...$b.find('[role="dialog"] button')].find((b) => /^(Empezar a explorar|Ahora no|No, gracias|Omitir)$/i.test(normalizar(b.innerText)));
  if (boton) { cy.wrap(boton).click(); }
});
// En las paginas de preguntas la barra lateral queda contraida: se abre con su boton si hace falta
const abrirBarraLateral = () => cy.get('[data-testid="main-navbar-root"]').then(($n) => {
  if (!Cypress.dom.isVisible($n.find('a[href^="/collection/"]').first())) { cy.get('[data-testid="sidebar-toggle"]').click(); }
});

// Comprueba que una consulta MBQL (forma "stages" de v0.64.1 o la heredada) es Products + Category = Gadget
const comprobarConsulta = (dq, ref, contexto) => {
  let tabla; let filtros;
  if (dq.stages) { tabla = dq.stages[0]['source-table']; filtros = dq.stages[0].filters || []; } else { tabla = dq.query['source-table']; filtros = dq.query.filter ? [dq.query.filter] : []; }
  expect(dq.database, `${contexto}: base de datos`).to.eq(ref.dbId);
  expect(tabla, `${contexto}: tabla de origen (PRODUCTS)`).to.eq(ref.productsId);
  expect(filtros.length, `${contexto}: numero de filtros`).to.eq(1);
  const [op, ...args] = filtros[0];
  const campo = args.find((a) => Array.isArray(a) && a[0] === 'field');
  expect(op, `${contexto}: operador`).to.eq('=');
  expect(campo.find((v) => typeof v === 'number'), `${contexto}: campo (CATEGORY)`).to.eq(ref.categoryId);
  expect(args.filter((a) => !Array.isArray(a) && typeof a !== 'object'), `${contexto}: valor`).to.deep.eq([CATEGORIA]);
};

describe('TC-FUN-004 - Guardado y recuperacion de una pregunta', { testIsolation: false }, () => {
  const ref = {}; // datos leidos durante la ejecucion
  let original; // consulta y respuesta reales antes de guardar
  let guardado; // solicitud y respuesta reales del guardado
  let recuperado; // respuesta real de la pregunta reabierta
  const idEjecucion = String(Cypress.config('screenshotsFolder')).split(/[\\/]/).filter(Boolean).pop();

  before(() => {
    cy.env(['QA_EMAIL', 'QA_PASSWORD'], { log: false }).then(({ QA_EMAIL, QA_PASSWORD }) => {
      expect(Boolean(QA_EMAIL) && Boolean(QA_PASSWORD), 'precondicion: credenciales de usuario-qa definidas').to.eq(true);
      cy.request({ method: 'POST', url: '/api/session', body: { username: QA_EMAIL, password: QA_PASSWORD }, log: false, failOnStatusCode: false })
        .then((r) => expect(r.status, 'inicio de sesion por API de usuario-qa').to.eq(200));
    });
  });

  it('1. Metabase disponible, sesion de Usuario QA y coleccion QA - Metabase autorizada (configuracion local)', () => {
    api({ url: '/api/health' }).its('body.status').should('eq', 'ok');
    api({ url: '/api/user/current' }).then(({ body }) => {
      expect(`${body.first_name} ${body.last_name}`, 'usuario de la sesion').to.eq('Usuario QA');
      expect(body.is_superuser, 'cuenta normal').to.eq(false);
    });
    // ID de la coleccion desde la configuracion local (no hay IDs fijos en el script)
    cy.readFile('configuracion/recursos-locales.json').then((cfg) => {
      expect(Number.isInteger(cfg.coleccion_qa_id), 'coleccion_qa_id definido en recursos-locales.json').to.eq(true);
      ref.coleccionId = cfg.coleccion_qa_id;
      return api({ url: `/api/collection/${cfg.coleccion_qa_id}` });
    }).then(({ body }) => {
      expect(body.name, 'nombre de la coleccion configurada').to.eq(COLECCION);
      expect(body.archived, 'coleccion activa').to.eq(false);
      expect(body.can_write, 'precondicion: coleccion autorizada (escritura) para Usuario QA').to.eq(true);
    });
    api({ url: '/api/database' }).then(({ body }) => {
      const sample = (body.data || body).find((d) => d.is_sample === true || d.name === 'Sample Database');
      expect(Boolean(sample), 'Sample Database disponible').to.eq(true);
      ref.dbId = sample.id;
      return api({ url: `/api/database/${sample.id}/metadata` });
    }).then(({ body }) => {
      const products = body.tables.find((t) => t.name === 'PRODUCTS');
      expect(Boolean(products), 'tabla PRODUCTS disponible').to.eq(true);
      const category = products.fields.find((f) => f.name === 'CATEGORY');
      expect(Boolean(category), 'campo CATEGORY disponible').to.eq(true);
      ref.productsId = products.id;
      ref.categoryId = category.id;
    });
  });

  it('2. Nombre de la pregunta sin duplicados en la coleccion (solo lectura)', () => {
    api({ url: `/api/collection/${ref.coleccionId}/items`, qs: { models: 'card' } }).then(({ body }) => {
      const nombres = (body.data || body).map((i) => i.name);
      ref.nombresPrevios = nombres;
      ref.nombre = nombres.includes(NOMBRE_BASE) ? `${NOMBRE_BASE} - ${idEjecucion}` : NOMBRE_BASE;
      expect(nombres, 'el nombre definitivo no existe aun en la coleccion').not.to.include(ref.nombre);
      ref.preguntasPrevias = (body.data || body).map((i) => i.id);
    });
  });

  it('3. Nuevo > Pregunta: Sample Database > Products con el filtro Category Es Gadget', () => {
    cy.visit('/');
    cy.get('[data-testid="app-bar"]').contains('button', 'Nuevo').click();
    cy.contains('[role="menu"] *', /^Pregunta$/).click();
    cy.location('pathname', { timeout: 20000 }).should('eq', '/question/notebook');
    cy.get('[data-testid="mini-picker"]', { timeout: 20000 }).should('be.visible').contains('Sample Database').click();
    cy.get('[data-testid="mini-picker"]').contains(/^Products$/).click();
    cy.get('[data-testid="data-step-cell"]', { timeout: 20000 }).should('contain', 'Products');
    cy.get('[data-testid="step-filter-0-0"]').contains('Añade filtros para acotar tu respuesta').click();
    cy.get('[data-testid="clause-popover"]').filter(':visible').contains(/^Category$/).click();
    cy.get('[data-testid="string-filter-picker"]').should('be.visible').within(() => {
      cy.get('[aria-label="Operador de filtro"]').should('contain', 'Es');
      cy.contains('label', exacto(CATEGORIA)).click();
      // La casilla es hermana de la etiqueta (label[for] -> input#id): solo Gadget queda marcada
      cy.contains('label', exacto(CATEGORIA)).invoke('attr', 'for').then((id) => {
        cy.get(`input[type="checkbox"][id="${id}"]`).should('be.checked');
      });
      cy.get('input[type="checkbox"]:checked').should('have.length', 1);
    });
    cy.get('[data-testid="string-filter-picker"] button[type="submit"]').should('be.enabled').click();
    cy.get('[data-testid="step-filter-0-0"]').should('contain', 'Category').and('contain', CATEGORIA);
  });

  it('4. Visualizar ejecuta la consulta: registros devueltos, todos de categoria Gadget, en tabla', () => {
    cy.intercept('POST', '/api/dataset').as('consulta'); // solo observacion
    cy.contains('button', 'Visualizar').click();
    cy.wait('@consulta', { timeout: 60000 }).then((x) => {
      original = x;
      expect([200, 202], 'codigo HTTP de POST /api/dataset').to.include(x.response.statusCode);
      expect(x.response.body.status, 'estado de la consulta').to.eq('completed');
      expect(x.response.body.error, 'sin error de consulta').to.eq(undefined);
      comprobarConsulta(x.request.body.dataset_query || x.request.body, ref, 'consulta original');
      const d = x.response.body.data;
      const iCat = d.cols.findIndex((c) => c.name === 'CATEGORY');
      const iId = d.cols.findIndex((c) => c.name === 'ID');
      expect(d.rows.length, 'registros devueltos').to.be.gt(0);
      expect(d.rows.filter((r) => r[iCat] !== CATEGORIA).length, `registros con categoria distinta de ${CATEGORIA}`).to.eq(0);
      ref.filasOriginal = d.rows.length;
      ref.idsOriginal = d.rows.map((r) => r[iId]).sort((a, b) => a - b);
    });
    cy.get('[data-testid="table-root"]', { timeout: 60000 }).should('be.visible');
    cy.get('[data-testid="filter-pill"]').should('contain', 'Category').and('contain', CATEGORIA);
    cy.get('[data-testid="question-row-count"]').should('contain', 'Mostrando');
    cy.screenshot('01-consulta-antes-de-guardar', { capture: 'viewport' });
  });

  it('5. Guardar: nombre establecido y coleccion QA - Metabase en el dialogo', () => {
    cy.get('[data-testid="qb-save-button"]').should('be.visible').click();
    cy.get('[data-testid="save-question-modal"]').should('be.visible').within(() => {
      cy.contains('Guardar nueva pregunta').should('be.visible');
      cy.get('input[name="name"]').clear().type(ref.nombre).should('have.value', ref.nombre);
      cy.get('[data-testid="dashboard-and-collection-picker-button"]').click();
    });
    cy.contains('[data-testid="picker-item"]', exacto('Nuestros análisis')).click();
    cy.contains('[data-testid="picker-item"]', exacto(COLECCION)).click();
    // Se elige la COLECCION (no un dashboard): el boton debe indicar "Seleccionar esta coleccion"
    cy.get('[data-testid="entity-picker-select-button"]').should('have.text', 'Seleccionar esta colección').and('be.enabled').click();
    cy.get('[data-testid="save-question-modal"] [data-testid="dashboard-and-collection-picker-button"]').should('contain', COLECCION);
    cy.screenshot('02-dialogo-guardar', { capture: 'viewport' });
  });

  it('6. El guardado finaliza correctamente (respuesta real de POST /api/card)', () => {
    cy.intercept('POST', '/api/card').as('guardar'); // solo observacion
    cy.get('[data-testid="save-question-modal"] [data-testid="save-question-button"]').should('be.enabled').click();
    cy.wait('@guardar', { timeout: 30000 }).then((x) => {
      guardado = x;
      expect(x.response.statusCode, 'codigo HTTP de POST /api/card').to.eq(200);
      expect(x.response.body.id, 'ID asignado a la pregunta').to.be.a('number');
      expect(ref.preguntasPrevias, 'ID nuevo (no sobrescribe otra pregunta)').not.to.include(x.response.body.id);
      expect(x.response.body.name, 'nombre guardado').to.eq(ref.nombre);
      expect(x.response.body.collection_id, 'coleccion de destino').to.eq(ref.coleccionId);
      expect(x.response.body.dashboard_id == null, 'guardada en la coleccion, no dentro de un dashboard').to.eq(true);
      expect(x.response.body.display, 'visualizacion guardada').to.eq('table');
      ref.cardId = x.response.body.id;
    });
    cy.get('[data-testid="save-question-modal"]').should('not.exist');
    cy.location('pathname', { timeout: 20000 }).should((p) => expect(p).to.match(new RegExp(`^/question/${ref.cardId}-`)));
    cy.get('[data-testid="qb-header"]').should(($h) => {
      const valores = [...$h.find('input, textarea')].map((e) => e.value);
      expect([normalizar($h.text()), ...valores].some((t) => t.includes(ref.nombre)), 'el encabezado muestra el nombre guardado').to.eq(true);
    });
    cy.screenshot('03-confirmacion-guardado', { capture: 'viewport' });
    cerrarAvisos();
  });

  it('7. Navegar fuera (Inicio) y llegar a la coleccion QA - Metabase desde la barra lateral', () => {
    abrirBarraLateral();
    cy.get('[data-testid="main-navbar-root"]').contains('a', exacto('Inicio')).should('be.visible').click();
    cy.location('pathname', { timeout: 20000 }).should('eq', '/');
    cy.get('[data-testid="home-page"]', { timeout: 20000 }).should('be.visible');
    abrirBarraLateral();
    cy.get('[data-testid="main-navbar-root"]').contains('a', exacto(COLECCION)).should('be.visible').click();
    cy.location('pathname', { timeout: 20000 }).should('match', new RegExp(`^/collection/${ref.coleccionId}-`));
    cy.get('[data-testid="collection-name-heading"]').should(($h) => expect(normalizar($h.text() || $h.val())).to.contain(COLECCION));
  });

  it('8. La pregunta se localiza por su nombre en la coleccion', () => {
    cy.contains('[data-testid="collection-entry-name"]', exacto(ref.nombre), { timeout: 20000 }).should('be.visible')
      .find('a').should('have.attr', 'href').and('match', new RegExp(`^/question/${ref.cardId}-`));
    cy.screenshot('04-pregunta-en-coleccion', { capture: 'viewport' });
  });

  it('9. Se reabre desde la coleccion y presenta resultados sin errores', () => {
    cy.intercept('POST', `/api/card/${ref.cardId}/query`).as('recuperar'); // solo observacion
    cy.contains('[data-testid="collection-entry-name"]', exacto(ref.nombre)).find('a').click();
    cy.location('pathname', { timeout: 20000 }).should('match', new RegExp(`^/question/${ref.cardId}-`));
    cy.wait('@recuperar', { timeout: 60000 }).then((x) => {
      recuperado = x;
      expect([200, 202], 'codigo HTTP de POST /api/card/:id/query').to.include(x.response.statusCode);
      expect(x.response.body.status, 'estado de la consulta recuperada').to.eq('completed');
      expect(x.response.body.error, 'sin error de consulta').to.eq(undefined);
    });
    cerrarAvisos();
    cy.get('[data-testid="saved-question-header-title"]').should('have.value', ref.nombre);
    cy.get('[data-testid="question-table-badges"]').should('contain', 'Products');
    cy.get('[data-testid="table-root"]', { timeout: 60000 }).should('be.visible');
    // En una pregunta guardada los filtros se muestran contraidos ("Filtro 1"): se despliegan para verlos
    cy.get('[data-testid="filters-visibility-control"]').should('contain', '1').click();
    cy.get('[data-testid="filter-pill"]').should('have.length', 1).and('contain', 'Category').and('contain', CATEGORIA);
    cy.screenshot('05-pregunta-recuperada-resultados', { capture: 'viewport' });
  });

  it('10. La pregunta recuperada conserva la tabla Products, el filtro y la visualizacion de tabla', () => {
    // Configuracion almacenada (lectura complementaria por API)
    api({ url: `/api/card/${ref.cardId}` }).then(({ body }) => {
      expect(body.name, 'nombre almacenado').to.eq(ref.nombre);
      expect(body.collection_id, 'coleccion almacenada').to.eq(ref.coleccionId);
      expect(body.display, 'visualizacion almacenada').to.eq('table');
      expect(body.archived, 'pregunta activa').to.eq(false);
      expect(body.type, 'tipo de elemento').to.eq('question');
      comprobarConsulta(body.dataset_query, ref, 'consulta almacenada');
      ref.card = { id: body.id, name: body.name, collection_id: body.collection_id, display: body.display, entity_id: body.entity_id };
    });
    // Configuracion visible en la interfaz: editor de la pregunta reabierta (sin modificarla)
    cy.get('[data-testid="notebook-button"]').click();
    cy.get('[data-testid="data-step-cell"]', { timeout: 20000 }).should('contain', 'Products');
    cy.get('[data-testid="step-filter-0-0"]').should('contain', 'Category').and('contain', CATEGORIA);
    cy.screenshot('06-configuracion-recuperada', { capture: 'viewport' });
    cy.get('[data-testid="notebook-button"]').click();
    cy.get('[data-testid="table-root"]', { timeout: 60000 }).should('be.visible');
  });

  it('11. Los resultados recuperados corresponden a la consulta original', () => {
    const d = recuperado.response.body.data;
    const iCat = d.cols.findIndex((c) => c.name === 'CATEGORY');
    const iId = d.cols.findIndex((c) => c.name === 'ID');
    expect(iCat, 'columna CATEGORY en el resultado recuperado').to.be.gte(0);
    expect(d.rows.length, 'registros recuperados').to.be.gt(0);
    expect(d.rows.filter((r) => r[iCat] !== CATEGORIA).length, `registros recuperados con categoria distinta de ${CATEGORIA}`).to.eq(0);
    expect(d.rows.length, 'mismo numero de registros que la consulta original').to.eq(ref.filasOriginal);
    const ids = d.rows.map((r) => r[iId]).sort((a, b) => a - b);
    expect(ids, 'mismos registros (ID) que la consulta original').to.deep.eq(ref.idsOriginal);
    ref.filasRecuperadas = d.rows.length;
    // Celdas visibles de la columna Category en la tabla de la interfaz
    cy.get('[data-testid="table-header"] [data-testid="header-cell"]').then(($h) => {
      const cab = [...$h].map((e) => normalizar(e.innerText));
      const iCab = cab.indexOf('Category');
      expect(iCab, 'columna Category visible').to.be.gte(0);
      cy.get('[data-testid="table-body"]').then(($b) => {
        const filas = [...$b[0].querySelectorAll('[role="row"]')].length
          ? [...$b[0].querySelectorAll('[role="row"]')]
          : [...$b[0].children].filter((f) => f.querySelector('[data-testid="body-cell-container"]'));
        const valores = filas.map((f) => {
          const celdas = f.querySelectorAll('[data-testid="body-cell-container"]');
          const c = celdas[iCab + Math.max(celdas.length - cab.length, 0)];
          return c ? normalizar(c.innerText) : '';
        }).filter(Boolean);
        ref.valoresVisibles = valores.length;
        expect(valores.length, 'valores de Category leidos en filas visibles').to.be.gt(0);
        expect(valores.filter((v) => v !== CATEGORIA).length, `valores visibles distintos de ${CATEGORIA} (de ${valores.length})`).to.eq(0);
      });
    });
    cy.get('[data-testid="question-row-count"]').invoke('text').then((t) => { ref.textoFilas = normalizar(t); });
    // Referencia de solo lectura sobre la misma fuente (SQLite: tablas sin esquema)
    api({ method: 'POST', url: '/api/dataset', body: { database: ref.dbId, type: 'native', native: { query: `SELECT COUNT(*) FROM PRODUCTS WHERE CATEGORY = '${CATEGORIA}'` } } }, [200, 202])
      .then(({ body }) => {
        expect(body.status, 'estado del recuento de referencia').to.eq('completed');
        ref.referenciaSql = body.data.rows[0][0];
        expect(ref.filasRecuperadas, 'registros recuperados = recuento de origen').to.eq(ref.referenciaSql);
      });
    cy.then(() => {
      const dirResultados = String(Cypress.config('screenshotsFolder')).replace(/([\\/])evidencias([\\/])/, '$1resultados$2');
      cy.writeFile(`${dirResultados}/pregunta-creada.json`, {
        id_ejecucion: idEjecucion,
        pregunta: ref.card,
        coleccion: { id: ref.coleccionId, nombre: COLECCION },
        url_relativa: `/question/${ref.cardId}`,
        nombre_ya_existia: ref.nombre !== NOMBRE_BASE,
        codigo_http_guardado: guardado.response.statusCode,
        filas_consulta_original: ref.filasOriginal,
        filas_pregunta_recuperada: ref.filasRecuperadas,
        mismos_registros: true,
        recuento_origen_sql: ref.referenciaSql,
        valores_category_visibles_comprobados: ref.valoresVisibles,
        texto_contador_filas: ref.textoFilas,
        codigo_http_recuperacion: recuperado.response.statusCode,
        conservada_como_evidencia: true,
      });
    });
  });

  // Las pruebas son secuenciales: si una falla se detiene la ejecucion, para no guardar nunca una
  // pregunta incompleta (p. ej. sin filtro) ni evaluar pasos que dependen del anterior.
  afterEach(function detenerSiFalla() {
    if (this.currentTest.state === 'failed') { Cypress.stop(); }
  });

  after(() => {
    // La pregunta creada se conserva como evidencia; solo se cierra la sesion.
    cy.request({ method: 'DELETE', url: '/api/session', failOnStatusCode: false });
    cy.request({ url: '/api/user/current', failOnStatusCode: false }).its('status').should('eq', 401);
  });
});
