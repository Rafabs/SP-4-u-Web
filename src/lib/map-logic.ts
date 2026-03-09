import L from "leaflet";
import Papa from "papaparse";

// ===============================
// CONFIGURAÇÃO DE AMBIENTE
// ===============================
const BASE_URL = import.meta.env.BASE_URL ?? "";

const isArtespPage = window.location.pathname.includes("artesp");
const GTFS_CONFIG = {
  folder: isArtespPage ? "gtfs-emtu" : "gtfs-sptrans",
  label: isArtespPage ? "EMTU/ARTESP" : "SPTrans",
};

console.log(`[Mapa] Sistema ativo: ${GTFS_CONFIG.label}`);

function getPath(path: string): string {
  return new URL(`${BASE_URL}${path}`, window.location.origin).href;
}

function getGTFSPath(fileName: string): string {
  return getPath(`/${GTFS_CONFIG.folder}/${fileName}`);
}

// ===============================
// TIPOS
// ===============================
interface RouteInfo {
  color: string;
  number: string;
  name: string;
}

interface PolylineWithMeta extends L.Polyline {
  routeId?: string;
  shapeId?: string;
  info?: RouteInfo;
}

// ===============================
// ESTADO DO MAPA
// ===============================
let selectedLayer: L.Path | null = null;
let busDataLoaded = false;
const busPolylines: Record<string, PolylineWithMeta[]> = {};
const busRawCoords: Record<string, [number, number][]> = {};

