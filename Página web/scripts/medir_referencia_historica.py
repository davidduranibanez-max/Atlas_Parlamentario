"""Mide centros de puntos en la captura de referencia; no modifica la imagen."""
from PIL import Image
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[1]
source=Path(r'C:\Users\Exsec\AppData\Local\Temp\codex-clipboard-acf5f888-ca55-4bea-9d2e-cac133188ffe.png')
im=Image.open(source).convert('RGB')
result={}
for chamber,box,expected in [('Senadores',(160,20,380,345),36),('Diputados',(110,602,430,815),130)]:
 x0,y0,x1,y1=box;pixels=im.load()
 def colored(x,y):
  r,g,b=pixels[x,y]
  return (r<90 and b>130 and g<150) or (r>180 and g>140 and b<110) or (r>150 and g<90 and b<90)
 remaining={(x,y) for y in range(y0,y1) for x in range(x0,x1) if colored(x,y)};groups=[]
 while remaining:
  p=remaining.pop();todo=[p];points=[p]
  while todo:
   x,y=todo.pop()
   for q in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
    if q in remaining:remaining.remove(q);todo.append(q);points.append(q)
  if len(points)>40:
   groups.append({'x':sum(p[0] for p in points)/len(points),'y':sum(p[1] for p in points)/len(points),'area':len(points)})
 print(chamber,len(groups),'puntos; áreas:',min(g['area'] for g in groups),max(g['area'] for g in groups))
 assert len(groups)==expected,(chamber,len(groups),expected)
 xs=[g['x'] for g in groups];ys=[g['y'] for g in groups]
 cx=(min(xs)+max(xs))/2;top=min(ys);span_y=max(ys)-top
 scale=480/span_y if chamber=='Senadores' else 770/(max(xs)-min(xs))
 offset_y=90 if chamber=='Senadores' else 65
 coords=[{'x':round(500+(g['x']-cx)*scale,4),'y':round(offset_y+(g['y']-top)*scale,4),'origen_x':round(g['x'],4),'origen_y':round(g['y'],4)} for g in groups]
 # Mantiene bloques y avance de arriba hacia abajo, tal como la referencia.
 coords.sort(key=lambda p:(0 if p['x']<500 else 1,p['y'],p['x']))
 if chamber=='Diputados':
  starts=[0,0,0,0,0,1,1,1,3,5]
  for wing in [0,1]:
   for col,start in enumerate(starts):
    column=sorted([p for p in coords if (0 if p['x']<500 else 1)==wing and round((abs(p['origen_x']-cx)-14.75)/14.75)==col],key=lambda p:p['y'])
    for index,p in enumerate(column):p['row']=start+index
 else:
  for p in coords:p['row']=0 if abs(p['x']-500)<100 else 1
  for wing in [0,1]:
   for row in [0,1]:
    column=sorted([p for p in coords if (0 if p['x']<500 else 1)==wing and p['row']==row],key=lambda p:p['y'])
    for depth,p in enumerate(column):p['depth']=depth
  coords.sort(key=lambda p:((0 if p['x']<500 else 1),p['depth'],p['row']))
 for p in coords:p['wing']=0 if p['x']<500 else 1
 assert all('row' in p for p in coords)
 print('Filas', [sum(p['row']==r for p in coords) for r in range(max(p['row'] for p in coords)+1)])
 result[chamber]={'total':expected,'escala_uniforme':scale,'centros':coords}
result['procedencia']={'imagen':source.name,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'metodo':'Centros de componentes de píxeles coloreados; transformación uniforme, sin ajustar curvas ni inventar posiciones.','referencia':'https://es.wikipedia.org/wiki/Elecciones_generales_de_Bolivia_de_2014'}
(root/'verificacion/medicion_referencia_historica.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
compact=json.loads((root/'src/lib/recintos-puntos.json').read_text()) if (root/'src/lib/recintos-puntos.json').exists() else {}
compact.update({c:[[p['x'],p['y'],p['row'],p['wing']] for p in result[c]['centros']] for c in ['Diputados','Senadores']})
(root/'src/lib/recintos-puntos.json').write_text(json.dumps(compact,separators=(',',':'))+'\n',encoding='utf8')
