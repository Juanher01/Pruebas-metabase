# Reporte de prueba: TC-REN-002

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-REN-002 |
| Escenario | Tiempo de carga de dashboard |
| Categoría | Pruebas de rendimiento |
| Ejecutado por | Samuel |
| Instalación | Equipo de Samuel |
| Identificador de ejecución vigente | 20261105-samuel-03 |
| Fecha y hora de ejecución | 2026-11-05 14:08 |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Navegador |

**Historial de ejecuciones** (no borrar filas anteriores):

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| 20261105-samuel-01 | 2026-11-05 | Samuel | No aprobado (6/10 cargas < 6000 ms) | `resultados/20261105-samuel-01/` |
| 20261105-samuel-02 | 2026-11-05 | Samuel | Cumple SLO (9/10 cargas < 6000 ms) | `resultados/20261105-samuel-02/` |
| 20261105-samuel-03 | 2026-11-05 | Samuel | No aprobado (8/10 cargas < 6000 ms) | `resultados/20261105-samuel-03/` |

## 2. Objetivo de la prueba

Medir el tiempo de carga completa de un dashboard con tres visualizaciones frente al SLO interno de 6000 ms.

## 3. Precondiciones

- Criterios de inicio: Metabase v0.64.1 disponible; el SLO del plan **no se modificó**.
- Dashboard `QA - Dashboard Principal` (ID local 2) con tres visualizaciones y el filtro "Categoría" sin valor aplicado; se comprobó visualmente en las capturas.
- Estado de caché registrado: del navegador, vacía en cada carga (contexto nuevo y caché deshabilitada); de consultas del servidor, desactivada por defecto en Metabase.

## 4. Procedimiento ejecutado

1. Se desarrolló `scripts/TC-REN-002.navegador.js`, que abre el dashboard en Chrome real y mide, con `requestAnimationFrame`, desde el inicio de la navegación hasta que las 3 consultas de tarjetas terminaron, las 3 tarjetas muestran su visualización, no queda indicador de carga y el título de la pestaña deja de indicar "n/3 cargado".
2. Se ejecutaron 10 cargas secuenciales, cada una en un contexto de navegador nuevo, con la cuenta admin (la sesión se entrega por cookie y se cierra al terminar).
3. Desviaciones: (1) el plan menciona un navegador con herramientas de desarrollador; aquí la medición es automatizada con Chrome en modo *headless* por el Protocolo DevTools, para que sea repetible. (2) Por incumplir el SLO, la ejecución -01 se repitió (-02) y, al no coincidir, se hizo una tercera (-03) para desempatar. La vigente es la -03.

## 5. Resultado esperado

Al menos 9 de las 10 cargas deben completar la presentación de todas las visualizaciones en menos de 6000 ms. Las 10 deben finalizar correctamente.

**Código HTTP esperado:** N/A

## 6. Resultado obtenido

- Ejecución vigente (-03): 10/10 cargas completadas correctamente; **8/10 por debajo de 6000 ms**. Tiempos (ms): 9948, 6348, 4095, 4054, 3976, 3906, 3755, 3590, 4008, 4601. Mínimo 3590, máximo 9948.
- Cargas bajo 6000 ms por ejecución: -01: 6/10 (máx. 9604 ms) · -02: 9/10 (máx. 7067 ms) · -03: 8/10 (máx. 9948 ms).
- En todas las ejecuciones las dos primeras cargas fueron las más lentas (hasta 9948 ms) y las siguientes quedaron entre 3,2 y 5,2 s.
- Las 3 consultas de tarjetas respondieron 202 en todas las cargas (no se exige código HTTP en este caso). Sin solicitudes con error ni errores de consola relevantes.

## 7. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `resultados/20261105-samuel-03/mediciones.json` | Tiempo de cada una de las 10 cargas |
| 2 | `resultados/20261105-samuel-03/metricas.json` | Métricas calculadas (percentiles nearest-rank, media, mediana, desviación, throughput) |
| 3 | `evidencias/20261105-samuel-03/01-dashboard-carga-01.png` | Captura del dashboard cargado |
| 4 | `evidencias/20261105-samuel-03/02-dashboard-carga-10.png` | Captura del dashboard cargado |
| 5 | `resultados/20261105-samuel-03/ejecucion-info.txt` | Datos de la ejecución (sin credenciales) |

## 8. Estado de la prueba

**No aprobado**

## 9. Justificación del resultado

Se esperaba que al menos 9 de las 10 cargas tardaran menos de 6000 ms y que las 10 finalizaran correctamente. Las 10 finalizaron correctamente en las tres ejecuciones, pero el criterio de tiempo se cumplió solo en la -02 (9/10), mientras que en la -01 (6/10) y la vigente -03 (8/10) no. Como el resultado no es reproducible y la mayoría de ejecuciones no cumple, el caso se marca No aprobado (hallazgo H-003).

## 10. Hallazgos

H-003 (el SLO de 6000 ms para la carga del dashboard no se cumple de forma consistente).

## 11. Conclusión

El dashboard carga en unos 3,2-5,2 s en régimen estable, pero las primeras cargas tardan más y el SLO de 6000 ms (al menos 9/10) solo se cumplió en una de las tres ejecuciones. Se recomienda ratificar o ajustar el SLO a la luz de estos datos antes de la ejecución formal.

## 12. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Windows 11 Home 10.0.26300 |
| Equipo (host) | AMD Ryzen 5 4600H, 6 núcleos / 12 hilos, 7,4 GiB de RAM |
| Navegador y versión (si aplica) | Google Chrome 156.0.8078.80 (headless, contexto nuevo por carga) |
| Versión de Docker | Engine 29.6.2 |
| Recursos asignados a Docker (CPU / RAM) | 12 CPU y 3,5 GiB de RAM (Docker Desktop); el contenedor `metabase-qa` no tiene límites propios y usaba unos 1,6 GiB en reposo |
| Versión de la herramienta | puppeteer-core 23.11.1 sobre Node.js v22.15.1 |
| Comando ejecutado | `scripts/ejecutar-herramienta.ps1 -Caso TC-REN-002 -Herramienta navegador -Integrante samuel` |
| Configuración relevante | 10 cargas secuenciales; viewport 1366x900; sesión de la cuenta admin; caché del navegador vacía en cada carga. El generador de carga y Metabase se ejecutan en el mismo equipo y compiten por la misma CPU. |
| Identificadores locales usados | cardId=40 (P1), dashboardId=2, databaseId=1 |
