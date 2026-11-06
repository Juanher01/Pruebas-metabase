# Reporte de prueba: TC-VAL-002

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-VAL-002 |
| Escenario | Parámetro inválido en filtro numérico |
| Categoría | Pruebas de validación de entradas |
| Ejecutado por | Juan (ejecución automatizada con Claude Code mediante `scripts/ejecutar-herramienta.ps1`) |
| Instalación | Equipo de Juan (`JUANHER01`), rama `qa/juan-funcionales-validacion` |
| Identificador de ejecución oficial | `20261105-juan-01` |
| Fecha y hora de ejecución | 2026-11-05 20:08:22 – 20:08:56 (hora local) |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Cypress 16.2.1, navegador Electron 146 (sin interfaz gráfica) |
| Cuenta utilizada | `usuario-qa`: **Usuario QA**, cuenta normal |

**Ejecución oficial:**

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| `20261105-juan-01` | 2026-11-05 20:08 | Juan | **Aprobado (6/6), escenario B** | `resultados/20261105-juan-01/` |

Fue la única ejecución; no hubo intentos previos.

## 2. Objetivo de la prueba

Comprobar que el sistema rechaza o informa la incompatibilidad de un valor alfabético en un filtro numérico sin errores inesperados.

## 3. Precondiciones

| Precondición | Verificada | Cómo |
|---|---|---|
| Metabase v0.64.1 disponible | Sí | `GET /api/health` → `ok`; `version_metabase=v0.64.1` en `ejecucion-info.txt` |
| Filtro sobre una columna numérica | Sí | `ORDERS.SUBTOTAL`, de tipo `type/Float`, en los metadatos. La interfaz abre para ella el selector de filtro **numérico** (`number-filter-picker`) |
| Columna definida | Sí | La ficha la dejaba pendiente y proponía `Orders.Subtotal`; se usó la indicada en la solicitud de ejecución: Subtotal |
| Cuenta autorizada | Sí | Usuario QA, no administradora |

## 4. Dato inválido y configuración

| Elemento | Valor |
|---|---|
| Base de datos / tabla / columna | Sample Database / Orders / **Subtotal** (`type/Float`) |
| Selector de filtro | Numérico (`number-filter-picker`) |
| Operador | **Mayor que** |
| **Valor inválido** | **`abc`** (definido en el plan) |
| Control del valor | `INPUT` con etiqueta *Valor del filtro*; sin atributo `type` específico ni `inputmode`; `aria-invalid="false"` |

## 5. Procedimiento ejecutado

Comando ejecutado desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-VAL-002 -Herramienta cypress -Integrante juan -Cuenta usuario-qa
```

Comando de Cypress construido por el script (registrado en `ejecucion-info.txt`, sin credenciales):

```text
cypress.cmd run --project <repo> --config-file <repo>\recursos-compartidos\cypress\cypress.config.js
  --spec <repo>\pruebas\validacion\TC-VAL-002\scripts\TC-VAL-002.cy.js --browser electron
  --reporter junit --reporter-options mochaFile=<repo>\pruebas\validacion\TC-VAL-002\resultados\20261105-juan-01\cypress-junit.xml
