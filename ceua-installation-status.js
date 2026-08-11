(function(){
  'use strict';
  var KEY='ceua-inst-ciuca-v2';
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
      '<div id="inst_ciuca_lic_status_box"><label class="lbl">Situação do licenciamento <span class="text-red-500">*</span></label><select id="inst_ciuca_lic_status" class="fi"><option value="">Selecione...</option><option value="Com licenciamento">Com licenciamento</option><option value="Com licenciamento solicitado">Com licenciamento solicitado</option><option value="Sem licenciamento">Sem licenciamento</option></select></div>'+
      '<div id="inst_ciuca_nao_motivo_box" class="hidden"><label class="lbl">Enquadramento (instalação não cadastrada) <span class="text-red-500">*</span></label><select id="inst_ciuca_nao_motivo" class="fi"><option value="">Selecione...</option><option value="Propriedade particular">Propriedade particular (não é biotério sujeito ao CIUCA)</option><option value="Centro de triagem de animais silvestres">Centro de triagem/manejo de animais silvestres</option><option value="Cadastro solicitado e em andamento">Cadastro solicitado e em andamento (aceito temporariamente)</option></select></div></div>'+
      '<div id="inst_ciuca_protocolo_box" class="hidden"><label class="lbl">Número da licença, protocolo ou data da solicitação</label><input id="inst_ciuca_protocolo" class="fi" placeholder="Número da licença/protocolo ou, se ainda não houver, a data da solicitação"></div>'+
      '<div id="inst_ciuca_justificativa_box" class="hidden"><label class="lbl">Justificativa / observação (será avaliada pela CEUA)</label><textarea id="inst_ciuca_justificativa" class="fi" rows="3" placeholder="Descreva o local e a situação (ex.: propriedade particular, centro de triagem de silvestres) ou informações complementares para a análise da CEUA."></textarea></div>'+
      '<div id="inst_ciuca_status_help" class="text-[.72rem] leading-relaxed rounded-lg p-3 bg-slate-50 border text-slate-600">Informe a situação real da instalação. Todas as situações permitem gerar o PDF; a CEUA avaliará o enquadramento.</div>';
    (label&&label.parentNode?label.parentNode:old.parentNode).insertBefore(p,label?label.nextSibling:null);
    id('inst_ciuca_cadastro').addEventListener('change',update);
    id('inst_ciuca_lic_status').addEventListener('change',update);
    id('inst_ciuca_nao_motivo').addEventListener('change',update);
    ['inst_ciuca_cadastro','inst_ciuca_lic_status','inst_ciuca_nao_motivo','inst_ciuca_protocolo','inst_ciuca_justificativa'].forEach(function(x){id(x).addEventListener('change',save);id(x).addEventListener('input',save)});
    restore();update();wrapData();wrapSubmit();
  }
  function update(){
    var cad=val('inst_ciuca_cadastro'),st=val('inst_ciuca_lic_status'),mo=val('inst_ciuca_nao_motivo'),old=id('inst_ciuca_confirm'),h=id('inst_ciuca_status_help');
    id('inst_ciuca_lic_status_box').classList.toggle('hidden',cad!=='Sim');
    id('inst_ciuca_nao_motivo_box').classList.toggle('hidden',cad!=='Não');
    var showProt=(cad==='Sim'&&(st==='Com licenciamento'||st==='Com licenciamento solicitado'))||(cad==='Não'&&mo==='Cadastro solicitado e em andamento');
    var showJust=(cad==='Sim'&&st==='Sem licenciamento')||(cad==='Não'&&(mo==='Propriedade particular'||mo==='Centro de triagem de animais silvestres'));
    id('inst_ciuca_protocolo_box').classList.toggle('hidden',!showProt);
    id('inst_ciuca_justificativa_box').classList.toggle('hidden',!showJust);
    if(old)old.checked=cad==='Sim';
    if(!cad)setHelp(h,'slate','Informe a situação real da instalação. Todas as situações permitem gerar o PDF; a CEUA avaliará o enquadramento.');
    else if(cad==='Sim'&&st==='Com licenciamento')setHelp(h,'green','Instalação cadastrada e licenciada. Informe o número ou a identificação da licença, se houver.');
    else if(cad==='Sim'&&st==='Com licenciamento solicitado')setHelp(h,'blue','Licenciamento solicitado / em andamento. Informe o protocolo ou a data da solicitação. Segue para avaliação da CEUA.');
    else if(cad==='Sim'&&st==='Sem licenciamento')setHelp(h,'amber','Instalação cadastrada, sem licenciamento. A CEUA avaliará. <strong>A partir de setembro</strong> poderá ser exigida justificativa ou anuência do CONCEA.');
    else if(cad==='Não'&&mo==='Cadastro solicitado e em andamento')setHelp(h,'blue','Cadastro solicitado e em andamento — aceito temporariamente nesta fase de transição. Informe o protocolo ou a data da solicitação.');
    else if(cad==='Não'&&mo==='Propriedade particular')setHelp(h,'blue','Enquadramento aceito: propriedade particular não sujeita a cadastro/licenciamento no CIUCA. Descreva o local na justificativa. A CEUA avaliará.');
    else if(cad==='Não'&&mo==='Centro de triagem de animais silvestres')setHelp(h,'blue','Enquadramento aceito: centro de triagem/manejo de animais silvestres. Descreva a situação na justificativa. A CEUA avaliará.');
    else if(cad==='Não')setHelp(h,'slate','Selecione o enquadramento da instalação não cadastrada.');
    else setHelp(h,'slate','Informe a situação real da instalação.');
  }
  function setHelp(el,color,html){el.className='text-[.72rem] leading-relaxed rounded-lg p-3 border bg-'+color+'-50 border-'+color+'-200 text-'+color+'-800';el.innerHTML=html}
  function issues(){
    var a=[],cad=val('inst_ciuca_cadastro'),st=val('inst_ciuca_lic_status'),mo=val('inst_ciuca_nao_motivo');
    if(!val('inst_ciuca_nome'))a.push({id:'inst_ciuca_nome',label:'Nome da instalação animal'});
    if(!cad)a.push({id:'inst_ciuca_cadastro',label:'Situação de cadastro da instalação no CIUCA'});
    else if(cad==='Sim'&&!st)a.push({id:'inst_ciuca_lic_status',label:'Situação do licenciamento'});
    else if(cad==='Não'&&!mo)a.push({id:'inst_ciuca_nao_motivo',label:'Enquadramento da instalação não cadastrada'});
    return a;
  }
  window.abrirPendenciaInstalacao=function(i){var x=issues()[i];if(!x)return;go(3);setTimeout(function(){var e=id(x.id);if(!e)return;e.scrollIntoView({behavior:'smooth',block:'center'});e.focus();e.style.outline='3px solid #f59e0b';e.style.outlineOffset='3px';setTimeout(function(){e.style.outline='';e.style.outlineOffset=''},4000)},300)};
  function show(a){go(6);var b=id('statusBox');b.className='mb-4 p-4 rounded-lg text-sm border-2 border-amber-400 bg-amber-50 text-amber-950';b.innerHTML='<p class="font-bold text-base mb-1">⚠️ O formulário não foi registrado e o PDF não foi gerado.</p><p class="mb-3">Complete a situação da instalação:</p><ol>'+a.map(function(x,i){return '<li class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b border-amber-200 last:border-0"><span><strong>Etapa 3 — CIUCA / Projeto:</strong> '+esc(x.label)+'</span><button type="button" onclick="abrirPendenciaInstalacao('+i+')" class="px-3 py-1.5 rounded-md bg-white border border-amber-400 text-amber-900 font-bold text-xs">Ir ao campo</button></li>'}).join('')+'</ol>';b.classList.remove('hidden');b.scrollIntoView({behavior:'smooth',block:'start'})}
  function wrapSubmit(){if(baseSubmit)return;baseSubmit=window.enviarEGerarPDF;window.enviarEGerarPDF=async function(){var a=issues();if(a.length){save();show(a);return}id('inst_ciuca_confirm').checked=val('inst_ciuca_cadastro')==='Sim';return baseSubmit()}}
  function wrapData(){
    if(!baseCollect&&typeof window.coletarDados==='function'){baseCollect=window.coletarDados;window.coletarDados=function(){var d=baseCollect();d.instalacao_ciuca_cadastrada=val('inst_ciuca_cadastro');d.instalacao_ciuca_situacao_licenciamento=val('inst_ciuca_lic_status');d.instalacao_ciuca_enquadramento_nao_cadastrada=val('inst_ciuca_nao_motivo');d.instalacao_ciuca_protocolo=val('inst_ciuca_protocolo');d.instalacao_ciuca_justificativa=val('inst_ciuca_justificativa');d.instalacao_ciuca_confirmada=val('inst_ciuca_cadastro')==='Sim'?'Sim':'Não';return d}}
    if(!baseNormalize&&typeof window.normalizarPayloadCEUA==='function'){baseNormalize=window.normalizarPayloadCEUA;window.normalizarPayloadCEUA=function(d){var p=baseNormalize(d);p.instalacao_ciuca_cadastrada=d.instalacao_ciuca_cadastrada||val('inst_ciuca_cadastro');p.instalacao_ciuca_situacao_licenciamento=d.instalacao_ciuca_situacao_licenciamento||val('inst_ciuca_lic_status');p.instalacao_ciuca_enquadramento_nao_cadastrada=d.instalacao_ciuca_enquadramento_nao_cadastrada||val('inst_ciuca_nao_motivo');p.instalacao_ciuca_protocolo=d.instalacao_ciuca_protocolo||val('inst_ciuca_protocolo');p.instalacao_ciuca_justificativa=d.instalacao_ciuca_justificativa||val('inst_ciuca_justificativa');return p}}
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify({cad:val('inst_ciuca_cadastro'),st:val('inst_ciuca_lic_status'),mo:val('inst_ciuca_nao_motivo'),pro:val('inst_ciuca_protocolo'),jus:val('inst_ciuca_justificativa')}))}catch(e){}}
  function restore(){try{var d=JSON.parse(localStorage.getItem(KEY)||'null');if(!d)return;id('inst_ciuca_cadastro').value=d.cad||'';id('inst_ciuca_lic_status').value=d.st||'';if(id('inst_ciuca_nao_motivo'))id('inst_ciuca_nao_motivo').value=d.mo||'';id('inst_ciuca_protocolo').value=d.pro||'';id('inst_ciuca_justificativa').value=d.jus||''}catch(e){}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
