# AI Handoff - QuestLog

Este documento e a ponte entre o Codex 2, no PC de trabalho, e o Codex 1, no PC de casa. Ele deve ser tratado como a principal fonte de contexto atual do produto, pois a conversa evoluiu bastante depois do handoff anterior.

## Estado Atual

O prototipo web do QuestLog esta praticamente fechado como MVP visual/manual. O usuario disse que, neste ponto, parece pronto para virar app. Ainda assim, a migracao para app desktop so deve acontecer quando ele confirmar explicitamente.

O projeto continua sendo um prototipo estatico com:

```text
index.html
styles.css
app.js
README.md
AI_HANDOFF.md
AUTOMATION_BACKLOG.md
assets/
```

Ele roda localmente via servidor simples:

```powershell
py -m http.server 5179 --bind 127.0.0.1
```

URL local usada no PC de trabalho:

```text
http://127.0.0.1:5179/index.html
```

## Intencao Do Produto

QuestLog e um app pessoal para acompanhar jogos de campanha iniciados, pausados, finalizados, desejados ou abandonados. A dor principal do usuario e nao querer manter planilha e nao querer esquecer campanhas iniciadas.

A inspiracao em Letterboxd e principalmente visual/layout:

- colecao por capas;
- sensacao de catalogo;
- navegacao por prateleiras;
- experiencia bonita e motivadora.

Nao e rede social no MVP.

Frase de produto:

> QuestLog e um app desktop pessoal para acompanhar campanhas de jogos, registrar horas totais, visualizar progresso da historia e organizar o backlog ativo em uma interface premium de biblioteca.

## Decisoes Confirmadas

### Nome

O nome e **QuestLog**.

### Formato

Formato final desejado: app desktop.

Direcao provavel: Tauri.

Importante: por enquanto continuar no site/prototipo. O usuario pediu explicitamente para nao levar ao app ate bater o martelo em uma versao.

### Tela Inicial

A tela inicial nao deve ser abas. Isso mudou.

Agora a home e composta por prateleiras horizontais, uma abaixo da outra, estilo Letterboxd/Netflix.

Ordem oficial dos status:

1. Jogando
2. Pausado
3. Finalizado
4. Quero Jogar
5. Abandonado

Cada status aparece como uma secao/prateleira com cards horizontais.

### Header / Resumo

O header atual tem:

- logo QL;
- texto QUESTLOG com QUEST em dourado e LOG em azul;
- resumo:
  - jogos em Jogando;
  - jogos zerados;
  - horas registradas;
- botao Adicionar jogo.

Foi removido:

- titulo grande "Status dos Jogos";
- indicador "perto de zerar".

### Logo / Brand

O usuario enviou um Brand Board e depois assets separados.

Asset local atual aplicado:

```text
assets/questlog-ql-logo.png
```

Esse arquivo veio de:

```text
C:\Users\Enrico.Trajano\Downloads\IMG_2023__1_-removebg-preview.png
```

Ele foi testado e possui transparencia real:

```text
Format32bppArgb
cantos alpha 0
centro alpha 255
```

IMPORTANTE: se o repositorio remoto ainda nao tiver `assets/questlog-ql-logo.png`, o Codex 1 precisa commitar esse PNG ou recriar/copiar o asset localmente.

### Paleta

Paleta baseada no Brand Board:

```css
--bg: #06111d;
--bg-deep: #020812;
--surface: #0d1f33;
--surface-strong: #132d49;
--surface-soft: #182c43;
--ink: #f5f7fa;
--muted: #a9b8ca;
--accent: #f2c14e;
--accent-strong: #ffd978;
--blue: #4f8ef7;
--complete: #67d68b;
```

A identidade visual desejada e premium: navy escuro, dourado, azul e off-white.

## UX Atual

### Prateleiras

Cada status gera uma prateleira horizontal de cards. A lista suporta:

- scroll horizontal nativo;
- arrastar com botao esquerdo do mouse para rolar para o lado;
- clique curto no card para abrir a ficha;
- protecao para nao abrir card acidentalmente depois de um arrasto.

### Cards

Card atual mostra:

- capa/fallback;
- titulo;
- barra de progresso;
- texto de progresso e horas restantes.

Foi removida a plataforma do card para liberar espaco visual. A plataforma continua aparecendo na ficha.

### Ficha Do Jogo

Ao clicar no card, abre uma ficha em modal na mesma pagina.

Essa ficha substituiu o antigo painel lateral fixo, que ocupava muito espaco.

A ficha mostra:

- capa;
- controle de status;
- titulo;
- plataforma;
- barra de progresso;
- tempo de jogo;
- historia estimada;
- restante;
- atualizado;
- inicio;
- finalizado;
- notas;
- botao Editar;
- botao Atualizar progresso.

O modal fecha por:

- botao X;
- clique fora do card/modal.

### Status

O status na ficha nao usa mais `select` nativo. Foi substituido por botoes estilizados:

