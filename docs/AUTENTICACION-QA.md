# Autenticación y cuentas QA

Cada integrante guarda las credenciales de **sus** cuentas de Metabase en el archivo **`.env`** de la raíz del repositorio. Es el mismo archivo que usa Docker Compose, está excluido de Git y no se comparte. Todos los scripts leen las cuentas desde allí con la biblioteca común [scripts/sesion-metabase.ps1](../scripts/sesion-metabase.ps1).

---

## 1. Cuentas y casos

| Alias en los scripts | Variables en `.env` | Cuenta en Metabase | Casos |
|---|---|---|---|
| `admin` (predeterminado) | `QA_ADMIN_EMAIL`, `QA_ADMIN_PASSWORD` | Administrador de su instalación | `obtener-ids-recursos.ps1` y los casos por API con sesión: TC-FUN-009, TC-FUN-010, TC-ERR-001 a 004, TC-CON-001 a 004 y TC-REN-001 a 005 |
| `usuario-qa` | `QA_USER_EMAIL`, `QA_USER_PASSWORD` | **Usuario QA** (solo *Todos los usuarios*) | TC-FUN-001, TC-VAL-003 (solo el correo) y verificaciones de seguridad funcional |
| *(ninguna)* | — | — | TC-ERR-005, con `-SinSesion` (sin autenticación, por definición) |

Las cuentas **ya existen** y se reutilizan. Los scripts no cambian contraseñas, usuarios ni permisos. Al iniciar sesión, Metabase solo actualiza la fecha de último acceso de la cuenta.

---

## 2. Configurar el `.env` (una vez por equipo)

1. Si todavía no existe, créelo a partir de la plantilla, como indica [INSTALACION-SAMUEL.md](INSTALACION-SAMUEL.md) (pasos 8 y 9): `Copy-Item .env.example .env`.
2. Ábralo con `notepad .env` y complete las cuatro variables con **sus** datos:

```text
QA_ADMIN_EMAIL=<correo del administrador de SU instalación>
QA_ADMIN_PASSWORD=<contraseña del administrador>
QA_USER_EMAIL=<correo de Usuario QA en SU instalación>
QA_USER_PASSWORD=<contraseña de Usuario QA>
```

   - Escriba una variable por línea, sin espacios alrededor del `=`. **No modifique** `MB_SESSION_SECRET_KEY`.
   - Si una contraseña contiene **espacios**, el carácter **`$`** o la secuencia **` #`** (espacio y almohadilla), escríbala entre **comillas simples**: `QA_USER_PASSWORD='clave con espacio#1'`. Un `#` sin espacio delante no necesita comillas. Los scripts leen el archivo con las mismas reglas que Docker Compose.
3. Guarde el archivo y compruebe las dos cuentas:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\probar-cuentas.ps1
```

Resultado esperado:

```text
[OK]    admin      <Nombre> <Apellido> | administrador: True
        sesion de prueba cerrada (token invalido).
[OK]    usuario-qa Usuario QA | administrador: False
        sesion de prueba cerrada (token invalido).
```

| Mensaje | Causa |
|---|---|
| `[FALLO] ... Complete en .env: QA_...` | Falta la variable o está vacía |
| `[FALLO] ... HTTP 401` | Correo o contraseña incorrectos. No repita muchas veces seguidas: Metabase bloquea temporalmente tras varios intentos fallidos |
| `[AVISO] ... se esperaba ...` | Las variables de `admin` y `usuario-qa` están intercambiadas o corresponden a otra cuenta |

**Precauciones con el `.env`:**

- Nunca lo suba a Git, lo copie al repositorio con otro nombre, lo pegue en el chat ni lo envíe al compañero.
- La carpeta del proyecto de Juan está en **OneDrive**, así que `.env` se sincroniza con su nube personal de Microsoft. Si eso no es aceptable, mueva el repositorio fuera de OneDrive antes de usar Git.
- Use cuentas **exclusivas de pruebas**, con contraseñas que no use en ningún otro sitio.

---

## 3. Cómo funciona una ejecución

```text
.env (QA_*) ──► POST /api/session ──► token (UUID)
                                         │
   %TEMP%\mbqa-<aleatorio>.json / .properties ◄── variables locales + token
        │   (Newman: -e archivo · JMeter: -q archivo; la línea de comandos solo lleva la ruta)
        ▼
   Newman / JMeter ──► pruebas\<cat>\<ID>\resultados\<AAAAMMDD>-<integrante>-<NN>\
        │
   al terminar, también si hay error:
     1. borra el archivo temporal
     2. DELETE /api/session y comprueba que el token ya devuelve 401
     3. reemplaza el token por <SESION-REDACTADA> en los archivos generados
