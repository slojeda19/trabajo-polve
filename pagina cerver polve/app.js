/*
  SJT Express - Frontend de demostración
  --------------------------------------
  Esta versión usa datos locales para poder presentar la web sin servidor.
  Cuando PHP/MySQL esté listo, reemplazar las funciones de la sección API
  por llamadas fetch() a rutas como /api/shipments y /api/shipments/:code.
*/

const shipments = [
  { code: "SJT-2026-0042", destination: "Avellaneda", status: "En reparto", updated: "10:30" },
  { code: "SJT-2026-0041", destination: "Quilmes", status: "En tránsito", updated: "09:45" },
  { code: "SJT-2026-0040", destination: "Lanús", status: "Entregado", updated: "09:12" }
];

// --- CAPA API TEMPORAL ---
// Mantener estas funciones evita que las vistas conozcan los detalles del servidor.
const api = {
  async getShipments() {
    // Futuro: return fetch('/api/shipments').then(response => response.json());
    return shipments;
  },
  async findShipment(code) {
    // Futuro: return fetch(`/api/shipments/${encodeURIComponent(code)}`).then(...);
    return shipments.find(item => item.code.toLowerCase() === code.trim().toLowerCase()) || null;
  },
  async createShipment(data) {
    // Futuro: return fetch('/api/shipments', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    const nextNumber = 43 + shipments.length;
    const shipment = { code: `SJT-2026-${String(nextNumber).padStart(4, "0")}`, destination: data.address, status: "Recibido", updated: "Ahora" };
    shipments.unshift(shipment);
    return shipment;
  }
};

const navButtons = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");

function showView(viewId) {
  navButtons.forEach(button => button.classList.toggle("is-active", button.dataset.view === viewId));
  views.forEach(view => { const visible = view.id === viewId; view.hidden = !visible; view.classList.toggle("is-visible", visible); });
}

navButtons.forEach(button => button.addEventListener("click", () => showView(button.dataset.view)));
document.querySelectorAll("[data-go-to]").forEach(button => button.addEventListener("click", () => showView(button.dataset.goTo)));

function statusMarkup(status) { return `<span class="status">${status}</span>`; }

async function renderDashboard() {
  const data = await api.getShipments();
  document.querySelector("#transit-count").textContent = data.filter(item => item.status === "En tránsito").length;
  document.querySelector("#delivery-count").textContent = data.filter(item => item.status === "En reparto").length;
  document.querySelector("#delivered-count").textContent = data.filter(item => item.status === "Entregado").length;
  document.querySelector("#recent-shipments").innerHTML = data.slice(0, 5).map(item => `<tr><td><strong>${item.code}</strong></td><td>${item.destination}</td><td>${statusMarkup(item.status)}</td><td>${item.updated}</td></tr>`).join("");
}

async function searchShipment() {
  const code = document.querySelector("#tracking-code").value;
  const result = await api.findShipment(code);
  const target = document.querySelector("#tracking-result");
  target.innerHTML = result
    ? `<article class="result-card"><strong>${result.code} · ${result.status}</strong><p>Destino: ${result.destination}. Última actualización: ${result.updated}.</p></article>`
    : `<article class="result-card"><strong>No encontramos ese código.</strong><p>Revisá el identificador e intentá de nuevo.</p></article>`;
}

document.querySelector("#tracking-button").addEventListener("click", searchShipment);
document.querySelector("#tracking-code").addEventListener("keydown", event => { if (event.key === "Enter") searchShipment(); });

document.querySelector("#shipment-form").addEventListener("submit", async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const shipment = await api.createShipment(Object.fromEntries(form));
  document.querySelector("#form-message").textContent = `Envío ${shipment.code} creado correctamente.`;
  event.currentTarget.reset();
  renderDashboard();
});

renderDashboard();
searchShipment();