// ===============================
// INICIALIZAÇÃO DO MAPA
// ===============================
export const map = L.map("map", {
  preferCanvas: true,
}).setView([-23.5505, -46.6333], 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// ===============================
// CAMADAS
// ===============================
export const trilhosLayer = L.layerGroup();
export const cicloLayer = L.layerGroup();
export const bicicletarioLayer = L.layerGroup();
export const busRoutesLayer = L.layerGroup();

// ===============================
// CARREGAMENTO DE DADOS GEOGRÁFICOS
// ===============================
export async function loadMapData(): Promise<void> {
  try {
    const responses = await Promise.all([
      fetch(getPath("/data/map/sao-paulo_lines_systems_and_modes.json")),
      fetch(getPath("/data/map/caminho_icones.json")),
      fetch(getPath("/data/map/sao-paulo_sections.geojson")),
      fetch(getPath("/data/map/sao-paulo_stations.geojson")),
      fetch(getPath("/data/map/LL_WGS84_KMZ_redecicloviaria.json")),
      fetch(getPath("/data/map/LL_WGS84_KMZ_bicicletarioparaciclo.geojson")),
    ]);

    responses.forEach((r) => {
      if (!r.ok) throw new Error(`Erro ao carregar ${r.url}`);
    });

    const [linesInfo, iconMapping, sectionsData, stationsData, cicloData, bikeData] =
      await Promise.all(responses.map((r) => r.json()));

    const lineColors: Record<string, string> = Object.fromEntries(
      linesInfo.map((l: { name: string; color: string }) => [l.name, l.color])
    );

    // --- TRILHOS ---
    L.geoJSON(sectionsData, {
      style: (f) => ({
        color: lineColors[f?.properties.lines?.[0]?.line] || "#666",
        weight: 4,
        opacity: 0.8,
        lineCap: "round",
      }),
      onEachFeature: (f, l) =>
        l.on("click", (e) => handleLineClick(e as L.LeafletMouseEvent, f, lineColors)),
    }).addTo(trilhosLayer);

    L.geoJSON(stationsData, {
      pointToLayer: (f, latlng) => {
        const lineName = f.properties.lines?.[0]?.line;
        const iconPath = iconMapping[lineName];
        if (iconPath) {
          const fileName = iconPath.split(/[\\/]/).pop();
          return L.marker(latlng, {
            icon: L.icon({
              iconUrl: getPath(`/icons/${fileName}`),
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            }),
          });
        }
        return L.circleMarker(latlng, {
          radius: 5,
          fillColor: "white",
          color: "#000",
          weight: 1,
        });
      },
      onEachFeature: (f, l) =>
        l.bindPopup(
          `<b>Estação:</b> ${f.properties.name}<br><b>Linha:</b> ${f.properties.lines?.[0]?.line}`
        ),
    }).addTo(trilhosLayer);

    // --- CICLOVIAS ---
    L.geoJSON(cicloData, {
      style: { color: "#32e622", weight: 3, opacity: 0.8 },
      onEachFeature: (f, l) =>
        l.bindPopup(`<b>Ciclovia:</b> ${f.properties.rc_nome || "Trecho"}`),
    }).addTo(cicloLayer);

    // --- BICICLETÁRIOS ---
    L.geoJSON(bikeData, {
      pointToLayer: (_, latlng) =>
        L.marker(latlng, {
          icon: L.icon({
            iconUrl: getPath("/icons/bicicleta.png"),
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        }),
      onEachFeature: (f, l) =>
        l.bindPopup(
          `<b>Bicicletário:</b> ${f.properties.bcp_local}<br><b>Vagas:</b> ${f.properties.bcp_vaga}`
        ),
    }).addTo(bicicletarioLayer);

    setupLayerControls();
  } catch (error) {
    console.error("Erro ao carregar dados fixos:", error);
  }
}

// ===============================
// CARREGAMENTO GTFS (DINÂMICO)
// ===============================
export async function loadBusRoutes(): Promise<void> {
  if (busDataLoaded) return;
  busDataLoaded = true;

  console.log(`[GTFS] Processando base ${GTFS_CONFIG.label}...`);

  const routeResults = await new Promise<Papa.ParseResult<Record<string, string>>>(
    (resolve) => {
      Papa.parse(getGTFSPath("routes.txt"), {
        download: true,
        header: true,
        complete: resolve,
      });
    }
  );

  const routeMap: Record<string, RouteInfo> = {};
  routeResults.data.forEach((r) => {
    routeMap[r.route_id] = {
      color: r.route_color ? `#${r.route_color}` : "#0455A1",
      number: r.route_short_name || r.route_id,
      name: r.route_long_name,
    };
  });

  const tripResults = await new Promise<Papa.ParseResult<Record<string, string>>>(
    (resolve) => {
      Papa.parse(getGTFSPath("trips.txt"), {
        download: true,
        header: true,
        complete: resolve,
      });
    }
  );

  const shapeToRoute: Record<string, string> = {};
  tripResults.data.forEach((t) => {
    shapeToRoute[t.shape_id] = t.route_id;
  });

  // Shapes via worker (pesado — mantém worker: true)
  await new Promise<void>((resolve) => {
    Papa.parse(getGTFSPath("shapes.txt"), {
      download: true,
      header: true,
      worker: true,
      complete(results: Papa.ParseResult<Record<string, string>>) {
        results.data.forEach((point) => {
          if (!point.shape_id) return;
          if (!busRawCoords[point.shape_id]) busRawCoords[point.shape_id] = [];
          busRawCoords[point.shape_id].push([
            parseFloat(point.shape_pt_lat),
            parseFloat(point.shape_pt_lon),
          ]);
        });

        Object.keys(busRawCoords).forEach((shapeId) => {
          const routeId = shapeToRoute[shapeId];
          if (!routeId) return;

          const allPoints = busRawCoords[shapeId];
          const lowResPoints = allPoints.filter((_, idx) => idx % 15 === 0);

          if (lowResPoints.length > 1) {
            const info = routeMap[routeId] ?? { color: "#0455A1", number: "N/A", name: "" };
            const polyline = L.polyline(lowResPoints, {
              color: info.color,
              weight: 1.5,
              opacity: 0.3,
              smoothFactor: 3.0,
            }) as PolylineWithMeta;

            polyline.routeId = routeId;
            polyline.shapeId = shapeId;
            polyline.info = info;

            if (!busPolylines[routeId]) busPolylines[routeId] = [];
            busPolylines[routeId].push(polyline);
            polyline.addTo(busRoutesLayer);
          }
        });

        console.log(`[GTFS] ${GTFS_CONFIG.label} carregado em modo económico.`);
        resolve();
      },
    });
  });
}

// ===============================
// FILTRAGEM E ALTA RESOLUÇÃO
// ===============================
export function filterSptransLine(selectedRouteId: string | null): void {
  busRoutesLayer.clearLayers();

  // Reset: volta ao modo económico
  if (!selectedRouteId) {
    Object.values(busPolylines).flat().forEach((p) => p.addTo(busRoutesLayer));
    return;
  }

  // Alta resolução para a linha selecionada
  if (busPolylines[selectedRouteId]) {
    busPolylines[selectedRouteId].forEach((lowResPoly) => {
      const fullCoords = busRawCoords[lowResPoly.shapeId!];
      const info = lowResPoly.info!;

      const highResPoly = L.polyline(fullCoords, {
        color: info.color,
        weight: 5,
        opacity: 1,
        smoothFactor: 0.5,
      }).addTo(busRoutesLayer);

      highResPoly.bindPopup(`
        <div class="map-popup">
          <div class="popup-header" style="background-color: ${info.color}">
            <strong>${info.number}</strong>
          </div>
          <div class="popup-body">
            <p><strong>Linha:</strong> ${info.name}</p>
            <p><small>Fonte: ${GTFS_CONFIG.label}</small></p>
          </div>
        </div>
      `);
    });

    const group = new L.FeatureGroup(busRoutesLayer.getLayers());
    if (group.getLayers().length > 0) {
      map.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 16 });
    }
  }
}

// ===============================
// UTILITÁRIOS E CONTROLES
// ===============================
function handleLineClick(
  e: L.LeafletMouseEvent,
  feature: GeoJSON.Feature,
  lineColors: Record<string, string>
): void {
  if (selectedLayer) selectedLayer.setStyle({ weight: 4, opacity: 0.8 });
  selectedLayer = e.target as L.Path;
  selectedLayer.setStyle({ weight: 8, opacity: 1 });

  const line = feature.properties?.lines?.[0]?.line;

  (selectedLayer as L.Layer & { bindPopup: (s: string) => L.Layer; openPopup: () => void })
    .bindPopup(`
      <div class="map-popup">
        <div class="popup-header" style="background-color:${lineColors[line] || "#333"}">
          <strong>${line}</strong>
        </div>
        <div class="popup-body">
          <p><strong>Sistema:</strong> ${feature.properties?.lines?.[0]?.system}</p>
          <p><strong>Status:</strong> ${
            feature.properties?.buildstart === 999999
              ? "Planeamento"
              : feature.properties?.buildstart
          }</p>
        </div>
      </div>
    `)
    .openPopup();
}

export function setupLayerControls(): void {
  const controls: Record<string, L.LayerGroup> = {
    "check-trilhos": trilhosLayer,
    "check-ciclo": cicloLayer,
    "check-bike": bicicletarioLayer,
    "check-sptrans": busRoutesLayer,
  };

  Object.entries(controls).forEach(([id, layer]) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (!el) return;

    el.addEventListener("change", (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      if (id === "check-sptrans" && checked) loadBusRoutes();
      checked ? map.addLayer(layer) : map.removeLayer(layer);
    });
  });
}