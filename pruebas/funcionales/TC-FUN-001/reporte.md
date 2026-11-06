# Reporte de prueba: TC-FUN-001

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-FUN-001 |
| Escenario | Inicio de sesión con credenciales válidas |
| Categoría | Pruebas funcionales |
| Ejecutado por | Juan (ejecución automatizada con Claude Code mediante `scripts/ejecutar-herramienta.ps1`) |
| Instalación | Equipo de Juan (`JUANHER01`) |
| Identificador de ejecución vigente | `20261105-juan-03` |
| Fecha y hora de ejecución | 2026-11-05 02:32:54 – 02:33:19 (hora local) |
| Versión de Metabase | v0.64.1 (`version.tag` de `/api/session/properties`) |
| Herramienta utilizada | Cypress 16.2.1, navegador Electron 146 (sin interfaz gráfica) |
| Cuenta utilizada | `usuario-qa`: **Usuario QA**, cuenta normal, solo en *Todos los usuarios* |

**Ejecución oficial:**

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| `20261105-juan-03` | 2026-11-05 02:32 | Juan | **Aprobado (6/6)** | `resultados/20261105-juan-03/` |

Las ejecuciones de ajuste de la automatización (`-01` y `-02`) se eliminaron a petición del responsable, para conservar una única ejecución oficial. Por eso el identificador conserva el sufijo `-03`: coincide con el registrado en los archivos nativos (`ejecucion-info.txt`, `consola.log`).

## 2. Objetivo de la prueba

Comprobar que un usuario registrado y activo puede autenticarse en la interfaz web con credenciales válidas y acceder a las funcionalidades de su cuenta.

## 3. Precondiciones

| Precondición | Verificada | Cómo |
|---|---|---|
| Metabase v0.64.1 disponible | Sí | Prueba 1 (`GET /api/health` → 200, `status: ok`); `version_metabase=v0.64.1` en `ejecucion-info.txt` |
| Usuario registrado y activo | Sí | `scripts/probar-cuentas.ps1` (2026-11-05): Usuario QA, no administrador. Prueba 5: `is_active = true` |
| Credenciales disponibles sin exponerlas | Sí | Variables `QA_USER_EMAIL` / `QA_USER_PASSWORD` del `.env` local, entregadas a Cypress solo como variables del proceso. La contraseña se escribe con `{ log: false }` |
| Criterios de inicio del plan | Parcial | El ambiente y los recursos están preparados; la ejecución piloto global (código 202 y caché) aún está pendiente y no afecta a este caso, que no usa esos endpoints |

## 4. Procedimiento ejecutado

Comando ejecutado desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-FUN-001 -Herramienta cypress -Integrante juan -Cuenta usuario-qa
```

Comando de Cypress construido por el script (registrado en `resultados/20261105-juan-03/ejecucion-info.txt`, sin credenciales):

```text
cypress.cmd run --project <repo> --config-file <repo>\recursos-compartidos\cypress\cypress.config.js
  --spec <repo>\pruebas\funcionales\TC-FUN-001\scripts\TC-FUN-001.cy.js --browser electron
  --reporter junit --reporter-options mochaFile=<repo>\pruebas\funcionales\TC-FUN-001\resultados\20261105-juan-03\cypress-junit.xml
