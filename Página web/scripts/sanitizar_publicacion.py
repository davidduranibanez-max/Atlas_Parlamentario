"""Retira los números de CI de los JSON destinados a publicación."""
import re

def sanitizar(data):
    ids=set()
    def collect(v):
        if isinstance(v,dict):
            for k,x in v.items():
                if k.lower()=="ci" and str(x or "").strip():
                    ids.update(n for n in re.findall(r"\d{5,12}",str(x)))
                collect(x)
        elif isinstance(v,list):
            for x in v:collect(x)
    collect(data)
    pattern=re.compile(r"(?<!\w)(?:"+"|".join(re.escape(n) for n in ids)+r")(?!\w)") if ids else None
    def clean(v):
        if isinstance(v,dict):return {k:("Omitida en esta copia pública" if str(x or "").strip() else "") if k.lower()=="ci" else clean(x) for k,x in v.items()}
        if isinstance(v,list):return [clean(x) for x in v]
        if isinstance(v,str) and pattern:return pattern.sub("[CI omitida]",v)
        return v
    return clean(data)
