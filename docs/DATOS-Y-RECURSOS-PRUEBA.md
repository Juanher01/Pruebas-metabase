# Datos y recursos de prueba

Instrucciones para dejar **cada instalación** (la de Juan y la de Samuel) con recursos equivalentes: mismos nombres, misma configuración y mismos datos de origen. Los **IDs numéricos** serán distintos en cada instalación, y eso es esperado.

**Quién usa qué:** Juan ejecuta en su instalación los casos **funcionales (TC-FUN)** y de **validación (TC-VAL)**. Samuel ejecuta en la suya los de **manejo de errores (TC-ERR)**, **contrato (TC-CON)** y **rendimiento (TC-REN)**. Los casos de ambos dependen de los recursos de este documento, por lo que **las dos instalaciones deben prepararse completas** (ver §8).

### Idioma de la interfaz y etiquetas

- La instalación de Juan está configurada en **Español** (`site-locale: es`, verificado el 2026-11-05 en `GET /api/session/properties`). Samuel debe elegir **Español** en el asistente ([INSTALACION-SAMUEL.md, paso 17](INSTALACION-SAMUEL.md#paso-17-recorrer-el-asistente-de-configuración)).
- Las etiquetas se indican primero **en español, tal como aparecen en la traducción oficial de Metabase v0.64.1** (`locales/es.po`), y entre paréntesis en inglés. La traducción de cada texto está verificada, pero su ubicación exacta en pantalla puede variar ligeramente. Si no encuentra una opción, busque la equivalente y anote la diferencia en `reportes-generales/evidencias-ambiente/`.
- Los **nombres de tablas y columnas** de Sample Database (`Orders`, `Products`, `Subtotal`, `Category`, `Price`...) **no se traducen**: aparecen en inglés aunque la interfaz esté en español.

> **No invente valores esperados.** Todos los números de referencia se obtienen consultando su propia instalación y se registran en [recursos-compartidos/datos/valores-referencia.csv](../recursos-compartidos/datos/valores-referencia.csv).

---

## 0. Orden de preparación

Siga este orden: cada paso usa lo creado en el anterior. Marque la casilla al terminar.

| ✔ | # | Actividad | Sección |
|---|---|---|---|
| ☐ | 1 | Revisar los ajustes de la instancia (idioma, contenido de ejemplo) | §1.1 |
| ☐ | 2 | Verificar Sample Database y registrar los valores de referencia R01–R06 | §1.2–§1.3 |
| ☐ | 3 | Crear el usuario normal y verificar su inicio de sesión | §2.1–§2.3 |
| ☐ | 4 | Revisar los permisos de datos | §2.5 |
| ☐ | 5 | Crear las colecciones `QA - Metabase` y `QA - Restringida`, con sus permisos | §3 |
| ☐ | 6 | Crear las 5 preguntas de referencia | §4 |
| ☐ | 7 | Crear `QA - Dashboard Principal` (3 visualizaciones y filtro de categoría) | §5.1 |
| ☐ | 8 | Crear `QA - Dashboard Restringido` | §5.2 |
| ☐ | 9 | Verificar las restricciones con el usuario normal | §5.3 |
| ☐ | 10 | Registrar los IDs locales con el script | §7 |
| ☐ | 11 | Comparar la instalación con la del compañero | §8 |
| ☐ | 12 | Respaldar el volumen | [CONFIGURACION-QA.md §4](CONFIGURACION-QA.md#4-copias-de-seguridad) |

Tiempo estimado: entre 60 y 90 minutos la primera vez.

---

## 1. Instancia y Sample Database

### 1.1 Ajustes de la instancia y contenido de ejemplo

1. **Idioma:** Español. Para comprobarlo o cambiarlo: **ícono de engranaje (arriba a la derecha) → Configuración de administración** (*Admin settings*) **→ Ajustes** (*Settings*) → sección de localización (*Localization*) → idioma de la instancia.
2. **Contenido de ejemplo:** las instalaciones nuevas de v0.64.1 crean automáticamente una colección **`Examples`**, con el dashboard **`E-commerce Insights`** y varias preguntas de muestra (por ejemplo `Orders + People` o `Revenue by state`). Proviene de `resources/sample-content.edn` y existe en ambas instalaciones.
   - **No la modifique, mueva ni borre.** Así ambas instalaciones siguen siendo equivalentes.
   - **No la use** en las pruebas: ningún recurso de referencia depende de ella. Por eso todos nuestros recursos llevan el prefijo `QA - `.
3. Registre los ajustes observados con el comando de [CONFIGURACION-QA.md §8](CONFIGURACION-QA.md#8-ajustes-de-la-instancia-que-deben-coincidir) y compárelos con los de la otra instalación.

### 1.2 Qué es Sample Database y qué tablas tiene

- **Sample Database** es la **fuente de datos** de todas las consultas de prueba. Viene incluida con Metabase y contiene datos ficticios de una tienda. **No hay que crear registros manualmente.**
- La **base de datos de aplicación H2** (`/metabase-data/metabase.db`, dentro del volumen) es otra cosa: allí Metabase guarda usuarios, preguntas, dashboards y permisos. No se consulta en las pruebas ni se sube a GitHub. Ver [CONFIGURACION-QA.md §1](CONFIGURACION-QA.md#dos-bases-de-datos-diferentes-no-confundir).

Verificación:

1. En la barra lateral izquierda, abra **Explorar datos → Bases de datos** (*Browse data → Databases*) → **Sample Database**.
2. Confirme que existen **Orders**, **Products**, **People** y **Reviews**. Puede haber tablas adicionales (por ejemplo `Accounts`, `Analytic Events`, `Feedback`, `Invoices`): anótelas.
3. Abra **Orders** y **Products** y confirme que existen estas columnas:

| Tabla | Columnas que deben existir (nombre en la interfaz / nombre SQL) |
|---|---|
| Orders | `Subtotal` / `SUBTOTAL` |
| Products | `Category` / `CATEGORY`, `Price` / `PRICE`, `Title` / `TITLE` |

Si una columna no existe con ese nombre, **no cree la pregunta que la usa**: registre la diferencia y avise al compañero.

### 1.3 Registrar los valores de referencia

1. **Nuevo → Consulta SQL** (*New → SQL query*). El botón **Nuevo** está arriba a la derecha.
2. Si Metabase pide elegir una base de datos, elija **Sample Database**.
3. Pegue **una** de las consultas siguientes y ejecútela (botón ▶ o `Ctrl + Enter`).
4. Anote el resultado en la columna de su instalación (`valor_juan` o `valor_samuel`) y la fecha en [valores-referencia.csv](../recursos-compartidos/datos/valores-referencia.csv).
5. Borre la consulta del editor y repita con la siguiente.
6. Al terminar, **cierre el editor sin guardar**. Estas consultas **no** se guardan como preguntas.

```sql
-- R01: registros por tabla
SELECT 'ORDERS' AS TABLA, COUNT(*) AS REGISTROS FROM PUBLIC.ORDERS
UNION ALL SELECT 'PRODUCTS', COUNT(*) FROM PUBLIC.PRODUCTS
UNION ALL SELECT 'PEOPLE',   COUNT(*) FROM PUBLIC.PEOPLE
UNION ALL SELECT 'REVIEWS',  COUNT(*) FROM PUBLIC.REVIEWS;
```

```sql
-- R02: pedidos con subtotal mayor a 100 (referencia de P1, TC-FUN-002 y TC-FUN-010)
SELECT COUNT(*) AS PEDIDOS_SUBTOTAL_MAYOR_100 FROM PUBLIC.ORDERS WHERE SUBTOTAL > 100;
```

```sql
-- R03: conteo de pedidos (referencia de P2 y TC-FUN-003)
SELECT COUNT(*) AS TOTAL_PEDIDOS FROM PUBLIC.ORDERS;
```

```sql
-- R04: productos por categoría (referencia de P3, TC-FUN-005 y TC-FUN-007)
SELECT CATEGORY, COUNT(*) AS PRODUCTOS FROM PUBLIC.PRODUCTS GROUP BY CATEGORY ORDER BY CATEGORY;
```

```sql
-- R05: precio promedio por categoría (referencia de P4)
SELECT CATEGORY, AVG(PRICE) AS PRECIO_PROMEDIO FROM PUBLIC.PRODUCTS GROUP BY CATEGORY ORDER BY CATEGORY;
```

```sql
-- R06: precondición de TC-VAL-004 (el valor NO debe existir; se espera 0)
SELECT COUNT(*) AS COINCIDENCIAS FROM PUBLIC.PRODUCTS WHERE TITLE = 'QA_VALOR_INEXISTENTE_2026';
```

Reglas de registro:

- **Resultados de varias filas** (R01, R04, R05): anótelos como `ETIQUETA=valor; ETIQUETA=valor` con las etiquetas y valores **reales**, en el orden en que aparecen. Por ejemplo `ORDERS=<n>; PRODUCTS=<n>; ...`.
- **R04:** anote también **la lista exacta de categorías**. TC-FUN-007 necesita "un valor existente".
- **R05:** anote los promedios **con todos los decimales** que muestre la tabla de resultados, sin redondearlos.
- **Captura:** una por consulta en `reportes-generales/evidencias-ambiente/`, con el nombre `ambiente_<R0n>_<descripcion>_<integrante>_<AAAAMMDD>.png`.
- **Comparación:** Sample Database es la misma en ambas instalaciones de v0.64.1, así que los valores de Juan y de Samuel **deberían coincidir**. Si no coinciden, escriba `no` en la columna `coinciden` y registre un hallazgo de ambiente **antes** de ejecutar casos.
- **R06:** si no devuelve 0, el valor sí existe y TC-VAL-004 queda bloqueado hasta definir otra columna. Avise a Juan.

---

## 2. Usuarios de prueba, grupos y permisos

### 2.1 Cuentas

| Cuenta | Cómo se crea | Grupos | Uso |
|---|---|---|---|
| **Administrador** | En el asistente inicial ([INSTALACION-SAMUEL.md, paso 18](INSTALACION-SAMUEL.md#paso-18-crear-la-cuenta-administradora)) | Administradores (y Todos los usuarios, automático) | Preparación, casos que exigen "permisos suficientes" y solicitudes autenticadas a la API |
| **Usuario normal** | Invitación desde Personas (§2.2) | Solo **Todos los usuarios** | TC-FUN-001, TC-VAL-003 y verificaciones complementarias de seguridad funcional |

**Correos:** use dominios de ejemplo, que no reciben mensajes:

| Instalación | Administrador | Usuario normal |
|---|---|---|
| Juan | `qa.admin.juan@example.com` (o el que ya use) | `qa.usuario.juan@example.com` |
| Samuel | `qa.admin.samuel@example.com` | `qa.usuario.samuel@example.com` |

**Contraseñas:** cada integrante crea las suyas y las guarda en su gestor de contraseñas. **No existen contraseñas compartidas ni predeterminadas**, y no se escriben en el repositorio. Requisito de la instancia: mínimo **6 caracteres y al menos 1 dígito** (`password-complexity`, configuración por defecto, verificada en la instalación de Juan).

### 2.2 Crear (invitar) el usuario normal

1. **Ícono de engranaje → Configuración de administración → Personas** (*Admin settings → People*).
2. **Invitar a alguien** (*Invite someone*).
3. Complete los campos:
   - **Nombre:** `Usuario`
   - **Apellido:** `QA`

   Así se muestra como **Usuario QA**, igual que la cuenta existente en la instalación de Juan.
   - **Email:** `qa.usuario.<su nombre>@example.com`
4. **Grupos:** no agregue ninguno. El usuario queda solo en **Todos los usuarios**; **no** marque **Administradores**.
5. **Crear** (*Create*).
6. Como la instancia **no tiene correo configurado** (`email-configured?: false`), Metabase muestra una **contraseña temporal** (*Temporary password*). Use **Copiar** y guárdela en su gestor de contraseñas. No la pegue en el repositorio ni en el chat del equipo.
7. Si cerró el aviso sin copiarla, en la lista **Personas** abra el menú `…` del usuario → **Restablecer contraseña** (*Reset password*). Se muestra una contraseña temporal nueva.
8. **Resultado esperado:** `Usuario QA` aparece **una sola vez** en la lista Personas, como activo. Si ya existía (por ejemplo, desactivado), reactívelo en lugar de crear otro.

### 2.3 Verificar el inicio de sesión

1. Abra una **ventana privada o de incógnito**, para no cerrar la sesión de administrador, y vaya a `http://localhost:3000`.
2. Inicie sesión con `qa.usuario.<su nombre>@example.com` y la contraseña temporal.
3. Opcional: cambie la contraseña desde el menú de su cuenta (ícono de engranaje → ajustes de la cuenta → **Contraseña**) y guarde la nueva en su gestor.
4. **Resultado esperado de la preparación:** entra a la página de inicio, y el menú del engranaje **no** ofrece *Configuración de administración*.
5. Cierre la ventana privada.

Esta comprobación es de **preparación**; **no** es la ejecución de TC-FUN-001.

### 2.4 Permisos acumulativos de `All Users` (precaución importante)

En la interfaz en español, el grupo *All Users* se llama **Todos los usuarios**.

En Metabase los permisos se **suman**: un usuario recibe el permiso **más amplio** de todos sus grupos, y todos los usuarios pertenecen siempre a **Todos los usuarios**. Por tanto:

- Si **Todos los usuarios** tiene acceso a una colección, **ningún** usuario puede quedar restringido mediante otro grupo. La restricción debe aplicarse **a Todos los usuarios**.
- **Todos los usuarios** suele tener por defecto el permiso **Administrar** (*Curate*) sobre la colección raíz **Nuestros análisis** (*Our analytics*), y las colecciones nuevas **heredan** los permisos de su colección padre. Por eso hay que cambiar explícitamente el permiso de `QA - Metabase` y de `QA - Restringida` (§3).
- No agregue al usuario normal a grupos adicionales.
- Los **Administradores** siempre tienen acceso completo. Toda la preparación se hace con la cuenta administradora.

### 2.5 Permisos de datos

1. **Configuración de administración → Permisos → Datos** (*Permissions → Data*).
2. Seleccione el grupo **Todos los usuarios** y la fila **Sample Database**.
3. Valores requeridos:
   - **Ver datos** (*View data*): **Puede ver** (*Can view*).
   - **Crear consultas** (*Create queries*): **Constructor de consultas y nativo** (*Query builder and native*).
4. Normalmente esos son los valores por defecto. Si son distintos, cámbielos y pulse **Guardar cambios**. Si los encontró distintos, avíselo al compañero para que ambas instalaciones queden iguales.
5. Guarde una captura en `reportes-generales/evidencias-ambiente/`.

---

## 3. Colecciones

Ambas colecciones se crean en la raíz **Nuestros análisis**, con la cuenta administradora.

### 3.1 `QA - Metabase` (recurso de preparación)

1. **Nuevo → Colección** (*New → Collection*).
2. Complete los campos:
   - **Nombre:** `QA - Metabase` (con espacios a ambos lados del guion)
   - **Descripción:** `Recursos de referencia del plan de pruebas. No modificar durante la ejecucion.`
   - **Ubicación** (la colección padre): **Nuestros análisis**
3. **Crear**.
4. **Permisos:**
   1. **Configuración de administración → Permisos → Colecciones** (*Collections*). En la lista de la izquierda, seleccione `QA - Metabase`.
   2. Para **Todos los usuarios**, elija **Ver** (*View*). Deje **Administradores** en **Administrar**.
   3. **Guardar cambios** y confirme.
5. **Verificar:** la colección aparece **una sola vez** bajo *Nuestros análisis* y su URL tiene la forma `/collection/<id>-qa-metabase`.

### 3.2 `QA - Restringida` (recurso de preparación)

1. **Nuevo → Colección**.
2. Complete los campos:
   - **Nombre:** `QA - Restringida`
   - **Descripción:** `Recurso restringido para verificaciones de control de acceso.`
   - **Ubicación:** **Nuestros análisis**
3. **Crear**.
4. **Permisos:**
   1. **Permisos → Colecciones →** `QA - Restringida`.
   2. Para **Todos los usuarios**, elija **Sin acceso** (*No access*). Si aparece **Cambiar también las subcolecciones**, actívelo.
   3. **Guardar cambios** y confirme.
5. **Verificar:** `QA - Restringida` y `QA - Metabase` son **hermanas**: ninguna está dentro de la otra.

### 3.3 Colecciones creadas durante la ejecución (no preparar)

**TC-FUN-008** debe **crear** una colección y **trasladar** a ella una pregunta durante la ejecución formal, para que el proceso pueda observarse. Por eso:

- **No** cree de antemano ninguna colección `EJEC - ...`.
- La pregunta que se traslada en TC-FUN-008 es **la creada en TC-FUN-004**, no una pregunta `QA - ...`. Mover un recurso de referencia alteraría las precondiciones de otros casos.

---

## 4. Preguntas guardadas de referencia

### 4.1 Reglas comunes

- Las 5 preguntas se crean con el **editor gráfico** (constructor de consultas), **no** con SQL. Las preguntas SQL no exponen la columna `Category` al filtro del dashboard sin configuración adicional, y TC-CON-002 usa la estructura `dataset_query` de una pregunta guardada.
- Todas se guardan en la colección **`QA - Metabase`**.
- Los nombres deben ser **exactos**: mayúsculas, tildes (`categoría`) y espacios alrededor del guion. El script de §7 busca por nombre exacto.
- Si se equivoca después de guardar, corrija la pregunta y al guardar elija **Reemplazar la pregunta original** (*Replace original question*), **no** *Guardar como nueva pregunta*, para no crear duplicados.

### 4.2 Procedimiento general

1. **Nuevo → Pregunta** (*New → Question*).
2. En **Elige tus datos iniciales** (*Pick your starting data*), entre en **Datos sin procesar** (*Raw Data*) o en la sección de tablas, luego en **Sample Database**, y elija la tabla indicada. Se abre el editor de consultas con los pasos **Datos**, **Filtro** y **Resumir**.
3. Configure el filtro o el resumen indicado en §4.3.
4. **Visualizar** (*Visualize*).
5. Si la visualización no es la indicada, use **Visualización** (*Visualization*, abajo a la izquierda) y elíjala.
6. Abra **Guardar** (*Save*, arriba a la derecha) y complete:
   - **Nombre:** el exacto de §4.3.
   - **Descripción:** la indicada en §4.3.
   - **¿Dónde quieres guardar esto?** (*Where do you want to save this?*): elija la **colección** `QA - Metabase`. **No** elija un dashboard: en esta versión, el selector también permite guardar una pregunta dentro de un dashboard.
7. Pulse **Guardar**. Si Metabase ofrece agregarla a un dashboard, rechácelo o cierre el aviso.
8. **Recuperar:** abra `QA - Metabase`, haga clic en la pregunta y compruebe que muestra la misma configuración y resultado.
9. Anote el ID de la URL `/question/<id>-...`.

### 4.3 Las 5 preguntas

**P1 — `QA - Pedidos con subtotal mayor a 100`**

- **Tabla:** Orders.
- **Filtro:**
  1. En el paso **Filtro**, elija la columna **Subtotal**.
  2. Operador: **Mayor que** (*Greater than*).
  3. Valor: `100`.
  4. Pulse **Añadir filtro** (*Add filter*).
- **Resumir:** nada.
- **Visualización:** **Tabla**.
- **Descripción:** `Recurso de preparacion P1. Filtro Subtotal > 100. No modificar.`
- **Comprobación:** el número de filas debe corresponder con R02. Lea la nota sobre el límite de 2.000 filas (§4.4).
- **Usada en:** TC-FUN-010, TC-CON-002, TC-CON-003, TC-CON-004, TC-REN-001, TC-REN-003, TC-REN-004 y TC-REN-005.

**P2 — `QA - Conteo de pedidos`**

- **Tabla:** Orders.
- **Filtro:** ninguno.
- **Resumir:** métrica **Recuento de filas** (*Count of rows*). Sin agrupación.
- **Visualización:** **Número** (se elige automáticamente).
- **Descripción:** `Recurso de preparacion P2. Recuento de filas de Orders. No modificar.`
- **Comprobación:** debe ser igual a R03.
- **Usada en:** TC-FUN-003 (comparación por otro mecanismo), `QA - Dashboard Restringido` y verificación de integración "Metabase y fuente de datos".

**P3 — `QA - Productos por categoría`**

- **Tabla:** Products.
- **Resumir:**
  - Métrica: **Recuento de filas**.
  - **Elige una columna para agrupar por** (*Pick a column to group by*): **Category**.
- **Visualización:** **Barra** (*Bar*).
- **Descripción:** `Recurso de preparacion P3. Recuento de productos por Category. No modificar.`
- **Comprobación:** las barras y sus valores deben coincidir con R04. Use el botón para alternar entre gráfico y tabla y ver los números.
- **Usada en:** `QA - Dashboard Principal`, TC-FUN-006 y verificación de integración "Consultas y dashboards".

**P4 — `QA - Precio promedio por categoría`**

- **Tabla:** Products.
- **Resumir:**
  - Métrica: **Promedio de ...** (*Average of ...*), y luego la columna **Price**.
  - Agrupar por: **Category**.
- **Visualización:** **Barra**.
- **Descripción:** `Recurso de preparacion P4. Promedio de Price por Category. No modificar.`
- **Comprobación:** compare con R05 en la vista de tabla. La interfaz puede mostrar menos decimales que SQL; anote ambos valores.
- **Usada en:** `QA - Dashboard Principal`.

**P5 — `QA - Detalle de productos`**

- **Tabla:** Products.
- **Filtro y resumen:** ninguno. Pulse **Visualizar** directamente.
- **Visualización:** **Tabla**. Confirme que la columna **Category** está visible.
- **Descripción:** `Recurso de preparacion P5. Registros de Products. No modificar.`
- **Comprobación:** el número de filas debe ser igual al valor de `PRODUCTS` en R01.
- **Usada en:** `QA - Dashboard Principal`.

### 4.4 Límite de 2.000 filas (importante para P1)

- **El límite:** en v0.64.1, las consultas sin agregación que se ejecutan desde la interfaz devuelven por defecto **como máximo 2.000 filas**. Lo fija `default-unaggregated-query-row-limit 2000` en `query_processor/middleware/constraints.clj`. Si R02 supera 2.000, P1 mostrará **"Mostrando las primeras 2000 filas"** (*Showing first 2000 rows*), y eso **no es un error**.
- **Comparar P1 con R02:** use un recuento, no el número de filas visibles. Abra P1, agregue temporalmente **Resumir → Recuento de filas**, pulse **Visualizar** y compare el número con R02. **No guarde esa variante.** Cierre sin guardar o descarte los cambios.
- **Casos API afectados:** el límite puede aplicarse también a `POST /api/card/{id}/query`, de modo que `data.rows` tendría como máximo 2.000 elementos. Debe confirmarse en el piloto (TC-FUN-010, TC-CON-004) observando `row_count`.

---

## 5. Dashboards de referencia

### 5.1 `QA - Dashboard Principal`

Contiene **tres visualizaciones** vinculadas a un mismo filtro de categoría (precondición de TC-REN-002).

**Crear:**

1. **Nuevo → Dashboard**. Se abre **Crear un Dashboard**.
2. Complete los campos:
   - **Nombre:** `QA - Dashboard Principal`
   - **Descripción:** `Dashboard de referencia (3 visualizaciones + filtro de categoria). No modificar.`
   - **¿En qué colección debería ir esto?** (*Which collection should this go in?*): `QA - Metabase`
3. **Crear**. El dashboard nuevo se abre en modo edición. Si no, pulse el lápiz **Editar Dashboard** (*Edit dashboard*).

**Agregar las tres preguntas:**

4. Pulse **Añadir un gráfico** / **Añadir preguntas** (*Add a chart / Add questions*). Se abre un panel lateral para buscar.
5. Escriba `QA -` y haga clic, **en este orden**, en:
   1. `QA - Productos por categoría`
   2. `QA - Precio promedio por categoría`
   3. `QA - Detalle de productos`

   Cada clic agrega una tarjeta. Elija las **preguntas guardadas existentes**; no cree preguntas nuevas desde el panel.

**Organizar:**

6. El dashboard es una cuadrícula de 24 columnas. Distribución acordada:

| Tarjeta | Posición | Tamaño aproximado |
|---|---|---|
| `QA - Productos por categoría` | Fila superior, izquierda | Mitad del ancho |
| `QA - Precio promedio por categoría` | Fila superior, derecha | Mitad del ancho |
| `QA - Detalle de productos` | Debajo, a todo el ancho | Ancho completo |

   Arrastre cada tarjeta por su borde y cambie su tamaño desde la esquina inferior derecha. No agregue tarjetas de texto, encabezados ni pestañas.

**Agregar el filtro:**

7. Pulse **Agregar un filtro** (*Add a filter*, ícono de embudo) y elija **Texto o categoría** (*Text or Category*).
8. En el panel del filtro, configure:

| Ajuste | Valor |
|---|---|
| **Etiqueta** (*Label*) | `Categoría` |
| **Operador de filtro** (*Filter operator*) | **Es** (*Is*), el predeterminado |
| **La gente puede elegir** (*People can pick*) | **Varios valores** (*Multiple values*), el predeterminado |
| **¿Cómo debería la gente filtrar por esta columna?** | **Lista desplegable** (*Dropdown list*) |
| **Valor predeterminado** (*Default value*) | Vacío |

**Vincular el filtro a las tres tarjetas:**

9. Con el filtro seleccionado, cada tarjeta muestra un selector **Selecciona…**. En **las tres tarjetas**, elija **Category** (de *Products*).
   - Si una tarjeta no ofrece `Category`, la pregunta no se creó con el editor gráfico o se basó en otra tabla. Revise §4.

**Guardar:**

10. Pulse **Listo** (*Done*) en el panel del filtro y luego **Guardar** (*Save*), arriba a la derecha.
11. **Aplicar filtros automáticamente** (*Auto-apply filters*): déjelo **activado**, que es el valor predeterminado. Esto afecta cómo se observa TC-FUN-007 y cómo se mide TC-REN-002, así que debe ser igual en ambas instalaciones. Se revisa en el panel de información o ajustes del dashboard.

**Comprobar:**

12. Recargue la página (`F5`). Las tres visualizaciones cargan sin errores, y el filtro **Categoría** está vacío.
13. Elija **una** categoría de la lista. Las tres tarjetas deben cambiar, y la tabla de detalle debe mostrar solo esa categoría.
14. Quite el valor del filtro y recargue. Debe volver a mostrarse todo. El dashboard de referencia queda guardado **sin** valor de filtro.
15. Anote el ID del dashboard (URL `/dashboard/<id>-...`).

### 5.2 `QA - Dashboard Restringido`

1. **Nuevo → Dashboard**, con estos datos:
   - **Nombre:** `QA - Dashboard Restringido`
   - **Descripción:** `Dashboard privado para verificaciones de acceso.`
   - **Colección:** `QA - Restringida`
2. Agregue **solo** la pregunta `QA - Conteo de pedidos`. No agregue filtros.
3. **Guardar**.
4. Se usa en **TC-ERR-005** (solicitud sin autenticación sobre un dashboard privado) y en las verificaciones de seguridad funcional "Control de acceso" y "Acceso sin autorización".

### 5.3 Verificar las restricciones con el usuario normal

1. Con la cuenta administradora, copie las URL de `QA - Restringida` (`/collection/<id>-...`) y de `QA - Dashboard Restringido` (`/dashboard/<id>-...`).
2. Abra una **ventana privada** e inicie sesión con el **usuario normal**.
3. **Resultados esperados de la preparación:**
   - En la barra lateral **sí** aparece `QA - Metabase` y se pueden abrir sus preguntas y su dashboard, pero **no** editarlos.
   - `QA - Restringida` **no** aparece.
   - Al pegar las dos URL copiadas, se muestra **"Lo sentimos, no tienes permiso para ver eso."** (*Sorry, you don't have permission to see that.*) y **no** su contenido.
4. Guarde capturas en `reportes-generales/evidencias-ambiente/` y cierre la ventana privada.
5. Si el usuario normal **sí** ve el recurso restringido, revise §2.4 y §3.2 antes de continuar.

Esta es una verificación de **preparación**. Las verificaciones formales son las complementarias de seguridad funcional "Control de acceso" y "Acceso sin autorización".

### 5.4 Uso de los dashboards en los casos

| Caso | Uso |
|---|---|
| TC-FUN-009, TC-CON-001 | `GET /api/dashboard/{dashboard_principal_id}` |
| TC-REN-002 | 10 cargas secuenciales en el navegador |
| TC-ERR-005 | `GET /api/dashboard/{dashboard_privado_id}` sin sesión |
| Verificaciones de integración "Consultas y dashboards" y "Filtros y visualizaciones" | Coherencia entre preguntas, dashboard y filtro |

---

## 6. Recursos de preparación y recursos creados durante las pruebas

### 6.1 Convención de nombres

| Tipo | Prefijo | Formato | Ejemplo |
|---|---|---|---|
| **Recurso de preparación** (precondición; existe antes de las pruebas y no se modifica) | `QA - ` | `QA - <descripción>` | `QA - Dashboard Principal` |
| **Recurso creado durante una prueba** (resultado de los pasos de un caso) | `EJEC - ` | `EJEC - <ID del caso> - <descripción> - <AAAAMMDD>` | `EJEC - TC-FUN-006 - Dashboard - 20261110` |
| **Nombre exigido por el plan** | Sin prefijo | Exactamente el indicado en el caso | `Análisis de ventas & costos (2026)` (TC-VAL-005) |

Reglas:

1. Los recursos `QA - ...` **no se editan, mueven ni archivan** durante la ejecución. Si un caso necesita modificar algo, se crea un recurso `EJEC - ...`.
2. **Antes** de ejecutar un caso que crea un recurso, use la búsqueda superior para comprobar que no existe ya uno con ese nombre.
   - Si existe por una ejecución anterior, use la fecha nueva en el nombre.
   - Para los nombres exigidos por el plan, envíe el anterior a la papelera (**menú `…` → Enviar a la papelera**) y anótelo en las observaciones.
   - **No vacíe la papelera** ni elimine definitivamente recursos con evidencias asociadas.
3. Los recursos `EJEC - ...` se guardan en una colección `EJEC - Ejecucion <AAAAMMDD>`, creada en *Nuestros análisis* al comenzar la jornada de ejecución, o donde el caso lo indique. Esa colección es de ejecución, no de preparación.

### 6.2 Qué se prepara y qué se crea en cada caso funcional (instalación de Juan)

| Caso | Requiere antes (preparación) | Se crea durante la ejecución |
|---|---|---|
| TC-FUN-001 | Usuario normal activo | — |
| TC-FUN-002 | Sample Database (Orders) y referencia R02 | Consulta sin guardar |
| TC-FUN-003 | Referencia R03 | Consulta SQL sin guardar |
| TC-FUN-004 | Colección autorizada | Pregunta `EJEC - TC-FUN-004 - Pregunta - <fecha>` |
| TC-FUN-005 | Referencia R04 | Consulta con gráfico de barras (puede no guardarse) |
| TC-FUN-006 | Una pregunta guardada (P3) | Dashboard `EJEC - TC-FUN-006 - Dashboard - <fecha>` |
| TC-FUN-007 | **El dashboard creado en TC-FUN-006** | El filtro de categoría (se configura como parte del caso) |
| TC-FUN-008 | La pregunta de TC-FUN-004 | Colección `EJEC - TC-FUN-008 - Coleccion - <fecha>` y el traslado de la pregunta |
| TC-FUN-009 | `QA - Dashboard Principal` (ID local) | — |
| TC-FUN-010 | `QA - Pedidos con subtotal mayor a 100` (ID local) | — |
| TC-VAL-005 | Comprobar que no existe `Análisis de ventas & costos (2026)` | Pregunta con ese nombre exacto |

TC-FUN-007 se ejecuta sobre el dashboard creado en TC-FUN-006, **no** sobre `QA - Dashboard Principal`. El dashboard principal ya tiene el filtro configurado y el caso exige *configurarlo*; con el de referencia no se podría observar la configuración.

---

## 7. Registrar los IDs de su instalación

Con Metabase en ejecución:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\obtener-ids-recursos.ps1 -Guardar -Integrante "<su nombre>"
```

- Usa la cuenta `admin` definida en `.env` (`QA_ADMIN_EMAIL` / `QA_ADMIN_PASSWORD`, ver [AUTENTICACION-QA.md](AUTENTICACION-QA.md)). No muestra ni guarda la contraseña. Solo consulta: no crea ni modifica recursos.
- Debe mostrar `[OK]` para Sample Database, `QA - Metabase`, `QA - Restringida`, `QA - Dashboard Principal`, `QA - Dashboard Restringido` y las 5 preguntas. También lista las tablas de Sample Database.
- `[FALTA]` → el recurso no existe o su nombre no coincide **exactamente** (tildes, mayúsculas, espacios).
- `[DUPLICADO]` → hay dos recursos con el mismo nombre. Envíe el sobrante a la papelera y repita.
- Crea `configuracion/recursos-locales.json`, que no se versiona. Use esos IDs en su entorno local de Postman ([CONFIGURACION-QA.md §6](CONFIGURACION-QA.md#6-configuración-local-de-identificadores-ids)).
- El script sugiere un ID de dashboard inexistente para TC-ERR-001. Confírmelo antes de usarlo y regístrelo en `ids_inexistentes_verificados`.
- La colección `Examples` y sus recursos aparecen en las respuestas de la API, pero el script no los cuenta: busca solo los nombres `QA - ...`.

---

## 8. Comprobación de equivalencia entre instalaciones

Al terminar, **cada integrante** completa esta lista en su instalación y la guarda como `reportes-generales/evidencias-ambiente/equivalencia_<integrante>_<AAAAMMDD>.md`. Luego ambos comparan sus listas.

Esto incluye a Juan: la definición de este documento es la referencia, y su instalación también debe ajustarse a ella. Si su instalación ya tenía recursos creados de otra forma, corríjalos en ella.

| # | Comprobación | Resultado esperado |
|---|---|---|
| 1 | Versión (`scripts/verificar-ambiente.ps1`) | `v0.64.1` |
| 2 | Ajustes de la instancia ([CONFIGURACION-QA.md §8](CONFIGURACION-QA.md#8-ajustes-de-la-instancia-que-deben-coincidir)) | Iguales en ambas instalaciones |
| 3 | Valores R01–R06 | Iguales en ambas; R06 = 0 |
| 4 | Usuarios | 1 administrador y 1 usuario normal **Usuario QA** (solo en *Todos los usuarios*), además de los que ya existieran, que deben anotarse. Ambas cuentas configuradas en `.env` y comprobadas con `scripts/probar-cuentas.ps1` ([AUTENTICACION-QA.md §2](AUTENTICACION-QA.md#2-configurar-el-env-una-vez-por-equipo)) |
| 5 | Permisos de datos de *Todos los usuarios* sobre Sample Database | Puede ver / Constructor de consultas y nativo |
| 6 | Permisos de colección de *Todos los usuarios* | `QA - Metabase`: Ver; `QA - Restringida`: Sin acceso |
| 7 | `obtener-ids-recursos.ps1` | Todo `[OK]`, sin `[FALTA]` ni `[DUPLICADO]` |
| 8 | Las 5 preguntas | Mismo nombre, tabla, filtro o resumen y visualización que §4.3 |
| 9 | `QA - Dashboard Principal` | 3 tarjetas en el orden y la distribución de §5.1; filtro `Categoría` (Texto o categoría, Es, Varios valores, Lista desplegable, sin valor predeterminado) vinculado a `Category` en las 3; aplicar filtros automáticamente activado |
| 10 | `QA - Dashboard Restringido` | En `QA - Restringida`, con `QA - Conteo de pedidos` |
| 11 | Restricción con el usuario normal (§5.3) | Sin acceso a `QA - Restringida` ni a su dashboard |
| 12 | Colección `Examples` | Presente y sin modificar |
| 13 | Respaldo del volumen | Creado después de terminar la preparación |

Cualquier diferencia se corrige **antes** de ejecutar casos, o se registra como diferencia de ambiente si no puede corregirse.
