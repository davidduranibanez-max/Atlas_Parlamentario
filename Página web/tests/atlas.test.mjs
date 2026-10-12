import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {filterPeople,periodForYear,seatPositions,safeURL} from '../src/lib/model.js';
import {venueForYear,planForVenue} from '../src/lib/recintos.js';
import {partyInfo,partyKey} from '../src/lib/partidos.js';
const load=async path=>JSON.parse(await readFile(new URL(`../public/${path}`,import.meta.url),'utf8'));
const manifest=await load('data/manifest.json');
const periods=await Promise.all(manifest.gestiones.map(p=>load(p.archivo)));
test('45 años resuelven a su Parlamento en ejercicio, incluidos años de transición',()=>{
 assert.equal(manifest.anios.length,45);
 for(let year=1982;year<=2026;year++)assert.ok(periodForYear(manifest,year));
 for(const [year,election] of [[1982,1980],[2005,2002],[2006,2005],[2009,2005],[2010,2009],[2014,2009],[2015,2014],[2019,2014],[2020,2020],[2026,2025]])assert.equal(periodForYear(manifest,year).eleccion,election);
});
test('nóminas preservan titulares, suplentes, incidencias e identificadores',()=>{
 assert.equal(periods.reduce((n,p)=>n+p.personas.length,0),2261);
 for(const {gestion:g,personas:people} of periods){
  assert.equal(people.filter(p=>p.camara==='Diputados'&&p.condicion==='Titular').length,130);
  assert.equal(people.filter(p=>p.camara==='Senadores'&&p.condicion==='Titular').length,g.camara_senadores.total);
  assert.equal(new Set(people.map(p=>p.id)).size,people.length);
  for(const p of people){assert.ok(p.fuente_id);assert.ok(p.registro_id);if(p.pareja_id){const pair=people.find(q=>q.id===p.pareja_id);assert.ok(pair);assert.equal(pair.pareja_id,p.id);assert.notEqual(pair.condicion,p.condicion);}}
 }
 assert.ok(periods.some(p=>p.personas.some(r=>!r.es_persona)));
});
test('búsqueda sin tildes combinada con cámara, condición y departamento',()=>{
 const people=[{nombre_completo:'María Pérez',es_persona:true,camara:'Diputados',condicion:'Titular',departamento:'La Paz',partido_sigla:'MAS IPSP'},{nombre_completo:'María Pérez',es_persona:true,camara:'Senadores',condicion:'Suplente',departamento:'La Paz',partido_sigla:'MAS-IPSP'}];
 assert.equal(filterPeople(people,{query:'maria perez',chamber:'Diputados',condition:'Titular',department:'La Paz',party:'MAS-IPSP'}).length,1);
 assert.equal(filterPeople([{...people[0],partido_sigla:''}],{query:'',chamber:'',condition:'',department:'',party:'__sin_bancada__'}).length,1);
 assert.equal(filterPeople(people,{query:'nadie',chamber:'',condition:'',department:'',party:''}).length,0);
});
test('geometría de las cámaras históricas y actuales conserva todos los asientos sin duplicarlos',()=>{
 for(const [chamber,total] of [['Diputados',130],['Senadores',27],['Senadores',36]]){
  const slots=seatPositions(chamber,total);assert.equal(slots.length,total);assert.equal(new Set(slots.map(s=>`${s.x}:${s.y}`)).size,total);
  for(const p of slots){assert.ok(p.x>0&&p.x<1000);assert.ok(p.y>0&&p.y<660);}
 }
});
test('colores conservan identidades y siglas de alianzas de distintos períodos',()=>{
 assert.equal(partyKey('MAS IPSP'),'MAS-IPSP');assert.equal(partyKey('APB SÚMATE'),'APB-SÚMATE');
 assert.equal(partyInfo('MNR',1980).color,'#df729a');assert.equal(partyInfo('MAS-IPSP',2025).color,'#2556b8');
 assert.notEqual(partyInfo('AP',1993).color,partyInfo('AP',2025).color);
 assert.equal(partyInfo('AP',1993).reference,true);
});
test('fichas extensas cargan aparte y conservan su contexto temporal y evidencia',async()=>{
 const latest=periods.at(-1).personas;const enriched=latest.filter(p=>p.portal_archivo);assert.equal(enriched.length,310);assert.ok(latest.every(p=>!p.portal));
 const details=await Promise.all(enriched.map(p=>load(p.portal_archivo)));
 for(const portal of details){assert.ok(portal.snapshot_utc);for(const a of portal.asistencias)assert.ok(a.fuente_url);for(const v of portal.votos_individuales){assert.ok(v.fuente_url);assert.ok(v.nombre_fuente);}}
});
test('links de datos nunca ejecutan esquemas ajenos a HTTP',()=>{
 assert.equal(safeURL('javascript:alert(1)'),'');assert.equal(safeURL('file:///etc/passwd'),'');assert.equal(safeURL('https://web.oep.org.bo/'),'https://web.oep.org.bo/');
});

