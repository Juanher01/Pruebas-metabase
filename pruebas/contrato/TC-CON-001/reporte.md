# Reporte de prueba: TC-CON-001

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-CON-001 |
| Escenario | Presencia de campos esperados |
| Categoría | Pruebas de contrato y consistencia |
| Ejecutado por | Samuel |
| Instalación | Equipo de Samuel |
| Identificador de ejecución vigente | 20261105-samuel-01 |
| Fecha y hora de ejecución | 2026-11-05 12:11 |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Postman + Newman |

**Historial de ejecuciones** (no borrar filas anteriores):

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| 20261105-samuel-01 | 2026-11-05 | Samuel | Aprobado | `resultados/20261105-samuel-01/` |

## 2. Objetivo de la prueba

Comprobar que la respuesta del dashboard contiene los campos esperados por el contrato de la versión evaluada.

## 3. Precondiciones

- Criterios de inicio: Metabase v0.64.1 disponible. El contrato (campos y tipos) se definió a partir de la respuesta real de v0.64.1 y del código fuente (ver `docs/CONTRATOS-API-V0.64.1.md`).
- Solicitud autenticada con la cuenta admin.
- Dashboard `QA - Dashboard Principal` (ID local 2), creado con `scripts/preparar-recursos-qa.ps1`.

## 4. Procedimiento ejecutado

1. Se ejecutó la colección `scripts/TC-CON-001.postman_collection.json` con Newman: `GET /api/dashboard/2`.
2. La colección valida los campos `id` y `name`, el esquema JSON del contrato (AJV) y los valores de referencia (3 visualizaciones y 1 filtro vinculado).

## 5. Resultado esperado

La respuesta JSON contiene los campos id y name, correspondientes al identificador y nombre del dashboard solicitado, junto con la información estructural definida por el contrato de la versión evaluada.

**Código HTTP esperado:** 200 OK

## 6. Resultado obtenido

- Solicitud: `GET /api/dashboard/2`
- Código HTTP: **200 OK**
- `id` = 2 y `name` = `QA - Dashboard Principal`.
- Cumple el esquema del contrato (campos y tipos); `dashcards` = 3, todas con `dashboard_id` = 2; `parameters` = 1 filtro, vinculado a las 3 tarjetas.
- Aserciones de Newman: 10/10 aserciones superadas (todas superadas).

## 7. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `resultados/20261105-samuel-01/newman-report.html` | Reporte navegable de Newman |
| 2 | `resultados/20261105-samuel-01/newman-results.json` | Resultado completo (solicitudes, respuestas, aserciones) |
| 3 | `resultados/20261105-samuel-01/consola.log` | Salida de consola |
| 4 | `resultados/20261105-samuel-01/ejecucion-info.txt` | Datos de la ejecución |

## 8. Estado de la prueba

**Aprobado**

## 9. Justificación del resultado

Se esperaba 200 con `id` y `name` del dashboard solicitado y la estructura del contrato; se obtuvo 200, `id`/`name` correctos y el esquema válido.

## 10. Hallazgos

Ninguno.

## 11. Conclusión

La respuesta de `GET /api/dashboard/{id}` cumple en esta ejecución el contrato definido para v0.64.1.

## 12. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Windows 11 Home 10.0.26300 |
| Navegador y versión (si aplica) | No aplica |
| Versión de Docker | Engine 29.6.2 |
| Recursos asignados a Docker (CPU / RAM) | 12 CPU y 3,5 GiB de RAM (Docker Desktop); el contenedor `metabase-qa` no tiene límites propios |
| Versión de la herramienta (Newman) | 6.2.2 |
| Comando ejecutado | `scripts/ejecutar-herramienta.ps1 -Caso TC-CON-001 -Herramienta newman -Integrante samuel` |
| Configuración relevante | 1 iteración; sesión de la cuenta admin; ejecutado el 2026-11-05, antes de la fecha programada en el plan |
| Identificadores locales usados | dashboardId=2, databaseId=1 |
