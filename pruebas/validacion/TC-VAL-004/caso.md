# TC-VAL-004 — Parámetro inexistente en consulta

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-VAL-004` |
| Escenario | Parámetro inexistente en consulta |
| Categoría | Pruebas de validación de entradas |
| Herramienta principal (plan) | Navegador web / Cypress |
| Responsable asignado | Juan (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-11 |
| Código HTTP esperado (plan) | N/A |
| Estado | **No ejecutado** |

## Objetivo

Comprobar que una consulta con un valor de texto inexistente se procesa sin errores y presenta un resultado vacío.

*Propósito de la categoría según el plan:* Verificar que Metabase procese adecuadamente los valores proporcionados por los usuarios mediante formularios, filtros y parámetros de consulta, ante información válida, inválida, incompleta o inexistente.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Valor `QA_VALOR_INEXISTENTE_2026` previamente verificado como ausente en la columna seleccionada.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Columna: **no especificada en el plan**. Propuesta del equipo: `Products.Title`, con la verificación R06 (resultado esperado 0).

## Procedimiento / solicitud (plan)

Aplicar un filtro de texto con el valor QA_VALOR_INEXISTENTE_2026, previamente verificado como ausente en la columna seleccionada.

## Resultado esperado (plan)

La consulta se procesa sin errores inesperados y presenta un resultado vacío, indicando que no existen registros que cumplan con el criterio especificado.

**Código HTTP esperado:** N/A

## Recursos necesarios

- Sample Database
- Verificación R06

## Observaciones para la automatización

- Si R06 no es 0, el caso queda Bloqueado hasta definir otra columna.

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-VAL-004.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
