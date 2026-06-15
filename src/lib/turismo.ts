import L from "leaflet";
import { landmarks } from "./turismo-landmarks.js";

type LandmarkDetails = {
  founded?: string;
  architect?: string;
  visitors?: string;
  director?: string;
  curator?: string;
  phone?: string;
  hours?: string;
  type?: string;
  currentExhibition?: string;
};

type LandmarkPoint = {
  name: string;
  fullName?: string;
  address?: string;
  description: string;
  coords: [number, number]; // Tipagem de tupla exata em vez de number[]
  image: string;
  details?: LandmarkDetails;
};

type MarkerEntry = {
  point: LandmarkPoint;
  marker: L.Marker;
};

const tourismPoints = landmarks as unknown as LandmarkPoint[];

// Função para neutralizar caracteres maliciosos e evitar XSS em strings de texto livre
function escapeHtml(str: string | undefined): string {
  if (!str) return "";
  return str.replace(/[&<>"']/g, (match) => {
    const escapes: Record<string, string> = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    };
    return escapes[match];
  });
}

function renderResults(query = "", map: L.Map, markers: MarkerEntry[]) {
  const resultsEl = document.getElementById("search-results");
  const resultsCountEl = document.getElementById("results-count");
  const clearButton = document.getElementById("clear-search") as HTMLButtonElement | null;
  if (!resultsEl || !resultsCountEl) return;

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = markers.filter(({ point }) => point.name.toLowerCase().includes(normalizedQuery));

  resultsEl.textContent = ""; // Método mais rápido e seguro de limpeza
  resultsCountEl.textContent = String(filtered.length);
  clearButton?.toggleAttribute("hidden", !normalizedQuery);

  if (!filtered.length) {
    resultsEl.innerHTML = `
      <div class="empty-state">
        <strong>Nenhum ponto encontrado</strong>
        <span>Tente outra palavra-chave para localizar um ponto turístico.</span>
      </div>
    `;
    return;
  }

  filtered.forEach(({ point, marker }) => {
    const card = document.createElement("button");
    card.className = "result-card";
    card.type = "button";
    
    const markerPreview = point.image.replace("turismo_landmarkers", "turismo_markers");
    const safeName = escapeHtml(point.name);

    card.innerHTML = `
      <img class="result-marker" src="${markerPreview}" alt="${safeName}" />
      <span class="result-name">${safeName}</span>
    `;

    card.addEventListener("click", () => {
      document.querySelectorAll(".result-card.is-active").forEach((activeCard) => {
        activeCard.classList.remove("is-active");
      });
      card.classList.add("is-active");
      map.setView(point.coords, 15);
      marker.openPopup();
    });
    resultsEl.appendChild(card);
  });
}

function initMap() {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  const map = L.map(mapContainer, {
    zoomControl: true,
    attributionControl: true,
  }).setView([-23.5505, -46.6333], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  const markers: MarkerEntry[] = tourismPoints.map((point) => {
    const markerImage = point.image.replace("turismo_landmarkers", "turismo_markers");
    const markerIcon = L.icon({
      iconUrl: markerImage,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -20],
    });

    const d: LandmarkDetails = point.details ?? {};

    const popupContent = `
      <div style="display:flex;flex-direction:column;gap:0.55rem;min-width:240px;max-width:280px;">
        <img src="${point.image}" alt="${escapeHtml(point.name)}" style="width:100%;max-height:120px;object-fit:cover;border-radius:8px;" />
        <div>
          <strong style="font-size:0.95rem;">${escapeHtml(point.name)}</strong>
          <div style="font-size:0.8rem;color:#4b5563;margin-top:0.2rem;">${escapeHtml(point.fullName || point.name)}</div>
          <div style="font-size:0.82rem;color:#374151;margin-top:0.35rem;">${escapeHtml(point.description)}</div>
        </div>
        <div style="font-size:0.78rem;line-height:1.4;color:#374151;display:flex;flex-direction:column;gap:0.2rem;">
          <div><strong>Endereço:</strong> ${escapeHtml(point.address ?? "-")}</div>
          <div><strong>Fundado:</strong> ${escapeHtml(d.founded || "-")}</div>
          <div><strong>Arquitetura:</strong> ${escapeHtml(d.architect || "-")}</div>
          <div><strong>Visitas:</strong> ${escapeHtml(d.visitors || "-")}</div>
          <div><strong>Diretor:</strong> ${escapeHtml(d.director || "-")}</div>
          <div><strong>Curador:</strong> ${escapeHtml(d.curator || "-")}</div>
          <div><strong>Telefone:</strong> ${escapeHtml(d.phone || "-")}</div>
          <div><strong>Horário:</strong> ${escapeHtml(d.hours || "-")}</div>
          <div><strong>Tipo:</strong> ${escapeHtml(d.type || "-")}</div>
          <div><strong>Exposição atual:</strong> ${escapeHtml(d.currentExhibition || "-")}</div>
        </div>
      </div>
    `;

    const marker = L.marker(point.coords, { icon: markerIcon }).bindPopup(popupContent);
    marker.addTo(map);

    return { point, marker };
  });

  if (markers.length > 0) {
    const bounds = L.latLngBounds(markers.map(({ point }) => point.coords));
    map.fitBounds(bounds.pad(0.2));
  }

  document.getElementById("btn-center")?.addEventListener("click", () => {
    map.flyTo([-23.5505, -46.6333], 11, { duration: 1.2 });
  });

  const btnCollapse = document.getElementById("btn-collapse") as HTMLButtonElement | null;
  const collapseIcon = document.getElementById("collapse-icon") as HTMLElement | null;
  const controlsBody = document.getElementById("controls-body") as HTMLElement | null;

  btnCollapse?.addEventListener("click", () => {
    const collapsed = controlsBody?.classList.toggle("collapsed");
    if (collapseIcon) {
      collapseIcon.textContent = collapsed ? "expand_more" : "expand_less";
    }
  });

  const input = document.getElementById("search-input") as HTMLInputElement | null;
  const clearButton = document.getElementById("clear-search") as HTMLButtonElement | null;

  input?.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    renderResults(target.value, map, markers);
  });

  clearButton?.addEventListener("click", () => {
    if (input) {
      input.value = "";
      input.focus();
      renderResults("", map, markers);
    }
  });

  renderResults("", map, markers);
}

export function initTurismoPage(): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMap);
  } else {
    initMap();
  }
}