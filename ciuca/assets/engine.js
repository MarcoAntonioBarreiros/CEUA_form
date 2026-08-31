
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
let etapa = 1;
let categoriaAtiva = '';
const CIUCA_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw9PB2XNSFrX42tQfgnnfXzlW3J8VFweVydGTJzdMSeL3fTwe472lu9qpughGQsu4UQ4A/exec';
const SEI_DESTINO = 'UFPR / R / PL / CEUA';
const TITULOS_ETAPAS = {
  1:'Identificação institucional',
  2:'Dados da instalação',
  3:'Coordenador e Responsável Técnico',
  4:'Checklist',
  5:'Resumo e exportação'
};
const $ = id => document.getElementById(id);
const esc = s => String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CAMPOS_OBRIGATORIOS = [
  {id:'coord',etapa:3,nome:'Coordenador da instalação'}, {id:'coordCpf',etapa:3,nome:'CPF do coordenador'},
  {id:'coordMail',etapa:3,nome:'E-mail do coordenador'}, {id:'rt',etapa:3,nome:'Responsável Técnico'},
  {id:'rtCpf',etapa:3,nome:'CPF do RT'}, {id:'rtMail',etapa:3,nome:'E-mail do RT'},
  {id:'crmv',etapa:3,nome:'CRMV'}, {id:'crmvUf',etapa:3,nome:'UF do CRMV'}
];

function marcarCamposObrigatorios(){
  CAMPOS_OBRIGATORIOS.forEach(campo=>{
    const el=$(campo.id);
    if(!el) return;
    el.required=true;
    const label=el.parentElement&&el.parentElement.querySelector('.lbl');
    if(label&&!label.dataset.required){ label.dataset.required='true'; label.textContent+=' *'; }
  });
}

function validarCamposObrigatorios(){
  const ausentes=[];
  CAMPOS_OBRIGATORIOS.forEach(campo=>{
    const el=$(campo.id);
    if(!el) return;
    const vazio=!String(el.value||'').trim();
    el.classList.toggle('req',vazio);
    el.setAttribute('aria-invalid',vazio?'true':'false');
    if(vazio) ausentes.push({...campo,el});
  });
  if(!ausentes.length) return true;
  const primeiro=ausentes[0];
  alert(`Preencha os campos obrigatórios antes de registrar: ${ausentes.map(c=>c.nome).join(', ')}.`);
  irEtapa(primeiro.etapa);
  window.setTimeout(()=>{ primeiro.el.focus(); primeiro.el.scrollIntoView({behavior:'smooth',block:'center'}); },80);
  return false;
}

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

function ativos(){ return CFG.itens.filter(visivel); }

function categoriasAtivas(){
  const categorias=[];
  ativos().forEach(it=>{ if(categorias.indexOf(it.g)===-1) categorias.push(it.g); });
  return categorias;
}

function prepararEtapa(card,numero,titulo){
  card.classList.add('step');
  card.dataset.step=String(numero);
  const h2=card.querySelector('h2');
  if(!h2) return;
  h2.textContent=titulo;
  h2.classList.add('step-title');
  const head=document.createElement('div');
  head.className='step-head';
  const tag=document.createElement('span');
  tag.className='step-tag';
  tag.textContent=`Etapa ${numero}`;
  h2.before(head);
  head.append(tag,h2);
}

function botaoNavegacao(rotulo,acao,classe){
  const b=document.createElement('button');
  b.type='button';
  b.className='btn'+(classe?' '+classe:'');
  b.textContent=rotulo;
  b.onclick=acao;
  return b;
}

function adicionarNavegacao(card,anterior,proximo){
  const nav=document.createElement('div');
  nav.className='nav step-nav';
  if(anterior) nav.append(botaoNavegacao('← Anterior',anterior));
  else nav.append(document.createElement('span'));
  if(proximo) nav.append(botaoNavegacao('Próximo →',proximo,'primary'));
  card.append(nav);
}

