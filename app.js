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
    id: "paused",
    label: "Pausado",
    title: "Campanhas pausadas",
    empty: "Nenhum jogo pausado por aqui.",
  },
  {
    id: "completed",
    label: "Finalizado",
    title: "Campanhas finalizadas",
    empty: "Nenhum jogo finalizado ainda.",
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
    startedAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    completedAt: null,
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
    startedAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
    completedAt: null,
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
    startedAt: null,
    completedAt: null,
    updatedAt: Date.now() - 1000 * 60 * 60 * 96,
  },
];

let games = loadGames();
let selectedGameId = firstGameForStatus("playing")?.id ?? games[0]?.id ?? null;
let activeShelfDrag = null;

const shelves = document.querySelector("#status-shelves");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const dialog = document.querySelector("#game-dialog");
const detailDialog = document.querySelector("#detail-dialog");
const detailContent = document.querySelector("#detail-content");
const progressDialog = document.querySelector("#progress-dialog");
const progressForm = document.querySelector("#progress-form");
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
    startedAt: Number(game.startedAt ?? 0) || null,
    completedAt: Number(game.completedAt ?? 0) || null,
    updatedAt: Number(game.updatedAt ?? Date.now()),
  };
}

function saveGames() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

function firstGameForStatus(status) {
  return games.find((game) => game.status === status) ?? null;
}

