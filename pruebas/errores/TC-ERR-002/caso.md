# TC-ERR-002 — Formato de identificador inválido

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-ERR-002` |
| Escenario | Formato de identificador inválido |
| Categoría | Pruebas de manejo de errores |
| Herramienta principal (plan) | Postman + Newman |
| Responsable asignado | Samuel (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel y Juan) |
| Fecha programada (cronograma del plan) | 2026-11-12 |
| Código HTTP esperado (plan) | 400 Bad Request / 404 Not Found |
| Estado | **No ejecutado** |

## Objetivo

Comprobar que un identificador alfabético es rechazado con 400 o 404, sin error interno.

*Propósito de la categoría según el plan:* Verificar que Metabase responda adecuadamente ante solicitudes que no pueden procesarse de manera correcta, analizando los códigos de estado HTTP, la estructura de las respuestas y la coherencia entre la condición de error y la información proporcionada.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Sesión autorizada (no especificado explícitamente en el plan).

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Ninguna adicional.

## Procedimiento / solicitud (plan)

GET /api/dashboard/abc utilizando un identificador alfabético en lugar de uno numérico.

## Resultado esperado (plan)

El servicio rechaza el identificador inválido o informa que no existe una ruta válida para la solicitud, sin generar un error interno inesperado.

**Código HTTP esperado:** 400 Bad Request / 404 Not Found

## Recursos necesarios

- `GET /api/dashboard/abc`

## Observaciones para la automatización

- En el código fuente de v0.64.1, `id` se valida como entero positivo o NanoID (21 caracteres). Registrar el código real obtenido; un 5xx sería un error interno.
- Autenticación de la API: la sesión la obtiene `scripts/ejecutar-herramienta.ps1` (con `POST /api/session`, verificado en v0.64.1) y se entrega como `{{sessionId}}` / `${__P(sessionId)}` para la cabecera `X-Metabase-Session`. No incluir el inicio de sesión ni la contraseña dentro de la colección o del plan (ver `docs/HERRAMIENTAS-NEWMAN-JMETER.md`).

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-ERR-002.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
