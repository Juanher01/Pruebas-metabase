# Reporte de prueba: TC-REN-003

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-REN-003 |
| Escenario | Estabilidad bajo solicitudes repetitivas |
| Categoría | Pruebas de rendimiento |
| Ejecutado por | Samuel |
| Instalación | Equipo de Samuel |
| Identificador de ejecución vigente | 20261105-samuel-01 |
| Fecha y hora de ejecución | 2026-11-05 13:51 |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Postman + Newman |

**Historial de ejecuciones** (no borrar filas anteriores):

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| 20261105-samuel-01 | 2026-11-05 | Samuel | No aprobado (P95 1734 ms cumple; HTTP 202) | `resultados/20261105-samuel-01/` |

## 2. Objetivo de la prueba

Evaluar la estabilidad de los tiempos de respuesta ante 30 solicitudes secuenciales sobre la misma pregunta.

## 3. Precondiciones

- Criterios de inicio: Metabase v0.64.1 disponible; los umbrales del plan no se modificaron.
- Pregunta guardada: `QA - Pedidos con subtotal mayor a 100` (P1, ID local 40).
- Política de caché: toda consulta se envía con `{"ignore_cache": true}` (política decidida en el piloto y aplicada igual en los cinco casos TC-REN); la caché de consultas de Metabase está desactivada por defecto.

## 4. Procedimiento ejecutado

1. Se ejecutó `scripts/TC-REN-003.postman_collection.json` con Newman y `-Iteraciones 30`: 30 solicitudes secuenciales a `POST /api/card/40/query`, con la cuenta admin.
2. Las métricas se calcularon con `scripts/calcular-metricas-rendimiento.ps1` a partir de `newman-results.json` (método de percentil: *nearest-rank*) y se guardaron en `metricas.json`.
3. Desviación de registro: Newman guardó el cuerpo completo de cada respuesta (30 × unos 290 KB) y `newman-results.json` llegó a 151 MB, por encima del límite de GitHub (100 MB). Antes de subirlo se quitaron los cuerpos de respuesta con `scripts/recortar-cuerpos-newman.js` (0,41 MB finales). Se conservan solicitud, código, estado, tiempos, tamaños y aserciones; las métricas se recalcularon después y no cambiaron. La nota consta en `ejecucion-info.txt`. En ejecuciones futuras use la opción `-SinCuerpos` de `ejecutar-herramienta.ps1`.

## 5. Resultado esperado

El 100 % de las solicitudes debe finalizar correctamente y el P95 del tiempo de respuesta debe ser inferior a 4000 ms.

**Código HTTP esperado:** 200 OK

## 6. Resultado obtenido

- 30 solicitudes; 30 completadas con `status` = `completed` (100 %); 0 fallidas.
- **P95 = 1734 ms** (SLO < 4000 ms).
- Media 814.9 ms · mediana 727 ms · mínimo 197 ms · máximo 3580 ms · desviación estándar 641.4 ms · P90 1322 ms · P99 3580 ms.
- Código HTTP: **202 Accepted** en las 30 solicitudes (el plan espera 200 OK).
- Tendencia: las primeras 7 solicitudes fueron las más lentas (hasta 3580 ms) y después los tiempos bajaron y se estabilizaron entre 197 y 619 ms.

## 7. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `resultados/20261105-samuel-01/newman-report.html` | Reporte navegable de Newman |
| 2 | `resultados/20261105-samuel-01/newman-results.json` | Resultado completo de Newman |
| 3 | `resultados/20261105-samuel-01/metricas.json` | Métricas calculadas (percentiles nearest-rank, media, mediana, desviación, throughput) |
| 4 | `resultados/20261105-samuel-01/ejecucion-info.txt` | Datos de la ejecución (sin credenciales) |

## 8. Estado de la prueba

**No aprobado**

## 9. Justificación del resultado

Se esperaba 100 % de solicitudes finalizadas correctamente, P95 < 4000 ms y código 200. El 100 % finalizó correctamente y el P95 (1734 ms) cumple el SLO; el código HTTP (202) no coincide con el 200 del plan, por lo que el caso se marca No aprobado (hallazgo H-001). Si el equipo acepta el 202, el caso cumpliría todos los criterios de rendimiento.

## 10. Hallazgos

H-001 (HTTP 202 en lugar de 200).

## 11. Conclusión

El servicio es estable ante 30 solicitudes secuenciales (P95 1734 ms). La única diferencia con lo esperado es el código HTTP 202.

## 12. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Windows 11 Home 10.0.26300 |
| Equipo (host) | AMD Ryzen 5 4600H, 6 núcleos / 12 hilos, 7,4 GiB de RAM |
| Navegador y versión (si aplica) | No aplica |
| Versión de Docker | Engine 29.6.2 |
| Recursos asignados a Docker (CPU / RAM) | 12 CPU y 3,5 GiB de RAM (Docker Desktop); el contenedor `metabase-qa` no tiene límites propios y usaba unos 1,6 GiB en reposo |
| Versión de la herramienta | Newman 6.2.2 (Node.js v22.15.1) |
| Comando ejecutado | `scripts/ejecutar-herramienta.ps1 -Caso TC-REN-003 -Herramienta newman -Integrante samuel -Iteraciones 30` |
| Configuración relevante | 30 iteraciones secuenciales; sesión de la cuenta admin; Caché: toda consulta se envía con `{"ignore_cache": true}` (política decidida en el piloto y aplicada igual en los cinco casos TC-REN); la caché de consultas de Metabase está desactivada por defecto. El generador de carga y Metabase se ejecutan en el mismo equipo y compiten por la misma CPU. |
| Identificadores locales usados | cardId=40 (P1), dashboardId=2, databaseId=1 |
