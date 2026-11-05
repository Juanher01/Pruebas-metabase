# TC-CON-004 — Estructura de resultados de consulta

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-CON-004` |
| Escenario | Estructura de resultados de consulta |
| Categoría | Pruebas de contrato y consistencia |
| Herramienta principal (plan) | Postman + Newman |
| Responsable asignado | Samuel (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-17 |
| Código HTTP esperado (plan) | 200 OK |
| Estado | **No ejecutado** |

## Objetivo

Comprobar que la respuesta de ejecución de una pregunta contiene `data.rows` y `data.cols` con una organización coherente con la consulta.

*Propósito de la categoría según el plan:* Verificar que los endpoints seleccionados proporcionen respuestas que cumplan con las estructuras, tipos de datos y condiciones de comportamiento esperadas, tomando como referencia el contrato documentado para la versión de Metabase instalada.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Solicitud autenticada.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Pregunta: `QA - Pedidos con subtotal mayor a 100`.

## Procedimiento / solicitud (plan)

POST /api/card/{card-id}/query

## Resultado esperado (plan)

La respuesta JSON contiene la estructura de resultados esperada, incluyendo data.rows como arreglo de registros y data.cols como arreglo de metadatos de columnas. La cantidad y organización de los valores es coherente con la consulta ejecutada.

**Código HTTP esperado:** 200 OK

## Recursos necesarios

- `POST /api/card/{card-id}/query`
- Valor de referencia R02

## Observaciones para la automatización

- Código HTTP: el plan espera `200 OK`. Según el código fuente de v0.64.1, las respuestas de consulta en *streaming* usan `202` por defecto. Debe confirmarse en la ejecución piloto y, si se confirma, el equipo debe documentar el ajuste antes de la ejecución formal (ver `docs/CONFIGURACION-QA.md` §7). No se ha modificado el resultado esperado del plan.
- Autenticación de la API: la sesión la obtiene `scripts/ejecutar-herramienta.ps1` (con `POST /api/session`, verificado en v0.64.1) y se entrega como `{{sessionId}}` / `${__P(sessionId)}` para la cabecera `X-Metabase-Session`. No incluir el inicio de sesión ni la contraseña dentro de la colección o del plan (ver `docs/HERRAMIENTAS-NEWMAN-JMETER.md`).
- No escribir IDs fijos en el script: usar variables del entorno local (`configuracion/recursos-locales.json` / entorno de Postman).

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-CON-004.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