```

Pasos automatizados en [scripts/TC-VAL-002.cy.js](scripts/TC-VAL-002.cy.js). Todo se hace con interacción real en el editor gráfico: **no se forzaron valores en el DOM** ni se manipuló el estado de la aplicación, y no se guardó ninguna pregunta.

1. **Sesión y columna.** Inicio de sesión por API con `usuario-qa`; la contraseña sale del `.env` y no se registra. Se comprueba que Subtotal es numérica.
2. **Observación.** Desde aquí se observan, sin modificarlas, todas las solicitudes `POST /api/dataset`, y se registra cualquier excepción no controlada de la aplicación.
3. **Filtro.** **Nuevo → Pregunta → Sample Database → Orders** → paso **Filtro** → **Subtotal** (se abre el selector numérico) → operador **Mayor que**. El campo está vacío y **Añadir filtro** está deshabilitado. Captura 01.
4. **Intento de introducir `abc`.** Se escribe con `cy.type`, **una tecla cada vez** (`a`, `b`, `c`). Después de cada tecla se registran:
   - el valor real del control;
   - `aria-invalid`;
   - los mensajes de validación;
   - si **Añadir filtro** está habilitado.

   Captura 02.
5. **Intento de confirmar.** Como el botón estaba deshabilitado, se intentó confirmar pulsando **Enter** en el campo, que es una interacción real. Se registraron el estado del selector y el del paso Filtro. Captura 03.
6. **Control.** En el mismo campo se escribió el número `100`, **sin confirmarlo**, para comprobar que la validación es selectiva. Luego se borró y se cerró el selector.
7. **Clasificación.** Se clasificó el comportamiento en los escenarios A, B o C y se evaluaron las aserciones finales.
8. **Limpieza** (fuera de la evaluación). `DELETE /api/session` y comprobación de que la sesión devuelve 401.

## 6. Resultado esperado

El sistema impide utilizar el valor como una entrada numérica válida o informa de su incompatibilidad, sin producir errores inesperados ni resultados incorrectos.

**Código HTTP esperado (plan):** N/A.

Criterio de clasificación de la solicitud de ejecución:

- **A, bloqueo de caracteres:** compatible con el resultado esperado.
- **B, validación explícita**, porque se admite el texto pero se señala o se impide confirmar: compatible con el resultado esperado.
- **C, error funcional:** requiere análisis.

## 7. Resultado obtenido

### Cómo gestionó Metabase el valor `abc`

Archivo `resultados/20261105-juan-01/comportamiento-entrada-invalida.json`.

| Momento | Valor real del control | `aria-invalid` | Mensajes de validación | **Añadir filtro** |
|---|---|---|---|---|
| Antes de escribir | `""` | `false` | ninguno | **deshabilitado** |
| Tras la tecla `a` | `a` | `false` | ninguno | **deshabilitado** |
| Tras la tecla `b` | `ab` | `false` | ninguno | **deshabilitado** |
| Tras la tecla `c` | `abc` | `false` | ninguno | **deshabilitado** |
| Tras pulsar **Enter** | `abc` | `false` | ninguno | **deshabilitado**; el selector sigue abierto y **no se añade ningún filtro** |
| Control: número `100` | `100` | `false` | ninguno | **habilitado** (no se confirmó) |

**Escenario observado: B (validación por bloqueo de la confirmación).**

- **El campo no bloquea los caracteres alfabéticos.** El texto `abc` se puede escribir y el control lo conserva.
- **Metabase impide confirmar el filtro.** *Añadir filtro* permanece deshabilitado mientras el valor no es un número, y Enter tampoco lo aplica. Con un número válido el botón se habilita, lo que muestra que la validación distingue entre ambos casos.
- **El valor no se aplica.** El paso Filtro sigue vacío (*"Añade filtros para acotar tu respuesta"*) y no contiene `abc`. **No se envió ninguna consulta** (0 solicitudes a `POST /api/dataset`), así que no pudo producirse ningún resultado incorrecto.
- **Sin errores inesperados.** No hubo excepciones no controladas en la aplicación, la salida de errores de Cypress está vacía y no aparecieron mensajes de error.
- **No informa con un mensaje.** Metabase no muestra ningún texto explicativo ni marca el campo como inválido (`aria-invalid` sigue en `false`). La incompatibilidad se comunica solo mediante el botón deshabilitado.

### Aserciones y resultados

| # | Prueba (JUnit) | Aserciones principales | Resultado |
|---|---|---|---|
| 1 | Disponibilidad, sesión y tipo de campo | `/api/health` = `ok`; Usuario QA, no administrador; SUBTOTAL `type/Float` (numérica) | Aprobada |
| 2 | Filtro numérico sobre Subtotal con *Mayor que* | Ruta `/question/notebook`; paso Datos = Orders; selector `number-filter-picker`; operador *Mayor que*; campo vacío | Aprobada |
| 3 | Intento de introducir `abc` | Interacción real tecla por tecla; se registra la reacción después de cada tecla (tabla anterior) | Aprobada |
| 4 | Intento de confirmar | Botón deshabilitado → confirmación con Enter; el selector sigue abierto y el paso Filtro queda sin filtros | Aprobada |
| 5 | Control con un número válido | El campo admite `100` y el botón se habilita (sin confirmar) | Aprobada |
| 6 | Clasificación y ausencia de efectos | El paso Filtro no contiene `abc`; 0 consultas con el valor inválido; 0 excepciones no controladas; escenario ∈ {A, B} → **B** | Aprobada |

**Totales del reporte nativo** (`cypress-junit.xml`): 6 pruebas, 6 aprobadas, 0 fallidas. Duración: 17,0 s. Código de salida de Cypress: 0. Salida de errores vacía.

## 8. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `evidencias/20261105-juan-01/01-filtro-numerico-subtotal-mayor-que.png` | Selector de filtro numérico de **Subtotal** con el operador **Mayor que** y el campo vacío |
| 2 | `evidencias/20261105-juan-01/02-intento-de-introducir-abc.png` | `abc` escrito en el campo y **Añadir filtro** deshabilitado (atenuado), sin mensaje |
| 3 | `evidencias/20261105-juan-01/03-reaccion-al-intento-de-confirmar.png` | Tras pulsar Enter, el selector sigue abierto, el botón sigue deshabilitado y el paso Filtro no tiene filtros |
| 4 | `resultados/20261105-juan-01/cypress-junit.xml` | Reporte nativo JUnit de Cypress (6/6) |
| 5 | `resultados/20261105-juan-01/consola.log` | Salida completa de Cypress |
| 6 | `resultados/20261105-juan-01/consola-errores.log` | Salida de errores (vacía) |
| 7 | `resultados/20261105-juan-01/comportamiento-entrada-invalida.json` | Registro técnico: valor del control y estado del botón tras cada tecla, intento de confirmar, control con un número válido, consultas observadas, excepciones y escenario |
| 8 | `resultados/20261105-juan-01/ejecucion-info.txt` | Caso, cuenta, inicio y fin, código de salida, versión y comando (sin credenciales) |

`scripts/revisar-secretos.ps1` devolvió `[OK]`. Las capturas no muestran credenciales.

## 9. Estado de la prueba

**Aprobado** (escenario B)

## 10. Justificación técnica

El resultado esperado tiene dos alternativas: *"impide utilizar el valor como una entrada numérica válida **o** informa de su incompatibilidad"*. Además exige que no haya *"errores inesperados ni resultados incorrectos"*.

- **Impide utilizar `abc` como entrada numérica válida: cumplido.** Aunque el texto puede escribirse, Metabase no permite confirmar el filtro: *Añadir filtro* está deshabilitado y Enter no lo aplica. El valor nunca llega a la consulta: el paso Filtro sigue vacío y no se envía ninguna solicitud con `abc` (pruebas 3, 4 y 6). El control con `100` demuestra que el bloqueo se debe a la naturaleza del valor y no a un campo inutilizable (prueba 5).
- **Sin errores inesperados ni resultados incorrectos: cumplido.** No hubo excepciones de la aplicación, ni mensajes de error, ni consultas ejecutadas con el valor inválido (prueba 6).

Basta con que se cumpla la primera alternativa, así que el criterio se satisface **aunque Metabase no muestre un mensaje explícito**. La aprobación no se basa en el código de salida de Cypress, sino en el registro del valor real del control, en el estado del botón después de cada tecla y en la ausencia de consultas y filtros con `abc`.

## 11. Hallazgos

**Ningún defecto de Metabase.**

1. **Observación de usabilidad y accesibilidad, no un defecto.** El campo admite caracteres alfabéticos y no informa de por qué no se puede confirmar el filtro: no hay mensaje y `aria-invalid` permanece en `false`. Un usuario solo percibe el botón deshabilitado. El plan acepta este comportamiento, porque admite que el sistema *impida* el uso del valor. Se registra como posible mejora: un mensaje de validación beneficiaría a los usuarios y a las tecnologías de asistencia.
2. **Ninguna consulta durante el intento.** Mientras se intentaba introducir el valor inválido no se envió ninguna consulta, así que no hay ninguna respuesta del servidor que evaluar. El resultado es coherente con una validación en el cliente.

## 12. Conclusión

En Metabase OSS v0.64.1, al intentar introducir `abc` como valor del filtro numérico *Subtotal Mayor que*, el campo admite escribir el texto, pero Metabase **impide confirmar el filtro**. El valor nunca se aplica ni se envía en una consulta, y no se producen errores ni resultados incorrectos. Este comportamiento, el escenario B, cumple el resultado esperado del plan. El caso TC-VAL-002 queda **Aprobado**, con una observación de usabilidad por la ausencia de un mensaje explicativo.

## 13. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Microsoft Windows 11 Home Single Language 10.0.26300 |
| Navegador y versión | Electron 146, sin interfaz gráfica (incluido en Cypress 16.2.1) |
| Versión de Docker | 29.6.2 |
| Herramienta | Cypress 16.2.1; Node.js v22.15.1 |
| Comando ejecutado | Ver §5 |
| Configuración relevante | `cypress.config.js` compartido, sin cambios. `testIsolation: false` y detención en la primera falla. Entrada escrita con `cy.type`, una tecla cada vez (`delay` 50 ms). `POST /api/dataset` observado sin modificarlo. Excepciones no controladas registradas. Consulta no guardada |
| Identificadores locales usados | Sample Database 1 (de `configuracion/recursos-locales.json`); ORDERS y SUBTOTAL resueltos por nombre |
