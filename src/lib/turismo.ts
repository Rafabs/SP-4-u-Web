import L from "leaflet";
import { landmarks } from "./turismo-landmarks.js";

type LandmarkPoint = {
  name: string;
  fullName?: string;
  address?: string;
  description: string;
  coords: number[];
  image: string;
  details?: {
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
};

type MarkerEntry = {
  point: LandmarkPoint;
  marker: L.Marker;
};

const tourismPoints = landmarks as LandmarkPoint[];

function renderResults(query = "", map: L.Map, markers: MarkerEntry[]) {
  const resultsEl = document.getElementById("search-results");
  const resultsCountEl = document.getElementById("results-count");
  const clearButton = document.getElementById("clear-search") as HTMLButtonElement | null;
  if (!resultsEl || !resultsCountEl) return;

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = markers.filter(({ point }) => point.name.toLowerCase().includes(normalizedQuery));

  resultsEl.innerHTML = "";
  resultsCountEl.textContent = `${filtered.length}`;
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
    card.innerHTML = `
      <img class="result-marker" src="${markerPreview}" alt="${point.name}" />
      <span class="result-name">${point.name}</span>
    `;
    card.addEventListener("click", () => {
      document.querySelectorAll(".result-card.is-active").forEach((activeCard) => {
        activeCard.classList.remove("is-active");
      });
      card.classList.add("is-active");
      map.setView(point.coords as L.LatLngExpression, 15);
      marker.openPopup();
    });
    resultsEl.appendChild(card);
  });
}

function initMap() {
  const map = L.map("map", {
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

    const popupContent = `
      <div style="display:flex;flex-direction:column;gap:0.55rem;min-width:240px;max-width:280px;">
        <img src="${point.image}" alt="${point.name}" style="width:100%;max-height:120px;object-fit:cover;border-radius:8px;" />
        <div>
          <strong style="font-size:0.95rem;">${point.name}</strong>
          <div style="font-size:0.8rem;color:#4b5563;margin-top:0.2rem;">${point.fullName || point.name}</div>
          <div style="font-size:0.82rem;color:#374151;margin-top:0.35rem;">${point.description}</div>
        </div>
        <div style="font-size:0.78rem;line-height:1.4;color:#374151;display:flex;flex-direction:column;gap:0.2rem;">
          <div><strong>Endereço:</strong> ${point.address}</div>
          <div><strong>Fundado:</strong> ${point.details?.founded || "-"}</div>
          <div><strong>Arquitetura:</strong> ${point.details?.architect || "-"}</div>
          <div><strong>Visitas:</strong> ${point.details?.visitors || "-"}</div>
          <div><strong>Diretor:</strong> ${point.details?.director || "-"}</div>
          <div><strong>Curador:</strong> ${point.details?.curator || "-"}</div>
          <div><strong>Telefone:</strong> ${point.details?.phone || "-"}</div>
          <div><strong>Horário:</strong> ${point.details?.hours || "-"}</div>
          <div><strong>Tipo:</strong> ${point.details?.type || "-"}</div>
          <div><strong>Exposição atual:</strong> ${point.details?.currentExhibition || "-"}</div>
        </div>
      </div>
    `;

    const marker = L.marker(point.coords as L.LatLngExpression, { icon: markerIcon }).bindPopup(popupContent);

    marker.addTo(map);
    return { point, marker };
  });

  const bounds = L.latLngBounds(markers.map(({ point }) => point.coords as L.LatLngExpression));
  map.fitBounds(bounds.pad(0.2));

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

export function initTurismoPage() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMap);
  } else {
    initMap();
  }
}
