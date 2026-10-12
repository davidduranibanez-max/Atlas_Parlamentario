import {venueForYear,planForVenue,VENUE_SOURCES} from './recintos.js';
import {partyInfo} from './partidos.js';
import {escape as e,displayName,groupParties,seatPositions,filterPeople} from './model.js';
export function chamberMarkup(data,filters,selected='',year=2026){
 const venue=venueForYear(year);
 const ids=new Set(filterPeople(data.personas,filters).map(p=>p.id));
 const chamberHTML=[];
 for(const chamber of ['Diputados','Senadores']){
  if(filters.chamber&&filters.chamber!==chamber)continue;
  const source=data.personas.filter(p=>p.camara===chamber&&p.condicion==='Titular');
  const groups=groupParties(source,data.gestion.eleccion_origen.anio);const ordered=groups.flatMap(p=>[...p.members].sort((a,b)=>displayName(a).localeCompare(displayName(b),'es')));
  const positions=seatPositions(chamber,source.length,venue.id);const matched=source.filter(p=>ids.has(p.id));
  const legend=groups.map(p=>`<button type="button" data-party="${e(p.key||'__sin_bancada__')}" aria-pressed="${filters.party===(p.key||'__sin_bancada__')}" title="Filtrar ${e(p.label)}" style="--party-color:${p.color}"><i aria-hidden="true"></i><strong>${p.members.length}</strong>${e(p.label)}</button>`).join('');
  const points=ordered.map((p,i)=>{const position=positions[i];const info=partyInfo(p.partido_sigla,data.gestion.eleccion_origen.anio);const muted=!ids.has(p.id);return `<button type="button" class="atlas-seat ${chamber==='Senadores'?'senator':''} ${muted?'is-muted':''} ${!p.es_persona||p.estado_registro!=='Válido'?'has-issue':''}" data-person="${e(p.id)}" style="--seat-x:${position.x/10}%;--seat-y:${position.y/6.6}%;--party-color:${info.color}" aria-label="${e(displayName(p))}, ${e(info.label)}, ${e(p.departamento)}" aria-pressed="${selected===p.id}" ${muted?'disabled tabindex="-1"':''}></button>`;}).join('');
  chamberHTML.push(`<section class="atlas-chamber" data-venue="${venue.id}" aria-labelledby="title-${chamber}"><div class="module-heading"><div><p>HEMICICLO · TITULARES · ${e(venue.label.toUpperCase())}</p><h3 id="title-${chamber}">Cámara de ${chamber}</h3></div><span>${matched.length} / ${source.length} escaños visibles</span></div><div class="atlas-legend" aria-label="Bancadas de ${chamber}">${legend}</div><div class="atlas-map" aria-label="Hemiciclo de ${chamber}"><img src="${planForVenue(chamber,source.length,venue.id)}" alt="" aria-hidden="true">${points}<div class="map-summary" aria-hidden="true"><strong>${source.length}</strong><span>${chamber.toUpperCase()}</span></div></div><p class="seat-help">Selecciona un escaño para abrir la ficha.${filters.condition==='Suplente'?' Los suplentes se consultan en el directorio inferior.':''} Las bancadas reflejan las siglas de la nómina; la posición de los asientos es esquemática.${venue.id==='antiguo'?' Diseño histórico de referencia, sin medidas arquitectónicas.':''}</p>${venue.transition?`<p class="venue-transition">2021: traslado al nuevo edificio el 2 de agosto; la primera parte del año corresponde a la sede antigua. <a href="${VENUE_SOURCES.traslado}" target="_blank" rel="noreferrer">Fuente ↗</a></p>`:''}</section>`);
 }
 return chamberHTML.join('');
}
