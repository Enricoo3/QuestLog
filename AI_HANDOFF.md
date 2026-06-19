# AI Handoff - QuestLog

Este documento existe para permitir que outro agente continue o projeto em outra maquina sem acesso ao historico da conversa original. Ele deve ser tratado como a principal fonte de contexto do produto, decisoes tomadas e estado atual da implementacao.

## Resumo Executivo

QuestLog e um app desktop em planejamento para ajudar o usuario a organizar jogos de campanha que esta jogando, evitando que ele esqueça, pause indefinidamente ou drope jogos iniciados. A inspiracao inicial citada pelo usuario foi "Letterboxd, mas para jogos", porem o escopo foi refinado: nao e uma rede social nem apenas um catalogo. E um app pessoal de acompanhamento visual, mais bonito e motivador que uma planilha.

A versao atual e um prototipo web estatico em `index.html`, `styles.css` e `app.js`, usando `localStorage`. Ela foi criada rapidamente para dar uma primeira visualizacao, mas as decisoes posteriores do usuario devem guiar a continuacao. O formato final desejado e um app desktop, provavelmente com Tauri.

## Intencao do Produto

O problema que QuestLog resolve:

- O usuario joga varios jogos de campanha.
- Ele nao quer manter uma planilha para acompanhar o que esta jogando.
- Ele quer visualizar status, horas e progresso de uma forma mais bonita, interativa e motivadora.
- O app deve ajudar a nao dropar jogos iniciados.
- O progresso deve ser baseado em horas jogadas e estimativa de tempo da historia principal.

Uma boa frase de produto:

> QuestLog e um app desktop para acompanhar campanhas iniciadas, visualizar progresso por horas jogadas e transformar o backlog ativo em algo mais motivador de concluir.

## Decisoes Confirmadas Pelo Usuario

### Nome

O nome do app e **QuestLog**.

### Formato

O usuario quer um **app desktop**, nao um site.

Direcao tecnica preferida:

- Usar **Tauri** quando o projeto sair do prototipo estatico.
- O usuario aceitou que a implementacao siga "como for melhor" tecnicamente.
- A versao atual ainda nao usa Tauri. Ela e uma base visual/manual para iterar a experiencia antes da migracao.

### Tela Inicial

A tela inicial deve ser:

**Status dos Jogos**

Ela deve mostrar abas no topo, em ordem fixa:

1. Jogando
2. Finalizado
3. Pausado
4. Quero Jogar
5. Abandonado

O usuario reforcou que a primeira aba/tela deve ser essa organizacao por status. Ele prefere ver primeiro a colecao organizada, nao uma recomendacao automatica do que jogar hoje.

### Abas

Foi escolhido usar **abas no topo**, mostrando um status por vez.

O app abre inicialmente em:

- `Jogando`

### Cadastro Inicial

O MVP deve ser manual primeiro.

Campos esperados no MVP:

- Titulo
- Plataforma
- Status
- Horas jogadas
- Estimativa da historia principal em horas
- Capa do jogo por arquivo de imagem
- Onde parei / proximo objetivo
- Notas

### Progresso

O usuario quer foco apenas na historia principal.

Nao incluir no MVP:

- Historia + extras
- Complecionista
- Tipos de estimativa selecionaveis

Calculo desejado:

```text
progresso = horas_jogadas / estimativa_historia_principal
```

Exemplo:

```text
horas jogadas = 14,3h
estimativa historia = 30h
progresso = 47,6%
```

Na implementacao atual o progresso e arredondado para inteiro e limitado a 100%.

### Tempo de Jogo

O usuario enviou uma referencia visual da Steam mostrando:

```text
TEMPO DE JOGO
14,3 horas
```

A UI atual ja tenta refletir isso nos cards: um bloco de "Tempo de jogo" com horas formatadas em `pt-BR`, por exemplo `14,3 horas`.

### Capas

O usuario quer que o cadastro ja permita selecionar **arquivo de imagem** para a capa.

No prototipo atual:

- O input `type="file"` aceita `image/*`.
- A imagem e lida com `FileReader` e salva como Data URL dentro do `localStorage`.
- Isso e suficiente para prototipo, mas nao ideal no app desktop final se as imagens forem grandes.

Quando migrar para Tauri:

- Preferir copiar a imagem para uma pasta local de dados do app ou manter apenas referencia a caminho/asset gerenciado.
- Evitar salvar imagens grandes em SQLite/localStorage como base64 sem necessidade.

