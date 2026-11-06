# Reporte de prueba: TC-VAL-003

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-VAL-003 |
| Escenario | Campo obligatorio incompleto en autenticación |
| Categoría | Pruebas de validación de entradas |
| Ejecutado por | Juan (ejecución automatizada con Claude Code mediante `scripts/ejecutar-herramienta.ps1`) |
| Instalación | Equipo de Juan (`JUANHER01`), rama `qa/juan-funcionales-validacion` |
| Identificador de ejecución oficial | `20261105-juan-01` |
| Fecha y hora de ejecución | 2026-11-05 20:12:32 – 20:13:18 (hora local) |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Cypress 16.2.1, navegador Electron 146 (sin interfaz gráfica) |
| Cuenta utilizada | `usuario-qa`: **Usuario QA**, cuenta normal registrada. **Solo se usó su correo**; la contraseña se dejó vacía |

**Ejecución oficial:**

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| `20261105-juan-01` | 2026-11-05 | Juan | **Aprobado (7/7)** | `resultados/20261105-juan-01/` |

Fue la única ejecución; no hubo intentos previos.

## 2. Objetivo de la prueba

Comprobar que no es posible autenticarse con la contraseña vacía y que el sistema informa la información faltante.

## 3. Precondiciones

| Precondición | Verificada | Cómo |
|---|---|---|
| Metabase v0.64.1 disponible | Sí | `GET /api/health` → `ok`; `version_metabase=v0.64.1` en `ejecucion-info.txt` |
| Correo electrónico registrado | Sí | Correo de Usuario QA (`QA_USER_EMAIL` del `.env` local, entregado a Cypress como variable del proceso). Es la cuenta autenticada con éxito en TC-FUN-001 |
| Contexto sin sesión | Sí | Antes de empezar se borraron las cookies, el `localStorage` y el `sessionStorage`. Se comprobó que no existía la cookie `metabase.SESSION` y que `GET /api/user/current` respondía **401** (prueba 1). No se usó `cy.session()` ni se reutilizaron sesiones anteriores |

## 4. Datos de entrada

| Campo | Valor |
|---|---|
| Correo electrónico | Correo registrado de Usuario QA, una dirección de prueba ficticia del dominio reservado `example.com` |
| Contraseña | **Vacía** (no se escribió nada) |
| Pantalla | `/auth/login` (formulario de inicio de sesión de Metabase) |

La contraseña real de la cuenta no se usa en ningún momento del script. Tampoco se usaron credenciales administrativas.

## 5. Procedimiento ejecutado

Comando ejecutado desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-VAL-003 -Herramienta cypress -Integrante juan -Cuenta usuario-qa
```

Comando de Cypress construido por el script (registrado en `ejecucion-info.txt`, sin credenciales):

```text
cypress.cmd run --project <repo> --config-file <repo>\recursos-compartidos\cypress\cypress.config.js
  --spec <repo>\pruebas\validacion\TC-VAL-003\scripts\TC-VAL-003.cy.js --browser electron
  --reporter junit --reporter-options mochaFile=<repo>\pruebas\validacion\TC-VAL-003\resultados\20261105-juan-01\cypress-junit.xml
