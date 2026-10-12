from sanitizar_publicacion import sanitizar
"""Exporta la base local de sólo lectura a JSON estático. No requiere paquetes."""
import argparse, csv, hashlib, json, re, sqlite3, unicodedata
from pathlib import Path
from collections import Counter, defaultdict
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = Path('/mnt/e/Exsecutor000/Bases de datos/Asamblea Legislativa') if Path('/mnt/e').exists() else Path('E:/Exsecutor000/Bases de datos/Asamblea Legislativa')

def normal(value):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', value or '').encode('ascii','ignore').decode().lower())

def read_csv(path):
    with path.open(encoding='utf-8-sig', newline='') as file:
        return list(csv.DictReader(file))

def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(sanitizar(data), ensure_ascii=False, separators=(',', ':')), encoding='utf-8')

def export(source):
    target = ROOT/'public/data'
    research = ROOT.parent/'Investigación electoral/datos'
    atlas = json.loads((research/'atlas_parlamentario.json').read_text(encoding='utf-8'))
    periods = atlas['gestiones']
    sources = read_csv(source/'fuentes.csv')
    annual = [json.loads((research/'anios'/f'{year}.json').read_text(encoding='utf-8')) for year in range(1982,2027)]
    hashes = {}
    def stamp(p):
        hashes[str(p.relative_to(source))] = hashlib.sha256(p.read_bytes()).hexdigest()
    dbfile = source/'ALP 2025_2030/alp_2025_2030.sqlite'
    connection = sqlite3.connect(dbfile.as_uri()+'?mode=ro', uri=True)
    connection.row_factory = sqlite3.Row
    def records(query): return [dict(r) for r in connection.execute(query)]
    portals = records('SELECT l.*, p.sigla AS partido_sigla, p.nombre AS partido_nombre FROM legisladores l LEFT JOIN partidos p USING(partido_id)')
    lookup = defaultdict(list)
    for p in portals:
        lookup[(normal(p['nombre_completo']),normal(p['camara']).replace('senadores','senado'),normal(p['titularidad']),normal(p['departamento']))].append(p)
    mandates = defaultdict(list)
    for r in records('SELECT * FROM mandatos'): mandates[r['legislador_id']].append(r)
    attendance = defaultdict(list)
    for r in records('SELECT a.*, s.fecha, s.numero, s.camara, s.titulo_fuente, f.url AS fuente_url FROM asistencias a LEFT JOIN sesiones s USING(sesion_id) LEFT JOIN fuentes f USING(fuente_id) ORDER BY s.fecha DESC'):
        attendance[r['legislador_id']].append(r)
    votes = defaultdict(list)
    for r in records('SELECT i.*, v.descripcion, v.resultado, v.requiere_revision, s.fecha, s.numero, f.url AS fuente_url FROM votos_individuales i LEFT JOIN votaciones v USING(votacion_id) LEFT JOIN sesiones s USING(sesion_id) LEFT JOIN fuentes f ON i.fuente_id=f.fuente_id ORDER BY s.fecha DESC'):
        votes[r['legislador_id']].append(r)
    metadata = dict(connection.execute('SELECT clave,valor FROM metadata').fetchall())
    portal_sources = {r['fuente_id']:r for r in records('SELECT * FROM fuentes')}
    issues = records('SELECT * FROM incidencias_calidad')
    pairings = records('SELECT * FROM suplencias')
    stamp(dbfile)
    report = []
    allrows = []
    total_matched = 0
    for period in periods:
        label = period['periodo']['etiqueta'].replace('–','-')
        csvpath = source/f"parlamentarios_{label.replace('-','_')}.csv"
        rows = read_csv(csvpath)
        stamp(csvpath)
        seen = set()
        paired = defaultdict(list)
        for r in rows:
            assert r['registro_id'] not in seen, f"ID repetido: {r['registro_id']}"
            seen.add(r['registro_id'])
            r['id'] = r['registro_id']
            r['camara'] = 'Senadores' if r['camara']=='Senado' else r['camara']
            r['es_persona'] = bool(r['nombre_completo'] and normal(r['nombre_completo']) not in {'renuncia','inhabilitado','sindato','sincandidato','noconsignado'})
            key = tuple(r[k] for k in ['camara','tipo_escanio','departamento','circunscripcion','posicion','partido_sigla'])
            paired[key].append(r)
            if label=='2025-2030' and r['es_persona']:
                candidates = lookup[(normal(r['nombre_completo']),normal(r['camara']).replace('senadores','senado'),normal(r['condicion']),normal(r['departamento']))]
                if len(candidates)==1:
                    p = dict(candidates[0]);pid=p['legislador_id']
                    p['mandatos'] = mandates[pid]
                    p['asistencias'] = attendance[pid]
                    p['votos_individuales'] = votes[pid]
                    p['snapshot_utc'] = metadata.get('snapshot_utc')
                    p['fuente'] = portal_sources.get(p['fuente_id'])
                    p['incidencias'] = [i for i in issues if i['entidad_id'] in {pid,p['camara']}]
                    r['portal'] = p
                    total_matched += 1
        # Sólo parejas únicas y con una clave publicada (posición o circunscripción uninominal).
        for key, pair in paired.items():
            if len(pair)==2 and set(r['condicion'] for r in pair)=={'Titular','Suplente'} and (key[4] or key[1]=='Uninominal'):
                pair[0]['pareja_id']=pair[1]['id'];pair[1]['pareja_id']=pair[0]['id']
        counts = Counter(r['camara'] for r in rows if r['condicion']=='Titular')
        assert counts['Diputados']==130 and counts['Senadores']==period['camara_senadores']['total'], (label, counts)
        difference=[]
        aliases={'MAS IPSP':'MAS-IPSP','MAS':'MAS','APB SÚMATE':'APB-SÚMATE','PPB-CONVERGENCIA':'PPB-CN','BIA YUQUI':'BIA-YUQUI'}
        for chamber, field in [('Diputados','diputados'),('Senadores','senadores')]:
            actual=Counter(aliases.get(r['partido_sigla'],r['partido_sigla']) or 'Sin bancada consignada' for r in rows if r['camara']==chamber and r['condicion']=='Titular')
            expected={p['sigla']:p[field] for p in period['organizaciones_electorales'] if p[field]}
            if dict(actual)!=expected: difference.append({'camara':chamber,'nomina':dict(actual),'asignacion_electoral':expected})
        for r in rows:
            if 'portal' in r:
                detail = r.pop('portal')
                r['portal_archivo'] = f'data/fichas/{r["id"]}.json'
                write(target/'fichas'/f'{r["id"]}.json', detail)
        package={'gestion':period,'personas':rows,'diferencias':difference,'archivo_origen':csvpath.name,'fuentes':sources}
        write(target/'gestiones'/f'{period["id"]}.json',package)
        report.append({'id':period['id'],'legislatura':label,'registros':len(rows),'titulares':dict(counts),'personas_con_nombre':sum(r['es_persona'] for r in rows),'incidencias':sum(not r['es_persona'] or r['estado_registro']!='Válido' for r in rows),'diferencias_reparto':difference})
        allrows.extend(rows)
    stamp(source/'fuentes.csv')
    stamp(source/'control_calidad.csv')
    stamp(source/'incidencias.csv')
    write(target/'manifest.json',{'version':1,'fecha_exportacion':datetime.now(timezone.utc).isoformat(),'cobertura':'1982–2026','gestiones':[{'id':p['id'],'periodo':p['periodo'],'eleccion':p['eleccion_origen']['anio'],'archivo':f'data/gestiones/{p["id"]}.json'} for p in periods],'anios':annual,'fuentes':atlas['fuentes'],'nomina_fuentes':sources,'total_registros':len(allrows),'enriquecimientos_portal':total_matched,'snapshot_portal':metadata.get('snapshot_utc')})
    write(target/'control_calidad.json',{'gestiones':report,'origen':str(source),'hashes_sha256':hashes,'snapshot_portal':metadata,'enriquecimientos_portal':total_matched,'criterio':'Nóminas por legislatura como origen; consolidado no utilizado porque puede diferir de archivos actualizados. Conserva todas las filas y siglas originales. No reconstruye cambios de bancada año a año.'})
    for name in ['fuentes','incidencias','control_calidad']:write(target/f'{name}_origen.json',read_csv(source/f'{name}.csv'))
    connection.close()
    print(f'{len(periods)} gestiones · {len(annual)} años · {len(allrows)} registros · {total_matched} fichas enriquecidas. Fuentes intactas.')

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--origen',type=Path,default=DEFAULT_SOURCE)
    export(p.parse_args().origen.resolve())
