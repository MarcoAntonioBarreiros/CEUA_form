# -*- coding: utf-8 -*-
"""Auditoria exata: compara o dispositivo gravado em cada item com a planilha.
Sem similaridade. Ou casa, ou não casa.
"""
import re, json, glob, os, openpyxl, sys

import os
AQUI = os.path.dirname(os.path.abspath(__file__))
XLSX = os.path.join(AQUI, "criterios-rn-concea-por-taxon.xlsx")
ws = openpyxl.load_workbook(XLSX)["Criterios"]
RN = {}
for r in ws.iter_rows(min_row=2, values_only=True):
    RN[(r[2], r[3], r[1])] = {"cl": "OB" if r[5] == "Obrigatório" else "R",
                              "fin": [] if r[6] == "todas" else [x.strip() for x in r[6].split(";")],
                              "sub": r[7] or "", "cond": r[9] or "", "txt": r[10]}

ARQ_TAXON = {
 "roedores-lagomorfos": ["Roedores e lagomorfos"], "caes-gatos": ["Cães e gatos"],
 "primatas": ["Primatas não humanos"], "peixes": ["Peixes"],
 "anfibios-serpentes": ["Anfíbios", "Serpentes"], "equideos": ["Equídeos"],
 "pequenos-ruminantes": ["Pequenos ruminantes"],
 "grandes-ruminantes": ["Grandes ruminantes (bovinos e bubalinos)"],
 "suinos": ["Suínos"], "aves": ["Aves"],
}

def itens(path):
    s = open(path, encoding="utf-8").read()
    m = re.search(r"itens:\s*(\[.*?\])\s*\}?;?\s*</script>", s, re.S)
    if not m: return None
    return json.loads(m.group(1))

def auditar(path, slug):
    its = itens(path)
    if its is None: return ["não foi possível extrair a lista de itens"]
    taxons = ARQ_TAXON[slug]
    esperado = {k for k in RN if k[2] in taxons}
    falhas, vistos = [], set()
    for it in its:
        # o táxon é recuperado pelo id (sufixo) ou é único
        cands = [k for k in esperado if k[0] == it["rn"] and k[1] == it["d"]]
        if not cands:
            falhas.append(f"item sem alínea: {it['rn']} {it['d']} — {it['t'][:60]}")
            continue
        k = cands[0]
        if len(cands) > 1:
            for c in cands:
                if c[2].lower()[:5] in it["id"]: k = c; break
        vistos.add(k)
        ref = RN[k]
        if ref["cl"] != it["c"]:
            falhas.append(f"classificação: {k[1]} form={it['c']} RN={ref['cl']}")
        if sorted(ref["fin"]) != sorted(it["fin"]):
            falhas.append(f"finalidade: {k[1]} form={it['fin']} RN={ref['fin']}")
        if ref["cond"] != it.get("cond", ""):
            falhas.append(f"condição: {k[1]} form={it.get('cond','')!r} RN={ref['cond']!r}")
        if ref["txt"] != it["t"]:
            falhas.append(f"redação difere da planilha: {k[1]}")
    for k in esperado - vistos:
        falhas.append(f"alínea ausente: {k[1]} [{RN[k]['cl']}] {RN[k]['txt'][:56]}")
    return falhas

if __name__ == "__main__":
    base = sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, "..", "ciuca")
    total = 0
    for pref, rot in [("", "COORDENADOR"), ("parecerista-", "PARECERISTA")]:
        print(f"\n{'='*70}\n{rot}\n{'='*70}")
        for slug in ARQ_TAXON:
            p = f"{base}/{pref}{slug}.html"
            if not os.path.exists(p): continue
            f = auditar(p, slug)
            total += len(f)
            print(f"  {'CONFORME' if not f else 'FALHA   '} {pref}{slug}.html" + (f"  ({len(f)})" if f else ""))
            for x in f[:12]: print(f"        · {x}")
    print(f"\n{'='*70}\nDIVERGÊNCIAS: {total}\n{'='*70}")