test('líneas de tiempo reservadas sin sucesos ni categorías futuras',async()=>{const config=await load('data/lineas_tiempo.json');assert.equal(config.lineas.length,1);assert.equal(config.lineas[0].titulo,'Sucesos políticos e hitos');assert.deepEqual(config.lineas[0].sucesos,[]);});

test('recintos históricos preservan 130 diputados y Senado de 27 o 36, con cambio de sede en 2021',()=>{
 assert.equal(venueForYear(1982).id,'antiguo');assert.equal(venueForYear(2020).id,'antiguo');assert.equal(venueForYear(2021).transition,true);assert.equal(venueForYear(2021).id,'actual');assert.equal(venueForYear(2026).id,'actual');
 for(const [chamber,total] of [['Diputados',130],['Senadores',27],['Senadores',36]]){
  const slots=seatPositions(chamber,total,'antiguo');assert.equal(slots.length,total);assert.equal(new Set(slots.map(s=>`${s.x}:${s.y}`)).size,total);
  for(const p of slots){assert.ok(p.x>0&&p.x<1000);assert.ok(p.y>0&&p.y<660);}
  assert.notDeepEqual(slots,seatPositions(chamber,total));
 }
 assert.ok(planForVenue('Senadores',27,'antiguo').includes('-27.svg'));assert.ok(planForVenue('Senadores',36,'antiguo').includes('-36.svg'));
});

test('las posiciones antiguas conservan los centros y las proporciones medidas de las referencias',async()=>{
 const reference=JSON.parse(await readFile(new URL('../verificacion/medicion_referencia_historica.json',import.meta.url),'utf8'));
 const senate27=JSON.parse(await readFile(new URL('../verificacion/medicion_senado_27.json',import.meta.url),'utf8'));
 for(const [chamber,total,measurement] of [['Diputados',130,reference.Diputados],['Senadores',36,reference.Senadores],['Senadores',27,senate27]]){
  const actual=seatPositions(chamber,total,'antiguo');assert.equal(actual.length,measurement.centros.length);
  const source=measurement.centros;const cx=(Math.max(...source.map(p=>p.origen_x))+Math.min(...source.map(p=>p.origen_x)))/2;const y0=Math.min(...source.map(p=>p.origen_y));const offset=chamber==='Diputados'?65:90;
  for(let i=0;i<actual.length;i++){
   assert.ok(Math.abs((actual[i].x-500)/measurement.escala_uniforme-(source[i].origen_x-cx))<.01);
   assert.ok(Math.abs((actual[i].y-offset)/measurement.escala_uniforme-(source[i].origen_y-y0))<.01);
  }
 }
 const deputies=seatPositions('Diputados',130,'antiguo');assert.equal(new Set(deputies.map(p=>p.row)).size,8);
 const senate=seatPositions('Senadores',36,'antiguo');for(const wing of [0,1])for(const row of [0,1])assert.equal(senate.filter(p=>p.wing===wing&&p.row===row).length,9);
});
