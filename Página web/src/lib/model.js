import {historicSeatPositions} from './recintos.js';
import { partyKey, partyInfo } from './partidos.js';
export function normalize(value=''){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
export function escape(value=''){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function displayName(person){return person.es_persona?person.nombre_completo:(person.nombre_fuente||person.estado_registro||'Nombre no consignado');}
export function safeURL(url){try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}}
export function filterPeople(people, filters){
 const search=normalize(filters.query.trim());
 return people.filter(p=>(!filters.chamber||p.camara===filters.chamber)&&(!filters.condition||p.condicion===filters.condition)&&(!filters.department||p.departamento===filters.department)&&(!filters.party||(filters.party==='__sin_bancada__'?!p.partido_sigla:partyKey(p.partido_sigla)===filters.party))&&(!search||normalize([displayName(p),p.partido_sigla,p.partido_nombre,p.departamento,p.circunscripcion].join(' ')).includes(search)));
}
export function groupParties(people,election){
 const result=new Map();
 for(const person of people){const info=partyInfo(person.partido_sigla,election);const key=info.key; if(!result.has(key))result.set(key,{...info,members:[]});result.get(key).members.push(person);}
 return [...result.values()].sort((a,b)=>b.members.length-a.members.length||a.label.localeCompare(b.label,'es'));
}
// Geometría adaptada de la plantilla del simulador. Mantiene grupos contiguos por bancada.
export function seatPositions(chamber,total,venue='actual'){
 if(venue==='antiguo')return historicSeatPositions(chamber,total);
 const senate=chamber==='Senadores';const rows=senate?(total===27?[13,14]:[16,20]):[14,16,18,18,20,22,22];
 const center={x:500,y:senate?205:143};const inner={x:senate?290:224,y:senate?230:216};const outer={x:senate?450:472,y:senate?390:475};
 const slots=[];
 rows.forEach((count,row)=>{
  const progress=row/(rows.length-1);const rx=inner.x+(outer.x-inner.x)*progress;const ry=inner.y+(outer.y-inner.y)*progress;
  const gap=Math.asin((senate?48:30)/rx);const segments=[[0,Math.PI/2-gap],[Math.PI/2+gap,Math.PI]];
  segments.forEach(([start,end],wing)=>{
   const n=wing===0?Math.ceil(count/2):Math.floor(count/2);const inset=senate?.07:.035;
   for(let i=0;i<n;i++){const a=start+inset+(end-start-inset*2)*i/Math.max(1,n-1);slots.push({x:center.x+Math.cos(a)*rx,y:center.y+Math.sin(a)*ry,row});}
  });
 });
 return slots.sort((a,b)=>a.x-b.x||a.y-b.y||a.row-b.row);
}
export function periodForYear(manifest,year){const ref=manifest.anios.find(a=>a.anio===Number(year));return manifest.gestiones.find(g=>g.id===ref?.gestion_referencia_id);}
