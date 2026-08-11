(function () {
  'use strict';

  var DRAFT_KEY = 'ceua-solicitacao-rascunho-v6';
  var pending = [];
  var saveTimer = null;

  function byId(name) {
    return document.getElementById(name);
  }

  function byName(name) {
    return Array.prototype.slice.call(document.getElementsByName(name));
  }

  function queryAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  function value(id) {
    var element = byId(id);
    return String(element && element.value || '').trim();
  }

  function checkedValues(name) {
    return queryAll('[name="' + name + '"]:checked').map(function (element) {
      return element.value;
    });
  }

  function checkedValue(name) {
    var element = document.querySelector('[name="' + name + '"]:checked');
    return element ? element.value : '';
  }

  function addField(list, id, label, step, condition) {
    if (condition !== false && !value(id)) {
      list.push({ id: id, label: label, step: step });
    }
  }

  function addCheckedGroup(list, name, label, step, condition) {
    if (condition !== false && checkedValues(name).length === 0) {
      list.push({ name: name, index: 0, label: label, step: step });
    }
  }

  function addRadio(list, name, label, step, condition) {
    if (condition !== false && !document.querySelector('[name="' + name + '"]:checked')) {
      list.push({ name: name, index: 0, label: label, step: step });
    }
  }

  function addCheckbox(list, id, label, step, condition) {
    var element = byId(id);
    if (condition !== false && !(element && element.checked)) {
      list.push({ id: id, label: label, step: step });
    }
  }

  function collectPending() {
    var list = [];
    var purposes = checkedValues('fin');
    var teaching = purposes.indexOf('Ensino') >= 0 || purposes.indexOf('Treinamento') >= 0;

    addCheckedGroup(list, 'fin', 'Finalidade', 1, true);
    addField(list, 'dt_ini', 'Início da atividade', 1, true);
    addField(list, 'dt_fim', 'Final da atividade', 1, true);
    addField(list, 'area_capes', 'Área CAPES', 1, true);
    addField(list, 'titulo_pt', 'Título da atividade', 1, true);
    addField(list, 'titulo_en', 'Título em inglês', 1, true);

    addField(list, 'nivel_ensino', 'Nível da atividade didática', 1, teaching);
    addField(list, 'curso_nome', 'Nome do curso ou ação de extensão', 1, teaching);
    addField(list, 'disciplina_nome', 'Disciplina ou atividade de treinamento', 1, teaching);
    addField(list, 'disciplina_sem', 'Semestre ou período', 1, teaching);
    addRadio(list, 'rn53_p1', 'RN 53 — pergunta 1', 1, teaching);

    var rn53p1 = checkedValue('rn53_p1');
    addRadio(list, 'rn53_p2', 'RN 53 — pergunta 2', 1, teaching && rn53p1 === 'Não');

    var rn53p2 = checkedValue('rn53_p2');
    addRadio(
      list,
      'rn53_p3',
      'RN 53 — pergunta 3',
      1,
      teaching && (rn53p1 === 'Sim' || (rn53p1 === 'Não' && rn53p2 === 'Sim'))
    );

    var rn53p3 = checkedValue('rn53_p3');
    addField(list, 'rn53_habilidades', 'Habilidades psicomotoras e competências DCN', 1, teaching && rn53p3 === 'Sim');
    addField(
      list,
      'rn53_excecao_just',
      'Justificativa da exceção da RN 53',
      1,
      teaching && Boolean(byId('rn53_excecao') && byId('rn53_excecao').checked)
    );
    addRadio(list, 'subst_busca', 'Busca por métodos substitutivos', 1, teaching);
    addField(list, 'subst_metodos', 'Métodos substitutivos avaliados', 1, teaching);
    addField(list, 'subst_justificativa', 'Justificativa para não substituição integral', 1, teaching);

    addField(list, 'r_nome', 'Nome do responsável', 2, true);
    addField(list, 'r_cpf', 'CPF do responsável', 2, true);
    addField(list, 'r_inst', 'Instituição', 2, true);
    addField(list, 'r_unid', 'Unidade', 2, true);
    addField(list, 'r_tel', 'Telefone', 2, true);
    addField(list, 'r_email', 'E-mail institucional', 2, true);
    addField(list, 'r_vinc', 'Vínculo com a UFPR', 2, true);
    addField(list, 'r_siape', 'SIAPE ou matrícula', 2, true);
    addCheckedGroup(list, 'cap', 'Treinamento específico', 2, true);
    addCheckedGroup(list, 'etica', 'Capacitação em ética', 2, true);

    addField(list, 'inst_ciuca_nome', 'Nome da instalação animal cadastrada no CIUCA', 3, true);
    addCheckbox(list, 'inst_ciuca_confirm', 'Declaração sobre a instalação no CIUCA', 3, false);
    addCheckedGroup(list, 'ci', 'Finalidade do projeto no CIUCA', 3, true);
    addField(list, 'resumo', 'Resumo da atividade', 3, true);
    addField(list, 'objetivos', 'Objetivos', 3, true);
    addField(list, 'justificativa', 'Justificativa', 3, true);

    addField(list, 'ca_teste', 'Tipo de teste estatístico', 4, true);
    addField(list, 'ca_alfa', 'Nível de significância', 4, true);
    addField(list, 'ca_poder', 'Poder do teste', 4, true);
    addField(list, 'ca_efeito', 'Tamanho do efeito esperado', 4, true);
    addField(list, 'ca_n', 'N amostral calculado', 4, true);
    addField(list, 'ca_soft', 'Software ou método utilizado', 4, true);
    addField(list, 'ca_just', 'Justificativa do cálculo amostral', 4, true);

    var species = byName('sn[]');
    var ages = byName('sa[]');
    var weights = byName('sw[]');
    var sexes = byName('ss[]');
    var quantities = byName('sq[]');

    if (!species.some(function (element) { return String(element.value || '').trim(); })) {
      list.push({ name: 'sn[]', index: 0, label: 'Espécie ou linhagem animal', step: 4 });
    }

    species.forEach(function (element, index) {
      var row = [species[index], ages[index], weights[index], sexes[index], quantities[index]];
      var hasAnyValue = row.some(function (item) {
        return String(item && item.value || '').trim();
      });
      if (!hasAnyValue) return;

      if (!String(species[index] && species[index].value || '').trim()) {
        list.push({ name: 'sn[]', index: index, label: 'Espécie ou linhagem — linha ' + (index + 1), step: 4 });
      }
      if (!String(ages[index] && ages[index].value || '').trim()) {
        list.push({ name: 'sa[]', index: index, label: 'Idade animal — linha ' + (index + 1), step: 4 });
      }
      if (!String(weights[index] && weights[index].value || '').trim()) {
        list.push({ name: 'sw[]', index: index, label: 'Peso animal — linha ' + (index + 1), step: 4 });
      }
      if (!String(sexes[index] && sexes[index].value || '').trim()) {
        list.push({ name: 'ss[]', index: index, label: 'Sexo animal — linha ' + (index + 1), step: 4 });
      }
      if (!String(quantities[index] && quantities[index].value || '').trim()) {
        list.push({ name: 'sq[]', index: index, label: 'Quantidade de animais — linha ' + (index + 1), step: 4 });
      }
    });

    addField(list, 'just_esp', 'Justificativa dos procedimentos e da espécie', 4, true);
    addField(list, 'proc', 'Procedência', 4, true);
    addRadio(list, 'gi', 'Grau de invasividade', 4, true);
    addField(list, 'al_loc', 'Local de alojamento', 4, true);
    addField(list, 'al_amb', 'Ambiente de alojamento', 4, true);
    addField(list, 'al_alim', 'Alimentação', 4, true);
    addField(list, 'al_agua', 'Fonte de água', 4, true);
    addField(list, 'al_lot', 'Lotação', 4, true);
    addField(list, 'al_exau', 'Exaustão de ar', 4, true);
    addField(list, 'al_clim', 'Climatização', 4, true);

    addField(list, 'p91d', 'Descrição do estresse intencional', 5, value('p91') === 'Sim');
    addField(list, 'p92d', 'Descrição da dor intencional', 5, value('p92') === 'Sim');
    addField(list, 'p96d', 'Descrição da imobilização', 5, value('p96') === 'Sim');
    addField(list, 'p97jt', 'Tempo de jejum', 5, value('p97j') === 'Sim');
    addField(list, 'p97ht', 'Tempo de restrição hídrica', 5, value('p97h') === 'Sim');
    addField(list, 'p98d', 'Descrição da cirurgia e pós-operatório', 5, value('p98') === 'Sim');
    addField(list, 'p99d', 'Descrição da exposição ou inoculação', 5, value('p99') === 'Sim');
    addField(list, 'p10m', 'Material biológico extraído', 5, value('p10') === 'Sim');
    addField(list, 'p10q', 'Quantidade de material biológico', 5, value('p10') === 'Sim');
    addField(list, 'p10f', 'Frequência da extração', 5, value('p10') === 'Sim');
    addField(list, 'p10mt', 'Método da extração', 5, value('p10') === 'Sim');

    var drugNames = byName('dn[]');
    var drugTypes = byName('dt[]');
    var drugDoses = byName('dd[]');
    var drugRoutes = byName('dv[]');

    drugNames.forEach(function (element, index) {
      var row = [drugNames[index], drugTypes[index], drugDoses[index], drugRoutes[index]];
      var hasAnyValue = row.some(function (item) {
        return String(item && item.value || '').trim();
      });
      if (!hasAnyValue) return;

      if (!String(drugTypes[index] && drugTypes[index].value || '').trim()) {
        list.push({ name: 'dt[]', index: index, label: 'Tipo de fármaco — linha ' + (index + 1), step: 5 });
      }
      if (!String(drugNames[index] && drugNames[index].value || '').trim()) {
        list.push({ name: 'dn[]', index: index, label: 'Nome do fármaco — linha ' + (index + 1), step: 5 });
      }
      if (!String(drugDoses[index] && drugDoses[index].value || '').trim()) {
        list.push({ name: 'dd[]', index: index, label: 'Dose do fármaco — linha ' + (index + 1), step: 5 });
      }
      if (!String(drugRoutes[index] && drugRoutes[index].value || '').trim()) {
        list.push({ name: 'dv[]', index: index, label: 'Via de administração — linha ' + (index + 1), step: 5 });
      }
    });

    addField(list, 'f_met', 'Método utilizado', 6, value('f_ab') === 'Sim' || value('f_eu') === 'Sim');
    addField(list, 'f_dest', 'Destino dos animais após a atividade', 6, true);
    addField(list, 'f_desc', 'Descarte da carcaça', 6, true);
    addCheckbox(list, 'relatorio_final_ciente', 'Ciência sobre a entrega do relatório final', 6, true);

    var seen = {};
    return list.filter(function (item) {
      var key = [item.step, item.id || item.name, item.index || 0, item.label].join('|');
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  window.abrirPendenciaCEUA = function (index) {
    var item = pending[index];
    if (!item) return;
    go(item.step);
    setTimeout(function () {
      var element = item.id ? byId(item.id) : byName(item.name)[item.index || 0];
      if (!element) return;
      try {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (error) {
        element.scrollIntoView();
      }
      if (typeof element.focus === 'function') element.focus();
      var previousOutline = element.style.outline;
      var previousOffset = element.style.outlineOffset;
      element.style.outline = '3px solid #f59e0b';
      element.style.outlineOffset = '3px';
      setTimeout(function () {
        element.style.outline = previousOutline;
        element.style.outlineOffset = previousOffset;
      }, 4000);
    }, 300);
  };

  function showPending(list) {
    pending = list;
    go(6);
    var stepNames = ['', 'Identificação', 'Equipe', 'CIUCA / Projeto', 'Animais', 'Procedimentos', 'Finalização'];
    var rows = list.map(function (item, index) {
      return '<li class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b border-amber-200 last:border-0">' +
        '<span><strong>Etapa ' + item.step + ' — ' + escapeHtml(stepNames[item.step]) + ':</strong> ' + escapeHtml(item.label) + '</span>' +
        '<button type="button" onclick="abrirPendenciaCEUA(' + index + ')" class="px-3 py-1.5 rounded-md bg-white border border-amber-400 text-amber-900 font-bold text-xs">Ir ao campo</button>' +
        '</li>';
    }).join('');

    var box = byId('statusBox');
    if (!box) {
      window.alert('O formulário possui ' + list.length + ' pendência(s).');
      return;
    }

    box.className = 'mb-4 p-4 rounded-lg text-sm border-2 border-amber-400 bg-amber-50 text-amber-950';
    box.innerHTML =
      '<p class="font-bold text-base mb-1">⚠️ O formulário não foi registrado e o PDF não foi gerado.</p>' +
      '<p class="mb-3">Foram encontradas <strong>' + list.length + '</strong> pendência(s). Corrija os itens abaixo e tente novamente.</p>' +
      '<ol>' + rows + '</ol>';
    box.classList.remove('hidden');

    try {
      box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      box.scrollIntoView();
    }
  }

  function snapshot() {
    var form = byId('F');
    if (!form) return null;

    var fields = [];
    queryAll('#F input, #F select, #F textarea').forEach(function (element) {
      var type = String(element.type || '').toLowerCase();
      if (['button', 'submit', 'reset', 'file'].indexOf(type) >= 0) return;
      var item = {
        id: element.id || '',
        name: element.name || '',
        type: type,
        value: element.value || '',
        checked: Boolean(element.checked)
      };
      if (!item.id && item.name) item.index = byName(item.name).indexOf(element);
      if (item.id || item.name) fields.push(item);
    });

    return {
      counts: {
        species: byName('sn[]').length,
        collaborators: byName('cn[]').length,
        drugs: byName('dn[]').length
      },
      fields: fields
    };
  }

  function saveDraft() {
    try {
      var data = snapshot();
      if (data) localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('CEUA: não foi possível salvar o rascunho.', error);
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.warn('CEUA: não foi possível limpar o rascunho.', error);
    }
  }

  window.limparFormularioCEUA = function () {
    if (confirm('Limpar o formulário e recomeçar? Todos os dados preenchidos serão apagados.')) {
      clearDraft();
      location.reload();
    }
  };

  function restoreDraft() {
    var raw;
    try {
      raw = localStorage.getItem(DRAFT_KEY);
    } catch (error) {
      return;
    }
    if (!raw) return;

    var data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      return;
    }

    try {
      while (byName('sn[]').length < Number(data.counts && data.counts.species || 1)) addSp();
      while (byName('cn[]').length < Number(data.counts && data.counts.collaborators || 0)) addC();
      while (byName('dn[]').length < Number(data.counts && data.counts.drugs || 0)) addDr();

      data.fields.forEach(function (item) {
        var element = item.id ? byId(item.id) : byName(item.name)[item.index || 0];
        if (!element) return;
        if (item.type === 'checkbox' || item.type === 'radio') {
          element.checked = Boolean(item.checked);
        } else {
          element.value = item.value == null ? '' : item.value;
        }
      });

      if (typeof toggleEnsino === 'function') toggleEnsino();
      if (typeof avaliarRN53 === 'function') avaliarRN53();
      if (byId('r_nome') && byId('termoNome')) {
        byId('termoNome').textContent = byId('r_nome').value || '\u00a0';
      }
    } catch (error) {
      console.warn('CEUA: o rascunho foi restaurado parcialmente.', error);
    }
  }

  function removeLocalPdfButton() {
    queryAll('button').forEach(function (button) {
      var text = String(button.textContent || '').toLowerCase();
      var action = String(button.getAttribute('onclick') || '');
      if (text.indexOf('apenas gerar pdf') >= 0 || /^\s*gerarPDF\s*\(/.test(action)) {
        button.remove();
      }
    });

    var sendButton = byId('btnEnviar');
    if (sendButton) {
      sendButton.textContent = 'Registrar dados e gerar PDF para assinatura';
    }
  }

  function init() {
    removeLocalPdfButton();

    var form = byId('F');
    if (form) {
      form.addEventListener('input', function () {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveDraft, 500);
      });
      form.addEventListener('change', function () {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveDraft, 250);
      });
    }

    restoreDraft();

    window.enviarEGerarPDF = async function () {
      var list;
      try {
        list = collectPending();
      } catch (error) {
        go(6);
        showStatus('error', 'Falha interna na validação: ' + error.message + '. Os dados não foram enviados.');
        saveDraft();
        return;
      }

      if (list.length > 0) {
        saveDraft();
        showPending(list);
        return;
      }

      if (!(window.jspdf && window.jspdf.jsPDF)) {
        go(6);
        showStatus('error', 'O gerador de PDF não foi carregado. Os dados não foram enviados e o rascunho foi preservado.');
        saveDraft();
        return;
      }

      saveDraft();
      var data = coletarDados();
      var sent = await enviarParaSheets(data);
      if (!sent) {
        saveDraft();
        return;
      }

      try {
        gerarPDF();
        clearDraft();
        showToast('✓ Dados registrados e PDF gerado. Assine e envie para ceua.palotina@gmail.com.');
      } catch (error) {
        saveDraft();
        go(6);
        showStatus(
          'error',
          'O registro foi iniciado, mas o PDF falhou: ' +
          (error && error.message ? error.message : 'erro desconhecido') +
          '. Consulte a CEUA antes de reenviar para evitar duplicidade.'
        );
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
