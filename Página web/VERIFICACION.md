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
