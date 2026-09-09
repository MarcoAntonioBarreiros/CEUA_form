# Cópias preservadas da base do formulário

Cópias exatas dos arquivos que o formulário oficial carrega, servidas pelo GitHub Pages.

- `solicitacao-ceua-appscript.html`: cópia exata do arquivo homônimo no commit `95cc54e193cb4199b6563ca5be1316900c438f48`; blob `97e230429a72e21b0312a6d1f73facacd1d71b88`.
- `formulario-original.html`: cópia exata de `index.html` na referência `backup-index-before-appscript-20260623`; blob `03f208116637807fb3738f85ff87b7972d8fc602`.

Desde 09/09/2026 estas cópias **são as fontes usadas em produção**: `solicitacao-ceua-appscript.html` (na raiz) carrega a base a partir desta pasta pelo GitHub Pages e, em tempo de execução, também redireciona a segunda camada (o formulário original) para cá. O `raw.githubusercontent.com` ficou apenas como reserva, porque estava respondendo HTTP 503 de forma intermitente e impedia a abertura do formulário.

**Os dois arquivos desta pasta devem permanecer byte a byte iguais aos blobs indicados acima.** O carregador de produção aplica substituições de texto exatas sobre eles; qualquer edição aqui quebra o formulário. Para mudar comportamento, edite os módulos (`ceua-*.js`) ou o carregador da raiz.
