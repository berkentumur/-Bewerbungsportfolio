const accessCode = "4837";
const accessSessionKey = "berken-portfolio-access";

function initAccessGate() {
  if (sessionStorage.getItem(accessSessionKey) === "granted") {
    return;
  }

  document.body.classList.add("access-locked");

  const gate = document.createElement("div");
  gate.className = "access-gate";
  gate.innerHTML = `
    <form class="access-box">
      <p class="eyebrow">Geschützte Bewerbung</p>
      <h1>Zugangscode</h1>
      <p>Bitte geben Sie den vierstelligen Code aus der Bewerbungsmail ein.</p>
      <label>
        Code
        <input
          id="accessCodeInput"
          type="password"
          inputmode="numeric"
          autocomplete="off"
          maxlength="4"
          pattern="[0-9]{4}"
          required
        />
      </label>
      <button class="button primary" type="submit">Website öffnen</button>
      <p class="access-error" aria-live="polite"></p>
    </form>
  `;

  document.body.appendChild(gate);

  const form = gate.querySelector("form");
  const input = gate.querySelector("#accessCodeInput");
  const error = gate.querySelector(".access-error");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (input.value.trim() === accessCode) {
      sessionStorage.setItem(accessSessionKey, "granted");
      document.body.classList.remove("access-locked");
      gate.remove();
      return;
    }

    error.textContent = "Der Code ist nicht korrekt.";
    input.value = "";
    input.focus();
  });

  input.focus();
}

initAccessGate();

const storageKey = "berken-it-desk-tickets";

const samples = [
  {
    id: createId(),
    title: "WLAN verbindet im Schulzimmer nicht",
    description: "Mehrere Geräte finden das WLAN, aber die Verbindung bricht nach wenigen Sekunden ab.",
    category: "Netzwerk",
    priority: "Hoch",
    status: "Offen",
    owner: "Berken",
    createdAt: "2026-04-24",
    notes: ["Router prüfen", "Betroffene Geräte notieren"],
  },
  {
    id: createId(),
    title: "Drucker nimmt keine Aufträge an",
    description: "Der Druckauftrag bleibt in der Warteschlange und wird nicht gestartet.",
    category: "Drucker",
    priority: "Normal",
    status: "In Arbeit",
    owner: "Berken",
    createdAt: "2026-04-24",
    notes: ["Papier und Verbindung kontrolliert"],
  },
  {
    id: createId(),
    title: "Passwort für Benutzerkonto vergessen",
    description: "Benutzer kann sich nicht mehr anmelden und braucht ein neues Passwort.",
    category: "Konto",
    priority: "Niedrig",
    status: "Erledigt",
    owner: "Berken",
    createdAt: "2026-04-23",
    notes: ["Passwort zurückgesetzt", "Benutzer informiert"],
  },
];

const ticketForm = document.querySelector("#ticketForm");
const titleInput = document.querySelector("#titleInput");
const descriptionInput = document.querySelector("#descriptionInput");
const categoryInput = document.querySelector("#categoryInput");
const priorityInput = document.querySelector("#priorityInput");
const ownerInput = document.querySelector("#ownerInput");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const priorityFilter = document.querySelector("#priorityFilter");
const ticketList = document.querySelector("#ticketList");
const ticketDetail = document.querySelector("#ticketDetail");
const resetButton = document.querySelector("#resetButton");

let tickets = loadTickets();
let selectedId = tickets[0]?.id ?? null;

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function loadTickets() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return samples;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return samples;
  }
}

