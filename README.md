# QuestLog

QuestLog e um app desktop em planejamento para organizar jogos de campanha sem depender de planilha. A versao atual ainda roda como prototipo web local, mas a experiencia principal do MVP manual foi praticamente fechada.

## Direcao do Produto

- Nome: QuestLog.
- Formato final: app desktop.
- Prototipo atual: site estatico local em HTML/CSS/JS.
- Inspiracao: Letterboxd/Netflix pelo layout visual de catalogo, nao por rede social.
- Tela inicial: prateleiras horizontais por status.
- Ordem dos status: Jogando, Pausado, Finalizado, Quero Jogar, Abandonado.
- Entrada inicial: manual.
- Progresso: horas jogadas contra estimativa da historia principal.
- Atualizacao de progresso: usuario informa as horas totais atuais do jogo, estilo Steam.
- Capa: arquivo de imagem escolhido manualmente.

## Campos do MVP

- Titulo.
- Plataforma.
- Status.
- Horas jogadas.
- Estimativa da historia em horas.
- Capa do jogo.
- Notas.
- Data de inicio automatica ao entrar em Jogando.
- Data de finalizacao automatica ao entrar em Finalizado.

## Experiencia Atual

- Header com identidade visual QuestLog.
- Resumo: jogando, jogos zerados e horas registradas.
- Prateleiras horizontais por status.
- Drag horizontal com mouse nas prateleiras.
- Ficha do jogo em modal ao clicar no card.
- Fechamento por X ou clique fora do modal.
- Troca de status diretamente na ficha por botoes estilizados.
- Modal proprio para atualizar progresso, sem prompt nativo do navegador.
- Animacoes leves de entrada, hover, capa, barra e modal.

## Como abrir agora

Sirva a pasta local e abra `index.html` no navegador. Os dados ficam salvos no `localStorage`.

```powershell
py -m http.server 5179 --bind 127.0.0.1
```

Depois acesse:

```text
http://127.0.0.1:5179/index.html
```

## Futuro Desktop

Quando o usuario bater o martelo nesta versao visual, o plano e migrar para Tauri e trocar o armazenamento por arquivo local ou SQLite. Automacoes como Steam e HowLongToBeat ficam para depois do MVP manual.
