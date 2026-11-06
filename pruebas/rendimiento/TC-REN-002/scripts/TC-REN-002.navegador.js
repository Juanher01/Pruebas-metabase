/*
 * TC-REN-002: tiempo de carga de un dashboard con tres visualizaciones (SLO: >= 9 de 10 cargas < 6000 ms).
 *
 * Uso (lo invoca scripts/ejecutar-herramienta.ps1 -Herramienta navegador):
 *   node TC-REN-002.navegador.js <variables.json> <carpeta-resultados> <carpeta-evidencias>
 *
 * Medicion (definicion del equipo, coherente con el plan: "desde el inicio de la navegacion hasta que las
 * visualizaciones estan completamente cargadas"):
 *   - Inicio: navigationStart de la pagina (performance.timeOrigin).
 *   - Fin: primer instante (requestAnimationFrame) en que se cumple TODO:
 *       1. las 3 consultas de tarjetas del dashboard (.../dashcard/N/card/M/query) terminaron;
 *       2. hay 3 tarjetas (dashcard) en el DOM, cada una con una visualizacion (svg/canvas/tabla);
 *       3. no queda ningun indicador de carga;
 *       4. el titulo de la pestana ya no muestra "n/3 cargado" y es el del dashboard.
 *   - Cada carga usa un contexto de navegador nuevo (cache del navegador vacia y sin cookies previas).
 *     La cache de consultas del servidor se deja como esta configurada (desactivada por defecto en Metabase).
 *   - La sesion se entrega como cookie metabase.SESSION; el token nunca se escribe en los resultados.
 */
const fs = require('fs');
const path = require('path');

const [, , varsFile, dirRes, dirEvi] = process.argv;
const vars = JSON.parse(fs.readFileSync(varsFile, 'utf8').replace(/^\uFEFF/, ''));
const puppeteer = require(path.resolve(__dirname, '../../../../recursos-compartidos/navegador/node_modules/puppeteer-core'));

const CARGAS = 10;
const LIMITE_MS = 6000;
const TIMEOUT_MS = 60000;
const candidatos = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];
const exe = candidatos.find((p) => fs.existsSync(p));
if (!exe) { console.error('No se encontro Chrome ni Edge.'); process.exit(2); }

const baseUrl = vars.baseUrl;
const url = `${baseUrl}/dashboard/${vars.dashboardId}`;
const host = new URL(baseUrl).hostname;

// Se inyecta en cada documento: registra en window.__tCarga el primer instante en que la carga esta completa.
const vigilante = () => {
  window.__tCarga = null;
  const completa = () => {
    const tarjetas = document.querySelectorAll('[data-testid="dashcard"]');
    if (tarjetas.length !== 3) return false;
    if (![...tarjetas].every((t) => t.querySelector('svg, canvas, [data-testid="TableInteractive-root"], [data-testid="table-root"]'))) return false;
    if (document.querySelector('[data-testid="loading-indicator"], [data-testid="loading-spinner"]')) return false;
    if (/\d+\/\d+/.test(document.title) || !/·\s*Dashboard\s*·/.test(document.title)) return false;
    const consultas = performance.getEntriesByType('resource').filter((e) => /\/dashcard\/\d+\/card\/\d+\/query/.test(e.name) && e.responseEnd > 0);
    return consultas.length >= 3;
  };
  const tick = () => {
    if (window.__tCarga === null && completa()) window.__tCarga = performance.now();
    if (window.__tCarga === null) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

(async () => {
  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-first-run', '--disable-extensions'] });
  const version = await browser.version();
  const cargas = [];
  for (let i = 1; i <= CARGAS; i++) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.setViewport({ width: 1366, height: 900 });
    await page.setCacheEnabled(false);
    await ctx.setCookie({ name: 'metabase.SESSION', value: vars.sessionId, domain: host, path: '/', httpOnly: true });
    await page.evaluateOnNewDocument(vigilante);
    const fallos = []; const consultas = []; let erroresConsola = 0;
    page.on('console', (m) => { if (m.type() === 'error') erroresConsola++; });
    page.on('response', (r) => {
      const u = r.url();
      if (!u.startsWith(baseUrl + '/api/')) return;
      if (r.status() >= 400) fallos.push(`${r.status()} ${u.replace(baseUrl, '').split('?')[0]}`);
      if (/\/dashcard\/\d+\/card\/\d+\/query/.test(u)) consultas.push(r.status());
    });
    let tiempo = null; let completa = false; let error = null;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
      await page.waitForFunction('window.__tCarga !== null', { timeout: TIMEOUT_MS, polling: 100 });
      tiempo = Math.round(await page.evaluate('window.__tCarga'));
      completa = consultas.length >= 3 && consultas.every((s) => s >= 200 && s < 300) && fallos.length === 0;
    } catch (e) { error = String(e.message || e).split('\n')[0]; }
    if (i === 1 || i === CARGAS) {
      try { await page.screenshot({ path: path.join(dirEvi, `0${i === 1 ? 1 : 2}-dashboard-carga-${String(i).padStart(2, '0')}.png`) }); } catch (_) { /* sin captura */ }
    }
    cargas.push({ n: i, tiempo_ms: tiempo, completa, consultas_tarjetas: consultas.length, estados_consultas: consultas, solicitudes_fallidas: fallos, errores_consola: erroresConsola, error });
    console.log(`Carga ${String(i).padStart(2)}: ${tiempo === null ? 'SIN COMPLETAR' : tiempo + ' ms'}  completa=${completa}  consultas=${consultas.join(',')}${fallos.length ? '  FALLOS: ' + fallos.join('; ') : ''}${error ? '  ERROR: ' + error : ''}`);
    await ctx.close();
    await new Promise((r) => setTimeout(r, 1000));
  }
  await browser.close();

  const ok = cargas.filter((c) => c.completa);
  const rapidas = cargas.filter((c) => c.completa && c.tiempo_ms < LIMITE_MS);
  const resumen = {
    caso: 'TC-REN-002', url: url.replace(baseUrl, '<baseUrl>'), navegador: version, modo: 'headless (Chrome DevTools Protocol, puppeteer-core)',
    cache_navegador: 'vacia en cada carga (contexto nuevo, cache deshabilitada)', cache_consultas_servidor: 'sin cambios (desactivada por defecto)',
    limite_ms: LIMITE_MS, criterio: 'al menos 9 de 10 cargas < 6000 ms y las 10 completadas correctamente',
    cargas_totales: CARGAS, cargas_completadas: ok.length, cargas_bajo_limite: rapidas.length,
    cumple_slo: rapidas.length >= 9 && ok.length === CARGAS,
  };
  fs.writeFileSync(path.join(dirRes, 'mediciones.json'), JSON.stringify({ ...resumen, cargas }, null, 2));
  console.log(`\nCompletadas: ${ok.length}/${CARGAS}   Bajo ${LIMITE_MS} ms: ${rapidas.length}/${CARGAS}   Cumple SLO: ${resumen.cumple_slo}`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
