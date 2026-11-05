# TC-FUN-010 — Ejecución de pregunta guardada mediante API REST

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-FUN-010` |
| Escenario | Ejecución de pregunta guardada mediante API REST |
| Categoría | Pruebas funcionales |
| Herramienta principal (plan) | Postman + Newman |
| Responsable asignado | Juan (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-11 |
| Código HTTP esperado (plan) | 200 OK |
| Estado | **No ejecutado** |

## Objetivo

Comprobar que la ejecución de una pregunta guardada mediante la API devuelve resultados coherentes con los de la interfaz web.

*Propósito de la categoría según el plan:* Verificar que las operaciones principales de Metabase se ejecuten conforme al comportamiento esperado, considerando autenticación, construcción de consultas, visualización de resultados, administración de dashboards, organización de colecciones y utilización de la API REST.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Identificador de una pregunta válida.
- Sesión autorizada.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Pregunta: `QA - Pedidos con subtotal mayor a 100` (ID local en `preguntas.pedidos_subtotal_mayor_100`).
- Resultado de la misma pregunta en la interfaz web, para la comparación.

## Procedimiento / solicitud (plan)

POST /api/card/{card-id}/query, utilizando el identificador de una pregunta válida y una sesión autorizada.

## Resultado esperado (plan)

Se obtiene una respuesta con los resultados de la pregunta, coherentes con los datos presentados al ejecutar la misma consulta desde la interfaz web bajo condiciones equivalentes.

**Código HTTP esperado:** 200 OK

## Recursos necesarios

- `POST /api/session`
- `POST /api/card/{card-id}/query`
- Valor de referencia R02

## Observaciones para la automatización

- Código HTTP: el plan espera `200 OK`. Según el código fuente de v0.64.1, las respuestas de consulta en *streaming* usan `202` por defecto. Debe confirmarse en la ejecución piloto y, si se confirma, el equipo debe documentar el ajuste antes de la ejecución formal (ver `docs/CONFIGURACION-QA.md` §7). No se ha modificado el resultado esperado del plan.
- Autenticación de la API: la sesión la obtiene `scripts/ejecutar-herramienta.ps1` (con `POST /api/session`, verificado en v0.64.1) y se entrega como `{{sessionId}}` / `${__P(sessionId)}` para la cabecera `X-Metabase-Session`. No incluir el inicio de sesión ni la contraseña dentro de la colección o del plan (ver `docs/HERRAMIENTAS-NEWMAN-JMETER.md`).
- No escribir IDs fijos en el script: usar variables del entorno local (`configuracion/recursos-locales.json` / entorno de Postman).

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-FUN-010.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
