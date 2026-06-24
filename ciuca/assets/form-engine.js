const $ = id => document.getElementById(id);
let state = {};
let step = 1;

const CIUCA_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw9PB2XNSFrX42tQfgnnfXzlW3J8VFweVydGTJzdMSeL3fTwe472lu9qpughGQsu4UQ4A/exec';
const SEI_DESTINO = 'UFPR / R / PL / CEUA';

const TITLES = {
  1: 'Identificação Institucional',
  2: 'Dados da Instalação',
  3: 'Coordenador e Responsável Técnico',
  4: 'Checklist de Conformidade',
  5: 'Resumo e Exportação'
};

const DEFAULTS = {
  inst: 'Universidade Federal do Paraná — Setor Palotina',
  cnpj: '75.095.679/0001-49',
  addr: 'Rua Pioneiro, 2153, CEP: 85953-128',
  city: 'Palotina / PR',
  ceua: 'CEUA Palotina – UFPR',
  crmvUf: 'PR'
};

const STATUS_OPTS = ['—', 'Atende', 'Não atende', 'N/A'];
const REQUER_JUSTIFICATIVA = ['Não atende', 'N/A'];

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

function v(id) { return ($(id)?.value || '').trim(); }
function ck(id) { return $(id)?.checked ? 'Sim' : 'Não'; }

function applyDefaults() {
  Object.entries(DEFAULTS).forEach(([id, value]) => {
    const el = $(id);
    if (el && !String(el.value || '').trim()) el.value = value;
  });
}

