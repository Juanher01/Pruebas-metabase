# Guía de instalación del ambiente QA (computador de Samuel)

Esta guía parte de un computador **Windows en el que todavía no existe Metabase** y termina con Metabase v0.64.1 funcionando, configurado igual que la instalación de Juan y con todos los recursos de prueba preparados. No requiere conocimientos previos de Docker ni de Metabase, ni depende de la instalación de Juan.

**Para qué se usará esta instalación:** Samuel ejecuta en ella los casos de **manejo de errores (TC-ERR)**, **contrato (TC-CON)** y **rendimiento (TC-REN)**. Juan ejecuta los funcionales (TC-FUN) y de validación (TC-VAL) en la suya. Las mediciones de rendimiento se harán en este computador, así que conviene registrar sus características (CPU, RAM y recursos asignados a Docker).

Convenciones:

- Los comandos se escriben en **PowerShell**. Copie cada bloque completo y presione `Enter`.
- **Qué hace** explica el comando, **Resultado esperado** indica lo que debería ver y **Si falla** remite a la solución. Los problemas más detallados están en [SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md).
- Metabase se configura **en español**, igual que la instalación de Juan. Las etiquetas se indican primero en español, según la traducción oficial de v0.64.1, y entre paréntesis en inglés. Su ubicación en pantalla puede variar ligeramente; si encuentra una diferencia, anótela en `reportes-generales/evidencias-ambiente/`.

**Recorrido completo:** Partes A–C (Docker y Metabase, unos 30–45 min, más la descarga) → Parte D (asistente inicial) → [DATOS-Y-RECURSOS-PRUEBA.md](DATOS-Y-RECURSOS-PRUEBA.md) (usuarios, colecciones, 5 preguntas y dashboards, unos 60–90 min) → paso 25 (lista final).

> No suba a GitHub capturas en las que se vean contraseñas o la clave del archivo `.env`.

---

## Parte A. Preparar el computador

### Paso 1. Comprobar los requisitos previos

| Requisito | Mínimo recomendado |
|---|---|
| Sistema operativo | Windows 10 de 64 bits (22H2) o Windows 11 |
| Memoria RAM | 8 GB (Metabase usa entre 1 y 2 GB) |
| Espacio libre en disco | 10 GB (la imagen de Metabase ocupa unos 2 GB) |
| Virtualización | Activada en BIOS/UEFI |
| Permisos | Cuenta con permisos de administrador para instalar programas |
| Internet | Para descargar Docker Desktop, Git y la imagen de Metabase |

Comprobar la virtualización:

```powershell
Get-CimInstance Win32_Processor | Select-Object Name, VirtualizationFirmwareEnabled
```

- **Qué hace:** consulta si la virtualización está activada en el firmware.
- **Resultado esperado:** `VirtualizationFirmwareEnabled : True`. En algunos equipos con WSL ya instalado aparece `False` aunque funcione; en ese caso continúe y verifique en el paso 4.
- **Si falla:** active "Intel VT-x" o "AMD-V/SVM" en la BIOS/UEFI del equipo. Consulte el manual del fabricante.

### Paso 2. Instalar Docker Desktop

Opción 1, con `winget` (PowerShell **como administrador**):

```powershell
winget install -e --id Docker.DockerDesktop
```

Opción 2, manual: descargue el instalador desde <https://www.docker.com/products/docker-desktop/> y ejecútelo.

- **Qué hace:** instala Docker Desktop, que incluye el motor Docker y Docker Compose.
- Durante la instalación, deje marcada la opción **"Use WSL 2 instead of Hyper-V"** (recomendada).
- **Resultado esperado:** el instalador termina y puede pedir **reiniciar Windows**. Reinicie.
- **Si falla:** si pide instalar o actualizar WSL, abra PowerShell como administrador, ejecute `wsl --install` o `wsl --update`, reinicie y repita.

### Paso 3. Abrir Docker Desktop

