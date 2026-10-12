// Tonos de pantalla representativos; las fuentes definen nombres de colores, no códigos HEX.
export const COLOR_SOURCE = 'https://observatoriodemocraciaintercultural.oep.org.bo/democracia-representativa/ejercicio-de-la-democracia-representativa/organizaciones-politicas/lista-de-partidos-politicos-a-nivel-nacional/';
const UE='https://www.eeas.europa.eu/sites/default/files/2025/documents/MOEUE_Bolivia_2025_Informe_Final.pdf';
const ATLAS='https://web.oep.org.bo/wp-content/uploads/2017/03/Atlas_Electoral_tomo-I_Cap_I-II.pdf';
const palette = {
 MNR:['#df729a','Rosado',COLOR_SOURCE], ADN:['#cf393b','Rojo, blanco y negro',COLOR_SOURCE],
 'MAS-IPSP':['#2556b8','Azul cobalto, negro y blanco',COLOR_SOURCE], MAS:['#2556b8','Azul cobalto',COLOR_SOURCE],
 PDC:['#22844d','Rojo, blanco y verde',COLOR_SOURCE], UCS:['#58a9d2','Celeste y blanco',COLOR_SOURCE],
 UN:['#dab433','Amarillo, blanco y azul',COLOR_SOURCE],
 LIBRE:['#d04443','Rojo',UE], UNIDAD:['#d9b231','Amarillo',UE], 'AP-2025':['#25a2ae','Turquesa',UE],
 'APB-SÚMATE':['#9565b8','Lila y rojo','https://web.oep.org.bo/wp-content/uploads/2024/12/ESTATUTO_ORGANICO_-APB_SUMATE.pdf'],
 MIR:['#e78a36','Naranja',ATLAS], IU:['#d4ba31','Amarillo',ATLAS],
 '':['#969991','Sin bancada consignada',null],
};
const historical = {UDP:'#488eac','PS-1':'#c74747',FDR:'#ab5259',FSB:'#4182bb',PRA:'#a24a56',MNRU:'#b95c85',MITKA:'#8c6bb3','MITKA-1':'#72965a',MNRI:'#bd7498',MNRV:'#ad6785',FPU:'#a6a24b',MRTKL:'#b8814a',CONDEPA:'#b69651',MBL:'#dd4d58',ARBOL:'#669552',ASD:'#90836b',EJE:'#905361','AP-1993':'#c65741',MP:'#ad8653',MIP:'#a66352',NFR:'#699b5d',PS:'#b84b4e',PODEMOS:'#c53f4f',AS:'#6a9953',CC:'#dd8540',CREEMOS:'#d96599',UD:'#d9b231','BIA-YUQUI':'#826f53',MN:'#c07898'};
export function partyKey(sigla='') {
 const s=sigla.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim().replace(/\s+/g,' ');
 if(['MAS IPSP','MAS-IPSP'].includes(s))return 'MAS-IPSP';
 if(['APB SUMATE','APB-SUMATE'].includes(s))return 'APB-SÚMATE';
 if(['BIA YUQUI','BIA-YUQUI'].includes(s))return 'BIA-YUQUI';
 if(s==='PPB-CONVERGENCIA')return 'PPB-CN';
 return sigla.trim();
}
export function partyInfo(sigla, election) {
 const key=partyKey(sigla);const identity=key==='AP'?`AP-${election}`:key;
 let item=palette[identity];let reference=false;
 if(!item){
  const base=key.startsWith('MNR-')?'MNR':key.startsWith('MIR-')?'MIR':key.startsWith('UCS-')?'UCS':key.startsWith('UN-')?'UN':null;
  if(base){item=[palette[base][0],'Color de referencia de la alianza',null];reference=true;}
  else {item=[historical[identity]||historical[key]||'#7a8c85','Color de referencia',null];reference=true;}
 }
 return {key,label:key||'Sin bancada consignada',color:item[0],description:item[1],source:item[2],reference};
}
