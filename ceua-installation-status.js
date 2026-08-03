(function(){
  'use strict';
  var KEY='ceua-inst-ciuca-v1';
  var baseSubmit=null, baseCollect=null, baseNormalize=null;
  function id(x){return document.getElementById(x)}
  function val(x){return String((id(x)||{}).value||'').trim()}
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function install(){
    var old=id('inst_ciuca_confirm');
    if(!old||id('inst_ciuca_status_panel'))return;
    var label=old.closest&&old.closest('label');
    if(label)label.style.display='none';
    old.tabIndex=-1;old.setAttribute('aria-hidden','true');
    var p=document.createElement('div');
    p.id='inst_ciuca_status_panel';p.className='mt-4 p-4 bg-white/80 rounded-lg border border-amber-200 space-y-3';
    p.innerHTML='<div class="grid grid-cols-1 md:grid-cols-2 gap-3">'+
      '<div><label class="lbl">A instalação está cadastrada no CIUCA? <span class="text-red-500">*</span></label><select id="inst_ciuca_cadastro" class="fi"><option value="">Selecione...</option><option value="Sim">Sim</option><option value="Não">Não</option></select></div>'+
      '<div id="inst_ciuca_lic_status_box"><label class="lbl">Situação do licenciamento <span class="text-red-500">*</span></label><select id="inst_ciuca_lic_status" class="fi"><option value="">Selecione...</option><option value="Licenciamento concedido">Licenciamento concedido</option><option value="Solicitação de licenciamento em andamento">Solicitação de licenciamento em andamento</option><option value="Categoria ou modalidade ainda sem enquadramento no CIUCA">Categoria/modalidade ainda sem enquadramento ou módulo disponível no CIUCA</option><option value="Licenciamento ainda não solicitado">Licenciamento ainda não solicitado</option></select></div></div>'+
      '<div id="inst_ciuca_protocolo_box" class="hidden"><label class="lbl">Número da licença, protocolo ou identificação da solicitação <span class="text-red-500">*</span></label><input id="inst_ciuca_protocolo" class="fi" placeholder="Número da licença, protocolo ou, se ainda não houver número, data da solicitação"></div>'+
      '<div id="inst_ciuca_justificativa_box" class="hidden"><label class="lbl">Justificativa do enquadramento <span class="text-red-500">*</span></label><textarea id="inst_ciuca_justificativa" class="fi" rows="3" placeholder="Explique por que a categoria ou modalidade ainda não dispõe de enquadramento ou módulo de licenciamento aplicável no CIUCA."></textarea></div>'+
      '<div id="inst_ciuca_status_help" class="text-[.72rem] leading-relaxed rounded-lg p-3 bg-slate-50 border text-slate-600">Informe a situação real da instalação.</div>';
    (label&&label.parentNode?label.parentNode:old.parentNode).insertBefore(p,label?label.nextSibling:null);
    id('inst_ciuca_cadastro').addEventListener('change',update);
    id('inst_ciuca_lic_status').addEventListener('change',update);
    ['inst_ciuca_cadastro','inst_ciuca_lic_status','inst_ciuca_protocolo','inst_ciuca_justificativa'].forEach(function(x){id(x).addEventListener('change',save);id(x).addEventListener('input',save)});
    restore();update();wrapData();wrapSubmit();
  }
  function update(){
    var cad=val('inst_ciuca_cadastro'),st=val('inst_ciuca_lic_status'),old=id('inst_ciuca_confirm'),h=id('inst_ciuca_status_help');
    id('inst_ciuca_lic_status_box').classList.toggle('hidden',cad!=='Sim');
    id('inst_ciuca_protocolo_box').classList.toggle('hidden',st!=='Licenciamento concedido'&&st!=='Solicitação de licenciamento em andamento');
    id('inst_ciuca_justificativa_box').classList.toggle('hidden',st!=='Categoria ou modalidade ainda sem enquadramento no CIUCA');
    if(old)old.checked=cad==='Sim';
    if(cad==='Não')setHelp(h,'red','<strong>Pendência impeditiva:</strong> a instalação precisa estar cadastrada no CIUCA antes da submissão.');
    else if(st==='Licenciamento ainda não solicitado')setHelp(h,'red','<strong>Pendência impeditiva:</strong> solicite o licenciamento ou justifique formalmente a ausência de enquadramento.');
    else if(st==='Solicitação de licenciamento em andamento')setHelp(h,'blue','A instalação será registrada como cadastrada e com licenciamento em andamento. Informe o protocolo ou a data da solicitação.');
    else if(st==='Categoria ou modalidade ainda sem enquadramento no CIUCA')setHelp(h,'blue','Use esta opção quando a instalação estiver cadastrada, mas ainda não houver categoria, modalidade ou módulo aplicável no CIUCA. A justificativa será encaminhada à CEUA.');
    else if(st==='Licenciamento concedido')setHelp(h,'green','Informe o número ou a identificação da licença concedida.');
    else setHelp(h,'slate','Informe a situação real da instalação. Não declare uma regularidade que ainda não exista.');
  }
  function setHelp(el,color,html){el.className='text-[.72rem] leading-relaxed rounded-lg p-3 border bg-'+color+'-50 border-'+color+'-200 text-'+color+'-800';el.innerHTML=html}
  function issues(){
    var a=[],cad=val('inst_ciuca_cadastro'),st=val('inst_ciuca_lic_status');
    if(!val('inst_ciuca_nome'))a.push({id:'inst_ciuca_nome',label:'Nome da instalação animal'});
    if(!cad)a.push({id:'inst_ciuca_cadastro',label:'Situação de cadastro da instalação no CIUCA'});
    else if(cad==='Não')a.push({id:'inst_ciuca_cadastro',label:'A instalação deve estar cadastrada no CIUCA antes da submissão'});
    if(cad==='Sim'&&!st)a.push({id:'inst_ciuca_lic_status',label:'Situação do licenciamento'});
    if(cad==='Sim'&&(st==='Licenciamento concedido'||st==='Solicitação de licenciamento em andamento')&&!val('inst_ciuca_protocolo'))a.push({id:'inst_ciuca_protocolo',label:'Número da licença, protocolo ou data da solicitação'});
    if(cad==='Sim'&&st==='Categoria ou modalidade ainda sem enquadramento no CIUCA'&&!val('inst_ciuca_justificativa'))a.push({id:'inst_ciuca_justificativa',label:'Justificativa da ausência de enquadramento ou módulo'});
    if(cad==='Sim'&&st==='Licenciamento ainda não solicitado')a.push({id:'inst_ciuca_lic_status',label:'Licenciamento ainda não solicitado: solicite-o ou justifique a ausência de enquadramento'});
    return a;
  }
  window.abrirPendenciaInstalacao=function(i){var x=issues()[i];if(!x)return;go(3);setTimeout(function(){var e=id(x.id);if(!e)return;e.scrollIntoView({behavior:'smooth',block:'center'});e.focus();e.style.outline='3px solid #f59e0b';e.style.outlineOffset='3px';setTimeout(function(){e.style.outline='';e.style.outlineOffset=''},4000)},300)};
  function show(a){go(6);var b=id('statusBox');b.className='mb-4 p-4 rounded-lg text-sm border-2 border-amber-400 bg-amber-50 text-amber-950';b.innerHTML='<p class="font-bold text-base mb-1">⚠️ O formulário não foi registrado e o PDF não foi gerado.</p><p class="mb-3">Corrija a situação da instalação:</p><ol>'+a.map(function(x,i){return '<li class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b border-amber-200 last:border-0"><span><strong>Etapa 3 — CIUCA / Projeto:</strong> '+esc(x.label)+'</span><button type="button" onclick="abrirPendenciaInstalacao('+i+')" class="px-3 py-1.5 rounded-md bg-white border border-amber-400 text-amber-900 font-bold text-xs">Ir ao campo</button></li>'}).join('')+'</ol>';b.classList.remove('hidden');b.scrollIntoView({behavior:'smooth',block:'start'})}
  function wrapSubmit(){if(baseSubmit)return;baseSubmit=window.enviarEGerarPDF;window.enviarEGerarPDF=async function(){var a=issues();if(a.length){save();show(a);return}id('inst_ciuca_confirm').checked=val('inst_ciuca_cadastro')==='Sim';return baseSubmit()}}
  function wrapData(){
    if(!baseCollect&&typeof window.coletarDados==='function'){baseCollect=window.coletarDados;window.coletarDados=function(){var d=baseCollect();d.instalacao_ciuca_cadastrada=val('inst_ciuca_cadastro');d.instalacao_ciuca_situacao_licenciamento=val('inst_ciuca_lic_status');d.instalacao_ciuca_protocolo=val('inst_ciuca_protocolo');d.instalacao_ciuca_justificativa_enquadramento=val('inst_ciuca_justificativa');d.instalacao_ciuca_confirmada=val('inst_ciuca_cadastro')==='Sim'?'Sim':'Não';return d}}
    if(!baseNormalize&&typeof window.normalizarPayloadCEUA==='function'){baseNormalize=window.normalizarPayloadCEUA;window.normalizarPayloadCEUA=function(d){var p=baseNormalize(d);p.instalacao_ciuca_cadastrada=d.instalacao_ciuca_cadastrada||val('inst_ciuca_cadastro');p.instalacao_ciuca_situacao_licenciamento=d.instalacao_ciuca_situacao_licenciamento||val('inst_ciuca_lic_status');p.instalacao_ciuca_protocolo=d.instalacao_ciuca_protocolo||val('inst_ciuca_protocolo');p.instalacao_ciuca_justificativa_enquadramento=d.instalacao_ciuca_justificativa_enquadramento||val('inst_ciuca_justificativa');return p}}
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify({cad:val('inst_ciuca_cadastro'),st:val('inst_ciuca_lic_status'),pro:val('inst_ciuca_protocolo'),jus:val('inst_ciuca_justificativa')}))}catch(e){}}
  function restore(){try{var d=JSON.parse(localStorage.getItem(KEY)||'null');if(!d)return;id('inst_ciuca_cadastro').value=d.cad||'';id('inst_ciuca_lic_status').value=d.st||'';id('inst_ciuca_protocolo').value=d.pro||'';id('inst_ciuca_justificativa').value=d.jus||''}catch(e){}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
