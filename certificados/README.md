# Emissor de Certificados CEUA

Este módulo cria uma página técnica separada do formulário público da CEUA.

Caminho no GitHub Pages:

```text
/certificados/
```

A página não é chamada pelo `index.html` principal, portanto não aparece automaticamente na página pública do formulário. O acesso operacional deve ser por link direto com chave:

```text
https://MarcoAntonioBarreiros.github.io/CEUA_form/certificados/?token=SUA_CHAVE
```

## O que foi implementado

- Importação dos registros da planilha de respostas informada.
- Seleção de uma linha da planilha por protocolo, título ou responsável.
- Campos importados editáveis antes da emissão.
- Geração do certificado em PDF pelo Google Apps Script.
- Uso do logo da CEUA no certificado.
- Registro de cada emissão em uma nova planilha do Google Sheets, criada no mesmo Drive/pasta da planilha original.
- Salvamento dos PDFs na subpasta `Certificados_CEUA_PDF`.

## Arquivos

```text
certificados/index.html              Página de emissão
apps-script/certificados.gs          Código do Apps Script
certificados/README.md               Este guia
```

## Configuração do Apps Script

1. Abra a planilha de respostas da CEUA.
2. Vá em **Extensões > Apps Script**.
3. Cole o conteúdo de `apps-script/certificados.gs`.
4. Altere a linha:

```javascript
const ACCESS_TOKEN = 'ALTERE_ESTA_CHAVE_LONGA';
```

Use uma chave longa, por exemplo uma frase sem espaços ou um UUID.

5. Clique em **Implantar > Nova implantação**.
6. Tipo: **App da Web**.
7. Executar como: **Eu**.
8. Quem tem acesso: **Qualquer pessoa**.
9. Copie a URL terminada em `/exec`.

## Configuração da página HTML

No arquivo `certificados/index.html`, altere:

```javascript
const APPS_SCRIPT_URL = 'COLE_A_URL_DO_APPS_SCRIPT_AQUI';
```

Cole a URL do Apps Script.

Também é possível passar a URL temporariamente pelo próprio link:

```text
/certificados/?token=SUA_CHAVE&script=URL_DO_APPS_SCRIPT
```

## Planilhas criadas/usadas

A planilha original de respostas é lida pelo ID:

```text
1KYtQIG3w9QPvCXpueGZkfZTIa26oLg_h0Y-aU9BI62E
```

A planilha nova de registro será criada automaticamente com o nome:

```text
CEUA_certificados_emitidos
```

Ela terá uma linha por certificado emitido, com link do PDF e snapshot JSON dos dados usados na emissão.

## Observação operacional

O certificado usa o texto do modelo enviado: bloco em português, bloco em inglês, local/data e assinatura. Os campos importados podem ser corrigidos manualmente antes da emissão; essa correção fica registrada no snapshot da emissão.