```

Pasos automatizados en [scripts/TC-VAL-003.cy.js](scripts/TC-VAL-003.cy.js). Todo se hace con interacción normal: **no se habilitó el botón por la fuerza ni se alteró el DOM**.

1. **Contexto limpio.** Se borran cookies y almacenamiento, y se comprueba que no hay sesión.
2. **Formulario.** Se abre `/auth/login` y se identifican el campo de correo (`input[name="username"]`, `type=email`), el de contraseña (`input[name="password"]`, `type=password`, vacío) y el botón de envío. Desde aquí se **observan** las solicitudes `POST /api/session`, sin modificarlas.
3. **Datos.** Se escribe el correo de Usuario QA, se comprueba su valor y que la contraseña sigue vacía, y se pasa el foco por el campo de contraseña sin escribir. Captura 01.
4. **Intento de envío.** El botón *Iniciar sesión* estaba **deshabilitado**, así que se intentó enviar con **Enter** en el campo de contraseña. Captura 02.
5. **Comprobación del formulario.** Se comprueba que la autenticación no se completa y se registran las señales de obligatoriedad:
   - estado del botón;
   - validación nativa del navegador (`required`, `validity.valueMissing`);
   - `aria-invalid`;
   - mensajes visibles.
6. **Ausencia de sesión.** Se comprueban la ausencia de la cookie de sesión y `GET /api/user/current`.
7. **Recursos protegidos.** Se comprueban por la API (`GET` de una pregunta, un dashboard y una colección, cuyos IDs salen de la configuración local) y por la interfaz (se visitan las páginas de la colección y del dashboard). Captura 03.

## 6. Resultado esperado

El sistema no permite completar la autenticación e informa que la información requerida está incompleta, sin conceder acceso a los recursos protegidos.

**Código HTTP esperado (plan):** N/A.

## 7. Resultado obtenido

### Comportamiento real del formulario

Archivo `resultados/20261105-juan-01/comportamiento-formulario.json`.

| Momento | Correo | Contraseña | Botón *Iniciar sesión* | `aria-invalid` de la contraseña | Mensaje visible | Validación nativa (`required`) |
|---|---|---|---|---|---|---|
| Formulario recién abierto | vacío | vacía | **deshabilitado** | `false` | ninguno | no (`required = false`) |
| Correo introducido y foco en la contraseña | correo de Usuario QA | vacía | **deshabilitado** | `false` | ninguno | no |
| Tras pulsar **Enter** | correo de Usuario QA | vacía | **deshabilitado** | **`true`** | **"Obligatorio"**, bajo el campo de contraseña, que se resalta en rojo | no |

**Cómo gestiona Metabase la ausencia de contraseña:**

- **Mecanismo 1, validación preventiva.** El botón *Iniciar sesión* está deshabilitado mientras falta la contraseña, así que el formulario no puede enviarse con un clic.
- **Mecanismo 2, mensaje de Metabase.** Al intentar enviar con Enter, Metabase marca el campo de contraseña como inválido (`aria-invalid="true"`, borde rojo) y muestra el mensaje **"Obligatorio"**. Así informa de que falta información requerida.
- **Validación nativa del navegador: no se usa.** El campo no tiene el atributo `required` y el formulario no recurre a la validación nativa (`validity.valueMissing = false`). La validación la hace la propia aplicación.
- **El formulario no se envía.** No hubo **ninguna** solicitud `POST /api/session`, ni con contraseña ni sin ella.

### Evidencia de que no se concedió acceso

| Comprobación | Resultado |
|---|---|
| Ruta tras el intento | Sigue en `/auth/login`; no aparece la barra principal de la aplicación autenticada (`app-bar`) |
| Cookies del navegador | Solo `metabase.DEVICE`, un identificador de dispositivo; **no existe `metabase.SESSION`** |
| `GET /api/user/current` | **401** (sin sesión) |
| `GET /api/card/{id}` (pregunta de conteo) | **401** |
| `GET /api/dashboard/{id}` (dashboard principal) | **401** |
| `GET /api/collection/{id}` (QA - Metabase) | **401** |
| Página `/collection/{id}` | Redirige a `/auth/login` |
| Página `/dashboard/{id}` | Redirige a `/auth/login?redirect=%2Fdashboard%2F2` |
| Excepciones no controladas de la aplicación | Ninguna |

### Aserciones y resultados

| # | Prueba (JUnit) | Aserciones principales | Resultado |
|---|---|---|---|
| 1 | Contexto sin sesión | `/api/health` = `ok`; sin cookie `metabase.SESSION`; `/api/user/current` = 401 | Aprobada |
| 2 | Formulario visible | Ruta `/auth/login`; campo de correo `type=email`; campo de contraseña `type=password` y vacío; botón de envío visible | Aprobada |
| 3 | Correo introducido y contraseña vacía | El valor del campo de correo es el correo de Usuario QA; la contraseña vale `""` | Aprobada |
| 4 | Intento de envío | Botón deshabilitado → intento con Enter, una interacción normal | Aprobada |
| 5 | Autenticación no completada y señal de obligatoriedad | Sigue en `/auth/login`, sin `app-bar`; contraseña vacía; **0 solicitudes** `POST /api/session`. Señales: botón deshabilitado, `aria-invalid="true"` y mensaje *"Obligatorio"*. 0 excepciones | Aprobada |
| 6 | Sin sesión autenticada | Sin cookie `metabase.SESSION`; `/api/user/current` = 401 | Aprobada |
| 7 | Recursos protegidos inaccesibles | La pregunta, el dashboard y la colección responden 401 por la API; sus páginas redirigen a `/auth/login`, sin `app-bar` | Aprobada |

**Totales del reporte nativo** (`cypress-junit.xml`): 7 pruebas, 7 aprobadas, 0 fallidas. Duración: 28,5 s. Código de salida de Cypress: 0.

## 8. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `evidencias/20261105-juan-01/01-correo-introducido-contrasena-vacia.png` | Formulario con el correo de Usuario QA, la contraseña vacía y **Iniciar sesión** deshabilitado |
| 2 | `evidencias/20261105-juan-01/02-respuesta-de-validacion.png` | Tras el intento de envío: campo de contraseña resaltado en rojo, mensaje **"Obligatorio"** y botón deshabilitado |
| 3 | `evidencias/20261105-juan-01/03-acceso-protegido-denegado.png` | Al abrir una página protegida (dashboard), Metabase redirige al formulario de inicio de sesión |
| 4 | `resultados/20261105-juan-01/cypress-junit.xml` | Reporte nativo JUnit de Cypress (7/7) |
| 5 | `resultados/20261105-juan-01/consola.log` | Salida completa de Cypress |
| 6 | `resultados/20261105-juan-01/consola-errores.log` | Salida de errores (vacía) |
| 7 | `resultados/20261105-juan-01/comportamiento-formulario.json` | Registro técnico del formulario en cada momento, solicitudes de sesión, mecanismos de validación, cookies (solo nombres) y respuestas de los recursos protegidos |
| 8 | `resultados/20261105-juan-01/ejecucion-info.txt` | Caso, cuenta, inicio y fin, código de salida, versión y comando (sin credenciales) |

**Datos sensibles:**

- **Credenciales:** no hay contraseñas, tokens ni cookies de sesión en las evidencias. La contraseña nunca se escribió, y el script de ejecución redacta igualmente la que entrega a Cypress.
- **Correo en las capturas:** las capturas 01 y 02 muestran el correo de Usuario QA, porque el caso exige evidenciar el formulario con el correo introducido. Es una dirección de prueba ficticia del dominio reservado `example.com`, no un correo personal. `revisar-secretos.ps1` no inspecciona el texto de las imágenes; esta revisión se hizo visualmente.
- **Registro técnico:** el JSON no contiene el correo, solo indica si se introdujo (`true`/`false`).
- **Revisión de secretos:** `scripts/revisar-secretos.ps1` devolvió `[OK]`.

## 9. Estado de la prueba

**Aprobado**

## 10. Justificación técnica

- **"No permite completar la autenticación": cumplido.** El botón de envío está deshabilitado mientras falta la contraseña, y el envío con Enter tampoco prospera. El formulario no llega a enviar ninguna solicitud de inicio de sesión (0 solicitudes `POST /api/session`), y la aplicación sigue en `/auth/login` (pruebas 4 y 5).
- **"Informa que la información requerida está incompleta": cumplido.** Al intentar el envío, Metabase marca el campo de contraseña como inválido y muestra el mensaje *"Obligatorio"* (prueba 5, captura 02). La señal es verificable, porque se registró `aria-invalid="true"` y el texto del mensaje, además de la imagen.
- **"Sin conceder acceso a los recursos protegidos": cumplido.** No se crea la cookie de sesión. `GET /api/user/current` y los recursos protegidos (pregunta, dashboard y colección) responden 401, y las páginas protegidas redirigen al inicio de sesión (pruebas 6 y 7).

La aprobación no se basa en que el formulario siga visible. Se apoya en el registro del estado del formulario, en la ausencia de solicitudes de autenticación y en las comprobaciones de acceso por la API y por la interfaz.

## 11. Hallazgos

**Ningún defecto de Metabase.**

1. **La validación la hace la aplicación, no el navegador.** El campo no usa `required` y la validación no es nativa. El botón deshabilitado actúa desde el primer momento, y el mensaje *"Obligatorio"* aparece cuando se intenta enviar el formulario. Que el campo pierda el foco no basta para que aparezca.
2. **La cookie `metabase.DEVICE` existe sin sesión.** Es un identificador de dispositivo que Metabase emite a cualquier visitante y no concede acceso. No contiene credenciales.
3. **Sin limpieza posterior.** Como nunca se creó una sesión, no hubo que cerrar ninguna. No se tocaron sesiones externas al navegador de Cypress.

## 12. Conclusión

En Metabase OSS v0.64.1, con el correo registrado de Usuario QA y la contraseña vacía, el formulario de inicio de sesión no puede enviarse: el botón está deshabilitado, y al intentar enviar con Enter el campo se marca como inválido con el mensaje *"Obligatorio"*. No se crea ninguna sesión, y los recursos protegidos responden 401 o redirigen al inicio de sesión. El caso TC-VAL-003 cumple el resultado esperado del plan.

## 13. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Microsoft Windows 11 Home Single Language 10.0.26300 |
| Navegador y versión | Electron 146, sin interfaz gráfica (incluido en Cypress 16.2.1) |
| Versión de Docker | 29.6.2 |
| Herramienta | Cypress 16.2.1; Node.js v22.15.1 |
| Comando ejecutado | Ver §5 |
| Configuración relevante | `cypress.config.js` compartido, sin cambios. `testIsolation: false` y detención en la primera falla. Cookies y almacenamiento borrados al inicio; sin `cy.session()`. `POST /api/session` observado sin modificarlo (solo se registró si hubo envío) |
| Identificadores locales usados | Pregunta 41, dashboard 2 y colección 6 (de `configuracion/recursos-locales.json`), solo para comprobar que no son accesibles sin sesión |
