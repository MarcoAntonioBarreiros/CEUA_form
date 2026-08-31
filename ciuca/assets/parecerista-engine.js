(function(){
const CONFIG=(window.CIUCA_PARECERISTA_CONFIG||{})[CFG.slug]||{};
const PARAMETROS=(window.CIUCA_PARECERISTA_PARAMETROS||{})[CFG.slug]||{};
const STATUS=['—','Atende','Não atende','Informação insuficiente','Não se aplica'];
const FIN={
  'Produção/criação':['criação'],
  'Manutenção':['manutenção'],
  'Utilização':['experimentação'],
  'Produção/criação + Manutenção':['criação','manutenção'],
  'Produção/criação + Utilização':['criação','experimentação'],
  'Manutenção + Utilização':['manutenção','experimentação'],
  'Produção/criação + Manutenção + Utilização':['criação','manutenção','experimentação']
};
const TITULOS={1:'Identificação',2:'Cenário avaliado',3:'Infraestrutura, ambiência e alojamento',4:'Procedimentos, manejo e biossegurança',5:'Conclusão do parecerista'};
const state={};
let etapa=1;
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const decode=s=>String(s||'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ');
const valor=id=>String($(id)?.value||'').trim();
const selecionados=classe=>Array.from(document.querySelectorAll('.'+classe+':checked')).map(x=>x.value);
function guiaHtml(texto){
  return esc(decode(texto)).replace(/\s+;\s+/g,'<br>').replace(/\n/g,'<br>');
}
function opcoes(lista){ return lista.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join(''); }
function camposCenario(){
  let html=`<div><label class="lbl">Finalidade</label><select id="purpose" class="fi">${opcoes(Object.keys(FIN))}</select></div>
    <div><label class="lbl">Número máximo de animais</label><input id="nanimais" class="fi" type="number" min="0"></div>`;
  if(CONFIG.subgrupos) html+=`<div><label class="lbl">Grupo avaliado</label><select id="subsel" class="fi">${opcoes(CONFIG.subgrupos)}</select></div>`;
  if(CONFIG.especiesPorSubgrupo) html+=`<div><label class="lbl">Espécie/grupo avaliado</label><select id="species" class="fi"></select></div>`;
  else if(CONFIG.especie){
    html+=CONFIG.especie.free
      ?`<div><label class="lbl">${esc(CONFIG.especie.label)}</label><input id="species" class="fi" placeholder="${esc(CONFIG.especie.placeholder||'')}"></div>`
      :`<div><label class="lbl">${esc(CONFIG.especie.label)}</label><select id="species" class="fi">${opcoes(CONFIG.especie.options||[])}</select></div>`;
  }
  if(CONFIG.gm) html+=`<div><label class="lbl">Animais geneticamente modificados?</label><select id="gm" class="fi"><option>Não</option><option>Sim</option></select></div>`;
  return html;
}
function checks(titulo,classe,itens){
  if(!itens) return '';
  return `<div class="cat">${esc(titulo)}</div><div class="checks">${Object.entries(itens).map(([k,v])=>`<label class="chk"><input type="checkbox" class="${classe}" value="${esc(k)}"> ${esc(v)}</label>`).join('')}</div>`;
}
function montarPagina(){
  const wrap=document.querySelector('.wrap');
  wrap.innerHTML=`
    <div class="card hero-card"><div class="top"><div style="display:flex;gap:12px;align-items:center"><div class="logo">CEUA</div><div><div class="eyebrow">UFPR Setor Palotina</div><div class="title">Parecer — ${esc(CFG.grupo)}</div><div class="sub">${esc(CFG.rn)} · matriz auditada · ${CFG.itens.length} critérios</div></div></div><div class="badge">Ficha técnica do relator</div></div></div>
    <div class="card flow-card"><div class="steps">${Object.keys(TITULOS).map((n,i)=>`${i?'<span class="step-line"></span>':''}<button type="button" class="step-dot" data-go="${n}" aria-label="Etapa ${n}: ${esc(TITULOS[n])}">${n}</button>`).join('')}</div><div class="step-meta">Etapa <b id="curNum">1</b> de 5 · <span id="curTitle"></span></div></div>
    <section class="card step" data-step="1"><div class="step-head"><span class="step-tag">Etapa 1</span><h2 class="step-title">Identificação</h2></div><p class="info">Esta ficha organiza a avaliação técnica do parecerista e não substitui o cadastro CIUCA preenchido pelo coordenador.</p><div class="grid g3">
      <div><label class="lbl">Processo SEI</label><input id="sei" class="fi"></div><div><label class="lbl">Data</label><input id="data" type="date" class="fi"></div><div><label class="lbl">Parecerista</label><input id="parecerista" class="fi"></div>
      <div style="grid-column:span 2"><label class="lbl">Instalação avaliada</label><input id="instalacao" class="fi"></div><div><label class="lbl">Campus / local</label><input id="local" class="fi"></div>
      <div><label class="lbl">Coordenador da instalação</label><input id="coord" class="fi"></div><div><label class="lbl">Responsável Técnico</label><input id="rt" class="fi"></div><div><label class="lbl">CRMV / UF</label><input id="crmv" class="fi"></div>
      <div style="grid-column:span 3"><label class="lbl">Projeto, solicitação ou atividade relacionada</label><input id="projeto" class="fi"></div></div><div class="nav"><span></span><button class="btn primary" data-go="2">Próximo →</button></div></section>
    <section class="card step" data-step="2"><div class="step-head"><span class="step-tag">Etapa 2</span><h2 class="step-title">Cenário avaliado</h2></div><p class="info"><b>Marque apenas o que existe.</b> Os filtros controlam os dispositivos normativos e os parâmetros práticos aplicáveis.</p><div class="grid g3">${camposCenario()}</div>${checks('Fase/categoria animal','phase',CONFIG.fases)}${checks('Estruturas/ambientes existentes','typ',CONFIG.tipos)}<div style="margin-top:14px"><label class="lbl">Descrição do cenário</label><textarea id="cenario" class="fi" rows="5" placeholder="Descreva instalações, lotação, manejo, procedimentos e limitações observadas."></textarea></div><p class="info">Critérios normativos ativos: <b id="critCount">0</b>. Parâmetros complementares do Guia: <b id="guideCount">0</b>.</p><div class="nav"><button class="btn" data-go="1">← Anterior</button><button class="btn primary" data-go="3">Próximo →</button></div></section>
    <section class="card step" data-step="3"><div class="step-head"><span class="step-tag">Etapa 3</span><h2 class="step-title">${esc(TITULOS[3])}</h2></div><div id="ambList"></div><div class="nav"><button class="btn" data-go="2">← Anterior</button><button class="btn primary" data-go="4">Próximo →</button></div></section>
    <section class="card step" data-step="4"><div class="step-head"><span class="step-tag">Etapa 4</span><h2 class="step-title">${esc(TITULOS[4])}</h2></div><div id="reqList"></div><div class="nav"><button class="btn" data-go="3">← Anterior</button><button class="btn primary" data-go="5">Próximo →</button></div></section>
    <section class="card step" data-step="5"><div class="step-head"><span class="step-tag">Etapa 5</span><h2 class="step-title">Conclusão do parecerista</h2></div><div id="veredito" class="verdict">PREENCHIMENTO NÃO INICIADO</div><div class="pills"><span class="pill p-d">Ativos: <b id="cTot">0</b></span><span class="pill p-ok">Atende: <b id="cOk">0</b></span><span class="pill p-no">Não atende: <b id="cNao">0</b></span><span class="pill p-if">Informação insuficiente: <b id="cSem">0</b></span><span class="pill p-na">Não se aplica: <b id="cNa">0</b></span><span class="pill p-pend">Não avaliados: <b id="cPend">0</b></span></div><div class="grid g2">
      <div><label class="lbl">Conclusão técnica</label><select id="conclusao" class="fi"><option></option><option>Informações suficientes — favorável ao encaminhamento</option><option>Favorável com exigências/recomendações de adequação</option><option>Diligência — solicitar complementação</option><option>Não favorável no momento</option></select></div>
      <div><label class="lbl">Necessita visita técnica?</label><select id="visita" class="fi"><option></option><option>Não</option><option>Sim, antes da aprovação</option><option>Sim, como recomendação posterior</option><option>A critério da plenária</option></select></div>
      <div style="grid-column:span 2"><label class="lbl">Pendências/documentos a solicitar</label><textarea id="pendencias" class="fi" rows="3"></textarea></div><div style="grid-column:span 2"><label class="lbl">Exigências ou recomendações de adequação</label><textarea id="recomendacoes" class="fi" rows="3"></textarea></div><div style="grid-column:span 2"><label class="lbl">Texto do parecer complementar</label><textarea id="parecer" class="fi" rows="7"></textarea></div></div>
      <div id="statusBox" class="info" style="display:none"></div><div class="nav"><button class="btn" data-go="4">← Anterior</button><div><button class="btn" id="btnTexto">Gerar texto-base</button> <button class="btn primary" id="btnPdf">Gerar PDF do parecer</button> <button class="btn" id="btnLimpar">Limpar</button></div></div></section>
    <div class="foot">Fonte técnica: ${esc(CFG.rn)} e Guia Brasileiro do CONCEA. O texto oficial vigente prevalece.</div>`;
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>irEtapa(Number(b.dataset.go)));
  $('btnTexto').onclick=textoBase;
  $('btnPdf').onclick=gerarPdf;
  $('btnLimpar').onclick=()=>{ if(confirm('Limpar todo o formulário?')) location.reload(); };
  $('data').value=new Date().toISOString().slice(0,10);
  document.querySelectorAll('#purpose,#subsel,#species,#gm,.phase,.typ').forEach(el=>el.addEventListener('change',()=>{ if(el.id==='subsel') atualizarEspecies(); renderAll(); }));
  atualizarEspecies();
}
function atualizarEspecies(){
  if(!CONFIG.especiesPorSubgrupo||!$('species')) return;
  const atual=$('species').value;
  const lista=CONFIG.especiesPorSubgrupo[valor('subsel')]||[];
  $('species').innerHTML=opcoes(lista);
  if(lista.includes(atual)) $('species').value=atual;
}
function contexto(){ return {subgrupo:valor('subsel'),especie:valor('species'),gm:valor('gm'),fases:selecionados('phase'),tipos:selecionados('typ')}; }
function visivel(it){
  const f=FIN[valor('purpose')]||[];
  if(f.length&&it.fin.length&&!it.fin.some(x=>f.includes(x))) return false;
  const s=valor('subsel');
  if(s&&it.sub){
    if(s.includes(' e ')||s==='Cães e gatos'||s==='Anfíbios e serpentes') return true;
    if(s==='Demais espécies'&&it.sub==='Peixes de laboratório') return false;
    if(s!=='Demais espécies'&&it.sub!==s) return false;
  }
  return true;
}
function ativos(){ return CFG.itens.filter(visivel); }
function extrasAtivos(step){ const ctx=contexto(); return (CONFIG.extras||[]).filter(x=>x.step===step&&(!x.when||x.when(ctx))); }
function parametro(it){
  const ctx=contexto();
  let texto=decode(PARAMETROS[it.id]||'');
  if(CONFIG.parametro) texto=CONFIG.parametro(ctx,it,texto)||texto;
  const anexos=(CONFIG.append&&CONFIG.append[it.id])||[];
  if(anexos.length) texto=[texto,...anexos].filter(Boolean).join('\n');
  return texto;
}
function itemNormativo(it){
  const dados=state[it.id]||{status:'—',obs:''};
  const par=parametro(it);
  return `<div class="crit" id="it-${esc(it.id)}" data-s="${esc(dados.status)}"><div class="ctop"><div class="ctxt"><span class="disp">${esc(it.rn)} · ${esc(it.d)}</span>${esc(it.t)}${it.cond?`<span class="cond"><b>Condição:</b> ${esc(it.cond)}</span>`:''}${it.n?`<span class="nota">${esc(it.n)}</span>`:''}${par?`<span class="obsg"><b>Parâmetro do Guia / o que conferir:</b><br>${guiaHtml(par)}</span>`:''}</div><div class="tags"><span class="tag ${it.c==='OB'?'t-ob':'t-r'}">${it.c==='OB'?'Obrigatório':'Recomendado'}</span>${it.fin.length?`<span class="tag t-f">${esc(it.fin.join(' / '))}</span>`:''}${it.sub?`<span class="tag t-s">${esc(it.sub)}</span>`:''}</div></div><div class="ctrl"><select class="status" data-id="${esc(it.id)}">${STATUS.map(x=>`<option${dados.status===x?' selected':''}>${esc(x)}</option>`).join('')}</select><input class="obs" data-obs="${esc(it.id)}" value="${esc(dados.obs)}" placeholder="Evidência, justificativa ou diligência necessária"></div></div>`;
}
function itemGuia(x){
  const id='guia-'+x.id;
  const dados=state[id]||{status:'—',obs:''};
  const par=typeof x.param==='function'?x.param(contexto()):x.param;
  return `<div class="crit guide-extra" id="it-${esc(id)}" data-s="${esc(dados.status)}"><div class="ctop"><div class="ctxt"><span class="disp">Guia Brasileiro do CONCEA · parâmetro complementar</span>${esc(x.title)}<span class="cond">${esc(x.base)}</span><span class="obsg"><b>O que conferir:</b><br>${guiaHtml(par)}</span></div><div class="tags"><span class="tag t-r">Guia / apoio técnico</span></div></div><div class="ctrl"><select class="status" data-id="${esc(id)}">${STATUS.map(v=>`<option${dados.status===v?' selected':''}>${esc(v)}</option>`).join('')}</select><input class="obs" data-obs="${esc(id)}" value="${esc(dados.obs)}" placeholder="Evidência ou observação técnica"></div></div>`;
}
function ligarControles(alvo){
  alvo.querySelectorAll('[data-id]').forEach(el=>el.onchange=()=>{ const id=el.dataset.id; state[id]=state[id]||{status:'—',obs:''}; state[id].status=el.value; aplicarEstado(id); resumo(); });
  alvo.querySelectorAll('[data-obs]').forEach(el=>el.oninput=()=>{ const id=el.dataset.obs; state[id]=state[id]||{status:'—',obs:''}; state[id].obs=el.value; aplicarEstado(id); resumo(); });
}
function aplicarEstado(id){
  const el=$('it-'+id); if(!el) return;
  const d=state[id]||{status:'—',obs:''}; el.dataset.s=d.status;
  const obs=el.querySelector('[data-obs]');
  const exige=['Não atende','Informação insuficiente','Não se aplica'].includes(d.status)&&!String(d.obs||'').trim();
  if(obs) obs.classList.toggle('req',exige);
}
function renderSecao(step,grupo,alvoId){
  const norm=ativos().filter(x=>x.g===grupo);
  const extras=extrasAtivos(step);
  let html=norm.length?`<div class="cat">Critérios da matriz normativa auditada</div>${norm.map(itemNormativo).join('')}`:'';
  if(extras.length) html+=`<div class="cat">Parâmetros complementares recuperados do Guia</div>${extras.map(itemGuia).join('')}`;
  const alvo=$(alvoId); alvo.innerHTML=html||'<div class="info">Nenhum item aplicável ao cenário selecionado.</div>'; ligarControles(alvo);
}
function renderAll(){
  renderSecao('amb','Infraestrutura','ambList');
  renderSecao('req','Procedimentos','reqList');
  $('critCount').textContent=ativos().length;
  $('guideCount').textContent=extrasAtivos('amb').length+extrasAtivos('req').length;
  resumo();
}
function resumo(){
  const itens=ativos();
  const dados=itens.map(x=>({item:x,...(state[x.id]||{status:'—',obs:''})}));
  const conta=s=>dados.filter(x=>x.status===s).length;
  $('cTot').textContent=itens.length; $('cOk').textContent=conta('Atende'); $('cNao').textContent=conta('Não atende'); $('cSem').textContent=conta('Informação insuficiente'); $('cNa').textContent=conta('Não se aplica'); $('cPend').textContent=conta('—');
  const obrig=dados.filter(x=>x.item.c==='OB');
  const nao=obrig.filter(x=>x.status==='Não atende').length;
  const sem=obrig.filter(x=>x.status==='Informação insuficiente'||x.status==='—').length;
  const nasem=obrig.filter(x=>x.status==='Não se aplica'&&!x.obs.trim()).length;
  const v=$('veredito');
  if(nao){v.textContent=`NÃO CONFORME — ${nao} item(ns) obrigatório(s) não atendido(s).`;v.className='verdict bad';}
  else if(sem||nasem){v.textContent='EM DILIGÊNCIA/AVALIAÇÃO — há requisito obrigatório não avaliado, informação insuficiente ou justificativa pendente.';v.className='verdict warn';}
  else{v.textContent='CONFORME — requisitos obrigatórios atendidos ou com não aplicabilidade justificada. Recomendados não bloqueiam.';v.className='verdict good';}
}
function irEtapa(n){
  etapa=Math.max(1,Math.min(5,n));
  document.querySelectorAll('.step').forEach(x=>x.classList.toggle('active',Number(x.dataset.step)===etapa));
  document.querySelectorAll('.step-dot').forEach(x=>{ const k=Number(x.dataset.go); x.classList.toggle('active',k===etapa);x.classList.toggle('done',k<etapa); });
  $('curNum').textContent=etapa; $('curTitle').textContent=TITULOS[etapa];
  if(etapa===3||etapa===4) renderAll(); if(etapa===5) resumo();
  window.scrollTo({top:0,behavior:'smooth'});
}
function validarJustificativas(){
  const ids=[...ativos().map(x=>x.id),...extrasAtivos('amb').map(x=>'guia-'+x.id),...extrasAtivos('req').map(x=>'guia-'+x.id)];
  const falta=ids.find(id=>{ const d=state[id]; return d&&['Não atende','Informação insuficiente','Não se aplica'].includes(d.status)&&!d.obs.trim(); });
  if(!falta) return true;
  const el=$('it-'+falta); const step=Number(el?.closest('.step')?.dataset.step||3); irEtapa(step); setTimeout(()=>{el?.scrollIntoView({behavior:'smooth',block:'center'});el?.querySelector('[data-obs]')?.focus();},100); alert('Todo item marcado como Não atende, Informação insuficiente ou Não se aplica precisa de justificativa/evidência.'); return false;
}
function textoBase(){
  const problem=ativos().map(x=>({item:x,...(state[x.id]||{status:'—',obs:''})})).filter(x=>['Não atende','Informação insuficiente'].includes(x.status));
  let texto=`Em avaliação técnica da instalação ${valor('instalacao')||'[identificar]'}, vinculada ao processo SEI ${valor('sei')||'[informar]'}, foram analisados os dispositivos de ${CFG.rn} e os parâmetros aplicáveis do Guia Brasileiro do CONCEA.\n\n`;
  texto+=problem.length?`Foram identificados os seguintes pontos: ${problem.map(x=>`${x.item.rn} ${x.item.d} — ${x.item.t}${x.obs?' ('+x.obs+')':''}`).join('; ')}.\n\n`:'Não foram identificados requisitos não atendidos entre os itens avaliados, consideradas as justificativas registradas.\n\n';
  texto+=`Conclusão técnica: ${valor('conclusao')||'[selecionar conclusão]'}. ${valor('visita')?'Visita técnica: '+valor('visita')+'.':''}`;
  $('parecer').value=texto;
}
function coletar(){
  const ctx=contexto();
  const itens=ativos().map(x=>({rn:x.rn,dispositivo:x.d,classificacao:x.c,texto:x.t,...(state[x.id]||{status:'—',obs:''})}));
  const extras=[...extrasAtivos('amb'),...extrasAtivos('req')].map(x=>({titulo:x.title,...(state['guia-'+x.id]||{status:'—',obs:''})}));
  return {cab:{'Processo SEI':valor('sei'),'Data':valor('data'),'Parecerista':valor('parecerista'),'Instalação':valor('instalacao'),'Campus/local':valor('local'),'Coordenador':valor('coord'),'Responsável Técnico':valor('rt'),'CRMV/UF':valor('crmv'),'Projeto/atividade':valor('projeto'),'Finalidade':valor('purpose'),'Grupo':ctx.subgrupo,'Espécie/táxon':ctx.especie,'Número máximo de animais':valor('nanimais'),'Fases':ctx.fases.map(k=>CONFIG.fases?.[k]||k).join('; '),'Estruturas':ctx.tipos.map(k=>CONFIG.tipos?.[k]||k).join('; '),'Animais GM':ctx.gm,'Cenário':valor('cenario')},itens,extras,fim:{'Conclusão':valor('conclusao'),'Visita técnica':valor('visita'),'Pendências':valor('pendencias'),'Exigências/recomendações':valor('recomendacoes'),'Parecer complementar':valor('parecer')}};
}
function gerarPdf(){
  if(!validarJustificativas()) return;
  if(!window.jspdf||!window.jspdf.jsPDF){ mostrarStatus('Não foi possível gerar o PDF: a biblioteca jsPDF 2.5.1 não foi carregada pelo navegador.',true); return; }
  const d=coletar(),doc=new window.jspdf.jsPDF('p','mm','a4'),ML=14,MR=196,CW=182;let y=17;
  const ck=h=>{if(y+h>280){doc.addPage();y=17;}};
  const sec=t=>{ck(10);doc.setFillColor(29,91,100);doc.rect(ML,y-4,CW,6,'F');doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(8);doc.text(t,ML+2,y);y+=8;};
  const linhas=(texto,w)=>doc.splitTextToSize(String(texto||'—'),w);
  const kv=(k,v)=>{const a=linhas(k+':',48),b=linhas(v,130);ck(Math.max(a.length,b.length)*4+2);doc.setFontSize(7.3);doc.setFont('helvetica','bold');doc.setTextColor(100,116,139);doc.text(a,ML,y);doc.setFont('helvetica','normal');doc.setTextColor(15,47,50);doc.text(b,ML+50,y);y+=Math.max(a.length,b.length)*4+2;};
  doc.setFillColor(29,91,100);doc.rect(0,0,210,13,'F');doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text(`UFPR · CEUA Palotina — Parecer técnico: ${CFG.grupo}`,ML,7);doc.setFont('helvetica','normal');doc.setFontSize(7);doc.text(`${CFG.rn} · matriz normativa auditada`,ML,11);y=19;
  sec('IDENTIFICAÇÃO E CENÁRIO');Object.entries(d.cab).filter(([,v])=>v).forEach(([k,v])=>kv(k,v));
  sec('CRITÉRIOS NORMATIVOS AVALIADOS');
  d.itens.forEach(it=>{const cab=`${it.rn} · ${it.dispositivo} — ${it.classificacao==='OB'?'Obrigatório':'Recomendado'}`;const h=linhas(cab,170),t=linhas(it.texto,170),o=it.obs?linhas('Evidência/observação: '+it.obs,170):[];ck((h.length+t.length+o.length)*3.5+8);doc.setFontSize(7.4);doc.setFont('helvetica','bold');doc.setTextColor(42,123,136);doc.text(h,ML,y);y+=h.length*3.5;doc.setFont('helvetica','normal');doc.setTextColor(15,47,50);doc.text(t,ML,y);y+=t.length*3.5;doc.setFont('helvetica','bold');doc.setTextColor(it.status==='Não atende'?180:it.status==='Atende'?22:100,it.status==='Atende'?101:70,it.status==='Atende'?52:70);doc.text('Situação: '+it.status,ML,y);y+=4;if(o.length){doc.setFont('helvetica','italic');doc.setTextColor(71,85,105);doc.text(o,ML,y);y+=o.length*3.5;}y+=3;});
  const avaliados=d.extras.filter(x=>x.status!=='—'||x.obs);if(avaliados.length){sec('PARÂMETROS COMPLEMENTARES DO GUIA');avaliados.forEach(x=>{kv(x.titulo,`${x.status}${x.obs?' — '+x.obs:''}`);});}
  sec('CONCLUSÃO DO PARECERISTA');Object.entries(d.fim).forEach(([k,v])=>kv(k,v));y+=8;ck(22);doc.setTextColor(15,47,50);doc.setFont('helvetica','bold');doc.setFontSize(8);doc.text('ASSINATURA DO(A) PARECERISTA:',ML,y);doc.line(ML+50,y+1,MR,y+1);
  const total=doc.internal.getNumberOfPages();for(let p=1;p<=total;p++){doc.setPage(p);doc.setFontSize(6.5);doc.setFont('helvetica','normal');doc.setTextColor(100,116,139);doc.text(`Parecer técnico CEUA · ${CFG.grupo} · ${CFG.rn}`,ML,290);doc.text(`Pág. ${p}/${total}`,MR,290,{align:'right'});}
  doc.save(`Parecer_CIUCA_${CFG.slug}_${new Date().toISOString().slice(0,10)}.pdf`);mostrarStatus('PDF do parecer gerado. Confira o documento antes de assiná-lo e juntá-lo ao processo SEI.',false);
}
function mostrarStatus(msg,erro){const b=$('statusBox');b.style.display='block';b.className='info'+(erro?' error':' success');b.textContent=msg;}
window.addEventListener('DOMContentLoaded',()=>{montarPagina();renderAll();irEtapa(1);});
window.CIUCA_PARECERISTA_TEST={ativos,contexto,extrasAtivos,parametro};
})();
