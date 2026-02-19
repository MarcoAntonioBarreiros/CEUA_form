# Formulário CEUA — UFPR Palotina

**Formulário Unificado para Solicitação de Autorização para Uso de Animais em Ensino, Pesquisa e Treinamento**

Versão 2.0 · Conforme RN 53/2021 (CONCEA)

---

## Funcionalidades

- Formulário multi-etapas com 6 seções (Identificação → Equipe → CIUCA/Projeto → Animais → Procedimentos → Finalização)
- **Árvore de decisão da RN 53/2021** — aparece automaticamente para atividades de ensino/treinamento
- Espécies padronizadas por dropdown (roedores, carnívoros, ruminantes, aves, peixes, etc.)
- Sexo dos animais padronizado (Macho / Fêmea / Ambos)
- Geração de PDF local (jsPDF)
- Envio automático para Google Sheets via Apps Script
- Seção de métodos substitutivos (Art. 2º, RN 53)
- Termo de Responsabilidade com item adicional para ensino

---

## Deploy no GitHub Pages

### Passo 1 — Criar repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Nome sugerido: `ceua-formulario`
3. Marque **Public** (necessário para GitHub Pages gratuito)
4. Clique em **Create repository**

### Passo 2 — Subir os arquivos

**Opção A — Pelo navegador (mais fácil):**

1. No repositório criado, clique em **"uploading an existing file"**
2. Arraste os arquivos `index.html` e `README.md`
3. Clique em **Commit changes**

**Opção B — Por linha de comando:**

```bash
git clone https://github.com/SEU_USUARIO/ceua-formulario.git
cd ceua-formulario
# copie os arquivos index.html e README.md para esta pasta
git add .
git commit -m "Formulário CEUA v2.0 — RN 53/2021"
git push origin main
```

### Passo 3 — Ativar GitHub Pages

1. No repositório, vá em **Settings** → **Pages** (menu lateral)
2. Em **Source**, selecione **Deploy from a branch**
3. Em **Branch**, selecione `main` e pasta `/ (root)`
4. Clique em **Save**
5. Aguarde ~1 minuto — a URL será:

```
https://SEU_USUARIO.github.io/ceua-formulario/
```

### Passo 4 — Incorporar no WordPress

No editor do WordPress (Gutenberg), adicione um bloco **"HTML Personalizado"** na página da CEUA com:

```html
<iframe 
  src="https://SEU_USUARIO.github.io/ceua-formulario/" 
  width="100%" 
  height="1400" 
  style="border:none; border-radius:12px; max-width:1100px; margin:0 auto; display:block;"
  loading="lazy"
  title="Formulário CEUA 2025">
</iframe>
```

> **Dica:** Se a altura ficar inadequada, ajuste o valor `height`. Para auto-resize, veja a seção abaixo.

### (Opcional) Auto-resize do iframe

Para que o iframe ajuste a altura automaticamente ao conteúdo, adicione este script **após** o iframe no WordPress:

```html
<script>
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'ceua-resize') {
    document.querySelector('iframe[title="Formulário CEUA 2025"]').style.height = e.data.height + 'px';
  }
});
</script>
```

E no `index.html`, antes do `</body>`, adicione:

```html
<script>
// Envia altura ao WordPress pai
function notifyHeight() {
  window.parent.postMessage({ type: 'ceua-resize', height: document.body.scrollHeight + 40 }, '*');
}
window.addEventListener('load', notifyHeight);
new MutationObserver(notifyHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
</script>
```

---

## Configuração do Google Sheets

### Passo 1 — Criar a planilha

Crie uma planilha no Google Sheets com o nome de colunas na primeira linha, na ordem exata do array `COLUNAS` no código.

### Passo 2 — Criar o Apps Script

1. Na planilha, vá em **Extensões** → **Apps Script**
2. Cole o seguinte código:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = headers.map(function(h) {
    // Busca a chave correspondente ao header
    for (var key in data) {
      if (key === h || data[key] === h) return data[key] || '';
    }
    return '';
  });
  sheet.appendRow(row);
  return ContentService.createTextOutput(JSON.stringify({status: 'ok'}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Clique em **Implantar** → **Nova implantação**
4. Tipo: **App da Web**
5. Executar como: **Eu**
6. Quem tem acesso: **Qualquer pessoa**
7. Copie a URL gerada

### Passo 3 — Colar a URL no formulário

No `index.html`, localize a linha:

```javascript
const APPS_SCRIPT_URL = 'COLE_SUA_URL_AQUI';
```

Substitua `COLE_SUA_URL_AQUI` pela URL do Apps Script.

---

## Estrutura do Repositório

```
ceua-formulario/
├── index.html          ← Formulário completo (HTML + CSS + JS)
└── README.md           ← Este arquivo
```

---

## Conformidade Legal

Este formulário implementa os requisitos da:

- **Lei nº 11.794/2008** — Lei de Procedimentos para Uso Científico de Animais
- **Resolução Normativa CONCEA nº 53/2021** — Restrições ao uso de animais em ensino
- **DBCA** — Diretriz Brasileira para o Cuidado e a Utilização de Animais

---

## Manutenção

Para atualizar o formulário:

1. Edite o `index.html` localmente
2. Faça commit e push para o GitHub
3. O GitHub Pages atualiza automaticamente em ~1 minuto
4. O iframe no WordPress reflete a mudança sem editar nada no WordPress

---

**CEUA Palotina · UFPR · 2025–2026**
