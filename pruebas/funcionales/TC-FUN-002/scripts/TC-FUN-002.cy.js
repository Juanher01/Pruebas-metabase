// TC-FUN-002 — Ejecucion de consulta mediante editor grafico (Metabase OSS v0.64.1)
// Plan: "Seleccionar una tabla de la base de datos de ejemplo, configurar un filtro valido y ejecutar
// la consulta." Esperado: "Se presentan registros que cumplen con los criterios de filtrado
// establecidos, conservando correspondencia con los datos de origen."
// Escenario (propuesta del equipo, caso.md): Sample Database > Orders, filtro Subtotal > 100, tabla.
//
// - La consulta se construye en el EDITOR GRAFICO (Nuevo > Pregunta) y NO se guarda.
// - La sesion se inicia por API con la cuenta usuario-qa (el inicio de sesion no es objeto del caso).
// - POST /api/dataset se OBSERVA con cy.intercept sin modificarlo: los datos son los reales.
// - Comprobacion complementaria de solo lectura: recuento SQL sobre la misma fuente.
// Selectores verificados en v0.64.1 (helpers e2e oficiales y exploracion de la interfaz en espanol):
//   app-bar, mini-picker, data-step-cell, step-filter-0-0, number-filter-picker,
//   [aria-label="Operador de filtro"], input[aria-label="Valor del filtro"], table-root,
//   table-header / header-cell, table-body / body-cell-container, question-row-count.

// Todas las solicitudes usan failOnStatusCode:false y comprueban el codigo explicitamente: asi un fallo
// no vuelca la solicitud (con sus cookies de sesion) en el mensaje de error ni en el reporte.
const api = (opciones, codigos = [200]) => cy.request({ failOnStatusCode: false, ...opciones }).then((r) => {
  expect(codigos, `codigo HTTP de ${opciones.method || 'GET'} ${opciones.url || opciones}`).to.include(r.status);
  return r;
});

const LIMITE_FILAS_UI = 2000; // default-unaggregated-query-row-limit en v0.64.1
const UMBRAL = 100;
const numero = (txt) => {
  const s = String(txt).replace(/\s/g, '').replace(/[^\d.,-]/g, '');
  // valores de Subtotal < 1000: la coma o el punto es el separador decimal
  return parseFloat(s.includes(',') && !s.includes('.') ? s.replace(',', '.') : s.replace(/,/g, ''));
};

