// Genera reportes-generales/final/dashboard-resultados.html: un dashboard autónomo
// (sin dependencias ni conexión) con los resultados de la evaluación QA.
// Uso, desde la raíz del repositorio:  node scripts/generar-dashboard.js
// Lee: matriz de trazabilidad, registro de hallazgos, metricas.json y mediciones de TC-REN,
// newman-results.json de TC-REN-003, verificaciones complementarias e INFORME-FINAL.md (§4.2).
'use strict';
const fs = require('fs'), path = require('path');
const repo = path.resolve(__dirname, '..');
const leer = (rel) => fs.readFileSync(path.join(repo, rel), 'utf8');
const salida = path.join(repo, 'reportes-generales/final/dashboard-resultados.html');

const parse = (l) => { const f = []; let c = '', q = false; for (let i = 0; i < l.length; i++) { const ch = l[i];
  if (q) { if (ch === '"') { if (l[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
  else if (ch === '"') q = true; else if (ch === ',') { f.push(c); c = ''; } else c += ch; } f.push(c); return f; };
const csv = (rel) => { const L = leer(rel).split(/\r?\n/).filter(Boolean).map(parse); const h = L[0];
  return L.slice(1).map((r) => { if (r.length !== h.length) throw new Error(`${rel}: la fila ${r[0]} tiene ${r.length} campos`); return Object.fromEntries(h.map((k, i) => [k, r[i]])); }); };
const CAT = { 'TC-FUN': 'Funcionales', 'TC-VAL': 'Validación de entradas', 'TC-ERR': 'Manejo de errores', 'TC-CON': 'Contrato y consistencia', 'TC-REN': 'Rendimiento' };

const matriz = csv('reportes-generales/matriz-trazabilidad.csv');
const casos = matriz.map((r) => ({ id: r.identificador, categoria: CAT[r.identificador.slice(0, 6)], escenario: r.escenario, herramienta: r.herramienta,
  estado: r.estado, ejecucion: r.ultima_ejecucion, instalacion: r.instalacion === 'Juan' ? 'A' : 'B', codigo: r.codigo_http_esperado, resultado: r.resultado_obtenido }));
const hallazgos = csv('reportes-generales/registro-hallazgos.csv').map((r) => ({ id: r.id_hallazgo, caso: r.caso_relacionado, componente: r.componente,
  descripcion: r.descripcion, severidad: r.severidad, esperado: r.resultado_esperado, obtenido: r.resultado_obtenido, estado: r.estado }));
const verificaciones = csv('reportes-generales/verificaciones-complementarias/verificaciones-complementarias.csv').map((r) => ({
  categoria: r.categoria, verificacion: r.verificacion, descripcion: r.descripcion_segun_plan, casos: r.casos_relacionados_sugeridos, estado: r.estado }));

const vigente = Object.fromEntries(matriz.filter((r) => r.identificador.startsWith('TC-REN')).map((r) => [r.identificador, r.ultima_ejecucion]));
const rendimiento = [];
for (const c of Object.keys(vigente)) {
  const dir = path.join(repo, 'pruebas/rendimiento', c, 'resultados');
  for (const e of fs.readdirSync(dir).sort()) {
    const f = path.join(dir, e, 'metricas.json'); if (!fs.existsSync(f)) continue;
    const x = JSON.parse(fs.readFileSync(f, 'utf8'));
    const rol = c === 'TC-REN-005' && e.endsWith('-01') ? 'línea base' : e === vigente[c] ? 'vigente' : 'anterior';
    rendimiento.push({ caso: c, ejecucion: e, rol, solicitudes: x.solicitudes, media: x.media_ms, mediana: x.mediana_ms, p95: x.p95_ms, max: x.max_ms, throughput: x.throughput_req_s, errores: x.tasa_error_pct });
  }
}
const cargas = [];
for (const e of fs.readdirSync(path.join(repo, 'pruebas/rendimiento/TC-REN-002/resultados')).sort()) {
  const f = path.join(repo, 'pruebas/rendimiento/TC-REN-002/resultados', e, 'mediciones.json'); if (!fs.existsSync(f)) continue;
  for (const k of JSON.parse(fs.readFileSync(f, 'utf8')).cargas) cargas.push({ ejecucion: e, carga: k.n, ms: k.tiempo_ms });
}
const n3 = JSON.parse(leer(`pruebas/rendimiento/TC-REN-003/resultados/${vigente['TC-REN-003']}/newman-results.json`));
const solicitudes = n3.run.executions.map((x, i) => ({ n: i + 1, ms: x.response.responseTime, codigo: x.response.code }));

const informe = leer('reportes-generales/final/INFORME-FINAL.md').replace(/\r\n/g, '\n');
const limpia = (s) => s.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/`/g, '').trim();
const criterios = informe.split('### 4.2 Criterios de finalización')[1].split('\n---')[0].split('\n')
  .filter((l) => l.startsWith('| ') && !l.startsWith('| Criterio del plan'))
  .map((l) => { const c = l.split(' | ').map((x) => x.replace(/^\| ?|\s*\|$/g, '')); return { criterio: limpia(c[0]), estado: limpia(c[1]), resultado: limpia(c[2]) }; });

const DATA = { generado: new Date().toISOString().slice(0, 10), casos, hallazgos, verificaciones, rendimiento, cargas, solicitudes, criterios };
const json = JSON.stringify(DATA);
if (/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(json)) throw new Error('Los datos contienen un correo electrónico; revise las fuentes antes de generar.');

const html = fs.readFileSync(path.join(__dirname, 'plantilla-dashboard.html'), 'utf8')
  .replace('/*__DATOS__*/null', json.replace(/</g, '\\u003c'));
fs.writeFileSync(salida, html, 'utf8');
console.log(`Generado ${path.relative(repo, salida)}: ${casos.length} casos, ${hallazgos.length} hallazgos, ${rendimiento.length} ejecuciones de rendimiento.`);
