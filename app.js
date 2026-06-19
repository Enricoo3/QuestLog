const STORAGE_KEY = "questlog.games.v2";
const LEGACY_STORAGE_KEY = "questlog.games.v1";

const statuses = [
  {
    id: "playing",
    label: "Jogando",
    title: "Campanhas em andamento",
    empty: "Nenhum jogo em andamento. Hora de iniciar uma campanha.",
  },
  {
    id: "completed",
    label: "Finalizado",
    title: "Campanhas finalizadas",
    empty: "Nenhum jogo finalizado ainda.",
  },
  {
    id: "paused",
    label: "Pausado",
    title: "Campanhas pausadas",
    empty: "Nenhum jogo pausado por aqui.",
  },
  {
    id: "wishlist",
    label: "Quero Jogar",
    title: "Backlog futuro",
    empty: "Nenhum jogo marcado para jogar depois.",
  },
  {
    id: "abandoned",
    label: "Abandonado",
    title: "Campanhas abandonadas",
    empty: "Nenhum abandono registrado.",
  },
];

const statusLabels = Object.fromEntries(statuses.map((status) => [status.id, status.label]));

const starterGames = [
  {
    id: createId(),
    title: "Baldur's Gate 3",
    platform: "PC",
    status: "playing",
    hoursPlayed: 58.4,
    storyEstimateHours: 75,
    coverDataUrl: "",
    nextStep: "Ato 2. Revisar inventario antes da proxima sessao.",
    notes: "Decidir rota da Shadowheart e organizar party antes de entrar na proxima area.",
    updatedAt: Date.now() - 1000 * 60 * 60 * 8,
  },
  {
    id: createId(),
    title: "Persona 5 Royal",
    platform: "Steam Deck",
    status: "paused",
    hoursPlayed: 72.1,
    storyEstimateHours: 101,
    coverDataUrl: "",
    nextStep: "Voltar no palacio da Sae e reler os confidants ativos.",
    notes: "Pausado, mas ainda quero terminar.",
    updatedAt: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    id: createId(),
    title: "Disco Elysium",
    platform: "PC",
    status: "wishlist",
    hoursPlayed: 0,
    storyEstimateHours: 23,
    coverDataUrl: "",
    nextStep: "Separar um fim de semana para jogar com calma.",
    notes: "Comecar quando estiver no clima de narrativa pesada.",
    updatedAt: Date.now() - 1000 * 60 * 60 * 96,
  },
];

let games = loadGames();
let activeStatus = "playing";
let selectedGameId = firstGameForStatus(activeStatus)?.id ?? games[0]?.id ?? null;

const grid = document.querySelector("#game-grid");
const detailPanel = document.querySelector("#detail-panel");
const resultCount = document.querySelector("#result-count");
const activeStatusLabel = document.querySelector("#active-status-label");
const sectionTitle = document.querySelector("#section-title");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const statusTabs = document.querySelectorAll(".status-tab");
const dialog = document.querySelector("#game-dialog");
const form = document.querySelector("#game-form");
const deleteButton = document.querySelector("#delete-game-button");
const coverInput = document.querySelector("#cover-input");
const coverDataInput = document.querySelector("#cover-data-input");

function loadGames() {
  const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(starterGames));
    return starterGames;
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return starterGames;
    const migrated = parsed.map(normalizeGame);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return starterGames;
  }
}

function normalizeGame(game) {
  const hoursPlayed = Number(game.hoursPlayed ?? game.hours ?? 0);
  const progress = Number(game.progress ?? 0);
  const fallbackEstimate = progress > 0 ? Math.max(hoursPlayed / (progress / 100), hoursPlayed) : 0;

  return {
    id: game.id ?? createId(),
    title: game.title ?? "Jogo sem titulo",
    platform: game.platform ?? "",
    status: statuses.some((status) => status.id === game.status) ? game.status : "playing",
    hoursPlayed,
    storyEstimateHours: Number(game.storyEstimateHours ?? fallbackEstimate ?? 0),
    coverDataUrl: game.coverDataUrl ?? "",
    nextStep: game.nextStep ?? game.notes ?? "",
    notes: game.notes ?? "",
    updatedAt: Number(game.updatedAt ?? Date.now()),
  };
}

function saveGames() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

function firstGameForStatus(status) {
  return games.find((game) => game.status === status) ?? null;
}

function getVisibleGames() {
  const search = searchInput.value.trim().toLowerCase();
  const filtered = games.filter((game) => {
    const matchesStatus = game.status === activeStatus;
    const haystack = [game.title, game.platform, game.nextStep, game.notes].join(" ").toLowerCase();
    return matchesStatus && (!search || haystack.includes(search));
  });

  return filtered.sort((a, b) => {
    if (sortSelect.value === "progress") return getProgress(b) - getProgress(a) || b.updatedAt - a.updatedAt;
    if (sortSelect.value === "hours") return b.hoursPlayed - a.hoursPlayed || a.title.localeCompare(b.title);
    if (sortSelect.value === "title") return a.title.localeCompare(b.title);
    return b.updatedAt - a.updatedAt;
  });
}

