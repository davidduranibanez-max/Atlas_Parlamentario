# Verificación del atlas con Astro

Fecha: 11 de octubre de 2026. Registro del recorrido final: `verificacion/pruebas_navegador.json`.

## Componentes, dependencias y riesgos

Los cambios afectan sólo a Página web de Atlas Parlamentario: componentes Astro, CSS, JavaScript de filtros y fichas, exportación de JSON, geometría y plantillas SVG. La producción continúa siendo un conjunto de archivos estáticos. El servidor local sigue sirviendo `dist` en el puerto 4173; no se reiniciaron aplicaciones, Windows ni WSL.

Se separó la actividad extensa en 310 fichas de carga individual. Se revisó que descargar una ficha conserve tanto los campos de la nómina como sus datos adicionales. Los hemiciclos iniciales se generan en HTML; los filtros mantienen la identidad de los asientos. El directorio completo, cada bancada y la ficha son desplegables. La ficha está a la derecha del hemiciclo en escritorio y encima en celulares; ambas cámaras permanecen una debajo de la otra.

Las nuevas plantillas históricas mantienen la paleta, tipografía y trazos del simulador. Hay tres SVG: Diputados de 130 escaños, Senado de 27 y Senado de 36. Fondo y puntos interactivos comparten geometría. Sus puntos se midieron directamente de la referencia de 2014 para Diputados y Senado de 36, y de la referencia de 2005 para Senado de 27, sin medidas arquitectónicas ni asignaciones históricas personales de asiento. Los años hasta 2020 utilizan la sede antigua; 2021 muestra la nueva y avisa del traslado de agosto. Cambiar de 2020 a 2021 actualiza la plantilla aunque la nómina de gestión sea la misma. Fuentes y criterio en `public/data/recintos.json`.

La compilación y dependencias de Astro son Linux/WSL. Las dependencias de Windows del simulador no se ejecutaron con Node Linux ni se reemplazaron. El iniciador de Windows sirve únicamente los archivos compilados con módulos estándar. La copia anterior del sitio se conserva en `verificacion/respaldo_estatico_antes_astro.tar.gz`.

## Pruebas ejecutadas y resultados

- Compilación estática de Astro con las herramientas normales del chat: correcta, una página generada. Sintaxis de módulos: correcta.
- Diez comprobaciones de datos y geometría con Node Linux, también ejecutadas directamente para mostrar cada resultado: diez correctas. Incluyen 45 años, 11 nóminas, 2.261 registros, filtros, 310 fichas separadas, fuentes, incidencias, colores, capacidades históricas, una línea de tiempo vacía y fidelidad a las mediciones: ocho filas exactas de Diputados, cuatro columnas de nueve puntos del Senado de 36 y escala uniforme con desviación menor a 0,01 píxel de referencia. Los diagramas iniciales de siete arcos se sustituyeron por estas coordenadas medidas.
- Huellas SHA-256 de 15 fuentes de datos y cinco archivos originales del template, comparadas también con sus copias: correctas. No se modificaron originales ni recursos de otros proyectos.
- Recorrido real en Chromium de Windows: filtros combinados, búsquedas, 45 años, selección de personas, campos originales, descarga completa, suplentes, desplegables y tema persistente correctos.
- Plantillas por año y cambio de sede de 2021: correctos. Las variantes históricas permiten seleccionar personas y no desbordan a 320, 390, 768 y 1440 px.
- Diseño actual: 16 tamaños entre 320 y 2560 px, incluida una pantalla horizontal de 844 × 390. Sin desbordamiento horizontal; cabecera de 44–48 px; ficha limitada a la altura disponible. Colocación a la derecha comprobada en todos los tamaños de escritorio.
- Navegación con JavaScript desactivado: los 166 escaños iniciales están en el HTML generado por Astro.
- Apertura inicial: ninguna solicitud de actividad extensa de fichas. Peso comparable de HTML, JS, CSS y JSON: 3,665,985 → 418,122 bytes sin compresión (88.6 % menos). El JSON de 2025 pasó de 3,465,679 a 271,141 bytes. Son medidas de tamaño; no garantizan tiempos en otras conexiones. Detalle en `verificacion/rendimiento_despues.json`.
- No se detectaron errores JavaScript ni recursos estáticos locales fallidos en el recorrido final. Los SVG históricos se abrieron con un analizador XML estándar. Las coordenadas se extrajeron con Pillow del runtime de Windows usando permisos específicos de interoperabilidad; la imagen del usuario permaneció intacta. Las tres variantes finales se inspeccionaron visualmente; se retiró una etiqueta interior que se superponía a los puntos de Diputados. Capturas de escritorio, móvil y recintos guardadas en `verificacion/` para inspección visual.

## Límites de la verificación

El sandbox bloquea apertura de puertos y conexiones de red normales (`EPERM`), comprobado en esta sesión. Servidor local y navegador requirieron permisos específicos de red/interoperabilidad; esas pruebas no demuestran ejecución de red dentro del sandbox restringido. Lecturas, exportación, compilación, comprobaciones de integridad y pruebas de lógica funcionaron con herramientas normales.

