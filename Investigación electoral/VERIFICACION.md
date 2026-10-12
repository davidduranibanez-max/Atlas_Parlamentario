# Registro de comprobación

Fecha: 11 de octubre de 2026.

## Componentes y criterio

Se crearon archivos nuevos de investigación: informe, fichas de gestión, referencias anuales, tablas y gráficos. Las referencias anuales dependen de las fichas; las fichas dependen de los resultados y normas oficiales. El principal riesgo es confundir elección, inicio de mandato y composición efectiva posterior. La plantilla conserva estos conceptos por separado y registra las excepciones.

## Pruebas ejecutadas y resultado

- Lectura válida de los 59 archivos JSON de datos.
- Consulta real de los 45 años, desde 1982 hasta 2026, con el mismo lector disponible para integrar la futura página.
- Comprobación específica de los años de transición, incluidos 1982, 2005–2006, 2009–2010, 2014–2015 y 2019–2020.
- Suma de los escaños por organización, departamento y tipo en las 11 gestiones: 130 diputados y 27 o 36 senadores según el régimen.
- Comprobación de las 99 filas departamentales, de ambas tablas CSV y de los identificadores de fuentes.
- Presencia de los 11 PNG y lectura de los 11 SVG; inspección visual de los esquemas de 1982–1985 y 2025–2030.
- Cotejo del reparto de 2025 con las tablas oficiales de titulares y suplentes: 36 senadores, 63 diputados uninominales, 60 plurinominales y 7 especiales.
- Comprobación de las huellas SHA-256 de las copias de fuentes descargadas, sin modificar los originales.
- Ejecución normal en Bash/WSL del verificador y de la consulta de 2026: ambas completadas correctamente.

El verificador se conserva en `verificar_atlas.py`; la consulta está en `consultar_atlas.py`. Ambos usan rutas relativas a su propia ubicación y no requieren bibliotecas externas.

## Alcance pendiente de verificación

La composición efectiva de bancadas de cada año no se ha reconstruido. Los gráficos presentan la asignación electoral inicial; no prueban permanencia, cambios de bancada o vacancias posteriores. Las referencias anuales declaran esta limitación explícitamente.

Los datos están preparados para una futura página, pero esta entrega no incluye la construcción ni una prueba de navegación de esa página. No contiene cartografía de circunscripciones históricas: los mapas entregados son esquemas de escaños. La ejecución nativa en Windows no fue comprobada; la lectura de archivos y las consultas fueron verificadas en WSL con las herramientas normales del chat.
