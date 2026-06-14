## Objetivo

Tornar o sistema rápido e fazer com que edições apareçam imediatamente, sem precisar atualizar a página — sem alterar comportamento nem visual.

## Diagnóstico (o que está a causar a lentidão)

1. **Consultas em excesso ao carregar turmas (causa principal do "Carregando turmas...").**
   Ao montar a lista de turmas, o sistema processa cada par de turmas individualmente e, para *cada* par, faz várias idas à base de dados. Pior: carrega a lista **completa** de todos os alunos e de todos os criadores **duas vezes por par**. Com vários pares, isto multiplica-se em dezenas de consultas pesadas e repetidas.

2. **Recarregamento total a cada pequena mudança.**
   Existem dois "ouvintes" de tempo real a recarregar tudo (um deles duplicado para a tabela de salas). Cada alteração dispara uma recarga completa e pesada, e volta a mostrar o ecrã "Carregando", causando o piscar/lentidão.

3. **Edições só aparecem após atualizar a página.**
   Ao guardar uma edição, a tela não é atualizada de imediato — depende do recarregamento de tempo real, que por ser lento (ponto 1) dá a sensação de que "não aconteceu nada".

4. **Atraso artificial nos horários.**
   A tela de horários tem uma espera fixa de 1 segundo programada de propósito antes de mostrar os dados.

## O que vai ser feito

### 1. Carregar dados das turmas em bloco (a maior melhoria)
Reescrever a função de carregamento para buscar tudo em poucas consultas em vez de dezenas:
- Buscar todos os pares de turmas, todas as turmas (já com a sala associada) e todos os alunos/criadores **uma única vez cada**.
- Montar a estrutura em memória, associando alunos e salas a cada par, sem repetir consultas.

Resultado: o que hoje são dezenas de consultas passa a ser cerca de 3 consultas — carregamento muito mais rápido.

### 2. Refresh silencioso e sem duplicação
- As recargas em segundo plano (tempo real) deixam de mostrar o ecrã "Carregando"; os dados na tela permanecem visíveis e são atualizados sem piscar. O "Carregando" aparece apenas no primeiro carregamento.
- Agrupar mudanças rápidas (debounce curto) para não recarregar várias vezes seguidas.
- Remover a duplicação de ouvintes da tabela de salas (unificar para evitar recargas em dobro).

### 3. Edições aparecem na hora
- Garantir atualização imediata do estado local ao criar/editar/eliminar/ativar pares e alunos (atualização otimista), com reversão automática em caso de erro.
- Consolidar a camada dupla de gestão de turmas para que a edição feita no diálogo se reflita instantaneamente na lista, complementada pela sincronização de tempo real já existente.

### 4. Remover o atraso artificial dos horários
- Eliminar a espera fixa de 1 segundo na tela de horários para que apareça imediatamente.

## Detalhes técnicos

- `src/hooks/useSupabaseTurmaData.ts`: substituir `convertDBTurmaPairToInterface` (chamado em loop com `await` por par e com 2× `alunosService.getAllWithCreator()` por par) por um carregamento em lote — `turmaPairsService.getAll()`, `turmas` com join de `salas`, e um único `getAllWithCreator()` — montando os pares via `Map` em memória. Adicionar um parâmetro `silent` ao `loadTurmaPairs` para não acionar `setLoading(true)` em recargas de tempo real.
- `src/hooks/useTurmaData.ts`: remover a camada/estado duplicado e o segundo canal realtime redundante; usar `setTurmaPairs` otimista nas operações de update e debounce (~300ms) no handler de realtime. Manter a mesma API pública do hook para não quebrar os componentes que o consomem (`Turmas.tsx`, grids, diálogos).
- `src/hooks/useSalasData.ts`: tornar a recarga de realtime silenciosa (sem `setLoading(true)`) e evitar o canal duplicado de `salas`.
- `src/hooks/useScheduleData.ts`: remover o `setTimeout(..., 1000)` artificial.
- Adicionar índices na base de dados em `alunos(turma_id)`, `alunos(turma_pair_id)` e `turmas(turma_pair_id)` para acelerar as buscas, caso ainda não existam.

## Garantias

- Sem mudanças visuais nem de funcionalidades — apenas desempenho e atualização imediata.
- A API dos hooks permanece igual, evitando quebrar telas existentes.
- Em caso de erro numa operação, o estado é revertido e uma mensagem é mostrada (comportamento atual mantido).
