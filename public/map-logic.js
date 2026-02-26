// ===============================
// CONFIGURAÇÃO DE AMBIENTE E BASE_URL
// ===============================
if (typeof BASE_URL === "undefined") {
  window.BASE_URL = window.location.pathname.includes("SP-4-u-Web")
    ? "/SP-4-u-Web"
    : "";
}

// 🔥 Detecção Automática do Sistema (SPTrans ou EMTU/ARTESP)
const isArtespPage = window.location.pathname.includes("artesp");
const GTFS_CONFIG = {
    folder: isArtespPage ? "gtfs-emtu" : "gtfs-sptrans",
    label: isArtespPage ? "EMTU/ARTESP" : "SPTrans"
};

console.log(`[Mapa] Sistema ativo: ${GTFS_CONFIG.label}`);

// Gera URL absoluta para recursos
function getPath(path) {
  return new URL(`${BASE_URL}${path}`, window.location.origin).href;
}

// Gera URL específica para os ficheiros GTFS da página atual
function getGTFSPath(fileName) {
    return getPath(`/${GTFS_CONFIG.folder}/${fileName}`);
}

// ===============================
// ESTADO GLOBAL DO MAPA
// ===============================
let selectedLayer = null;
let busDataLoaded = false; // Controle de carregamento único
const busPolylines = {};   // Cache de Polylines (ID da Rota -> Array de Polylines)
const busRawCoords = {};   // Cache de Coordenadas brutas (Shape ID -> Pontos)

// ===============================
// INICIALIZAÇÃO DO MAPA
// ===============================
const map = L.map("map", {
  preferCanvas: true,
  tap: false
}).setView([-23.5505, -46.6333], 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// ===============================
// CAMADAS (LAYERS)
// ===============================
const trilhosLayer = L.layerGroup();
const cicloLayer = L.layerGroup();
const bicicletarioLayer = L.layerGroup();
const busRoutesLayer = L.layerGroup(); // Camada única para Ônibus (SPTrans ou EMTU)

// ===============================
// CARREGAMENTO DE DADOS GEOGRÁFICOS (FIXOS)
// ===============================
async function loadMapData() {
  try {
    const responses = await Promise.all([
      fetch(getPath("/data/map/sao-paulo_lines_systems_and_modes.json")),
      fetch(getPath("/data/map/caminho_icones.json")),
      fetch(getPath("/data/map/sao-paulo_sections.geojson")),
      fetch(getPath("/data/map/sao-paulo_stations.geojson")),
      fetch(getPath("/data/map/LL_WGS84_KMZ_redecicloviaria.json")),
      fetch(getPath("/data/map/LL_WGS84_KMZ_bicicletarioparaciclo.geojson"))
    ]);

    responses.forEach(r => { if (!r.ok) throw new Error(`Erro ao carregar ${r.url}`); });

    const [linesInfo, iconMapping, sectionsData, stationsData, cicloData, bikeData] = 
      await Promise.all(responses.map(r => r.json()));

    const lineColors = Object.fromEntries(linesInfo.map(l => [l.name, l.color]));

    // --- TRILHOS ---
    L.geoJSON(sectionsData, {
      style: f => ({
        color: lineColors[f.properties.lines?.[0]?.line] || "#666",
        weight: 4,
        opacity: 0.8,
        lineCap: "round"
      }),
      onEachFeature: (f, l) => l.on("click", e => handleLineClick(e, f, lineColors))
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
              iconAnchor: [11, 11]
            })
          });
        }
        return L.circleMarker(latlng, { radius: 5, fillColor: "white", color: "#000", weight: 1 });
      },
      onEachFeature: (f, l) => l.bindPopup(`<b>Estação:</b> ${f.properties.name}<br><b>Linha:</b> ${f.properties.lines?.[0]?.line}`)
    }).addTo(trilhosLayer);

    // --- CICLOVIAS ---
    L.geoJSON(cicloData, {
      style: { color: "#32e622", weight: 3, opacity: 0.8 },
      onEachFeature: (f, l) => l.bindPopup(`<b>Ciclovia:</b> ${f.properties.rc_nome || "Trecho"}`)
    }).addTo(cicloLayer);

    // --- BICICLETÁRIOS ---
    L.geoJSON(bikeData, {
      pointToLayer: (f, latlng) => L.marker(latlng, {
        icon: L.icon({
          iconUrl: getPath("/icons/bicicleta.png"),
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }),
      onEachFeature: (f, l) => l.bindPopup(`<b>Bicicletário:</b> ${f.properties.bcp_local}<br><b>Vagas:</b> ${f.properties.bcp_vaga}`)
    }).addTo(bicicletarioLayer);

    setupLayerControls();

  } catch (error) {
    console.error("Erro ao carregar dados fixos:", error);
  }
}

