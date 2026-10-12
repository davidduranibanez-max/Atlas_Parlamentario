// Usa la misma ruta en la compilación y en la vista previa de GitHub Pages.
// El comando habitual de compilación conserva la raíz del servidor local.
process.env.ATLAS_BASE='/Atlas_Parlamentario/';
await import('./astro.mjs');
