# Reporte de prueba: TC-VAL-005

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-VAL-005 |
| Escenario | Caracteres especiales en campo de texto |
| Categoría | Pruebas de validación de entradas |
| Ejecutado por | Juan (ejecución automatizada con Claude Code mediante `scripts/ejecutar-herramienta.ps1`) |
| Instalación | Equipo de Juan (`JUANHER01`), rama `qa/juan-funcionales-validacion` |
| Identificador de ejecución oficial | `20261105-juan-01` |
| Fecha y hora de ejecución | 2026-11-05 20:42:06 – 20:42:48 (hora local) |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Cypress 16.2.1, navegador Electron 146 (sin interfaz gráfica) |
| Cuenta utilizada | `usuario-qa`: **Usuario QA**, cuenta normal |

**Ejecución oficial:**

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| `20261105-juan-01` | 2026-11-05 20:42 | Juan | **Aprobado (7/7)** | `resultados/20261105-juan-01/` |

**Intento previo.** El primer intento completó correctamente el guardado y la recuperación, en las pruebas 1 a 6, y creó la pregunta **77**. Falló en la prueba 7, que es una comprobación adicional, por un error del script: leyó el título de la pestaña del navegador mientras Metabase todavía mostraba su texto de carga (*"Haciendo ciencia..."*).

Después de corregir el script, se hizo lo siguiente:

1. **La pregunta 77 se envió a la papelera de Metabase.** Lo prescribe `caso.md` (*"Si existe de una ejecución anterior, archivarla y anotarlo"*), y así se evita dejar un nombre duplicado en *QA - Metabase*. El archivado es reversible desde la papelera. Se hizo por API (`PUT /api/card/77` con `archived: true`), con la cuenta que la creó, y no afecta al resultado evaluado.
2. **Se repitió la ejecución completa.** Se eliminó la carpeta del intento y se reutilizó el identificador `-01`.

## 2. Objetivo de la prueba

Comprobar que un nombre con tildes, `&` y paréntesis se guarda, se presenta y se recupera sin alteraciones.

## 3. Precondiciones

| Precondición | Verificada | Cómo |
|---|---|---|
| Metabase v0.64.1 disponible | Sí | `GET /api/health` → `ok`; `version_metabase=v0.64.1` en `ejecucion-info.txt` |
| No existe una pregunta con el nombre exacto en la colección de destino | Sí | `GET /api/collection/6/items` (solo lectura): ningún elemento con el nombre exacto. La pregunta 77 del intento previo ya estaba en la papelera |
| Colección de destino con escritura | Sí | *QA - Metabase* (ID 6, de `configuracion/recursos-locales.json`), `can_write = true` para Usuario QA |
| Cuenta autorizada | Sí | Usuario QA, no administradora |

## 4. Nombre exacto utilizado y datos

| Elemento | Valor |
|---|---|
| **Nombre** | **`Análisis de ventas & costos (2026)`** |
| Longitud | 34 caracteres |
| Caracteres especiales | `á` (U+00E1), espacios (U+0020), `&` (U+0026), `(` (U+0028), `)` (U+0029) y dígitos `2026` |
| Base de datos / tabla | Sample Database / Products |
| Visualización | Tabla |
| Colección de destino | QA - Metabase (ID 6) |

## 5. Procedimiento ejecutado

Comando ejecutado desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-VAL-005 -Herramienta cypress -Integrante juan -Cuenta usuario-qa
```

Comando de Cypress construido por el script (registrado en `ejecucion-info.txt`, sin credenciales):

```text
cypress.cmd run --project <repo> --config-file <repo>\recursos-compartidos\cypress\cypress.config.js
  --spec <repo>\pruebas\validacion\TC-VAL-005\scripts\TC-VAL-005.cy.js --browser electron
  --reporter junit --reporter-options mochaFile=<repo>\pruebas\validacion\TC-VAL-005\resultados\20261105-juan-01\cypress-junit.xml