// ===============================
// CARREGAMENTO GTFS (DINÂMICO)
// ===============================
async function loadBusRoutes() {
  if (busDataLoaded) return;
  busDataLoaded = true;

  console.log(`[GTFS] Processando base ${GTFS_CONFIG.label}...`);

  // 1. Mapeia Rotas (ID -> Cor/Nome)
  Papa.parse(getGTFSPath("routes.txt"), {
    download: true,
    header: true,
    complete: function(routeResults) {
      const routeMap = {};
      routeResults.data.forEach(r => {
        routeMap[r.route_id] = {
          color: r.route_color ? `#${r.route_color}` : "#0455A1",
          number: r.route_short_name || r.route_id,
          name: r.route_long_name
        };
      });

      // 2. Mapeia Trips (Shape -> Route)
      Papa.parse(getGTFSPath("trips.txt"), {
        download: true,
        header: true,
        complete: function(tripResults) {
          const shapeToRoute = {};
          tripResults.data.forEach(t => { shapeToRoute[t.shape_id] = t.route_id; });

          // 3. Processa Shapes (Geometria)
          Papa.parse(getGTFSPath("shapes.txt"), {
            download: true,
            header: true,
            worker: true,
            complete: function(results) {
              results.data.forEach((point) => {
                if (!point.shape_id) return;
                if (!busRawCoords[point.shape_id]) busRawCoords[point.shape_id] = [];
                busRawCoords[point.shape_id].push([parseFloat(point.shape_pt_lat), parseFloat(point.shape_pt_lon)]);
              });

              // Criar Polylines Económicas para visualização inicial
              Object.keys(busRawCoords).forEach(shapeId => {
                const routeId = shapeToRoute[shapeId];
                if (!routeId) return;

                const allPoints = busRawCoords[shapeId];
                const lowResPoints = allPoints.filter((_, idx) => idx % 15 === 0);

                if (lowResPoints.length > 1) {
                  const info = routeMap[routeId] || { color: "#0455A1", number: "N/A" };
                  const polyline = L.polyline(lowResPoints, {
                    color: info.color,
                    weight: 1.5,
                    opacity: 0.3,
                    smoothFactor: 3.0
                  });

                  polyline.routeId = routeId;
                  polyline.shapeId = shapeId;
                  polyline.info = info;

                  if (!busPolylines[routeId]) busPolylines[routeId] = [];
                  busPolylines[routeId].push(polyline);
                  polyline.addTo(busRoutesLayer);
                }
              });
              console.log(`[GTFS] ${GTFS_CONFIG.label} carregado em modo económico.`);
            }
          });
        }
      });
    }
  });
}

// ===============================
// FILTRAGEM E ALTA RESOLUÇÃO
// ===============================
window.filterSptransLine = function(selectedRouteId) {
    busRoutesLayer.clearLayers();

    // Reset: Volta ao modo económico
    if (!selectedRouteId) {
        Object.values(busPolylines).flat().forEach(p => p.addTo(busRoutesLayer));
        return;
    }

    // Alta Resolução para a linha selecionada
    if (busPolylines[selectedRouteId]) {
        busPolylines[selectedRouteId].forEach(lowResPoly => {
            const fullCoords = busRawCoords[lowResPoly.shapeId];
            const info = lowResPoly.info;

            const highResPoly = L.polyline(fullCoords, {
                color: info.color,
                weight: 5,
                opacity: 1,
                smoothFactor: 0.5
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

        const group = new L.featureGroup(busRoutesLayer.getLayers());
        if (group.getLayers().length > 0) {
            map.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 16 });
        }
    }
};

// ===============================
// UTILITÁRIOS E CONTROLES
// ===============================
function handleLineClick(e, feature, lineColors) {
  if (selectedLayer) selectedLayer.setStyle({ weight: 4, opacity: 0.8 });
  selectedLayer = e.target;
  selectedLayer.setStyle({ weight: 8, opacity: 1 });

  const line = feature.properties.lines?.[0]?.line;
  selectedLayer.bindPopup(`
    <div class="map-popup">
      <div class="popup-header" style="background-color:${lineColors[line] || "#333"}">
        <strong>${line}</strong>
      </div>
      <div class="popup-body">
        <p><strong>Sistema:</strong> ${feature.properties.lines?.[0]?.system}</p>
        <p><strong>Status:</strong> ${feature.properties.buildstart === 999999 ? "Planeamento" : feature.properties.buildstart}</p>
      </div>
    </div>
  `).openPopup();
}

function setupLayerControls() {
  const controls = {
    "check-trilhos": trilhosLayer,
    "check-ciclo": cicloLayer,
    "check-bike": bicicletarioLayer,
    "check-sptrans": busRoutesLayer // ID unificado para SPTrans e EMTU
  };

  Object.entries(controls).forEach(([id, layer]) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("change", e => {
      if (id === "check-sptrans" && e.target.checked) loadBusRoutes();
      e.target.checked ? map.addLayer(layer) : map.removeLayer(layer);
    });
  });
}

// Inicia o carregamento básico
loadMapData();