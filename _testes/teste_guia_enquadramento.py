import collections
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / "ciuca" / "guia-enquadramento.html"
INDEX = ROOT / "ciuca" / "index.html"

FORMS = {
    "Roedores e lagomorfos": "roedores-lagomorfos.html",
    "Cães e gatos": "caes-gatos.html",
    "Primatas não humanos": "primatas.html",
    "Peixes": "peixes.html",
    "Equídeos": "equideos.html",
    "Pequenos ruminantes": "pequenos-ruminantes.html",
    "Grandes ruminantes (bovinos e bubalinos)": "grandes-ruminantes.html",
    "Suínos": "suinos.html",
    "Aves": "aves.html",
}

FIELDS = ("d", "c", "g", "fin", "sub", "cond", "t", "n")


def extract_json(text, pattern, label):
    match = re.search(pattern, text, re.S)
    if not match:
        raise AssertionError(f"Não foi possível extrair {label}")
    return json.loads(match.group(1))


def form_items(filename):
    text = (ROOT / "ciuca" / filename).read_text(encoding="utf-8")
    return extract_json(
        text,
        r"itens\s*:\s*(\[.*\])\s*\}\s*;\s*</script>",
        filename,
    )


def canonical(item, clear_sub=False):
    data = {field: item.get(field, [] if field == "fin" else "") for field in FIELDS}
    if clear_sub:
        data["sub"] = ""
    return json.dumps(data, ensure_ascii=False, sort_keys=True)


def assert_same_items(label, guide_items, form_items_, clear_sub=False):
    guide_counter = collections.Counter(canonical(item) for item in guide_items)
    form_counter = collections.Counter(canonical(item, clear_sub=clear_sub) for item in form_items_)
    if guide_counter != form_counter:
        guide_only = list((guide_counter - form_counter).elements())[:2]
        form_only = list((form_counter - guide_counter).elements())[:2]
        raise AssertionError(
            f"Matriz divergente em {label}. Guia apenas: {guide_only}; formulário apenas: {form_only}"
        )


def main():
    guide = GUIDE.read_text(encoding="utf-8")
    index = INDEX.read_text(encoding="utf-8")
    matrix = extract_json(guide, r"const gMAT = (\{.*?\});\s*const gORD", "gMAT")

    all_items = [item for group in matrix.values() for item in group["i"]]
    classes = collections.Counter(item["c"] for item in all_items)
    assert len(all_items) == 285, f"Total no guia: {len(all_items)} (esperado: 285)"
    assert classes == {"OB": 193, "R": 92}, f"Classificação no guia: {classes}"

    for label, filename in FORMS.items():
        assert_same_items(label, matrix[label]["i"], form_items(filename))

    amphibians_serpents = form_items("anfibios-serpentes.html")
    for label in ("Anfíbios", "Serpentes"):
        expected = [
            item for item in amphibians_serpents if not item.get("sub") or item.get("sub") == label
        ]
        assert_same_items(label, matrix[label]["i"], expected, clear_sub=True)

    ids = re.findall(r'\bid="([^"]+)"', guide)
    duplicates = [item for item, count in collections.Counter(ids).items() if count > 1]
    assert not duplicates, f"IDs duplicados no guia: {duplicates}"

    handlers = set(re.findall(r'onclick="([A-Za-z_$][\w$]*)\(', guide))
    functions = set(re.findall(r"function\s+([A-Za-z_$][\w$]*)\s*\(", guide))
    assert not handlers - functions, f"Handlers sem função: {sorted(handlers - functions)}"
    targets = set(re.findall(r"gGo\('([^']+)'\)", guide))
    assert not targets - set(ids), f"Destinos ausentes: {sorted(targets - set(ids))}"

    assert "esse limite não cria dispensa geral para outros táxons" in guide
    assert "assinale “não se aplica” apenas nos itens em que isso for realmente cabível" in guide
    assert "não presuma que todos os itens de alojamento estejam dispensados" in guide
    assert "permanecem sob responsabilidade de seus proprietários" in guide
    assert "Se houver alojamento, manutenção ou operação do espaço pela UFPR" in guide
    assert "Só cadáveres, peças ou amostras biológicas" in guide
    assert "documentação que comprove inequivocamente a procedência" in guide
    assert "se em algum momento entrar animal vivo no espaço" in guide
    assert "Guia da CEUA/UFPR — Setor Palotina" in guide
    assert "Quem mantém a responsabilidade cotidiana pelos animais?" in guide
    assert "Na propriedade do tutor ou produtor" in guide
    assert "No Hospital Veterinário ou outro espaço da UFPR" in guide
    assert "ONG" not in guide
    assert "clínica particular" not in guide
    assert "function gItemAtivo" in guide
    assert "gSubWrap" in guide
    assert "gMk1.style" not in guide

    iframe_pos = index.find('src="guia-enquadramento.html"')
    forms_pos = index.find("Formulários de cadastro / levantamento")
    assert iframe_pos >= 0, "Guia não incorporado no índice"
    assert forms_pos >= 0 and iframe_pos < forms_pos, "Guia deve vir antes dos formulários"

    print("Guia: 285 critérios / 193 OB / 92 R — PASSA")
    print("Paridade com os 10 formulários ativos — PASSA")
    print("Subgrupos de cães/gatos, anfíbios e serpentes — PASSA")
    print("Estrutura, handlers, destinos e integração no index — PASSA")
    print("Ressalvas de laboratório <12h e HV/ambulatório — PASSA")
    print("Propriedades externas e material biológico sem animais vivos — PASSA")
    print("Fluxo local CEUA/UFPR e distinção tutor/produtor versus UFPR — PASSA")


if __name__ == "__main__":
    main()