## Coisas Para Automatizar Depois

O usuario pediu explicitamente: comecar manual, mas anotar tudo que pode ser automatico depois.

Foi criado o arquivo `AUTOMATION_BACKLOG.md` com ideias futuras. Principais automacoes:

- Buscar capa automaticamente pelo nome do jogo.
- Buscar tempo medio de historia no HowLongToBeat.
- Buscar metadados como genero, ano, desenvolvedora e plataformas.
- Preencher estimativa de historia automaticamente ao cadastrar.
- Importar biblioteca da Steam.
- Importar horas jogadas da Steam.
- Atualizar horas jogadas automaticamente quando possivel.
- Detectar jogos iniciados recentemente.
- Avisar jogos sem sessao ha muitos dias.
- Sugerir jogos perto de finalizar.
- Marcar jogos em risco de drop.
- Registrar historico de sessoes.
- Criar estatisticas semanais ou mensais.
- Exportar/importar JSON.
- Backup automatico.
- Migrar armazenamento para SQLite no app Tauri.

Importante: essas automacoes estao fora do MVP manual.

## Estado Atual Do Repositorio

Workspace esperado:

```text
C:\Users\Enrico\Documents\QuestLog
```

Arquivos atuais criados/modificados:

```text
index.html
styles.css
app.js
README.md
AUTOMATION_BACKLOG.md
AI_HANDOFF.md
```

Tambem podem existir:

```text
.git
.agents
```

Observacao: durante a primeira sessao, `git`, `node` e `npm` nao estavam disponiveis no PATH global da maquina. O Codex tinha um Node empacotado em:

```text
C:\Users\Enrico\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe
```

Esse Node foi usado para validar sintaxe com:

```powershell
& 'C:\Users\Enrico\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --check app.js
```

A checagem passou.

## Arquitetura Atual

Ainda e um app estatico:

- `index.html`: estrutura da interface.
- `styles.css`: visual responsivo, tema escuro, abas, cards, modal.
- `app.js`: estado, renderizacao, persistencia local, calculo de progresso, cadastro/edicao.
- `README.md`: resumo do produto e direcao.
- `AUTOMATION_BACKLOG.md`: ideias futuras de automacao.

Nao ha bundler, framework, Tauri, Electron, package.json ou dependencia externa.

## Persistencia Atual

O prototipo usa:

```js
localStorage
```

Chave atual:

```js
questlog.games.v2
```

Chave legada migrada:

```js
questlog.games.v1
```

O codigo normaliza dados antigos de `v1` para o novo formato.

Importante:

- Como o app salva em `localStorage`, dados ficam presos ao navegador/origem.
- Abrir via `file://` pode ter comportamento diferente entre navegadores.
- Essa persistencia e apenas para prototipo.
- No app desktop final, migrar para arquivo local ou SQLite.

## Modelo De Dados Atual

Objeto de jogo atual:

```js
{
  id: string,
  title: string,
  platform: string,
  status: "playing" | "completed" | "paused" | "wishlist" | "abandoned",
  hoursPlayed: number,
  storyEstimateHours: number,
  coverDataUrl: string,
  nextStep: string,
  notes: string,
  updatedAt: number
}
```

Status atuais no codigo:

```js
[
  "playing",
  "completed",
  "paused",
  "wishlist",
  "abandoned"
]
```

Labels exibidos:

```text
Jogando
Finalizado
Pausado
Quero Jogar
Abandonado
```

## Logica De Progresso Atual

Funcao principal:

```js
function getProgress(game) {
  if (!game.storyEstimateHours) return 0;
  return Math.min(100, Math.round((Number(game.hoursPlayed || 0) / Number(game.storyEstimateHours)) * 100));
}
```

Restante:

```js
function getRemainingHours(game) {
  return Math.max(0, Number(game.storyEstimateHours || 0) - Number(game.hoursPlayed || 0));
}
```

Formato de horas:

```js
function formatHours(value) {
  const number = Number(value || 0);
  return number.toLocaleString("pt-BR", {
    minimumFractionDigits: Number.isInteger(number) ? 0 : 1,
    maximumFractionDigits: 1,
  });
}
```

Essa formatacao gera exemplos como:

```text
14,3
58,4
75
```

Nos cards aparece como:

```text
14,3 horas
```

## UI Atual

### Estrutura Geral

`index.html` define:

- Header principal com marca QuestLog.
- Resumo:
  - jogos em `Jogando`
  - jogos quase finalizados
  - horas registradas
- Botao `Adicionar jogo`.
- Abas de status no topo.
- Toolbar com busca e ordenacao.
- Grid de cards.
- Painel lateral/detalhe do jogo selecionado.
- Dialog/modal para adicionar/editar jogo.

### Abas

Cada aba tem:

- Label
- Contador de jogos daquele status

Ao clicar:

- `activeStatus` muda.
- O grid mostra apenas jogos daquele status.
- O primeiro jogo daquele status e selecionado automaticamente.

### Cards

Cada card mostra:

- Capa ou fallback com iniciais.
- Status.
- Titulo.
- Plataforma.
- Bloco "Tempo de jogo".
- Horas jogadas.
- Barra de progresso.
- Percentual da historia.
- Horas restantes aproximadas quando houver estimativa.
- Onde parei/proximo objetivo.

### Detalhe Do Jogo

Painel lateral mostra:

- Capa.
- Status.
- Titulo.
- Plataforma.
- Barra de progresso.
- Percentual da historia principal.
- Tempo de jogo.
- Historia estimada.
- Restante.
- Data curta de atualizacao.
- Onde parei.
- Notas.
- Botao `Editar`.
- Botao `Registrar sessao`.

### Registrar Sessao

Atualmente usa `prompt()`:

```js
const typedHours = prompt("Quantas horas voce jogou nesta sessao?", "1");
```

Ele aceita decimal com virgula ou ponto:

```js
Number(String(typedHours).replace(",", "."))
```

Depois soma no total de horas e atualiza `updatedAt`.

Melhoria futura recomendada:

- Trocar `prompt()` por um modal proprio do app.
- Talvez incluir anotacao opcional da sessao.
- Registrar historico de sessoes em vez de apenas somar horas.

## Design Atual

Estilo:

- Tema escuro.
- Inspiracao visual parcialmente em Steam/biblioteca.
- Cards com capa grande.
- Barra de progresso em verde/dourado.
- Header e abas com bordas discretas.
- Interface ainda e prototipo, mas ja tenta fugir de "planilha".

Paleta atual em `styles.css`:

```css
--bg: #151515;
--surface: #202020;
--surface-strong: #292929;
--surface-soft: #34302a;
--ink: #f4eee5;
--muted: #a79f96;
--line: #3c3833;
--accent: #d59c42;
--accent-strong: #f0b451;
--green: #62b182;
--danger: #d56d5f;
```

Notas:

- O usuario quer uma interface interativa e visualmente interessante.
- Nao quer algo cru/sem graca.
- Ainda assim, o app deve continuar sendo uma ferramenta pessoal clara e organizada.

## Pontos Importantes Da Conversa

O usuario criticou corretamente que o primeiro agente comecou a codar rapido demais sem discutir o produto. Ao continuar, evite repetir isso.

Postura recomendada:

- Antes de grandes mudancas, explique brevemente o que sera alterado.
- Se houver decisoes de produto abertas, converse primeiro.
- Para ajustes claramente derivados das decisoes ja tomadas, pode implementar.
- Nao transformar o app em site/landing page.
- Nao encerrar o projeto cedo demais com "finalizado"; ainda e fase de concepcao/MVP.

## Proximos Passos Recomendados

### 1. Validar A UI Atual Com O Usuario

Pedir feedback sobre:

- Abas no topo.
- Visual escuro estilo biblioteca.
- Card com capa grande.
- Painel lateral.
- Campos do cadastro.
- Uso de "Onde parei / proximo objetivo".

### 2. Melhorar UX Do MVP Estatico

Possiveis melhorias imediatas sem Tauri:

- Substituir `prompt()` de registrar sessao por modal proprio.
- Adicionar preview da capa no modal.
- Permitir remover capa.
- Ajustar responsividade se necessario.
- Adicionar estado vazio mais bonito por aba.
- Adicionar filtro de busca mais integrado ao visual.
- Melhorar ordenacao:
  - atualizados recentemente
  - mais perto de zerar
  - mais horas jogadas
  - titulo
- Considerar campo "data de inicio" e "data finalizado".

### 3. Decidir Quando Migrar Para Tauri

Quando a UI e modelo estiverem suficientemente aprovados:

- Criar projeto Tauri.
- Escolher stack frontend:
  - HTML/CSS/JS simples inicialmente, ou
  - React/Vite se o app crescer.
