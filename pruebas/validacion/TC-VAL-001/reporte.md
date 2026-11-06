# Reporte de prueba: TC-VAL-001

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-VAL-001 |
| Escenario | Parámetro válido en filtro de consulta |
| Categoría | Pruebas de validación de entradas |
| Ejecutado por | Juan (ejecución automatizada con Claude Code mediante `scripts/ejecutar-herramienta.ps1`) |
| Instalación | Equipo de Juan (`JUANHER01`), rama `qa/juan-funcionales-validacion` |
| Identificador de ejecución oficial | `20261105-juan-01` |
| Fecha y hora de ejecución | 2026-11-05 20:04:00 – 20:05:01 (hora local) |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Cypress 16.2.1, navegador Electron 146 (sin interfaz gráfica) |
| Cuenta utilizada | `usuario-qa`: **Usuario QA**, cuenta normal |

**Ejecución oficial:**

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| `20261105-juan-01` | 2026-11-05 20:05 | Juan | **Aprobado (7/7)** | `resultados/20261105-juan-01/` |

Un intento previo falló por un error del script (§11) y se eliminó. El identificador `-01` se reutilizó porque su carpeta ya no existía.

**Independencia respecto de TC-FUN-002.** Este caso usa el mismo escenario de datos, pero se ejecutó de forma independiente, con su propia especificación, sus capturas y sus resultados. Se reutilizaron selectores, pero no resultados ni evidencias. Además, añade comprobaciones propias de la validación de entradas: que la entrada se acepta y que la consulta la recibe como número.

## 2. Objetivo de la prueba

Comprobar que un filtro numérico con un valor válido devuelve exactamente los registros que cumplen el criterio.

## 3. Precondiciones

| Precondición | Verificada | Cómo |
|---|---|---|
| Metabase v0.64.1 disponible | Sí | `GET /api/health` → `ok`; `version_metabase=v0.64.1` en `ejecucion-info.txt` |
| Columna numérica disponible en la base de datos de ejemplo | Sí | `ORDERS.SUBTOTAL`, de tipo `type/Float`, localizada por nombre en los metadatos (prueba 1) |
| Columna y valor definidos | Sí | El plan no los especifica. Se usaron los de la solicitud de ejecución: Subtotal, *Mayor que*, **100**. Ver §4 |
| Cuenta autorizada | Sí | Usuario QA, no administradora, con permiso de consulta sobre Sample Database |

## 4. Dato numérico y configuración del filtro

| Elemento | Valor |
|---|---|
| Base de datos / tabla | Sample Database / Orders |
| Columna | **Subtotal** (`type/Float`) |
| Operador | **Mayor que** (`>`) |
| **Valor introducido** | **100** |
| Visualización | Tabla |
| Filtro enviado por la interfaz | `[">", campo SUBTOTAL, 100]`, con el valor de **tipo número** (no texto) |
| Píldora mostrada | *"Subtotal es mayor que 100"* |

El valor 100 es el dato elegido para esta ejecución y no representa ningún umbral de validación de Metabase.

## 5. Procedimiento ejecutado

Comando ejecutado desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-VAL-001 -Herramienta cypress -Integrante juan -Cuenta usuario-qa
```

Comando de Cypress construido por el script (registrado en `ejecucion-info.txt`, sin credenciales):

```text
cypress.cmd run --project <repo> --config-file <repo>\recursos-compartidos\cypress\cypress.config.js
  --spec <repo>\pruebas\validacion\TC-VAL-001\scripts\TC-VAL-001.cy.js --browser electron
  --reporter junit --reporter-options mochaFile=<repo>\pruebas\validacion\TC-VAL-001\resultados\20261105-juan-01\cypress-junit.xml