function render() {
  const status = statuses.find((item) => item.id === activeStatus);
  const visibleGames = getVisibleGames();
  const selectedIsVisible = visibleGames.some((game) => game.id === selectedGameId);
  const selected = selectedIsVisible ? games.find((game) => game.id === selectedGameId) : visibleGames[0] ?? null;
  selectedGameId = selected?.id ?? null;

  activeStatusLabel.textContent = status.label;
  sectionTitle.textContent = status.title;

  renderStats();
  renderTabs();
  renderGrid(visibleGames, status);
  renderDetail(selected);
}

function renderStats() {
  const playing = games.filter((game) => game.status === "playing");
  const nearFinish = playing.filter((game) => getProgress(game) >= 75 && getProgress(game) < 100).length;
  const hours = games.reduce((sum, game) => sum + Number(game.hoursPlayed || 0), 0);

  document.querySelector("#stat-playing").textContent = playing.length;
  document.querySelector("#stat-near-finish").textContent = nearFinish;
  document.querySelector("#stat-hours").textContent = `${formatHours(hours)}h`;
}

function renderTabs() {
  statusTabs.forEach((tab) => {
    const status = tab.dataset.status;
    tab.classList.toggle("active", status === activeStatus);
    tab.querySelector("strong").textContent = games.filter((game) => game.status === status).length;
  });
}