```

Pasos automatizados en [scripts/TC-VAL-005.cy.js](scripts/TC-VAL-005.cy.js). La creación, la escritura del nombre, el guardado y la recuperación se hicieron en la interfaz; la API solo se usó para lecturas.

1. **Precondiciones.** Inicio de sesión por API con `usuario-qa`; la contraseña sale del `.env` y no se registra. Se comprueban la disponibilidad, la colección, la ausencia del nombre y el estado de las preguntas de referencia.
2. **Consulta.** **Nuevo → Pregunta → Sample Database → Products → Visualizar**: consulta completada con 200 registros, en tabla.
3. **Formulario Guardar.** Se borra el nombre propuesto y se escribe `Análisis de ventas & costos (2026)` con `cy.type`. Se comprueban el valor exacto del campo y la ausencia de errores. Se elige *QA - Metabase* con **Seleccionar esta colección**. Captura 01.
4. **Guardado.** **Guardar** (`POST /api/card`, observado sin modificarlo): se comprueban el nombre enviado y el devuelto, el nuevo ID, la colección y la visualización. Después se comprueban la URL `/question/78-…` y el título de la pregunta. Captura 02.
5. **Salida y localización.** Barra lateral → **Inicio** → **QA - Metabase**. La fila se localiza por **igualdad exacta** de su texto, no con `contains()`. Captura 03.
6. **Recuperación.** Se abre desde la fila de la colección (`POST /api/card/78/query`, observado):
   - título igual al nombre exacto;
   - título de la pestaña del navegador;
   - fuente *Products*, tabla y sin filtros;
   - 200 registros.

   Captura 04. Se vuelve a ejecutar con el botón **Actualizar**. Captura 05.
7. **Lectura por API.** `GET /api/card/78` (nombre, colección, visualización y consulta) y comprobación de que las preguntas de referencia están intactas.
8. **Limpieza** (fuera de la evaluación). `DELETE /api/session` y comprobación de que la sesión devuelve 401. La pregunta 78 **se conserva** como evidencia.

**Comparación del nombre.** En cada punto de control, la misma función comprueba:

- la igualdad exacta (`===`) con el nombre esperado;
- la longitud, 34, para descartar truncamientos;
- la lista de códigos Unicode carácter a carácter;
- la forma NFC;
- la presencia de `Análisis`, ` & ` y `(2026)`;
- la **ausencia** de `&amp;`, `&#38;`, `&#x26;`, `%26`, `&aacute;` y `Ã`, para descartar entidades HTML, codificación URL y caracteres mal decodificados.

## 6. Resultado esperado

El sistema almacena y presenta correctamente el nombre, conservando los caracteres especiales y permitiendo recuperar la pregunta sin alteraciones inesperadas.

**Código HTTP esperado (plan):** N/A.

## 7. Resultado obtenido

### Nombres introducido, guardado y recuperado

Archivo `resultados/20261105-juan-01/comparacion-nombres.json`.

| Punto de control | Nombre observado | Comparación exacta |
|---|---|---|
| **Introducido** (campo *Nombre* del formulario) | `Análisis de ventas & costos (2026)` | Idéntico |
| **Guardado** (respuesta de `POST /api/card`; también el nombre enviado) | `Análisis de ventas & costos (2026)` | Idéntico |
| Título de la pregunta tras guardar | `Análisis de ventas & costos (2026)` | Idéntico |
| Fila en la colección *QA - Metabase* | `Análisis de ventas & costos (2026)` | Idéntico |
| **Recuperado** (título al reabrir desde la colección) | `Análisis de ventas & costos (2026)` | Idéntico |
| Título de la pestaña del navegador | `Análisis de ventas & costos (2026) · Metabase` | La parte del nombre es idéntica |
| `GET /api/card/78` (solo lectura) | `Análisis de ventas & costos (2026)` | Idéntico |

En **todos** los puntos se cumplen:

- longitud 34;
- los mismos 34 códigos Unicode (`U+0041 U+006E U+00E1 …`, ver el JSON);
- forma NFC;
- **ninguna** entidad HTML (`&amp;`), codificación URL (`%26`) ni carácter mal decodificado.

