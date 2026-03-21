import Papa from "papaparse";
import { filterSptransLine, getBusLayer, loadBusRoutes } from "./map-logic";

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

interface GTFSFareAttribute {
  fare_id: string;
  price: string;
}

interface GTFSFareRule {
  fare_id: string;
  route_id: string;
}

interface GTFSData {
  routes: GTFSRoute[];
  fareAttributes: GTFSFareAttribute[];
  fareRules: GTFSFareRule[];
  trips: GTFSTrip[];
  calendar: GTFSCalendar[];
  agency: string;
}

// ===============================
// ESTADO
// ===============================
let gtfsData: GTFSData | null = {
  routes: [],
  fareAttributes: [],
  fareRules: [],
  trips: [],
  calendar: [],
  agency: "",
};

let isLeavingPage = false;
let currentRenderId = 0;

// ===============================
// INICIALIZAÇÃO
// ===============================
export function initEmtu(): void {
  setupNavigationCleanup();
  setupSearch();
  loadGTFSFiles();
}

// ===============================
// CANCELAMENTO AO SAIR DA PÁGINA
// ===============================
function setupNavigationCleanup(): void {
  document.querySelectorAll("a").forEach((link) => {
    // ← adiciona essa linha
    const href = link.getAttribute("href") ?? "";
    if (href.startsWith("#")) return;

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
// CARREGAMENTO GTFS (ARTESP)
// ===============================
async function loadGTFSFiles(): Promise<void> {
  const basePath = `${BASE_URL}/gtfs-emtu/`;

  const files: { id: keyof GTFSData; name: string }[] = [
    { id: "fareAttributes", name: "fare_attributes.txt" },
    { id: "fareRules", name: "fare_rules.txt" },
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
              gtfsData.agency = results.data[0]?.agency_name ?? "EMTU/ARTESP";
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
  }
}

// ===============================
// SELEÇÃO DE LINHA → MAPA
// ===============================
export function selecionarLinhaDaBusca(routeId: string): void {
  console.log("Tentando filtrar linha:", routeId);

  const checkArtesp = document.getElementById("check-artesp") as HTMLInputElement | null;
  if (checkArtesp && !checkArtesp.checked) {
    checkArtesp.checked = true;
    checkArtesp.dispatchEvent(new Event("change"));
  }

  // Aguarda o carregamento do GTFS antes de filtrar
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

  // Limpa de forma eficiente
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

  const fareMap = new Map<string, string>();
  gtfsData.fareRules.forEach((rule) => {
    const attr = gtfsData!.fareAttributes.find((a) => a.fare_id === rule.fare_id);
    if (attr) fareMap.set(rule.route_id, attr.price);
  });

  let currentIndex = 0;
  const CHUNK_SIZE = 80;

  function processChunk(): void {
    if (
      isLeavingPage ||
      renderId !== currentRenderId ||
      currentIndex >= routesToRender.length
    ) {
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
        ? parseFloat(precoRaw).toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL",
          })
        : "R$ --";

      const badgeColor = route.route_color || "0054a6";
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