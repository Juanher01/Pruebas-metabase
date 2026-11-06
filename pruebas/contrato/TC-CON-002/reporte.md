# Reporte de prueba: TC-CON-002

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-CON-002 |
| Escenario | Validación de tipos de datos |
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

Comprobar que los campos `id`, `name`, `display` y `dataset_query` de una pregunta tienen los tipos de datos esperados.

## 3. Precondiciones

- Criterios de inicio: Metabase v0.64.1 disponible.
- Solicitud autenticada con la cuenta admin.
- Pregunta `QA - Pedidos con subtotal mayor a 100` (P1, ID local 40), creada con `scripts/preparar-recursos-qa.ps1`.

## 4. Procedimiento ejecutado

1. Se ejecutó la colección `scripts/TC-CON-002.postman_collection.json` con Newman: `GET /api/card/40`.
2. La colección valida cada tipo por separado y con un esquema JSON (AJV).

## 5. Resultado esperado

Los campos del recurso presentan tipos de datos coherentes con el contrato: id (entero), name (cadena de texto), display (cadena de texto) y dataset_query (objeto JSON).

**Código HTTP esperado:** 200 OK

## 6. Resultado obtenido

- Solicitud: `GET /api/card/40`
- Código HTTP: **200 OK**
- `id`: entero (40); `name`: cadena (`QA - Pedidos con subtotal mayor a 100`); `display`: cadena (`table`); `dataset_query`: objeto JSON (no nulo ni arreglo).
- Aserciones de Newman: 12/12 aserciones superadas (todas superadas).

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

Se esperaba 200 con id entero, name y display cadenas y dataset_query objeto; los cuatro tipos coinciden.

## 10. Hallazgos

Ninguno.

## 11. Conclusión

Los cuatro campos evaluados de `GET /api/card/{id}` tienen en esta ejecución los tipos del contrato.

## 12. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Windows 11 Home 10.0.26300 |
| Navegador y versión (si aplica) | No aplica |
| Versión de Docker | Engine 29.6.2 |
| Recursos asignados a Docker (CPU / RAM) | 12 CPU y 3,5 GiB de RAM (Docker Desktop); el contenedor `metabase-qa` no tiene límites propios |
| Versión de la herramienta (Newman) | 6.2.2 |
| Comando ejecutado | `scripts/ejecutar-herramienta.ps1 -Caso TC-CON-002 -Herramienta newman -Integrante samuel` |
| Configuración relevante | 1 iteración; sesión de la cuenta admin; ejecutado el 2026-11-05, antes de la fecha programada en el plan |
| Identificadores locales usados | cardId=40, databaseId=1 |
