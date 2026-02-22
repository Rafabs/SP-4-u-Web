/**
 * sptrans.js - Processamento de Dados GTFS para SPTrans (VERSÃO OTIMIZADA)
 */

const BASE_URL = window.location.pathname.includes("SP-4-u-Web")
  ? "/SP-4-u-Web"
  : "";

let gtfsData = {
  routes: [],
  fares: [],
  trips: [],
  calendar: [],
  agency: "",
};

let isLeavingPage = false;

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
   BUSCA
========================================================= */
function setupSearch() {
  const searchInput = document.getElementById("lineSearch");
  const clearBtn = document.getElementById("clearSearch");

  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    
    // Mostra/Esconde o botão X
    if (clearBtn) clearBtn.style.display = term.length > 0 ? "block" : "none";

    // FILTRO REAL: Filtramos o array de dados, não os elementos da tela
    if (term === "") {
      renderAllLines(); // Volta a mostrar tudo em chunks
    } else {
      const filtered = gtfsData.routes.filter(route => {
        const name = (route.route_short_name + " " + route.route_long_name).toLowerCase();
        return name.includes(term);
      });
      renderAllLines(filtered); // Renderiza apenas os encontrados
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
   CARREGAMENTO GTFS
========================================================= */
async function loadGTFSFiles() {
  const basePath = `${BASE_URL}/gtfs-sptrans/`;

  const files = [
    { id: "fares", name: "fare_attributes.txt" },
    { id: "routes", name: "routes.txt" },
    { id: "trips", name: "trips.txt" },
    { id: "calendar", name: "calendar.txt" },
    { id: "agency", name: "agency.txt" },
  ];

  const promises = files.map((file) => {
    return new Promise((resolve) => {
      // PapaParse agora vai pedir: /SP-4-u-Web/gtfs-sptrans/routes.txt
      Papa.parse(basePath + file.name, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (isLeavingPage || !gtfsData) return resolve();
          if (file.id === "agency") {
            const url = results.data[0]?.agency_url || "";
            gtfsData.agency = url.split("=")[1] || "Não identificada";
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
    updateVersionInfo();
  }
}

/* =========================================================
   RENDERIZAÇÃO OTIMIZADA POR BLOCOS (CHUNKING)
========================================================= */
let currentRenderId = 0; 

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
  gtfsData.trips.forEach(t => { if (!tripMap.has(t.route_id)) tripMap.set(t.route_id, t); });
  
  const calendarMap = new Map();
  gtfsData.calendar.forEach(c => calendarMap.set(c.service_id, c));

  const fare = gtfsData.fares.find(f => f.fare_id === "Ônibus");
  const preco = fare ? parseFloat(fare.price).toLocaleString("pt-br", { style: "currency", currency: "BRL" }) : "R$ 4,40";

  let currentIndex = 0;
  const CHUNK_SIZE = 80; // Quantidade de cards processados por "respiro" do navegador

  function processChunk() {
    if (isLeavingPage || currentIndex >= routesToRender.length) {
      updateCounter(routesToRender.length);
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
        else if (service.saturday === "1" || service.sunday === "1") operacao = "Fins de Semana";
      }

      const badgeColor = route.route_color || "333333";
      const textColor = route.route_text_color || "FFFFFF";
      const shortName = route.route_short_name || "";

      const card = document.createElement("div");
      card.className = "line-card";
      card.style.borderTop = `5px solid #${badgeColor}`;
      
      // Uso de loading="lazy" e dimensões fixas para evitar o erro de intervenção do navegador
      card.innerHTML = `
        <div class="line-header">
            <div class="line-identity">
                <img src="https://img.shields.io/badge/${shortName.replace("-", "--")}-${badgeColor}.svg?style=for-the-badge&logoColor=${textColor}" 
                     alt="${shortName}" 
                     loading="lazy"
                     width="90" 
                     height="28">
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

/* =========================================================
   INFORMAÇÃO DE VERSÃO
========================================================= */
function updateVersionInfo() {
  const infoContainer = document.querySelector(".info-container");

  if (infoContainer && gtfsData && gtfsData.agency) {
    const versionTag = document.createElement("p");
    versionTag.style.fontSize = "0.8rem";
    versionTag.style.marginTop = "10px";

    versionTag.innerHTML = `
            <i class="fa-solid fa-code-branch"></i> 
            Base de dados: <strong>${gtfsData.agency}</strong>
        `;

    infoContainer.appendChild(versionTag);
  }
}
