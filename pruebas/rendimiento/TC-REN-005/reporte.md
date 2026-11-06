# Reporte de prueba: TC-REN-005

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-REN-005 |
| Escenario | Throughput bajo carga sostenida |
| Categoría | Pruebas de rendimiento |
| Ejecutado por | Samuel |
| Instalación | Equipo de Samuel |
| Identificador de ejecución vigente | 20261105-samuel-02 |
| Fecha y hora de ejecución | 2026-11-05 13:56 |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Apache JMeter |

**Historial de ejecuciones** (no borrar filas anteriores):

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| 20261105-samuel-01 | 2026-11-05 | Samuel | Línea base (2,382 req/s) | `resultados/20261105-samuel-01/` |
| 20261105-samuel-02 | 2026-11-05 | Samuel | No aprobado (106,4 % de la línea base cumple; HTTP 202) | `resultados/20261105-samuel-02/` |

## 2. Objetivo de la prueba

Medir el throughput (req/s) bajo carga sostenida y compararlo con la línea base, con una tolerancia máxima de degradación del 10 %.

## 3. Precondiciones

- Criterios de inicio: Metabase v0.64.1 disponible; el umbral del plan no se modificó.
- Línea base de throughput obtenida mediante una ejecución inicial bajo condiciones equivalentes: ejecución `20261105-samuel-01` (misma configuración, sesión y política de caché), conservada en su propia carpeta.
- Pregunta `QA - Pedidos con subtotal mayor a 100` (P1, ID local 40).

## 4. Procedimiento ejecutado

1. Se desarrolló `scripts/TC-REN-005.jmx`: 5 hilos, ramp-up 5 s, 60 s de duración (*Specify thread lifetime*) sobre `POST /api/card/40/query`, cuerpo `{"ignore_cache": true}`.
2. Se ejecutó dos veces, con 20 s de pausa: primero la línea base (-01) y después la ejecución comparada (-02, vigente).
3. Degradación (%) = ((Throughput_base − Throughput_actual) / Throughput_base) × 100, con el throughput de JMeter (`statistics.json`).

## 5. Resultado esperado

Throughput igual o superior al 90 % de la línea base obtenida previamente bajo condiciones equivalentes, con una tasa de errores del 0 %.

**Código HTTP esperado:** 200 OK

## 6. Resultado obtenido

- **Línea base (-01):** 142 solicitudes en 59.61 s, **2.38 req/s**; 0 errores; P95 5652 ms; máximo 6270 ms.
- **Comparada (-02):** 156 solicitudes en 61.54 s, **2.53 req/s**; 0 errores; P95 3865 ms; máximo 5467 ms.
- **Degradación = ((2.3823 − 2.5349) / 2.3823) × 100 = -6.40 %** (negativa: el throughput de la comparada fue 106.4 % de la línea base).
- Código HTTP: **202 Accepted** en todas las solicitudes (298 en total; el plan espera 200 OK).

## 7. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `resultados/20261105-samuel-02/reporte-html/index.html` | Dashboard HTML de JMeter (APDEX, errores, throughput y percentiles) |
| 2 | `resultados/20261105-samuel-02/resultados.jtl` | Muestras de JMeter (una fila por solicitud) |
| 3 | `resultados/20261105-samuel-02/metricas.json` | Métricas calculadas (percentiles nearest-rank, media, mediana, desviación, throughput) |
| 4 | `resultados/20261105-samuel-02/ejecucion-info.txt` | Datos de la ejecución (sin credenciales) |
| 5 | `resultados/20261105-samuel-01/reporte-html/index.html` | Línea base: Dashboard HTML de JMeter (APDEX, errores, throughput y percentiles) |

## 8. Estado de la prueba

**No aprobado**

## 9. Justificación del resultado

Se esperaba un throughput ≥ 90 % de la línea base, 0 % de errores y código 200. El throughput comparado equivale al 106,4 % de la línea base y no hubo errores; el código HTTP (202) no coincide con el 200 del plan, por lo que el caso se marca No aprobado (hallazgo H-001). Si el equipo acepta el 202, el caso cumpliría todos los criterios.

## 10. Hallazgos

H-001 (HTTP 202 en lugar de 200).

## 11. Conclusión

No se observó degradación del throughput respecto de la línea base (la comparada fue incluso un 6,4 % mayor, dentro de la variación normal entre ejecuciones). La única diferencia con lo esperado es el código HTTP 202.

## 12. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Windows 11 Home 10.0.26300 |
| Equipo (host) | AMD Ryzen 5 4600H, 6 núcleos / 12 hilos, 7,4 GiB de RAM |
| Navegador y versión (si aplica) | No aplica |
| Versión de Docker | Engine 29.6.2 |
| Recursos asignados a Docker (CPU / RAM) | 12 CPU y 3,5 GiB de RAM (Docker Desktop); el contenedor `metabase-qa` no tiene límites propios y usaba unos 1,6 GiB en reposo |
| Versión de la herramienta | Apache JMeter 5.6.3 (Java 21.0.9) |
| Comando ejecutado | `scripts/ejecutar-herramienta.ps1 -Caso TC-REN-005 -Herramienta jmeter -Integrante samuel -JMeter <ruta>\jmeter.bat` |
| Configuración relevante | 5 usuarios virtuales, ramp-up 5 s, 60 s; una sesión compartida; Caché: toda consulta se envía con `{"ignore_cache": true}` (política decidida en el piloto y aplicada igual en los cinco casos TC-REN); la caché de consultas de Metabase está desactivada por defecto. El generador de carga y Metabase se ejecutan en el mismo equipo y compiten por la misma CPU. |
| Identificadores locales usados | cardId=40 (P1), dashboardId=2, databaseId=1 |