```

Pasos automatizados en [scripts/TC-VAL-001.cy.js](scripts/TC-VAL-001.cy.js). Toda la consulta se configura en el editor gráfico, sin SQL, y no se guarda.

1. **Sesión y columna.** Inicio de sesión por API con `usuario-qa`; la contraseña sale del `.env` local y no se registra. Se comprueban la disponibilidad, el usuario y que la columna Subtotal es numérica.
2. **Datos.** **Nuevo → Pregunta** (editor gráfico, `/question/notebook`) → **Sample Database → Orders**.
3. **Filtro.** En el paso **Filtro**, *Añade filtros para acotar tu respuesta* → **Subtotal**. Se abre el selector **numérico** (`number-filter-picker`) → operador **Mayor que** → se escribe **100**.
4. **Aceptación de la entrada.** Se comprueba que:
   - el campo conserva `100` y no está marcado como inválido (`aria-invalid`);
   - no aparece ningún mensaje de validación o error;
   - el botón **Añadir filtro** está habilitado.

   Captura 01. Tras **Añadir filtro**, el paso Filtro muestra *Subtotal es mayor que 100*. Captura 02.
5. **Ejecución.** **Visualizar** (`POST /api/dataset`, observado sin modificarlo). Se comprueba que la consulta enviada es `Subtotal > 100`, con el valor como número, y que se completa sin errores. Se comprueban la tabla, la píldora y el contador. Captura 03.
6. **Registros devueltos.** Se comprueba que todos tienen un Subtotal numérico mayor que 100.
7. **Tabla visible.** Se comprueba que los valores de Subtotal que muestra la tabla son numéricos y mayores que 100.
8. **Correspondencia con la fuente.** Recuentos SQL de solo lectura de `Subtotal > 100` y `Subtotal <= 100`, comparados con lo devuelto teniendo en cuenta el límite de filas.
9. **Limpieza** (fuera de la evaluación). `DELETE /api/session` y comprobación de que la sesión devuelve 401.

## 6. Resultado esperado

Se presentan los registros que cumplen con el criterio especificado, conservando la correspondencia entre el valor utilizado y los resultados obtenidos.

**Código HTTP esperado (plan):** N/A.

## 7. Resultado obtenido

### Valores observados

Archivo `resultados/20261105-juan-01/validacion-filtro.json`.

| Métrica | Valor |
|---|---|
| Entrada en el campo | `100`, aceptada: sin `aria-invalid`, sin mensajes de error, **Añadir filtro** habilitado |
| Filtro enviado por la interfaz | operador `>`, campo SUBTOTAL (ID 10), valor `100` (`number`) |
| Estado de la consulta | `completed`, sin error |
| Filas devueltas / `row_count` | 2.000 / 2.000 |
| Contador de la interfaz | *"Mostrando las primeras 2,000 filas"* |
| Subtotal mínimo / máximo entre las devueltas | 101,0169… / 148,229… (todos > 100) |
| Registros devueltos con Subtotal ≤ 100 o no numérico | **0 de 2.000** |
| Valores de Subtotal visibles comprobados | 18, por ejemplo `110.93`, `109.22`, `127.88`, `148.23`, `114.42` |
| Valores visibles ≤ 100 o no numéricos | **0 de 18** |
| Fuente: registros con `Subtotal > 100` | 5.244 |
| Fuente: registros con `Subtotal <= 100` (excluidos) | 13.516 |

### Cómo se comprobó la correspondencia con el filtro

1. **Entrada → filtro.** El valor escrito (100) llega a la consulta como el número `100`, con el operador `>` y la columna SUBTOTAL. La interfaz lo muestra como *"Subtotal es mayor que 100"*.
2. **Filtro → registros devueltos.** Cada uno de los 2.000 registros devueltos tiene un Subtotal numérico estrictamente mayor que 100.
3. **Filtro → tabla visible.** Los 18 valores visibles, que se leen con el formato de la interfaz y se convierten a número, son todos mayores que 100.
4. **Registros → fuente.** En la fuente hay 5.244 registros que cumplen la condición. La interfaz entrega las primeras 2.000 filas, porque el límite predeterminado de Metabase para consultas sin agregación es `default-unaggregated-query-row-limit = 2000`, y así lo indica el contador. La igualdad `filas devueltas = row_count = min(5.244; 2.000)` confirma que se aplicó ese límite y no se perdieron ni alteraron registros. Los 13.516 registros con Subtotal ≤ 100 quedaron excluidos.

### Aserciones y resultados

| # | Prueba (JUnit) | Aserciones principales | Resultado |
|---|---|---|---|
| 1 | Disponibilidad, sesión y columna numérica | `/api/health` = `ok`; Usuario QA, no administrador; ORDERS.SUBTOTAL de tipo `type/Float` | Aprobada |
| 2 | Editor gráfico: Sample Database > Orders | Ruta `/question/notebook`; paso Datos = Orders | Aprobada |
| 3 | Filtro Subtotal Mayor que 100, entrada aceptada | Selector numérico; operador *Mayor que*; campo con `100` y sin `aria-invalid`; sin mensajes de error; *Añadir filtro* habilitado; el paso Filtro muestra Subtotal y 100 | Aprobada |
| 4 | Ejecución sin errores con Subtotal > 100 | `POST /api/dataset` 202 `completed`, sin error. Consulta: ORDERS, 1 filtro, `>`, SUBTOTAL, valor `100` de tipo `number`. Tabla visible, sin mensajes de error; 1 píldora *Subtotal es mayor que 100* | Aprobada |
| 5 | Registros devueltos | Registros > 0; 0 no numéricos; 0 con Subtotal ≤ 100 | Aprobada |
| 6 | Valores visibles en la tabla | 18 valores leídos; 0 no numéricos; 0 ≤ 100 | Aprobada |
| 7 | Correspondencia con la fuente | Fuente: 5.244 cumplen y 13.516 excluidos; filas devueltas = `row_count` = min(5.244; 2.000) = 2.000; contador *"Mostrando las primeras…"* | Aprobada |

**Totales del reporte nativo** (`cypress-junit.xml`): 7 pruebas, 7 aprobadas, 0 fallidas. Duración: 37,7 s. Código de salida de Cypress: 0. Salida de errores vacía.

## 8. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `evidencias/20261105-juan-01/01-entrada-numerica-aceptada.png` | Selector de filtro: **Subtotal**, operador **Mayor que**, valor **100** en el campo, sin mensajes de error y **Añadir filtro** habilitado |
| 2 | `evidencias/20261105-juan-01/02-filtro-configurado.png` | Paso Filtro con la condición *Subtotal es mayor que 100* |
| 3 | `evidencias/20261105-juan-01/03-resultados-filtrados.png` | Resultados en tabla: píldora *Subtotal es mayor que 100*, valores de Subtotal superiores a 100 y *"Mostrando las primeras 2,000 filas"* |
| 4 | `resultados/20261105-juan-01/cypress-junit.xml` | Reporte nativo JUnit de Cypress (7/7) |
| 5 | `resultados/20261105-juan-01/consola.log` | Salida completa de Cypress |
| 6 | `resultados/20261105-juan-01/consola-errores.log` | Salida de errores (vacía) |
| 7 | `resultados/20261105-juan-01/validacion-filtro.json` | Dato introducido, filtro enviado, valores observados y recuentos de la fuente |
| 8 | `resultados/20261105-juan-01/ejecucion-info.txt` | Caso, cuenta, inicio y fin, código de salida, versión y comando (sin credenciales) |

`scripts/revisar-secretos.ps1` devolvió `[OK]`. Las capturas no muestran credenciales.

## 9. Estado de la prueba

**Aprobado**

## 10. Justificación del resultado

- **Metabase acepta el valor numérico válido.** Al escribir 100 en el selector numérico de Subtotal, el campo lo conserva sin marcarlo como inválido, no aparece ningún mensaje de validación y el botón *Añadir filtro* se habilita (prueba 3, captura 01). El filtro conserva la columna, el operador y el valor (*Subtotal es mayor que 100*, capturas 02 y 03).
- **La entrada se procesa como número.** La consulta que envía la interfaz contiene exactamente `Subtotal > 100`, con el valor de tipo numérico, y se completa sin errores (prueba 4).
- **"Se presentan los registros que cumplen con el criterio especificado".** Todos los registros devueltos (2.000) y todos los valores visibles (18) tienen un Subtotal numérico mayor que 100 (pruebas 5 y 6).
- **"Conservando la correspondencia entre el valor utilizado y los resultados obtenidos".** El número de registros devueltos corresponde al recuento de la fuente para `Subtotal > 100`, dentro del límite documentado de 2.000 filas, y los registros con Subtotal ≤ 100 quedaron excluidos (prueba 7).

## 11. Hallazgos

**Ningún defecto de Metabase.**

1. **Límite de filas de la interfaz.** La consulta tiene 5.244 registros que cumplen el filtro, pero la interfaz muestra los primeros 2.000. Es el comportamiento predeterminado de Metabase para consultas sin agregación, y la interfaz lo indica explícitamente. No es una falla.
2. **Error del script en el primer intento, ya corregido.** El selector CSS `[class*="error" i]`, que buscaba mensajes de error, usaba un modificador que jQuery no admite. Se reemplazó por `[class*="-error"], [class*="Error"]`. No se atribuyó a Metabase, y la carpeta de ese intento se eliminó.
3. **Valores de referencia.** Los recuentos 5.244 y 13.516 coinciden con los observados en TC-FUN-002 y pueden registrarse como R02 cuando se corrija `valores-referencia.csv`.

## 12. Conclusión

En Metabase OSS v0.64.1, el editor gráfico acepta el valor numérico válido 100 en un filtro *Subtotal Mayor que* sobre Orders, lo envía a la consulta como número y presenta solo registros con Subtotal mayor que 100, en correspondencia con los datos de origen y dentro del límite de filas de la interfaz. El caso TC-VAL-001 cumple el resultado esperado del plan.

## 13. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Microsoft Windows 11 Home Single Language 10.0.26300 |
| Navegador y versión | Electron 146, sin interfaz gráfica (incluido en Cypress 16.2.1) |
| Versión de Docker | 29.6.2 |
| Herramienta | Cypress 16.2.1; Node.js v22.15.1 |
| Comando ejecutado | Ver §5 |
| Configuración relevante | `cypress.config.js` compartido, sin cambios. `testIsolation: false` y detención en la primera falla. `POST /api/dataset` observado sin simulación. Límite de filas de la interfaz: 2.000. Consulta no guardada |
| Identificadores locales usados | Sample Database 1 (de `configuracion/recursos-locales.json`); ORDERS y SUBTOTAL resueltos por nombre |
