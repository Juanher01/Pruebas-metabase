# TC-FUN-007 — Aplicación de filtros en dashboard

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-FUN-007` |
| Escenario | Aplicación de filtros en dashboard |
| Categoría | Pruebas funcionales |
| Herramienta principal (plan) | Navegador web |
| Responsable asignado | Juan (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-10 |
| Código HTTP esperado (plan) | N/A |
| Estado | **Aprobado**: ejecución `20261105-juan-07`, dashboard ID 37 en `QA - Metabase`, ver [reporte.md](reporte.md) |

## Objetivo

Comprobar que un filtro de categoría configurado en un dashboard actualiza las visualizaciones vinculadas según el valor seleccionado.

*Propósito de la categoría según el plan:* Verificar que las operaciones principales de Metabase se ejecuten conforme al comportamiento esperado, considerando autenticación, construcción de consultas, visualización de resultados, administración de dashboards, organización de colecciones y utilización de la API REST.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Dashboard con una pregunta que permita filtrar por categoría.
- Valor de categoría existente.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Dashboard: el creado en TC-FUN-006 (el filtro se configura como parte del caso).
- Valor existente tomado de R04.

## Procedimiento / solicitud (plan)

Configurar un filtro de categoría asociado a una pregunta del dashboard y seleccionar un valor existente.

## Resultado esperado (plan)

Las visualizaciones vinculadas se actualizan y muestran únicamente los resultados correspondientes al criterio seleccionado.

**Código HTTP esperado:** N/A

## Recursos necesarios

- Dashboard `EJEC - TC-FUN-006 - Dashboard - <AAAAMMDD>`
- Valor de referencia R04

## Observaciones para la automatización

- No usar `QA - Dashboard Principal`, que ya tiene el filtro configurado y no permitiría observar la configuración.

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-FUN-007.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
