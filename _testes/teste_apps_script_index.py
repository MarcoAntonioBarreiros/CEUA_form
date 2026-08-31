#!/usr/bin/env python3
"""Verificações focadas no index e no fluxo Apps Script / SEI da v3."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "ciuca" / "index.html"
ENGINE = ROOT / "ciuca" / "assets" / "engine.js"


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[tuple[str, str]] = []
        self._href = ""
        self._text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "a":
            self._href = dict(attrs).get("href") or ""
            self._text = []

    def handle_data(self, data: str) -> None:
        if self._href:
            self._text.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._href:
            self.links.append((self._href, " ".join("".join(self._text).split())))
            self._href = ""
            self._text = []


def check(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)
    print(f"PASSA: {message}")


def test_index() -> None:
    parser = LinkParser()
    parser.feed(INDEX.read_text(encoding="utf-8"))
    hrefs = [href for href, _ in parser.links]
    old = {
        "peixes-i.html",
        "peixes-ii.html",
        "parecerista-peixes-i.html",
        "parecerista-peixes-ii.html",
    }
    check(len(hrefs) == 20, "index contém 10 formulários de coordenador e 10 de parecerista")
    check(hrefs.count("peixes.html") == 1, "Peixes aparece uma única vez entre os formulários de coordenador")
    check(hrefs.count("parecerista-peixes.html") == 1, "Peixes aparece uma única vez entre os formulários de parecerista")
    check(not old.intersection(hrefs), "index não contém links ativos para Peixes I/II")
    check(all((INDEX.parent / href).is_file() for href in hrefs), "todos os links locais do index são válidos")


def test_engine_static() -> str:
    source = ENGINE.read_text(encoding="utf-8")
    active_forms = [path for path in (ROOT / "ciuca").glob("*.html") if path.name != "index.html"]
    active_source = "\n".join(path.read_text(encoding="utf-8") for path in active_forms)
    expected_url = "https://script.google.com/macros/s/AKfycbw9PB2XNSFrX42tQfgnnfXzlW3J8VFweVydGTJzdMSeL3fTwe472lu9qpughGQsu4UQ4A/exec"
    check(expected_url in source, "CIUCA_APPS_SCRIPT_URL do fluxo original foi preservada")
    check("const SEI_DESTINO = 'UFPR / R / PL / CEUA'" in source, "destino SEI do fluxo original foi preservado")
    check("Registrar dados no Google Sheet e gerar PDF para SEI" in source,
          "botão único de registro no Google Sheet e PDF para SEI está presente")
    check(active_source.count('id="btnRegistrarPdf"') == 20,
          "todos os formulários ativos possuem somente o botão integrado")
    check(not any(term in active_source for term in ["Exportar Excel", "btnXls", "xlsx.full.min.js", 'id="btnPdf"', ">Exportar PDF<"]),
          "não há exportação Excel nem PDF independente nos formulários ativos")
    check(source.index("arquivo=montarPDF()") < source.index("const registrado=await registrarDados(fetchImpl)") <
          source.index("arquivo.doc.save(arquivo.nome)"),
          "PDF é preparado antes do registro e baixado somente após o Apps Script")
    check("typeof fetchImpl==='function'?fetchImpl:undefined" in source and
          "$('btnRegistrarPdf').onclick=()=>registrarEpdf()" in source,
          "evento de clique não é tratado como função de rede")
    check("validarCamposObrigatorios" in source and "estado.obPend" in source and
          "if(estado.pendentes)" not in source,
          "campos iniciais e obrigatórios são validados sem bloquear recomendações em branco")
    check("instalacao['Espécie / subgrupo selecionado']=g('subsel')" in source and
          "Object.entries(d.instalacao).forEach(([k,val])=>kv(k,val))" in source,
          "PDF inclui o subgrupo selecionado e todos os dados iniciais")
    check("catch(erro)" in source and "showStatus('error','Erro ao registrar dados:" in source,
          "falha de rede possui tratamento e mensagem controlada")

    payload_match = re.search(r"function payloadAppsScript\(\)\{(.*?)\n\}\n\nfunction showStatus", source, re.S)
    check(payload_match is not None, "payload do Apps Script está definido isoladamente")
    payload_source = payload_match.group(1)
    forbidden = ["localizacao_tipo", "nivel_biosseguranca", "NB-1", "NB-2", "NB-3", "Misto", "N/A"]
    check(not any(term in payload_source for term in forbidden), "payload não referencia campos ou valores removidos")
    check("g1:d.instituicao" in payload_source and "g2:d.instalacao" in payload_source and
          "g3:d.responsaveis" in payload_source and "instituicao:g('inst')" in payload_source,
          "payload mantém as chaves compatíveis do Apps Script original")
    return source


def test_engine_runtime(source: str) -> None:
    marker = "})();"
    exposed = source.rsplit(marker, 1)[0] + (
        "globalThis.__ciucaTest={registrarDados,registrarEpdf,payloadAppsScript,enviarAppsScript};" + marker
    )
    js = f"""
