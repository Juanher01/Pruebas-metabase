# TC-CON-001 — Presencia de campos esperados

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-CON-001` |
| Escenario | Presencia de campos esperados |
| Categoría | Pruebas de contrato y consistencia |
| Herramienta principal (plan) | Postman + Newman |
| Responsable asignado | Samuel (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-17 |
| Código HTTP esperado (plan) | 200 OK |
| Estado | **No ejecutado** |

## Objetivo

Comprobar que la respuesta del dashboard contiene los campos esperados por el contrato de la versión evaluada.

*Propósito de la categoría según el plan:* Verificar que los endpoints seleccionados proporcionen respuestas que cumplan con las estructuras, tipos de datos y condiciones de comportamiento esperadas, tomando como referencia el contrato documentado para la versión de Metabase instalada.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Solicitud autenticada.
- Contrato documentado para la versión instalada.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Dashboard: `QA - Dashboard Principal`.

## Procedimiento / solicitud (plan)

GET /api/dashboard/{id}

## Resultado esperado (plan)

La respuesta JSON contiene los campos id y name, correspondientes al identificador y nombre del dashboard solicitado, junto con la información estructural definida por el contrato de la versión evaluada.

**Código HTTP esperado:** 200 OK

## Recursos necesarios

- `GET /api/dashboard/{id}`
- Referencia de la API (`/api/docs`)

## Observaciones para la automatización

- La "información estructural definida por el contrato" no está enumerada en el plan: **pendiente de definición** a partir de la referencia de la API de v0.64.1 (`/api/docs`), antes de escribir el esquema JSON (AJV).
- Autenticación de la API: la sesión la obtiene `scripts/ejecutar-herramienta.ps1` (con `POST /api/session`, verificado en v0.64.1) y se entrega como `{{sessionId}}` / `${__P(sessionId)}` para la cabecera `X-Metabase-Session`. No incluir el inicio de sesión ni la contraseña dentro de la colección o del plan (ver `docs/HERRAMIENTAS-NEWMAN-JMETER.md`).
- No escribir IDs fijos en el script: usar variables del entorno local (`configuracion/recursos-locales.json` / entorno de Postman).

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-CON-001.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
