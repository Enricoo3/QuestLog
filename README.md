# QuestLog

QuestLog e um app desktop em planejamento para organizar jogos de campanha sem depender de planilha. A primeira versao ainda roda como prototipo web local, mas a direcao tecnica e migrar para Tauri.

## Direcao do Produto

- Nome: QuestLog.
- Formato final: app desktop.
- Tela inicial: Status dos Jogos.
- Abas fixas: Jogando, Finalizado, Pausado, Quero Jogar, Abandonado.
- Entrada de dados inicial: manual.
- Progresso: calculado por horas jogadas contra estimativa da historia principal.
- Capa: arquivo de imagem escolhido manualmente.

## Campos do MVP

- Titulo.
- Plataforma.
- Status.
- Horas jogadas.
- Estimativa da historia em horas.
- Capa do jogo.
- Onde parei / proximo objetivo.
- Notas.

## Como abrir agora

Abra `index.html` no navegador. Os dados ficam salvos no `localStorage` do navegador.

## Futuro Desktop

Quando a interface e o modelo estiverem mais maduros, o plano e migrar para Tauri e trocar o armazenamento por arquivo local ou SQLite.