- Persistencia:
  - SQLite via plugin ou sidecar, ou
  - arquivo JSON local em app data.

Recomendacao:

- Para MVP desktop simples, Tauri + frontend Vite/React pode ser bom se houver muitos componentes.
- Se o objetivo for manter leve e direto, Tauri com HTML/CSS/JS tambem funciona, mas pode ficar trabalhoso conforme telas/modal/historico crescem.

### 4. Modelagem Para Desktop

Possivel modelo futuro:

```text
Game
- id
- title
- platform
- status
- hours_played
- story_estimate_hours
- cover_path
- next_step
- notes
- started_at
- completed_at
- created_at
- updated_at
```

Se adicionar historico:

```text
Session
- id
- game_id
- played_at
- hours_added
- note
```

Se integrar fontes externas:

```text
ExternalGameMetadata
- game_id
- source
- source_id
- cover_url
- story_estimate_hours
- fetched_at
```

### 5. Automatizacoes Futuras

Antes de implementar integracoes:

- Confirmar viabilidade de HowLongToBeat. Pode envolver ausencia de API oficial e necessidade de scraping/biblioteca nao oficial.
- Confirmar como lidar com Steam:
  - API oficial exige Steam Web API key para certos endpoints.
  - Horas jogadas podem depender de perfil publico.
  - Pode haver privacidade/limites.

Por enquanto, nao implementar essas integracoes sem conversar com o usuario.

## Cuidados Tecnicos

### Imagens Em LocalStorage

A implementacao atual salva capas como Data URL. Isso pode estourar tamanho de `localStorage` se muitas imagens grandes forem usadas.

No prototipo tudo bem, mas se o usuario comecar a usar seriamente:

- Redimensionar/comprimir imagem antes de salvar, ou
- Migrar para Tauri e armazenar imagens no disco.

### Acentos

Os arquivos foram mantidos majoritariamente em ASCII por preferencia de edicao. Textos visiveis estao sem acento em varios pontos:

```text
Concluido
proximo
sessao
historia
```

Isso nao foi uma decisao de produto, apenas uma escolha tecnica inicial. O usuario fala portugues; no futuro vale considerar acentuar a UI corretamente quando o pipeline estiver estavel.

### Browser Interno

Durante a sessao original, houve tentativa de validar visualmente pelo navegador interno do Codex. Falhou com erro de sandbox:

```text
windows sandbox failed: runner error: CreateProcessAsUserW failed: 5
```

Portanto, a validacao visual ainda nao foi feita pelo agente. Apenas `node --check app.js` passou.

## Comandos Uteis

Se Node global nao estiver no PATH, usar o Node empacotado do Codex:

```powershell
& 'C:\Users\Enrico\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --check app.js
```

Listar arquivos:

```powershell
Get-ChildItem -Force
```

Buscar referencias:

```powershell
Select-String -Path index.html,styles.css,app.js -Pattern "status-tab|story-estimate|cover"
```

## Definicao De Pronto Do MVP Manual

Um MVP inicial adequado deve permitir:

- Adicionar jogo manualmente.
- Escolher status.
- Ver jogos em abas por status.
- Escolher capa por arquivo.
- Registrar horas jogadas.
- Informar estimativa da historia principal.
- Ver progresso calculado automaticamente.
- Registrar onde parou/proximo objetivo.
- Editar e excluir jogos.
- Ter persistencia local confiavel.
- Ter visual de app/biblioteca, nao de planilha.

O prototipo atual cobre a maior parte disso, exceto persistencia robusta desktop e UX refinada de registrar sessao.

## Mensagem Ao Proximo Agente

Nao assuma que o projeto ja esta "pronto". O usuario esta em fase de definir produto e experiencia. A implementacao atual e util como base, mas deve continuar sendo moldada com feedback.

Priorize:

1. Respeitar as decisoes confirmadas.
2. Manter foco em app desktop/Tauri.
3. Evitar transformar em landing page ou site.
4. Manter o MVP manual antes de automacoes.
5. Construir uma interface visual, interativa e motivadora.
6. Conversar antes de mudancas grandes de produto.

Se for continuar codando imediatamente, a melhor proxima tarefa provavelmente e:

> Substituir o prompt de "Registrar sessao" por um modal proprio com campo de horas e anotacao opcional, preparando caminho para historico de sessoes.

