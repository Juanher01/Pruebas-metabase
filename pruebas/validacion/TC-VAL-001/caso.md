# TC-VAL-001 — Parámetro válido en filtro de consulta

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-VAL-001` |
| Escenario | Parámetro válido en filtro de consulta |
| Categoría | Pruebas de validación de entradas |
| Herramienta principal (plan) | Navegador web / Cypress |
| Responsable asignado | Juan (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-11 |
| Código HTTP esperado (plan) | N/A |
| Estado | **Aprobado**: ejecución `20261105-juan-01` (Subtotal Mayor que 100), ver [reporte.md](reporte.md) |

## Objetivo

Comprobar que un filtro numérico con un valor válido devuelve exactamente los registros que cumplen el criterio.

*Propósito de la categoría según el plan:* Verificar que Metabase procese adecuadamente los valores proporcionados por los usuarios mediante formularios, filtros y parámetros de consulta, ante información válida, inválida, incompleta o inexistente.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Columna numérica disponible en la base de datos de ejemplo.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Columna y valor: **pendientes de definición** (el plan no los especifica). Definir y registrar el valor de referencia antes de ejecutar.

## Procedimiento / solicitud (plan)

Seleccionar una columna numérica de la base de datos de ejemplo, aplicar un filtro con un valor válido y ejecutar la consulta mediante el editor gráfico.

## Resultado esperado (plan)

Se presentan los registros que cumplen con el criterio especificado, conservando la correspondencia entre el valor utilizado y los resultados obtenidos.

**Código HTTP esperado:** N/A

## Recursos necesarios

- Sample Database
- Valor de referencia por definir

## Observaciones para la automatización

- Si se automatiza con Cypress, usar selectores estables y el mismo idioma de interfaz en ambas instalaciones.

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-VAL-001.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
