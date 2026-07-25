import Papa from "papaparse";
import { filterSptransLine } from "./map-logic";
const BASE_URL = import.meta.env.BASE_URL ?? "";

// TIPOS
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

// ESTADO
let gtfsData: GTFSData | null = {
  routes: [],
  fares: [],
  trips: [],
  calendar: [],
  agency: "",
};

let isLeavingPage = false;
let currentRenderId = 0;

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (match) => {
    const escapes: Record<string, string> = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    };
    return escapes[match];
  });
}

// INICIALIZAÇÃO
export function initSptrans(): void {
  setupNavigationCleanup();
  setupSearch();
  loadGTFSFiles();
}

// CANCELAMENTO AO SAIR DA PÁGINA
function setupNavigationCleanup(): void {
  document.querySelectorAll("a").forEach((link) => {
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

// BUSCA
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
      filterSptransLine(null);
    });
  }
}

// CARREGAMENTO GTFS
async function loadGTFSFiles(): Promise<void> {
  const basePath = `${BASE_URL}/gtfs-sptrans/`.replace(/\/+$/, "/");

  const files: { id: Exclude<keyof GTFSData, "agency">; name: string }[] = [
    { id: "fares", name: "fare_attributes.txt" },
    { id: "routes", name: "routes.txt" },
    { id: "trips", name: "trips.txt" },
    { id: "calendar", name: "calendar.txt" },
  ];

  const promises = files.map(
    (file) =>
      new Promise<void>((resolve) => {
        Papa.parse(basePath + file.name, {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: (results: Papa.ParseResult<any>) => {
            if (isLeavingPage || !gtfsData) return resolve();
            gtfsData[file.id] = results.data;
            resolve();
          },
          error: (err) => {
            console.error(`Erro ao carregar ${file.name}:`, err);
            resolve();
          },
        });
      })
  );

  const agencyPromise = new Promise<void>((resolve) => {
    Papa.parse(`${basePath}agency.txt`, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        if (isLeavingPage || !gtfsData) return resolve();
        const url = results.data[0]?.agency_url ?? "";
        gtfsData.agency = url.split("=")[1] ?? "Não identificada";
        resolve();
      },
      error: (err) => {
        console.error("Erro ao carregar agency.txt:", err);
        resolve();
      },
    });
  });

  await Promise.all([...promises, agencyPromise]);

  if (!isLeavingPage && gtfsData) {
    renderAllLines();
    updateVersionInfo();
  }
}

// SELEÇÃO DE LINHA → MAPA
function selecionarLinhaDaBusca(routeId: string): void {
  const checkSptrans = document.getElementById("check-sptrans") as HTMLInputElement | null;
  if (checkSptrans && !checkSptrans.checked) {
    checkSptrans.checked = true;
    checkSptrans.dispatchEvent(new Event("change"));
  }

  setTimeout(() => {
    filterSptransLine(routeId);
    document.getElementById("map")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 800);
}

// RENDERIZAÇÃO POR BLOCOS (CHUNKING)
function renderAllLines(filteredRoutes: GTFSRoute[] | null = null): void {
  const resultArea = document.getElementById("result-area");
  if (!resultArea || !gtfsData) return;

  currentRenderId++;
  const renderId = currentRenderId;

  resultArea.textContent = "";

  const routesToRender = filteredRoutes ?? gtfsData.routes;

  const tripMap = new Map<string, GTFSTrip>();
  gtfsData.trips.forEach((t) => {
    if (!tripMap.has(t.route_id)) tripMap.set(t.route_id, t);
  });

  const calendarMap = new Map<string, GTFSCalendar>();
  gtfsData.calendar.forEach((c) => calendarMap.set(c.service_id, c));

  const fare = gtfsData.fares.find((f) => f.fare_id === "Ônibus");
  const preco = fare
    ? parseFloat(fare.price).toLocaleString("pt-BR", {
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

      const badgeColor = /^[0-9A-Fa-f]{6}$/.test(route.route_color ?? "") ? route.route_color : "333333";
      const textColor = /^[0-9A-Fa-f]{6}$/.test(route.route_text_color ?? "") ? route.route_text_color : "FFFFFF";
      
      const shortName = escapeHtml(route.route_short_name ?? "");
      const longName = escapeHtml(route.route_long_name ?? "");
      const headsign = trip ? escapeHtml(trip.trip_headsign) : "Circular";
      const agencyName = escapeHtml(gtfsData?.agency ?? "Não identificada");
      const routeIdSafe = escapeHtml(route.route_id);

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
            <span class="line-destiny">${headsign}</span>
          </div>
        </div>
        <div class="line-body">
          <p class="route-full-name">${longName}</p>
          <div class="info-grid">
            <p><strong>Operação:</strong> ${operacao}</p>
            <p><strong>Tarifa:</strong> ${preco}</p>
          </div>
        </div>
        <div class="line-footer">
          <small>Agência: ${agencyName} | ID: ${routeIdSafe}</small>
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

// CONTADOR
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
      Exibindo <strong>${Number(count).toLocaleString("pt-BR")}</strong> linhas encontrada(s)
    </p>
  `;
}

// INFORMAÇÃO DE VERSÃO
function updateVersionInfo(): void {
  const infoContainer = document.querySelector(".info-container");
  if (infoContainer && gtfsData?.agency) {
    if (infoContainer.querySelector(".gtfs-version-tag")) return;

    const versionTag = document.createElement("p");
    versionTag.className = "gtfs-version-tag";
    versionTag.style.fontSize = "0.8rem";
    versionTag.style.marginTop = "10px";
    versionTag.innerHTML = `Base de dados: <strong>${escapeHtml(gtfsData.agency)}</strong>`;
    infoContainer.appendChild(versionTag);
  }
}