function ensureShell() {
  document.body.innerHTML = `
  <div class="wrap">
    <header class="card top">
      <div class="brand">
        <div class="logo">UFPR</div>
        <div>
          <div class="eyebrow">MEC · Universidade Federal do Paraná</div>
          <div class="title">Cadastro de Instalação Animal (CIUCA)</div>
          <div class="sub"><span id="groupTitle"></span> · <span id="groupSub"></span></div>
        </div>
      </div>
      <span class="badge" id="rnBadge"></span>
    </header>

    <div class="card">
      <div class="steps">
        <div class="dot" data-step="1" onclick="go(1)">1</div><div class="line"></div>
        <div class="dot" data-step="2" onclick="go(2)">2</div><div class="line"></div>
        <div class="dot" data-step="3" onclick="go(3)">3</div><div class="line"></div>
        <div class="dot" data-step="4" onclick="go(4)">4</div><div class="line"></div>
        <div class="dot" data-step="5" onclick="go(5)">5</div>
      </div>
      <div class="meta">Etapa <span id="curNum">1</span> de 5 · <span id="curTitle"></span></div>
    </div>

    <section class="step card" data-step="1">
      <div class="head"><span class="stag">Etapa 1</span><div class="h2">Identificação Institucional e Vínculo CIUCA</div></div>
      <p class="hint">RN 51/2021 — a instalação deve estar vinculada à CEUA no CIUCA, com Coordenador e Responsável Técnico registrados.</p>

      <div class="grid g3">
        <div class="span2"><label class="lbl">Instituição</label><input id="inst" class="fi" value="${DEFAULTS.inst}"></div>
        <div><label class="lbl">CNPJ</label><input id="cnpj" class="fi" value="${DEFAULTS.cnpj}"></div>
        <div><label class="lbl">Credenciamento institucional — CIAEP</label><input id="ciaep" class="fi" placeholder="Preenchimento UNIBIO/CEUA"></div>
        <div class="span2"><label class="lbl">Endereço institucional</label><input id="addr" class="fi" value="${DEFAULTS.addr}"></div>
        <div><label class="lbl">Município / UF</label><input id="city" class="fi" value="${DEFAULTS.city}"></div>
        <div><label class="lbl">CEUA vinculada</label><input id="ceua" class="fi" value="${DEFAULTS.ceua}"></div>
        <div><label class="lbl">E-mail institucional da instalação</label><input id="mail" class="fi"></div>
      </div>

      <p class="hint" style="margin-top:10px">Os campos institucionais vêm preenchidos com o padrão UFPR/Setor Palotina, mas podem ser alterados manualmente para outra unidade.</p>
      <div class="nav"><span></span><button class="btn primary" onclick="next()">Próximo →</button></div>
    </section>

    <section class="step card" data-step="2">
      <div class="head"><span class="stag">Etapa 2</span><div class="h2">Dados da Instalação</div></div>

      <div class="grid g3">
        <div class="span2"><label class="lbl">Nome / identificação da instalação</label><input id="unit" class="fi"></div>
        <div>
          <label class="lbl">Finalidade</label>
          <select id="purpose" class="fi" onchange="snap(); render()">
            <option value="">Selecione...</option>
            <option>Criação</option>
            <option>Manutenção</option>
            <option>Experimentação</option>
            <option>Misto (mais de uma finalidade)</option>
          </select>
        </div>
      </div>

      <p class="info" id="purposeHint"></p>

      <div class="grid g3">
        <div><label class="lbl">Situação</label><select id="situation" class="fi"><option value="">Selecione...</option><option>Existente</option><option>Nova</option></select></div>
        <div><label class="lbl">Localização / tipo</label><select id="local" class="fi"><option value="">Selecione...</option><option>Independente</option><option>Dentro do Hospital Veterinário</option><option>Independente dentro do HV</option><option>Outra</option></select></div>
        <div><label class="lbl">Nível de biossegurança</label><select id="nb" class="fi"><option value="">Selecione...</option><option>NB-1</option><option>NB-2</option><option>NB-3</option></select></div>
      </div>

      <div class="grid g5" style="margin-top:12px">
        <div><label class="lbl">Campus</label><input id="campus" class="fi"></div>
        <div><label class="lbl">Prédio</label><input id="building" class="fi"></div>
        <div><label class="lbl">Sala/setor</label><input id="room" class="fi"></div>
        <div><label class="lbl">Área (m²)</label><input id="area" type="number" class="fi"></div>
        <div><label class="lbl">Capacidade</label><input id="cap" type="number" class="fi"></div>
      </div>

      <div class="grid g3" style="margin-top:12px">
        <div><label class="lbl" id="animalLabel"></label><select id="animalSelect" class="fi" onchange="snap(); render()"></select></div>
        <div class="span2"><label class="lbl" id="animalDetailLabel"></label><input id="animalDetail" class="fi"></div>
      </div>

      <div class="nav"><button class="btn" onclick="prev()">← Anterior</button><button class="btn primary" onclick="next()">Próximo →</button></div>
    </section>

    <section class="step card" data-step="3">
      <div class="head"><span class="stag">Etapa 3</span><div class="h2">Coordenador e Responsável Técnico</div></div>

      <div class="grid g3">
        <div><label class="lbl">Coordenador da instalação</label><input id="coord" class="fi"></div>
        <div><label class="lbl">Formação / experiência</label><input id="coordForm" class="fi"></div>
        <div><label class="lbl">E-mail do coordenador</label><input id="coordMail" class="fi"></div>
      </div>

      <div class="grid g4" style="margin-top:12px">
        <div><label class="lbl">Responsável Técnico (Méd. Vet.)</label><input id="rt" class="fi"></div>
        <div><label class="lbl">CRMV</label><input id="crmv" class="fi"></div>
        <div><label class="lbl">E-mail do RT</label><input id="rtMail" class="fi"></div>
        <div><label class="lbl">UF do CRMV</label><input id="crmvUf" class="fi" value="${DEFAULTS.crmvUf}"></div>
      </div>

      <p class="lbl" style="margin-top:14px;color:#1D5B64">Exigências para cadastro CONCEA/CIUCA</p>
      <div class="chkbox">
        <label class="chk"><input id="rtVet" type="checkbox"><span>O <b>Responsável Técnico da instalação</b> é <b>médico-veterinário com inscrição ativa/regular no CRMV</b> da UF do estabelecimento.</span></label>
        <label class="chk"><input id="desig" type="checkbox"><span>O <b>Coordenador</b> e o <b>Responsável Técnico</b> estão formalmente designados pela instituição para esta instalação e serão registrados no CIUCA.</span></label>
      </div>

      <p class="lbl" style="margin-top:14px;color:#94a3b8">Informação complementar (CRMV)</p>
      <div class="chkbox">
        <label class="chk"><input id="art" type="checkbox"><span>O RT possui <b>ART homologada</b> pelo CRMV.</span></label>
        <p class="hint" style="margin-left:30px">Exigência do CRMV no âmbito profissional — não é exigida para cadastro/licenciamento no CIUCA/CONCEA; registrada apenas como informação.</p>
      </div>

      <div class="nav"><button class="btn" onclick="prev()">← Anterior</button><button class="btn primary" onclick="next()">Próximo →</button></div>
    </section>

    <section class="step card" data-step="4">
      <div class="head"><span class="stag">Etapa 4</span><div class="h2">Checklist Normativo</div></div>
      <div id="filterInfo" class="info"></div>
      <div class="hint"><span class="tag ob">Obrigatório</span> <span class="tag re">Recomendado</span></div>
      <div class="info" style="margin-top:10px;line-height:1.45"><b>Justificativa obrigatória:</b> todo item marcado como <b>N/A</b> ou <b>Não atende</b> deve ter justificativa no campo Observação. Item obrigatório marcado como N/A sem justificativa impedirá a aprovação/encaminhamento até saneamento documental.</div>
      <div id="criteriaList"></div>
      <div class="nav"><button class="btn" onclick="prev()">← Anterior</button><button class="btn primary" onclick="next()">Próximo →</button></div>
    </section>

    <section class="step card" data-step="5">
      <div class="head"><span class="stag">Etapa 5</span><div class="h2">Resumo e Exportação</div></div>
      <div id="verdict" class="verdict">Preenchimento não iniciado.</div>
      <div class="pills">
        <span class="pill dark">Avaliados: <b id="cAval">0/0</b></span>
        <span class="pill mid">Obrigatórios: <b id="cObrig">0/0</b></span>
        <span class="pill light">Recomendados: <b id="cRec">0/0</b></span>
        <span class="pill red">Não atende: <b id="cNao">0</b></span>
        <span class="pill gray">N/A: <b id="cNa">0</b></span>
      </div>

      <div class="info" style="margin-top:14px;line-height:1.45">
        <b>Tramitação obrigatória no SEI:</b> ao clicar no botão abaixo, os dados serão registrados na base interna da CEUA/UNIBIO e será gerado o PDF do formulário. O responsável deve abrir processo SEI e encaminhar para <b>${SEI_DESTINO}</b>, anexando o PDF assinado pelo <b>coordenador da instalação</b> e pelo <b>responsável técnico</b>, com despacho solicitando avaliação da CEUA e encaminhamento para cadastro/regularização no CIUCA.
      </div>

      <div class="info" style="margin-top:10px;line-height:1.45"><b>Atenção:</b> itens marcados como N/A ou Não atende precisam de justificativa no campo Observação para que o processo possa ser avaliado.</div>
      <div id="statusBox" class="info" style="display:none;margin-top:12px"></div>

      <div class="nav">
        <button class="btn" onclick="prev()">← Anterior</button>
        <div>
          <button class="btn primary" onclick="registrarEpdf()">📄 Registrar dados e gerar PDF para SEI</button>
          <button class="btn" onclick="clearAll()">↺ Limpar</button>
        </div>
      </div>
    </section>

    <footer class="foot">CEUA Palotina · UFPR · <span id="rnFooter"></span></footer>
  </div>`;
}

