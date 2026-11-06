# TC-FUN-005 — Visualización gráfica de resultados

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-FUN-005` |
| Escenario | Visualización gráfica de resultados |
| Categoría | Pruebas funcionales |
| Herramienta principal (plan) | Navegador web |
| Responsable asignado | Juan (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-10 |
| Código HTTP esperado (plan) | N/A |
| Estado | **Aprobado**: ejecución `20261105-juan-12`, ver [reporte.md](reporte.md) |

## Objetivo

Comprobar que los resultados de una consulta se representan en un gráfico de barras con valores y categorías coincidentes.

*Propósito de la categoría según el plan:* Verificar que las operaciones principales de Metabase se ejecuten conforme al comportamiento esperado, considerando autenticación, construcción de consultas, visualización de resultados, administración de dashboards, organización de colecciones y utilización de la API REST.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Datos compatibles con una visualización de barras.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Propuesta del equipo: `Products`, conteo agrupado por `Category`, comparando con R04.

## Procedimiento / solicitud (plan)

Ejecutar una consulta con datos compatibles con una visualización de barras y seleccionar dicho tipo de gráfico.

## Resultado esperado (plan)

El sistema representa los datos mediante un gráfico de barras cuyos valores y categorías coinciden con los resultados de la consulta.

**Código HTTP esperado:** N/A

## Recursos necesarios

- Sample Database (Products)
- Valor de referencia R04

## Observaciones para la automatización

- Comparar el gráfico con la vista de tabla de la misma consulta.

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-FUN-005.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
