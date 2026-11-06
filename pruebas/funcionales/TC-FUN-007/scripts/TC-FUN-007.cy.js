// TC-FUN-007 — Aplicacion de filtros en dashboard (Metabase OSS v0.64.1)
// Plan: "Configurar un filtro de categoria asociado a una pregunta del dashboard y seleccionar un valor
// existente." Esperado: "Las visualizaciones vinculadas se actualizan y muestran unicamente los resultados
// correspondientes al criterio seleccionado."
// Escenario: dashboard independiente "QA - TC-FUN-007 - Filtro de categoria" en "QA - Metabase" con las
// preguntas 42, 43 y 44 (IDs de configuracion/recursos-locales.json); filtro "Categoria" (Texto o
// categoria, operador Es, lista desplegable) vinculado a Products.Category en las tres; valor Gadget.
//
// - Creacion del dashboard, incorporacion de las preguntas, configuracion y vinculacion del filtro,
//   guardado, seleccion y eliminacion del valor: todo en la INTERFAZ.
// - Las consultas de las tarjetas se OBSERVAN con cy.intercept sin modificarlas (datos reales).
// - Referencia independiente de solo lectura: SQL sobre PRODUCTS (recuento y precio promedio).
// - El dashboard creado se CONSERVA como evidencia.

const api = (opciones, codigos = [200]) => cy.request({ failOnStatusCode: false, ...opciones }).then((r) => {
  expect(codigos, `codigo HTTP de ${opciones.method || 'GET'} ${opciones.url || opciones}`).to.include(r.status);
  return r;
});

