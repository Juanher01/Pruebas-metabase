// TC-FUN-003 — Ejecucion de consulta SQL (Metabase OSS v0.64.1)
// Plan: "Ejecutar una consulta SQL de lectura sobre una tabla disponible, utilizando una operacion de
// agregacion previamente definida." Esperado: "Se presenta el resultado de la consulta y el valor
// obtenido coincide con el resultado de referencia calculado sobre la misma fuente de datos."
// Consulta definida: SELECT COUNT(*) AS total_pedidos FROM orders;  (Sample Database > Orders)
//
// - La consulta se escribe y ejecuta en el EDITOR SQL de la interfaz (Nuevo > Consulta SQL) y NO se guarda.
// - La sesion se inicia por API con la cuenta usuario-qa (el inicio de sesion no es objeto del caso).
// - POST /api/dataset se OBSERVA con cy.intercept sin modificarlo: los datos son los reales.
// - Referencia independiente de solo lectura: recuento con el editor grafico (MBQL "count") sobre la
//   misma tabla, ejecutado por API sin guardar nada; se compara tambien con el valor historico R03.
// Selectores verificados en v0.64.1 (exploracion de la interfaz en espanol):
//   app-bar, selected-database, native-query-editor (.cm-content, CodeMirror 6), run-button,
//   scalar-value, query-display-tabular-toggle, table-root, table-header / header-cell,
//   table-body / body-cell-container, question-row-count.

// Todas las solicitudes usan failOnStatusCode:false y comprueban el codigo explicitamente: asi un fallo
// no vuelca la solicitud (con sus cookies de sesion) en el mensaje de error ni en el reporte.
const api = (opciones, codigos = [200]) => cy.request({ failOnStatusCode: false, ...opciones }).then((r) => {
  expect(codigos, `codigo HTTP de ${opciones.method || 'GET'} ${opciones.url || opciones}`).to.include(r.status);
  return r;
});