```text
Jogando
Pausado
Finalizado
Quero Jogar
Abandonado
```

Mudar status move o card para a prateleira correta.

### Datas Automaticas

O usuario nao precisa preencher datas manualmente.

Regras atuais:

- `startedAt`: preenchido automaticamente quando o jogo entra em `Jogando` pela primeira vez.
- `completedAt`: preenchido automaticamente quando o jogo entra em `Finalizado`.
- se o jogo sai de `Finalizado`, `completedAt` e limpo.

### Progresso

O fluxo original de "Registrar sessao" foi descartado.

Agora o usuario atualiza as horas totais atuais do jogo, como na Steam.

Exemplo:

```text
Horas totais atuais: 14,3
```

Esse valor substitui `hoursPlayed`, nao soma uma sessao.

O prompt nativo do navegador foi removido. Existe modal proprio:

```text
Atualizar progresso
Horas totais atuais
```

### Barra De Progresso

A barra evolui de cor conforme o progresso:

- inicio: azul;
- meio: azul claro/dourado;
- perto do fim: dourado;
- 100%: verde.

Funcao atual:

```js
function getProgressColor(progress) {
  if (progress >= 100) return "#67d68b";
  if (progress >= 70) return "#f2c14e";
  if (progress >= 35) return "#6aa7ff";
  return "#4f8ef7";
}
```

### Animacoes

Foram adicionadas animacoes leves:

- entrada do header/secoes;
- hover dos cards;
- zoom suave na capa;
- transicao da barra;
- entrada dos modais.

Tambem existe respeito a:

```css
@media (prefers-reduced-motion: reduce)
```

## Campos Do Cadastro

Cadastro atual:

- Titulo;
- Plataforma;
- Status;
- Horas jogadas;
- Estimativa historia (h);
- Capa do jogo;
- Notas.

Foi removido:

- Onde parei / proximo objetivo.

O usuario decidiu que nao pretende usar esse campo.

## Modelo De Dados Atual

Objeto de jogo:

```js
{
  id: string,
  title: string,
  platform: string,
  status: "playing" | "paused" | "completed" | "wishlist" | "abandoned",
  hoursPlayed: number,
  storyEstimateHours: number,
  coverDataUrl: string,
  nextStep: string,
  notes: string,
  startedAt: number | null,
  completedAt: number | null,
  updatedAt: number
}
```

Nota: `nextStep` ainda existe internamente para migrar dados antigos, mas nao aparece mais na UI e novos jogos salvam `nextStep: ""`.

## Persistencia Atual

Ainda usa `localStorage`.

Chaves:

```js
const STORAGE_KEY = "questlog.games.v2";
const LEGACY_STORAGE_KEY = "questlog.games.v1";
```

Para app final, migrar para arquivo local ou SQLite.

Capas atualmente sao Data URL em `localStorage`, suficiente para prototipo, mas nao ideal para app final.

## Estado De Pronto

O usuario disse:

> bom, acho que agora ja ta 100% pra mandar pro app

Interpretacao:

- MVP visual/manual praticamente aprovado.
- Proxima etapa pode ser migracao para app desktop.
- Antes de migrar, confirmar explicitamente se ele quer partir para Tauri agora.

## O Que Falta Antes De App

Nada essencial de produto no MVP manual foi apontado como pendente no momento.

Possiveis polimentos opcionais:

- setas laterais nas prateleiras;
- preview da capa no cadastro;
- confirmacao visual/toast ao atualizar progresso;
- exportar/importar JSON;
- limpar dados de exemplo facilmente.

## Automacoes Futuras

Fora do MVP:

- Steam puxar biblioteca;
- Steam puxar horas jogadas automaticamente;
- HowLongToBeat puxar estimativa da historia;
- capas automaticas;
- metadados automaticos;
- historico de sessoes;
- estatisticas semanais/mensais;
- backup;
- sincronizacao.

Steam e possivel via API oficial, mas depende de Steam Web API Key e privacidade do perfil.

HowLongToBeat e mais fragil porque nao ha API publica oficial simples; pode exigir biblioteca nao oficial/scraping/cache.

## Cuidados Para O Codex 1

- Nao voltar para layout de abas.
- Nao restaurar painel lateral fixo.
- Nao restaurar "Onde parei".
- Nao restaurar `prompt()` nativo para progresso.
- Nao usar select nativo para status na ficha.
- Manter o foco em MVP manual antes de automacoes.
- Manter a sensacao premium do Brand Board.
- Confirmar com o usuario antes de migrar para Tauri.

## Arquivos Que Devem Estar No Repo

```text
index.html
styles.css
app.js
README.md
AI_HANDOFF.md
assets/questlog-ql-logo.png
```

## Comandos Uteis

Validar JS:

```powershell
node --check app.js
```

Servir prototipo:

```powershell
py -m http.server 5179 --bind 127.0.0.1
```

Abrir:

```text
http://127.0.0.1:5179/index.html
```
