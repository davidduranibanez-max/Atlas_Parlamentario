# Atlas Parlamentario de Bolivia

Atlas estático para explorar las bancadas y los parlamentarios de Bolivia entre 1982 y 2026. Incluye filtros por año, cámara, departamento, bancada y condición, fichas individuales y plantillas históricas de ambas cámaras.

La página está en **Página web** y está construida con Astro. **Investigación electoral** contiene las referencias, datos electorales y metodología. Los datos originales permanecen en la base documental local; el sitio utiliza sus copias exportadas.

## Desarrollo

Se requiere Node.js >=22.13. Desde la carpeta `Página web`:

```bash
npm ci
npm run dev
```

Para generar la versión estática:

```bash
npm run build
npm start
```

La salida está en `Página web/dist`. El servidor local abre http://localhost:4173. Las dependencias deben instalarse para el sistema donde se compile; los archivos estáticos compilados pueden servirse en Windows o Linux.

## Datos y verificación

Consulta [la documentación de la página](Página%20web/README.md) y [las comprobaciones realizadas](Página%20web/VERIFICACION.md). La línea de sucesos políticos está reservada en la interfaz y todavía no contiene eventos.

## Versión pública

Esta copia omite los números de CI de las nóminas históricas. No incluye los PDF fuente descargados; conserva sus referencias y enlaces. Los originales completos y su historial se mantienen en el proyecto local.
