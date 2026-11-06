# TC-FUN-009 — Consulta de dashboard mediante API REST

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-FUN-009` |
| Escenario | Consulta de dashboard mediante API REST |
| Categoría | Pruebas funcionales |
| Herramienta principal (plan) | Postman + Newman |
| Responsable asignado | Juan (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-11 |
| Código HTTP esperado (plan) | 200 OK |
| Estado | **Aprobado**: ejecución `20261105-juan-01` (Newman, 7/7 aserciones), ver [reporte.md](reporte.md) |

## Objetivo

Comprobar que el endpoint devuelve la información del dashboard solicitado con identificador y nombre correspondientes.

*Propósito de la categoría según el plan:* Verificar que las operaciones principales de Metabase se ejecuten conforme al comportamiento esperado, considerando autenticación, construcción de consultas, visualización de resultados, administración de dashboards, organización de colecciones y utilización de la API REST.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Identificador de dashboard existente.
- Sesión autorizada.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Dashboard: `QA - Dashboard Principal` (ID local en `dashboard_principal_id`).

## Procedimiento / solicitud (plan)

GET /api/dashboard/{id}, utilizando un identificador existente y una sesión autorizada.

## Resultado esperado (plan)

Se obtiene una respuesta JSON con la información del dashboard solicitado, cuyo identificador y nombre corresponden con el recurso consultado.

**Código HTTP esperado:** 200 OK

## Recursos necesarios

- `POST /api/session`
- `GET /api/dashboard/{id}`
- ID local del dashboard principal

## Observaciones para la automatización

- Autenticación de la API: la sesión la obtiene `scripts/ejecutar-herramienta.ps1` (con `POST /api/session`, verificado en v0.64.1) y se entrega como `{{sessionId}}` / `${__P(sessionId)}` para la cabecera `X-Metabase-Session`. No incluir el inicio de sesión ni la contraseña dentro de la colección o del plan (ver `docs/HERRAMIENTAS-NEWMAN-JMETER.md`).
- No escribir IDs fijos en el script: usar variables del entorno local (`configuracion/recursos-locales.json` / entorno de Postman).

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-FUN-009.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