| Dato | Valor |
|---|---|
| **Identificador del recurso** | Pregunta **78** (`/question/78-analisis-de-ventas-costos-2026`, `entity_id h0VlPZvHULUbdEU880cYN`), en *QA - Metabase* (ID 6) |
| Consulta conservada | `GET /api/card/78`: tabla PRODUCTS, sin filtros, `display = table`, activa |
| Ejecución tras recuperarla | 202 con `status = completed`, sin error, 200 registros (= fuente); se repitió con *Actualizar*, de nuevo `completed` |
| Enlace generado | El *slug* de la URL (`analisis-de-ventas-costos-2026`) normaliza el nombre. Es solo el identificador legible de la URL; el nombre almacenado y mostrado no cambia |

### Aserciones y resultados

| # | Prueba (JUnit) | Aserciones principales | Resultado |
|---|---|---|---|
| 1 | Disponibilidad, sesión, destino y nombre libre | `/api/health` = `ok`; Usuario QA; *QA - Metabase* con escritura; el nombre exacto no existe en la colección | Aprobada |
| 2 | Consulta válida | Products, `completed`, 200 registros, tabla visible | Aprobada |
| 3 | Formulario: nombre aceptado y exacto | El campo vale exactamente el nombre (comprobación completa); sin `aria-invalid` ni errores; destino *QA - Metabase* | Aprobada |
| 4 | Guardado | `POST /api/card` 200; nombre enviado y devuelto exactos; ID nuevo (78); colección 6; `table`; URL `/question/78-…`; título exacto | Aprobada |
| 5 | Localización en la colección | Fila con el texto **exactamente igual** al nombre; enlace a `/question/78-…`; comprobación completa | Aprobada |
| 6 | Recuperación y ejecución | Consulta `completed`, sin error, con 200 registros; título exacto; pestaña con el nombre; fuente Products; sin filtros; re-ejecución `completed` | Aprobada |
| 7 | Lectura por API y referencias | Nombre exacto por API; colección, visualización y consulta conservadas; título de la pestaña = nombre; las 5 preguntas de referencia con el mismo `updated_at` | Aprobada |

**Totales del reporte nativo** (`cypress-junit.xml`): 7 pruebas, 7 aprobadas, 0 fallidas. Duración: 24,8 s. Código de salida de Cypress: 0. Salida de errores vacía.

## 8. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `evidencias/20261105-juan-01/01-formulario-guardar-nombre-completo.png` | Diálogo *Guardar nueva pregunta* con el nombre completo `Análisis de ventas & costos (2026)` y destino *QA - Metabase* |
| 2 | `evidencias/20261105-juan-01/02-pregunta-guardada.png` | Pregunta guardada: título con el nombre exacto |
| 3 | `evidencias/20261105-juan-01/03-pregunta-en-coleccion.png` | *QA - Metabase* con la pregunta en la primera fila, con su nombre completo |
| 4 | `evidencias/20261105-juan-01/04-pregunta-recuperada-nombre-original.png` | Pregunta reabierta: título `Análisis de ventas & costos (2026)`, *Sample Database / Products*, *"Mostrando 200 filas"* |
| 5 | `evidencias/20261105-juan-01/05-consulta-ejecutada-tras-recuperar.png` | Consulta vuelta a ejecutar tras recuperarla |
| 6 | `resultados/20261105-juan-01/cypress-junit.xml` | Reporte nativo JUnit de Cypress (7/7) |
| 7 | `resultados/20261105-juan-01/consola.log` | Salida completa de Cypress |
| 8 | `resultados/20261105-juan-01/consola-errores.log` | Salida de errores (vacía) |
| 9 | `resultados/20261105-juan-01/comparacion-nombres.json` | Nombre esperado, códigos Unicode, nombres observados en los 7 puntos, identificador y ejecución |
| 10 | `resultados/20261105-juan-01/ejecucion-info.txt` | Caso, cuenta, inicio y fin, código de salida, versión y comando (sin credenciales) |

