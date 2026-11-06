// TC-VAL-004 — Parametro inexistente en consulta (Metabase OSS v0.64.1)
// Plan: "Aplicar un filtro de texto con el valor QA_VALOR_INEXISTENTE_2026, previamente verificado como ausente
// en la columna seleccionada." Esperado: "La consulta se procesa sin errores inesperados y presenta un resultado
// vacio, indicando que no existen registros que cumplan con el criterio especificado."
//
// Campo: la solicitud de ejecucion proponia Products.Title con el operador "Es". En v0.64.1 Title (y todos los
// campos de texto de Products) usan una LISTA cerrada de valores: el selector "Es" solo permite elegir valores
// existentes, por lo que no admite el valor inexistente (se registra en la prueba 2 como evidencia). Por eso el
// escenario formal usa otro campo de texto compatible, People.Name (has_field_values = search), que admite
// valores libres con el mismo operador "Es" y el mismo valor.
//
// - Toda la interaccion se hace en el EDITOR GRAFICO; la consulta NO se guarda.
// - POST /api/dataset se OBSERVA (sin modificarlo). Referencia de solo lectura: recuento SQL (R06 = 0).

const api = (opciones, codigos = [200]) => cy.request({ failOnStatusCode: false, ...opciones }).then((r) => {
  expect(codigos, `codigo HTTP de ${opciones.method || 'GET'} ${opciones.url || opciones}`).to.include(r.status);
  return r;
});

