import points from './recintos-puntos.json' with {type:'json'};
// Esquemas de distribución, sin medidas arquitectónicas ni ubicación personal histórica.
export const VENUE_SOURCES={
 referencia27:'https://es.wikipedia.org/wiki/Elecciones_generales_de_Bolivia_de_2005',
 referencia:'https://es.wikipedia.org/wiki/Elecciones_generales_de_Bolivia_de_2014',
 traslado:'https://diputados.gob.bo/noticias/presidente-de-diputados-nuevo-edificio-de-la-alp-representa-la-transformacion-del-estado-republicano-al-estado-plurinacional/',
 ultimaSesion:'https://diputados.gob.bo/noticias/diputados-desarrollan-ultima-sesion-plenaria-en-el-historico-hemiciclo-de-la-asamblea-legislativa-plurinacional/'
};
export function venueForYear(year){
 const historic=Number(year)<2021;
 return {id:historic?'antiguo':'actual',label:historic?'Antiguo Congreso Nacional':'Nuevo edificio legislativo',transition:Number(year)===2021};
}
// Coordenadas medidas de las referencias: sin curvas geométricas aproximadas.
export function historicSeatPositions(chamber,total){
 const raw=points[chamber==='Diputados'?'Diputados':total===27?'Senadores27':'Senadores'];
 return raw.map(([x,y,row,wing])=>({x,y,row,wing}));
}
export function historicRows(chamber,total){
 const slots=historicSeatPositions(chamber,total);
 return Array.from({length:Math.max(...slots.map(p=>p.row))+1},(_,row)=>slots.filter(p=>p.row===row).length);
}
export function planForVenue(chamber,total,venue){
 const base=`./assets/template/plano-${chamber.toLowerCase()}`;
 return venue==='antiguo'?`${base}-antiguo${chamber==='Senadores'?`-${total}`:''}.svg`:`${base}.svg`;
}
