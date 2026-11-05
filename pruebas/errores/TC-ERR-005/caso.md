# TC-ERR-005 — Solicitud sin autenticación

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-ERR-005` |
| Escenario | Solicitud sin autenticación |
| Categoría | Pruebas de manejo de errores |
| Herramienta principal (plan) | Postman + Newman |
| Responsable asignado | Samuel (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel y Juan) |
| Fecha programada (cronograma del plan) | 2026-11-12 |
| Código HTTP esperado (plan) | 401 Unauthorized |
| Estado | **No ejecutado** |

## Objetivo

Comprobar que un dashboard privado no puede consultarse sin autenticación.

*Propósito de la categoría según el plan:* Verificar que Metabase responda adecuadamente ante solicitudes que no pueden procesarse de manera correcta, analizando los códigos de estado HTTP, la estructura de las respuestas y la coherencia entre la condición de error y la información proporcionada.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Dashboard privado existente.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Dashboard: `QA - Dashboard Restringido` (ID local en `recursos_restringidos.dashboard_privado_id`).

## Procedimiento / solicitud (plan)

GET /api/dashboard/{id} sobre un dashboard privado existente, sin proporcionar credenciales ni una sesión válida.

## Resultado esperado (plan)

El servicio deniega el acceso al recurso protegido y no proporciona los datos del dashboard solicitado.

**Código HTTP esperado:** 401 Unauthorized

## Recursos necesarios

- `GET /api/dashboard/{id}`

## Observaciones para la automatización

- Asegurar que no se envía ninguna cookie ni cabecera de sesión: la solicitud no lleva `X-Metabase-Session`, la colección no incluye inicio de sesión y se ejecuta con `scripts/ejecutar-herramienta.ps1 ... -SinSesion`. En la aplicación Postman, desactive además el *cookie jar* para esta solicitud.
- No escribir IDs fijos en el script: usar variables del entorno local (`configuracion/recursos-locales.json` / entorno de Postman).

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-ERR-005.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
