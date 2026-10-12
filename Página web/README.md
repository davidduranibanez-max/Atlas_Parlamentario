# Atlas parlamentario con Astro

Sitio local del proyecto Atlas Parlamentario. Astro genera una página estática; los hemiciclos iniciales ya vienen en el HTML y las interacciones usan JavaScript nativo. La carpeta `dist` contiene toda la página: HTML, estilos, JavaScript y JSON. Puede alojarse directamente en cualquier servidor de archivos estáticos. No utiliza API, cuentas ni un servicio de base de datos en tiempo de consulta.

## Abrir

El servidor de esta sesión está disponible en http://localhost:4173.

Para iniciarlo después, abre `Iniciar atlas.cmd` en Windows o ejecuta `npm start` desde esta carpeta. Ambos sirven la versión ya compilada en el puerto 4173. Se requiere Node instalado. Cierra el servidor de esa sesión con Ctrl+C. El puerto predeterminado es 4173; la variable `ATLAS_PORT` permite elegir otro.

## Procedencia

- Nóminas: `E:\Exsecutor000\Bases de datos\Asamblea Legislativa\parlamentarios_AAAA_AAAA.csv`.
- Enriquecimiento de fichas 2025–2030: base SQLite de sólo lectura en `ALP 2025_2030` dentro de esa carpeta.
- Normas, asignaciones electorales y referencias anuales: investigación electoral ya preparada en este proyecto.
- Plantilla visual: copias de los estilos y planos del simulador en `D:\Codex trabajo\Asamblea Legislativa\web`. Las copias están en `public/assets/template` y se incluyen en `dist/assets/template`; los originales permanecen intactos.

La exportación utiliza los archivos por legislatura porque pueden estar más actualizados que el consolidado. Conserva los 2.261 registros originales, incluidas incidencias, sin sustituir siglas por conjeturas. Incorpora 310 fichas del portal cuando hay una coincidencia única de nombre, cámara, departamento y condición. Las fotografías son referencias remotas publicadas en esa base; su disponibilidad depende del portal y la ficha muestra iniciales si no cargan.

## Uso

El año se selecciona en el filtro superior. Cámara, departamento, bancada, condición y búsqueda se combinan. La búsqueda admite nombres sin tildes. Los puntos representan titulares y conservan su posición al filtrar; los suplentes se consultan en el directorio y en las parejas que la fuente identifica de forma unívoca.

El directorio y la ficha completa son desplegables. La ficha aparece a la derecha del hemiciclo en escritorio y encima en celulares; se abre al seleccionar un escaño o una persona del directorio. Sus bancadas y las secciones adicionales de cada ficha son desplegables. Los hemiciclos se mantienen uno debajo del otro. Seleccionar un escaño o una fila abre la ficha. Incluye campos originales, procedencia, observaciones y, cuando existe un enlace comprobado en la base, comisión, comité, cargo, perfil y actividad individual observada. Las fichas completas pueden descargarse como JSON.

Los hemiciclos reflejan las siglas de la nómina, mientras que la tabla del sistema electoral conserva la asignación oficial. Sus diferencias se presentan explícitamente. Ninguna de estas vistas reconstruye los cambios posteriores de bancada de cada año.

Los colores documentados usan tonos representativos de pantalla; los colores históricos sin referencia comprobada se identifican como colores de referencia en la ficha. Una coalición no se declara idéntica a uno de sus integrantes por compartir un tono.

## Plantillas del antiguo Congreso

Los años 1982–2020 usan los esquemas históricos: Diputados en arco con 130 escaños y Senado en dos bloques alargados con variantes de 27 y 36 escaños. Los centros de los 130 y 36 puntos se midieron directamente de la captura del [esquema electoral de 2014](https://es.wikipedia.org/wiki/Elecciones_generales_de_Bolivia_de_2014), manteniendo las proporciones con una escala uniforme y la paleta y trazos del template del simulador. Diputados conserva sus ocho filas de distintos largos; Senado, las cuatro columnas curvas con nueve puntos cada una. La variante de 27 escaños se midió por separado del [diagrama de 2005](https://es.wikipedia.org/wiki/Elecciones_generales_de_Bolivia_de_2005). Las mediciones están en `verificacion/medicion_referencia_historica.json` y `verificacion/medicion_senado_27.json`. Son esquemas de distribución; no son planos arquitectónicos ni asignan posiciones personales históricas.

Desde 2021 se muestra el edificio nuevo. El año 2021 incluye un aviso del traslado del 2 de agosto, porque ambas sedes se usaron durante ese año. La fecha está documentada por la [Cámara de Diputados](https://diputados.gob.bo/noticias/presidente-de-diputados-nuevo-edificio-de-la-alp-representa-la-transformacion-del-estado-republicano-al-estado-plurinacional/). Se elige la plantilla según el año consultado, incluso dentro de la misma gestión 2020–2025. Los SVG nuevos están en `public/assets/template`, y se regeneran con `node scripts/generar_planos_historicos.mjs`. La geometría de fondo y los puntos interactivos se calculan con las mismas funciones. Los SVG originales del simulador se conservan intactos.

## Línea de tiempo

La interfaz reserva una única línea: **Sucesos políticos e hitos**, sin fechas ni sucesos. El botón **Cambiar línea** está preparado para futuras opciones. La configuración está en `public/data/lineas_tiempo.json`; su lista de sucesos permanece vacía. No se han creado otras categorías.

## Actualizar la copia de datos

Ejecuta `python scripts/exportar_datos.py` desde esta carpeta, o `python3 scripts/exportar_datos.py` en WSL. El script sólo lee la fuente y actualiza los JSON en `public/data`. Después ejecuta `npm run build` para regenerar `dist`. La nómina contiene referencias a 310 JSON de fichas extensas; cada ficha se descarga únicamente cuando se selecciona su registro. No modifica los CSV, la base SQLite ni los documentos originales. Acepta `--origen` para indicar otra ubicación de la misma estructura. La configuración de líneas de tiempo no se sobrescribe.

## Desarrollo y compilación

- `npm run dev`: Astro en http://localhost:4321, con recarga de cambios.
- `npm run build`: genera `dist`, sin servidor de aplicación ni base de datos en producción.
- `npm start`: sirve `dist` en http://localhost:4173.
- `npm run preview`: vista previa de Astro en http://localhost:4174.

La estructura está separada en componentes `.astro`, estilos, módulos de datos y el cliente de interacción. El código propio y los JSON se conservan como fuentes; `dist` es una salida regenerable. La compilación usa Astro 7.3.7 y Node >=22.13. Las dependencias de esta carpeta se instalaron para Linux/WSL; deben compilarse con Node Linux. El archivo `Iniciar atlas.cmd` puede servir los archivos ya compilados con Node Windows porque el servidor de archivos utiliza sólo módulos estándar. Las dependencias del simulador de Windows permanecen intactas.

## Verificación

- `npm test`: comprobaciones de referencias anuales, geometría, filtros, incidencias y evidencia de las fichas.
- `tests/navegador.mjs`: recorrido en Playwright usando el navegador instalado en este equipo. Las rutas de las herramientas pueden configurarse con `ATLAS_PLAYWRIGHT` y `ATLAS_CHROME`.
- `VERIFICACION.md`: resultados y límites de las pruebas.
- `dist/data/control_calidad.json`: cobertura, diferencias de conteos y huellas de las fuentes.
