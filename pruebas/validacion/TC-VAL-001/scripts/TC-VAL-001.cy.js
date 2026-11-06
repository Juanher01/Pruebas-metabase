// TC-VAL-001 — Parametro valido en filtro de consulta (Metabase OSS v0.64.1)
// Plan: "Seleccionar una columna numerica de la base de datos de ejemplo, aplicar un filtro con un valor valido
// y ejecutar la consulta mediante el editor grafico." Esperado: "Se presentan los registros que cumplen con el
// criterio especificado, conservando la correspondencia entre el valor utilizado y los resultados obtenidos."
// Datos de esta ejecucion: Sample Database > Orders, columna numerica Subtotal, operador "Mayor que", valor 100.
//
// - La entrada se introduce en el EDITOR GRAFICO (sin SQL). La consulta NO se guarda.
// - Se comprueba la ACEPTACION de la entrada (campo valido, sin mensajes de error, boton habilitado, valor
//   numerico en la consulta enviada) y su EFECTO (todos los registros cumplen Subtotal > 100 y su numero
//   corresponde a la fuente).
// - POST /api/dataset se OBSERVA con cy.intercept sin modificarlo. Referencia de solo lectura: recuento SQL.
// Ejecucion independiente de TC-FUN-002: selectores comunes, evidencias y datos propios.

const api = (opciones, codigos = [200]) => cy.request({ failOnStatusCode: false, ...opciones }).then((r) => {
  expect(codigos, `codigo HTTP de ${opciones.method || 'GET'} ${opciones.url || opciones}`).to.include(r.status);
  return r;
});