const NOMBRE_BASE = 'QA - TC-FUN-007 - Filtro de categoría';
const COLECCION = 'QA - Metabase';
const ETIQUETA = 'Categoría';
const VALOR = 'Gadget';
const normalizar = (s) => String(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const exacto = (t) => new RegExp(`^\\s*${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
const rectanguloBarra = (d) => {
  const m = /^M([-\d.]+) ([-\d.]+)l([-\d.]+) 0l0 ([-\d.]+)l[-\d.]+ 0Z$/.exec(String(d).trim());
  return m ? { x: parseFloat(m[1]), ancho: parseFloat(m[3]), alto: -parseFloat(m[4]) } : null;
};
const traslacion = (el) => {
  const m = /translate\(\s*([-\d.]+)[ ,]+([-\d.]+)\s*\)/.exec(el.getAttribute('transform') || '');
  return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : null;
};
// Categorias del eje X y valor de cada barra (altura / escala del eje Y) de un grafico SVG de ECharts
const leerGrafico = (svg) => {
  const textos = [...svg.querySelectorAll('text')].map((t) => ({ texto: normalizar(t.textContent), pos: traslacion(t) })).filter((t) => t.pos);
  const ticks = textos.filter((t) => /^-?[\d.]+$/.test(t.texto)).map((t) => ({ valor: parseFloat(t.texto), y: t.pos.y }));
  const t0 = ticks.reduce((a, b) => (a.valor < b.valor ? a : b));
  const t1 = ticks.reduce((a, b) => (a.valor > b.valor ? a : b));
  const escala = (t0.y - t1.y) / (t1.valor - t0.valor);
  // Etiquetas de categoria: la fila de textos mas cercana bajo la linea base (excluye el titulo del eje X)
  const bajoEje = textos.filter((t) => t.pos.y > t0.y && !/^-?[\d.]+$/.test(t.texto));
  const yEtiquetas = Math.min(...bajoEje.map((t) => t.pos.y));
  const etiquetas = bajoEje.filter((t) => Math.abs(t.pos.y - yEtiquetas) < 1);
  const barras = [...svg.querySelectorAll('path')].filter((p) => (p.getAttribute('fill') || 'none') !== 'none')
    .map((p) => rectanguloBarra(p.getAttribute('d'))).filter(Boolean)
    .map((b) => {
      const c = b.x + b.ancho / 2;
      const e = etiquetas.reduce((a, x) => (Math.abs(x.pos.x - c) < Math.abs(a.pos.x - c) ? x : a));
      return { categoria: e.texto, valor: b.alto / escala };
    });
  return { etiquetas: etiquetas.map((e) => e.texto), barras, maximoEje: t1.valor };
};
const abrirBarraLateral = () => cy.get('[data-testid="main-navbar-root"]').then(($n) => {
  if (!Cypress.dom.isVisible($n.find('a[href^="/collection/"]').first())) { cy.get('[data-testid="sidebar-toggle"]').click(); }
});

describe('TC-FUN-007 - Aplicacion de filtros en dashboard', { testIsolation: false }, () => {
  const ref = { estados: {} };
  const idEjecucion = String(Cypress.config('screenshotsFolder')).split(/[\\/]/).filter(Boolean).pop();
  const tarjeta = (clave) => cy.contains('[data-testid="dashcard"]', ref.preguntas[clave].nombre);

  // Registra las 3 consultas de las tarjetas del dashboard (vista normal) y devuelve sus datos por pregunta
  const esperarTarjetas = (alias, estado) => {
    cy.wait([`@${alias}`, `@${alias}`, `@${alias}`], { timeout: 60000 }).then((xs) => {
      const datos = {};
      xs.forEach((x) => {
        expect([200, 202], 'codigo HTTP de la consulta de la tarjeta').to.include(x.response.statusCode);
        expect(x.response.body.status, 'estado de la consulta de la tarjeta').to.eq('completed');
        const cardId = Number(/\/card\/(\d+)\/query/.exec(x.request.url)[1]);
        const param = (x.request.body.parameters || []).find((p) => p.id === ref.parametroId);
        datos[cardId] = { rows: x.response.body.data.rows, cols: x.response.body.data.cols.map((c) => c.name), valorFiltro: param ? param.value : null };
      });
      expect(Object.keys(datos).map(Number).sort(), 'consultas de las tres preguntas').to.deep.eq(ref.ids.slice().sort());
      ref.estados[estado] = datos;
    });
  };

  // Comprueba los datos (respuesta real) y la representacion (interfaz) de las tres tarjetas
  const comprobarEstado = (estado, categorias) => {
    const d = ref.estados[estado];
    const { recuento, promedio, detalle } = ref.preguntas;
    const esperadoRecuento = categorias.map((c) => [c, ref.fuente[c].recuento]);
    expect(d[recuento.id].rows, `${estado}: recuento por categoria = fuente`).to.deep.eq(esperadoRecuento);
    expect(d[promedio.id].rows.map((r) => r[0]), `${estado}: categorias del precio promedio`).to.deep.eq(categorias);
    d[promedio.id].rows.forEach(([c, v]) => expect(Math.abs(v - ref.fuente[c].promedio), `${estado}: precio promedio de ${c} = fuente`).to.be.lt(1e-6));
    const iCat = d[detalle.id].cols.indexOf('CATEGORY');
    const catsDetalle = [...new Set(d[detalle.id].rows.map((r) => r[iCat]))].sort();
    expect(catsDetalle, `${estado}: categorias de los productos del detalle`).to.deep.eq(categorias);
    expect(d[detalle.id].rows.length, `${estado}: productos del detalle = fuente`).to.eq(categorias.reduce((s, c) => s + ref.fuente[c].recuento, 0));
    // Interfaz: graficos de barras (categorias del eje y valores por geometria)
    tarjeta('recuento').find('[data-testid="chart-container"] svg').should(($s) => {
      const g = leerGrafico($s[0]);
      expect(g.etiquetas, `${estado}: categorias del grafico de recuento`).to.deep.eq(categorias);
      g.barras.forEach((b) => expect(Math.abs(b.valor - ref.fuente[b.categoria].recuento), `${estado}: barra de recuento ${b.categoria}`).to.be.lt(0.5));
    });
    tarjeta('promedio').find('[data-testid="chart-container"] svg').should(($s) => {
      const g = leerGrafico($s[0]);
      expect(g.etiquetas, `${estado}: categorias del grafico de precio promedio`).to.deep.eq(categorias);
      g.barras.forEach((b) => expect(Math.abs(b.valor - ref.fuente[b.categoria].promedio), `${estado}: barra de promedio ${b.categoria}`).to.be.lt(g.maximoEje * 0.01));
    });
    // Interfaz: tabla de detalle (texto visible de la tarjeta)
    // Con filtro: SOLO la categoria filtrada en las filas visibles. Sin filtro: filas visibles de varias
    // categorias (la tabla muestra solo las primeras filas, por eso no se exigen las cuatro).
    tarjeta('detalle').should(($t) => {
      const texto = $t.text();
      const visibles = ref.todas.filter((c) => texto.includes(c));
      if (categorias.length === 1) {
        expect(visibles, `${estado}: categorias visibles en la tabla`).to.deep.eq(categorias);
      } else {
        expect(visibles.length, `${estado}: varias categorias visibles en la tabla (${visibles.join(', ')})`).to.be.gte(2);
      }
    });
  };

  before(() => {
    cy.env(['QA_EMAIL', 'QA_PASSWORD'], { log: false }).then(({ QA_EMAIL, QA_PASSWORD }) => {
      expect(Boolean(QA_EMAIL) && Boolean(QA_PASSWORD), 'precondicion: credenciales de usuario-qa definidas').to.eq(true);
      cy.request({ method: 'POST', url: '/api/session', body: { username: QA_EMAIL, password: QA_PASSWORD }, log: false, failOnStatusCode: false })
        .then((r) => expect(r.status, 'inicio de sesion por API de usuario-qa').to.eq(200));
    });
  });

  it('1. Disponibilidad, sesion, recursos locales y referencia de la fuente (solo lectura)', () => {
    api({ url: '/api/health' }).its('body.status').should('eq', 'ok');
    api({ url: '/api/user/current' }).then(({ body }) => {
      expect(`${body.first_name} ${body.last_name}`, 'usuario de la sesion').to.eq('Usuario QA');
      expect(body.is_superuser, 'cuenta normal').to.eq(false);
    });
    cy.readFile('configuracion/recursos-locales.json').then((cfg) => {
      ref.coleccionId = cfg.coleccion_qa_id;
      ref.principalId = cfg.dashboard_principal_id;
      ref.dbId = cfg.sample_database_id;
      ref.preguntas = {
        recuento: { id: cfg.preguntas.productos_por_categoria, nombre: 'QA - Productos por categoría' },
        promedio: { id: cfg.preguntas.precio_promedio_por_categoria, nombre: 'QA - Precio promedio por categoría' },
        detalle: { id: cfg.preguntas.detalle_productos, nombre: 'QA - Detalle de productos' },
      };
      ref.ids = Object.values(ref.preguntas).map((p) => p.id);
      ref.ids.concat([ref.coleccionId, ref.principalId, ref.dbId]).forEach((v) => expect(Number.isInteger(v), 'ID definido en recursos-locales.json').to.eq(true));
    });
    cy.then(() => api({ url: `/api/collection/${ref.coleccionId}` })).then(({ body }) => {
      expect(body.name, 'coleccion configurada').to.eq(COLECCION);
      expect(body.can_write, 'precondicion: coleccion con escritura').to.eq(true);
    });
    ref.actualizadas = {};
    cy.then(() => Object.values(ref.preguntas).forEach((p) => {
      api({ url: `/api/card/${p.id}` }).then(({ body }) => {
        expect(body.name, `pregunta ${p.id}`).to.eq(p.nombre);
        ref.actualizadas[p.id] = body.updated_at;
      });
    }));
    cy.then(() => api({ url: `/api/dashboard/${ref.principalId}` })).then(({ body }) => { ref.principal = { updated_at: body.updated_at, tarjetas: body.dashcards.length }; });
    cy.then(() => api({ url: `/api/database/${ref.dbId}/metadata` })).then(({ body }) => {
      const products = body.tables.find((t) => t.name === 'PRODUCTS');
      ref.categoryId = products.fields.find((f) => f.name === 'CATEGORY').id;
    });
    // Referencia independiente: SQL de solo lectura sobre la misma fuente (SQLite: tablas sin esquema)
    cy.then(() => api({ method: 'POST', url: '/api/dataset', body: { database: ref.dbId, type: 'native', native: { query: 'SELECT CATEGORY, COUNT(*), AVG(PRICE) FROM PRODUCTS GROUP BY CATEGORY ORDER BY CATEGORY' } } }, [200, 202]))
      .then(({ body }) => {
        expect(body.status, 'estado de la referencia SQL').to.eq('completed');
        ref.fuente = Object.fromEntries(body.data.rows.map(([c, n, a]) => [c, { recuento: n, promedio: a }]));
        ref.todas = body.data.rows.map((r) => r[0]);
        expect(ref.todas, 'categorias de la fuente').to.include(VALOR);
      });
  });

  it('2. Nombre del dashboard sin duplicados (solo lectura)', () => {
    api({ url: `/api/collection/${ref.coleccionId}/items`, qs: { models: 'dashboard' } }).then(({ body }) => {
      const items = body.data || body;
      const nombres = items.map((i) => i.name);
      ref.nombre = nombres.includes(NOMBRE_BASE) ? `${NOMBRE_BASE} - ${idEjecucion}` : NOMBRE_BASE;
      expect(nombres, 'el nombre definitivo no existe').not.to.include(ref.nombre);
      ref.dashboardsPrevios = items.map((i) => i.id);
    });
  });

  it('3. Se crea el dashboard de prueba en QA - Metabase desde la interfaz', () => {
    cy.visit('/');
    cy.get('[data-testid="app-bar"]').contains('button', 'Nuevo').click();
    cy.contains('[role="menu"] *', /^Dashboard$/).click();
    cy.contains('[role="dialog"]', 'Nuevo dashboard').should('be.visible').within(() => {
      cy.get('input[name="name"]').clear().type(ref.nombre).should('have.value', ref.nombre);
      cy.get('[data-testid="collection-picker-button"]').click();
    });
    cy.contains('[data-testid="picker-item"]', exacto(COLECCION)).click();
    cy.get('[data-testid="entity-picker-select-button"]').should('be.enabled').click();
    cy.get('[data-testid="collection-picker-button"]', { timeout: 15000 }).should('contain', COLECCION);
    cy.intercept('POST', '/api/dashboard').as('crear');
    cy.contains('[role="dialog"] button', /^Crear$/).click();
    cy.wait('@crear', { timeout: 30000 }).then((x) => {
      expect(x.response.statusCode, 'codigo HTTP de POST /api/dashboard').to.eq(200);
      expect(ref.dashboardsPrevios, 'ID nuevo').not.to.include(x.response.body.id);
      expect(x.response.body.name, 'nombre registrado').to.eq(ref.nombre);
      expect(x.response.body.collection_id, 'coleccion registrada').to.eq(ref.coleccionId);
      ref.dashboardId = x.response.body.id;
    });
    cy.get('[data-testid="edit-bar"]', { timeout: 30000 }).should('be.visible');
  });

  it('4. Se incorporan las tres preguntas desde Anadir preguntas', () => {
    cy.get('[data-testid="dashboard-header"] [aria-label="Añadir preguntas"]').click();
    Object.values(ref.preguntas).forEach((p) => {
      cy.intercept('POST', `/api/card/${p.id}/query`).as(`q${p.id}`);
      cy.get('[data-testid="add-card-sidebar"]').within(() => {
        cy.get('input[placeholder="Buscar…"]').clear().type(p.nombre);
        cy.contains('[data-testid="option-text"]', exacto(p.nombre), { timeout: 20000 }).click();
      });
      cy.wait(`@q${p.id}`, { timeout: 60000 }).its('response.body.status').should('eq', 'completed');
    });
    cy.get('[data-testid="dashcard"]').should('have.length', 3);
    Object.values(ref.preguntas).forEach((p) => cy.contains('[data-testid="dashcard"]', p.nombre).should('be.visible'));
    cy.screenshot('01-preguntas-incorporadas', { capture: 'viewport' });
  });

  it('5. Se configura el filtro Categoria (Texto o categoria, Es, lista) y se vincula a Products.Category en las tres preguntas', () => {
    cy.get('[data-testid="dashboard-header"] [aria-label="Añadir un filtro o parámetro"]').click();
    cy.get('[data-testid="add-filter-parameter-dropdown"]').contains(/^Texto o categoría$/).click();
    cy.get('[data-testid="dashboard-parameter-sidebar"]').should('be.visible').within(() => {
      cy.contains('Configuración del filtro').should('be.visible');
      cy.get('input').first().clear().type(ETIQUETA).blur();
      cy.get('input').first().should('have.value', ETIQUETA);
      cy.get('input[value="Texto o categoría"]').should('exist');
      cy.get('input[value="Es"]').should('exist');
      cy.get('input[type="radio"][value="list"]').should('be.checked');
    });
    Object.values(ref.preguntas).forEach((p) => {
      cy.contains('[data-testid="dashcard"]', p.nombre).find('[data-testid="parameter-mapper-container"] button').contains('Selecciona…').click();
      // Primera opcion "Category": la columna de la tabla PRODUCTS
      cy.get('[role="dialog"]').filter(':visible').last().contains(/^Category$/).click();
      cy.contains('[data-testid="dashcard"]', p.nombre).find('[data-testid="parameter-mapper-container"]').should('contain', 'Products.Category');
    });
    cy.screenshot('02-filtro-configurado-y-vinculado', { capture: 'viewport' });
  });

  it('6. Se guarda el dashboard: filtro y vinculaciones registrados (PUT /api/dashboard)', () => {
    cy.get('[data-testid="dashboard-parameter-sidebar"]').contains('button', /^Listo$/).click();
    cy.intercept('PUT', `/api/dashboard/${ref.dashboardId}`).as('guardar');
    cy.get('[data-testid="save-edit-button"]').click();
    cy.wait('@guardar', { timeout: 30000 }).then((x) => {
      expect(x.response.statusCode, 'codigo HTTP de PUT /api/dashboard/:id').to.eq(200);
      const params = x.response.body.parameters;
      expect(params.length, 'filtros guardados').to.eq(1);
      expect(params[0].name, 'etiqueta del filtro').to.eq(ETIQUETA);
      expect(params[0].type, 'tipo del filtro').to.eq('string/=');
      ref.parametroId = params[0].id;
      ref.parametro = params[0];
      const tarjetas = x.response.body.dashcards;
      expect(tarjetas.map((t) => t.card_id).sort(), 'preguntas guardadas').to.deep.eq(ref.ids.slice().sort());
      tarjetas.forEach((t) => {
        const m = t.parameter_mappings.find((pm) => pm.parameter_id === ref.parametroId);
        expect(Boolean(m), `tarjeta de la pregunta ${t.card_id} vinculada al filtro`).to.eq(true);
        expect(m.target[0], `destino del filtro en la pregunta ${t.card_id}`).to.eq('dimension');
        expect(m.target[1].find((v) => typeof v === 'number'), `campo vinculado en la pregunta ${t.card_id} (PRODUCTS.CATEGORY)`).to.eq(ref.categoryId);
      });
      ref.vinculaciones = tarjetas.map((t) => ({ card_id: t.card_id, target: t.parameter_mappings[0].target }));
    });
    cy.get('[data-testid="edit-bar"]').should('not.exist');
  });

  it('7. Estado inicial sin filtro: las tres visualizaciones muestran todas las categorias', () => {
    cy.intercept('POST', `/api/dashboard/${ref.dashboardId}/dashcard/*/card/*/query`).as('inicial');
    cy.visit(`/dashboard/${ref.dashboardId}`);
    esperarTarjetas('inicial', 'sin_filtro');
    cy.contains('[data-testid="parameter-widget"]', ETIQUETA).should('be.visible');
    cy.then(() => {
      Object.values(ref.estados.sin_filtro).forEach((t) => expect(t.valorFiltro == null, 'sin valor de filtro').to.eq(true));
      comprobarEstado('sin_filtro', ref.todas);
    });
    cy.screenshot('03-dashboard-sin-filtro', { capture: 'viewport' });
  });

  it('8. Se abre el selector Categoria y se elige Gadget (lista desplegable)', () => {
    cy.contains('[data-testid="parameter-widget"]', ETIQUETA).find('[data-testid="parameter-value-widget-target"]').click();
    cy.get('[data-testid="parameter-value-dropdown"]').should('be.visible').within(() => {
      cy.get('[data-testid="field-values-widget"] label', { timeout: 20000 }).then(($l) => {
        const opciones = [...$l].map((l) => normalizar(l.innerText)).filter((t) => t !== 'Seleccionar todo');
        expect(opciones, 'opciones de la lista = categorias existentes').to.deep.eq(ref.todas);
      });
      cy.contains('[data-testid="field-values-widget"] label', exacto(VALOR)).click();
      cy.contains('[data-testid="field-values-widget"] label', exacto(VALOR)).invoke('attr', 'for').then((id) => cy.get(`input[id="${id}"]`).should('be.checked'));
    });
    cy.screenshot('04-seleccion-gadget', { capture: 'viewport' });
  });

  it('9. Al aplicar Gadget las tres visualizaciones se actualizan solo con datos de Gadget', () => {
    cy.intercept('POST', `/api/dashboard/${ref.dashboardId}/dashcard/*/card/*/query`).as('filtrado');
    cy.get('[data-testid="parameter-value-dropdown"] button[type="submit"]').should('be.enabled').click();
    esperarTarjetas('filtrado', 'gadget');
    cy.location('search').should('contain', VALOR);
    cy.contains('[data-testid="parameter-widget"]', ETIQUETA).should('contain', VALOR);
    cy.then(() => {
      Object.values(ref.estados.gadget).forEach((t) => expect(t.valorFiltro, 'valor del filtro enviado').to.deep.eq([VALOR]));
      comprobarEstado('gadget', [VALOR]);
    });
    cy.screenshot('05-dashboard-filtrado-gadget', { capture: 'viewport' });
  });

  it('10. Al eliminar el filtro las visualizaciones regresan al estado sin filtro', () => {
    cy.intercept('POST', `/api/dashboard/${ref.dashboardId}/dashcard/*/card/*/query`).as('restaurado');
    cy.contains('[data-testid="parameter-widget"]', ETIQUETA).then(($w) => {
      const limpiar = [...$w.find('button')].find((b) => b.getAttribute('data-testid') !== 'parameter-value-widget-target');
      ref.botonLimpiar = limpiar ? limpiar.getAttribute('aria-label') : null;
      if (limpiar) {
        cy.wrap(limpiar).click();
      } else {
        cy.wrap($w).find('[data-testid="parameter-value-widget-target"]').click();
        cy.contains('[data-testid="field-values-widget"] label', exacto(VALOR)).click();
        cy.get('[data-testid="parameter-value-dropdown"] button[type="submit"]').click();
      }
    });
    esperarTarjetas('restaurado', 'restaurado');
    cy.location('search').should('not.contain', VALOR);
    cy.then(() => {
      Object.values(ref.estados.restaurado).forEach((t) => expect(t.valorFiltro == null, 'sin valor de filtro tras eliminarlo').to.eq(true));
      comprobarEstado('restaurado', ref.todas);
      ref.preguntasIds = ref.ids;
      expect(ref.estados.restaurado, 'datos restaurados = estado inicial').to.deep.eq(ref.estados.sin_filtro);
    });
    cy.screenshot('06-filtro-eliminado-restaurado', { capture: 'viewport' });
  });

  it('11. Persistencia de la configuracion y recursos protegidos (lectura complementaria por API)', () => {
    api({ url: `/api/dashboard/${ref.dashboardId}` }).then(({ body }) => {
      expect(body.name, 'nombre').to.eq(ref.nombre);
      expect(body.collection_id, 'coleccion').to.eq(ref.coleccionId);
      expect(body.parameters.length, 'filtros').to.eq(1);
      expect(body.parameters[0].name, 'etiqueta').to.eq(ETIQUETA);
      expect(body.parameters[0].default == null, 'sin valor predeterminado').to.eq(true);
      expect(body.dashcards.length, 'tarjetas').to.eq(3);
      body.dashcards.forEach((t) => expect(t.parameter_mappings.length, `vinculacion de la pregunta ${t.card_id}`).to.eq(1));
    });
    Object.values(ref.preguntas).forEach((p) => api({ url: `/api/card/${p.id}` }).its('body.updated_at').should('eq', ref.actualizadas[p.id]));
    api({ url: `/api/dashboard/${ref.principalId}` }).then(({ body }) => {
      expect(body.updated_at, 'dashboard principal sin modificar').to.eq(ref.principal.updated_at);
      expect(body.dashcards.length, 'tarjetas del dashboard principal').to.eq(ref.principal.tarjetas);
    });
    cy.then(() => {
      const dirResultados = String(Cypress.config('screenshotsFolder')).replace(/([\\/])evidencias([\\/])/, '$1resultados$2');
      const resumen = (estado) => ({
        recuento: ref.estados[estado][ref.preguntas.recuento.id].rows,
        precio_promedio: ref.estados[estado][ref.preguntas.promedio.id].rows,
        detalle_productos: ref.estados[estado][ref.preguntas.detalle.id].rows.length,
        detalle_categorias: [...new Set(ref.estados[estado][ref.preguntas.detalle.id].rows.map((r) => r[ref.estados[estado][ref.preguntas.detalle.id].cols.indexOf('CATEGORY')]))].sort(),
      });
      cy.writeFile(`${dirResultados}/filtro-dashboard.json`, {
        id_ejecucion: idEjecucion,
        dashboard: { id: ref.dashboardId, nombre: ref.nombre, coleccion_id: ref.coleccionId },
        nombre_ya_existia: ref.nombre !== NOMBRE_BASE,
        preguntas: ref.preguntas,
        filtro: { id: ref.parametroId, etiqueta: ref.parametro.name, tipo: ref.parametro.type, seccion: ref.parametro.sectionId, valor_probado: VALOR },
        vinculaciones: ref.vinculaciones,
        boton_eliminar_filtro: ref.botonLimpiar,
        referencia_fuente_sql: ref.fuente,
        sin_filtro: resumen('sin_filtro'),
        con_gadget: resumen('gadget'),
        tras_eliminar_filtro: resumen('restaurado'),
        recursos_protegidos_sin_cambios: true,
        conservado_como_evidencia: true,
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
