/*
 * Quita los cuerpos de respuesta de un newman-results.json para que el archivo se pueda subir a GitHub
 * (limite de 100 MB por archivo). Conserva solicitud, codigo, estado, tiempos, tamanos y aserciones;
 * en lugar del cuerpo deja { omitido: true, bytes: <tamano original> }.
 *
 * Uso: node scripts/recortar-cuerpos-newman.js <ruta\newman-results.json>
 * Lo invoca scripts/ejecutar-herramienta.ps1 con -SinCuerpos (pensado para TC-REN-003: 30 respuestas de ~290 KB).
 */
const fs = require('fs');
const ruta = process.argv[2];
if (!ruta || !fs.existsSync(ruta)) { console.error('Uso: node recortar-cuerpos-newman.js <newman-results.json>'); process.exit(2); }
const antes = fs.statSync(ruta).size;
const j = JSON.parse(fs.readFileSync(ruta, 'utf8'));
let n = 0;
for (const e of (j.run && j.run.executions) || []) {
  if (e.response && e.response.stream) {
    const bytes = e.response.stream.data ? e.response.stream.data.length : (e.response.responseSize || 0);
    e.response.stream = { omitido: true, bytes };
    n++;
  }
}
fs.writeFileSync(ruta, JSON.stringify(j, null, 2));
console.log(`Cuerpos de respuesta omitidos: ${n}. Tamano: ${(antes / 1048576).toFixed(1)} MB -> ${(fs.statSync(ruta).size / 1048576).toFixed(2)} MB`);