function montarFluxo(){
  if($('stepper')) return;
  const wrap=document.querySelector('.wrap');
  if(!wrap) return;
  const cards=Array.from(wrap.children).filter(el=>el.classList.contains('card'));
  if(cards.length<5) return;
  const [cabecalho,instituicao,instalacao,responsaveis,checklist]=cards;
  cabecalho.classList.add('hero-card');

  const stepper=document.createElement('div');
  stepper.id='stepper';
  stepper.className='card flow-card';
  stepper.innerHTML=`<div class="steps" aria-label="Etapas do formulário">
    ${Object.keys(TITULOS_ETAPAS).map((n,i)=>`${i?'<span class="step-line" aria-hidden="true"></span>':''}<button type="button" class="step-dot" data-step="${n}" aria-label="Etapa ${n}: ${TITULOS_ETAPAS[n]}">${n}</button>`).join('')}
  </div><div class="step-meta">Etapa <b id="curNum">1</b> de 5 · <span id="curTitle"></span></div>`;
  cabecalho.after(stepper);
  stepper.querySelectorAll('.step-dot').forEach(b=>{ b.onclick=()=>irEtapa(Number(b.dataset.step)); });

  prepararEtapa(instituicao,1,TITULOS_ETAPAS[1]);
  prepararEtapa(instalacao,2,TITULOS_ETAPAS[2]);
  prepararEtapa(responsaveis,3,TITULOS_ETAPAS[3]);
  prepararEtapa(checklist,4,TITULOS_ETAPAS[4]);
  adicionarNavegacao(instituicao,null,()=>irEtapa(2));
  adicionarNavegacao(instalacao,()=>irEtapa(1),()=>irEtapa(3));
  adicionarNavegacao(responsaveis,()=>irEtapa(2),()=>irEtapa(4));

  const itens=$('itens');
  const abas=document.createElement('div');
  abas.id='secTabs';
  abas.className='section-tabs';
  abas.setAttribute('role','tablist');
  const rotulo=document.createElement('div');
  rotulo.id='secLabel';
  rotulo.className='section-label';
  itens.before(abas,rotulo);

  const navChecklist=document.createElement('div');
  navChecklist.className='nav checklist-nav';
  navChecklist.append(botaoNavegacao('← Anterior',anteriorChecklist));
  const progresso=document.createElement('span');
  progresso.id='secProgress';
  progresso.className='hint section-progress';
  navChecklist.append(progresso,botaoNavegacao('Próximo →',proximoChecklist,'primary'));
  itens.after(navChecklist);

  const resumo=document.createElement('div');
  resumo.className='card';
  prepararEtapa(resumo,5,TITULOS_ETAPAS[5]);
  const pills=checklist.querySelector('.pills');
  const verdict=$('verdict');
  const exportNav=Array.from(checklist.querySelectorAll('.nav')).find(n=>n.querySelector('#btnRegistrarPdf,#btnPdf'));
  const pendentes=document.createElement('span');
  pendentes.className='pill p-pend';
  pendentes.innerHTML='Pendências: <b id="cPend">0</b>';
  pills.append(pendentes);
  resumo.append(pills,verdict);
  const abrirPendencias=botaoNavegacao('Ver pendências',verPendencias,'pending-button');
  abrirPendencias.id='btnPend';
  resumo.append(abrirPendencias);
  const seiInfo=document.createElement('div');
  seiInfo.className='info';
  seiInfo.innerHTML=`<b>Tramitação no SEI:</b> registre os dados na base interna da CEUA/UNIBIO e gere o PDF para assinatura do coordenador da instalação e do responsável técnico. Depois, encaminhe o processo para <b>${esc(SEI_DESTINO)}</b>.`;
  const statusBox=document.createElement('div');
  statusBox.id='statusBox';
  statusBox.className='info';
  statusBox.style.display='none';
  const registrar=$('btnRegistrarPdf')||$('btnPdf');
  registrar.id='btnRegistrarPdf';
  registrar.textContent='Registrar dados no Google Sheet e gerar PDF para SEI';
  resumo.append(seiInfo,statusBox);
  exportNav.classList.add('summary-nav');
  exportNav.prepend(botaoNavegacao('← Anterior',()=>irEtapa(4)));
  resumo.append(exportNav);
  const foot=wrap.querySelector('.foot');
  wrap.insertBefore(resumo,foot||null);
}

