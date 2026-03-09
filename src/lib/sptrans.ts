import Papa from "papaparse";
import { filterSptransLine } from "./map-logic";

// ===============================
// CONFIGURAÇÃO
// ===============================
const BASE_URL = import.meta.env.BASE_URL ?? "";

// ===============================
// TIPOS
// ===============================
interface GTFSRoute {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_color?: string;
  route_text_color?: string;
}

interface GTFSTrip {
  route_id: string;
  trip_headsign: string;
  service_id: string;
  shape_id: string;
}

interface GTFSCalendar {
  service_id: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

interface GTFSFare {
  fare_id: string;
  price: string;
}

interface GTFSData {
  routes: GTFSRoute[];
  fares: GTFSFare[];
  trips: GTFSTrip[];
  calendar: GTFSCalendar[];
  agency: string;
}

// ===============================
// ESTADO
// ===============================
let gtfsData: GTFSData | null = {
  routes: [],
  fares: [],
  trips: [],
  calendar: [],
  agency: "",
};

let isLeavingPage = false;
let currentRenderId = 0;

// ===============================
// INICIALIZAÇÃO
// ===============================
export function initSptrans(): void {
  setupNavigationCleanup();
  setupSearch();
  loadGTFSFiles();
}

// ===============================
// CANCELAMENTO AO SAIR DA PÁGINA
// ===============================
function setupNavigationCleanup(): void {
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

// ===============================
// BUSCA
// ===============================
function setupSearch(): void {
  const searchInput = document.getElementById("lineSearch") as HTMLInputElement | null;
  const clearBtn = document.getElementById("clearSearch") as HTMLElement | null;

  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();

    if (clearBtn) clearBtn.style.display = term.length > 0 ? "block" : "none";

    if (!gtfsData) return;

    if (term === "") {
      renderAllLines();
    } else {
      const filtered = gtfsData.routes.filter((route) => {
        const name = `${route.route_short_name} ${route.route_long_name}`.toLowerCase();
        return name.includes(term);
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
      filterSptransLine(null); // Import direto — sem window.filterSptransLine
    });
  }
}

// ===============================
// CARREGAMENTO GTFS
// ===============================
async function loadGTFSFiles(): Promise<void> {
  const basePath = `${BASE_URL}/gtfs-sptrans/`;

  const files: { id: keyof GTFSData; name: string }[] = [
    { id: "fares", name: "fare_attributes.txt" },
    { id: "routes", name: "routes.txt" },
    { id: "trips", name: "trips.txt" },
    { id: "calendar", name: "calendar.txt" },
    { id: "agency", name: "agency.txt" },
  ];

  const promises = files.map(
    (file) =>
      new Promise<void>((resolve) => {
        Papa.parse(basePath + file.name, {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: (results: Papa.ParseResult<Record<string, string>>) => {
            if (isLeavingPage || !gtfsData) return resolve();
            if (file.id === "agency") {
              const url = results.data[0]?.agency_url ?? "";
              gtfsData.agency = url.split("=")[1] ?? "Não identificada";
            } else {
              (gtfsData[file.id] as unknown[]) = results.data;
            }
            resolve();
          },
          error: (err) => {
            console.error(`Erro ao carregar ${file.name}:`, err);
            resolve();
          },
        });
      })
  );

  await Promise.all(promises);

  if (!isLeavingPage && gtfsData) {
    renderAllLines();
    updateVersionInfo();
  }
}

// ===============================
// SELEÇÃO DE LINHA → MAPA
// ===============================
function selecionarLinhaDaBusca(routeId: string): void {
  console.log("Tentando filtrar linha:", routeId);

  const checkSptrans = document.getElementById("check-sptrans") as HTMLInputElement | null;
  if (checkSptrans && !checkSptrans.checked) {
    checkSptrans.checked = true;
    checkSptrans.dispatchEvent(new Event("change"));
  }

  setTimeout(() => {
    filterSptransLine(routeId); // Import direto — sem window.filterSptransLine

    document.getElementById("map")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 800);
}

// ===============================
// RENDERIZAÇÃO POR BLOCOS (CHUNKING)
// ===============================
function renderAllLines(filteredRoutes: GTFSRoute[] | null = null): void {
  const resultArea = document.getElementById("result-area");
  if (!resultArea || !gtfsData) return;

  currentRenderId++;
  const renderId = currentRenderId;

  while (resultArea.firstChild) {
    resultArea.removeChild(resultArea.firstChild);
  }

  const routesToRender = filteredRoutes ?? gtfsData.routes;

  // Cache Maps para performance O(1)
  const tripMap = new Map<string, GTFSTrip>();
  gtfsData.trips.forEach((t) => {
    if (!tripMap.has(t.route_id)) tripMap.set(t.route_id, t);
  });

  const calendarMap = new Map<string, GTFSCalendar>();
  gtfsData.calendar.forEach((c) => calendarMap.set(c.service_id, c));

  // Tarifa única por fare_id "Ônibus" (diferença em relação à EMTU)
  const fare = gtfsData.fares.find((f) => f.fare_id === "Ônibus");
  const preco = fare
    ? parseFloat(fare.price).toLocaleString("pt-br", {
        style: "currency",
        currency: "BRL",
      })
    : "R$ 4,40";

  let currentIndex = 0;
  const CHUNK_SIZE = 80;

  function processChunk(): void {
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
        else if (service.saturday === "1" || service.sunday === "1") operacao = "Fins de Semana";
      }

      const badgeColor = route.route_color || "333333";
      const textColor = route.route_text_color || "FFFFFF";
      const shortName = route.route_short_name || "";

      const card = document.createElement("div");
      card.className = "line-card";
      card.style.borderTop = `5px solid #${badgeColor}`;
      card.style.cursor = "pointer";

      card.addEventListener("click", () => selecionarLinhaDaBusca(route.route_id));

      card.innerHTML = `
        <div class="line-header">
          <div class="line-identity">
            <span class="route-badge" style="background-color: #${badgeColor}; color: #${textColor}">
              ${shortName}
            </span>
            <span class="line-destiny">${trip ? trip.trip_headsign : "Circular"}</span>
          </div>
        </div>
        <div class="line-body">
          <p class="route-full-name">${route.route_long_name}</p>
          <div class="info-grid">
            <p><strong>Operação:</strong> ${operacao}</p>
            <p><strong>Tarifa:</strong> ${preco}</p>
          </div>
        </div>
        <div class="line-footer">
          <small>Agência: ${gtfsData!.agency} | ID: ${route.route_id}</small>
        </div>
      `;

      fragment.appendChild(card);
    }

    if (resultArea) resultArea.appendChild(fragment);

    if (currentIndex < routesToRender.length) {
      requestAnimationFrame(processChunk);
    } else {
      updateCounter(routesToRender.length);
    }
  }

  processChunk();
}

// ===============================
// CONTADOR
// ===============================
function updateCounter(count: number): void {
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

// ===============================
// INFORMAÇÃO DE VERSÃO
// ===============================
function updateVersionInfo(): void {
  const infoContainer = document.querySelector(".info-container");
  if (infoContainer && gtfsData?.agency) {
    const versionTag = document.createElement("p");
    versionTag.style.fontSize = "0.8rem";
    versionTag.style.marginTop = "10px";
    versionTag.innerHTML = `Base de dados: <strong>${gtfsData.agency}</strong>`;
    infoContainer.appendChild(versionTag);
  }
}