// TC-FUN-006 — Creacion de dashboard (Metabase OSS v0.64.1)
// Plan: "Crear un dashboard, asignarle un nombre, incorporar una pregunta previamente guardada y guardar
// los cambios." Esperado: "El dashboard queda registrado y presenta la pregunta incorporada con su
// visualizacion correspondiente."
// Datos: coleccion "QA - Metabase" y pregunta "QA - Productos por categoria" (IDs leidos de
// configuracion/recursos-locales.json), dashboard "QA - TC-FUN-006 - Dashboard de prueba" (con sufijo del
// ID de ejecucion si ya existiera), visualizacion esperada: barras.
//
// - Creacion, incorporacion de la pregunta, guardado y reapertura se hacen en la INTERFAZ. La API solo se
//   usa para lecturas de comprobacion (y para obtener los resultados de referencia de la pregunta).
// - POST /api/dashboard, PUT /api/dashboard/:id y las consultas de las tarjetas se OBSERVAN con
//   cy.intercept sin modificarlas.
// - El dashboard creado se CONSERVA como evidencia (lo usa TC-FUN-007).
// Selectores verificados en v0.64.1 (exploracion de la interfaz en espanol, sin escrituras):
//   collection-picker-button, entity-picker-modal, picker-item, entity-picker-select-button,
//   dashboard-header [aria-label="Editar Dashboard"|"Anadir preguntas"], edit-bar, save-edit-button,
//   add-card-sidebar (input Buscar..., option-text), dashcard, chart-container, legend-caption-title,
//   dashboard-name-heading, main-navbar-root, collection-entry-name.

const api = (opciones, codigos = [200]) => cy.request({ failOnStatusCode: false, ...opciones }).then((r) => {
  expect(codigos, `codigo HTTP de ${opciones.method || 'GET'} ${opciones.url || opciones}`).to.include(r.status);
  return r;
});

