# -*- coding: utf-8 -*-
"""Testa o comportamento do motor com um interpretador de JS mínimo via node."""
import subprocess, json, os, tempfile
node = subprocess.run(["node","-e","console.log('ok')"],capture_output=True,text=True)
if node.returncode: print("node indisponível — teste funcional não roda"); raise SystemExit
js = r"""
const fs=require('fs'); const ALVO=process.argv[2];
const html=fs.readFileSync(ALVO,'utf8');
const cfg=JSON.parse(html.match(/itens: (\[.*?\])\s*\};/s)[1]);
// T-F1: todo item tem dispositivo, classificação e id únicos
const ids=cfg.map(i=>i.id); const dup=ids.filter((v,i)=>ids.indexOf(v)!==i);
console.log('T-F1 ids únicos:', dup.length===0?'PASSA':'FALHA '+dup);
console.log('T-F2 todos com dispositivo:', cfg.every(i=>i.d&&i.rn)?'PASSA':'FALHA');
console.log('T-F3 classificação válida:', cfg.every(i=>i.c==='OB'||i.c==='R')?'PASSA':'FALHA');
// T-F4: filtro de finalidade
const FIN={
 'Produção/criação':['criação'],'Manutenção':['manutenção'],'Utilização':['experimentação'],
 'Produção/criação + Manutenção':['criação','manutenção'],
 'Produção/criação + Utilização':['criação','experimentação'],
 'Manutenção + Utilização':['manutenção','experimentação'],
 'Produção/criação + Manutenção + Utilização':['criação','manutenção','experimentação']};
function vis(it,f,s){ if(f.length&&it.fin.length&&!it.fin.some(x=>f.indexOf(x)>-1)) return false;
  const geralNaMatriz=it.id==='rn-59-2023-art-2o-i-c';
  if(s&&it.sub&&!geralNaMatriz){ if(s.indexOf(' e ')>-1) return true;
    if(s==='Demais espécies'&&it.sub==='Peixes de laboratório') return false;
    if(s!=='Demais espécies'&&it.sub!==s) return false; } return true; }
const todas=cfg.filter(i=>vis(FIN['Produção/criação + Manutenção + Utilização']?i:i,FIN['Produção/criação + Manutenção + Utilização'],'Cães e gatos')).length;
const util =cfg.filter(i=>vis(i,FIN['Utilização'],'Cães e gatos')).length;
const cria =cfg.filter(i=>vis(i,FIN['Produção/criação'],'Cães e gatos')).length;
const manutUtil=cfg.filter(i=>vis(i,FIN['Manutenção + Utilização'],'Cães e gatos')).length;
const exclusivosCriacao=cfg.filter(i=>i.fin.includes('criação')&&!i.fin.includes('manutenção')&&!i.fin.includes('experimentação')).map(i=>i.id);
const ativosMU=cfg.filter(i=>vis(i,FIN['Manutenção + Utilização'],'Cães e gatos')).map(i=>i.id);
const vazouCriacao=exclusivosCriacao.some(id=>ativosMU.includes(id));
console.log('T-F4 filtro finalidade (todas/utilização/criação/manut+util):',todas,util,cria,manutUtil,(!vazouCriacao&&todas>=cria&&cria>util)?'PASSA':'FALHA');
// T-F5: filtro de subgrupo
const soCaes =cfg.filter(i=>vis(i,FIN['Produção/criação + Manutenção + Utilização'],'Cães')).length;
const soGatos=cfg.filter(i=>vis(i,FIN['Produção/criação + Manutenção + Utilização'],'Gatos')).length;
const vazouOutroSubgrupo=cfg.filter(i=>vis(i,FIN['Produção/criação + Manutenção + Utilização'],'Cães')).some(i=>i.sub==='Gatos'||(i.sub==='Cães e gatos'&&i.id!=='rn-59-2023-art-2o-i-c'));
console.log('T-F5 filtro subgrupo (cães/gatos/ambos):',soCaes,soGatos,todas,(!vazouOutroSubgrupo&&soCaes<todas&&soGatos<todas)?'PASSA':'FALHA');
// T-F6: caso do professor — utilização, cães, itens de alojamento presentes para marcar N/A
const util_caes=cfg.filter(i=>vis(i,FIN['Utilização'],'Cães'));
const ob=util_caes.filter(i=>i.c==='OB').length;
console.log('T-F6 utilização+cães: '+util_caes.length+' critérios ativos, '+ob+' obrigatórios',
  (util_caes.length===30&&ob===19)?'PASSA':'FALHA');
const quar=util_caes.find(i=>i.t.indexOf('quarentena')>-1);
console.log('T-F7 quarentena aparece para marcar Não se aplica:', quar?('PASSA ('+quar.d+')'):'FALHA');
"""
with tempfile.TemporaryDirectory() as tmpdir:
    script = os.path.join(tmpdir, "t.js")
    open(script, "w", encoding="utf-8").write(js)
    print(subprocess.run(["node",script,os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","ciuca","caes-gatos.html")],capture_output=True,text=True).stdout)
