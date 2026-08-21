/*
 * Emissor de Certificados CEUA/Palotina
 * 1) Cole este arquivo em Extensões > Apps Script da planilha de respostas.
 * 2) Altere ACCESS_TOKEN para uma chave longa.
 * 3) Implante como App da Web: Executar como "Eu"; acesso "Qualquer pessoa".
 */

const SOURCE_SPREADSHEET_ID = '1KYtQIG3w9QPvCXpueGZkfZTIa26oLg_h0Y-aU9BI62E';
const SOURCE_SHEET_NAME = ''; // vazio = primeira aba da planilha de respostas
const CERTIFICADOS_SPREADSHEET_NAME = 'CEUA_certificados_emitidos';
const PDF_FOLDER_NAME = 'Certificados_CEUA_PDF';
const ACCESS_TOKEN = 'ALTERE_ESTA_CHAVE_LONGA';
const TIMEZONE = 'America/Sao_Paulo';
const LOGO_BASE64 = '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';

function doGet(e) {
  try {
    checkToken_(e.parameter.token);
    const action = e.parameter.action || 'health';
    if (action === 'health') return json_({ ok: true, app: 'certificados-ceua' });
    if (action === 'list') return json_(listRecords_());
    if (action === 'get') return json_(getRecord_(Number(e.parameter.row)));
    return json_({ ok: false, error: 'Ação GET desconhecida.' });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e.postData && e.postData.contents) || '{}');
    checkToken_(body.token);
    if (body.action !== 'emitir') throw new Error('Ação POST desconhecida.');
    return json_(emitCertificate_(body.data || {}));
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function checkToken_(token) {
  if (!token || token !== ACCESS_TOKEN || ACCESS_TOKEN === 'ALTERE_ESTA_CHAVE_LONGA') throw new Error('Chave de acesso inválida ou não configurada.');
}

function sourceSheet_() {
  const ss = SpreadsheetApp.openById(SOURCE_SPREADSHEET_ID);
  return SOURCE_SHEET_NAME ? ss.getSheetByName(SOURCE_SHEET_NAME) : ss.getSheets()[0];
}

function rowsAsObjects_() {
  const sh = sourceSheet_();
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1).map((row, i) => {
    const raw = {};
    headers.forEach((h, c) => raw[h] = row[c]);
    return mapRow_(raw, i + 2);
  });
}

function listRecords_() {
  const records = rowsAsObjects_().map(r => ({ rowNumber: r.rowNumber, protocolo: r.protocolo, titulo: r.titulo, responsavel: r.responsavel, dataEnvio: r.dataEnvio }));
  return { ok: true, records };
}

function getRecord_(rowNumber) {
  if (!rowNumber || rowNumber < 2) throw new Error('Linha inválida.');
  const sh = sourceSheet_();
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  const row = sh.getRange(rowNumber, 1, 1, sh.getLastColumn()).getValues()[0];
  const raw = {};
  headers.forEach((h, i) => raw[h] = row[i]);
  return { ok: true, data: mapRow_(raw, rowNumber) };
}

function mapRow_(raw, rowNumber) {
  const obj = { rowNumber, raw };
  obj.dataEnvio = isoDate_(pick_(raw, ['carimbo de data hora', 'timestamp', 'data hora', 'data de envio']));
  obj.protocolo = pick_(raw, ['protocolo', 'numero do protocolo', 'n protocolo', 'protocolo ceua']);
  obj.titulo = pick_(raw, ['titulo', 'titulo do projeto', 'titulo da atividade', 'titulo do projeto de pesquisa', 'nome do projeto']);
  obj.titulo_en = pick_(raw, ['titulo em ingles', 'titulo ingles', 'title', 'english title']);
  obj.responsavel = pick_(raw, ['responsavel', 'pesquisador responsavel', 'docente responsavel', 'coordenador', 'nome do responsavel']);
  obj.dt_ini = isoDate_(pick_(raw, ['inicio da atividade', 'data de inicio', 'data inicio', 'inicio']));
  obj.dt_fim = isoDate_(pick_(raw, ['final da atividade', 'data final', 'data de termino', 'fim', 'termino']));
  obj.especies = pick_(raw, ['especies animais aprovadas', 'especies', 'especie', 'especie animal']) || inferByHeader_(raw, ['especie']);
  obj.quantidade = pick_(raw, ['quantidade total', 'numero total de animais', 'numero de animais', 'quantidade', 'total de individuos']) || inferByHeader_(raw, ['quantidade', 'numero', 'total']);
  obj.data_certificado = isoDate_(new Date());
  obj.assinatura = 'Prof. Dr. Marco Antônio Bacellar Barreiros / Palotina';
  obj.portaria = 'Portaria Nº 1475/2024-PL';
  return obj;
}

