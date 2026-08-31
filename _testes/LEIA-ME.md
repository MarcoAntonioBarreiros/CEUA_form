
## Revisão de 31/08 — auditoria cruzada

A planilha foi conferida contra uma extração independente feita a partir do mesmo
corpus do Drive. Resultado: 285 dispositivos idênticos, **zero divergência de
classificação, subgrupo e redação**. Uma divergência de finalidade, resolvida a
favor da extração independente:

**RN 64/2023, art. 2º, I, "g"** — "instalações onde ocorra reprodução com altura e
piso propícios à monta". Estava marcado como restrito à criação; "onde ocorra
reprodução" é **condição**, não restrição de finalidade. Corrigido para "todas",
com a condição registrada na coluna própria.

Duas colunas incorporadas da revisão independente:
- **Escopo operacional CIUCA** — a finalidade na nomenclatura da plataforma.
- **Condição / exceção explícita** — 25 itens. Separa condição de finalidade:
  "quando existentes", "sempre que necessário", "exceto se justificado",
  "na ausência de grupo gerador", "em serpentários abertos", "onde ocorra
  reprodução". São os casos em que "Não se aplica" tem base textual expressa.
  O formulário exibe a condição junto ao critério.

## Paridade dos pareceristas

Rode `python _testes/teste_paridade_pareceristas.py ciuca` para comparar, por
táxon, as assinaturas `id + RN + dispositivo + classificação + finalidade +
subgrupo + condição` do coordenador e do parecerista. O teste também confirma
os totais globais de 285 critérios, 193 Obrigatórios e 92 Recomendados.