function saveTickets() {
  localStorage.setItem(storageKey, JSON.stringify(tickets));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function priorityClass(priority) {
  return {
    Hoch: "high",
    Normal: "normal",
    Niedrig: "low",
  }[priority];
}

function filteredTickets() {
  const query = searchInput.value.trim().toLowerCase();

  return tickets.filter((ticket) => {
    const matchesSearch =
      !query ||
      ticket.title.toLowerCase().includes(query) ||
      ticket.description.toLowerCase().includes(query) ||
      ticket.category.toLowerCase().includes(query) ||
      ticket.owner.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter.value === "Alle" || ticket.status === statusFilter.value;
    const matchesPriority =
      priorityFilter.value === "Alle" || ticket.priority === priorityFilter.value;

    return matchesSearch && matchesStatus && matchesPriority;
  });
}

function updateSummary() {
  document.querySelector("#totalTickets").textContent = tickets.length;
  document.querySelector("#openTickets").textContent = tickets.filter(
    (ticket) => ticket.status === "Offen",
  ).length;
  document.querySelector("#progressTickets").textContent = tickets.filter(
    (ticket) => ticket.status === "In Arbeit",
  ).length;
  document.querySelector("#doneTickets").textContent = tickets.filter(
    (ticket) => ticket.status === "Erledigt",
  ).length;
}

function renderList() {
  const visibleTickets = filteredTickets();

  if (!visibleTickets.some((ticket) => ticket.id === selectedId)) {
    selectedId = visibleTickets[0]?.id ?? tickets[0]?.id ?? null;
  }

  if (visibleTickets.length === 0) {
    ticketList.innerHTML = '<div class="empty-state">Keine passenden Tickets gefunden.</div>';
    return;
  }

  ticketList.innerHTML = visibleTickets
    .map(
      (ticket) => `
        <button class="ticket-card ${ticket.id === selectedId ? "active" : ""}" data-id="${ticket.id}" type="button">
          <h3>${escapeHtml(ticket.title)}</h3>
          <p>${escapeHtml(ticket.description)}</p>
          <div class="meta-row">
            <span class="badge">${escapeHtml(ticket.status)}</span>
            <span class="badge ${priorityClass(ticket.priority)}">${escapeHtml(ticket.priority)}</span>
            <span class="badge">${escapeHtml(ticket.category)}</span>
          </div>
        </button>
      `,
    )
    .join("");
}

function renderDetail() {
  const ticket = tickets.find((item) => item.id === selectedId);

  if (!ticket) {
    ticketDetail.innerHTML =
      '<p class="empty-detail">Wähle ein Ticket aus, um Details zu sehen.</p>';
    return;
  }

  ticketDetail.innerHTML = `
    <p class="eyebrow">Ticket Detail</p>
    <h2>${escapeHtml(ticket.title)}</h2>
    <p>${escapeHtml(ticket.description)}</p>

    <div class="meta-row">
      <span class="badge">${escapeHtml(ticket.status)}</span>
      <span class="badge ${priorityClass(ticket.priority)}">${escapeHtml(ticket.priority)}</span>
      <span class="badge">${escapeHtml(ticket.category)}</span>
      <span class="badge">Erstellt: ${escapeHtml(ticket.createdAt)}</span>
      <span class="badge">Zuständig: ${escapeHtml(ticket.owner || "Nicht zugeteilt")}</span>
    </div>

    <div class="detail-section">
      <h3>Status bearbeiten</h3>
      <div class="detail-actions">
        <select id="detailStatus" aria-label="Status ändern">
          <option ${ticket.status === "Offen" ? "selected" : ""}>Offen</option>
          <option ${ticket.status === "In Arbeit" ? "selected" : ""}>In Arbeit</option>
          <option ${ticket.status === "Erledigt" ? "selected" : ""}>Erledigt</option>
        </select>
        <select id="detailPriority" aria-label="Priorität ändern">
          <option ${ticket.priority === "Hoch" ? "selected" : ""}>Hoch</option>
          <option ${ticket.priority === "Normal" ? "selected" : ""}>Normal</option>
          <option ${ticket.priority === "Niedrig" ? "selected" : ""}>Niedrig</option>
        </select>
        <button class="button delete-button" id="deleteTicket" type="button">Löschen</button>
      </div>
    </div>

    <div class="detail-section">
      <h3>Notizen</h3>
      <form class="note-form" id="noteForm">
        <input id="noteInput" type="text" placeholder="Neue Notiz hinzufügen" required />
        <button class="button primary" type="submit">Hinzufügen</button>
      </form>
      <div class="notes-list">
        ${
          ticket.notes.length
            ? ticket.notes.map((note) => `<div class="note">${escapeHtml(note)}</div>`).join("")
            : '<div class="note">Noch keine Notizen vorhanden.</div>'
        }
      </div>
    </div>
  `;
}

function render() {
  updateSummary();
  renderList();
  renderDetail();
}

ticketForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const ticket = {
    id: createId(),
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    category: categoryInput.value,
    priority: priorityInput.value,
    status: "Offen",
    owner: ownerInput.value.trim() || "Nicht zugeteilt",
    createdAt: today(),
    notes: [],
  };

  tickets.unshift(ticket);
  selectedId = ticket.id;
  ticketForm.reset();
  ownerInput.value = "Berken";
  priorityInput.value = "Normal";
  saveTickets();
  render();
});

ticketList.addEventListener("click", (event) => {
  const card = event.target.closest(".ticket-card");
  if (!card) {
    return;
  }

  selectedId = card.dataset.id;
  render();
});

ticketDetail.addEventListener("change", (event) => {
  const ticket = tickets.find((item) => item.id === selectedId);
  if (!ticket) {
    return;
  }

  if (event.target.id === "detailStatus") {
    ticket.status = event.target.value;
  }

  if (event.target.id === "detailPriority") {
    ticket.priority = event.target.value;
  }

  saveTickets();
  render();
});

ticketDetail.addEventListener("submit", (event) => {
  if (event.target.id !== "noteForm") {
    return;
  }

  event.preventDefault();
  const ticket = tickets.find((item) => item.id === selectedId);
  const input = event.target.querySelector("#noteInput");
  if (!ticket || !input.value.trim()) {
    return;
  }

  ticket.notes.push(input.value.trim());
  saveTickets();
  render();
});

ticketDetail.addEventListener("click", (event) => {
  if (event.target.id !== "deleteTicket") {
    return;
  }

  tickets = tickets.filter((ticket) => ticket.id !== selectedId);
  selectedId = tickets[0]?.id ?? null;
  saveTickets();
  render();
});

[searchInput, statusFilter, priorityFilter].forEach((control) => {
  control.addEventListener("input", render);
  control.addEventListener("change", render);
});

resetButton.addEventListener("click", () => {
  tickets = samples.map((ticket) => ({ ...ticket, id: createId(), notes: [...ticket.notes] }));
  selectedId = tickets[0]?.id ?? null;
  saveTickets();
  render();
});

render();
