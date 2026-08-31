#!/usr/bin/env python3
"""Verifica a restauração dos parâmetros práticos exclusivos dos pareceristas."""

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CIUCA = ROOT / "ciuca"
ASSET = CIUCA / "assets" / "parecerista-parametros.js"

PAGINAS = {
    "roedores-lagomorfos": "roedores-lagomorfos",
    "caes-gatos": "caes-gatos",
    "primatas": "primatas",
    "peixes": "peixes",
    "anfibios-serpentes": "anfibios-serpentes",
    "equideos": "equideos",
    "pequenos-ruminantes": "pequenos-ruminantes",
    "grandes-ruminantes": "grandes-ruminantes",
    "suinos": "suinos",
    "aves": "aves",
}


def carregar_parametros():
    texto = ASSET.read_text(encoding="utf-8")
    prefixo = "window.CIUCA_PARECERISTA_PARAMETROS="
    inicio = texto.index(prefixo) + len(prefixo)
    return json.loads(texto[inicio:].strip().removesuffix(";"))


def ids_da_pagina(caminho):
    texto = caminho.read_text(encoding="utf-8")
    bloco = re.search(r"itens:\s*(\[.*\])\s*};\s*</script>", texto, re.S)
    assert bloco, f"Itens do CFG não encontrados em {caminho.name}"
    return texto, {item["id"] for item in json.loads(bloco.group(1))}


def main():
    parametros = carregar_parametros()
    assert set(parametros) == set(PAGINAS), "Os dez grupos devem possuir parâmetros"

    total = sum(len(grupo) for grupo in parametros.values())
    assert total >= 220, f"Poucos parâmetros restaurados: {total}"

    for slug, nome in PAGINAS.items():
        pagina = CIUCA / f"parecerista-{nome}.html"
        texto, ids = ids_da_pagina(pagina)
        assert 'src="assets/parecerista-parametros.js"' in texto
        assert set(parametros[slug]).issubset(ids), f"ID estranho em {pagina.name}"
        assert all(valor.strip() for valor in parametros[slug].values())
        assert not any(re.search(r"<[^>]+>", valor) for valor in parametros[slug].values())

        coordenador = CIUCA / f"{nome}.html"
        assert 'src="assets/parecerista-parametros.js"' not in coordenador.read_text(encoding="utf-8")

    engine = (CIUCA / "assets" / "engine.js").read_text(encoding="utf-8")
    assert "if(MODO!=='parecerista') return" in engine
    assert "if(parametro) item.obs=parametro" in engine
    assert "<b>O que observar:</b>" in engine

    proibidos = (
        "dureza", "NB-1", "NB-2", "NB-3", "Localização/tipo",
        "Espécie(s) alojada(s)", "Misto", "N/A",
    )
    conteudo = ASSET.read_text(encoding="utf-8")
    assert not any(termo.lower() in conteudo.lower() for termo in proibidos)

    print(f"PASSA: {total} parâmetros práticos restaurados em 10 pareceristas")
    print("PASSA: parâmetros aplicados somente em modo parecerista")
    print("PASSA: todos os IDs pertencem à matriz ativa auditada")
    print("PASSA: nenhum campo ou requisito proibido foi reintroduzido")


if __name__ == "__main__":
    main()
