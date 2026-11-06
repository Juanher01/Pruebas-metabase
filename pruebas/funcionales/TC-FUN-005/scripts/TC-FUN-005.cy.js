// TC-FUN-005 — Visualizacion grafica de resultados (Metabase OSS v0.64.1)
// Plan: "Ejecutar una consulta con datos compatibles con una visualizacion de barras y seleccionar dicho
// tipo de grafico." Esperado: "El sistema representa los datos mediante un grafico de barras cuyos
// valores y categorias coinciden con los resultados de la consulta."
// Datos: Sample Database > Products, Resumir "Recuento de filas" agrupado por Category, grafico de barras.
//
// - La consulta se construye en el EDITOR GRAFICO y la visualizacion se SELECCIONA en la interfaz
//   (Visualizacion > Tabla para leer los resultados > Barra). Nada se guarda.
// - POST /api/dataset se OBSERVA con cy.intercept sin modificarlo: los datos son los reales.
// - El grafico (ECharts en SVG) se comprueba de tres formas independientes:
//     a) etiquetas del eje X (categorias representadas);
//     b) altura geometrica de cada barra convertida a valor con la escala del eje Y;
//     c) tooltip mostrado al pasar el puntero sobre cada barra (categoria y recuento).
// - Referencia de solo lectura: recuento SQL agrupado sobre la misma tabla (R04).
// Selectores verificados en v0.64.1 (exploracion de la interfaz en espanol):
//   aggregate-step, aggregation-picker, breakout-step, viz-type-button, Tabla-button, Barra-button
//   (data-is-selected), chart-container, echarts-tooltip, echarts-tooltip-header, table-root.

const api = (opciones, codigos = [200]) => cy.request({ failOnStatusCode: false, ...opciones }).then((r) => {
  expect(codigos, `codigo HTTP de ${opciones.method || 'GET'} ${opciones.url || opciones}`).to.include(r.status);
  return r;
});

