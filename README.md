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

## Publicación con GitHub Pages

En el repositorio, abre **Settings → Pages → Build and deployment** y selecciona **GitHub Actions** como **Source**. Esto sustituye la compilación automática con Jekyll, que no puede interpretar los componentes de Astro. Este ajuste se realiza una vez en GitHub; el pull request por sí solo no cambia esa opción.

El archivo `.github/workflows/github-pages.yml` instala las dependencias y compila Astro con Node 24 desde `Página web`. Comprueba los pull requests sin desplegarlos. Al integrar los cambios en `main`, publica únicamente la salida estática `dist` en:

https://davidduranibanez-max.github.io/Atlas_Parlamentario/

Para comprobar esa misma ruta localmente, desde `Página web`:

```bash
npm run build:pages
npm run preview:pages
```

Abre http://localhost:4174/Atlas_Parlamentario/. Los comandos habituales `npm run build` y `npm start` mantienen el uso local en la raíz. Ejecuta de nuevo `npm run build` antes de usar `npm start` si la última compilación fue para Pages.

El despliegue sigue la [guía oficial de Astro para GitHub Pages](https://docs.astro.build/en/guides/deploy/github/).

## Datos y verificación

Consulta [la documentación de la página](Página%20web/README.md) y [las comprobaciones realizadas](Página%20web/VERIFICACION.md). La línea de sucesos políticos está reservada en la interfaz y todavía no contiene eventos.

## Versión pública

Esta copia omite los números de CI de las nóminas históricas. No incluye los PDF fuente descargados; conserva sus referencias y enlaces. Los originales completos y su historial se mantienen en el proyecto local.
