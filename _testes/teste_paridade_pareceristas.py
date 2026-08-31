# -*- coding: utf-8 -*-
"""Garante paridade normativa entre coordenador e parecerista por táxon."""
import json
import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, "..", "ciuca")
TAXONS = [
    "roedores-lagomorfos",
    "caes-gatos",
    "primatas",
    "peixes",
    "anfibios-serpentes",
    "equideos",
    "pequenos-ruminantes",
    "grandes-ruminantes",
    "suinos",
    "aves",
]


def carregar(nome):
    caminho = os.path.join(BASE, nome)
    texto = open(caminho, encoding="utf-8").read()
    achado = re.search(r"itens: (\[.*?\])\s*\};", texto, re.S)
    if not achado:
        raise ValueError(f"CFG.itens não encontrado em {nome}")
    return json.loads(achado.group(1)), texto


def assinatura(item):
    return (
        item["id"],
        item["rn"],
        item["d"],
        item["c"],
        tuple(item["fin"]),
        item["sub"],
        item["cond"],
    )


falhas = 0
total = obrigatorios = recomendados = 0
print("\n" + "=" * 74)
print("PARIDADE COORDENADOR × PARECERISTA")
print("=" * 74)

for taxon in TAXONS:
    coord, texto_coord = carregar(f"{taxon}.html")
    parecer, texto_parecer = carregar(f"parecerista-{taxon}.html")
    conjunto_coord = {assinatura(item) for item in coord}
    conjunto_parecer = {assinatura(item) for item in parecer}
    total += len(coord)
    obrigatorios += sum(item["c"] == "OB" for item in coord)
    recomendados += sum(item["c"] == "R" for item in coord)

    problemas = []
    if "modo:'coordenador'" not in texto_coord:
        problemas.append("modo do coordenador ausente ou incorreto")
    if "modo:'parecerista'" not in texto_parecer:
        problemas.append("modo do parecerista ausente ou incorreto")
    if len(coord) != len(conjunto_coord):
        problemas.append("assinatura normativa duplicada no coordenador")
    if len(parecer) != len(conjunto_parecer):
        problemas.append("assinatura normativa duplicada no parecerista")
    if conjunto_coord != conjunto_parecer:
        faltantes = sorted(conjunto_coord - conjunto_parecer)
        extras = sorted(conjunto_parecer - conjunto_coord)
        if faltantes:
            problemas.append(f"{len(faltantes)} critério(s) ausente(s) no parecerista")
        if extras:
            problemas.append(f"{len(extras)} critério(s) extra(s) no parecerista")

    if problemas:
        falhas += len(problemas)
        print(f"  FALHA   {taxon}: " + "; ".join(problemas))
    else:
        print(f"  PASSA   {taxon}: {len(coord)} critérios idênticos")

if (total, obrigatorios, recomendados) != (285, 193, 92):
    falhas += 1
    print(
        "  FALHA   totais: "
        f"{total} critérios / {obrigatorios} OB / {recomendados} R; "
        "esperado 285 / 193 / 92"
    )
else:
    print(f"\n  PASSA   totais: {total} critérios / {obrigatorios} OB / {recomendados} R")

print("\n" + "=" * 74)
print(f"TOTAL DE FALHAS: {falhas}")
print("=" * 74)
raise SystemExit(1 if falhas else 0)
