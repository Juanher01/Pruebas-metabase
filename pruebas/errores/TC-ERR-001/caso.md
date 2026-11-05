# TC-ERR-001 — Recurso inexistente (dashboard no registrado)

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-ERR-001` |
| Escenario | Recurso inexistente (dashboard no registrado) |
| Categoría | Pruebas de manejo de errores |
| Herramienta principal (plan) | Postman + Newman |
| Responsable asignado | Samuel (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel y Juan) |
| Fecha programada (cronograma del plan) | 2026-11-12 |
| Código HTTP esperado (plan) | 404 Not Found |
| Estado | **No ejecutado** |

## Objetivo

Comprobar que la solicitud de un dashboard inexistente devuelve 404 sin datos de otro recurso.

*Propósito de la categoría según el plan:* Verificar que Metabase responda adecuadamente ante solicitudes que no pueden procesarse de manera correcta, analizando los códigos de estado HTTP, la estructura de las respuestas y la coherencia entre la condición de error y la información proporcionada.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Identificador numérico que no corresponda con ningún dashboard existente.
- Sesión autorizada (implícita: el caso evalúa la inexistencia, no la autenticación).

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- ID inexistente sugerido por `scripts/obtener-ids-recursos.ps1` y registrado en `ids_inexistentes_verificados`.

## Procedimiento / solicitud (plan)

GET /api/dashboard/{id} utilizando un identificador numérico que no corresponda con ningún dashboard existente.

## Resultado esperado (plan)

El servicio informa que el recurso solicitado no existe y no retorna información correspondiente a otro dashboard.

**Código HTTP esperado:** 404 Not Found

## Recursos necesarios

- `POST /api/session`
- `GET /api/dashboard/{id}`

## Observaciones para la automatización

- Autenticación de la API: la sesión la obtiene `scripts/ejecutar-herramienta.ps1` (con `POST /api/session`, verificado en v0.64.1) y se entrega como `{{sessionId}}` / `${__P(sessionId)}` para la cabecera `X-Metabase-Session`. No incluir el inicio de sesión ni la contraseña dentro de la colección o del plan (ver `docs/HERRAMIENTAS-NEWMAN-JMETER.md`).
- No escribir IDs fijos en el script: usar variables del entorno local (`configuracion/recursos-locales.json` / entorno de Postman).

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-ERR-001.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
