# TC-ERR-004 — Método HTTP no admitido

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-ERR-004` |
| Escenario | Método HTTP no admitido |
| Categoría | Pruebas de manejo de errores |
| Herramienta principal (plan) | Postman + Newman |
| Responsable asignado | Samuel (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel y Juan) |
| Fecha programada (cronograma del plan) | 2026-11-12 |
| Código HTTP esperado (plan) | 404 Not Found / 405 Method Not Allowed |
| Estado | **No ejecutado** |

## Objetivo

Comprobar que una solicitud con un método no definido sobre `/api/session` es rechazada con 404 o 405.

*Propósito de la categoría según el plan:* Verificar que Metabase responda adecuadamente ante solicitudes que no pueden procesarse de manera correcta, analizando los códigos de estado HTTP, la estructura de las respuestas y la coherencia entre la condición de error y la información proporcionada.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Ninguna especificada en el plan.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Ninguna adicional.

## Procedimiento / solicitud (plan)

GET /api/session, utilizando un método no definido para esta operación en la API seleccionada.

## Resultado esperado (plan)

El servicio rechaza la solicitud e informa que la operación no se encuentra disponible mediante el método utilizado.

**Código HTTP esperado:** 404 Not Found / 405 Method Not Allowed

## Recursos necesarios

- `GET /api/session`

## Observaciones para la automatización

- Según el código fuente de v0.64.1, `/api/session` solo define `POST` y `DELETE` (más subrutas como `/properties`); no existe `GET /api/session`. Registrar el código real obtenido.

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-ERR-004.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