const VALOR = 'QA_VALOR_INEXISTENTE_2026';
const SELECTOR_ERRORES = '[role="alert"], [class*="-error"], [class*="Error"]';
const normalizar = (s) => String(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

const nuevaPregunta = (tabla) => {
  cy.visit('/');
  cy.get('[data-testid="app-bar"]').contains('button', 'Nuevo').click();
  cy.contains('[role="menu"] *', /^Pregunta$/).click();
  cy.location('pathname', { timeout: 20000 }).should('eq', '/question/notebook');
  cy.get('[data-testid="mini-picker"]', { timeout: 20000 }).should('be.visible').contains('Sample Database').click();
  cy.get('[data-testid="mini-picker"]').contains(new RegExp(`^${tabla}$`)).click();
  cy.get('[data-testid="data-step-cell"]', { timeout: 20000 }).should('contain', tabla);
};
const abrirFiltroEs = (columna) => {
  cy.get('[data-testid="step-filter-0-0"]').contains('Añade filtros para acotar tu respuesta').click();
  cy.get('[data-testid="clause-popover"]').filter(':visible').contains(new RegExp(`^${columna}$`)).click();
  cy.get('[data-testid="string-filter-picker"]', { timeout: 20000 }).should('be.visible')
    .find('[aria-label="Operador de filtro"]').should('contain', 'Es');
};

describe('TC-VAL-004 - Parametro inexistente en consulta', { testIsolation: false }, () => {
  const ref = { excepciones: [] };
  let consulta;

  before(() => {
    cy.on('uncaught:exception', (err) => { ref.excepciones.push(String(err && err.message).slice(0, 300)); return false; });
    cy.env(['QA_EMAIL', 'QA_PASSWORD'], { log: false }).then(({ QA_EMAIL, QA_PASSWORD }) => {
      expect(Boolean(QA_EMAIL) && Boolean(QA_PASSWORD), 'precondicion: credenciales de usuario-qa definidas').to.eq(true);
      cy.request({ method: 'POST', url: '/api/session', body: { username: QA_EMAIL, password: QA_PASSWORD }, log: false, failOnStatusCode: false })
        .then((r) => expect(r.status, 'inicio de sesion por API de usuario-qa').to.eq(200));
    });
  });

  it('1. Disponibilidad, sesion, campos de texto y comprobacion previa: el valor no existe (solo lectura)', () => {
    api({ url: '/api/health' }).its('body.status').should('eq', 'ok');
    api({ url: '/api/user/current' }).then(({ body }) => {
      expect(`${body.first_name} ${body.last_name}`, 'usuario de la sesion').to.eq('Usuario QA');
      expect(body.is_superuser, 'cuenta normal').to.eq(false);
    });
    cy.readFile('configuracion/recursos-locales.json').then((cfg) => {
      ref.dbId = cfg.sample_database_id;
      return api({ url: `/api/database/${ref.dbId}/metadata` });
    }).then(({ body }) => {
      const products = body.tables.find((t) => t.name === 'PRODUCTS');
      const people = body.tables.find((t) => t.name === 'PEOPLE');
      const title = products.fields.find((f) => f.name === 'TITLE');
      const name = people.fields.find((f) => f.name === 'NAME');
      ref.title = { id: title.id, base_type: title.base_type, has_field_values: title.has_field_values };
      ref.name = { id: name.id, base_type: name.base_type, has_field_values: name.has_field_values };
      ref.peopleId = people.id;
      expect(title.base_type, 'Products.Title es texto').to.eq('type/Text');
      expect(name.base_type, 'People.Name es texto').to.eq('type/Text');
    });
    cy.then(() => api({ method: 'POST', url: '/api/dataset', body: { database: ref.dbId, type: 'native', native: { query: `SELECT (SELECT COUNT(*) FROM PRODUCTS WHERE TITLE = '${VALOR}'), (SELECT COUNT(*) FROM PEOPLE WHERE NAME = '${VALOR}'), (SELECT COUNT(*) FROM PEOPLE)` } } }, [200, 202]))
      .then(({ body }) => {
        expect(body.status, 'estado de la comprobacion previa').to.eq('completed');
        [ref.fuenteTitle, ref.fuenteName, ref.totalPeople] = body.data.rows[0];
        expect(ref.fuenteTitle, `registros con Products.Title = ${VALOR} (R06)`).to.eq(0);
        expect(ref.fuenteName, `registros con People.Name = ${VALOR}`).to.eq(0);
        expect(ref.totalPeople, 'People tiene registros (la tabla no esta vacia)').to.be.gt(0);
      });
  });

  it('2. Registro: con Products.Title el selector "Es" es una lista cerrada y no admite el valor inexistente', () => {
    nuevaPregunta('Products');
    abrirFiltroEs('Title');
    cy.get('[data-testid="string-filter-picker"]').find('input').first().type(VALOR, { delay: 10 });
    cy.wait(1500, { log: false });
    cy.get('[data-testid="string-filter-picker"]').then(($p) => {
      ref.comportamientoTitle = {
        has_field_values: ref.title.has_field_values,
        tipo_de_control: $p.find('input').first().attr('placeholder'),
        texto_mostrado: normalizar($p.text()),
        casillas_coincidentes: $p.find('input[type="checkbox"]').length,
        boton_anadir_filtro_habilitado: !$p.find('button[type="submit"]').prop('disabled'),
      };
    });
    cy.get('[data-testid="string-filter-picker"]').find('input').first().type('{enter}');
    cy.get('[data-testid="string-filter-picker"] button[type="submit"]').then(($b) => { ref.comportamientoTitle.boton_tras_enter_habilitado = !$b.prop('disabled'); });
    cy.screenshot('01-products-title-lista-sin-coincidencias', { capture: 'viewport' });
  });

  it('3. Escenario formal: People.Name, operador Es, se introduce QA_VALOR_INEXISTENTE_2026 y se acepta', () => {
    nuevaPregunta('People');
    abrirFiltroEs('Name');
    cy.get('[data-testid="string-filter-picker"]').within(() => {
      cy.get('input[aria-label="Valor del filtro"]').should('have.attr', 'role', 'combobox').type(VALOR, { delay: 10 });
      cy.get('input[aria-label="Valor del filtro"]').should('have.value', VALOR);
    });
    cy.get('[data-testid="string-filter-picker"]').invoke('text').then((t) => { ref.avisoBusqueda = normalizar(t); });
    cy.screenshot('02-valor-inexistente-introducido', { capture: 'viewport' });
    // Enter confirma el texto como valor del filtro (etiqueta con boton Eliminar)
    cy.get('[data-testid="string-filter-picker"] input[aria-label="Valor del filtro"]').type('{enter}');
    cy.get('[data-testid="string-filter-picker"]').within(() => {
      cy.contains(new RegExp(`^${VALOR}$`)).should('be.visible');
      cy.get('button[aria-label="Eliminar"]').should('exist');
      cy.get('input[type="hidden"]').should('have.value', VALOR);
      cy.get('input[aria-label="Valor del filtro"]').should(($i) => expect($i.attr('aria-invalid'), 'campo no marcado como invalido').not.to.eq('true'));
      cy.get(SELECTOR_ERRORES).should('not.exist');
      cy.get('button[type="submit"]').should('be.enabled').and('contain', 'Añadir filtro');
    });
  });

  it('4. Se confirma el filtro: Name Es QA_VALOR_INEXISTENTE_2026', () => {
    cy.get('[data-testid="string-filter-picker"] button[type="submit"]').click();
    cy.get('[data-testid="string-filter-picker"]').should('not.exist');
    cy.get('[data-testid="step-filter-0-0"]').should('contain', 'Name').and('contain', VALOR)
      .invoke('text').then((t) => { ref.pasoFiltro = normalizar(t).replace(/To pick up a draggable item.*?cancel\./, '').trim(); });
    cy.screenshot('03-filtro-configurado', { capture: 'viewport' });
  });

  it('5. La consulta termina correctamente (completed) con 0 registros y la definicion enviada es la esperada', () => {
    cy.intercept('POST', '/api/dataset').as('consulta'); // solo observacion
    cy.contains('button', 'Visualizar').click();
    cy.wait('@consulta', { timeout: 60000 }).then((x) => {
      consulta = x;
      const b = x.response.body;
      expect([200, 202], 'codigo HTTP de POST /api/dataset').to.include(x.response.statusCode);
      expect(b.status, 'la consulta termina de procesarse').to.eq('completed');
      expect(b.error, 'sin error de consulta').to.eq(undefined);
      const dq = x.request.body.dataset_query || x.request.body;
      const etapa = dq.stages ? dq.stages[0] : dq.query;
      const filtros = dq.stages ? etapa.filters : [etapa.filter];
      expect(etapa['source-table'], 'tabla PEOPLE').to.eq(ref.peopleId);
      expect(filtros.length, 'un filtro').to.eq(1);
      const [op, ...args] = filtros[0];
      expect(op, 'operador de igualdad').to.eq('=');
      expect(args.find((a) => Array.isArray(a) && a[0] === 'field').find((v) => typeof v === 'number'), 'campo NAME').to.eq(ref.name.id);
      expect(args[args.length - 1], 'valor del filtro (texto exacto)').to.eq(VALOR);
      expect(b.data.cols.length, 'la consulta devuelve la estructura de columnas de People').to.be.gt(0);
      expect(b.data.rows, 'filas devueltas').to.deep.eq([]);
      expect(b.row_count, 'row_count').to.eq(0);
      ref.respuesta = { codigo: x.response.statusCode, status: b.status, row_count: b.row_count, filas: b.data.rows.length, columnas: b.data.cols.length };
    });
  });

  it('6. La interfaz representa la ausencia de resultados sin errores', () => {
    cy.get('[data-testid="query-visualization-root"]', { timeout: 30000 }).should('contain', 'Sin resultados')
      .invoke('text').then((t) => { ref.estadoVacio = normalizar(t); });
    cy.get('[data-testid="query-visualization-root"]').should('not.contain', 'Error').and('not.contain', 'error');
    cy.get('[data-testid="question-row-count"]').should('contain', 'Mostrando 0 filas');
    cy.get('[data-testid="filter-pill"]').should('have.length', 1).and('contain', VALOR).invoke('text').then((t) => { ref.pildora = normalizar(t); });
    cy.get('[data-testid="table-body"] [data-testid="body-cell-container"]').should('not.exist');
    cy.screenshot('04-resultado-vacio', { capture: 'viewport' });
    cy.then(() => {
      expect(ref.excepciones, 'excepciones no controladas de la aplicacion').to.deep.eq([]);
      const dirResultados = String(Cypress.config('screenshotsFolder')).replace(/([\\/])evidencias([\\/])/, '$1resultados$2');
      cy.writeFile(`${dirResultados}/resultado-valor-inexistente.json`, {
        valor: VALOR,
        comprobacion_previa_sql: { products_title_igual_valor: ref.fuenteTitle, people_name_igual_valor: ref.fuenteName, total_people: ref.totalPeople },
        campo_propuesto_products_title: { ...ref.title, comportamiento: ref.comportamientoTitle },
        campo_utilizado_people_name: ref.name,
        aviso_al_buscar: ref.avisoBusqueda,
        paso_filtro: ref.pasoFiltro,
        pildora_filtro: ref.pildora,
        respuesta_consulta: ref.respuesta,
        estado_vacio_interfaz: ref.estadoVacio,
        excepciones_no_controladas: ref.excepciones,
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
