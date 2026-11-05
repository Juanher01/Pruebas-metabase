# TC-FUN-003 — Ejecución de consulta SQL

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-FUN-003` |
| Escenario | Ejecución de consulta SQL |
| Categoría | Pruebas funcionales |
| Herramienta principal (plan) | Navegador web |
| Responsable asignado | Juan (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-09 |
| Código HTTP esperado (plan) | N/A |
| Estado | **No ejecutado** |

## Objetivo

Comprobar que una consulta SQL de lectura con agregación se ejecuta y que su resultado coincide con el valor de referencia calculado sobre la misma fuente.

*Propósito de la categoría según el plan:* Verificar que las operaciones principales de Metabase se ejecuten conforme al comportamiento esperado, considerando autenticación, construcción de consultas, visualización de resultados, administración de dashboards, organización de colecciones y utilización de la API REST.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Operación de agregación previamente definida.
- Resultado de referencia calculado sobre la misma fuente de datos.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Propuesta del equipo: `SELECT COUNT(*) AS TOTAL_PEDIDOS FROM PUBLIC.ORDERS;` y referencia R03 registrada durante la preparación.

## Procedimiento / solicitud (plan)

Ejecutar una consulta SQL de lectura sobre una tabla disponible, utilizando una operación de agregación previamente definida.

## Resultado esperado (plan)

Se presenta el resultado de la consulta y el valor obtenido coincide con el resultado de referencia calculado sobre la misma fuente de datos.

**Código HTTP esperado:** N/A

## Recursos necesarios

- Sample Database (Orders)
- Valor de referencia R03

## Observaciones para la automatización

- Para evitar una comparación circular, conviene contrastar el resultado también con un mecanismo distinto (por ejemplo, la pregunta `QA - Conteo de pedidos` del editor gráfico). Esto es una recomendación de ejecución, no un criterio del plan.

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-FUN-003.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
