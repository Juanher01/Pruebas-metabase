# TC-VAL-003 — Campo obligatorio incompleto en autenticación

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-VAL-003` |
| Escenario | Campo obligatorio incompleto en autenticación |
| Categoría | Pruebas de validación de entradas |
| Herramienta principal (plan) | Navegador web / Cypress |
| Responsable asignado | Juan (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-11 |
| Código HTTP esperado (plan) | N/A |
| Estado | **Aprobado**: ejecución `20261105-juan-01` (botón deshabilitado y mensaje "Obligatorio"; sin sesión), ver [reporte.md](reporte.md) |

## Objetivo

Comprobar que no es posible autenticarse con la contraseña vacía y que el sistema informa la información faltante.

*Propósito de la categoría según el plan:* Verificar que Metabase procese adecuadamente los valores proporcionados por los usuarios mediante formularios, filtros y parámetros de consulta, ante información válida, inválida, incompleta o inexistente.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Correo electrónico registrado.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Correo del usuario normal de prueba.

## Procedimiento / solicitud (plan)

Intentar iniciar sesión mediante la interfaz web proporcionando un correo electrónico registrado y dejando vacío el campo de contraseña.

## Resultado esperado (plan)

El sistema no permite completar la autenticación e informa que la información requerida está incompleta, sin conceder acceso a los recursos protegidos.

**Código HTTP esperado:** N/A

## Recursos necesarios

- Interfaz web de inicio de sesión
- Usuario normal de prueba

## Observaciones para la automatización

- Verificar después que no se puede acceder a una página protegida (no hay sesión).
- Credenciales: cuenta `usuario-qa` o `admin` del `.env` local (`QA_USER_*` / `QA_ADMIN_*`), entregadas a Cypress solo como variables del proceso; escribir la contraseña con `{ log: false }` y no crear `cypress.env.json` con valores (ver `docs/AUTENTICACION-QA.md` §5).

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-VAL-003.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