```

Pasos automatizados en [scripts/TC-FUN-001.cy.js](scripts/TC-FUN-001.cy.js) (los selectores se verificaron en el código fuente de v0.64.1):

1. `GET /api/health` → 200 y `status = ok`.
2. Abrir `/auth/login` y comprobar que son visibles `input[name="username"]` (`type=email`), `input[name="password"]` (`type=password`) y el botón `type=submit`. Captura 01.
3. Escribir en el formulario el correo de Usuario QA y su contraseña (`{ log: false }`) y pulsar **Iniciar sesión**. Se intercepta el `POST /api/session` que genera la propia interfaz y se comprueba su respuesta: 200, con identificador de sesión (su valor no se registra).
4. Comprobar que la ruta sale de `/auth/login` y que aparece la barra principal autenticada (`[data-testid="app-bar"]`). Captura 02.
5. `GET /api/user/current` con la sesión creada por el navegador: correo igual al de la cuenta, nombre `Usuario`, apellido `QA`, `is_active = true`, `is_superuser = false`.
6. Comprobar que ya no existen los campos del formulario, que la ruta no está bajo `/auth/` y que la barra principal sigue visible. Captura 03.
7. Limpieza (`after`, fuera de la evaluación): `DELETE /api/session` y comprobación de que `GET /api/user/current` devuelve 401. Esta comprobación pasó.

La autenticación se realizó **exclusivamente por la interfaz**. La API solo se usó para la disponibilidad, para verificar la identidad de la sesión y para cerrarla.

## 5. Resultado esperado

El sistema autentica al usuario y permite acceder a las funcionalidades correspondientes a su cuenta.

**Código HTTP esperado (plan):** N/A.

## 6. Resultado obtenido

| # | Verificación | Resultado |
|---|---|---|
| 1 | Metabase disponible | Aprobada: HTTP 200, `ok` |
| 2 | Formulario con campos de correo y contraseña | Aprobada |
| 3 | El formulario autentica a Usuario QA | Aprobada: `POST /api/session` desde la interfaz → **200**, con identificador de sesión |
| 4 | Acceso a una página autenticada | Aprobada: ruta fuera de `/auth/login` y barra principal visible |
| 5 | La sesión corresponde a Usuario QA | Aprobada: correo coincidente; `Usuario` `QA`; activo; no administrador |
| 6 | Sin formulario de inicio de sesión ni error de autenticación | Aprobada |

**Totales del reporte nativo** (`cypress-junit.xml`): 6 pruebas, 6 aprobadas, 0 fallidas, sin elementos `<failure>`. Duración: 9 s. Código de salida de Cypress: 0.

Observado en las capturas:

- La página de inicio muestra el saludo **"¿Qué tal, Usuario?"**.
- La barra lateral contiene Inicio, *Nuestros análisis*, *Tu colección personal*, `QA - Metabase` y Datos, **sin opciones de administración**. Esto es coherente con una cuenta normal.
- La sección de elementos populares muestra los recursos `QA - ...` visibles para este usuario.

## 7. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `evidencias/20261105-juan-03/01-formulario-inicio-sesion.png` | Formulario "Inicia sesión en Metabase" con los campos vacíos, antes de escribir |
| 2 | `evidencias/20261105-juan-03/02-pagina-autenticada.png` | Primera vista autenticada: barra principal y "¿Qué tal, Usuario?", con la barra lateral aún cargando |
| 3 | `evidencias/20261105-juan-03/03-sesion-activa-sin-errores.png` | Página de inicio completamente cargada, sin formulario ni errores |
| 4 | `resultados/20261105-juan-03/cypress-junit.xml` | Reporte nativo JUnit de Cypress (6/6) |
| 5 | `resultados/20261105-juan-03/consola.log` | Salida completa de Cypress, con verificación del binario, resumen y rutas de las capturas |
| 6 | `resultados/20261105-juan-03/consola-errores.log` | Salida de errores (vacía) |
| 7 | `resultados/20261105-juan-03/ejecucion-info.txt` | Caso, cuenta, inicio y fin, código de salida, versión de Metabase y comando (sin credenciales) |

Las capturas no muestran contraseñas, tokens ni cookies. La contraseña nunca se escribe en el registro de comandos (`{ log: false }`), y en la captura 01 los campos están vacíos. `scripts/revisar-secretos.ps1` sobre la carpeta del caso y la configuración de Cypress devolvió `[OK]`, con las 2 contraseñas de `.env` comparadas.

## 8. Estado de la prueba

**Aprobado**

## 9. Justificación del resultado

El resultado esperado tiene dos partes, y ambas se comprobaron con aserciones funcionales, no solo con el código de salida de Cypress:

- **"El sistema autentica al usuario":** el formulario de la interfaz envió las credenciales de Usuario QA y Metabase respondió 200 con una sesión (verificación 3). Esa sesión del navegador pertenece a Usuario QA, activo y no administrador (verificación 5).
- **"Permite acceder a las funcionalidades correspondientes a su cuenta":** el usuario salió del formulario y accedió a la aplicación autenticada, con la barra principal, la página de inicio personalizada y la navegación de colecciones y datos (verificaciones 4 y 6, capturas 02 y 03). No aparecen opciones de administración, como corresponde a su cuenta.

Las 6 verificaciones pasaron en la ejecución oficial, con 0 fallos.

## 10. Hallazgos

**Ningún defecto de Metabase.**

Ajustes de automatización realizados antes de la ejecución oficial, sin efecto en el resultado:

1. **`ELECTRON_RUN_AS_NODE=1` heredada del entorno de VS Code** impedía arrancar Cypress. Corregido en `scripts/ejecutar-herramienta.ps1`: la variable se elimina solo para el proceso de Cypress.
2. **`--config screenshotsFolder` no prevalecía sobre el bloque `e2e`** de `cypress.config.js`. Corregido: la carpeta de evidencias se entrega con la variable `MBQA_EVIDENCIAS` y se aplica en `setupNodeEvents`.
3. **Aviso de Cypress 16:** el navegador Electron está marcado como obsoleto para pruebas. Por ahora no afecta, pero conviene usar Chrome en futuras versiones de Cypress.

## 11. Conclusión

En Metabase OSS v0.64.1, la cuenta normal Usuario QA inicia sesión correctamente desde la interfaz web con credenciales válidas y accede a la aplicación con las funcionalidades de una cuenta no administradora. El caso TC-FUN-001 cumple el resultado esperado del plan.

## 12. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Microsoft Windows 11 Home Single Language 10.0.26300 |
| Equipo | Intel Core i5-11400H, 7,6 GB de RAM |
| Navegador y versión | Electron 146, sin interfaz gráfica (incluido en Cypress 16.2.1) |
| Versión de Docker | 29.6.2; Docker Desktop con 12 CPU y 3,7 GB de RAM asignados |
| Herramienta | Cypress 16.2.1 (dependencia exacta en `recursos-compartidos/cypress/package.json`) y Node.js v22.15.1 |
| Comando ejecutado | Ver §4 |
| Configuración relevante | `cypress.config.js` compartido; `testIsolation: false` dentro del caso (los pasos comparten la sesión del navegador); video desactivado; capturas en la carpeta de evidencias de la ejecución |
| Identificadores locales usados | Ninguno: el caso solo usa la URL base `http://localhost:3000` |