Se probaron tamaños representativos en Chromium; no se probaron físicamente todos los celulares ni Safari. No se verificó alojamiento externo ni ejecución dentro de otros chats. Las fotos remotas pueden faltar y tienen sustitución por iniciales. La actividad individual conserva cobertura parcial y fecha de captura. La distribución histórica es una representación de la nómina de origen; no reconstruye cambios de bancada año a año. La línea de sucesos políticos sigue vacía, tal como se pidió.

## Copia pública para GitHub

Se excluyeron 329 números de CI, los ocho PDF fuente y todo el historial privado. Las copias originales se conservan localmente. La cuenta se verificó por la API de GitHub como `davidduranibanez-max`. La copia pública compiló correctamente y pasó las diez pruebas de lógica; su recorrido en navegador incluye la ficha y descarga de 2010 sin CI. La exportación posterior conserva los nombres, cámaras, condiciones y bancadas y vuelve a retirar los números de CI. Los datos públicos conservan el formato JSON compacto.

## Configuración de GitHub Pages con Astro

Preparación local del 11 de octubre de 2026 en la copia pública. El registro de Actions `38192277689` falló en «Build with Jekyll» porque trató el código de `Explorer.astro` como YAML. Se añadió un workflow de Astro que compila desde `Página web`, comprueba los pull requests y despliega sólo desde `main`. Utiliza Node 24, el lockfile existente y publica la salida estática. El comando `build:pages` configura `/Atlas_Parlamentario/`; el comando de compilación habitual mantiene `/`. El icono también respeta la ruta de publicación.

Pruebas realizadas:

- `npm run build:pages`, `npm test` y las diez pruebas ejecutadas directamente: correctos con Node Linux y herramientas normales del chat.
- Workflow analizado con PyYAML: YAML válido; carpeta de compilación correcta; despliegue excluido para pull requests.
- Navegador en `http://localhost:4190/Atlas_Parlamentario/`: 28 comprobaciones correctas, 45 años, fichas y descargas, 16 tamaños de pantalla, HTML sin JavaScript, estilos, scripts e icono con respuesta 200 bajo la ruta de publicación. Sin errores JavaScript ni archivos estáticos fallidos. Resultado en `verificacion/pruebas_github_pages.json`.
- `npm run build` y el mismo recorrido en la raíz local `http://localhost:4191/`: correctos, 28 comprobaciones y 16 tamaños. Resultado en `verificacion/pruebas_local_despues_pages.json`. La salida local se dejó compilada para `/` y los servidores temporales de pruebas se cerraron.
- JSON públicos revisados: ningún campo CI contiene números. No se modificaron los datos ni los archivos del proyecto original.

Límites: la vista previa y el navegador requirieron permisos específicos porque el sandbox normal bloquea los puertos; las compilaciones y las pruebas de lógica funcionaron dentro del sandbox. El primer intento del navegador se realizó antes de que estuviera disponible el servidor y se repitió después de comprobar la respuesta HTTP. Sólo se probaron los servidores temporales de esta tarea; no se probaron otros chats. La ejecución de este nuevo workflow y el despliegue real en GitHub siguen pendientes de publicar e integrar el pull request. También debe seleccionarse **GitHub Actions** en **Settings → Pages → Source**; ese ajuste no se cambia mediante un archivo del repositorio. No se subieron cambios ni se modificaron los ajustes remotos.


## Reparación de la conexión de la carpeta principal

La carpeta habitual `Atlas Parlamentario` quedó en `main`, conectada con `origin/main` del repositorio público existente. Se conservó un respaldo verificado de 481 archivos originales y del historial anterior, incluido el commit local `c15b27f`, en `.respaldo-local/antes-conexion-github-main`. Los JSON activos son la versión sin CI y su exportador sigue retirando esas identificaciones. Los ocho PDF fuente mantienen sus rutas locales y están excluidos de Git. La copia pública auxiliar se archivó dentro del respaldo; ya no se necesita para sincronizar.

Se retiró únicamente el hook de bloqueo que se había creado en este proyecto. La selección local de cuenta sigue siendo `davidduranibanez-max`; las credenciales globales y otros proyectos no se modificaron. Se preservaron también las referencias internas de Codex y el historial anterior en el equipo. La rama que se envía normalmente es `main`, con la historia pública existente.

Pruebas: lectura y comprobaciones con herramientas normales de Bash; compilación estática y diez pruebas de lógica correctas en Linux. Git nativo de Windows ejecutó `pull --ff-only origin main` correctamente y `push --dry-run origin main` confirmó un avance normal, sin forzar cambios. El navegador recorrió la página de la carpeta principal en `localhost:4173`, con 28 comprobaciones, 45 años y 16 tamaños de pantalla; ficha y descarga histórica sin CI, sin errores JavaScript ni archivos fallidos. Registro: `verificacion/pruebas_conexion_main.json`. Se verificó que respaldo y PDF locales estén ignorados.

Límites: el directorio `.git` se presenta como sólo lectura en el sandbox Linux, por lo que las modificaciones de Git y las pruebas de red/interoperabilidad se realizaron con Git de Windows y permisos específicos; esto no prueba escritura de Git dentro del sandbox Linux. No se reiniciaron aplicaciones, Windows ni WSL ni se ejecutó un envío real. La revisión remota siguió siendo `b7788c694128d2a8af35f4c926dcdad1971855dd`. El envío real y el nuevo despliegue de Actions quedan a cargo del usuario; no se probaron otros chats.
