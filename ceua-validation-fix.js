(function () {
  'use strict';

  var DRAFT_KEY = 'ceua-solicitacao-rascunho-v5';
  var pending = [];
  var saveTimer;

  function all(name) { return Array.prototype.slice.call(document.getElementsByName(name)); }
  function id(name) { return document.getElementById(name); }
  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function buildCollector() {
    if (typeof validarCamposEssenciaisPDF !== 'function') throw new Error('Validador principal não encontrado.');
    var source = validarCamposEssenciaisPDF.toString();
    var start = source.indexOf('if(pendentes.length){');
    if (start < 0) throw new Error('Estrutura do validador principal não reconhecida.');
    source = source.slice(0, start) + 'return pendentes;\n}';
    return (0, eval)('(' + source + ')');
  }

  var collectEssential;

  function collectPending() {
    if (!collectEssential) collectEssential = buildCollector();
    var list = collectEssential();
    if (!String((id('inst_ciuca_nome') || {}).value || '').trim()) {
      list.push({ id: 'inst_ciuca_nome', label: 'Nome da instalação animal cadastrada no CIUCA', step: 3 });
    }
    if (!(id('inst_ciuca_confirm') || {}).checked) {
      list.push({ id: 'inst_ciuca_confirm', label: 'Declaração sobre a instalação no CIUCA', step: 3 });
    }
    if (!(id('relatorio_final_ciente') || {}).checked) {
      list.push({ id: 'relatorio_final_ciente', label: 'Ciência sobre a entrega do relatório final', step: 6 });
    }
    var seen = {};
    return list.filter(function (item) {
      var key = [item.step, item.id || item.name, item.index || 0, item.label].join('|');
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  window.abrirPendenciaCEUA = function (index) {
    var item = pending[index];
    if (!item) return;
    go(item.step);
    setTimeout(function () {
      var element = item.id ? id(item.id) : all(item.name)[item.index || 0];
      if (!element) return;
      try { element.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { element.scrollIntoView(); }
      if (element.focus) element.focus();
      var old = element.style.outline;
      element.style.outline = '3px solid #f59e0b';
      element.style.outlineOffset = '3px';
      setTimeout(function () { element.style.outline = old; element.style.outlineOffset = ''; }, 4000);
    }, 300);
  };

  function showPending(list) {
    pending = list;
    go(6);
    var stepNames = ['', 'Identificação', 'Equipe', 'CIUCA / Projeto', 'Animais', 'Procedimentos', 'Finalização'];
    var rows = list.map(function (item, index) {
      return '<li class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b border-amber-200 last:border-0">' +
        '<span><strong>Etapa ' + item.step + ' — ' + escapeHtml(stepNames[item.step]) + ':</strong> ' + escapeHtml(item.label) + '</span>' +
        '<button type="button" onclick="abrirPendenciaCEUA(' + index + ')" class="px-3 py-1.5 rounded-md bg-white border border-amber-400 text-amber-900 font-bold text-xs">Ir ao campo</button></li>';
    }).join('');
    var box = id('statusBox');
    if (!box) return window.alert('O formulário possui ' + list.length + ' pendência(s).');
    box.className = 'mb-4 p-4 rounded-lg text-sm border-2 border-amber-400 bg-amber-50 text-amber-950';
    box.innerHTML = '<p class="font-bold text-base mb-1">⚠️ O formulário não foi registrado e o PDF não foi gerado.</p>' +
      '<p class="mb-3">Foram encontradas <strong>' + list.length + '</strong> pendência(s). Corrija os itens abaixo e tente novamente.</p><ol>' + rows + '</ol>';
    box.classList.remove('hidden');
    try { box.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { box.scrollIntoView(); }
  }

  function snapshot() {
    var form = id('F');
    if (!form) return null;
    var fields = [];
    Array.prototype.slice.call(form.querySelectorAll('input,select,textarea')).forEach(function (element) {
      var type = String(element.type || '').toLowerCase();
      if (['button', 'submit', 'reset', 'file'].indexOf(type) >= 0) return;
      var item = { id: element.id || '', name: element.name || '', type: type, value: element.value || '', checked: !!element.checked };
      if (!item.id && item.name) item.index = all(item.name).indexOf(element);
      if (item.id || item.name) fields.push(item);
    });
    return {
      counts: { species: all('sn[]').length, collaborators: all('cn[]').length, drugs: all('dn[]').length },
      fields: fields
    };
  }

  function saveDraft() {
    try { var data = snapshot(); if (data) localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch (e) {}
  }
  function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} }
  function restoreDraft() {
    var raw;
    try { raw = localStorage.getItem(DRAFT_KEY); } catch (e) { return; }
    if (!raw) return;
    var data;
    try { data = JSON.parse(raw); } catch (e) { return; }
    try {
      while (all('sn[]').length < Number(data.counts && data.counts.species || 1)) addSp();
      while (all('cn[]').length < Number(data.counts && data.counts.collaborators || 0)) addC();
      while (all('dn[]').length < Number(data.counts && data.counts.drugs || 0)) addDr();
      data.fields.forEach(function (item) {
        var element = item.id ? id(item.id) : all(item.name)[item.index || 0];
        if (!element) return;
        if (item.type === 'checkbox' || item.type === 'radio') element.checked = !!item.checked;
        else element.value = item.value == null ? '' : item.value;
      });
      if (typeof toggleEnsino === 'function') toggleEnsino();
      if (typeof avaliarRN53 === 'function') avaliarRN53();
      if (id('r_nome') && id('termoNome')) id('termoNome').textContent = id('r_nome').value || '\u00a0';
    } catch (e) { console.warn('CEUA: rascunho parcialmente restaurado.', e); }
  }

  function removeLocalPdf() {
    Array.prototype.slice.call(document.querySelectorAll('button')).forEach(function (button) {
      var text = String(button.textContent || '').toLowerCase();
      var action = String(button.getAttribute('onclick') || '');
      if (text.indexOf('apenas gerar pdf') >= 0 || /^\s*gerarPDF\s*\(/.test(action)) button.remove();
    });
    var button = id('btnEnviar');
    if (button) button.textContent = 'Registrar dados e gerar PDF para assinatura';
  }

  function init() {
    removeLocalPdf();
    var form = id('F');
    if (form) {
      form.addEventListener('input', function () { clearTimeout(saveTimer); saveTimer = setTimeout(saveDraft, 500); });
      form.addEventListener('change', function () { clearTimeout(saveTimer); saveTimer = setTimeout(saveDraft, 250); });
    }
    restoreDraft();

    window.enviarEGerarPDF = async function () {
      var list;
      try { list = collectPending(); } catch (error) {
        go(6);
        showStatus('error', 'Falha interna na validação: ' + error.message + '. Os dados não foram enviados.');
        saveDraft();
        return;
      }
      if (list.length) { saveDraft(); showPending(list); return; }
      if (!(window.jspdf && window.jspdf.jsPDF)) {
        go(6);
        showStatus('error', 'O gerador de PDF não foi carregado. Os dados não foram enviados e o rascunho foi preservado.');
        saveDraft();
        return;
      }
      saveDraft();
      var data = coletarDados();
      var sent = await enviarParaSheets(data);
      if (!sent) return saveDraft();
      try {
        gerarPDF();
        clearDraft();
        showToast('✓ Dados registrados e PDF gerado. Assine e envie para ceua.palotina@gmail.com.');
      } catch (error) {
        saveDraft();
        go(6);
        showStatus('error', 'O registro foi iniciado, mas o PDF falhou: ' + (error.message || 'erro desconhecido') + '. Consulte a CEUA antes de reenviar para evitar duplicidade.');
      }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
