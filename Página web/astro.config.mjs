import {defineConfig} from 'astro/config';
export default defineConfig({
 output:'static',
 site:'https://davidduranibanez-max.github.io',
 base:process.env.ATLAS_BASE||'/',
 trailingSlash:'always',
 server:{host:'127.0.0.1',port:4321},
 devToolbar:{enabled:false},
 vite:{build:{cssMinify:true,minify:true}},
});