function init() {
  ensureShell();
  applyDefaults();
  document.title = (CFG.title || CFG.group) + ' · CEUA UFPR Palotina';
  $('groupTitle').textContent = CFG.group;
  $('groupSub').textContent = CFG.subtitle || 'CEUA Palotina';
  $('rnBadge').innerHTML = (CFG.rn || '').replace(' · ', '<br>');
  $('rnFooter').textContent = CFG.footer || 'O texto oficial vigente prevalece.';
  $('animalLabel').textContent = CFG.animalLabel || 'Categoria / grupo';
  $('animalDetailLabel').textContent = CFG.animalDetailLabel || 'Detalhamento / observações';
  $('animalDetail').placeholder = CFG.animalPlaceholder || '';
  const select = $('animalSelect');
  select.innerHTML = '<option value="">Selecione...</option>' + (CFG.animalOptions || []).map(x => `<option>${esc(x)}</option>`).join('');
  $('purposeHint').textContent = CFG.purposeHint || 'A finalidade é registrada para caracterização da instalação.';
  render();
  go(1);
}

function finKey() { return {'Criação':'criacao','Manutenção':'manutencao','Experimentação':'experimentacao','Misto (mais de uma finalidade)':'misto'}[v('purpose')] || ''; }
function animalKey() { return (CFG.animalMap || {})[v('animalSelect')] || ''; }