const normalizar = (s) => String(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const entero = (t) => parseInt(String(t).replace(/[^\d-]/g, ''), 10);
const traslacion = (el) => {
  const m = /translate\(\s*([-\d.]+)[ ,]+([-\d.]+)\s*\)/.exec(el.getAttribute('transform') || '');
  return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : null;
};
// Barra rectangular de ECharts: "M x y l w 0 l 0 -h l -w 0 Z"
const rectanguloBarra = (d) => {
  const m = /^M([-\d.]+) ([-\d.]+)l([-\d.]+) 0l0 ([-\d.]+)l[-\d.]+ 0Z$/.exec(String(d).trim());
  return m ? { x: parseFloat(m[1]), base: parseFloat(m[2]), ancho: parseFloat(m[3]), alto: -parseFloat(m[4]) } : null;
};

describe('TC-FUN-005 - Visualizacion grafica de resultados', { testIsolation: false }, () => {
  const ref = {}; // datos de la ejecucion
  let consulta; // solicitud y respuesta reales de la interfaz

  before(() => {
    cy.env(['QA_EMAIL', 'QA_PASSWORD'], { log: false }).then(({ QA_EMAIL, QA_PASSWORD }) => {
      expect(Boolean(QA_EMAIL) && Boolean(QA_PASSWORD), 'precondicion: credenciales de usuario-qa definidas').to.eq(true);
      cy.request({ method: 'POST', url: '/api/session', body: { username: QA_EMAIL, password: QA_PASSWORD }, log: false, failOnStatusCode: false })
        .then((r) => expect(r.status, 'inicio de sesion por API de usuario-qa').to.eq(200));
    });
  });

  it('1. Metabase disponible, sesion de Usuario QA y referencia de origen por categoria (solo lectura)', () => {
    api({ url: '/api/health' }).its('body.status').should('eq', 'ok');
    api({ url: '/api/user/current' }).then(({ body }) => {
      expect(`${body.first_name} ${body.last_name}`, 'usuario de la sesion').to.eq('Usuario QA');
      expect(body.is_superuser, 'cuenta normal').to.eq(false);
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
      // Referencia R04 calculada sobre la misma fuente (SQLite: tablas sin esquema)
      return api({ method: 'POST', url: '/api/dataset', body: { database: ref.dbId, type: 'native', native: { query: 'SELECT CATEGORY, COUNT(*) AS PRODUCTOS FROM PRODUCTS GROUP BY CATEGORY ORDER BY CATEGORY' } } }, [200, 202]);
    }).then(({ body }) => {
      expect(body.status, 'estado del recuento de referencia').to.eq('completed');
      ref.referencia = Object.fromEntries(body.data.rows.map(([c, n]) => [c, n]));
      ref.categorias = body.data.rows.map(([c]) => c);
      expect(ref.categorias.length, 'categorias en la fuente').to.be.gt(1);
      ['Doohickey', 'Gadget', 'Gizmo', 'Widget'].forEach((c) => expect(ref.categorias, 'categorias de la fuente').to.include(c));
    });
  });

  it('2. Editor grafico: Products, Resumir Recuento de filas por Category', () => {
    cy.visit('/');
    cy.get('[data-testid="app-bar"]').contains('button', 'Nuevo').click();
    cy.contains('[role="menu"] *', /^Pregunta$/).click();
    cy.location('pathname', { timeout: 20000 }).should('eq', '/question/notebook');
    cy.get('[data-testid="mini-picker"]', { timeout: 20000 }).should('be.visible').contains('Sample Database').click();
    cy.get('[data-testid="mini-picker"]').contains(/^Products$/).click();
    cy.get('[data-testid="data-step-cell"]', { timeout: 20000 }).should('contain', 'Products');
    cy.get('[data-testid="aggregate-step"]').contains('Elige una función o métrica').click();
    cy.contains('[data-testid="aggregation-picker"] *', /^Recuento de filas$/).click();
    cy.get('[data-testid="breakout-step"]').contains('Elige una columna para agrupar por').click();
    cy.contains('[data-testid="clause-popover"] *', /^Category$/).click();
    cy.get('[data-testid="aggregate-step"]').should('contain', 'Recuento');
    cy.get('[data-testid="breakout-step"]').should('contain', 'Category');
    cy.screenshot('01-editor-grafico-recuento-por-categoria', { capture: 'viewport' });
  });

  it('3. Visualizar ejecuta la consulta y devuelve el recuento por categoria', () => {
    cy.intercept('POST', '/api/dataset').as('consulta'); // solo observacion
    cy.contains('button', 'Visualizar').click();
    cy.wait('@consulta', { timeout: 60000 }).then((x) => {
      consulta = x;
      expect([200, 202], 'codigo HTTP de POST /api/dataset').to.include(x.response.statusCode);
      expect(x.response.body.status, 'estado de la consulta').to.eq('completed');
      expect(x.response.body.error, 'sin error de consulta').to.eq(undefined);
      const dq = x.request.body.dataset_query || x.request.body;
      const etapa = dq.stages ? dq.stages[0] : dq.query;
      expect(dq.database, 'base de datos').to.eq(ref.dbId);
      expect(etapa['source-table'], 'tabla de origen (PRODUCTS)').to.eq(ref.productsId);
      expect(etapa.aggregation.map((a) => a[0]), 'agregacion').to.deep.eq(['count']);
      expect(etapa.breakout.length, 'una agrupacion').to.eq(1);
      expect(etapa.breakout[0].find((v) => typeof v === 'number'), 'agrupacion por CATEGORY').to.eq(ref.categoryId);
      const { rows, cols } = x.response.body.data;
      expect(cols.length, 'columnas del resultado').to.eq(2);
      ref.nombreEjeX = cols[0].display_name;
      ref.nombreEjeY = cols[1].display_name;
      ref.consulta = Object.fromEntries(rows.map(([c, n]) => [c, n]));
      expect(Object.keys(ref.consulta), 'categorias de la consulta = categorias de la fuente').to.deep.eq(ref.categorias);
      expect(ref.consulta, 'recuentos de la consulta = referencia de la fuente').to.deep.eq(ref.referencia);
    });
    cy.get('[data-testid="chart-container"] svg', { timeout: 60000 }).should('be.visible');
  });

  it('4. Vista de Tabla seleccionada: la interfaz muestra los mismos recuentos', () => {
    cy.get('[data-testid="viz-type-button"]').click();
    cy.get('[data-testid="Tabla-button"]').click();
    cy.get('[data-testid="Tabla-button"]').should('have.attr', 'data-is-selected', 'true');
    cy.get('[data-testid="table-root"]', { timeout: 30000 }).should('be.visible');
    cy.get('[data-testid="table-body"] [data-testid="body-cell-container"]').then(($c) => {
      const celdas = [...$c].map((e) => normalizar(e.innerText));
      const pares = {};
      for (let i = 0; i + 1 < celdas.length; i += 2) { pares[celdas[i]] = entero(celdas[i + 1]); }
      ref.tabla = pares;
      expect(pares, 'tabla visible = resultado de la consulta').to.deep.eq(ref.consulta);
    });
    cy.screenshot('02-resultados-en-tabla', { capture: 'viewport' });
  });

  it('5. Se selecciona Barra y se representa un grafico de barras', () => {
    cy.get('[data-testid="Barra-button"]').click();
    cy.get('[data-testid="Barra-button"]').should('have.attr', 'data-is-selected', 'true');
    cy.get('[data-testid="Tabla-button"]').should('have.attr', 'data-is-selected', 'false');
    // El panel de visualizacion queda abierto (muestra "Barra" seleccionada): cerrarlo redimensiona el
    // grafico y desplaza las coordenadas del hover. Se espera a que el SVG tenga un tamano estable.
    cy.get('[data-testid="table-root"]').should('not.exist');
    let anchoPrevio = -1;
    cy.get('[data-testid="chart-container"] svg', { timeout: 30000 }).should(($s) => {
      const ancho = $s[0].getBoundingClientRect().width;
      const estable = ancho > 0 && Math.abs(ancho - anchoPrevio) < 0.5;
      anchoPrevio = ancho;
      expect(estable, 'grafico con tamano estable').to.eq(true);
    });
    cy.get('[data-testid="chart-container"] svg', { timeout: 30000 }).should('be.visible')
      .find('path').filter((i, p) => rectanguloBarra(p.getAttribute('d')) !== null && (p.getAttribute('fill') || 'none') !== 'none')
      .should('have.length', ref.categorias.length);
    cy.get('[data-testid="query-visualization-root"]').should('not.contain', 'error');
    cy.screenshot('03-grafico-de-barras', { capture: 'viewport' });
  });

  it('6. Las categorias del eje X son exactamente las de la consulta, sin faltantes ni sobrantes', () => {
    cy.get('[data-testid="chart-container"] svg').then(($svg) => {
      const textos = [...$svg[0].querySelectorAll('text')].map((t) => ({ texto: normalizar(t.textContent), pos: traslacion(t) })).filter((t) => t.pos);
      const ticks = textos.filter((t) => /^-?\d+$/.test(t.texto));
      const yCero = ticks.find((t) => t.texto === '0').pos.y;
      // Etiquetas de categoria: debajo de la linea base, sin los titulos de los ejes
      const etiquetas = textos.filter((t) => t.pos.y > yCero && t.texto !== ref.nombreEjeX && t.texto !== ref.nombreEjeY && !/^-?\d+$/.test(t.texto));
      ref.ejeY = ticks.map((t) => ({ valor: entero(t.texto), y: t.pos.y }));
      ref.etiquetas = etiquetas.map((t) => ({ categoria: t.texto, x: t.pos.x }));
      expect(ref.etiquetas.map((e) => e.categoria), 'categorias representadas en el eje X').to.deep.eq(ref.categorias);
    });
  });

  it('7. La altura de cada barra corresponde al recuento de su categoria (escala del eje Y)', () => {
    cy.get('[data-testid="chart-container"] svg').then(($svg) => {
      // Escala: relacion lineal entre los valores de las marcas del eje Y y su posicion vertical
      const t0 = ref.ejeY.reduce((a, b) => (a.valor < b.valor ? a : b));
      const t1 = ref.ejeY.reduce((a, b) => (a.valor > b.valor ? a : b));
      const pxPorUnidad = (t0.y - t1.y) / (t1.valor - t0.valor);
      expect(pxPorUnidad, 'escala del eje Y').to.be.gt(0);
      const barras = [...$svg[0].querySelectorAll('path')]
        .filter((p) => (p.getAttribute('fill') || 'none') !== 'none')
        .map((p) => rectanguloBarra(p.getAttribute('d'))).filter(Boolean);
      expect(barras.length, 'numero de barras = numero de categorias').to.eq(ref.categorias.length);
      ref.barras = barras.map((b) => {
        const centro = b.x + b.ancho / 2;
        const etiqueta = ref.etiquetas.reduce((a, e) => (Math.abs(e.x - centro) < Math.abs(a.x - centro) ? e : a));
        expect(Math.abs(etiqueta.x - centro), `barra centrada bajo la etiqueta ${etiqueta.categoria}`).to.be.lt(b.ancho / 2);
        expect(Math.abs(b.base - t0.y), `barra ${etiqueta.categoria} parte de la linea base`).to.be.lt(1);
        return { categoria: etiqueta.categoria, centro, alto_px: b.alto, valor: b.alto / pxPorUnidad };
      });
      expect(new Set(ref.barras.map((b) => b.categoria)).size, 'una barra por categoria (sin duplicadas)').to.eq(ref.categorias.length);
      ref.barras.forEach((b) => {
        expect(Math.abs(b.valor - ref.consulta[b.categoria]), `valor de la barra ${b.categoria} (${b.valor.toFixed(3)}) = recuento ${ref.consulta[b.categoria]}`).to.be.lt(0.5);
      });
      ref.pxPorUnidad = pxPorUnidad;
    });
  });

  it('8. El tooltip de cada barra muestra su categoria y su recuento', () => {
    ref.tooltips = {};
    ref.categorias.forEach((categoria) => {
      cy.get('[data-testid="chart-container"] svg').then(($svg) => {
        // La barra se identifica por su GEOMETRIA (centro bajo la etiqueta de su categoria), no por su
        // posicion en el DOM: ECharts reordena los elementos al resaltar una barra.
        const { centro } = ref.barras.find((b) => b.categoria === categoria);
        const barra = [...$svg[0].querySelectorAll('path')].find((p) => {
          const b = (p.getAttribute('fill') || 'none') !== 'none' && rectanguloBarra(p.getAttribute('d'));
          return b && Math.abs(b.x + b.ancho / 2 - centro) < 1;
        });
        expect(Boolean(barra), `barra de ${categoria} localizada`).to.eq(true);
        // Hover real: la barra se desplaza a la vista (la pagina tiene desplazamiento horizontal) y se
        // mueve el puntero sobre ella con sus coordenadas de pantalla, reintentando hasta que ECharts
        // muestre el tooltip de ESA categoria.
        cy.wrap(barra).scrollIntoView({ offset: { left: -200, top: 0 } });
        const pasarPuntero = (intento) => {
          const r = barra.getBoundingClientRect();
          const punto = { clientX: r.left + r.width * (0.4 + 0.05 * intento), clientY: r.top + r.height * (0.5 + 0.05 * intento), force: true, scrollBehavior: false };
          cy.get('[data-testid="chart-container"]').trigger('mousemove', punto);
          cy.wrap(barra).trigger('mousemove', punto);
          cy.wait(400, { log: false });
          cy.get('body').then(($b) => {
            const cab = $b.find('[data-testid="echarts-tooltip"] [data-testid="echarts-tooltip-header"]');
            if (normalizar(cab.text()) !== categoria && intento < 4) { pasarPuntero(intento + 1); }
          });
        };
        pasarPuntero(0);
        cy.get('[data-testid="echarts-tooltip"]', { timeout: 10000 }).should(($t) => {
          expect(normalizar($t.find('[data-testid="echarts-tooltip-header"]').text()), 'categoria del tooltip').to.eq(categoria);
        }).then(($t) => {
          const texto = normalizar($t.text());
          const numero = entero(texto.replace(categoria, ''));
          ref.tooltips[categoria] = numero;
          expect(texto, 'el tooltip nombra la metrica').to.contain(ref.nombreEjeY);
          expect(numero, `recuento del tooltip de ${categoria}`).to.eq(ref.consulta[categoria]);
        });
        if (categoria === 'Gadget') {
          cy.get('[data-testid="echarts-tooltip"]').should('be.visible');
          cy.screenshot('04-hover-barra-gadget', { capture: 'viewport', disableTimersAndAnimations: false });
        }
      });
    });
    cy.then(() => {
      const dirResultados = String(Cypress.config('screenshotsFolder')).replace(/([\\/])evidencias([\\/])/, '$1resultados$2');
      cy.writeFile(`${dirResultados}/comparacion-grafico.json`, {
        consulta: 'Products: Recuento de filas agrupado por Category',
        codigo_http_consulta: consulta.response.statusCode,
        escala_px_por_unidad: ref.pxPorUnidad,
        comparacion: ref.categorias.map((c) => {
          const barra = ref.barras.find((b) => b.categoria === c);
          return {
            categoria: c,
            referencia_sql: ref.referencia[c],
            resultado_consulta: ref.consulta[c],
            tabla_interfaz: ref.tabla[c],
            barra_alto_px: Number(barra.alto_px.toFixed(4)),
            barra_valor_por_escala: Number(barra.valor.toFixed(4)),
            tooltip: ref.tooltips[c],
            coincide: [ref.consulta[c], ref.tabla[c], Math.round(barra.valor), ref.tooltips[c]].every((v) => v === ref.referencia[c]),
          };
        }),
      });
    });
  });

  // Pruebas secuenciales: si una falla, se detiene la ejecucion
  afterEach(function detenerSiFalla() {
    if (this.currentTest.state === 'failed') { Cypress.stop(); }
  });

  after(() => {
    cy.request({ method: 'DELETE', url: '/api/session', failOnStatusCode: false });
    cy.request({ url: '/api/user/current', failOnStatusCode: false }).its('status').should('eq', 401);
  });
});
