<!--
PLANTILLA COMPARTIDA DE REPORTE INDIVIDUAL
- Copiar a pruebas/<categoria>/<ID>/reporte.md SOLO despues de una ejecucion real.
- Reemplazar TC-XXX-000 y todos los marcadores <...>. No dejar secciones con datos supuestos:
  si un dato no se obtuvo, escribir "No obtenido" y explicar por que.
- No incluir contrasenas, valores de X-Metabase-Session, cookies ni el contenido de .env.
- Borrar este comentario al usar la plantilla.
-->
# Reporte de prueba: TC-XXX-000

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-XXX-000 |
| Escenario | <copiar de caso.md> |
| Categoría | <copiar de caso.md> |
| Ejecutado por | <Juan / Samuel> |
| Instalación | <equipo de Juan / equipo de Samuel> |
| Identificador de ejecución vigente | <AAAAMMDD-integrante-NN> |
| Fecha y hora de ejecución | <AAAA-MM-DD HH:MM> |
| Versión de Metabase | <valor de version.tag, p. ej. v0.64.1> |
| Herramienta utilizada | <Navegador / Cypress / Postman + Newman / JMeter> |

**Historial de ejecuciones** (no borrar filas anteriores):

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| <AAAAMMDD-integrante-01> | <AAAA-MM-DD> | <...> | <estado> | `resultados/<AAAAMMDD-integrante-01>/` |

## 2. Objetivo de la prueba

<copiar el objetivo de caso.md>

## 3. Precondiciones

<lista de precondiciones de caso.md, indicando para cada una si se verificó y cómo>

## 4. Procedimiento ejecutado

<pasos realmente ejecutados, en orden; indicar cualquier desviación respecto de caso.md>

## 5. Resultado esperado

<copiar textualmente de caso.md, incluido el código HTTP esperado>

## 6. Resultado obtenido

<lo observado de forma objetiva: valores, mensajes, código HTTP, tiempos medidos>

## 7. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `evidencias/<id-ejecucion>/<archivo>` | <qué muestra> |
| 2 | `resultados/<id-ejecucion>/<archivo>` | <reporte nativo de la herramienta> |

## 8. Estado de la prueba

<Aprobado / No aprobado / Bloqueado / No ejecutado>

## 9. Justificación del resultado

<comparación explícita entre el resultado esperado (sección 5) y el obtenido (sección 6) que sustenta el estado>

## 10. Hallazgos

<ID del hallazgo en reportes-generales/registro-hallazgos.csv y resumen, o "Ninguno">

## 11. Conclusión

<conclusión breve, limitada a lo observado en esta ejecución>

## 12. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | <...> |
| Navegador y versión (si aplica) | <...> |
| Versión de Docker | <...> |
| Recursos asignados a Docker (CPU / RAM) | <...> |
| Versión de la herramienta (Cypress / Newman / JMeter) | <...> |
| Comando ejecutado | `<comando, sin credenciales>` |
| Configuración relevante | <p. ej. ignore_cache, usuarios virtuales, iteraciones, estado de caché> |
| Identificadores locales usados | <IDs de pregunta / dashboard de esta instalación> |