const NOMBRE_BASE = 'QA - TC-FUN-006 - Dashboard de prueba';
const COLECCION = 'QA - Metabase';
const PREGUNTA = 'QA - Productos por categoría';
const normalizar = (s) => String(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const exacto = (t) => new RegExp(`^\\s*${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
const rectanguloBarra = (d) => {
  const m = /^M([-\d.]+) ([-\d.]+)l([-\d.]+) 0l0 ([-\d.]+)l[-\d.]+ 0Z$/.exec(String(d).trim());
  return m ? { x: parseFloat(m[1]), base: parseFloat(m[2]), ancho: parseFloat(m[3]), alto: -parseFloat(m[4]) } : null;
};
const traslacion = (el) => {
  const m = /translate\(\s*([-\d.]+)[ ,]+([-\d.]+)\s*\)/.exec(el.getAttribute('transform') || '');
  return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : null;
};
const abrirBarraLateral = () => cy.get('[data-testid="main-navbar-root"]').then(($n) => {
  if (!Cypress.dom.isVisible($n.find('a[href^="/collection/"]').first())) { cy.get('[data-testid="sidebar-toggle"]').click(); }
});
// Lee del SVG de una tarjeta las categorias del eje X y el valor de cada barra (altura / escala del eje Y)
const leerGrafico = (svg) => {
  const textos = [...svg.querySelectorAll('text')].map((t) => ({ texto: normalizar(t.textContent), pos: traslacion(t) })).filter((t) => t.pos);
  const ticks = textos.filter((t) => /^-?\d+$/.test(t.texto)).map((t) => ({ valor: parseInt(t.texto, 10), y: t.pos.y }));
  const t0 = ticks.reduce((a, b) => (a.valor < b.valor ? a : b));
  const t1 = ticks.reduce((a, b) => (a.valor > b.valor ? a : b));
  const escala = (t0.y - t1.y) / (t1.valor - t0.valor);
  const etiquetas = textos.filter((t) => t.pos.y > t0.y && !/^-?\d+$/.test(t.texto));
  const barras = [...svg.querySelectorAll('path')].filter((p) => (p.getAttribute('fill') || 'none') !== 'none')
    .map((p) => rectanguloBarra(p.getAttribute('d'))).filter(Boolean);
  return barras.map((b) => {
    const c = b.x + b.ancho / 2;
    const e = etiquetas.reduce((a, x) => (Math.abs(x.pos.x - c) < Math.abs(a.pos.x - c) ? x : a));
    return { categoria: e.texto, valor: b.alto / escala };
  });
};

describe('TC-FUN-006 - Creacion de dashboard', { testIsolation: false }, () => {
  const ref = {};
  let creado; let guardado; let consultaTarjeta;
  const idEjecucion = String(Cypress.config('screenshotsFolder')).split(/[\\/]/).filter(Boolean).pop();

  before(() => {
    cy.env(['QA_EMAIL', 'QA_PASSWORD'], { log: false }).then(({ QA_EMAIL, QA_PASSWORD }) => {
      expect(Boolean(QA_EMAIL) && Boolean(QA_PASSWORD), 'precondicion: credenciales de usuario-qa definidas').to.eq(true);
      cy.request({ method: 'POST', url: '/api/session', body: { username: QA_EMAIL, password: QA_PASSWORD }, log: false, failOnStatusCode: false })
        .then((r) => expect(r.status, 'inicio de sesion por API de usuario-qa').to.eq(200));
    });
  });

  it('1. Disponibilidad, sesion y recursos de la configuracion local (solo lectura)', () => {
    api({ url: '/api/health' }).its('body.status').should('eq', 'ok');
    api({ url: '/api/user/current' }).then(({ body }) => {
      expect(`${body.first_name} ${body.last_name}`, 'usuario de la sesion').to.eq('Usuario QA');
      expect(body.is_superuser, 'cuenta normal').to.eq(false);
    });
    cy.readFile('configuracion/recursos-locales.json').then((cfg) => {
      ref.coleccionId = cfg.coleccion_qa_id;
      ref.preguntaId = cfg.preguntas && cfg.preguntas.productos_por_categoria;
      ref.dashboardPrincipalId = cfg.dashboard_principal_id;
      [ref.coleccionId, ref.preguntaId, ref.dashboardPrincipalId].forEach((v) => expect(Number.isInteger(v), 'ID definido en recursos-locales.json').to.eq(true));
      return api({ url: `/api/collection/${ref.coleccionId}` });
    }).then(({ body }) => {
      expect(body.name, 'coleccion configurada').to.eq(COLECCION);
      expect(body.can_write, 'precondicion: coleccion con escritura para Usuario QA').to.eq(true);
      return api({ url: `/api/card/${ref.preguntaId}` });
    }).then(({ body }) => {
      expect(body.name, 'pregunta configurada').to.eq(PREGUNTA);
      expect(body.display, 'visualizacion de la pregunta original').to.eq('bar');
      expect(body.archived, 'pregunta activa').to.eq(false);
      ref.preguntaActualizada = body.updated_at;
      // Resultados de referencia de la pregunta original (ejecucion de solo lectura)
      return api({ method: 'POST', url: `/api/card/${ref.preguntaId}/query`, body: {} }, [200, 202]);
    }).then(({ body }) => {
      expect(body.status, 'estado de la consulta de referencia').to.eq('completed');
      ref.referencia = Object.fromEntries(body.data.rows.map(([c, n]) => [c, n]));
      ref.categorias = body.data.rows.map(([c]) => c);
      return api({ url: `/api/dashboard/${ref.dashboardPrincipalId}` });
    }).then(({ body }) => {
      ref.principal = { updated_at: body.updated_at, tarjetas: body.dashcards.length };
    });
  });

  it('2. Nombre del dashboard sin duplicados en la coleccion (solo lectura)', () => {
    api({ url: `/api/collection/${ref.coleccionId}/items`, qs: { models: 'dashboard' } }).then(({ body }) => {
      const items = body.data || body;
      const nombres = items.map((i) => i.name);
      ref.nombre = nombres.includes(NOMBRE_BASE) ? `${NOMBRE_BASE} - ${idEjecucion}` : NOMBRE_BASE;
      expect(nombres, 'el nombre definitivo no existe en la coleccion').not.to.include(ref.nombre);
      ref.dashboardsPrevios = items.map((i) => i.id);
    });
  });

  it('3. Nuevo > Dashboard: nombre y coleccion QA - Metabase en el dialogo', () => {
    cy.visit('/');
    cy.get('[data-testid="app-bar"]').contains('button', 'Nuevo').click();
    cy.contains('[role="menu"] *', /^Dashboard$/).click();
    cy.contains('[role="dialog"]', 'Nuevo dashboard').should('be.visible').within(() => {
      cy.get('input[name="name"]').clear().type(ref.nombre).should('have.value', ref.nombre);
      cy.get('[data-testid="collection-picker-button"]').click();
    });
    cy.get('[data-testid="entity-picker-modal"]').should('be.visible');
    cy.contains('[data-testid="picker-item"]', exacto(COLECCION)).click();
    cy.get('[data-testid="entity-picker-select-button"]').should('be.enabled').click();
    cy.get('[data-testid="entity-picker-modal"]').should('not.exist');
    cy.get('[data-testid="collection-picker-button"]', { timeout: 15000 }).should('contain', COLECCION);
    cy.screenshot('01-dialogo-nuevo-dashboard', { capture: 'viewport' });
  });

  it('4. Crear: el dashboard se registra en la coleccion con el nombre asignado', () => {
    cy.intercept('POST', '/api/dashboard').as('crear'); // solo observacion
    cy.contains('[role="dialog"] button', /^Crear$/).should('be.enabled').click();
    cy.wait('@crear', { timeout: 30000 }).then((x) => {
      creado = x;
      expect(x.response.statusCode, 'codigo HTTP de POST /api/dashboard').to.eq(200);
      expect(x.response.body.id, 'ID asignado').to.be.a('number');
      expect(ref.dashboardsPrevios, 'ID nuevo (no reutiliza otro dashboard)').not.to.include(x.response.body.id);
      expect(x.response.body.name, 'nombre registrado').to.eq(ref.nombre);
      expect(x.response.body.collection_id, 'coleccion registrada').to.eq(ref.coleccionId);
      ref.dashboardId = x.response.body.id;
    });
    cy.location('pathname', { timeout: 20000 }).should((p) => expect(p).to.match(new RegExp(`^/dashboard/${ref.dashboardId}-`)));
    // Un dashboard nuevo se abre en modo edicion; si no fuera asi, se entra con "Editar Dashboard"
    cy.get('[data-testid="dashboard-header"]', { timeout: 30000 }).should('be.visible');
    cy.get('body').then(($b) => {
      if (!$b.find('[data-testid="edit-bar"]').length) { cy.get('[data-testid="dashboard-header"] [aria-label="Editar Dashboard"]').click(); }
    });
    cy.get('[data-testid="edit-bar"]').should('be.visible');
    cy.screenshot('02-dashboard-creado-en-edicion', { capture: 'viewport' });
  });

  it('5. Anadir preguntas: se busca e incorpora QA - Productos por categoria con su grafico de barras', () => {
    // En modo edicion, una tarjeta aun no guardada consulta la pregunta directamente (POST /api/card/:id/query)
    cy.intercept('POST', `/api/card/${ref.preguntaId}/query`).as('tarjetaEdicion');
    cy.get('[data-testid="dashboard-header"] [aria-label="Añadir preguntas"]').click();
    cy.get('[data-testid="add-card-sidebar"]').should('be.visible').within(() => {
      cy.get('input[placeholder="Buscar…"]').type(PREGUNTA);
      cy.contains('[data-testid="option-text"]', exacto(PREGUNTA), { timeout: 20000 }).click();
    });
    cy.wait('@tarjetaEdicion', { timeout: 60000 }).then((x) => {
      expect([200, 202], 'codigo HTTP de la consulta de la tarjeta').to.include(x.response.statusCode);
      expect(x.response.body.status, 'estado de la consulta de la tarjeta').to.eq('completed');
    });
    cy.get('[data-testid="dashcard"]').should('have.length', 1).first().within(() => {
      cy.get('[data-testid="legend-caption-title"]').should('have.text', PREGUNTA);
      cy.get('[data-testid="chart-container"] svg').should('be.visible');
    });
    cy.get('[data-testid="dashcard"] [data-testid="chart-container"] svg').should(($svg) => {
      expect(leerGrafico($svg[0]).length, 'barras dibujadas en la tarjeta').to.eq(ref.categorias.length);
    });
    cy.screenshot('03-pregunta-incorporada-en-edicion', { capture: 'viewport' });
  });

  it('6. Guardar: los cambios se registran (PUT /api/dashboard) y se sale del modo edicion', () => {
    cy.intercept('PUT', `/api/dashboard/${ref.dashboardId}`).as('guardar'); // solo observacion
    cy.get('[data-testid="save-edit-button"]').should('be.enabled').click();
    cy.wait('@guardar', { timeout: 30000 }).then((x) => {
      guardado = x;
      expect(x.response.statusCode, 'codigo HTTP de PUT /api/dashboard/:id').to.eq(200);
      const tarjetas = x.response.body.dashcards || [];
      expect(tarjetas.length, 'tarjetas guardadas').to.eq(1);
      expect(tarjetas[0].card_id, 'pregunta asociada a la tarjeta').to.eq(ref.preguntaId);
    });
    cy.get('[data-testid="edit-bar"]').should('not.exist');
    cy.get('[data-testid="dashcard"]').should('have.length', 1);
    cy.screenshot('04-dashboard-guardado', { capture: 'viewport' });
  });

  it('7. Navegar fuera (Inicio) y localizar el dashboard en la coleccion QA - Metabase', () => {
    abrirBarraLateral();
    cy.get('[data-testid="main-navbar-root"]').contains('a', exacto('Inicio')).should('be.visible').click();
    cy.location('pathname', { timeout: 20000 }).should('eq', '/');
    cy.get('[data-testid="home-page"]', { timeout: 20000 }).should('be.visible');
    abrirBarraLateral();
    cy.get('[data-testid="main-navbar-root"]').contains('a', exacto(COLECCION)).should('be.visible').click();
    cy.location('pathname', { timeout: 20000 }).should('match', new RegExp(`^/collection/${ref.coleccionId}-`));
    cy.contains('[data-testid="collection-entry-name"]', exacto(ref.nombre), { timeout: 20000 }).should('be.visible')
      .find('a').should('have.attr', 'href').and('match', new RegExp(`^/dashboard/${ref.dashboardId}-`));
    cy.screenshot('05-dashboard-en-coleccion', { capture: 'viewport' });
  });

  it('8. Reabierto desde la coleccion: conserva el nombre y la pregunta, con datos de la pregunta original', () => {
    cy.intercept('POST', `/api/dashboard/${ref.dashboardId}/dashcard/*/card/*/query`).as('tarjeta');
    cy.contains('[data-testid="collection-entry-name"]', exacto(ref.nombre)).find('a').click();
    cy.location('pathname', { timeout: 20000 }).should('match', new RegExp(`^/dashboard/${ref.dashboardId}-`));
    cy.wait('@tarjeta', { timeout: 60000 }).then((x) => {
      consultaTarjeta = x;
      expect([200, 202], 'codigo HTTP de la consulta de la tarjeta').to.include(x.response.statusCode);
      expect(x.response.body.status, 'estado de la consulta de la tarjeta').to.eq('completed');
      expect(x.request.url, 'la tarjeta consulta la pregunta original').to.match(new RegExp(`/card/${ref.preguntaId}/query`));
      const filas = Object.fromEntries(x.response.body.data.rows.map(([c, n]) => [c, n]));
      expect(filas, 'datos de la tarjeta = resultados de la pregunta original').to.deep.eq(ref.referencia);
    });
    cy.get('[data-testid="dashboard-name-heading"]').should(($h) => expect(normalizar($h.val() || $h.text())).to.eq(ref.nombre));
    cy.get('[data-testid="dashcard"]').should('have.length', 1).first().within(() => {
      cy.get('[data-testid="legend-caption-title"]').should('have.text', PREGUNTA);
      cy.get('[data-testid="chart-container"] svg').should('be.visible');
    });
    cy.get('[data-testid="dashcard"]').should('not.contain', 'error');
    cy.screenshot('06-dashboard-reabierto', { capture: 'viewport' });
  });

  it('9. El grafico de barras reabierto es coherente con la pregunta original (categorias y valores)', () => {
    cy.get('[data-testid="dashcard"] [data-testid="chart-container"] svg').should(($svg) => {
      const barras = leerGrafico($svg[0]);
      expect(barras.map((b) => b.categoria), 'categorias del grafico').to.deep.eq(ref.categorias);
      barras.forEach((b) => expect(Math.abs(b.valor - ref.referencia[b.categoria]), `barra ${b.categoria} (${b.valor.toFixed(3)}) = ${ref.referencia[b.categoria]}`).to.be.lt(0.5));
      ref.barras = barras.map((b) => ({ categoria: b.categoria, valor: Number(b.valor.toFixed(4)) }));
    });
  });

  it('10. Persistencia y recursos protegidos (lectura complementaria por API)', () => {
    api({ url: `/api/dashboard/${ref.dashboardId}` }).then(({ body }) => {
      expect(body.name, 'nombre almacenado').to.eq(ref.nombre);
      expect(body.collection_id, 'coleccion almacenada').to.eq(ref.coleccionId);
      expect(body.archived, 'dashboard activo').to.eq(false);
      expect(body.dashcards.length, 'tarjetas almacenadas').to.eq(1);
      expect(body.dashcards[0].card_id, 'pregunta almacenada').to.eq(ref.preguntaId);
      expect(body.dashcards[0].card.display, 'visualizacion de la tarjeta').to.eq('bar');
      ref.dashboard = { id: body.id, name: body.name, collection_id: body.collection_id, entity_id: body.entity_id, dashcard_id: body.dashcards[0].id, card_id: body.dashcards[0].card_id, size: [body.dashcards[0].size_x, body.dashcards[0].size_y] };
    });
    api({ url: `/api/card/${ref.preguntaId}` }).then(({ body }) => {
      expect(body.updated_at, 'pregunta de referencia sin modificar').to.eq(ref.preguntaActualizada);
    });
    api({ url: `/api/dashboard/${ref.dashboardPrincipalId}` }).then(({ body }) => {
      expect(body.updated_at, 'dashboard principal sin modificar').to.eq(ref.principal.updated_at);
      expect(body.dashcards.length, 'tarjetas del dashboard principal').to.eq(ref.principal.tarjetas);
    });
    cy.then(() => {
      const dirResultados = String(Cypress.config('screenshotsFolder')).replace(/([\\/])evidencias([\\/])/, '$1resultados$2');
      cy.writeFile(`${dirResultados}/dashboard-creado.json`, {
        id_ejecucion: idEjecucion,
        dashboard: ref.dashboard,
        url_relativa: `/dashboard/${ref.dashboardId}`,
        nombre_ya_existia: ref.nombre !== NOMBRE_BASE,
        coleccion: { id: ref.coleccionId, nombre: COLECCION },
        pregunta: { id: ref.preguntaId, nombre: PREGUNTA, display: 'bar' },
        codigo_http_creacion: creado.response.statusCode,
        codigo_http_guardado: guardado.response.statusCode,
        codigo_http_tarjeta_reabierta: consultaTarjeta.response.statusCode,
        resultados_pregunta_original: ref.referencia,
        barras_dashboard_reabierto: ref.barras,
        recursos_protegidos_sin_cambios: true,
        conservado_como_evidencia: true,
      });
    });
  });

  // Pruebas secuenciales: si una falla se detiene la ejecucion (evita pasos sobre un estado incompleto)
  afterEach(function detenerSiFalla() {
    if (this.currentTest.state === 'failed') { Cypress.stop(); }
  });

  after(() => {
    cy.request({ method: 'DELETE', url: '/api/session', failOnStatusCode: false });
    cy.request({ url: '/api/user/current', failOnStatusCode: false }).its('status').should('eq', 401);
  });
});
