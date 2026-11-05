# TC-REN-002 — Tiempo de carga de dashboard

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-REN-002` |
| Escenario | Tiempo de carga de dashboard |
| Categoría | Pruebas de rendimiento |
| Herramienta principal (plan) | Navegador web / Herramientas de desarrollador |
| Responsable asignado | Samuel (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Juan) |
| Fecha programada (cronograma del plan) | 2026-11-18 |
| Código HTTP esperado (plan) | N/A |
| Estado | **No ejecutado** |

## Objetivo

Medir el tiempo de carga completa de un dashboard con tres visualizaciones frente al SLO interno de 6000 ms.

*Propósito de la categoría según el plan:* Evaluar el comportamiento de Metabase mediante la medición de los tiempos de respuesta, la estabilidad de las operaciones y la capacidad de procesamiento de los servicios seleccionados (P95, porcentaje de solicitudes exitosas y throughput).

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Dashboard con tres visualizaciones previamente configuradas.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Dashboard: `QA - Dashboard Principal` (sin valor de filtro aplicado).

## Procedimiento / solicitud (plan)

Abrir desde el navegador un dashboard que contenga tres visualizaciones previamente configuradas. Ejecutar 10 cargas secuenciales.

## Resultado esperado (plan)

Al menos 9 de las 10 cargas deben completar la presentación de todas las visualizaciones en menos de 6000 ms. Las 10 deben finalizar correctamente.

**Código HTTP esperado:** N/A

## Recursos necesarios

- Navegador web y sus herramientas de desarrollador
- `QA - Dashboard Principal`

## Observaciones para la automatización

- El plan mide desde el inicio de la navegación hasta que las visualizaciones están completamente cargadas, no solo la respuesta HTTP inicial.
- Registrar el navegador, su versión y el estado de caché del navegador en cada carga.
- El plan indica que los umbrales son objetivos internos (SLO) que deben ratificarse mediante una ejecución piloto antes de las mediciones formales, conservando las mismas condiciones de configuración, volumen de datos, estado de caché y recursos.

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-REN-002.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