const VALOR = 100; // dato seleccionado para esta ejecucion (no es un umbral de validacion de Metabase)
const LIMITE_FILAS_UI = 2000; // default-unaggregated-query-row-limit de v0.64.1
// Valores formateados de la interfaz ("101.02", "1,234.5" o "101,02"): se convierten a numero
const numero = (txt) => {
  const s = String(txt).replace(/\s/g, '').replace(/[^\d.,-]/g, '');
  if (s === '') { return NaN; }
  if (s.includes(',') && s.includes('.')) { return parseFloat(s.replace(/,/g, '')); }
  if (s.includes(',')) { return parseFloat(/,\d{3}$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.')); }
  return parseFloat(s);
};

describe('TC-VAL-001 - Parametro valido en filtro de consulta', { testIsolation: false }, () => {
  const ref = {};
  let consulta;

  before(() => {
    cy.env(['QA_EMAIL', 'QA_PASSWORD'], { log: false }).then(({ QA_EMAIL, QA_PASSWORD }) => {
      expect(Boolean(QA_EMAIL) && Boolean(QA_PASSWORD), 'precondicion: credenciales de usuario-qa definidas').to.eq(true);
      cy.request({ method: 'POST', url: '/api/session', body: { username: QA_EMAIL, password: QA_PASSWORD }, log: false, failOnStatusCode: false })
        .then((r) => expect(r.status, 'inicio de sesion por API de usuario-qa').to.eq(200));
    });
  });

  it('1. Metabase disponible, sesion de Usuario QA y columna numerica Subtotal disponible', () => {
    api({ url: '/api/health' }).its('body.status').should('eq', 'ok');
    api({ url: '/api/user/current' }).then(({ body }) => {
      expect(`${body.first_name} ${body.last_name}`, 'usuario de la sesion').to.eq('Usuario QA');
      expect(body.is_superuser, 'cuenta normal').to.eq(false);
    });
    cy.readFile('configuracion/recursos-locales.json').then((cfg) => {
      ref.dbId = cfg.sample_database_id;
      return api({ url: `/api/database/${ref.dbId}/metadata` });
    }).then(({ body }) => {
      const orders = body.tables.find((t) => t.name === 'ORDERS');
      expect(Boolean(orders), 'tabla ORDERS disponible').to.eq(true);
      const subtotal = orders.fields.find((f) => f.name === 'SUBTOTAL');
      expect(Boolean(subtotal), 'campo SUBTOTAL disponible').to.eq(true);
      expect(subtotal.base_type, 'Subtotal es una columna numerica').to.match(/^type\/(Float|Decimal|Integer|BigInteger|Number)$/);
      ref.ordersId = orders.id;
      ref.subtotalId = subtotal.id;
      ref.tipoSubtotal = subtotal.base_type;
    });
  });

  it('2. Nuevo > Pregunta (editor grafico): Sample Database > Orders', () => {
    cy.visit('/');
    cy.get('[data-testid="app-bar"]').contains('button', 'Nuevo').click();
    cy.contains('[role="menu"] *', /^Pregunta$/).click();
    cy.location('pathname', { timeout: 20000 }).should('eq', '/question/notebook');
    cy.get('[data-testid="mini-picker"]', { timeout: 20000 }).should('be.visible').contains('Sample Database').click();
    cy.get('[data-testid="mini-picker"]').contains(/^Orders$/).click();
    cy.get('[data-testid="data-step-cell"]', { timeout: 20000 }).should('contain', 'Orders');
  });

  it('3. Filtro: columna numerica Subtotal, operador Mayor que, entrada 100 aceptada', () => {
    cy.get('[data-testid="step-filter-0-0"]').contains('Añade filtros para acotar tu respuesta').click();
    cy.get('[data-testid="clause-popover"]').filter(':visible').contains(/^Subtotal$/).click();
    // Selector de filtro NUMERICO (propio de columnas numericas)
    cy.get('[data-testid="number-filter-picker"]').should('be.visible').within(() => {
      cy.get('[aria-label="Operador de filtro"]').click();
    });
    cy.contains('[role="menu"] *', /^Mayor que$/).click();
    cy.get('[data-testid="number-filter-picker"]').within(() => {
      cy.get('[aria-label="Operador de filtro"]').should('contain', 'Mayor que');
      cy.get('input[aria-label="Valor del filtro"]').clear().type(String(VALOR));
      // Aceptacion de la entrada: valor conservado, campo no marcado como invalido, sin mensajes de error
      cy.get('input[aria-label="Valor del filtro"]').should('have.value', String(VALOR))
        .and(($i) => expect($i.attr('aria-invalid'), 'campo no marcado como invalido').not.to.eq('true'));
      // Mensajes de validacion: role=alert o elementos de error de los campos de Mantine (p. ej. *-Input-error)
      cy.get('[role="alert"], [class*="-error"], [class*="Error"]').should('not.exist');
      cy.get('button[type="submit"]').should('be.enabled').and('contain', 'Añadir filtro');
    });
    cy.screenshot('01-entrada-numerica-aceptada', { capture: 'viewport' });
    cy.get('[data-testid="number-filter-picker"] button[type="submit"]').click();
    cy.get('[data-testid="number-filter-picker"]').should('not.exist');
    // El filtro conserva la columna, el operador y el valor introducido
    cy.get('[data-testid="step-filter-0-0"]').should('contain', 'Subtotal').and('contain', String(VALOR));
    cy.get('[data-testid="step-filter-0-0"]').invoke('text').then((t) => { ref.textoPasoFiltro = t.replace(/\s+/g, ' ').trim(); });
    cy.screenshot('02-filtro-configurado', { capture: 'viewport' });
  });

  it('4. La consulta se ejecuta sin errores con el filtro Subtotal > 100 (valor numerico)', () => {
    cy.intercept('POST', '/api/dataset').as('consulta'); // solo observacion
    cy.contains('button', 'Visualizar').click();
    cy.wait('@consulta', { timeout: 60000 }).then((x) => {
      consulta = x;
      expect([200, 202], 'codigo HTTP de POST /api/dataset').to.include(x.response.statusCode);
      expect(x.response.body.status, 'estado de la consulta').to.eq('completed');
      expect(x.response.body.error, 'sin error de procesamiento').to.eq(undefined);
      const dq = x.request.body.dataset_query || x.request.body;
      const etapa = dq.stages ? dq.stages[0] : dq.query;
      const filtros = dq.stages ? (etapa.filters || []) : [etapa.filter];
      expect(dq.database, 'base de datos').to.eq(ref.dbId);
      expect(etapa['source-table'], 'tabla ORDERS').to.eq(ref.ordersId);
      expect(filtros.length, 'un filtro').to.eq(1);
      const [op, ...args] = filtros[0];
      const campo = args.find((a) => Array.isArray(a) && a[0] === 'field');
      const valor = args[args.length - 1];
      expect(op, 'operador').to.eq('>');
      expect(campo.find((v) => typeof v === 'number'), 'campo SUBTOTAL').to.eq(ref.subtotalId);
      expect(typeof valor, 'la entrada se envia como numero').to.eq('number');
      expect(valor, 'valor del filtro').to.eq(VALOR);
      ref.filtroEnviado = { operador: op, campo: ref.subtotalId, valor, tipo: typeof valor };
    });
    cy.get('[data-testid="table-root"]', { timeout: 60000 }).should('be.visible');
    cy.get('[data-testid="query-visualization-root"]').should('not.contain', 'error').and('not.contain', 'Error');
    cy.get('[data-testid="filter-pill"]').should('have.length', 1).and('contain', 'Subtotal').and('contain', String(VALOR))
      .invoke('text').then((t) => { ref.pildora = t.replace(/\s+/g, ' ').trim(); });
    cy.get('[data-testid="question-row-count"]').should('be.visible').invoke('text').then((t) => { ref.contador = t.replace(/\s+/g, ' ').trim(); });
    cy.screenshot('03-resultados-filtrados', { capture: 'viewport' });
  });

  it('5. Todos los registros devueltos tienen Subtotal numerico y mayor que 100', () => {
    const { cols, rows } = consulta.response.body.data;
    const i = cols.findIndex((c) => c.name === 'SUBTOTAL');
    expect(i, 'columna SUBTOTAL en el resultado').to.be.gte(0);
    expect(rows.length, 'existen registros que cumplen la condicion').to.be.gt(0);
    const noNumericos = rows.filter((r) => typeof r[i] !== 'number' || Number.isNaN(r[i]));
    const incumplen = rows.filter((r) => !(r[i] > VALOR));
    expect(noNumericos.length, `valores de Subtotal no numericos (de ${rows.length})`).to.eq(0);
    expect(incumplen.length, `registros con Subtotal <= ${VALOR} (de ${rows.length})`).to.eq(0);
    ref.filas = rows.length;
    ref.rowCount = consulta.response.body.row_count;
    ref.minimo = Math.min(...rows.map((r) => r[i]));
    ref.maximo = Math.max(...rows.map((r) => r[i]));
  });

  it('6. Los valores de Subtotal visibles en la tabla son numericos y mayores que 100', () => {
    cy.get('[data-testid="table-header"] [data-testid="header-cell"]').then(($h) => {
      const cab = [...$h].map((e) => e.innerText.trim());
      const iCab = cab.indexOf('Subtotal');
      expect(iCab, 'columna Subtotal visible').to.be.gte(0);
      cy.get('[data-testid="table-body"]').then(($b) => {
        const filas = [...$b[0].querySelectorAll('[role="row"]')].length
          ? [...$b[0].querySelectorAll('[role="row"]')]
          : [...$b[0].children].filter((f) => f.querySelector('[data-testid="body-cell-container"]'));
        const textos = filas.map((f) => {
          const celdas = f.querySelectorAll('[data-testid="body-cell-container"]');
          const c = celdas[iCab + Math.max(celdas.length - cab.length, 0)];
          return c ? c.innerText.trim() : '';
        }).filter((t) => t !== '');
        const valores = textos.map(numero);
        ref.visibles = textos.length;
        ref.ejemplosVisibles = textos.slice(0, 5);
        expect(textos.length, 'valores de Subtotal leidos en filas visibles').to.be.gt(0);
        expect(valores.filter((v) => Number.isNaN(v)).length, 'valores visibles no numericos').to.eq(0);
        expect(valores.filter((v) => !(v > VALOR)).length, `valores visibles <= ${VALOR} (de ${valores.length})`).to.eq(0);
      });
    });
  });

  it('7. Correspondencia con la fuente: numero de registros = recuento de Subtotal > 100 (limite de filas)', () => {
    const sql = (q) => api({ method: 'POST', url: '/api/dataset', body: { database: ref.dbId, type: 'native', native: { query: q } } }, [200, 202])
      .then(({ body }) => { expect(body.status, `estado de: ${q}`).to.eq('completed'); return body.data.rows[0][0]; });
    sql(`SELECT COUNT(*) FROM ORDERS WHERE SUBTOTAL > ${VALOR}`).then((n) => { ref.fuenteCumplen = n; });
    sql(`SELECT COUNT(*) FROM ORDERS WHERE SUBTOTAL <= ${VALOR}`).then((n) => { ref.fuenteExcluidos = n; });
    cy.then(() => {
      const esperadas = Math.min(ref.fuenteCumplen, LIMITE_FILAS_UI);
      expect(ref.fuenteCumplen, 'registros de la fuente que cumplen').to.be.gt(0);
      expect(ref.fuenteExcluidos, 'registros de la fuente excluidos por el filtro').to.be.gt(0);
      expect(ref.filas, `filas devueltas = min(fuente, limite ${LIMITE_FILAS_UI})`).to.eq(esperadas);
      expect(ref.rowCount, 'row_count').to.eq(esperadas);
      cy.get('[data-testid="question-row-count"]').should('contain', ref.fuenteCumplen > LIMITE_FILAS_UI ? 'Mostrando las primeras' : 'Mostrando');
      const dirResultados = String(Cypress.config('screenshotsFolder')).replace(/([\\/])evidencias([\\/])/, '$1resultados$2');
      cy.writeFile(`${dirResultados}/validacion-filtro.json`, {
        dato_introducido: VALOR,
        columna: { nombre: 'Subtotal', campo_id: ref.subtotalId, tipo: ref.tipoSubtotal },
        filtro_enviado_por_la_interfaz: ref.filtroEnviado,
        texto_paso_filtro: ref.textoPasoFiltro,
        pildora_filtro: ref.pildora,
        contador_filas_interfaz: ref.contador,
        filas_devueltas: ref.filas,
        row_count: ref.rowCount,
        limite_filas_ui: LIMITE_FILAS_UI,
        subtotal_minimo_devuelto: ref.minimo,
        subtotal_maximo_devuelto: ref.maximo,
        valores_visibles_comprobados: ref.visibles,
        ejemplos_valores_visibles: ref.ejemplosVisibles,
        fuente_cumplen_subtotal_mayor_100: ref.fuenteCumplen,
        fuente_excluidos_subtotal_menor_igual_100: ref.fuenteExcluidos,
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
