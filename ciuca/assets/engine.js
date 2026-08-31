
(function(){
const MODO = CFG.modo || 'coordenador';
const STATUS = MODO==='parecerista'
  ? ['—','Atende','Não atende','Informação insuficiente','Não se aplica']
  : ['—','Atende','Não atende','Não se aplica'];
const EXIGE_JUST = ['Não atende','Não se aplica','Informação insuficiente'];
const FIN = {
  'Produção/criação':['criação'],
  'Manutenção':['manutenção'],
  'Utilização':['experimentação'],
  'Produção/criação + Manutenção':['criação','manutenção'],
  'Produção/criação + Utilização':['criação','experimentação'],
  'Manutenção + Utilização':['manutenção','experimentação'],
  'Produção/criação + Manutenção + Utilização':['criação','manutenção','experimentação']
};
const st = {};
const $ = id => document.getElementById(id);
const esc = s => String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function finAtual(){ return FIN[$('purpose').value] || []; }
function subAtual(){ const e=$('subsel'); return e ? e.value : ''; }

function visivel(it){
  const f = finAtual();
  if (f.length && it.fin.length && !it.fin.some(x=>f.indexOf(x)>-1)) return false;
  const s = subAtual();
  if (s && it.sub){
    if (s.indexOf(' e ') > -1 || s === 'Cães e gatos' || s === 'Anfíbios e serpentes') return true;
    if (s === 'Demais espécies' && it.sub === 'Peixes de laboratório') return false;
    if (s !== 'Demais espécies' && it.sub !== s) return false;
  }
  return true;
}

function render(){
  const alvo = $('itens'); alvo.innerHTML='';
  let cat='';
  CFG.itens.forEach(it=>{
    if (it.g !== cat){ cat = it.g; const h=document.createElement('div'); h.className='cat'; h.textContent=cat; alvo.appendChild(h); }
    const d=document.createElement('div');
    d.className='crit'+(visivel(it)?'':' off');
    d.id='c-'+it.id;
    const tags = `<span class="tag ${it.c==='OB'?'t-ob':'t-r'}">${it.c==='OB'?'Obrigatório':'Recomendado'}</span>`
      + (it.fin.length?`<span class="tag t-f">${it.fin.join(' / ')}</span>`:'')
      + (it.sub?`<span class="tag t-s">${esc(it.sub)}</span>`:'')
      + (it.cond?`<span class="tag t-c">condicionado</span>`:'');
    d.innerHTML =
      `<div class="ctop"><div class="ctxt"><span class="disp">${esc(it.rn)} · ${esc(it.d)}</span>${esc(it.t)}`
      + (it.cond?`<span class="cond"><b>Condição na norma:</b> ${esc(it.cond)} — se não se verificar, cabe "Não se aplica" com justificativa.</span>`:'')
      + (it.n?`<span class="nota">${esc(it.n)}</span>`:'')
      + (it.obs?`<span class="obsg"><b>O que observar:</b> ${esc(it.obs)}</span>`:'')
      + `</div><div class="tags">${tags}</div></div>`
      + `<div class="ctrl"><select class="status" id="s-${it.id}">`
      + STATUS.map(o=>`<option${(st[it.id]&&st[it.id].s===o)?' selected':''}>${o}</option>`).join('')
      + `</select><input class="obs" id="o-${it.id}" placeholder="Observação" value="${esc(st[it.id]?st[it.id].o:'')}"></div>`;
    alvo.appendChild(d);
    $('s-'+it.id).onchange = e => { setStatus(it.id, e.target.value); };
    $('o-'+it.id).oninput  = e => { st[it.id]=st[it.id]||{s:'—',o:''}; st[it.id].o=e.target.value; resumo(); };
    if (st[it.id]) aplicar(it.id);
  });
  resumo();
}

function setStatus(id,v){ st[id]=st[id]||{s:'—',o:''}; st[id].s=v; aplicar(id); resumo(); }

function aplicar(id){
  const c=$('c-'+id), o=$('o-'+id); if(!c) return;
  const s=(st[id]||{}).s||'—';
  c.dataset.s=s;
  const req = EXIGE_JUST.indexOf(s)>-1;
  o.classList.toggle('req',req);
  o.placeholder = req ? 'Justificativa obrigatória' : 'Observação (opcional)';
}

function ativos(){ return CFG.itens.filter(visivel); }

function resumo(){
  const its=ativos();
  const g=s=>its.filter(i=>(st[i.id]||{}).s===s).length;
  const ob=its.filter(i=>i.c==='OB');
  const semJust=its.filter(i=>EXIGE_JUST.indexOf((st[i.id]||{}).s)>-1 && !((st[i.id]||{}).o||'').trim());
  $('cTot').textContent=its.length; $('cOk').textContent=g('Atende');
  $('cNo').textContent=g('Não atende'); $('cNa').textContent=g('Não se aplica');
  if($('cIf')) $('cIf').textContent=g('Informação insuficiente');
  const obNo=ob.filter(i=>(st[i.id]||{}).s==='Não atende').length;
  const obNa=ob.filter(i=>(st[i.id]||{}).s==='Não se aplica').length;
  const obPend=ob.filter(i=>!(st[i.id]||{}).s||(st[i.id]||{}).s==='—').length;
  const v=$('verdict');
  if(semJust.length){ v.style.background='#fff7ed'; v.style.color='#92400e';
    v.textContent=`PENDENTE — ${semJust.length} item(ns) marcado(s) como Não atende, Não se aplica ou Informação insuficiente sem justificativa. A exportação está bloqueada.`; }
  else if(obPend){ v.style.background='#f1f5f9'; v.style.color='#475569';
    v.textContent=`EM PREENCHIMENTO — ${obPend} item(ns) obrigatório(s) ainda sem resposta.`; }
  else if(obNo){ v.style.background='#fee2e2'; v.style.color='#991b1b';
    v.textContent=`NÃO CONFORME — ${obNo} item(ns) obrigatório(s) não atendido(s). Regularizar antes do licenciamento.`; }
  else if(obNa){ v.style.background='#fef3c7'; v.style.color='#92400e';
    v.textContent=`CONFORME COM RESSALVA — ${obNa} item(ns) obrigatório(s) assinalado(s) como Não se aplica, com justificativa, a ser avaliada pela CEUA.`; }
  else { v.style.background='#dcfce7'; v.style.color='#166534';
    v.textContent='CONFORME — todos os itens obrigatórios aplicáveis foram atendidos.'; }
  return {semJust:semJust.length};
}

function dados(){
  const g=id=>($(id)?$(id).value:'');
  return {
    meta:{grupo:CFG.grupo, rn:CFG.rn, slug:CFG.slug, modo:MODO, emitido:new Date().toLocaleString('pt-BR')},
    instituicao:{Instituição:g('inst'),CNPJ:g('cnpj'),Endereço:g('addr'),'Município / UF':g('city'),'CEUA vinculada':g('ceua'),'E-mail da instalação':g('mail')},
    instalacao:{'Nome / identificação':g('unit'),'Finalidade':g('purpose'),'Situação':g('situation'),
      'Espécie(s) / grupo abrangido(s)':g('animalDetail'),'Campus':g('campus'),'Prédio':g('building'),
      'Sala / setor':g('room'),'Área (m²)':g('area'),'Capacidade':g('cap')},
    responsaveis:{'Coordenador da instalação':g('coord'),'CPF':g('coordCpf'),'E-mail':g('coordMail'),
      'Responsável Técnico':g('rt'),'CPF do RT':g('rtCpf'),'CRMV':g('crmv'),'UF do CRMV':g('crmvUf'),'E-mail do RT':g('rtMail')},
    itens: ativos().map(i=>({rn:i.rn,dispositivo:i.d,classificacao:i.c==='OB'?'Obrigatório':'Recomendado',
      finalidade:i.fin.join(' / ')||'todas',subgrupo:i.sub||'',condicao:i.cond||'',criterio:i.t,
      status:(st[i.id]||{}).s||'—',justificativa:(st[i.id]||{}).o||''}))
  };
}

function bloqueado(){
  if(resumo().semJust){ alert('Há itens marcados como Não atende, Não se aplica ou Informação insuficiente sem justificativa. Preencha a justificativa antes de exportar.'); return true; }
  return false;
}

function exportarPDF(){
  if(bloqueado()) return;
  const d=dados(), {jsPDF}=window.jspdf, doc=new jsPDF({unit:'pt',format:'a4'});
  let y=44; const M=40, W=515;
  const linha=(t,sz,bold,cor)=>{ doc.setFont('helvetica',bold?'bold':'normal'); doc.setFontSize(sz);
    doc.setTextColor(cor||'#0F2F32');
    doc.splitTextToSize(t,W).forEach(l=>{ if(y>790){doc.addPage();y=44;} doc.text(l,M,y); y+=sz+3; }); };
  linha(`CEUA UFPR Palotina — Instalação animal: ${d.meta.grupo}`,13,true);
  linha(`${d.meta.rn} · ${MODO==='parecerista'?'Parecer técnico':'Cadastro do coordenador'} · ${d.meta.emitido}`,8,false,'#64748b'); y+=6;
  [['Instituição',d.instituicao],['Instalação',d.instalacao],['Responsáveis',d.responsaveis]].forEach(([t,o])=>{
    linha(t,10,true); Object.entries(o).forEach(([k,v])=>{ if(v) linha(`${k}: ${v}`,8.5); }); y+=6; });
  linha('Critérios avaliados',10,true);
  d.itens.forEach(i=>{
    const cor = i.status==='Atende'?'#166534' : i.status==='Não atende'?'#991b1b' : i.status==='—'?'#94a3b8':'#92400e';
    linha(`${i.rn} · ${i.dispositivo} — ${i.classificacao}`,7.5,true,'#2A7B88');
    linha(i.criterio,8.5);
    linha(`Situação: ${i.status}` + (i.justificativa?`  |  Justificativa: ${i.justificativa}`:''),8.5,false,cor);
    y+=3;
  });
  y+=6; linha($('verdict').textContent,9,true);
  doc.save(`CIUCA_${d.meta.slug}_${MODO}_${new Date().toISOString().slice(0,10)}.pdf`);
}

function exportarXLSX(){
  if(bloqueado()) return;
  const d=dados(), wb=XLSX.utils.book_new();
  const cab=[];
  [['Instituição',d.instituicao],['Instalação',d.instalacao],['Responsáveis',d.responsaveis]].forEach(([t,o])=>{
    cab.push([t,'']); Object.entries(o).forEach(([k,v])=>cab.push([k,v])); cab.push(['','']); });
  cab.push(['Situação geral',$('verdict').textContent]);
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(cab),'Identificação');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(d.itens),'Critérios');
  XLSX.writeFile(wb,`CIUCA_${d.meta.slug}_${MODO}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

window.addEventListener('DOMContentLoaded',()=>{
  $('purpose').onchange=render;
  if($('subsel')) $('subsel').onchange=render;
  $('btnPdf').onclick=exportarPDF;
  $('btnXls').onclick=exportarXLSX;
  render();
});
})();