const CONSULTA = 'SELECT COUNT(*) AS total_pedidos\nFROM orders;';
const COLUMNA = 'total_pedidos';
const HISTORICO_R03 = 18760; // registrado durante la preparacion del ambiente (se vuelve a comprobar)
const normalizar = (s) => String(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const entero = (txt) => parseInt(String(txt).replace(/[^\d-]/g, ''), 10); // "18,760" / "18.760" -> 18760

describe('TC-FUN-003 - Ejecucion de consulta SQL', { testIsolation: false }, () => {
  const ref = {}; // metadatos y valores leidos durante la ejecucion
  let consulta; // solicitud y respuesta reales de la interfaz

  before(() => {
    cy.env(['QA_EMAIL', 'QA_PASSWORD'], { log: false }).then(({ QA_EMAIL, QA_PASSWORD }) => {
      expect(Boolean(QA_EMAIL) && Boolean(QA_PASSWORD), 'precondicion: credenciales de usuario-qa definidas').to.eq(true);
      cy.request({ method: 'POST', url: '/api/session', body: { username: QA_EMAIL, password: QA_PASSWORD }, log: false, failOnStatusCode: false })
        .then((r) => expect(r.status, 'inicio de sesion por API de usuario-qa').to.eq(200));
    });
  });

  it('1. Metabase disponible, sesion de Usuario QA y permiso SQL sobre Sample Database', () => {
    api({ url: '/api/health' }).its('body.status').should('eq', 'ok');
    api({ url: '/api/user/current' }).then(({ body }) => {
      expect(`${body.first_name} ${body.last_name}`, 'usuario de la sesion').to.eq('Usuario QA');
      expect(body.is_superuser, 'cuenta normal').to.eq(false);
    });
    api({ url: '/api/database' }).then(({ body }) => {
      const dbs = body.data || body;
      const sample = dbs.find((d) => d.is_sample === true || d.name === 'Sample Database');
      expect(Boolean(sample), 'Sample Database disponible').to.eq(true);
      ref.dbId = sample.id;
      ref.motor = sample.engine;
      expect(sample.native_permissions, 'precondicion: la cuenta puede escribir SQL en Sample Database').to.eq('write');
      return api({ url: `/api/database/${sample.id}/metadata` });
    }).then(({ body }) => {
      const orders = body.tables.find((t) => t.name === 'ORDERS');
      expect(Boolean(orders), 'tabla ORDERS disponible').to.eq(true);
      ref.ordersId = orders.id;
    });
  });

  it('2. Nuevo > Consulta SQL abre el editor SQL con Sample Database seleccionada', () => {
    cy.visit('/');
    cy.get('[data-testid="app-bar"]').contains('button', 'Nuevo').click();
    cy.contains('[role="menu"] *', /^Consulta SQL$/).click();
    cy.get('[data-testid="native-query-editor"]', { timeout: 20000 }).should('be.visible');
    // Con una sola base de datos disponible Metabase la preselecciona; si no, se elige en el selector.
    cy.get('[data-testid="selected-database"]').then(($db) => {
      if (normalizar($db.text()) !== 'Sample Database') {
        cy.wrap($db).click();
        cy.contains('[role="option"], [role="menuitem"], li', /^Sample Database$/).click();
      }
    });
    cy.get('[data-testid="selected-database"]').should('have.text', 'Sample Database');
    // Editor vacio: CodeMirror solo muestra su texto de ayuda (.cm-placeholder), sin SQL previo.
    cy.get('[data-testid="native-query-editor"] .cm-placeholder').should('exist');
    cy.get('[data-testid="native-query-editor"] .cm-line').then(($l) => {
      const sql = [...$l].map((e) => (e.querySelector('.cm-placeholder') ? '' : e.innerText)).join('').trim();
      expect(sql, 'el editor SQL inicia sin consulta previa').to.eq('');
    });
    cy.screenshot('01-editor-sql-sample-database', { capture: 'viewport' });
  });

  it('3. El editor SQL acepta la consulta definida', () => {
    const [l1, l2] = CONSULTA.split('\n');
    cy.get('[data-testid="native-query-editor"] .cm-content').click().type(`${l1}{enter}${l2}`, { delay: 15 });
    cy.get('[data-testid="native-query-editor"] .cm-line').then(($l) => {
      const lineas = [...$l].map((e) => e.innerText);
      expect(lineas.join('\n'), 'texto del editor SQL').to.eq(CONSULTA);
    });
    cy.screenshot('02-consulta-sql-escrita', { capture: 'viewport' });
  });

  it('4. Obtener respuesta ejecuta la consulta sin errores', () => {
    cy.intercept('POST', '/api/dataset').as('consulta'); // solo observacion, sin respuesta simulada
    cy.get('[data-testid="native-query-editor-container"] [data-testid="run-button"]').filter(':visible').first()
      .should('have.attr', 'aria-label', 'Obtener respuesta').click();
    cy.wait('@consulta', { timeout: 60000 }).then((x) => {
      consulta = x;
      expect([200, 202], 'codigo HTTP de POST /api/dataset').to.include(x.response.statusCode);
      expect(x.response.body.status, 'estado de la consulta').to.eq('completed');
      expect(x.response.body.error, 'sin error de consulta').to.eq(undefined);
      const dq = x.request.body.dataset_query || x.request.body;
      const sql = dq.stages ? dq.stages[0].native : dq.native.query;
      expect(dq.database, 'base de datos de la consulta').to.eq(ref.dbId);
      expect(sql, 'SQL enviado por la interfaz').to.eq(CONSULTA);
    });
    cy.get('[data-testid="query-visualization-root"]').should('not.contain', 'error');
    cy.get('[data-testid="scalar-value"]', { timeout: 60000 }).should('be.visible').then(($v) => { ref.valorEscalar = entero($v.text()); });
    cy.screenshot('03-resultado-agregado', { capture: 'viewport' });
  });

  it('5. Se presenta una tabla de resultados con la columna total_pedidos de tipo entero', () => {
    // Para un resultado 1x1 Metabase muestra por defecto un numero; se cambia a la vista de tabla.
    cy.get('[data-testid="query-display-tabular-toggle"]').click();
    cy.get('[data-testid="table-root"]', { timeout: 30000 }).should('be.visible');
    cy.get('[data-testid="table-header"] [data-testid="header-cell"]').then(($h) => {
      const cab = [...$h].map((e) => normalizar(e.innerText)).filter(Boolean);
      expect(cab, 'columnas visibles en la tabla').to.deep.eq([COLUMNA]);
    });
    const cols = consulta.response.body.data.cols;
    expect(cols.map((c) => c.name), 'columnas del resultado').to.deep.eq([COLUMNA]);
    expect(cols[0].base_type, 'tipo de la columna total_pedidos').to.match(/^type\/(Integer|BigInteger)$/);
    cy.screenshot('04-resultado-tabla', { capture: 'viewport' });
  });

  it('6. Se devuelve una unica fila con el recuento agregado', () => {
    const { rows } = consulta.response.body.data;
    expect(rows.length, 'filas devueltas').to.eq(1);
    expect(rows[0].length, 'valores en la fila').to.eq(1);
    expect(consulta.response.body.row_count, 'row_count informado por Metabase').to.eq(1);
    expect(Number.isInteger(rows[0][0]), 'el recuento es un entero').to.eq(true);
    ref.valorRespuesta = rows[0][0];
    cy.get('[data-testid="table-body"] [data-testid="body-cell-container"]').then(($c) => {
      const celdas = [...$c].map((e) => normalizar(e.innerText)).filter(Boolean);
      expect(celdas.length, 'celdas con valor en la tabla visible').to.eq(1);
      ref.valorTabla = entero(celdas[0]);
    });
    cy.get('[data-testid="question-row-count"]').invoke('text').then((t) => {
      ref.textoFilas = normalizar(t);
      expect(ref.textoFilas, 'contador de filas de la interfaz').to.match(/\b1 fila\b/);
    });
  });

  it('7. El valor presentado en la interfaz coincide con el devuelto por la consulta', () => {
    expect(ref.valorTabla, 'valor en la tabla = valor devuelto').to.eq(ref.valorRespuesta);
    expect(ref.valorEscalar, 'valor de la vista numerica = valor devuelto').to.eq(ref.valorRespuesta);
    expect(ref.valorRespuesta, 'recuento mayor que cero').to.be.gt(0);
  });

  it('8. El valor coincide con la referencia calculada sobre la misma fuente (mecanismo independiente)', () => {
    // Referencia: recuento del editor grafico (MBQL count) sobre ORDERS, ejecutado por API sin guardar.
    api({ method: 'POST', url: '/api/dataset', body: { database: ref.dbId, type: 'query', query: { 'source-table': ref.ordersId, aggregation: [['count']] } } }, [200, 202])
      .then(({ body }) => {
        expect(body.status, 'estado de la consulta de referencia (MBQL)').to.eq('completed');
        ref.referenciaMbql = body.data.rows[0][0];
      });
    cy.then(() => {
      expect(ref.referenciaMbql, 'referencia MBQL valida').to.be.gt(0);
      expect(ref.valorRespuesta, 'recuento SQL de la interfaz = referencia MBQL').to.eq(ref.referenciaMbql);
      // Comparacion con el valor historico R03: se registra; una diferencia exige investigar los datos.
      cy.log(`Historico R03 = ${HISTORICO_R03}; actual = ${ref.valorRespuesta}; coincide = ${ref.valorRespuesta === HISTORICO_R03}`);
      const dirResultados = String(Cypress.config('screenshotsFolder')).replace(/([\\/])evidencias([\\/])/, '$1resultados$2');
      cy.writeFile(`${dirResultados}/metricas-consulta.json`, {
        consulta_sql: CONSULTA,
        motor_base_datos: ref.motor,
        codigo_http_consulta: consulta.response.statusCode,
        estado_consulta: consulta.response.body.status,
        columnas: consulta.response.body.data.cols.map((c) => ({ name: c.name, base_type: c.base_type })),
        filas_devueltas: consulta.response.body.data.rows.length,
        row_count: consulta.response.body.row_count,
        valor_respuesta: ref.valorRespuesta,
        valor_tabla_interfaz: ref.valorTabla,
        valor_vista_numerica_interfaz: ref.valorEscalar,
        texto_contador_filas: ref.textoFilas,
        referencia_mbql_count: ref.referenciaMbql,
        historico_r03: HISTORICO_R03,
        coincide_con_historico: ref.valorRespuesta === HISTORICO_R03,
      });
    });
  });

  after(() => {
    cy.request({ method: 'DELETE', url: '/api/session', failOnStatusCode: false });
    cy.request({ url: '/api/user/current', failOnStatusCode: false }).its('status').should('eq', 401);
  });
});