function render(){
  const alvo=$('itens'); alvo.innerHTML='';
  const categorias=categoriasAtivas();
  if(categorias.indexOf(categoriaAtiva)===-1) categoriaAtiva=categorias[0]||'';
  const tabs=$('secTabs');
  if(tabs){
    tabs.innerHTML=categorias.map((cat,i)=>`<button type="button" class="section-tab${cat===categoriaAtiva?' active':''}" role="tab" aria-selected="${cat===categoriaAtiva}" data-index="${i}">${i+1}. ${esc(cat)}</button>`).join('');
    tabs.querySelectorAll('.section-tab').forEach(b=>{ b.onclick=()=>irCategoria(Number(b.dataset.index)); });
  }
  if($('secLabel')) $('secLabel').innerHTML=categoriaAtiva?`Seção <b>${categorias.indexOf(categoriaAtiva)+1}</b> de <b>${categorias.length}</b> — ${esc(categoriaAtiva)}`:'Nenhum critério aplicável para os filtros atuais.';
  if($('secProgress')) $('secProgress').textContent=categoriaAtiva?`Seção ${categorias.indexOf(categoriaAtiva)+1} de ${categorias.length}`:'';
  ativos().filter(it=>it.g===categoriaAtiva).forEach(it=>{
    const d=document.createElement('div');
    d.className='crit';
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

function irCategoria(indice){
  const categorias=categoriasAtivas();
  categoriaAtiva=categorias[indice]||categorias[0]||'';
  render();
  const checklist=document.querySelector('.step[data-step="4"]');
  if(checklist) checklist.scrollIntoView({behavior:'smooth',block:'start'});
}

function proximoChecklist(){
  const categorias=categoriasAtivas();
  const indice=categorias.indexOf(categoriaAtiva);
  if(indice<categorias.length-1) irCategoria(indice+1);
  else irEtapa(5);
}

function anteriorChecklist(){
  const categorias=categoriasAtivas();
  const indice=categorias.indexOf(categoriaAtiva);
  if(indice>0) irCategoria(indice-1);
  else irEtapa(3);
}

function irEtapa(numero){
  etapa=Math.max(1,Math.min(5,numero));
  document.querySelectorAll('.step').forEach(card=>card.classList.toggle('active',Number(card.dataset.step)===etapa));
  document.querySelectorAll('.step-dot').forEach(dot=>{
    const n=Number(dot.dataset.step);
    dot.classList.toggle('active',n===etapa);
    dot.classList.toggle('done',n<etapa);
    dot.setAttribute('aria-current',n===etapa?'step':'false');
  });
  if($('curNum')) $('curNum').textContent=etapa;
  if($('curTitle')) $('curTitle').textContent=TITULOS_ETAPAS[etapa];
  if(etapa===4) render();
  if(etapa===5) resumo();
  window.scrollTo({top:0,behavior:'smooth'});
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

function pendentes(){
  return ativos().filter(it=>{
    const atual=st[it.id]||{s:'—',o:''};
    const semResposta=!atual.s||atual.s==='—';
    const semJustificativa=EXIGE_JUST.indexOf(atual.s)>-1 && !(atual.o||'').trim();
    return semResposta||semJustificativa;
  });
}

function verPendencias(){
  const primeira=pendentes()[0];
  if(!primeira) return;
  categoriaAtiva=primeira.g;
  irEtapa(4);
  window.setTimeout(()=>{
    const card=$('c-'+primeira.id);
    if(!card) return;
    card.classList.add('attention');
    card.scrollIntoView({behavior:'smooth',block:'center'});
    const controle=card.querySelector((st[primeira.id]||{}).s==='—'?'.status':'.obs');
    if(controle) controle.focus();
    window.setTimeout(()=>card.classList.remove('attention'),3500);
  },80);
}

function resumo(){
  const its=ativos();
  const g=s=>its.filter(i=>(st[i.id]||{}).s===s).length;
  const ob=its.filter(i=>i.c==='OB');
  const semJust=its.filter(i=>EXIGE_JUST.indexOf((st[i.id]||{}).s)>-1 && !((st[i.id]||{}).o||'').trim());
  $('cTot').textContent=its.length; $('cOk').textContent=g('Atende');
  $('cNo').textContent=g('Não atende'); $('cNa').textContent=g('Não se aplica');
  if($('cIf')) $('cIf').textContent=g('Informação insuficiente');
  const listaPendentes=pendentes();
  if($('cPend')) $('cPend').textContent=listaPendentes.length;
  if($('btnPend')) $('btnPend').disabled=listaPendentes.length===0;
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
  return {semJust:semJust.length,pendentes:listaPendentes.length,obPend};
}

function dados(){
  const g=id=>($(id)?$(id).value:'');
  const instalacao={'Nome / identificação':g('unit'),'Finalidade':g('purpose'),'Situação':g('situation'),
    'Espécie(s) / grupo abrangido(s)':g('animalDetail'),'Campus':g('campus'),'Prédio':g('building'),
    'Sala / setor':g('room'),'Área (m²)':g('area'),'Capacidade':g('cap')};
  if($('subsel')) instalacao['Espécie / subgrupo selecionado']=g('subsel');
  return {
    meta:{grupo:CFG.grupo, rn:CFG.rn, slug:CFG.slug, modo:MODO, emitido:new Date().toLocaleString('pt-BR'),
      sei_destino:SEI_DESTINO,versao_formulario:'CIUCA Instalações v3 auditada 2026-08-31',origem:'Formulários CIUCA GitHub Pages'},
    instituicao:{Instituição:g('inst'),CNPJ:g('cnpj'),Endereço:g('addr'),'Município / UF':g('city'),'CEUA vinculada':g('ceua'),'E-mail da instalação':g('mail')},
    instalacao,
    responsaveis:{'Coordenador da instalação':g('coord'),'CPF':g('coordCpf'),'E-mail':g('coordMail'),
      'Responsável Técnico':g('rt'),'CPF do RT':g('rtCpf'),'CRMV':g('crmv'),'UF do CRMV':g('crmvUf'),'E-mail do RT':g('rtMail')},
    itens: ativos().map(i=>({rn:i.rn,dispositivo:i.d,categoria:i.g,classificacao:i.c==='OB'?'Obrigatório':'Recomendado',
      finalidade:i.fin.join(' / ')||'todas',subgrupo:i.sub||'',condicao:i.cond||'',criterio:i.t,
      status:(st[i.id]||{}).s||'—',justificativa:(st[i.id]||{}).o||''}))
  };
}

function payloadAppsScript(){
  const d=dados();
  const g=id=>($(id)?$(id).value:'');
  const contagem=status=>d.itens.filter(i=>i.status===status).length;
  const resumoAtual={
    criterios_ativos:d.itens.length,
    obrigatorios:d.itens.filter(i=>i.classificacao==='Obrigatório').length,
    recomendados:d.itens.filter(i=>i.classificacao==='Recomendado').length,
    atende:contagem('Atende'),
    nao_atende:contagem('Não atende'),
    nao_se_aplica:contagem('Não se aplica'),
    informacao_insuficiente:contagem('Informação insuficiente'),
    situacao_geral:$('verdict')?$('verdict').textContent:''
  };
  return {
    meta:d.meta,
    g1:d.instituicao,
    g2:d.instalacao,
    g3:d.responsaveis,
    itens:d.itens,
    resumo:resumoAtual,
    grupo_animal:d.meta.grupo,
    slug:d.meta.slug,
    rn:d.meta.rn,
    modo:d.meta.modo,
    instituicao:g('inst'),
    cnpj:g('cnpj'),
    endereco:g('addr'),
    municipio_uf:g('city'),
    ceua_vinculada:g('ceua'),
    email_instalacao:g('mail'),
    nome_instalacao:g('unit'),
    finalidade:g('purpose'),
    situacao:g('situation'),
    animal_grupo:g('subsel'),
    animal_detalhamento:g('animalDetail'),
    campus:g('campus'),
    predio:g('building'),
    sala_setor:g('room'),
    area_m2:g('area'),
    capacidade:g('cap'),
    coordenador:g('coord'),
    cpf_coord:g('coordCpf'),
    email_coord:g('coordMail'),
    rt:g('rt'),
    cpf_rt:g('rtCpf'),
    crmv:g('crmv'),
    crmv_uf:g('crmvUf'),
    email_rt:g('rtMail'),
    situacao_geral:resumoAtual.situacao_geral
  };
}

function showStatus(tipo,mensagem){
  const box=$('statusBox');
  if(!box) return;
  box.style.display='block';
  box.style.borderColor=tipo==='error'?'#fecaca':tipo==='success'?'#bbf7d0':'#fde68a';
  box.style.background=tipo==='error'?'#fee2e2':tipo==='success'?'#dcfce7':'#fef3c7';
  box.style.color=tipo==='error'?'#991b1b':tipo==='success'?'#166534':'#92400e';
  box.textContent=(tipo==='success'?'✅ ':tipo==='error'?'❌ ':'⚠️ ')+mensagem;
}

async function enviarAppsScript(payload,fetchImpl){
  const enviar=fetchImpl||(window.fetch&&window.fetch.bind(window));
  if(!enviar) throw new Error('recurso de rede indisponível');
  await enviar(CIUCA_APPS_SCRIPT_URL,{
    method:'POST',
    mode:'no-cors',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify(payload)
  });
}

async function registrarDados(fetchImpl){
  if(!validarCamposObrigatorios()) return false;
  if(bloqueado()) return false;
  showStatus('warn','Registrando dados na planilha interna da CEUA/UNIBIO...');
  try{
    const enviar=typeof fetchImpl==='function'?fetchImpl:undefined;
    await enviarAppsScript(payloadAppsScript(),enviar);
    showStatus('success','Dados registrados na planilha interna. Gerando o PDF para o SEI...');
    return true;
  }catch(erro){
    showStatus('error','Erro ao registrar dados: '+(erro&&erro.message?erro.message:'falha de rede'));
    return false;
  }
}

async function registrarEpdf(fetchImpl){
  if(!validarCamposObrigatorios()||bloqueado()) return false;
  let arquivo;
  try{
    arquivo=montarPDF();
  }catch(erro){
    showStatus('error','Não foi possível preparar o PDF: '+(erro&&erro.message?erro.message:'erro desconhecido'));
    return false;
  }
  const registrado=await registrarDados(fetchImpl);
  if(!registrado) return false;
  try{
    arquivo.doc.save(arquivo.nome);
    showStatus('success','Dados registrados no Google Sheet da CEUA e PDF gerado para o processo SEI.');
    return true;
  }catch(erro){
    showStatus('error','Dados registrados no Google Sheet, mas o PDF não pôde ser baixado: '+(erro&&erro.message?erro.message:'erro desconhecido'));
    return false;
  }
}

function bloqueado(){
  const estado=resumo();
  if(estado.semJust){ alert('Há itens marcados como Não atende, Não se aplica ou Informação insuficiente sem justificativa. Preencha a justificativa antes de registrar.'); return true; }
  if(estado.obPend){ alert(`Ainda há ${estado.obPend} critério(s) obrigatório(s) sem resposta. Responda os obrigatórios antes de registrar no Google Sheet da CEUA.`); return true; }
  return false;
}

function montarPDF(){
  if(!window.jspdf||typeof window.jspdf.jsPDF!=='function') throw new Error('a biblioteca jsPDF 2.5.1 não foi carregada pelo navegador');
  const d=dados(), {jsPDF}=window.jspdf, doc=new jsPDF('p','mm','a4');
  const ML=14, MR=196, CW=182;
  let y=16;
  const ckpg=h=>{ if(y+h>282){ doc.addPage(); y=16; } };
  const sec=t=>{
    ckpg(10); doc.setFillColor(22,69,73); doc.rect(ML,y-4,CW,6,'F');
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(8);
    doc.text(t,ML+2,y); y+=7;
  };
  const kv=(k,val)=>{
    ckpg(7); doc.setTextColor(100,116,139); doc.setFont('helvetica','bold'); doc.setFontSize(7.4);
    const kl=doc.splitTextToSize(`${k}:`,50); doc.text(kl,ML,y);
    doc.setTextColor(30,41,59); doc.setFont('helvetica','normal');
    const vl=doc.splitTextToSize(String(val||'—'),128); doc.text(vl,ML+52,y);
    y+=Math.max(5,Math.max(kl.length,vl.length)*4);
  };
  doc.setFillColor(22,69,73); doc.rect(0,0,210,12,'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10);
  doc.text('UFPR · CEUA Palotina — Cadastro de Instalação Animal (CIUCA)',ML,7);
  doc.setFontSize(7); doc.setFont('helvetica','normal');
  doc.text(`${d.meta.grupo} · ${d.meta.rn} · ${MODO==='parecerista'?'Parecer técnico':'Cadastro do coordenador'}`,ML,10.5);
  y=18;
  sec('1. IDENTIFICAÇÃO INSTITUCIONAL E VÍNCULO CIUCA');
  Object.entries(d.instituicao).forEach(([k,val])=>kv(k,val));
  sec('2. DADOS DA INSTALAÇÃO');
  Object.entries(d.instalacao).forEach(([k,val])=>kv(k,val));
  sec('3. COORDENADOR E RESPONSÁVEL TÉCNICO');
  Object.entries(d.responsaveis).forEach(([k,val])=>kv(k,val));
  sec('4. CHECKLIST');
  kv('Critérios ativos',String(d.itens.length));
  let categoria='';
  d.itens.forEach(i=>{
    if(i.categoria!==categoria){
      categoria=i.categoria; ckpg(8); doc.setFillColor(225,244,246); doc.rect(ML,y-3,CW,5,'F');
      doc.setTextColor(22,69,73); doc.setFont('helvetica','bold'); doc.setFontSize(7);
      doc.text(String(categoria||'Critérios').toUpperCase().slice(0,90),ML+1,y); y+=6;
    }
    const referencia=`${i.rn} · ${i.dispositivo}`;
    const criterio=doc.splitTextToSize(i.criterio,CW-10);
    const justificativa=i.justificativa?doc.splitTextToSize(`Justificativa/observação: ${i.justificativa}`,CW-10):[];
    ckpg(7+criterio.length*3.5+justificativa.length*3.5);
    doc.setTextColor(42,123,136); doc.setFont('helvetica','bold'); doc.setFontSize(7);
    doc.text(referencia,ML+2,y);
    doc.setTextColor(100,116,139);
    doc.text(`${i.classificacao} · ${i.status==='—'?'não avaliado':i.status}`,MR-2,y,{align:'right'}); y+=4;
    doc.setTextColor(30,41,59); doc.setFont('helvetica','normal'); doc.text(criterio,ML+2,y); y+=criterio.length*3.5+1.5;
    if(justificativa.length){
      doc.setTextColor(146,64,14); doc.setFont('helvetica','italic'); doc.text(justificativa,ML+2,y);
      y+=justificativa.length*3.5+1.5;
    }
  });
  const respondidos=d.itens.filter(i=>i.status!=='—').length;
  const obrigatorios=d.itens.filter(i=>i.classificacao==='Obrigatório');
  const recomendados=d.itens.filter(i=>i.classificacao==='Recomendado');
  sec('RESUMO');
  kv('Critérios respondidos',`${respondidos} de ${d.itens.length}`);
  kv('Obrigatórios atendidos',`${obrigatorios.filter(i=>i.status==='Atende').length} de ${obrigatorios.length}`);
  kv('Recomendados atendidos',`${recomendados.filter(i=>i.status==='Atende').length} de ${recomendados.length}`);
  kv('Situação geral',$('verdict').textContent);
  sec('TRAMITAÇÃO NO SEI');
  kv('Destino SEI',SEI_DESTINO);
  kv('Orientação','Abrir processo SEI e encaminhar para UFPR / R / PL / CEUA com este PDF assinado pelo coordenador da instalação e pelo responsável técnico, acompanhado de despacho solicitando avaliação da CEUA e encaminhamento para cadastro ou regularização no CIUCA.');
  y+=8; ckpg(28); doc.setTextColor(30,41,59); doc.setFont('helvetica','bold'); doc.setFontSize(8);
  doc.text('ASSINATURA DO COORDENADOR DA INSTALAÇÃO:',ML,y); doc.line(ML+65,y+1,MR,y+1); y+=12;
  doc.text('ASSINATURA DO RESPONSÁVEL TÉCNICO:',ML,y); doc.line(ML+58,y+1,MR,y+1);
  return {doc,nome:`CIUCA_${d.meta.slug}_${MODO}_${new Date().toISOString().slice(0,10)}.pdf`};
}

window.addEventListener('DOMContentLoaded',()=>{
  montarFluxo();
  marcarCamposObrigatorios();
  $('purpose').onchange=render;
  if($('subsel')) $('subsel').onchange=render;
  $('btnRegistrarPdf').onclick=()=>registrarEpdf();
  render();
  irEtapa(1);
});
})();