function pick_(raw, aliases) {
  const wanted = aliases.map(norm_);
  for (const key in raw) {
    if (wanted.indexOf(norm_(key)) >= 0 && raw[key] !== '' && raw[key] !== null && raw[key] !== undefined) return String(raw[key]).trim();
  }
  for (const key in raw) {
    const nk = norm_(key);
    if (wanted.some(a => nk.indexOf(a) >= 0) && raw[key] !== '' && raw[key] !== null && raw[key] !== undefined) return String(raw[key]).trim();
  }
  return '';
}

function inferByHeader_(raw, terms) {
  const vals = [];
  for (const key in raw) {
    const nk = norm_(key);
    if (terms.some(t => nk.indexOf(t) >= 0) && raw[key] !== '' && raw[key] !== null && raw[key] !== undefined) vals.push(String(raw[key]).trim());
  }
  return Array.from(new Set(vals)).join('; ');
}

function norm_(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function isoDate_(v) {
  if (!v) return '';
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v)) return Utilities.formatDate(v, TIMEZONE, 'yyyy-MM-dd');
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return m[3] + '-' + pad_(m[2]) + '-' + pad_(m[1]);
  const d = new Date(s);
  return isNaN(d) ? '' : Utilities.formatDate(d, TIMEZONE, 'yyyy-MM-dd');
}

function brDate_(iso) {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? m[3] + '/' + m[2] + '/' + m[1] : String(iso || '');
}

function enDate_(iso) {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return String(iso || '');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[Number(m[2]) - 1] + ' ' + Number(m[3]) + ', ' + m[1];
}

function pad_(n) { return String(n).padStart(2, '0'); }

function emitCertificate_(data) {
  ['protocolo', 'titulo', 'responsavel', 'especies', 'quantidade', 'dt_ini', 'dt_fim', 'data_certificado'].forEach(k => {
    if (!data[k]) throw new Error('Campo obrigatório ausente: ' + k);
  });
  const pdf = createPdf_(data);
  appendLog_(data, pdf);
  return { ok: true, pdfName: pdf.getName(), pdfUrl: pdf.getUrl(), pdfId: pdf.getId() };
}