describe('TC-FUN-002 - Ejecucion de consulta mediante editor grafico', { testIsolation: false }, () => {
  const ref = {}; // metadatos de referencia leidos por nombre (sin IDs fijos)
  let consulta; // solicitud y respuesta reales de la interfaz

  before(() => {
    cy.env(['QA_EMAIL', 'QA_PASSWORD'], { log: false }).then(({ QA_EMAIL, QA_PASSWORD }) => {
      expect(Boolean(QA_EMAIL) && Boolean(QA_PASSWORD), 'precondicion: credenciales de usuario-qa definidas').to.eq(true);
      cy.request({ method: 'POST', url: '/api/session', body: { username: QA_EMAIL, password: QA_PASSWORD }, log: false, failOnStatusCode: false })
        .then((r) => expect(r.status, 'inicio de sesion por API de usuario-qa').to.eq(200));
    });
  });

  it('1. Metabase disponible y sesion de Usuario QA activa', () => {
    api({ url: '/api/health' }).its('body.status').should('eq', 'ok');
    api({ url: '/api/user/current' }).then(({ body }) => {
      expect(`${body.first_name} ${body.last_name}`, 'usuario de la sesion').to.eq('Usuario QA');
      expect(body.is_superuser, 'cuenta normal').to.eq(false);
    });
    // Referencias por nombre: Sample Database, tabla ORDERS y campo SUBTOTAL (solo lectura)
    api({ url: '/api/database' }).then(({ body }) => {
      const dbs = body.data || body;
      const sample = dbs.find((d) => d.is_sample === true || d.name === 'Sample Database');
      expect(Boolean(sample), 'Sample Database disponible').to.eq(true);
      ref.dbId = sample.id;
      return api({ url: `/api/database/${sample.id}/metadata` });
    }).then(({ body }) => {
      const orders = body.tables.find((t) => t.name === 'ORDERS');
      expect(Boolean(orders), 'tabla ORDERS disponible').to.eq(true);
      const subtotal = orders.fields.find((f) => f.name === 'SUBTOTAL');
      expect(Boolean(subtotal), 'campo SUBTOTAL disponible').to.eq(true);
      ref.ordersId = orders.id;
      ref.subtotalId = subtotal.id;
    });
  });

  it('2. Nuevo > Pregunta abre el editor grafico y permite elegir Sample Database > Orders', () => {
    cy.visit('/');
    cy.get('[data-testid="app-bar"]').contains('button', 'Nuevo').click();
    cy.contains('[role="menu"] *', /^Pregunta$/).click();
    cy.location('pathname', { timeout: 20000 }).should('eq', '/question/notebook');
    cy.get('[data-testid="mini-picker"]', { timeout: 20000 }).should('be.visible').contains('Sample Database').click();
    cy.get('[data-testid="mini-picker"]').contains(/^Orders$/).click();
    cy.get('[data-testid="data-step-cell"]', { timeout: 20000 }).should('contain', 'Orders');
    cy.contains('Sample Database').should('be.visible');
    cy.screenshot('01-seleccion-tabla-orders', { capture: 'viewport' });
  });

  it('3. Se configura el filtro Subtotal "Mayor que" 100 en el paso Filtro', () => {
    cy.get('[data-testid="step-filter-0-0"]').contains('Añade filtros para acotar tu respuesta').click();
    cy.get('[data-testid="clause-popover"]').filter(':visible').contains(/^Subtotal$/).click();
    cy.get('[data-testid="number-filter-picker"]').should('be.visible').within(() => {
      cy.get('[aria-label="Operador de filtro"]').click();
    });
    cy.contains('[role="menu"] *', /^Mayor que$/).click();
    cy.get('[data-testid="number-filter-picker"]').within(() => {
      cy.get('[aria-label="Operador de filtro"]').should('contain', 'Mayor que');
      cy.get('input[aria-label="Valor del filtro"]').clear().type(String(UMBRAL)).should('have.value', String(UMBRAL));
    });
    cy.screenshot('02-configuracion-filtro', { capture: 'viewport' });
    cy.get('[data-testid="number-filter-picker"] button[type="submit"]').should('be.enabled').click();
    cy.get('[data-testid="step-filter-0-0"]').should('contain', 'Subtotal').and('contain', String(UMBRAL));
    cy.screenshot('03-filtro-aplicado', { capture: 'viewport' });
  });

  it('4. Visualizar ejecuta la consulta y Metabase responde con resultados completados', () => {
    cy.intercept('POST', '/api/dataset').as('consulta'); // solo observacion, sin respuesta simulada
    cy.contains('button', 'Visualizar').click();
    cy.wait('@consulta', { timeout: 60000 }).then((x) => {
      consulta = x;
      expect([200, 202], 'codigo HTTP de POST /api/dataset').to.include(x.response.statusCode);
      expect(x.response.body.status, 'estado de la consulta').to.eq('completed');
      expect(x.response.body.error, 'sin error de consulta').to.eq(undefined);
    });
    cy.get('[data-testid="table-root"]', { timeout: 60000 }).should('be.visible');
    cy.get('[data-testid="question-row-count"]', { timeout: 60000 }).should('be.visible');
    cy.screenshot('04-resultados-consulta', { capture: 'viewport' });
  });

  it('5. La consulta ejecutada corresponde al escenario: Orders, Subtotal, mayor que, 100', () => {
    const dq = consulta.request.body.dataset_query || consulta.request.body;
    let tabla; let filtros;
    if (dq.stages) { tabla = dq.stages[0]['source-table']; filtros = dq.stages[0].filters || []; } else { tabla = dq.query['source-table']; filtros = [dq.query.filter]; }
    expect(dq.database, 'base de datos de la consulta').to.eq(ref.dbId);
    expect(tabla, 'tabla de origen (ORDERS)').to.eq(ref.ordersId);
    expect(filtros.length, 'numero de filtros').to.eq(1);
    const [op, ...args] = filtros[0];
    const campo = args.find((a) => Array.isArray(a) && a[0] === 'field');
    const idCampo = campo.find((v) => typeof v === 'number');
    expect(op, 'operador').to.eq('>');
    expect(idCampo, 'campo (SUBTOTAL)').to.eq(ref.subtotalId);
    expect(args[args.length - 1], 'valor').to.eq(UMBRAL);
  });

  it('6. Se muestran registros y todos los devueltos cumplen Subtotal > 100', () => {
    const datos = consulta.response.body.data;
    const iSub = datos.cols.findIndex((c) => c.name === 'SUBTOTAL');
    expect(iSub, 'columna SUBTOTAL en el resultado').to.be.gte(0);
    expect(datos.rows.length, 'registros devueltos').to.be.gt(0);
    const incumplen = datos.rows.filter((r) => !(r[iSub] > UMBRAL));
    expect(incumplen.length, `registros devueltos con Subtotal <= ${UMBRAL} (de ${datos.rows.length})`).to.eq(0);
    ref.filasDevueltas = datos.rows.length;
    ref.rowCount = consulta.response.body.row_count;
    ref.minSubtotal = Math.min(...datos.rows.map((r) => r[iSub]));
    cy.get('[data-testid="table-body"] [data-testid="body-cell-container"]').should('have.length.greaterThan', 0);
  });

  it('7. Los valores de Subtotal visibles en la tabla de la interfaz cumplen la condicion', () => {
    cy.get('[data-testid="table-header"] [data-testid="header-cell"]').then(($h) => {
      const cab = [...$h].map((e) => e.innerText.trim());
      const iCab = cab.indexOf('Subtotal');
      expect(iCab, 'columna Subtotal visible en la tabla').to.be.gte(0);
      cy.get('[data-testid="table-body"]').then(($b) => {
        const filas = [...$b[0].querySelectorAll('[role="row"]')].length
          ? [...$b[0].querySelectorAll('[role="row"]')]
          : [...$b[0].children].filter((f) => f.querySelector('[data-testid="body-cell-container"]'));
        const valores = filas.map((f) => {
          const celdas = f.querySelectorAll('[data-testid="body-cell-container"]');
          const desfase = celdas.length - cab.length; // columna fija de detalle, si existe
          const c = celdas[iCab + Math.max(desfase, 0)];
          return c ? numero(c.innerText) : NaN;
        }).filter((v) => !Number.isNaN(v));
        ref.valoresVisibles = valores.length;
        expect(valores.length, 'valores de Subtotal leidos en filas visibles').to.be.gt(0);
        expect(valores.filter((v) => !(v > UMBRAL)).length, `valores visibles con Subtotal <= ${UMBRAL} (de ${valores.length})`).to.eq(0);
      });
    });
  });

  it('8. Correspondencia con los datos de origen (recuento SQL de solo lectura como referencia)', () => {
    // Sample Database usa SQLite en v0.64.1: las tablas se nombran sin esquema (ORDERS, no PUBLIC.ORDERS).
    const sql = (q) => api({ method: 'POST', url: '/api/dataset', body: { database: ref.dbId, type: 'native', native: { query: q } } }, [200, 202])
      .then(({ body }) => { expect(body.status, `estado de la consulta SQL: ${q}`).to.eq('completed'); return body.data.rows[0][0]; });
    sql(`SELECT COUNT(*) FROM ORDERS WHERE SUBTOTAL > ${UMBRAL}`).then((n) => { ref.totalFuente = n; });
    sql(`SELECT COUNT(*) FROM ORDERS WHERE SUBTOTAL <= ${UMBRAL}`).then((m) => { ref.excluidosFuente = m; });
    cy.then(() => {
      const esperadas = Math.min(ref.totalFuente, LIMITE_FILAS_UI);
      expect(ref.totalFuente, 'registros de origen que cumplen el filtro (SQL)').to.be.gt(0);
      expect(ref.excluidosFuente, 'registros de origen excluidos por el filtro (SQL)').to.be.gt(0);
      expect(ref.filasDevueltas, `filas devueltas = min(total de origen, limite ${LIMITE_FILAS_UI})`).to.eq(esperadas);
      expect(ref.rowCount, 'row_count informado por Metabase').to.eq(esperadas);
      const texto = ref.totalFuente > LIMITE_FILAS_UI ? 'Mostrando las primeras' : 'Mostrando';
      cy.get('[data-testid="question-row-count"]').should('contain', texto);
      // Carpeta de resultados de ESTA ejecucion: equivalente a la de evidencias (fijada por el script).
      const dirResultados = String(Cypress.config('screenshotsFolder')).replace(/([\\/])evidencias([\\/])/, '$1resultados$2');
      cy.writeFile(`${dirResultados}/metricas-consulta.json`, {
        total_origen_subtotal_mayor_100: ref.totalFuente,
        total_origen_subtotal_menor_igual_100: ref.excluidosFuente,
        filas_devueltas_interfaz: ref.filasDevueltas,
        row_count: ref.rowCount,
        limite_filas_ui: LIMITE_FILAS_UI,
        subtotal_minimo_devuelto: ref.minSubtotal,
        valores_visibles_comprobados: ref.valoresVisibles,
      });
    });
  });

  after(() => {
    cy.request({ method: 'DELETE', url: '/api/session', failOnStatusCode: false });
    cy.request({ url: '/api/user/current', failOnStatusCode: false }).its('status').should('eq', 401);
  });
});
