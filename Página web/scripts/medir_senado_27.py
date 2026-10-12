"""Analiza la referencia de 2005 sin modificar su imagen."""
from PIL import Image
from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1];source=root/'verificacion/referencia_senado_2005.png'
im=Image.open(source).convert('RGB');pixels=im.load();w,h=im.size
remaining={(x,y) for y in range(h) for x in range(w) if max(pixels[x,y])-min(pixels[x,y])>35 and max(pixels[x,y])>100 and min(pixels[x,y])<220}
groups=[]
while remaining:
 p=remaining.pop();todo=[p];pts=[p]
 while todo:
  x,y=todo.pop()
  for q in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
   if q in remaining:remaining.remove(q);todo.append(q);pts.append(q)
 if len(pts)>500:groups.append({'x':sum(p[0] for p in pts)/len(pts),'y':sum(p[1] for p in pts)/len(pts),'area':len(pts)})
print('Dimensiones',w,h,'Componentes',len(groups),'Áreas', [g['area'] for g in groups])
assert len(groups)==27
xs=[p['x'] for p in groups];ys=[p['y'] for p in groups];cx=(max(xs)+min(xs))/2;scale=480/(max(ys)-min(ys))
coords=[{'x':round(500+(p['x']-cx)*scale,4),'y':round(90+(p['y']-min(ys))*scale,4),'origen_x':round(p['x'],4),'origen_y':round(p['y'],4)} for p in groups]
coords.sort(key=lambda p:(0 if p['x']<500 else 1,p['y'],p['x']))
for p in coords:
 p['row']=0 if abs(p['x']-500)<150 else 1;p['wing']=0 if p['x']<500 else 1
print('Centros',[(p['origen_x'],p['origen_y'],p['row'],p['wing']) for p in coords])
report={'total':27,'centros':coords,'escala_uniforme':scale,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'referencia':'https://es.wikipedia.org/wiki/Elecciones_generales_de_Bolivia_de_2005','imagen':'https://upload.wikimedia.org/wikipedia/commons/3/32/C%C3%A1mara_de_Senadores_de_Bolivia_-_Elecciones_2005.png'}
(root/'verificacion/medicion_senado_27.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
p=root/'src/lib/recintos-puntos.json';compact=json.loads(p.read_text());compact['Senadores27']=[[r['x'],r['y'],r['row'],r['wing']] for r in coords];p.write_text(json.dumps(compact,separators=(',',':'))+'\n')
