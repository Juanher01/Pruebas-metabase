# Reporte de prueba: TC-CON-004

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-CON-004 |
| Escenario | Estructura de resultados de consulta |
| Categoría | Pruebas de contrato y consistencia |
| Ejecutado por | Samuel |
| Instalación | Equipo de Samuel |
| Identificador de ejecución vigente | 20261105-samuel-02 |
| Fecha y hora de ejecución | 2026-11-05 12:13 |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Postman + Newman |

**Historial de ejecuciones** (no borrar filas anteriores):

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| 20261105-samuel-01 | 2026-11-05 | Samuel | No válida (defecto del script de apoyo) | `resultados/20261105-samuel-01/` |
| 20261105-samuel-02 | 2026-11-05 | Samuel | No aprobado | `resultados/20261105-samuel-02/` |

## 2. Objetivo de la prueba

Comprobar que la respuesta de ejecución de una pregunta contiene `data.rows` y `data.cols` con una organización coherente con la consulta.

## 3. Precondiciones

- Criterios de inicio: Metabase v0.64.1 disponible. El piloto del código HTTP de la consulta (EJECUCION-PRUEBAS.md §1) se hizo en esta misma ejecución: se **confirmó 202**.
- Solicitud autenticada con la cuenta admin.
- Pregunta P1 (ID local 40).
- Valor de referencia R02 = 5244, obtenido con `SELECT COUNT(*) FROM ORDERS WHERE SUBTOTAL > 100` (Sample Database es SQLite en esta instalación; la guía usa `PUBLIC.ORDERS`, que no existe aquí).

## 4. Procedimiento ejecutado

1. Se ejecutó la colección `scripts/TC-CON-004.postman_collection.json` con Newman: `POST /api/card/40/query` con cuerpo `{}` (sin `ignore_cache`).
2. Una segunda solicitud de apoyo, `POST /api/dataset`, obtiene R02 para contrastar la cantidad de registros.
   Desviación: la ejecución `20261105-samuel-01` no es válida porque la consulta de apoyo usaba `PUBLIC.ORDERS` y devolvió 400 (defecto del script, no de Metabase). Se corrigió y se repitió como `20261105-samuel-02`, que es la vigente. La `-01` se conserva sin cambios.

## 5. Resultado esperado

La respuesta JSON contiene la estructura de resultados esperada, incluyendo data.rows como arreglo de registros y data.cols como arreglo de metadatos de columnas. La cantidad y organización de los valores es coherente con la consulta ejecutada.

**Código HTTP esperado:** 200 OK

## 6. Resultado obtenido

- Solicitud: `POST /api/card/40/query`
- Código HTTP: **202 Accepted** (el plan espera 200 OK).
- `status` = `completed`; `data.rows` es un arreglo de registros y `data.cols` un arreglo de 11 columnas con `name` y `base_type`; cada registro tiene 11 valores; `row_count` = 2000 = registros devueltos.
- Todos los registros cumplen `SUBTOTAL > 100`. R02 = 5244, y se devolvieron 2000 (límite por defecto de la interfaz) con `rows_truncated` = 2000.
- Tiempo de respuesta de la consulta: 14250 ms (2699 ms en la ejecución -01).
- Aserciones de Newman: 11/12 aserciones superadas (1 no superada: código HTTP 200 esperado por el plan).

## 7. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `resultados/20261105-samuel-02/newman-report.html` | Reporte navegable de Newman |
| 2 | `resultados/20261105-samuel-02/newman-results.json` | Resultado completo (solicitudes, respuestas, aserciones) |
| 3 | `resultados/20261105-samuel-02/consola.log` | Salida de consola |
| 4 | `resultados/20261105-samuel-02/ejecucion-info.txt` | Datos de la ejecución |

## 8. Estado de la prueba

**No aprobado**

## 9. Justificación del resultado

La estructura (`data.rows`, `data.cols`, coherencia con la consulta) coincide con lo esperado. El código HTTP **no** coincide: se esperaba 200 y se obtuvo 202. Como el resultado esperado del plan incluye el código HTTP, el caso se marca No aprobado. El comportamiento es consistente con el código fuente de v0.64.1 (respuestas en streaming con 202), por lo que probablemente es una discrepancia del plan con la versión y no un defecto de Metabase; ver el hallazgo.

## 10. Hallazgos

H-001: la consulta de una pregunta responde 202 en lugar de 200 (afecta también a TC-FUN-010, TC-REN-001, 003, 004 y 005).

## 11. Conclusión

La estructura de resultados es correcta, pero el código HTTP real (202) difiere del esperado por el plan (200). El equipo debe decidir y documentar si se acepta 202 como código de éxito (con `status = completed`) antes de la ejecución formal del resto de casos; este reporte no modifica el resultado esperado del plan.

## 12. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Windows 11 Home 10.0.26300 |
| Navegador y versión (si aplica) | No aplica |
| Versión de Docker | Engine 29.6.2 |
| Recursos asignados a Docker (CPU / RAM) | 12 CPU y 3,5 GiB de RAM (Docker Desktop); el contenedor `metabase-qa` no tiene límites propios |
| Versión de la herramienta (Newman) | 6.2.2 |
| Comando ejecutado | `scripts/ejecutar-herramienta.ps1 -Caso TC-CON-004 -Herramienta newman -Integrante samuel` |
| Configuración relevante | 1 iteración; sesión de la cuenta admin; ejecutado el 2026-11-05, antes de la fecha programada en el plan |
| Identificadores locales usados | cardId=40, databaseId=1 |