function applicable(item) {
  const f = finKey();
  const a = animalKey();
  let okF = true;
  let okA = true;
  if (CFG.filterPurpose && f && f !== 'misto' && item.aplic && item.aplic !== 'todos') okF = item.aplic.includes(f);
  if (CFG.filterAnimal && a && item.spec && item.spec !== 'todos') okA = a === 'ambos' ? true : item.spec === a;
  if (CFG.filterAnimal && a && item.spec === 'ambos' && a !== 'ambos') okA = false;
  return okF && okA;
}

function snap() {
  document.querySelectorAll('.crit').forEach(block => {
    const id = block.dataset.id;
    state[id] = {status:block.querySelector('.status').value, obs:block.querySelector('.obs').value};
  });
}

function render() {
  const rows = [];
  (CFG.criteria || []).forEach((cat, ci) => cat.items.forEach((item, ii) => rows.push({...item, cat:cat.cat, id:'i'+ci+'_'+ii})));
  const visible = rows.filter(applicable);
  let html = '';
  let currentCat = '';
  visible.forEach(item => {
    if (item.cat !== currentCat) {
      currentCat = item.cat;
      html += `<div class="cat">${esc(currentCat)}${item.src === 'Guia' ? '<small>orientação complementar · fora do anexo normativo</small>' : ''}</div>`;
    }
    const saved = state[item.id] || {};
    const st = saved.status || '—';
    const obs = saved.obs || '';
    const req = REQUER_JUSTIFICATIVA.includes(st);
    let tags = `<span class="tag ${item.c === 'Obrigatório' ? 'ob' : 're'}">${esc(item.c)}</span>`;
    if (item.aplic && item.aplic !== 'todos') tags += `<span class="tag tp">${esc(item.aplic.join('/'))}</span>`;
    if (item.spec && item.spec !== 'todos') tags += `<span class="tag tp">${esc(item.spec)}</span>`;
    if (item.src === 'Guia') tags += `<span class="tag guia">Guia</span>`;
    html += `<div class="crit" data-id="${item.id}" data-c="${esc(item.c)}" data-status="${esc(st)}">
      <div class="ctop"><div class="ctxt">${esc(item.t)}</div><div class="tags">${tags}</div></div>
      <div class="ctrl">
        <select class="status" onchange="setStatus('${item.id}', this.value)">${STATUS_OPTS.map(o => `<option ${o === st ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>
        <input class="obs" value="${esc(obs)}" oninput="setObs('${item.id}', this.value)" placeholder="${req ? 'Justificativa obrigatória para N/A ou Não atende' : 'Observação (opcional)'}" style="${req ? 'border-color:#f59e0b;background:#fff7ed' : ''}">
      </div>
    </div>`;
  });
  $('criteriaList').innerHTML = html;
  const msg = (CFG.filterPurpose || CFG.filterAnimal)
    ? `Finalidade: <b>${esc(v('purpose') || 'não informada')}</b> · ${esc(CFG.animalLabel || 'Grupo')}: <b>${esc(v('animalSelect') || 'não informado')}</b> — exibindo <b>${visible.length}</b> critérios aplicáveis.`
    : `Finalidade: <b>${esc(v('purpose') || 'não informada')}</b> — exibindo <b>todos os ${visible.length}</b> critérios.`;
  $('filterInfo').innerHTML = msg;
  summary();
}

function setStatus(id, value) {
  state[id] = state[id] || {};
  state[id].status = value;
  const block = document.querySelector(`.crit[data-id='${id}']`);
  if (block) {
    block.dataset.status = value;
    const obs = block.querySelector('.obs');
    const req = REQUER_JUSTIFICATIVA.includes(value);
    obs.placeholder = req ? 'Justificativa obrigatória para N/A ou Não atende' : 'Observação (opcional)';
    obs.style.borderColor = req ? '#f59e0b' : '';
    obs.style.background = req ? '#fff7ed' : '';
    if (req && !obs.value.trim()) obs.focus();
  }
  summary();
}
function setObs(id, value) { state[id] = state[id] || {}; state[id].obs = value; }

function previousCat(el) { let p = el.previousElementSibling; while (p) { if (p.classList.contains('cat')) return p.childNodes[0].textContent; p = p.previousElementSibling; } return ''; }
function items() { const arr = []; document.querySelectorAll('.crit').forEach(block => arr.push({cat:previousCat(block), t:block.querySelector('.ctxt').textContent, c:block.dataset.c, status:block.querySelector('.status').value, obs:block.querySelector('.obs').value})); return arr; }

function stats(arr) {
  let oT=0,oOk=0,oNo=0,oNA=0,oPend=0,rT=0,rOk=0,av=0,no=0,na=0,naSemJust=0,naoSemJust=0;
  arr.forEach(item => {
    if (item.status !== '—') av++;
    if (item.status === 'Não atende') { no++; if (!item.obs.trim()) naoSemJust++; }
    if (item.status === 'N/A') { na++; if (!item.obs.trim()) naSemJust++; }
    if (item.c === 'Obrigatório') {
      oT++;
      if (item.status === 'Atende') oOk++;
      else if (item.status === 'Não atende') oNo++;
      else if (item.status === 'N/A') oNA++;
      else oPend++;
    } else {
      rT++;
      if (item.status === 'Atende') rOk++;
    }
  });
  const app = oT - oNA;
  let vct;
  if (av === 0) vct = ['vazio','Preenchimento não iniciado.','#f1f5f9','#475569','#e2e8f0'];
  else if (oNo > 0) vct = ['naoconforme', `NÃO CONFORME — ${oNo} item(ns) obrigatório(s) não atendido(s). Justificar e regularizar antes do licenciamento.`, '#fee2e2', '#991b1b', '#fecaca'];
  else if (oPend > 0) vct = ['parcial', `Em avaliação — ${oPend} item(ns) obrigatório(s) aplicável(is) ainda não avaliado(s).`, '#fef3c7', '#92400e', '#fde68a'];
  else if (oNA > 0 || na > 0) vct = ['ressalva', `CONFORME COM RESSALVA — há ${na} item(ns) marcado(s) como N/A; a justificativa é obrigatória e será avaliada pela CEUA/UNIBIO.`, '#fef3c7', '#92400e', '#fde68a'];
  else vct = ['conforme','CONFORME — todos os itens obrigatórios aplicáveis foram atendidos.','#dcfce7','#166534','#bbf7d0'];
  return {oT,oOk,oNo,oNA,oPend,app,rT,rOk,av,total:arr.length,no,na,naSemJust,naoSemJust,v:vct};
}
function summary() { const s = stats(items()); $('cAval').textContent = s.av + '/' + s.total; $('cObrig').textContent = s.oOk + '/' + s.app; $('cRec').textContent = s.rOk + '/' + s.rT; $('cNao').textContent = s.no; $('cNa').textContent = s.na; const e = $('verdict'); e.textContent = s.v[1]; e.style.background = s.v[2]; e.style.color = s.v[3]; e.style.borderColor = s.v[4]; }

function validateJustificativas() {
  const faltantes = [];
  document.querySelectorAll('.crit').forEach(block => {
    const status = block.querySelector('.status').value;
    const obs = block.querySelector('.obs').value.trim();
    if (REQUER_JUSTIFICATIVA.includes(status) && !obs) faltantes.push(block);
  });
  if (!faltantes.length) return true;
  go(4);
  const first = faltantes[0];
  setTimeout(() => {
    first.scrollIntoView({behavior:'smooth', block:'center'});
    const obs = first.querySelector('.obs');
    obs.style.borderColor = '#dc2626';
    obs.style.background = '#fef2f2';
    obs.focus();
  }, 350);
  alert('Itens marcados como N/A ou Não atende precisam de justificativa no campo Observação. O processo não será aprovado/encaminhado sem essa justificativa.');
  return false;
}

function collect() {
  const d = {g1:{'Instituição':v('inst'),'CNPJ':v('cnpj'),'Credenciamento (CIAEP)':v('ciaep'),'Endereço institucional':v('addr'),'Município / UF':v('city'),'CEUA vinculada':v('ceua'),'E-mail institucional da instalação':v('mail')}, g2:{'Nome / Identificação':v('unit'),'Finalidade':v('purpose'),'Situação':v('situation'),'Localização / tipo':v('local'),'Nível de biossegurança':v('nb'),'Campus':v('campus'),'Prédio':v('building'),'Sala':v('room'),'Área (m²)':v('area'),'Capacidade':v('cap'),[CFG.animalLabel || 'Grupo']:v('animalSelect'),[CFG.animalDetailLabel || 'Detalhamento']:v('animalDetail')}, g3:{'Coordenador da instalação':v('coord'),'Formação/experiência (Coord.)':v('coordForm'),'E-mail (Coord.)':v('coordMail'),'Responsável Técnico (Méd. Vet.)':v('rt'),'CRMV':v('crmv'),'UF do CRMV':v('crmvUf'),'E-mail (RT)':v('rtMail'),'RT é Médico Veterinário com CRMV ativo/regular':ck('rtVet'),'Coordenador e RT designados/registrados no CIUCA':ck('desig'),'ART homologada no CRMV [CRMV — não exigida pelo CONCEA/CIUCA]':ck('art')}, it:items(), s:stats(items())};
  d.meta = {timestamp:new Date().toLocaleString('pt-BR'), grupo_animal:CFG.group, slug:CFG.slug || '', rn:CFG.rn || '', sei_destino:SEI_DESTINO, versao_formulario:'CIUCA Instalações v1.2', origem:'Formulários CIUCA GitHub Pages'};
  return d;
}
function flatPayload(d) { return {meta:d.meta,g1:d.g1,g2:d.g2,g3:d.g3,itens:d.it,resumo:d.s,grupo_animal:d.meta.grupo_animal,slug:d.meta.slug,rn:d.meta.rn,instituicao:d.g1['Instituição'],cnpj:d.g1['CNPJ'],ciaep:d.g1['Credenciamento (CIAEP)'],endereco:d.g1['Endereço institucional'],municipio_uf:d.g1['Município / UF'],ceua_vinculada:d.g1['CEUA vinculada'],email_instalacao:d.g1['E-mail institucional da instalação'],nome_instalacao:d.g2['Nome / Identificação'],finalidade:d.g2['Finalidade'],situacao:d.g2['Situação'],localizacao_tipo:d.g2['Localização / tipo'],nivel_biosseguranca:d.g2['Nível de biossegurança'],campus:d.g2['Campus'],predio:d.g2['Prédio'],sala_setor:d.g2['Sala'],area_m2:d.g2['Área (m²)'],capacidade:d.g2['Capacidade'],animal_grupo:v('animalSelect'),animal_detalhamento:v('animalDetail'),coordenador:d.g3['Coordenador da instalação'],email_coord:d.g3['E-mail (Coord.)'],rt:d.g3['Responsável Técnico (Méd. Vet.)'],crmv:d.g3['CRMV'],crmv_uf:d.g3['UF do CRMV'],email_rt:d.g3['E-mail (RT)'],situacao_geral:d.s.v[1]}; }
function go(n) { step=n; document.querySelectorAll('.step').forEach(x => x.classList.toggle('active', +x.dataset.step === n)); document.querySelectorAll('.dot').forEach(d => { const k=+d.dataset.step; d.classList.toggle('active', k===n); d.classList.toggle('done', k<n); }); $('curNum').textContent=n; $('curTitle').textContent=TITLES[n]; if (n===5) summary(); scrollTo({top:0, behavior:'smooth'}); }
function next() { go(Math.min(5, step+1)); }
function prev() { go(Math.max(1, step-1)); }
function clearAll() { if (!confirm('Limpar todos os campos?')) return; document.querySelectorAll('input,select').forEach(el => { if (el.type === 'checkbox') el.checked=false; else el.value=''; }); state={}; applyDefaults(); render(); go(1); }
function showStatus(type,msg) { const box=$('statusBox'); if (!box) return; box.style.display='block'; box.style.borderColor=type==='error'?'#fecaca':type==='success'?'#bbf7d0':'#fde68a'; box.style.background=type==='error'?'#fee2e2':type==='success'?'#dcfce7':'#fef3c7'; box.style.color=type==='error'?'#991b1b':type==='success'?'#166534':'#92400e'; box.innerHTML=(type==='success'?'✅ ':type==='error'?'❌ ':'⚠️ ')+esc(msg); }

function pdf() {
  const d = collect();
  const doc = new jspdf.jsPDF('p','mm','a4');
  const ML=14, MR=196, CW=182;
  let y=16;
  const ckpg = h => { if (y+h > 282) { doc.addPage(); y=16; } };
  const sec = t => { ckpg(10); doc.setFillColor(22,69,73); doc.rect(ML,y-4,CW,6,'F'); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.text(t,ML+2,y); y+=7; };
  const kv = (k,val) => { ckpg(7); doc.setTextColor(100,116,139); doc.setFont('helvetica','bold'); doc.setFontSize(7.4); const kl=doc.splitTextToSize(k+':',50); doc.text(kl,ML,y); doc.setTextColor(30,41,59); doc.setFont('helvetica','normal'); const vl=doc.splitTextToSize(String(val || '—'),128); doc.text(vl,ML+52,y); y+=Math.max(5,Math.max(kl.length,vl.length)*4); };
  doc.setFillColor(22,69,73); doc.rect(0,0,210,12,'F'); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.text('UFPR · CEUA Palotina — Cadastro de Instalação Animal (CIUCA)',ML,7); doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.text(`${CFG.group} · ${CFG.rn}`,ML,10.5); y=18;
  sec('1. IDENTIFICAÇÃO INSTITUCIONAL E VÍNCULO CIUCA'); Object.entries(d.g1).forEach(([k,val]) => kv(k,val));
  sec('2. DADOS DA INSTALAÇÃO'); Object.entries(d.g2).forEach(([k,val]) => kv(k,val));
  sec('3. COORDENADOR E RESPONSÁVEL TÉCNICO'); Object.entries(d.g3).forEach(([k,val]) => kv(k,val));
  sec('4. CHECKLIST'); kv('Critérios avaliados', String(d.it.length));
  let cat='';
  d.it.forEach(item => {
    if (item.cat !== cat) { cat=item.cat; ckpg(8); doc.setFillColor(225,244,246); doc.rect(ML,y-3,CW,5,'F'); doc.setTextColor(22,69,73); doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.text(cat.toUpperCase().slice(0,90),ML+1,y); y+=6; }
    const lines=doc.splitTextToSize(item.t,CW-32); ckpg(lines.length*3.5+8); doc.setTextColor(30,41,59); doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.text(lines,ML+5,y); doc.setTextColor(100,116,139); doc.setFont('helvetica','bold'); doc.text(item.c+' · '+(item.status==='—'?'não avaliado':item.status),MR-2,y,{align:'right'}); y+=lines.length*3.5+3;
    if (item.obs) { const obsLines=doc.splitTextToSize('Justificativa/observação: '+item.obs,CW-10); ckpg(obsLines.length*3.5+2); doc.setTextColor(71,85,105); doc.setFont('helvetica','italic'); doc.text(obsLines,ML+5,y); y+=obsLines.length*3.5+2; }
  });
  sec('RESUMO'); kv('Itens avaliados', d.s.av+' de '+d.s.total); kv('Obrigatórios atendidos', d.s.oOk+' de '+d.s.app+' aplicáveis; pendentes: '+d.s.oPend); kv('Recomendados atendidos', d.s.rOk+' de '+d.s.rT); kv('Situação geral', d.s.v[1]);
  sec('TRAMITAÇÃO NO SEI'); kv('Destino SEI', SEI_DESTINO); kv('Orientação','Abrir processo SEI e encaminhar para UFPR / R / PL / CEUA com este PDF assinado pelo coordenador da instalação e pelo responsável técnico, acompanhado de despacho solicitando avaliação da CEUA e encaminhamento para cadastro/regularização no CIUCA.');
  y+=8; ckpg(28); doc.setTextColor(30,41,59); doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.text('ASSINATURA DO COORDENADOR DA INSTALAÇÃO:',ML,y); doc.line(ML+65,y+1,MR,y+1); y+=12; doc.text('ASSINATURA DO RESPONSÁVEL TÉCNICO:',ML,y); doc.line(ML+58,y+1,MR,y+1);
  doc.save('CIUCA_'+(CFG.slug || CFG.group).replaceAll(' ','_')+'.pdf');
}

async function registrarDados() {
  if (!validateJustificativas()) return false;
  const d=collect(); const payload=flatPayload(d);
  showStatus('warn','Registrando dados na planilha interna da CEUA/UNIBIO...');
  try { await fetch(CIUCA_APPS_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)}); showStatus('success','Dados registrados na planilha interna. Anexe o PDF assinado no processo SEI.'); return true; }
  catch(err) { showStatus('error','Erro ao registrar dados: '+err.message); return false; }
}
async function registrarEpdf() { const ok = await registrarDados(); if (ok) pdf(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();