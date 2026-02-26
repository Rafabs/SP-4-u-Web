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
  setupNavigationCleanup();
  setupSearch();
  loadGTFSFiles();
});

/* =========================================================
   CANCELAMENTO IMEDIATO AO SAIR DA PÁGINA
========================================================= */
function setupNavigationCleanup() {
  // Cancela para QUALQUER link interno
  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      isLeavingPage = true;
      window.stop();

      const resultArea = document.getElementById("result-area");
      if (resultArea) resultArea.innerHTML = "";

      gtfsData = null;
    });
  });

  window.addEventListener("beforeunload", () => {
    isLeavingPage = true;
    gtfsData = null;
  });
}

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


// Exemplo de função disparada ao clicar em um resultado da busca no emtu.js
function selecionarLinhaDaBusca(routeId) {
  console.log("Tentando filtrar linha:", routeId);

  // Força a ativação do checkbox da EMTU/ARTESP caso esteja desmarcado
  const checkArtesp = document.getElementById("check-artesp");
  if (checkArtesp && !checkArtesp.checked) {
    checkArtesp.checked = true;
    // Dispara o evento manualmente para o map-logic.js carregar os dados
    checkArtesp.dispatchEvent(new Event("change"));
  }

  setTimeout(() => {
    if (window.filterSptransLine) {
      window.filterSptransLine(routeId);

      const mapEl = document.getElementById("map");
      if (mapEl) mapEl.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      console.error("Função filterSptransLine não encontrada no window!");
    }
  }, 800); // O delay de 800ms é seguro para o carregamento do GTFS
}

/* =========================================================
   RENDERIZAÇÃO OTIMIZADA POR BLOCOS (CHUNKING)
========================================================= */
function renderAllLines(filteredRoutes = null) {
  const resultArea = document.getElementById("result-area");
  if (!resultArea || !gtfsData) return;

  // Cancela a renderização anterior (importante para a busca não encavalar)
  currentRenderId++;
  const renderId = currentRenderId;

  resultArea.innerHTML = ""; // Limpa a tela

  const routesToRender = filteredRoutes ? filteredRoutes : gtfsData.routes;

  // Limpa a área de forma eficiente
  while (resultArea.firstChild) {
    resultArea.removeChild(resultArea.firstChild);
  }

  // Cache de Mapas para performance extrema O(1)
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
  const CHUNK_SIZE = 80; // Quantidade de cards processados por "respiro" do navegador

  function processChunk() {
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
      card.style.cursor = "pointer"; // Adiciona o cursor de clique para indicar interatividade

      // Adiciona o evento de clique para filtrar no mapa
      card.addEventListener("click", () => {
        selecionarLinhaDaBusca(route.route_id);
      });

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

    // Usa requestIdleCallback ou requestAnimationFrame para renderizar o próximo bloco sem travar a UI
    if (currentIndex < routesToRender.length) {
      requestAnimationFrame(processChunk);
    } else {
      updateCounter(routesToRender.length);
    }
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