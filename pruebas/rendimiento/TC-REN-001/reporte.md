# Reporte de prueba: TC-REN-001

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-REN-001 |
| Escenario | Tiempo de respuesta de consulta |
| Categoría | Pruebas de rendimiento |
| Ejecutado por | Samuel |
| Instalación | Equipo de Samuel |
| Identificador de ejecución vigente | 20261105-samuel-03 |
| Fecha y hora de ejecución | 2026-11-05 14:08 |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Apache JMeter |

**Historial de ejecuciones** (no borrar filas anteriores):

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| 20261105-samuel-01 | 2026-11-05 | Samuel | No aprobado (Medicion 3659 ms > 3000 ms; HTTP 202) | `resultados/20261105-samuel-01/` |
| 20261105-samuel-02 | 2026-11-05 | Samuel | No aprobado (Medicion 2028 ms; HTTP 202) | `resultados/20261105-samuel-02/` |
| 20261105-samuel-03 | 2026-11-05 | Samuel | No aprobado (Medicion 1133 ms; HTTP 202) | `resultados/20261105-samuel-03/` |

## 2. Objetivo de la prueba

Medir el tiempo de respuesta de una consulta sencilla mediante la API REST frente al SLO interno de 3000 ms.

## 3. Precondiciones

- Criterios de inicio: Metabase v0.64.1 disponible (`verificar-ambiente.ps1` en [OK]). La ejecución piloto de este caso se hizo con las propias ejecuciones -01 a -03; el SLO del plan **no se modificó**.
- Servicio disponible y estable al iniciar cada ejecución (CPU de Metabase en 3-7 % en reposo, comprobado antes de la primera).
- Una ejecución de preparación completada antes de medir: la solicitud "Preparacion (no se mide)" del propio plan `.jmx`.
- Pregunta `QA - Pedidos con subtotal mayor a 100` (P1, ID local 40), con un conjunto de datos conocido (R02 = 5244 filas; la consulta devuelve como máximo 2000).
- Recursos asignados a Docker registrados (sección 12).

## 4. Procedimiento ejecutado

1. Se desarrolló el plan `scripts/TC-REN-001.jmx`: 1 usuario, 1 iteración, dos solicitudes `POST /api/card/40/query` con cuerpo `{"ignore_cache": true}`: "Preparacion (no se mide)" y "Medicion". Aserciones: `$.status = completed` y existencia de `$.data.rows`.
2. Se ejecutó en modo sin interfaz (`-n`) con `ejecutar-herramienta.ps1`, que inicia la sesión con la cuenta admin y cierra la sesión al terminar.
3. Desviación respecto del plan: como el resultado de la primera ejecución (-01) superó el SLO, se repitió (-02) y, al no coincidir, se hizo una tercera (-03) para desempatar. Las tres se conservan; la vigente es la -03.

## 5. Resultado esperado

Tiempo de respuesta inferior a 3000 ms, con ejecución exitosa y resultados válidos.

**Código HTTP esperado:** 200 OK

## 6. Resultado obtenido

- Tiempo de la solicitud de medición (ms): **-01: 3659** · **-02: 2028** · **-03: 1133** (vigente). Solicitud de preparación: 8567 · 5306 · 886 ms.
- Código HTTP: **202 Accepted** en todas las solicitudes (el plan espera 200 OK).
- Ejecución exitosa en las tres: `status` = `completed` y `data.rows` presente; 0 % de errores según JMeter (que considera éxito los códigos 2xx).
- Con el SLO del plan (3000 ms): se cumple en 2 de las 3 ejecuciones (-02 y -03); no se cumple en la primera (-01), ejecutada después de un periodo de inactividad.

## 7. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `resultados/20261105-samuel-03/reporte-html/index.html` | Dashboard HTML de JMeter (APDEX, errores, throughput y percentiles) |
| 2 | `resultados/20261105-samuel-03/resultados.jtl` | Muestras de JMeter (una fila por solicitud) |
| 3 | `resultados/20261105-samuel-03/metricas.json` | Métricas calculadas (percentiles nearest-rank, media, mediana, desviación, throughput) |
| 4 | `resultados/20261105-samuel-03/ejecucion-info.txt` | Datos de la ejecución (sin credenciales) |

## 8. Estado de la prueba

**No aprobado**

## 9. Justificación del resultado

Se esperaba un tiempo < 3000 ms con ejecución exitosa y resultados válidos, y el código 200. En la ejecución vigente (-03) el tiempo (1133 ms) y la validez de los resultados cumplen; el código HTTP obtenido (202) no coincide con el 200 del plan, por lo que el caso se marca No aprobado (hallazgo H-001). Además, el tiempo no es estable entre ejecuciones (3659 / 2028 / 1133 ms): la primera ejecución tras inactividad superó el SLO (hallazgo H-002). Si el equipo acepta el 202 como código de éxito, el criterio de tiempo se cumpliría en la ejecución vigente, pero se recomienda ratificar el SLO a la vista de esta variabilidad.

## 10. Hallazgos

H-001 (HTTP 202 en lugar de 200) y H-002 (primera medición tras inactividad por encima del SLO de 3000 ms y variabilidad entre ejecuciones).

## 11. Conclusión

La consulta de P1 responde en el rango de 1,1 a 3,7 s según el estado del servicio; solo la primera ejecución, en frío, incumplió el SLO. El caso no se aprueba por el código 202.

## 12. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Windows 11 Home 10.0.26300 |
| Equipo (host) | AMD Ryzen 5 4600H, 6 núcleos / 12 hilos, 7,4 GiB de RAM |
| Navegador y versión (si aplica) | No aplica |
| Versión de Docker | Engine 29.6.2 |
| Recursos asignados a Docker (CPU / RAM) | 12 CPU y 3,5 GiB de RAM (Docker Desktop); el contenedor `metabase-qa` no tiene límites propios y usaba unos 1,6 GiB en reposo |
| Versión de la herramienta | Apache JMeter 5.6.3 (Java 21.0.9) |
| Comando ejecutado | `scripts/ejecutar-herramienta.ps1 -Caso TC-REN-001 -Herramienta jmeter -Integrante samuel -JMeter <ruta>\jmeter.bat` |
| Configuración relevante | 1 usuario, 1 iteración (+1 de preparación); sesión de la cuenta admin; Caché: toda consulta se envía con `{"ignore_cache": true}` (política decidida en el piloto y aplicada igual en los cinco casos TC-REN); la caché de consultas de Metabase está desactivada por defecto. El generador de carga y Metabase se ejecutan en el mismo equipo y compiten por la misma CPU. |
| Identificadores locales usados | cardId=40 (P1), dashboardId=2, databaseId=1 |
