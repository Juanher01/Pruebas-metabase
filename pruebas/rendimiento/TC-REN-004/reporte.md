# Reporte de prueba: TC-REN-004

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-REN-004 |
| Escenario | Carga moderada |
| Categoría | Pruebas de rendimiento |
| Ejecutado por | Samuel |
| Instalación | Equipo de Samuel |
| Identificador de ejecución vigente | 20261105-samuel-01 |
| Fecha y hora de ejecución | 2026-11-05 13:53 |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Apache JMeter |

**Historial de ejecuciones** (no borrar filas anteriores):

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| 20261105-samuel-01 | 2026-11-05 | Samuel | No aprobado (P95 2870 ms cumple; HTTP 202) | `resultados/20261105-samuel-01/` |

## 2. Objetivo de la prueba

Evaluar el comportamiento ante 5 usuarios virtuales concurrentes (50 solicitudes) frente al SLO interno de P95 < 6000 ms.

## 3. Precondiciones

- Criterios de inicio: Metabase v0.64.1 disponible; el SLO del plan no se modificó.
- Pregunta guardada: `QA - Pedidos con subtotal mayor a 100` (P1, ID local 40).
- Condiciones controladas: sin otras cargas deliberadas en el equipo; servicio en reposo al iniciar. Decisiones del piloto: ramp-up de 5 s (el plan no lo indica) y una sesión compartida por los 5 usuarios virtuales.

## 4. Procedimiento ejecutado

1. Se desarrolló `scripts/TC-REN-004.jmx`: 5 hilos, ramp-up 5 s, 10 iteraciones por hilo (50 solicitudes a `POST /api/card/40/query`, cuerpo `{"ignore_cache": true}`), con aserciones de `status = completed` y `data.rows`.
2. Se ejecutó sin interfaz con `ejecutar-herramienta.ps1`; JMeter generó `resultados.jtl` y `reporte-html/`.
3. Las métricas se calcularon con `calcular-metricas-rendimiento.ps1` (nearest-rank) y se contrastaron con las de JMeter.

## 5. Resultado esperado

El P95 del tiempo de respuesta debe ser inferior a 6000 ms, con una tasa de errores del 0 %.

**Código HTTP esperado:** 200 OK

## 6. Resultado obtenido

- 50 solicitudes; 0 errores (0 %).
- **P95 = 2870 ms** por nearest-rank (JMeter, con interpolación: 2999.6 ms); SLO < 6000 ms.
- Media 1223.3 ms · mediana 1041.5 ms · mínimo 319 ms · máximo 3223 ms · P90 2269 ms · P99 3223 ms.
- Throughput 3.44 solicitudes/s en 14.55 s.
- Código HTTP: **202 Accepted** en las 50 solicitudes (el plan espera 200 OK).

## 7. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `resultados/20261105-samuel-01/reporte-html/index.html` | Dashboard HTML de JMeter (APDEX, errores, throughput y percentiles) |
| 2 | `resultados/20261105-samuel-01/resultados.jtl` | Muestras de JMeter (una fila por solicitud) |
| 3 | `resultados/20261105-samuel-01/metricas.json` | Métricas calculadas (percentiles nearest-rank, media, mediana, desviación, throughput) |
| 4 | `resultados/20261105-samuel-01/ejecucion-info.txt` | Datos de la ejecución (sin credenciales) |

## 8. Estado de la prueba

**No aprobado**

## 9. Justificación del resultado

Se esperaba P95 < 6000 ms, tasa de errores 0 % y código 200. El P95 (2870 ms) y la tasa de errores (0 %) cumplen; el código HTTP (202) no coincide con el 200 del plan, por lo que el caso se marca No aprobado (hallazgo H-001). Si el equipo acepta el 202, el caso cumpliría todos los criterios.

## 10. Hallazgos

H-001 (HTTP 202 en lugar de 200).

## 11. Conclusión

Con 5 usuarios concurrentes el servicio no mostró errores y el P95 quedó holgadamente bajo el SLO. La única diferencia con lo esperado es el código HTTP 202.

## 12. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Windows 11 Home 10.0.26300 |
| Equipo (host) | AMD Ryzen 5 4600H, 6 núcleos / 12 hilos, 7,4 GiB de RAM |
| Navegador y versión (si aplica) | No aplica |
| Versión de Docker | Engine 29.6.2 |
| Recursos asignados a Docker (CPU / RAM) | 12 CPU y 3,5 GiB de RAM (Docker Desktop); el contenedor `metabase-qa` no tiene límites propios y usaba unos 1,6 GiB en reposo |
| Versión de la herramienta | Apache JMeter 5.6.3 (Java 21.0.9) |
| Comando ejecutado | `scripts/ejecutar-herramienta.ps1 -Caso TC-REN-004 -Herramienta jmeter -Integrante samuel -JMeter <ruta>\jmeter.bat` |
| Configuración relevante | 5 usuarios virtuales, ramp-up 5 s, 10 iteraciones por usuario; una sesión compartida; Caché: toda consulta se envía con `{"ignore_cache": true}` (política decidida en el piloto y aplicada igual en los cinco casos TC-REN); la caché de consultas de Metabase está desactivada por defecto. El generador de carga y Metabase se ejecutan en el mismo equipo y compiten por la misma CPU. |
| Identificadores locales usados | cardId=40 (P1), dashboardId=2, databaseId=1 |
