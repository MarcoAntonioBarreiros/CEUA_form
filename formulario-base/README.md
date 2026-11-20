# Base do formulário

Arquivos que o formulário oficial carrega, servidos pelo GitHub Pages.

- `solicitacao-ceua-appscript.html`: segunda camada. Busca `formulario-original.html`, aplica substituições de texto (`html.replace`) e grava a página.
- `formulario-original.html`: o formulário em si (campos, `coletarDados()`, PDF).

Origem: cópias do commit `95cc54e193cb4199b6563ca5be1316900c438f48` (base) e da referência `backup-index-before-appscript-20260623` (original). Até 09/09/2026 eram byte a byte iguais a esses blobs; **desde 19/11/2026 foram editadas** (campos do formulário unificado do CONCEA, correções do PDF, ajuda do GI pela RN 55/2022) e deixaram de ser cópias.

Desde 09/09/2026 estas são as fontes usadas em produção: `solicitacao-ceua-appscript.html` (na raiz) carrega a base desta pasta pelo GitHub Pages e redireciona a segunda camada (o original) para cá. O `raw.githubusercontent.com` fica só como reserva e aponta para estes mesmos arquivos na `main`.

**Cuidado ao editar:** a base e o carregador da raiz fazem substituições sobre trechos exatos do original (e o carregador, sobre trechos da base). Se um trecho-âncora mudar, o ajuste correspondente some sem erro visível (só as substituições marcadas com `trocar()` falham alto). Depois de mexer, confira cada âncora e atualize `VER` no carregador da raiz.
