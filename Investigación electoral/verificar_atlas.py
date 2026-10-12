import json,csv,sys,hashlib,xml.etree.ElementTree as ET,importlib.util
from pathlib import Path
B=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('consulta',B/'consultar_atlas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
d=json.loads((B/'datos/atlas_parlamentario.json').read_text(encoding='utf-8'));g=d['gestiones'];assert len(g)==11
files=list((B/'datos').rglob('*.json'))
for p in files:json.loads(p.read_text(encoding='utf-8'))
for a in range(1982,2027):
 result=m.consultar(a);assert result['referencia_anual']['anio']==a
for year,election in [(1982,1980),(1985,1985),(1993,1993),(2005,2002),(2006,2005),(2009,2005),(2010,2009),(2014,2009),(2015,2014),(2019,2014),(2020,2020),(2026,2025)]:
 assert m.consultar(year)['gestion']['eleccion_origen']['anio']==election,(year,election)
for x in g:
 assert sum(p['diputados'] for p in x['organizaciones_electorales'])==130
 assert sum(p['senadores'] for p in x['organizaciones_electorales'])==x['camara_senadores']['total']
 assert sum(x['camara_diputados']['por_tipo'].values())==130
 assert sum(p['diputados'] for p in x['distribucion_territorial'])==130
 assert sum(p['senadores'] for p in x['distribucion_territorial'])==x['camara_senadores']['total']
 for p in x['distribucion_territorial']:assert p['uninominales']+p['plurinominales']+p['especiales']==p['diputados']
 assert len({p['id'] for p in x['organizaciones_electorales']})==len(x['organizaciones_electorales'])
 for src in x['fuentes']:assert src['fuente_id'] in d['fuentes']
 assert (B/x['mapa']).is_file()
 ET.parse((B/x['mapa']).with_suffix('.svg'))
for src in d['fuentes'].values():
 if 'archivo' in src:assert hashlib.sha256((B/src['archivo']).read_bytes()).hexdigest()==src['sha256']
with (B/'datos/bancadas_por_gestion.csv').open(encoding='utf-8-sig',newline='') as f:
 rows=list(csv.DictReader(f));assert len(rows)==sum(len(x['organizaciones_electorales']) for x in g)
 for x in g:
  rs=[r for r in rows if int(r['eleccion_origen'])==x['eleccion_origen']['anio']]
  assert sum(int(r['diputados']) for r in rs)==130
with (B/'datos/distribucion_departamental.csv').open(encoding='utf-8-sig',newline='') as f:assert len(list(csv.DictReader(f)))==99
v=json.loads((B/'fuentes/verificacion_tablas_2025.json').read_text(encoding='utf-8'))['totales_por_tipo']
assert sum(v['senadores'].values())==36
assert sum(v['uninominales'].values())==63
assert sum(v['plurinominales'].values())==60
assert sum(v['especiales'].values())==7
for p in g[-1]['organizaciones_electorales']:
 assert p['senadores']==v['senadores'].get(p['sigla'],0)
 assert p['diputados']==sum(v[k].get(p['sigla'],0) for k in ['uninominales','plurinominales','especiales'])
print('CORRECTO:',len(files),'JSON; 45 consultas anuales; 11 gestiones; 99 repartos departamentales; CSV; 22 mapas; sumas de cámaras; cotejo de tablas oficiales 2025; integridad de fuentes.')