const vm=require('vm');
const events=[];
const pdfText=[];
let pdfRects=0;
const elements={{
  purpose:{{value:'Utilização',classList:{{toggle:()=>{{}}}},setAttribute:()=>{{}}}}, cTot:{{}}, cOk:{{}}, cNo:{{}}, cNa:{{}}, cPend:{{}}, btnPend:{{}},
  verdict:{{textContent:'EM PREENCHIMENTO',style:{{}}}}, statusBox:{{textContent:'',style:{{}}}}
}};
const fieldIds=['inst','cnpj','ceua','addr','city','mail','unit','situation','subsel','animalDetail','campus','building','room','area','cap','coord','coordCpf','coordMail','rt','rtCpf','rtMail','crmv','crmvUf'];
for(const id of fieldIds) elements[id]={{value:'preenchido',classList:{{toggle:()=>{{}}}},setAttribute:()=>{{}},focus:()=>{{}},scrollIntoView:()=>{{}}}};
elements.coord.value='Coordenador Teste'; elements.rt.value='RT Teste'; elements.subsel.value='Cães';
const document={{
  getElementById:id=>elements[id]||null,
  querySelectorAll:()=>[],
  addEventListener:()=>{{}},
  readyState:'loading'
}};
class FakePDF{{
  setFont(){{}} setFontSize(){{}} setTextColor(){{}} setFillColor(){{}} addPage(){{}} line(){{}} rect(){{pdfRects++}} text(t){{pdfText.push(String(t))}}
  splitTextToSize(t){{return [String(t)]}}
  save(){{events.push('pdf')}}
}}
const window={{
  addEventListener:()=>{{}},
  fetch:async()=>{{events.push('fetch')}},
  jspdf:{{jsPDF:FakePDF}},
  scrollTo:()=>{{}},
  setTimeout:setTimeout
}};
const context={{
  CFG:{{modo:'coordenador',grupo:'Teste',rn:'RN Teste',slug:'teste',itens:[
    {{id:'r1',rn:'RN Teste',d:'art. 3º, IV',g:'Geral',c:'R',fin:[],sub:'',cond:'',t:'Critério IV',n:'',obs:''}},
    {{id:'r2',rn:'RN Teste',d:'art. 3º, IX',g:'Geral',c:'R',fin:[],sub:'',cond:'',t:'Critério IX',n:'',obs:''}},
    {{id:'r3',rn:'RN Teste',d:'art. 3º, V',g:'Geral',c:'R',fin:[],sub:'',cond:'',t:'Critério V',n:'',obs:''}},
    {{id:'r4',rn:'RN Teste',d:'art. 2º, I, "g"',g:'Geral',c:'R',fin:[],sub:'',cond:'',t:'Critério com alínea',n:'',obs:''}}
  ]}},
  document,window,alert:()=>{{}},console,setTimeout,globalThis:null
}};
context.globalThis=context;
vm.createContext(context);
vm.runInContext({json.dumps(exposed)},context);
(async()=>{{
  const ok=await context.__ciucaTest.registrarEpdf({{type:'click'}});
  if(!ok || events.join(',')!=='fetch,pdf') throw new Error('sequência esperada fetch,pdf; obtida '+events.join(','));
  if(!pdfText.some(t=>t.includes('Coordenador Teste')) || !pdfText.some(t=>t.includes('RT Teste')) || !pdfText.some(t=>t.includes('Cães'))) throw new Error('PDF não contém coordenador, RT e espécie selecionada');
  if(!pdfText.some(t=>t.includes('UFPR · CEUA Palotina')) || pdfRects<2) throw new Error('PDF não preservou a identidade visual do formulário original');
  if(!pdfText.some(t=>t.includes('RN Teste · art. 2º, I, "g"'))) throw new Error('PDF perdeu RN, inciso ou alínea');
  const iv=pdfText.findIndex(t=>t.includes('art. 3º, IV')), v=pdfText.findIndex(t=>t.includes('art. 3º, V')), ix=pdfText.findIndex(t=>t.includes('art. 3º, IX'));
  if(!(iv>-1&&iv<v&&v<ix)) throw new Error('incisos romanos não foram ordenados juridicamente');
  if(!pdfText.some(t=>t.includes('Obrigatórios respondidos')) || !pdfText.some(t=>t.includes('Recomendados respondidos'))) throw new Error('resumo não separa obrigatórios e recomendados');
  elements.coord.value='';
  const before=events.length;
  const missing=await context.__ciucaTest.registrarDados(async()=>{{events.push('envio-indevido')}});
  if(missing!==false || events.length!==before) throw new Error('campo obrigatório vazio não bloqueou o registro');
  elements.coord.value='preenchido';
  const fail=await context.__ciucaTest.registrarDados(async()=>{{throw new Error('rede indisponível')}});
  if(fail!==false) throw new Error('falha de rede não retornou false');
  if(!elements.statusBox.textContent.includes('Erro ao registrar dados: rede indisponível')) throw new Error('mensagem de erro controlada ausente');
  console.log('PASSA: Apps Script antes do PDF, campos obrigatórios e falha de rede controlada');
}})().catch(err=>{{console.error(err.stack||err);process.exit(1)}});
"""
    completed = subprocess.run(
        ["node", "-e", js],
        cwd=ROOT,
        text=True,
        capture_output=True,
        encoding="utf-8",
        check=False,
    )
    if completed.stdout:
        print(completed.stdout.strip())
    if completed.returncode:
        print(completed.stderr, file=sys.stderr)
        raise SystemExit(completed.returncode)


def main() -> None:
    test_index()
    source = test_engine_static()
    test_engine_runtime(source)
    print("\nRESULTADO: 0 falhas")


if __name__ == "__main__":
    main()
