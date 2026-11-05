# TC-CON-003 — Consistencia entre listado y detalle

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-CON-003` |
| Escenario | Consistencia entre listado y detalle |
| Categoría | Pruebas de contrato y consistencia |
| Herramienta principal (plan) | Postman + Newman |
| Responsable asignado | Samuel (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-17 |
| Código HTTP esperado (plan) | 200 OK |
| Estado | **No ejecutado** |

## Objetivo

Comprobar que los campos comunes de una pregunta son equivalentes entre el listado y el detalle.

*Propósito de la categoría según el plan:* Verificar que los endpoints seleccionados proporcionen respuestas que cumplan con las estructuras, tipos de datos y condiciones de comportamiento esperadas, tomando como referencia el contrato documentado para la versión de Metabase instalada.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Solicitud autenticada, con las mismas condiciones de acceso en ambas solicitudes.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Pregunta a contrastar: `QA - Pedidos con subtotal mayor a 100` (seleccionarla del listado por nombre, no por ID fijo).

## Procedimiento / solicitud (plan)

GET /api/card y GET /api/card/{id}

## Resultado esperado (plan)

Una pregunta obtenida mediante el listado puede consultarse individualmente utilizando su identificador. Los campos comunes, como id y name, conservan valores equivalentes entre ambas respuestas, bajo las mismas condiciones de acceso.

**Código HTTP esperado:** 200 OK

## Recursos necesarios

- `GET /api/card`
- `GET /api/card/{id}`

## Observaciones para la automatización

- Usar la misma sesión para ambas solicitudes.
- Autenticación de la API: la sesión la obtiene `scripts/ejecutar-herramienta.ps1` (con `POST /api/session`, verificado en v0.64.1) y se entrega como `{{sessionId}}` / `${__P(sessionId)}` para la cabecera `X-Metabase-Session`. No incluir el inicio de sesión ni la contraseña dentro de la colección o del plan (ver `docs/HERRAMIENTAS-NEWMAN-JMETER.md`).

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-CON-003.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