`scripts/revisar-secretos.ps1` devolvió `[OK]`. Las capturas no muestran credenciales.

## 9. Estado de la prueba

**Aprobado**

## 10. Justificación técnica

- **"El sistema almacena… correctamente el nombre": cumplido.** El campo *Nombre* aceptó el texto sin marcarlo como inválido. Lo que se envió al guardar y lo que Metabase devolvió (`POST /api/card` 200) son exactamente `Análisis de ventas & costos (2026)`, y la lectura posterior por API confirma que ese es el nombre almacenado (pruebas 3, 4 y 7).
- **"…presenta correctamente el nombre": cumplido.** La interfaz lo muestra idéntico en el título, en la lista de la colección y en la pestaña del navegador, sin entidades HTML como `&amp;` ni sustituciones (pruebas 4 a 7).
- **"Conservando los caracteres especiales": cumplido.** La tilde (U+00E1), el `&`, los paréntesis, los espacios y `2026` se conservan en todos los puntos. La longitud y los códigos Unicode son idénticos al original, así que no hubo truncamiento ni reemplazo (comprobación completa en cada prueba).
- **"Permitiendo recuperar la pregunta sin alteraciones inesperadas": cumplido.** La pregunta se localizó por su nombre exacto en la colección y se reabrió desde allí. Conserva su consulta (Products, sin filtros) y su visualización (tabla), y se ejecuta correctamente con 200 registros, también al repetir la ejecución (pruebas 5 a 7).

La aprobación no se basa en coincidencias parciales: todas las comparaciones del nombre son de **igualdad exacta**.

## 11. Hallazgos

**Ningún defecto de Metabase.**

1. **Pregunta 77 (intento previo), enviada a la papelera.** La creó el primer intento de este mismo caso, con el nombre exacto y en *QA - Metabase*. Se archivó siguiendo `caso.md`, para no duplicar el nombre, y es recuperable desde la papelera. Su guardado y recuperación también habían sido correctos; el intento falló solo por la lectura prematura del título de la pestaña.
2. **Error de automatización corregido.** La comprobación complementaria del título de la pestaña leía `document.title` mientras se mostraba *"Haciendo ciencia..."*. Ahora espera con reintentos a que el título se actualice y compara la parte del nombre por igualdad exacta.
3. **El *slug* de la URL normaliza el nombre.** La URL usa `analisis-de-ventas-costos-2026`, sin tilde, `&` ni paréntesis. Es el comportamiento normal de Metabase para enlaces legibles; el recurso se identifica por el número 78 y el nombre no se altera.
4. **La pregunta 78 se conserva** como evidencia de la ejecución formal, junto a las de otros casos en *QA - Metabase*.

## 12. Conclusión

En Metabase OSS v0.64.1, la cuenta normal Usuario QA puede guardar desde la interfaz una pregunta llamada `Análisis de ventas & costos (2026)`, localizarla por ese nombre en la colección y recuperarla. Metabase almacena y presenta el nombre carácter a carácter igual al introducido, con la tilde, el `&` y los paréntesis, sin entidades HTML ni truncamientos. La pregunta conserva su consulta y su visualización y se ejecuta correctamente. El caso TC-VAL-005 cumple el resultado esperado del plan.

## 13. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Microsoft Windows 11 Home Single Language 10.0.26300 |
| Navegador y versión | Electron 146, sin interfaz gráfica (incluido en Cypress 16.2.1) |
| Versión de Docker | 29.6.2 |
| Herramienta | Cypress 16.2.1; Node.js v22.15.1 |
| Comando ejecutado | Ver §5 |
| Configuración relevante | `cypress.config.js` compartido, sin cambios. `testIsolation: false` y detención en la primera falla. `POST /api/card` y `POST /api/card/:id/query` observados sin simulación. Nombre escrito con `cy.type` (`delay` 20 ms) |
| Identificadores locales usados | Colección 6, Sample Database 1 y preguntas de referencia (de `configuracion/recursos-locales.json`). Pregunta creada: 78. Pregunta del intento previo archivada: 77 |