1. Abra **Docker Desktop** desde el menú Inicio.
2. Acepte los términos de servicio (uso personal o educativo). Puede omitir el inicio de sesión con cuenta Docker ("Skip").
3. Espere a que la parte inferior izquierda indique **"Engine running"** (motor en ejecución), con indicador verde.

- **Si falla:** consulte "Docker Desktop no inicia" en [SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md).

### Paso 4. Verificar que el motor Docker funciona

Abra una **nueva** ventana de PowerShell (normal, no hace falta administrador):

```powershell
docker --version
docker compose version
docker info --format "{{.ServerVersion}}"
docker run --rm hello-world
```

- **Qué hace:** muestra las versiones del cliente y de Compose, consulta el motor y ejecuta un contenedor de prueba que se elimina solo (`--rm`).
- **Resultado esperado:** números de versión en las tres primeras líneas y el mensaje **"Hello from Docker!"** en la última.
- **Si falla:** `docker` no se reconoce → cierre y vuelva a abrir PowerShell o reinicie Windows. *"Cannot connect to the Docker daemon"* o *"error during connect"* → Docker Desktop no está en ejecución (paso 3).

### Paso 5. Instalar y verificar Git

```powershell
winget install -e --id Git.Git
```

(O descargue el instalador desde <https://git-scm.com/download/win> y acepte las opciones por defecto.)

Cierre y vuelva a abrir PowerShell, y luego:

```powershell
git --version
git config --global user.name "Samuel Alexander Perdomo Fajardo"
git config --global user.email "SU_CORREO_DE_GITHUB"
```

- **Qué hace:** verifica Git y registra su nombre y correo para los commits. Use el correo asociado a su cuenta de GitHub.
- **Resultado esperado:** `git version 2.x.x`. Los dos comandos `config` no muestran nada.
- **Si falla:** `git` no se reconoce → reinicie PowerShell o Windows.

---

## Parte B. Obtener el repositorio

### Paso 6. Clonar el repositorio desde GitHub

Elija una carpeta de trabajo **fuera de OneDrive** si es posible. La sincronización de OneDrive puede bloquear archivos mientras Git trabaja.

```powershell
New-Item -ItemType Directory -Force "$HOME\Proyectos" | Out-Null
Set-Location "$HOME\Proyectos"
git clone <URL_DEL_REPOSITORIO_GITHUB> Metabase-Pruebas
```

> Reemplace `<URL_DEL_REPOSITORIO_GITHUB>` por la URL que le comparta Juan (por ejemplo `https://github.com/<usuario>/Metabase-Pruebas.git`). **La URL todavía no se ha definido.**

- **Qué hace:** descarga una copia del repositorio en `C:\Users\<usted>\Proyectos\Metabase-Pruebas`.
- **Resultado esperado:** `Cloning into 'Metabase-Pruebas'... done.`
- **Si falla:** *"Repository not found"* → verifique la URL y que Juan le haya dado acceso de colaborador. Si se abre una ventana de inicio de sesión de GitHub, autentíquese en el navegador.

### Paso 7. Abrir PowerShell en la carpeta correcta

```powershell
Set-Location "$HOME\Proyectos\Metabase-Pruebas"
Get-ChildItem -Name
```

- **Resultado esperado:** debe ver, entre otros, `compose.yaml`, `.env.example` (oculto en algunos listados), `README.md`, `docs`, `scripts`.
- **Desde el Explorador:** abra la carpeta, haga clic en la barra de dirección, escriba `powershell` y presione `Enter`.
- **Todos los comandos siguientes deben ejecutarse en esta carpeta.**

---

## Parte C. Configurar e iniciar Metabase

### Paso 8. Crear el archivo `.env` a partir de `.env.example`

```powershell
Copy-Item .env.example .env
```

- **Qué hace:** crea su archivo local de configuración. `.env` **no se sube a GitHub** porque está en `.gitignore`.
- **Si falla:** *"Cannot find path"* → no está en la carpeta del repositorio (paso 7).

### Paso 9. Generar la clave de sesión de forma segura

```powershell
$b = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
$clave = [Convert]::ToBase64String($b)
$t = [IO.File]::ReadAllText("$PWD\.env") -replace '(?m)^MB_SESSION_SECRET_KEY=[^\r\n]*', "MB_SESSION_SECRET_KEY=$clave"
[IO.File]::WriteAllText("$PWD\.env", $t, (New-Object Text.UTF8Encoding($false)))
Remove-Variable b, clave, t
```

- **Qué hace:** genera 32 bytes aleatorios con el generador criptográfico de Windows, los convierte a texto Base64 (44 caracteres) y los escribe en `.env` en lugar del marcador.
- **Comprobación sin mostrar la clave:**

```powershell
$l = (Select-String -Path .env -Pattern '^MB_SESSION_SECRET_KEY=').Line
"Longitud de la clave: " + ($l.Length - 'MB_SESSION_SECRET_KEY='.Length)
"Sigue el marcador: " + ($l -match 'REEMPLAZAR')
```

- **Resultado esperado:** `Longitud de la clave: 44` y `Sigue el marcador: False`.
- **Conservación:** copie la clave en su gestor de contraseñas personal (abra `.env` con el Bloc de notas: `notepad .env`). Si la pierde no se pierden datos: genere otra y solo tendrá que volver a iniciar sesión.

### Paso 10. Validar la configuración de Docker Compose

```powershell
docker compose config --quiet
if ($?) { "compose.yaml y .env son validos" }
```

- **Qué hace:** combina `compose.yaml` y `.env` y revisa la sintaxis, sin iniciar nada. `--quiet` evita imprimir la configuración, que incluiría su clave.
- **Resultado esperado:** `compose.yaml y .env son validos`.
- **Si falla:** *"Defina MB_SESSION_SECRET_KEY..."* → el archivo `.env` no existe o la variable está vacía (pasos 8 y 9). *"no configuration file provided"* → no está en la carpeta correcta.

### Paso 11. Descargar la imagen de Metabase

```powershell
docker compose pull
```

- **Qué hace:** descarga `metabase/metabase:v0.64.1` (unos 800 MB comprimidos).
- **Resultado esperado:** líneas `Pulled` y ningún error. Puede tardar varios minutos.
- **Si falla:** revise la conexión a Internet y que Docker Desktop esté en ejecución. Repita el comando: reanuda la descarga.

### Paso 12. Crear e iniciar el contenedor

```powershell
docker compose up -d
```

- **Qué hace:** crea el volumen `metabase-qa-data` y el contenedor `metabase-qa`, y lo inicia en segundo plano (`-d`).
- **Resultado esperado:** `Volume "metabase-qa-data" Created` y `Container metabase-qa Started`.
- **Si falla:**
  - *"port is already allocated"* → el puerto 3000 está ocupado. Ver [SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md#3-puerto-3000-ocupado).
  - *"container name "/metabase-qa" is already in use"* → ya existe un contenedor con ese nombre. Ver la sección "El contenedor ya existe". **No lo elimine sin revisar.**

### Paso 13. Verificar el estado del contenedor

```powershell
docker compose ps
```

- **Resultado esperado:** el servicio `metabase` aparece con `STATUS` igual a `Up ... (health: starting)` durante el primer arranque, y luego `Up ... (healthy)`. **El primer arranque puede tardar de 1 a 5 minutos**, mientras Metabase crea su base de aplicación.
- Repita el comando cada 30 segundos hasta ver `(healthy)`.
- **Si falla:** `Exited` o `Restarting` → revise los registros (paso 14).

### Paso 14. Consultar los registros

```powershell
docker compose logs --tail 50
docker compose logs -f
```

- **Qué hace:** el primero muestra las últimas 50 líneas. El segundo las muestra en vivo; presione `Ctrl + C` para salir, lo que **no** detiene Metabase.
- **Resultado esperado:** al terminar el arranque aparece una línea parecida a `Metabase Initialization COMPLETE`.
- **Si falla:** busque líneas con `ERROR` o `Exception` y consulte [SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md).

### Paso 15. Verificar el endpoint `/api/health`

```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

- **Qué hace:** consulta el estado de salud de Metabase.
- **Resultado esperado:** `status` con el valor `ok`.
- **Si falla:** si aún está iniciando puede responder un error o `starting`; espere un minuto y repita. Si después de 5 minutos no responde, ver "/api/health no responde".

Verificación completa con el script del repositorio (solo lectura):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verificar-ambiente.ps1 -GuardarEvidencia
```

- **Resultado esperado:** todas las líneas `[OK]`, la versión `v0.64.1` y `RESULTADO: ambiente disponible.`. Se guarda un `.txt` en `reportes-generales/evidencias-ambiente/`.

---

## Parte D. Configuración inicial de Metabase

### Paso 16. Abrir Metabase en el navegador

Abra **<http://localhost:3000>** en el navegador del plan (registre en la evidencia cuál usa y su versión).

- **Resultado esperado:** la pantalla de bienvenida **"Welcome to Metabase"** con el botón **"Let's get started"**. Si el navegador ya está en español, puede aparecer como **"Bienvenido a Metabase"** con el botón **"Empecemos"**.
- **Si falla:** si el navegador indica que no puede conectarse, compruebe el paso 15. Si en lugar del asistente aparece una pantalla de inicio de sesión, el asistente ya se completó antes en este volumen: use la cuenta que creó entonces.

### Paso 17. Recorrer el asistente de configuración

El asistente se completa **una sola vez**. Las opciones marcadas como **obligatorias** deben coincidir con la instalación de Juan (verificadas el 2026-11-05 en `GET /api/session/properties`).

| # | Pantalla (español / inglés) | Qué elegir |
|---|---|---|
| 1 | **Bienvenido a Metabase** (*Welcome to Metabase*) | **Empecemos** (*Let's get started*) |
| 2 | **¿Cuál es tu idioma preferido?** (*What's your preferred language?*) | **Español**. **Obligatorio**: la instalación de Juan usa `es`. A partir de aquí la interfaz se muestra en español. → **Siguiente** |
| 3 | **¿Cómo quieres que te llamemos?** (*What should we call you?*) | Cuenta administradora: ver el paso 18 → **Siguiente** |
| 4 | Pantalla sobre el uso previsto de Metabase (si aparece) | Cualquier opción: no afecta a las pruebas → **Siguiente** |
| 5 | **Añade tus datos** (*Add your data*) | **Añadiré mis datos más tarde** (*I'll add my data later*). **Obligatorio**: no conecte ninguna base de datos, porque las pruebas usan solo Sample Database |
| 6 | **Preferencias de datos de uso** (*Usage data preferences*) | **Desmarque** "Permitir que Metabase recopile eventos de uso de forma anónima". **Obligatorio**: en la instalación de Juan está desactivado (`anon-tracking-enabled: false`) → **Finalizar** |
| 7 | Pantalla final | **Llévame a Metabase** (*Take me to Metabase*) |

Si eligió otro idioma por error, cámbielo en **ícono de engranaje → Configuración de administración → Ajustes →** localización → idioma de la instancia: **Español**.

### Paso 18. Crear la cuenta administradora

En la pantalla **¿Cómo quieres que te llamemos?**:

| Campo (español / inglés) | Valor |
|---|---|
| **Nombre** / **Apellido** (*First name / Last name*) | `Samuel` / `Perdomo` (su nombre) |
| **Email** | `qa.admin.samuel@example.com` (los correos `@example.com` están reservados para ejemplos y no reciben mensajes), o un correo bajo su control |
| **Nombre de la empresa o del equipo** (*Company or team name*) | `Metabase-Pruebas` |
| **Crea una contraseña** / **Confirma tu contraseña** | Una contraseña **propia**, de al menos **6 caracteres y con al menos 1 dígito** (requisito de la instancia), que no se comparte ni se escribe en el repositorio |

- **Resultado esperado:** al terminar el asistente, Metabase abre la página de inicio con su nombre.
- **Si falla:** si la contraseña es rechazada, siga los requisitos que muestra el formulario.
- Guarde el correo y la contraseña en su gestor de contraseñas. **No** los escriba en documentos del repositorio. Los necesitará para `scripts/obtener-ids-recursos.ps1` y para Postman.

### Paso 19. Verificar que existe Sample Database

1. En la barra lateral izquierda, abra **Explorar datos → Bases de datos** (*Browse data → Databases*).
2. Debe aparecer **Sample Database**. Ábrala y confirme que aparecen al menos **Orders, Products, People y Reviews**. Puede haber tablas adicionales; anótelas. Los nombres de tablas y columnas aparecen en inglés aunque la interfaz esté en español.
3. También puede verificarlo en **ícono de engranaje (arriba a la derecha) → Configuración de administración → Bases de datos**.
4. En la barra lateral también aparecerá una colección **`Examples`**, creada automáticamente por Metabase. Es normal y también existe en la instalación de Juan: **no la modifique ni la borre**.

- **Si falla:** ver "Sample Database no aparece" en [SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md).

### Paso 20. Preparar los usuarios y recursos de prueba

Siga **completo y en orden** el documento [DATOS-Y-RECURSOS-PRUEBA.md](DATOS-Y-RECURSOS-PRUEBA.md), usando su lista de §0. Allí se explica cómo:

- Revisar los ajustes de la instancia y registrar los valores de referencia R01–R06 de Sample Database.
- Crear el usuario normal `qa.usuario.samuel@example.com` y revisar los permisos de datos.
- Crear las colecciones `QA - Metabase` (Todos los usuarios: Ver) y `QA - Restringida` (Todos los usuarios: Sin acceso).
- Crear las **5 preguntas** `QA - ...` con el editor gráfico.
- Crear `QA - Dashboard Principal` (3 visualizaciones y filtro `Categoría` vinculado a `Category`) y `QA - Dashboard Restringido`.
- Verificar las restricciones con el usuario normal.
- Completar en su `.env` las variables `QA_ADMIN_*` (cuenta administradora del paso 18) y `QA_USER_*` (Usuario QA) y comprobarlas con `scripts/probar-cuentas.ps1` ([AUTENTICACION-QA.md §2](AUTENTICACION-QA.md#2-configurar-el-env-una-vez-por-equipo)).
- Registrar los IDs de **su** instalación con `scripts/obtener-ids-recursos.ps1`.
- Completar la lista de equivalencia con la instalación de Juan (§8).

Al terminar, haga un respaldo (paso 23).

---

## Parte E. Uso diario

### Paso 21. Detener y volver a iniciar Metabase en las siguientes jornadas

Al iniciar cada jornada:

```powershell
Set-Location "$HOME\Proyectos\Metabase-Pruebas"
docker compose start
docker compose ps
powershell -ExecutionPolicy Bypass -File .\scripts\verificar-ambiente.ps1
```

(Docker Desktop debe estar abierto. Como la política es `unless-stopped`, si no detuvo Metabase manualmente se iniciará solo junto con Docker Desktop.)

Al terminar la jornada (opcional, libera memoria):

```powershell
docker compose stop
```

### Paso 22. Cómo se conserva la información entre reinicios

- Toda la configuración de Metabase (usuarios, permisos, preguntas, dashboards, colecciones) vive en el **volumen** `metabase-qa-data`, no en el contenedor ni en la carpeta del repositorio.
- `docker compose stop`, `start`, `restart`, reiniciar Windows o cerrar Docker Desktop **no borran datos**.
- `docker compose down` elimina el contenedor, pero **conserva el volumen**; `docker compose up -d` lo vuelve a crear con los mismos datos.
- **Lo único que borra los datos** es eliminar el volumen: `docker compose down -v`, `docker volume rm metabase-qa-data` o `docker system prune --volumes`. **No use estos comandos.**

### Paso 23. Hacer una copia de seguridad

```powershell
docker compose stop
powershell -ExecutionPolicy Bypass -File .\scripts\respaldar-volumen.ps1
docker compose start
```

- **Resultado esperado:** `Respaldo creado: ...\respaldos\metabase-qa-data-<fecha>.tar.gz`. Copie ese archivo fuera del repositorio; la carpeta `respaldos/` no se sube a GitHub.

### Paso 24. Actualizar el repositorio sin alterar los datos locales

```powershell
git status
git pull
```

- **Qué hace:** descarga los cambios de documentación, scripts y pruebas que haya subido Juan. **No toca** el volumen de Docker ni su archivo `.env`.
- Si `git pull` modifica `compose.yaml`, revise antes qué cambió (`git log -p -1 -- compose.yaml`) y hable con Juan **antes** de ejecutar `docker compose up -d`. Un cambio de versión de la imagen migraría la base de aplicación de forma irreversible.
- Para el flujo de ramas y commits, ver [TRABAJO-COLABORATIVO.md](TRABAJO-COLABORATIVO.md).

### Paso 25. Verificar que el ambiente está listo para comenzar las pruebas

Marque cada punto en su bitácora y guarde la evidencia en `reportes-generales/evidencias-ambiente/`:

- [ ] `scripts/verificar-ambiente.ps1` termina con `RESULTADO: ambiente disponible.` y muestra la versión `v0.64.1`.
- [ ] La interfaz está en **español** y los ajustes coinciden con los de Juan ([CONFIGURACION-QA.md §8](CONFIGURACION-QA.md#8-ajustes-de-la-instancia-que-deben-coincidir)).
- [ ] Puede iniciar sesión en <http://localhost:3000> con la cuenta administradora.
- [ ] Sample Database aparece con Orders, Products, People y Reviews.
- [ ] Los valores R01–R06 están registrados en `recursos-compartidos/datos/valores-referencia.csv` y coinciden con los de Juan.
- [ ] El usuario normal existe, puede iniciar sesión y **no** puede abrir `QA - Restringida` ni `QA - Dashboard Restringido`.
- [ ] Existen, una sola vez cada uno:
  - las colecciones `QA - Metabase` y `QA - Restringida`;
  - las 5 preguntas `QA - ...`;
  - `QA - Dashboard Principal`, con sus tres visualizaciones y el filtro `Categoría` vinculado en las tres;
  - `QA - Dashboard Restringido`.
- [ ] `scripts/obtener-ids-recursos.ps1 -Guardar` no informa `[FALTA]` ni `[DUPLICADO]`, y generó `configuracion/recursos-locales.json`.
- [ ] La lista de equivalencia (DATOS-Y-RECURSOS-PRUEBA.md §8) está guardada en `reportes-generales/evidencias-ambiente/` y comparada con la de Juan.
- [ ] Las variables `QA_ADMIN_EMAIL`, `QA_ADMIN_PASSWORD`, `QA_USER_EMAIL` y `QA_USER_PASSWORD` de su `.env` están completas, y `scripts\probar-cuentas.ps1` muestra `[OK]` en las dos cuentas (`administrador: True` / `administrador: False`), según [AUTENTICACION-QA.md §2](AUTENTICACION-QA.md#2-configurar-el-env-una-vez-por-equipo).
- [ ] Se hizo una copia de seguridad del volumen.
- [ ] Están instaladas, con sus versiones registradas, las herramientas de sus casos, siguiendo [HERRAMIENTAS-NEWMAN-JMETER.md](HERRAMIENTAS-NEWMAN-JMETER.md) §1:
  - **Postman** y **Newman** (TC-ERR, TC-CON, TC-REN-003). Newman requiere Node.js.
  - **Apache JMeter** (TC-REN-001, TC-REN-004, TC-REN-005). JMeter requiere Java.
  - El **navegador** con sus herramientas de desarrollador (TC-REN-002).

Cuando todo esté marcado, continúe con [EJECUCION-PRUEBAS.md](EJECUCION-PRUEBAS.md).