function getVisibleGames(statusId) {
  const search = searchInput.value.trim().toLowerCase();
  const filtered = games.filter((game) => {
    const matchesStatus = game.status === statusId;
    const haystack = [game.title, game.platform, game.notes].join(" ").toLowerCase();
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
  const selected = games.find((game) => game.id === selectedGameId) ?? firstGameForStatus("playing") ?? games[0] ?? null;
  selectedGameId = selected?.id ?? null;

  renderStats();
  renderShelves();
}

function renderStats() {
  const playing = games.filter((game) => game.status === "playing");
  const completed = games.filter((game) => game.status === "completed").length;
  const hours = games.reduce((sum, game) => sum + Number(game.hoursPlayed || 0), 0);

  document.querySelector("#stat-playing").textContent = playing.length;
  document.querySelector("#stat-completed").textContent = completed;
  document.querySelector("#stat-hours").textContent = `${formatHours(hours)}h`;
}

function renderShelves() {
  shelves.innerHTML = statuses.map(renderStatusShelf).join("");
}

function renderStatusShelf(status) {
  const visibleGames = getVisibleGames(status.id);
  const total = games.filter((game) => game.status === status.id).length;
  const countLabel = `${total} jogo${total === 1 ? "" : "s"}`;
  const rowContent = visibleGames.length
    ? visibleGames.map(renderGameCard).join("")
    : `
      <div class="empty-state shelf-empty">
        <div>
          <strong>${status.empty}</strong>
          <p>Use "Adicionar jogo" para registrar manualmente.</p>
        </div>
      </div>
    `;

  return `
    <section class="status-shelf" data-status="${status.id}">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${status.label}</p>
          <h2>${status.title}</h2>
        </div>
        <span>${countLabel}</span>
      </div>
      <div class="poster-row">
        ${rowContent}
      </div>
    </section>
  `;
}

function renderGameCard(game) {
  const progress = getProgress(game);
  const remaining = getRemainingHours(game);
  const progressColor = getProgressColor(progress);

  return `
    <button class="game-card poster-card ${game.id === selectedGameId ? "active" : ""}" type="button" data-id="${game.id}">
      ${renderCover(game)}
      <div class="card-body">
        <div>
          <h3>${escapeHtml(game.title)}</h3>
        </div>
        <div>
          <div class="progress-track" aria-label="Progresso estimado de ${escapeHtml(game.title)}">
            <div class="progress-fill" style="width: ${progress}%; --progress-color: ${progressColor};"></div>
          </div>
          <p class="meta">${progress}% da historia${remaining > 0 ? ` - faltam ~${formatHours(remaining)}h` : ""}</p>
        </div>
      </div>
    </button>
  `;
}

function openDetail(game) {
  const progress = getProgress(game);
  const remaining = getRemainingHours(game);
  const progressColor = getProgressColor(progress);

  document.querySelector("#detail-dialog-title").textContent = game.title;
  detailContent.innerHTML = `
    <div class="game-sheet-grid">
      ${renderCover(game, "detail-cover")}
      <div class="detail-body">
        <div class="status-control">
          <span>Status</span>
          <div class="status-picker" role="listbox" aria-label="Status do jogo">
            ${statuses
              .map(
                (status) => `
                  <button
                    class="status-choice ${status.id === game.status ? "active" : ""}"
                    type="button"
                    data-action="status"
                    data-status="${status.id}"
                    aria-pressed="${status.id === game.status}"
                  >
                    ${status.label}
                  </button>
                `,
              )
              .join("")}
          </div>
        </div>
        <div>
          <h2>${escapeHtml(game.title)}</h2>
          <p class="meta">${escapeHtml(game.platform || "Sem plataforma")}</p>
        </div>

        <div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${progress}%; --progress-color: ${progressColor};"></div>
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
          <div class="metric">
            <span class="time-label">Inicio</span>
            <strong>${game.startedAt ? formatDate(game.startedAt) : "N/D"}</strong>
          </div>
          <div class="metric">
            <span class="time-label">Finalizado</span>
            <strong>${game.completedAt ? formatDate(game.completedAt) : "N/D"}</strong>
          </div>
        </div>

        <div class="journal-card">
          <h3>Notas</h3>
          <p>${escapeHtml(game.notes || "Sem notas ainda.")}</p>
        </div>

        <div class="detail-actions">
          <button class="secondary-action" type="button" data-action="edit">Editar</button>
          <button class="primary-action" type="button" data-action="progress">Atualizar progresso</button>
        </div>
      </div>
    </div>
  `;
  if (!detailDialog.open) detailDialog.showModal();
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
  document.querySelector("#status-input").value = game?.status ?? "playing";
  document.querySelector("#hours-input").value = game?.hoursPlayed ?? 0;
  document.querySelector("#story-estimate-input").value = game?.storyEstimateHours ?? 0;
  coverDataInput.value = game?.coverDataUrl ?? "";
  coverInput.value = "";
  document.querySelector("#notes-input").value = game?.notes ?? "";
  deleteButton.hidden = !game;
  dialog.showModal();
}

async function handleSubmit(event) {
  event.preventDefault();

  const id = document.querySelector("#game-id").value || createId();
  const selectedCover = coverInput.files?.[0];
  const coverDataUrl = selectedCover ? await readImageAsDataUrl(selectedCover) : coverDataInput.value;
  const existingGame = games.find((game) => game.id === id);
  const status = document.querySelector("#status-input").value;
  const now = Date.now();

  const nextGame = {
    id,
    title: document.querySelector("#title-input").value.trim(),
    platform: document.querySelector("#platform-input").value.trim(),
    status,
    hoursPlayed: Math.max(0, Number(document.querySelector("#hours-input").value)),
    storyEstimateHours: Math.max(0, Number(document.querySelector("#story-estimate-input").value)),
    coverDataUrl,
    nextStep: "",
    notes: document.querySelector("#notes-input").value.trim(),
    startedAt: getNextStartedAt(existingGame, status, now),
    completedAt: getNextCompletedAt(existingGame, status, now),
    updatedAt: now,
  };

  games = games.some((game) => game.id === id)
    ? games.map((game) => (game.id === id ? nextGame : game))
    : [nextGame, ...games];

  selectedGameId = id;
  saveGames();
  dialog.close();
  render();
}

function handleProgressSubmit(event) {
  event.preventDefault();
  const id = document.querySelector("#progress-game-id").value;
  const game = games.find((item) => item.id === id);
  const hours = Number(String(document.querySelector("#progress-hours-input").value).replace(",", "."));
  if (!game || !Number.isFinite(hours) || hours < 0) return;

  selectedGameId = id;
  updateProgress(game, hours);
  progressDialog.close();
  const updated = games.find((item) => item.id === id);
  if (updated) openDetail(updated);
}

function openProgressDialog(game) {
  document.querySelector("#progress-dialog-title").textContent = game.title;
  document.querySelector("#progress-game-id").value = game.id;
  document.querySelector("#progress-hours-input").value = Number(game.hoursPlayed || 0);
  progressDialog.showModal();
  document.querySelector("#progress-hours-input").focus();
}

function updateProgress(game, hours) {
  if (!Number.isFinite(hours) || hours < 0) return;

  games = games.map((item) =>
    item.id === game.id
      ? {
          ...item,
          hoursPlayed: hours,
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
  selectedGameId = firstGameForStatus("playing")?.id ?? games[0]?.id ?? null;
  saveGames();
  dialog.close();
  render();
}

function updateGameStatus(game, status) {
  const now = Date.now();
  games = games.map((item) =>
    item.id === game.id
      ? {
          ...item,
          status,
          startedAt: getNextStartedAt(item, status, now),
          completedAt: getNextCompletedAt(item, status, now),
          updatedAt: now,
        }
      : item,
  );
  saveGames();
  render();
  const updated = games.find((item) => item.id === game.id);
  if (updated) openDetail(updated);
}

function getNextStartedAt(game, status, timestamp) {
  if (status === "playing" && !game?.startedAt) return timestamp;
  return game?.startedAt ?? null;
}

function getNextCompletedAt(game, status, timestamp) {
  if (status === "completed" && !game?.completedAt) return timestamp;
  if (status !== "completed") return null;
  return game?.completedAt ?? timestamp;
}

function getProgress(game) {
  if (!game.storyEstimateHours) return 0;
  return Math.min(100, Math.round((Number(game.hoursPlayed || 0) / Number(game.storyEstimateHours)) * 100));
}

function getRemainingHours(game) {
  return Math.max(0, Number(game.storyEstimateHours || 0) - Number(game.hoursPlayed || 0));
}

function getProgressColor(progress) {
  if (progress >= 100) return "#67d68b";
  if (progress >= 70) return "#f2c14e";
  if (progress >= 35) return "#6aa7ff";
  return "#4f8ef7";
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
document.querySelector("#close-detail-button").addEventListener("click", () => detailDialog.close());
document.querySelector("#close-progress-button").addEventListener("click", () => progressDialog.close());
document.querySelector("#cancel-progress-button").addEventListener("click", () => progressDialog.close());
form.addEventListener("submit", handleSubmit);
progressForm.addEventListener("submit", handleProgressSubmit);
deleteButton.addEventListener("click", deleteSelectedGame);
searchInput.addEventListener("input", render);
sortSelect.addEventListener("change", render);

[dialog, detailDialog, progressDialog].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });
});

shelves.addEventListener("click", (event) => {
  const card = event.target.closest(".game-card");
  if (!card) return;
  const row = card.closest(".poster-row");
  if (row?.dataset.suppressClick === "true") return;
  selectedGameId = card.dataset.id;
  render();
  const game = games.find((item) => item.id === selectedGameId);
  if (game) openDetail(game);
});

shelves.addEventListener("pointerdown", (event) => {
  const row = event.target.closest(".poster-row");
  if (!row) return;
  activeShelfDrag = row;
  row.dataset.dragging = "true";
  row.dataset.suppressClick = "false";
  row.dataset.startX = event.clientX;
  row.dataset.scrollLeft = row.scrollLeft;
});

shelves.addEventListener("pointermove", (event) => {
  const row = activeShelfDrag;
  if (!row || row.dataset.dragging !== "true") return;
  const delta = event.clientX - Number(row.dataset.startX || 0);
  if (Math.abs(delta) > 6) row.dataset.suppressClick = "true";
  if (row.dataset.suppressClick === "true") event.preventDefault();
  row.scrollLeft = Number(row.dataset.scrollLeft || 0) - delta;
});

function endShelfDrag() {
  const row = activeShelfDrag;
  if (!row) return;
  row.dataset.dragging = "false";
  if (row.dataset.suppressClick === "true") {
    window.setTimeout(() => {
      row.dataset.suppressClick = "false";
    }, 120);
  }
  activeShelfDrag = null;
}

shelves.addEventListener("pointerup", endShelfDrag);
shelves.addEventListener("pointercancel", endShelfDrag);
shelves.addEventListener("pointerleave", endShelfDrag);

detailContent.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  const game = games.find((item) => item.id === selectedGameId);
  if (!action || !game) return;

  if (action === "edit") {
    detailDialog.close();
    openDialog(game);
  }
  if (action === "progress") {
    openProgressDialog(game);
  }
  if (action === "status") {
    updateGameStatus(game, event.target.dataset.status);
  }
});

render();
