// Sólo sirve archivos estáticos. Sin API, base de datos ni lógica de aplicación en servidor.
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,relative,extname,isAbsolute} from 'node:path';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const port=Number(process.env.ATLAS_PORT||4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const server=createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  const requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const path=resolve(root,'.'+requested);const rel=relative(root,path);
  if(rel.startsWith('..')||isAbsolute(rel)){res.writeHead(403);res.end('Acceso no permitido');return;}
  const file=(await stat(path)).isDirectory()?resolve(path,'index.html'):path;
  const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Archivo no encontrado');}
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`El puerto ${port} está ocupado. Usa ATLAS_PORT para elegir otro.`:error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`Atlas parlamentario · http://localhost:${port}\nRaíz estática: ${root}`));
