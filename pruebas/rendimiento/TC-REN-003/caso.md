# TC-REN-003 — Estabilidad bajo solicitudes repetitivas

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-REN-003` |
| Escenario | Estabilidad bajo solicitudes repetitivas |
| Categoría | Pruebas de rendimiento |
| Herramienta principal (plan) | Postman + Newman |
| Responsable asignado | Samuel (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Juan) |
| Fecha programada (cronograma del plan) | 2026-11-18 |
| Código HTTP esperado (plan) | 200 OK |
| Estado | **No ejecutado** |

## Objetivo

Evaluar la estabilidad de los tiempos de respuesta ante 30 solicitudes secuenciales sobre la misma pregunta.

*Propósito de la categoría según el plan:* Evaluar el comportamiento de Metabase mediante la medición de los tiempos de respuesta, la estabilidad de las operaciones y la capacidad de procesamiento de los servicios seleccionados (P95, porcentaje de solicitudes exitosas y throughput).

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Pregunta guardada.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Pregunta: `QA - Pedidos con subtotal mayor a 100`.

## Procedimiento / solicitud (plan)

Ejecutar 30 solicitudes secuenciales a POST /api/card/{card-id}/query, utilizando la misma pregunta guardada.

## Resultado esperado (plan)

El 100 % de las solicitudes debe finalizar correctamente y el P95 del tiempo de respuesta debe ser inferior a 4000 ms.

**Código HTTP esperado:** 200 OK

## Recursos necesarios

- `POST /api/card/{card-id}/query`
- Newman (`-n 30`)

## Observaciones para la automatización

- El plan pide registrar además la media, mediana, mínimo, máximo y desviación estándar como métricas descriptivas.
- Caché: el plan exige mantener controlada la configuración de caché. `POST /api/card/{card-id}/query` admite `ignore_cache`; la decisión de usarlo se toma en el piloto y debe mantenerse igual en ejecuciones comparables.
- Código HTTP: el plan espera `200 OK`. Según el código fuente de v0.64.1, las respuestas de consulta en *streaming* usan `202` por defecto. Debe confirmarse en la ejecución piloto y, si se confirma, el equipo debe documentar el ajuste antes de la ejecución formal (ver `docs/CONFIGURACION-QA.md` §7). No se ha modificado el resultado esperado del plan.
- El plan indica que los umbrales son objetivos internos (SLO) que deben ratificarse mediante una ejecución piloto antes de las mediciones formales, conservando las mismas condiciones de configuración, volumen de datos, estado de caché y recursos.

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-REN-003.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