function createPdf_(d) {
  const periodo = brDate_(d.dt_ini) + ' a ' + brDate_(d.dt_fim);
  const safe = String(d.protocolo).replace(/[\\/:*?"<>|]/g, '-');
  const name = 'Certificado_CEUA_' + safe + '_' + String(d.responsavel).slice(0, 40);
  const doc = DocumentApp.create(name);
  const body = doc.getBody();
  body.clear();
  body.setMarginTop(54).setMarginBottom(54).setMarginLeft(72).setMarginRight(72);
  try {
    const logoBlob = Utilities.newBlob(Utilities.base64Decode(LOGO_BASE64), 'image/jpeg', 'ceua-logo.jpg');
    const img = body.appendImage(logoBlob);
    img.setWidth(78).setHeight(78);
    body.getChild(body.getNumChildren() - 1).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  } catch (e) {}
  title_(body, 'CERTIFICADO DE APROVAÇÃO');
  para_(body, 'Certifico que o formulário sob o protocolo nº ' + d.protocolo + ', referente ao projeto de pesquisa intitulado ' + d.titulo + ', envolvendo as seguintes espécies animais aprovadas (' + d.especies + ') na quantidade total de ' + d.quantidade + ' indivíduos, para execução no período ' + periodo + ', sob responsabilidade de ' + d.responsavel + ', foi apreciado pela CEUA/Palotina e considerado APROVADO.');
  para_(body, 'Palotina, ' + brDate_(d.data_certificado) + '.');
  body.appendParagraph('');
  title_(body, 'CERTIFICATE OF APPROVAL');
  para_(body, 'I certify that the form under protocol no. ' + d.protocolo + ', related to the research project entitled ' + (d.titulo_en || d.titulo) + ', involving the following approved animal species (' + d.especies + ') in the total number of ' + d.quantidade + ' individuals, to be carried out during the period ' + periodo + ', under the responsibility of ' + d.responsavel + ', was reviewed by CEUA/Palotina and considered APPROVED.');
  para_(body, 'Palotina, ' + enDate_(d.data_certificado) + '.');
  body.appendParagraph('\n\n________________________________________').setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  body.appendParagraph(d.assinatura || 'Prof. Dr. Marco Antônio Bacellar Barreiros / Palotina').setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  body.appendParagraph('(' + (d.portaria || 'Portaria Nº 1475/2024-PL') + ')').setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  doc.saveAndClose();
  const folder = pdfFolder_();
  const docFile = DriveApp.getFileById(doc.getId());
  const pdf = folder.createFile(docFile.getBlob().getAs(MimeType.PDF)).setName(name + '.pdf');
  docFile.setTrashed(true);
  return pdf;
}

function title_(body, text) {
  body.appendParagraph(text).setHeading(DocumentApp.ParagraphHeading.HEADING2).setAlignment(DocumentApp.HorizontalAlignment.CENTER).editAsText().setBold(true);
}

function para_(body, text) {
  body.appendParagraph(text).setAlignment(DocumentApp.HorizontalAlignment.JUSTIFY).setLineSpacing(1.25);
}

function ceuaFolder_() {
  const file = DriveApp.getFileById(SOURCE_SPREADSHEET_ID);
  const parents = file.getParents();
  return parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
}

function pdfFolder_() {
  const parent = ceuaFolder_();
  const folders = parent.getFoldersByName(PDF_FOLDER_NAME);
  return folders.hasNext() ? folders.next() : parent.createFolder(PDF_FOLDER_NAME);
}

function certificadosSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const saved = props.getProperty('CERTIFICADOS_SPREADSHEET_ID');
  if (saved) {
    try { return SpreadsheetApp.openById(saved); } catch (e) {}
  }
  const folder = ceuaFolder_();
  const files = folder.getFilesByName(CERTIFICADOS_SPREADSHEET_NAME);
  if (files.hasNext()) {
    const ss = SpreadsheetApp.openById(files.next().getId());
    props.setProperty('CERTIFICADOS_SPREADSHEET_ID', ss.getId());
    return ss;
  }
  const ss = SpreadsheetApp.create(CERTIFICADOS_SPREADSHEET_NAME);
  DriveApp.getFileById(ss.getId()).moveTo(folder);
  props.setProperty('CERTIFICADOS_SPREADSHEET_ID', ss.getId());
  return ss;
}

function appendLog_(d, pdf) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = certificadosSpreadsheet_();
    const sh = ss.getSheets()[0];
    const headers = ['emitido_em', 'protocolo', 'responsavel', 'titulo', 'titulo_en', 'especies', 'quantidade', 'periodo', 'data_certificado', 'pdf_nome', 'pdf_url', 'pdf_id', 'dados_json', 'status'];
    if (sh.getLastRow() === 0) sh.appendRow(headers);
    sh.appendRow([new Date(), d.protocolo, d.responsavel, d.titulo, d.titulo_en || '', d.especies, d.quantidade, brDate_(d.dt_ini) + ' a ' + brDate_(d.dt_fim), brDate_(d.data_certificado), pdf.getName(), pdf.getUrl(), pdf.getId(), JSON.stringify(d), 'emitido']);
  } finally {
    lock.releaseLock();
  }
}