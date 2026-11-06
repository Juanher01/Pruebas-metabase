# TC-VAL-002 — Parámetro inválido en filtro numérico

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-VAL-002` |
| Escenario | Parámetro inválido en filtro numérico |
| Categoría | Pruebas de validación de entradas |
| Herramienta principal (plan) | Navegador web / Cypress |
| Responsable asignado | Juan (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-11 |
| Código HTTP esperado (plan) | N/A |
| Estado | **Aprobado**: ejecución `20261105-juan-01`, escenario B (el campo admite `abc` pero no permite confirmar el filtro), ver [reporte.md](reporte.md) |

## Objetivo

Comprobar que el sistema rechaza o informa la incompatibilidad de un valor alfabético en un filtro numérico sin errores inesperados.

*Propósito de la categoría según el plan:* Verificar que Metabase procese adecuadamente los valores proporcionados por los usuarios mediante formularios, filtros y parámetros de consulta, ante información válida, inválida, incompleta o inexistente.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Filtro sobre una columna numérica.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Columna numérica: **pendiente de definición** (por ejemplo `Orders.Subtotal`, propuesta del equipo). Valor: `abc` (definido en el plan).

## Procedimiento / solicitud (plan)

Intentar introducir un valor alfabético, como abc, en un filtro que requiere información numérica.

## Resultado esperado (plan)

El sistema impide utilizar el valor como una entrada numérica válida o informa de su incompatibilidad, sin producir errores inesperados ni resultados incorrectos.

**Código HTTP esperado:** N/A

## Recursos necesarios

- Sample Database

## Observaciones para la automatización

- Registrar el comportamiento exacto observado (bloqueo de la entrada, mensaje o descarte del valor), porque el plan admite cualquiera de las dos respuestas.

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-VAL-002.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
