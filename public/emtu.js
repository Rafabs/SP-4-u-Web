/**
 * emtu.js - Processamento de Dados GTFS para ARTESP/EMTU (VERSÃO OTIMIZADA)
 */

const BASE_URL = window.location.pathname.includes("SP-4-u-Web")
  ? "/SP-4-u-Web"
  : "";

let gtfsData = {
  routes: [],
  fareAttributes: [],
  fareRules: [],
  trips: [],
  calendar: [],
  agency: "",
};

let isLeavingPage = false;
let currentRenderId = 0; // ID para controlar e cancelar renderizações sobrepostas

document.addEventListener("DOMContentLoaded", function () {
  setupSearch();
  loadGTFSFiles();
});

/* =========================================================
   CARREGAMENTO GTFS (ARTESP)
========================================================= */
async function loadGTFSFiles() {
  const basePath = `${BASE_URL}/gtfs-emtu/`;
  
  const files = [
    { id: "fareAttributes", name: "fare_attributes.txt" },
    { id: "fareRules", name: "fare_rules.txt" },
    { id: "routes", name: "routes.txt" },
    { id: "trips", name: "trips.txt" },
    { id: "calendar", name: "calendar.txt" },
    { id: "agency", name: "agency.txt" },
  ];

  const promises = files.map((file) => {
    return new Promise((resolve) => {
      Papa.parse(basePath + file.name, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (isLeavingPage || !gtfsData) return resolve();
          if (file.id === "agency") {
            gtfsData.agency = results.data[0]?.agency_name || "EMTU/ARTESP";
          } else {
            gtfsData[file.id] = results.data;
          }
          resolve();
        },
        error: (err) => {
          console.error(`Erro ao carregar ${file.name}:`, err);
          resolve();
        },
      });
    });
  });

  await Promise.all(promises);

  if (!isLeavingPage && gtfsData) {
    renderAllLines();
  }
}

/* =========================================================
   RENDERIZAÇÃO OTIMIZADA POR BLOCOS (CHUNKING)
========================================================= */
function renderAllLines(filteredRoutes = null) {
  const resultArea = document.getElementById("result-area");
  if (!resultArea || !gtfsData) return;

  // Incrementa o ID para cancelar qualquer renderização em curso (como uma busca anterior)
  currentRenderId++;
  const renderId = currentRenderId;

  // Limpa a área de forma performática
  resultArea.innerHTML = "";

  const routesToRender = filteredRoutes ? filteredRoutes : gtfsData.routes;

  // Mapas de busca rápida O(1)
  const tripMap = new Map();
  gtfsData.trips.forEach((t) => {
    if (!tripMap.has(t.route_id)) tripMap.set(t.route_id, t);
  });

  const calendarMap = new Map();
  gtfsData.calendar.forEach((c) => calendarMap.set(c.service_id, c));

  // Mapa de Tarifas Dinâmicas (Essencial para EMTU)
  const fareMap = new Map();
  gtfsData.fareRules.forEach((rule) => {
    const attr = gtfsData.fareAttributes.find((a) => a.fare_id === rule.fare_id);
    if (attr) fareMap.set(rule.route_id, attr.price);
  });

  let currentIndex = 0;
  const CHUNK_SIZE = 80; // Renderiza 80 cards por vez

  function processChunk() {
    // Se o usuário mudou de página ou iniciou uma nova busca, interrompe este processo
    if (isLeavingPage || renderId !== currentRenderId || currentIndex >= routesToRender.length) {
      if (renderId === currentRenderId) updateCounter(routesToRender.length);
      return;
    }

    const fragment = document.createDocumentFragment();
    const limit = Math.min(currentIndex + CHUNK_SIZE, routesToRender.length);

    for (; currentIndex < limit; currentIndex++) {
      const route = routesToRender[currentIndex];
      const trip = tripMap.get(route.route_id);
      const service = trip ? calendarMap.get(trip.service_id) : null;

      let operacao = "Sob Consulta";
      if (service) {
        if (service.monday === "1" && service.sunday === "1") operacao = "Diária";
        else if (service.monday === "1" && service.saturday === "0") operacao = "Segunda a Sexta";
        else if (service.service_id === "SAT") operacao = "Sábados";
        else if (service.service_id === "SUN") operacao = "Domingos e Feriados";
      }

      const precoRaw = fareMap.get(route.route_id);
      const preco = precoRaw
        ? parseFloat(precoRaw).toLocaleString("pt-br", { style: "currency", currency: "BRL" })
        : "R$ --";

      const badgeColor = route.route_color || "0054a6"; // Azul EMTU padrão
      const textColor = route.route_text_color || "FFFFFF";
      const shortName = route.route_short_name || "";

      const card = document.createElement("div");
      card.className = "line-card";
      card.style.borderTop = `5px solid #${badgeColor}`;
      card.innerHTML = `
            <div class="line-header">
                <div class="line-identity">
                    <img src="https://img.shields.io/badge/${shortName.replace("-", "--")}-${badgeColor}.svg?style=for-the-badge&logoColor=${textColor}" 
                         alt="${shortName}" 
                         loading="lazy" 
                         width="90" height="28">
                    <span class="line-destiny">${trip ? trip.trip_headsign : "Circular"}</span>
                </div>
            </div>
            <div class="line-body">
                <p class="route-full-name">${route.route_long_name}</p>
                <div class="info-grid">
                    <p><i class="fa-solid fa-calendar-day"></i> <strong>Operação:</strong> ${operacao}</p>
                    <p><i class="fa-solid fa-coins"></i> <strong>Tarifa:</strong> ${preco}</p>
                </div>
            </div>
            <div class="line-footer">
                <small>Agência: ${gtfsData.agency} | ID: ${route.route_id}</small>              
            </div>
        `;
      fragment.appendChild(card);
    }

    resultArea.appendChild(fragment);

    // Agenda o próximo bloco
    requestAnimationFrame(processChunk);
  }

  processChunk();
}

/* =========================================================
   BUSCA REFEITA (FILTRO POR DADOS)
========================================================= */
function setupSearch() {
  const searchInput = document.getElementById("lineSearch");
  const clearBtn = document.getElementById("clearSearch");

  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();

    if (clearBtn) clearBtn.style.display = term.length > 0 ? "block" : "none";

    if (term === "") {
      renderAllLines();
    } else {
      // Filtra os dados no array, não no DOM
      const filtered = gtfsData.routes.filter((route) => {
        const searchStr = `${route.route_short_name} ${route.route_long_name}`.toLowerCase();
        return searchStr.includes(term);
      });
      renderAllLines(filtered);
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      clearBtn.style.display = "none";
      searchInput.focus();
      renderAllLines();
    });
  }
}

/* =========================================================
   CONTADOR
========================================================= */
function updateCounter(count) {
  let counter = document.getElementById("line-counter");
  if (!counter) {
    counter = document.createElement("div");
    counter.id = "line-counter";
    const searchSection = document.querySelector(".search-section");
    if (searchSection) searchSection.after(counter);
  }
  counter.innerHTML = `
        <p style="text-align:center; color:#666; margin-top:-20px; margin-bottom:20px;">
            Exibindo <strong>${count}</strong> linhas encontrada(s)
        </p>
    `;
}