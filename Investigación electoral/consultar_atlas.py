"""Consulta de metadatos sin dependencias externas. Ejemplo: python3 consultar_atlas.py 2026."""
import argparse,json
from pathlib import Path

def consultar(anio):
    base=Path(__file__).resolve().parent/'datos'
    anual=json.loads((base/'anios'/f'{anio}.json').read_text(encoding='utf-8'))
    ficha=(base/'anios'/anual['archivo_gestion']).resolve()
    gestion=json.loads(ficha.read_text(encoding='utf-8'))
    if gestion['id'] != anual['gestion_referencia_id']:
        raise ValueError('La referencia anual no coincide con la ficha de gestión.')
    return {'referencia_anual':anual,'gestion':gestion}

if __name__=='__main__':
    p=argparse.ArgumentParser(description='Consulta del atlas parlamentario de Bolivia, 1982–2026.')
    p.add_argument('anio',type=int,choices=range(1982,2027),metavar='AÑO')
    args=p.parse_args()
    print(json.dumps(consultar(args.anio),ensure_ascii=False,indent=2))