function renderGrid(visibleGames, status) {
  resultCount.textContent = `${visibleGames.length} encontrado${visibleGames.length === 1 ? "" : "s"}`;

  if (!visibleGames.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div>
          <strong>${status.empty}</strong>
          <p>Use "Adicionar jogo" para registrar manualmente.</p>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = visibleGames.map(renderGameCard).join("");
}

function renderGameCard(game) {
  const progress = getProgress(game);
  const remaining = getRemainingHours(game);

  return `
    <button class="game-card ${game.id === selectedGameId ? "active" : ""}" type="button" data-id="${game.id}">
      ${renderCover(game)}
      <div class="card-body">
        <span class="status-pill">${statusLabels[game.status]}</span>
        <div>
          <h3>${escapeHtml(game.title)}</h3>
          <p class="meta">${escapeHtml(game.platform || "Sem plataforma")}</p>
        </div>
        <div class="time-block">
          <span class="time-icon" aria-hidden="true"></span>
          <span class="time-copy">
            <span class="time-label">Tempo de jogo</span>
            <strong class="time-value">${formatHours(game.hoursPlayed)} horas</strong>
          </span>
        </div>
        <div>
          <div class="progress-track" aria-label="Progresso estimado de ${escapeHtml(game.title)}">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <p class="meta">${progress}% da historia${remaining > 0 ? ` · faltam ~${formatHours(remaining)}h` : ""}</p>
        </div>
        <p class="meta">${escapeHtml(game.nextStep || "Sem proximo objetivo registrado.")}</p>
      </div>
    </button>
  `;
}

function renderDetail(game) {
  if (!game) {
    detailPanel.innerHTML = `
      <div class="empty-state">
        <div>
          <strong>Nada selecionado</strong>
          <p>Escolha um status ou adicione um jogo.</p>
        </div>
      </div>
    `;
    return;
  }

  const progress = getProgress(game);
  const remaining = getRemainingHours(game);

  detailPanel.innerHTML = `
    ${renderCover(game, "detail-cover")}
    <div class="detail-body">
      <span class="status-pill">${statusLabels[game.status]}</span>
      <div>
        <h2>${escapeHtml(game.title)}</h2>
        <p class="meta">${escapeHtml(game.platform || "Sem plataforma")}</p>
      </div>

      <div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <p class="meta">${progress}% da historia principal</p>
      </div>

      <div class="metric-grid">
        <div class="metric">
          <span class="time-label">Tempo de jogo</span>
          <strong>${formatHours(game.hoursPlayed)}h</strong>
        </div>
        <div class="metric">
          <span class="time-label">Historia estimada</span>
          <strong>${game.storyEstimateHours ? `${formatHours(game.storyEstimateHours)}h` : "N/D"}</strong>
        </div>
        <div class="metric">
          <span class="time-label">Restante</span>
          <strong>${remaining > 0 ? `${formatHours(remaining)}h` : "0h"}</strong>
        </div>
        <div class="metric">
          <span class="time-label">Atualizado</span>
          <strong>${formatDate(game.updatedAt)}</strong>
        </div>
      </div>

      <div class="journal-card">
        <h3>Onde parei</h3>
        <p>${escapeHtml(game.nextStep || "Sem objetivo registrado.")}</p>
      </div>

      <div class="journal-card">
        <h3>Notas</h3>
        <p>${escapeHtml(game.notes || "Sem notas ainda.")}</p>
      </div>

      <div class="detail-actions">
        <button class="secondary-action" type="button" data-action="edit">Editar</button>
        <button class="primary-action" type="button" data-action="session">Registrar sessao</button>
      </div>
    </div>
  `;
}

function renderCover(game, extraClass = "") {
  const initials = getInitials(game.title);
  if (game.coverDataUrl) {
    return `
      <div class="cover ${extraClass}">
        <img src="${game.coverDataUrl}" alt="Capa de ${escapeHtml(game.title)}" />
      </div>
    `;
  }

  return `
    <div class="cover ${extraClass}">
      <span class="cover-fallback">${escapeHtml(initials)}</span>
    </div>
  `;
}

function openDialog(game = null) {
  document.querySelector("#dialog-title").textContent = game ? "Editar jogo" : "Adicionar jogo";
  document.querySelector("#game-id").value = game?.id ?? "";
  document.querySelector("#title-input").value = game?.title ?? "";
  document.querySelector("#platform-input").value = game?.platform ?? "";
  document.querySelector("#status-input").value = game?.status ?? activeStatus;
  document.querySelector("#hours-input").value = game?.hoursPlayed ?? 0;
  document.querySelector("#story-estimate-input").value = game?.storyEstimateHours ?? 0;
  coverDataInput.value = game?.coverDataUrl ?? "";
  coverInput.value = "";
  document.querySelector("#next-step-input").value = game?.nextStep ?? "";
  document.querySelector("#notes-input").value = game?.notes ?? "";
  deleteButton.hidden = !game;
  dialog.showModal();
}

async function handleSubmit(event) {
  event.preventDefault();

  const id = document.querySelector("#game-id").value || createId();
  const selectedCover = coverInput.files?.[0];
  const coverDataUrl = selectedCover ? await readImageAsDataUrl(selectedCover) : coverDataInput.value;

  const nextGame = {
    id,
    title: document.querySelector("#title-input").value.trim(),
    platform: document.querySelector("#platform-input").value.trim(),
    status: document.querySelector("#status-input").value,
    hoursPlayed: Math.max(0, Number(document.querySelector("#hours-input").value)),
    storyEstimateHours: Math.max(0, Number(document.querySelector("#story-estimate-input").value)),
    coverDataUrl,
    nextStep: document.querySelector("#next-step-input").value.trim(),
    notes: document.querySelector("#notes-input").value.trim(),
    updatedAt: Date.now(),
  };

  games = games.some((game) => game.id === id)
    ? games.map((game) => (game.id === id ? nextGame : game))
    : [nextGame, ...games];

  activeStatus = nextGame.status;
  selectedGameId = id;
  saveGames();
  dialog.close();
  render();
}

function addSession(game) {
  const typedHours = prompt("Quantas horas voce jogou nesta sessao?", "1");
  if (typedHours === null) return;

  const hours = Number(String(typedHours).replace(",", "."));
  if (!Number.isFinite(hours) || hours <= 0) return;

  games = games.map((item) =>
    item.id === game.id
      ? {
          ...item,
          hoursPlayed: Number(item.hoursPlayed || 0) + hours,
          updatedAt: Date.now(),
        }
      : item,
  );
  saveGames();
  render();
}

function deleteSelectedGame() {
  const id = document.querySelector("#game-id").value;
  if (!id || !confirm("Excluir este jogo do QuestLog?")) return;

  games = games.filter((game) => game.id !== id);
  selectedGameId = firstGameForStatus(activeStatus)?.id ?? games[0]?.id ?? null;
  saveGames();
  dialog.close();
  render();
}

function getProgress(game) {
  if (!game.storyEstimateHours) return 0;
  return Math.min(100, Math.round((Number(game.hoursPlayed || 0) / Number(game.storyEstimateHours)) * 100));
}

function getRemainingHours(game) {
  return Math.max(0, Number(game.storyEstimateHours || 0) - Number(game.hoursPlayed || 0));
}

function formatHours(value) {
  const number = Number(value || 0);
  return number.toLocaleString("pt-BR", {
    minimumFractionDigits: Number.isInteger(number) ? 0 : 1,
    maximumFractionDigits: 1,
  });
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(timestamp));
}

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function getInitials(title) {
  return String(title || "QL")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `game-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.querySelector("#new-game-button").addEventListener("click", () => openDialog());
document.querySelector("#close-dialog-button").addEventListener("click", () => dialog.close());
form.addEventListener("submit", handleSubmit);
deleteButton.addEventListener("click", deleteSelectedGame);
searchInput.addEventListener("input", render);
sortSelect.addEventListener("change", render);

statusTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeStatus = tab.dataset.status;
    selectedGameId = firstGameForStatus(activeStatus)?.id ?? null;
    render();
  });
});

grid.addEventListener("click", (event) => {
  const card = event.target.closest(".game-card");
  if (!card) return;
  selectedGameId = card.dataset.id;
  render();
});

detailPanel.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  const game = games.find((item) => item.id === selectedGameId);
  if (!action || !game) return;

  if (action === "edit") openDialog(game);
  if (action === "session") addSession(game);
});

render();
