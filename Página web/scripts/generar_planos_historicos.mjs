// Genera SVG nativos usando el mismo sistema visual y la geometría interactiva.
import {readFile,writeFile} from 'node:fs/promises';
import {historicRows,historicSeatPositions,VENUE_SOURCES} from '../src/lib/recintos.js';
const root=new URL('../public/assets/template/',import.meta.url);
const current=await readFile(new URL('plano-diputados.svg',root),'utf8');
const style=current.match(/<style>([\s\S]*?)<\/style>/)[1];
const n=v=>v.toFixed(3);
for(const [chamber,total,file] of [
 ['Diputados',130,'plano-diputados-antiguo.svg'],
 ['Senadores',27,'plano-senadores-antiguo-27.svg'],
 ['Senadores',36,'plano-senadores-antiguo-36.svg']
]){
 const senate=chamber==='Senadores';
 const seats=historicSeatPositions(chamber,total);
 const paths=historicRows(chamber,total).flatMap((count,row)=>[0,1].map(wing=>{
  const points=seats.filter(p=>p.row===row&&p.wing===wing).sort((a,b)=>senate?a.y-b.y:a.x-b.x);
  let d=`M ${n(points[0].x)} ${n(points[0].y)}`;
  for(let i=0;i<points.length-1;i++){
   const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],z=points[Math.min(points.length-1,i+2)];
   d+=` C ${n(b.x+(c.x-a.x)/6)} ${n(b.y+(c.y-a.y)/6)} ${n(c.x-(z.x-b.x)/6)} ${n(c.y-(z.y-b.y)/6)} ${n(c.x)} ${n(c.y)}`;
  }
  return `<g><path class="plan-desk-surface" d="${d}"/><path class="plan-desk-edge" d="${d}"/></g>`;
 })).join('\n');
 const stage=senate?
 '<path d="M 420 35 H 580 V 83 H 420 Z"/><path class="plan-presidium" d="M 432 49 H 568 V 65 H 432 Z"/><path d="M 429 97 H 571 M 440 109 H 560"/><rect x="484" y="136" width="32" height="26" rx="4"/>':
 '<path d="M 355 596 H 645 V 632 H 355 Z"/><path class="plan-presidium" d="M 371 608 H 629 V 620 H 371 Z"/><path d="M 372 584 H 628 M 390 572 H 610"/><rect x="484" y="542" width="32" height="26" rx="4"/>';
 const perimeter='';
 const aisles=senate?'<path d="M 470 190 V 587 M 530 190 V 587"/>':'<path d="M 480 55 V 510 M 520 55 V 510"/>';
 const labels=senate?'<text x="500" y="24" text-anchor="middle">MESA DIRECTIVA</text><text x="500" y="332" text-anchor="middle">SENADO</text>':'<text x="500" y="649" text-anchor="middle">MESA DIRECTIVA</text>';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="660" viewBox="0 0 1000 660" class="hemicycle-plan ${senate?'plan-senate':'plan-deputies'} plan-historic" role="img" aria-labelledby="historic-title" focusable="false">
<title id="historic-title">Antiguo Congreso Nacional · ${chamber} · ${total} escaños</title>
<desc>Distribución de puntos medida de la referencia electoral de ${senate&&total===27?2005:2014}, conservando sus proporciones y el estilo del atlas. Sin medidas arquitectónicas ni asignaciones personales de asiento.</desc>
<style>${style}</style>
${perimeter}
<g class="plan-stage">${stage}</g>
<g class="plan-desks">${paths}</g>
<g class="plan-aisles">${aisles}</g>
<g class="plan-labels">${labels}</g>
</svg>\n`;
 await writeFile(new URL(file,root),svg);
 console.log(file,total,'escaños');
}
await writeFile(new URL('../public/data/recintos.json',import.meta.url),JSON.stringify({criterio:'Sede antigua hasta 2020; 2021 muestra la sede nueva con aviso explícito del traslado en agosto. No representa una sede única para todo ese año.',referencia_visual:VENUE_SOURCES.referencia,referencia_senado27:VENUE_SOURCES.referencia27,metodo:'Coordenadas medidas de cada diagrama; escala uniforme, sin reconstruir con elipses.',fuentes_traslado:[VENUE_SOURCES.traslado,VENUE_SOURCES.ultimaSesion],alcance:'Esquemas gráficos, sin medidas arquitectónicas ni posiciones históricas individuales.',variantes:['Diputados: 130','Senadores: 27','Senadores: 36']},null,2)+'\n');
