(function(){
  'use strict';
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
      '<div id="inst_ciuca_protocolo_box" class="hidden"><label class="lbl">Número do processo SEI do cadastro solicitado <span class="text-red-500">*</span></label><input id="inst_ciuca_protocolo" class="fi" placeholder="Ex.: 23075.000000/2026-00"></div>'+
      '<div id="inst_ciuca_justificativa_box" class="hidden"><label class="lbl">Justificativa <span class="text-red-500">*</span></label><textarea id="inst_ciuca_justificativa" class="fi" rows="3" placeholder="Descreva o local e a situação (ex.: propriedade particular; centro de triagem de silvestres) para a análise da CEUA."></textarea></div>'+
      '<div id="inst_ciuca_status_help" class="text-[.72rem] leading-relaxed rounded-lg p-3 bg-slate-50 border text-slate-600">Informe a situação real da instalação. A CEUA avaliará o enquadramento.</div>';
    (label&&label.parentNode?label.parentNode:old.parentNode).insertBefore(p,label?label.nextSibling:null);
    id('inst_ciuca_cadastro').addEventListener('change',update);
    id('inst_ciuca_lic_status').addEventListener('change',update);
    id('inst_ciuca_nao_motivo').addEventListener('change',update);
    id('inst_ciuca_protocolo').addEventListener('input',update);
    id('inst_ciuca_justificativa').addEventListener('input',update);
    update();wrapData();wrapSubmit();
  }
  function needSEI(cad,mo){return cad==='Não'&&mo==='Cadastro solicitado e em andamento'}
  function needJust(cad,mo){return cad==='Não'&&(mo==='Propriedade particular'||mo==='Centro de triagem de animais silvestres')}
  function update(){
    var cad=val('inst_ciuca_cadastro'),st=val('inst_ciuca_lic_status'),mo=val('inst_ciuca_nao_motivo'),old=id('inst_ciuca_confirm'),h=id('inst_ciuca_status_help');
    id('inst_ciuca_lic_status_box').classList.toggle('hidden',cad!=='Sim');
    id('inst_ciuca_nao_motivo_box').classList.toggle('hidden',cad!=='Não');
    var ns=needSEI(cad,mo),nj=needJust(cad,mo);
    id('inst_ciuca_protocolo_box').classList.toggle('hidden',!ns);
    id('inst_ciuca_justificativa_box').classList.toggle('hidden',!nj);
    if(old)old.checked=cad==='Sim';
    if(!cad){setHelp(h,'slate','Informe a situação real da instalação. A CEUA avaliará o enquadramento.');return;}
    if(cad==='Sim'&&!st){setHelp(h,'slate','Selecione a situação do licenciamento.');return;}
    if(cad==='Sim'){setHelp(h,'blue','Instalação cadastrada — gerará o PDF; a CEUA avaliará o licenciamento.');return;}
    if(!mo){setHelp(h,'slate','Selecione o enquadramento da instalação não cadastrada.');return;}
    if(ns&&!val('inst_ciuca_protocolo')){setHelp(h,'red','<strong>Obrigatório para gerar o PDF:</strong> informe o número do processo SEI do cadastro solicitado.');return;}
    if(nj&&!val('inst_ciuca_justificativa')){setHelp(h,'red','<strong>Obrigatório para gerar o PDF:</strong> descreva a justificativa do enquadramento.');return;}
    if(mo==='Cadastro solicitado e em andamento')setHelp(h,'blue','Cadastro solicitado e em andamento — aceito temporariamente. Seguirá para avaliação da CEUA.');
    else setHelp(h,'blue','Enquadramento aceito (local não sujeito ao CIUCA) — a CEUA avaliará.');
  }
  function setHelp(el,color,html){el.className='text-[.72rem] leading-relaxed rounded-lg p-3 border bg-'+color+'-50 border-'+color+'-200 text-'+color+'-800';el.innerHTML=html}
  function issues(){
    var a=[],cad=val('inst_ciuca_cadastro'),st=val('inst_ciuca_lic_status'),mo=val('inst_ciuca_nao_motivo');
    if(!val('inst_ciuca_nome'))a.push({id:'inst_ciuca_nome',label:'Nome da instalação animal'});
    if(!cad){a.push({id:'inst_ciuca_cadastro',label:'Situação de cadastro da instalação no CIUCA'});return a;}
    if(cad==='Sim'){ if(!st)a.push({id:'inst_ciuca_lic_status',label:'Situação do licenciamento'}); return a; }
    if(!mo){a.push({id:'inst_ciuca_nao_motivo',label:'Enquadramento da instalação não cadastrada'});return a;}
    if(needSEI(cad,mo)&&!val('inst_ciuca_protocolo'))a.push({id:'inst_ciuca_protocolo',label:'Número do processo SEI do cadastro solicitado'});
    if(needJust(cad,mo)&&!val('inst_ciuca_justificativa'))a.push({id:'inst_ciuca_justificativa',label:'Justificativa do enquadramento'});
    return a;
  }
  window.abrirPendenciaInstalacao=function(i){var x=issues()[i];if(!x)return;go(3);setTimeout(function(){var e=id(x.id);if(!e)return;e.scrollIntoView({behavior:'smooth',block:'center'});e.focus();e.style.outline='3px solid #f59e0b';e.style.outlineOffset='3px';setTimeout(function(){e.style.outline='';e.style.outlineOffset=''},4000)},300)};
  function show(a){go(6);var b=id('statusBox');b.className='mb-4 p-4 rounded-lg text-sm border-2 border-amber-400 bg-amber-50 text-amber-950';b.innerHTML='<p class="font-bold text-base mb-1">⚠️ O formulário não foi registrado e o PDF não foi gerado.</p><p class="mb-3">Complete a situação da instalação:</p><ol>'+a.map(function(x,i){return '<li class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b border-amber-200 last:border-0"><span><strong>Etapa 3 — CIUCA / Projeto:</strong> '+esc(x.label)+'</span><button type="button" onclick="abrirPendenciaInstalacao('+i+')" class="px-3 py-1.5 rounded-md bg-white border border-amber-400 text-amber-900 font-bold text-xs">Ir ao campo</button></li>'}).join('')+'</ol>';b.classList.remove('hidden');b.scrollIntoView({behavior:'smooth',block:'start'})}
  function wrapSubmit(){if(baseSubmit)return;baseSubmit=window.enviarEGerarPDF;window.enviarEGerarPDF=async function(){var a=issues();if(a.length){show(a);return}id('inst_ciuca_confirm').checked=val('inst_ciuca_cadastro')==='Sim';return baseSubmit()}}
  function wrapData(){
    if(!baseCollect&&typeof window.coletarDados==='function'){baseCollect=window.coletarDados;window.coletarDados=function(){var d=baseCollect();d.instalacao_ciuca_cadastrada=val('inst_ciuca_cadastro');d.instalacao_ciuca_situacao_licenciamento=val('inst_ciuca_lic_status');d.instalacao_ciuca_enquadramento_nao_cadastrada=val('inst_ciuca_nao_motivo');d.instalacao_ciuca_protocolo=val('inst_ciuca_protocolo');d.instalacao_ciuca_justificativa=val('inst_ciuca_justificativa');d.instalacao_ciuca_confirmada=val('inst_ciuca_cadastro')==='Sim'?'Sim':'Não';return d}}
    if(!baseNormalize&&typeof window.normalizarPayloadCEUA==='function'){baseNormalize=window.normalizarPayloadCEUA;window.normalizarPayloadCEUA=function(d){var p=baseNormalize(d);p.instalacao_ciuca_cadastrada=d.instalacao_ciuca_cadastrada||val('inst_ciuca_cadastro');p.instalacao_ciuca_situacao_licenciamento=d.instalacao_ciuca_situacao_licenciamento||val('inst_ciuca_lic_status');p.instalacao_ciuca_enquadramento_nao_cadastrada=d.instalacao_ciuca_enquadramento_nao_cadastrada||val('inst_ciuca_nao_motivo');p.instalacao_ciuca_protocolo=d.instalacao_ciuca_protocolo||val('inst_ciuca_protocolo');p.instalacao_ciuca_justificativa=d.instalacao_ciuca_justificativa||val('inst_ciuca_justificativa');return p}}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
