# -*- coding: utf-8 -*-
"""Bateria de integridade — roda em todos os HTML, sem julgamento normativo."""
import re, glob, os, json, sys
AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, "..", "ciuca")

PROIBIDOS = {
    "dureza da água": "termo sem base na RN 61 (o art. 2º I 'l' traz salinidade)",
    "Localização / tipo": "campo institucional sem base normativa",
    "NB-1": "escala de laboratório; nenhuma RN exige declarar nível de biossegurança",
    "NB-2": "idem",
    "NB-3": "idem",
    "espécie(s) alojada(s)": "rótulo induz erro em instalação de utilização transitória",
    "espécies alojadas": "rótulo induz erro em instalação de utilização transitória",
    "src: 'CEUA'": "item sem dispositivo de RN",
    "src:'CEUA'": "item sem dispositivo de RN",
}

def testar(path):
    s = open(path, encoding="utf-8").read()
    nome = os.path.basename(path)
    falhas = []

    eh_html = path.endswith(".html")
    # T1 — documento único e bem formado
    for tag, esperado in ([("<html", 1), ("</html>", 1), ("<body", 1), ("</body>", 1)] if eh_html else []):
        n = s.count(tag)
        if n != esperado:
            falhas.append(("T1 estrutura", f"'{tag}' aparece {n}x, esperado {esperado}"))

    # T2 — nada depois de </html>
    if "</html>" in s:
        cauda = s.split("</html>")[-1].strip()
        if cauda:
            falhas.append(("T2 cauda", f"{len(cauda)} caracteres após </html>: {cauda[:60]!r}"))

    # T3 — cada script carregado uma vez
    for src in re.findall(r'<script src="(assets/[^"]+)"', s):
        n = s.count(f'src="{src}"')
        if n != 1:
            falhas.append(("T3 script", f"{src} carregado {n}x"))

    # T4 — ids únicos entre os itens
    ids = re.findall(r"id:'([a-z0-9_]+)'", s)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        falhas.append(("T4 id duplicado", ", ".join(dup)))

    # T5 — classificação válida em todo item
    for c in set(re.findall(r"(?<![a-zA-Z])c: ?'([^']*)'", s)):
        if c not in ("Obrigatório", "Recomendado"):
            falhas.append(("T5 classificação", f"valor inválido: {c!r}"))

    # T6 — quem usa aplic precisa de filterPurpose
    if "aplic:" in s and "filterPurpose" not in s:
        n = len(re.findall(r"aplic:\[", s))
        falhas.append(("T6 filtro inerte", f"{n} itens com aplic mas sem filterPurpose — filtro não roda"))

    # T7 — termos proibidos
    for termo, motivo in PROIBIDOS.items():
        if termo in s:
            falhas.append(("T7 termo proibido", f"{termo!r} ({motivo})"))

    # T8 — nomenclatura de status
    if re.search(r"'N/A'|N/A justificado", s):
        falhas.append(("T8 nomenclatura", "usa 'N/A', ambíguo com 'Não atende'"))

    return nome, falhas

if __name__ == "__main__":
    total_f = 0
    for grupo, padrao in [("COORDENADOR", BASE + "/*.html"), ("MOTOR E ASSETS", BASE + "/assets/*"), ("PARECERISTA", BASE + "/parecerista-*.html")]:
        print(f"\n{'='*74}\n{grupo}\n{'='*74}")
        for p in sorted(glob.glob(padrao)):
            nome, falhas = testar(p)
            total_f += len(falhas)
            if not falhas:
                print(f"  PASSA   {nome}")
            else:
                print(f"  FALHA   {nome}")
                for t, d in falhas:
                    print(f"            [{t}] {d}")
    print(f"\n{'='*74}\nTOTAL DE FALHAS: {total_f}\n{'='*74}")
