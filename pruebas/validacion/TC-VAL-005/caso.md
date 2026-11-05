# TC-VAL-005 — Caracteres especiales en campo de texto

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-VAL-005` |
| Escenario | Caracteres especiales en campo de texto |
| Categoría | Pruebas de validación de entradas |
| Herramienta principal (plan) | Navegador web / Cypress |
| Responsable asignado | Juan (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-11 |
| Código HTTP esperado (plan) | N/A |
| Estado | **No ejecutado** |

## Objetivo

Comprobar que un nombre con tildes, `&` y paréntesis se guarda, se presenta y se recupera sin alteraciones.

*Propósito de la categoría según el plan:* Verificar que Metabase procese adecuadamente los valores proporcionados por los usuarios mediante formularios, filtros y parámetros de consulta, ante información válida, inválida, incompleta o inexistente.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Ninguna adicional especificada en el plan.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Comprobar antes que no exista una pregunta con el nombre `Análisis de ventas & costos (2026)`. Si existe de una ejecución anterior, archivarla y anotarlo.

## Procedimiento / solicitud (plan)

Guardar una pregunta utilizando el nombre Análisis de ventas & costos (2026) y consultar posteriormente el recurso creado.

## Resultado esperado (plan)

El sistema almacena y presenta correctamente el nombre, conservando los caracteres especiales y permitiendo recuperar la pregunta sin alteraciones inesperadas.

**Código HTTP esperado:** N/A

## Recursos necesarios

- Sample Database
- Colección de ejecución

## Observaciones para la automatización

- El nombre se usa exactamente como lo define el plan, sin el prefijo `EJEC -`.
- Puede compararse además el nombre devuelto por `GET /api/card/{id}` (verificación adicional, no exigida por el plan).

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-VAL-005.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
