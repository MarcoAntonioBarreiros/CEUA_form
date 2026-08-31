#!/usr/bin/env python3
"""Verifica a restauração dos parâmetros práticos exclusivos dos pareceristas."""

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CIUCA = ROOT / "ciuca"
ASSET = CIUCA / "assets" / "parecerista-parametros.js"
CONFIG = CIUCA / "assets" / "parecerista-config.js"
ENGINE = CIUCA / "assets" / "parecerista-engine.js"

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
        assert 'href="assets/parecerista.css"' in texto
        assert 'src="assets/parecerista-parametros.js"' in texto
        assert 'src="assets/parecerista-config.js"' in texto
        assert 'src="assets/parecerista-engine.js"' in texto
        assert 'src="assets/engine.js"' not in texto
        assert set(parametros[slug]).issubset(ids), f"ID estranho em {pagina.name}"
        assert all(valor.strip() for valor in parametros[slug].values())
        assert not any(re.search(r"<[^>]+>", valor) for valor in parametros[slug].values())

        coordenador = CIUCA / f"{nome}.html"
        texto_coordenador = coordenador.read_text(encoding="utf-8")
        assert 'src="assets/parecerista-parametros.js"' not in texto_coordenador
        assert 'src="assets/parecerista-engine.js"' not in texto_coordenador

    engine = ENGINE.read_text(encoding="utf-8")
    config = CONFIG.read_text(encoding="utf-8")
    campos_originais = (
        'id="sei"', 'id="parecerista"', 'id="conclusao"', 'id="visita"',
        'id="pendencias"', 'id="recomendacoes"', 'id="parecer"',
    )
    assert all(campo in engine for campo in campos_originais)
    assert 'id="btnPdf">Gerar PDF do parecer' in engine
    assert "ASSINATURA DO(A) PARECERISTA" in engine
    assert "CIUCA_APPS_SCRIPT_URL" not in engine
    assert "Google Sheet" not in engine
    assert "const itens=ativos()" in engine
    assert "const ids=ativos().filter(x=>x.c==='OB').map" in engine
    assert "Obrigatórios pendentes" in engine
    assert "Parâmetro do Guia / o que conferir" in engine
    assert "parâmetro complementar" in engine

    # Os parâmetros variáveis que estavam incorretos precisam depender do cenário real.
    assert "function dogDimension(ctx)" in config
    assert "ctx.subgrupo==='Cães e gatos'" in config
    assert "Peixes de laboratório" in config and "Demais espécies" in config
    assert "capítulo 5 do Guia" in config and "ctx.subgrupo!=='Peixes de laboratório'" in config
    assert "fases:{maternidade:" in config and "ctx.fases.includes(id)" in config
    assert "Selecione a(s) fase(s) na etapa 2" in config
    assert "não cria novo dispositivo" in config.lower()

    proibidos = (
        "dureza", "NB-1", "NB-2", "NB-3", "Localização/tipo",
        "Espécie(s) alojada(s)", "Misto", "N/A",
    )
    conteudo = "\n".join((ASSET.read_text(encoding="utf-8"), config, engine))
    assert not any(termo.lower() in conteudo.lower() for termo in proibidos)

    print(f"PASSA: {total} parâmetros práticos restaurados em 10 pareceristas")
    print("PASSA: pareceristas possuem fluxo próprio, campos técnicos e PDF do relator")
    print("PASSA: parâmetros de cães/gatos, peixes e suínos respondem ao cenário")
    print("PASSA: fluxo do parecerista não envia dados ao Google Sheet")
    print("PASSA: todos os IDs pertencem à matriz ativa auditada")
    print("PASSA: nenhum campo ou requisito proibido foi reintroduzido")


if __name__ == "__main__":
    main()
