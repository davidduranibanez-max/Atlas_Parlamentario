// Usa la autorización de Git de Windows; nunca guarda ni imprime credenciales.
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const owner='davidduranibanez-max',name='Atlas_Parlamentario';
const remote=`https://github.com/${owner}/${name}.git`;
const git=process.platform==='win32'?'C:/Program Files/Git/cmd/git.exe':'git';
const env={...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'never',GIT_OPTIONAL_LOCKS:'0'};
const run=(args,options={})=>execFileSync(git,['-C',root,...args],{encoding:'utf8',env,...options});
try{
 if(!existsSync(join(root,'.publicacion-limpia.json')))throw new Error('Publica desde la carpeta Publicación GitHub, que conserva una copia sin CI y un historial independiente.');
 const approval=JSON.parse(readFileSync(join(root,'.publicacion-limpia.json'),'utf8'));
 if(approval.cuenta!==owner||approval.ci_excluidos!==true)throw new Error('La copia no coincide con la publicación autorizada.');
 for(const file of readdirSync(join(root,'Página web/public/data/gestiones'))){
  if(!file.endsWith('.json'))continue;
  const data=JSON.parse(readFileSync(join(root,'Página web/public/data/gestiones',file),'utf8'));
  if(data.personas.some(p=>/\d/.test(String(p.ci||''))))throw new Error('La copia todavía contiene números de CI. No se publicará.');
 }
 let credential;
 try{credential=run(['credential','fill'],{input:`protocol=https\nhost=github.com\nusername=${owner}\n\n`,stdio:['pipe','pipe','pipe']});}
 catch{throw new Error(`Falta autorizar ${owner} en Git de Windows. Ejecuta: git credential-manager github login --username ${owner} --browser`);}
 const fields=Object.fromEntries(credential.trim().split(/\r?\n/).map(line=>{const pos=line.indexOf('=');return [line.slice(0,pos),line.slice(pos+1)];}));
 credential='';
 if(!fields.password)throw new Error('Git no proporcionó una autorización válida.');
 const headers={Accept:'application/vnd.github+json',Authorization:`Bearer ${fields.password}`,'X-GitHub-Api-Version':'2026-03-10','User-Agent':'Atlas-Parlamentario'};
 const api=async(path,options={})=>{
  const response=await fetch(`https://api.github.com${path}`,{...options,headers:{...headers,...options.headers},signal:AbortSignal.timeout(30000)});
  const data=await response.json();return {status:response.status,data};
 };
 const profile=await api('/user');
 if(profile.status!==200)throw new Error(`GitHub no aceptó la autorización (HTTP ${profile.status}).`);
 if(profile.data.login!==owner)throw new Error(`La autorización corresponde a ${profile.data.login}, no a ${owner}. No se publicará.`);
 console.log(`Cuenta verificada: ${owner}`);
 let repository=await api(`/repos/${owner}/${name}`);
 if(process.argv.includes('--verificar')){
  console.log(repository.status===200?`Repositorio accesible: ${repository.data.html_url}`:`Estado del destino: HTTP ${repository.status}`);
  process.exit(repository.status===200?0:2);
 }
 if(repository.status===404){
  repository=await api('/user/repos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,description:'Atlas parlamentario de Bolivia, 1982–2026. Sitio estático con Astro.',private:false,auto_init:false})});
  if(repository.status!==201)throw new Error(`No se pudo crear el repositorio (HTTP ${repository.status}): ${repository.data.message||'Error de GitHub'}`);
  console.log(`Repositorio público creado: ${repository.data.html_url}`);
 }else if(repository.status!==200){throw new Error(`No se pudo consultar el repositorio (HTTP ${repository.status}).`);}
 if(repository.data.private)throw new Error('El destino existente es privado. No se cambiará su visibilidad automáticamente.');
 const status=run(['status','--porcelain']).trim();
 if(status)throw new Error('Hay cambios locales sin guardar en un commit. Revísalos antes de publicar.');
 run(['remote','set-url','origin',remote]);
 run(['push','--set-upstream','origin','main'],{stdio:'inherit',env:{...env,GIT_OPTIONAL_LOCKS:'1'}});
 const local=run(['rev-parse','HEAD']).trim();
 const head=run(['ls-remote','origin','refs/heads/main']).trim().split(/\s+/)[0];
 if(local!==head)throw new Error('La revisión remota no coincide con la local; publicación pendiente de verificar.');
 console.log(`Publicación verificada: ${repository.data.html_url}\nRevisión: ${local}`);
}catch(error){console.error(error.message);process.exitCode=1;}