```

- La **contraseña** solo se usa en memoria para `POST /api/session`. Nunca llega a Newman, a JMeter, a la línea de comandos ni a los reportes.
- El **token** nunca aparece en la línea de comandos ni en `ejecucion-info.txt`. Newman lo escribe en su JSON, y el script lo redacta al terminar.

**Compatibilidad con Metabase v0.64.1** (verificada en el código fuente de la etiqueta `v0.64.1`):

- `POST /api/session` recibe `{"username","password"}` y responde `{"id": "<UUID>"}`.
- La cabecera `X-Metabase-Session` tiene prioridad sobre las cookies.
- `DELETE /api/session` invalida el token.
- La verificación en dos pasos (MFA) existe solo en la edición comercial; si una cuenta la exigiera, el script se detiene con un aviso.
- Una sesión no cerrada duraría hasta **2 semanas** (`MAX_SESSION_AGE`). Por eso el script siempre cierra la suya.

---

## 4. Ejecutar y revisar

```powershell
# Newman / JMeter (ver HERRAMIENTAS-NEWMAN-JMETER.md)
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-CON-002 -Herramienta newman -Integrante samuel
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-FUN-009 -Herramienta newman -Integrante juan -Cuenta admin
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-ERR-005 -Herramienta newman -Integrante samuel -SinSesion

# Antes de cada commit: tokens no redactados y contraseñas de .env en cualquier archivo
powershell -ExecutionPolicy Bypass -File .\scripts\revisar-secretos.ps1
```

`revisar-secretos.ps1` revisa todo el repositorio excepto `.env`. Busca los tokens de sesión en el formato de Newman y de JMeter y las **contraseñas exactas** de `QA_ADMIN_PASSWORD` y `QA_USER_PASSWORD`, sin mostrarlas. Debe terminar con `[OK]`.

### Uso por Claude Code

- Claude ejecuta estos scripts sin necesitar ver las contraseñas: los scripts las leen de `.env` en memoria y no las imprimen.
- Claude no abrirá ni mostrará el contenido de `.env`, y ejecutará `revisar-secretos.ps1` antes de proponer un commit.
- Cualquier programa que corra con su usuario de Windows puede leer `.env`, igual que cualquier archivo local. Por eso deben ser cuentas solo de pruebas. Como barrera adicional opcional, puede agregar en `.claude/settings.local.json` la regla `"permissions": {"deny": ["Read(.env)"]}`. Los scripts siguen funcionando.

---

## 5. Cypress

Cypress usa **las mismas variables de `.env`**, sin otro mecanismo. Está implementado desde TC-FUN-001 (2026-11-05):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-FUN-001 -Herramienta cypress -Integrante juan -Cuenta usuario-qa
```

- **Dependencia:** Cypress 16.2.1 en `recursos-compartidos/cypress/`. En un equipo nuevo, instálela con `npm ci --prefix recursos-compartidos\cypress`.
- **Configuración compartida:** `recursos-compartidos/cypress/cypress.config.js`. Resultados: `cypress-junit.xml` y `consola.log` en `resultados/<id-ejecucion>/`, y capturas en `evidencias/<id-ejecucion>/`.
- **Especificaciones:** Cypress 16 ya no ofrece `Cypress.env()`. Las especificaciones leen las credenciales con `cy.env(['QA_EMAIL', 'QA_PASSWORD'], { log: false })`.
- **Variable `ELECTRON_RUN_AS_NODE`:** si se ejecuta desde VS Code, el entorno la define y Cypress no arranca. El script la quita solo para el proceso de Cypress.

Funcionamiento:

1. `ejecutar-herramienta.ps1 -Herramienta cypress` reutiliza `Get-CredencialQA` y `Protect-CarpetaResultados`. En cada ejecución:
   - definirá `CYPRESS_QA_EMAIL` y `CYPRESS_QA_PASSWORD` **solo para el proceso de Cypress**, nunca en la línea de comandos ni de forma permanente;
   - al terminar, borrará esas variables y redactará la contraseña y los tokens en los resultados.
2. Reglas para las especificaciones (`<ID>.cy.js`):
   - **Escribir** la contraseña con `cy.get('input[name="password"]').type(Cypress.env('QA_PASSWORD'), { log: false })`. Sin `{ log: false }`, el texto aparece en el *Command Log*, y por tanto en capturas y videos.
   - **No usar** `cy.log`, `console.log` ni aserciones que impriman la contraseña.
   - **Casos que no evalúan el inicio de sesión:** iniciar sesión por API con `cy.session(...)` y `cy.request({ method: 'POST', url: '/api/session', body: {...}, log: false })`. Cerrar la sesión al final.
   - **TC-FUN-001:** el inicio de sesión **por la interfaz** con `usuario-qa` es el objeto del caso.
   - **TC-VAL-003:** usa solo `QA_USER_EMAIL` y la contraseña vacía.
   - **No crear `cypress.env.json` con valores**: está en `.gitignore` por precaución.
3. Después de cada ejecución: `revisar-secretos.ps1`.

---

## 6. Si algo falla

| Situación | Qué hacer |
|---|---|
| `Complete en .env: ...` | Agregue la variable indicada (§2) |
| `Inicio de sesion rechazado (HTTP 401)` | Revise el correo y la contraseña en `.env` con `probar-cuentas.ps1`. Evite intentos repetidos, por el bloqueo temporal |
| `AVISO: no se pudo cerrar la sesion` | Los resultados ya están redactados, pero el token podría seguir válido. Ver la fila siguiente si la duda persiste |
| Ejecución interrumpida (ventana cerrada, proceso terminado) | 1. Ejecute `revisar-secretos.ps1`; si señala esa carpeta de ejecución, **no la suba** y elimínela, porque no tiene resultados válidos. 2. Borre los temporales: `Remove-Item "$env:TEMP\mbqa-*"`. 3. Solo como medida de emergencia y con acuerdo previo, para invalidar una sesión que quedó abierta: **equipo de Samuel**, cambiar `MB_SESSION_SECRET_KEY` y ejecutar `docker compose up -d`, lo que cierra todas las sesiones; **cualquier equipo**, cambiar la contraseña de la cuenta afectada (en v0.64.1 eso invalida sus sesiones) y actualizar `.env` |
| `SEGURIDAD: .env no esta excluido de Git` | Revise `.gitignore` antes de continuar. Esta comprobación solo se hace cuando existe `.git` |

---

## 7. En el equipo de Samuel

- Samuel completa las mismas cuatro variables en **su** `.env`, con **sus** cuentas (`qa.admin.samuel@example.com`, Usuario QA `qa.usuario.samuel@example.com`) y sus contraseñas.
- Sus IDs salen de su `configuracion\recursos-locales.json` (`obtener-ids-recursos.ps1 -Guardar -Integrante "Samuel"`).
- Los scripts y comandos son idénticos en ambos equipos.

---

## 8. Verificaciones en la primera ejecución real

Estas comprobaciones requieren una sesión auténtica:

1. `probar-cuentas.ps1` muestra `[OK]` en las dos cuentas, con `administrador: True` y `administrador: False`.
2. `obtener-ids-recursos.ps1 -Guardar` funciona sin pedir datos.
3. Primer caso por API con sesión (por ejemplo, el piloto de TC-CON-002): la salida muestra `Sesion cerrada: el token ya no es valido.` y `archivos que aun lo contienen: 0`.
4. `ejecucion-info.txt` registra `cuenta=admin` (o `usuario-qa`) y no contiene el token.
5. Su sesión del navegador sigue activa: el script cierra solo la suya.
6. `revisar-secretos.ps1` termina con `[OK]`.
7. JMeter (equipo de Samuel): recibe `${__P(sessionId)}` desde el archivo `-q`. Un 401 en la aserción indicaría que no se leyó.
