// ===============================
// BASE_URL (GitHub Pages)
// ===============================
if (typeof BASE_URL === "undefined") {
  window.BASE_URL = window.location.pathname.includes("SP-4-u-Web")
    ? "/SP-4-u-Web"
    : "";
}

// 🔥 Gera URL absoluta (FUNCIONA no Vite e GitHub Pages)
function getPath(path) {
  return new URL(`${BASE_URL}${path}`, window.location.origin).href;
}

let selectedLayer = null;
let sptransLoaded = false;
const sptransPolylines = {};
const sptransRawCoords = {};

// ===============================
// MAPA
// ===============================
const map = L.map("map", {
  preferCanvas: true,
  tap: false
}).setView([-23.5505, -46.6333], 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// ===============================
// LAYERS
// ===============================
const trilhosLayer = L.layerGroup();
const cicloLayer = L.layerGroup();
const bicicletarioLayer = L.layerGroup();
const sptransRoutesLayer = L.layerGroup();

// ===============================
// LOAD MAP DATA
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

    responses.forEach(r => {
      if (!r.ok) throw new Error(`Erro ao carregar ${r.url}`);
    });

    const [
      linesInfo,
      iconMapping,
      sectionsData,
      stationsData,
      cicloData,
      bikeData
    ] = await Promise.all(responses.map(r => r.json()));

    const lineColors = Object.fromEntries(
      linesInfo.map(l => [l.name, l.color])
    );

    // ===============================
    // TRILHOS
    // ===============================
    L.geoJSON(sectionsData, {
      style: f => ({
        color: lineColors[f.properties.lines?.[0]?.line] || "#666",
        weight: 4,
        opacity: 0.8,
        lineCap: "round"
      }),
      onEachFeature: (f, l) =>
        l.on("click", e => handleLineClick(e, f, lineColors))
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

        return L.circleMarker(latlng, {
          radius: 5,
          fillColor: "white",
          color: "#000",
          weight: 1
        });
      },
      onEachFeature: (f, l) =>
        l.bindPopup(`
          <b>Estação:</b> ${f.properties.name}<br>
          <b>Linha:</b> ${f.properties.lines?.[0]?.line}
        `)
    }).addTo(trilhosLayer);

    // ===============================
    // CICLOVIAS
    // ===============================
    L.geoJSON(cicloData, {
      style: {
        color: "#32e622",
        weight: 3,
        opacity: 0.8
      },
      onEachFeature: (f, l) =>
        l.bindPopup(`<b>Ciclovia:</b> ${f.properties.rc_nome || "Trecho"}`)
    }).addTo(cicloLayer);

    // ===============================
    // BICICLETÁRIOS
    // ===============================
    L.geoJSON(bikeData, {
      pointToLayer: (f, latlng) =>
        L.marker(latlng, {
          icon: L.icon({
            iconUrl: getPath("/icons/bicicleta.png"),
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -10]
          })
        }),
      onEachFeature: (f, l) =>
        l.bindPopup(`
          <b>Bicicletário:</b> ${f.properties.bcp_local}<br>
          <b>Vagas:</b> ${f.properties.bcp_vaga}
        `)
    }).addTo(bicicletarioLayer);

    setupLayerControls();

  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  }
}

// ===============================
// SPTRANS (Pop-up detalhado com nome da linha)
// ===============================
async function loadSPTransRoutes() {
  if (sptransLoaded) return;
  sptransLoaded = true;

  console.log("Iniciando carregamento SPTrans...");

  // 1. Mapeia as Rotas (ID -> Cor e Nome)
  Papa.parse(getPath("/gtfs-sptrans/routes.txt"), {
    download: true,
    header: true,
    complete: function(routeResults) {
      const routeMap = {};
      routeResults.data.forEach(r => {
        routeMap[r.route_id] = {
          color: r.route_color ? `#${r.route_color}` : "#d32f2f",
          number: r.route_short_name,
          name: r.route_long_name
        };
      });

      // 2. Mapeia Trips (Shape -> Route)
      Papa.parse(getPath("/gtfs-sptrans/trips.txt"), {
        download: true,
        header: true,
        complete: function(tripResults) {
          const shapeToRoute = {};
          tripResults.data.forEach(t => {
            shapeToRoute[t.shape_id] = t.route_id;
          });

          // 3. Processa Shapes com Resolução Dinâmica
          Papa.parse(getPath("/gtfs-sptrans/shapes.txt"), {
            download: true,
            header: true,
            worker: true,
            complete: function(results) {
              // Limpamos e organizamos os pontos brutos
              results.data.forEach((point) => {
                if (!point.shape_id) return;
                if (!sptransRawCoords[point.shape_id]) sptransRawCoords[point.shape_id] = [];
                
                sptransRawCoords[point.shape_id].push([
                  parseFloat(point.shape_pt_lat),
                  parseFloat(point.shape_pt_lon)
                ]);
              });

              // Criamos as polylines SIMPLIFICADAS para a visão geral
              const routeToShapes = {}; // Mapeamento reverso para facilitar o filtro
              
              Object.keys(sptransRawCoords).forEach(shapeId => {
                const routeId = shapeToRoute[shapeId];
                if (!routeId) return;

                if (!routeToShapes[routeId]) routeToShapes[routeId] = [];
                routeToShapes[routeId].push(shapeId);

                const allPoints = sptransRawCoords[shapeId];
                // 🔥 VISÃO GERAL: Apenas 1 a cada 15 pontos
                const lowResPoints = allPoints.filter((_, idx) => idx % 15 === 0);

                if (lowResPoints.length > 1) {
                  const info = routeMap[routeId] || { color: "#d32f2f", number: "N/A" };
                  const polyline = L.polyline(lowResPoints, {
                    color: info.color,
                    weight: 1.5,
                    opacity: 0.3, // Mais discreto no mapa cheio
                    smoothFactor: 3.0
                  });

                  // Guardamos metadados na polyline para o filtro usar depois
                  polyline.routeId = routeId;
                  polyline.shapeId = shapeId;
                  polyline.info = info;

                  if (!sptransPolylines[routeId]) sptransPolylines[routeId] = [];
                  sptransPolylines[routeId].push(polyline);
                  
                  polyline.addTo(sptransRoutesLayer);
                }
              });
              console.log("GTFS SPTrans carregado (Resolução Econômica).");
            }
          });
        }
      });
    }
  });
}

map.on('zoomend', function() {
    // Força o Leaflet a recalcular as posições apenas do que está na tela
    sptransRoutesLayer.eachLayer(layer => {
        if (layer.setStyle) layer.setStyle({ smoothFactor: map.getZoom() < 12 ? 3 : 1 });
    });
});

window.filterSptransLine = function(selectedRouteId) {
    // 1. Limpa a tela
    sptransRoutesLayer.clearLayers();

    // Se não tiver ID (limpar filtro), volta a mostrar as versões econômicas
    if (!selectedRouteId) {
        Object.values(sptransPolylines).flat().forEach(p => p.addTo(sptransRoutesLayer));
        return;
    }

    // 2. Desenha a linha selecionada em ALTA RESOLUÇÃO
    if (sptransPolylines[selectedRouteId]) {
        sptransPolylines[selectedRouteId].forEach(lowResPoly => {
            const shapeId = lowResPoly.shapeId;
            const fullCoords = sptransRawCoords[shapeId]; // Pega TODOS os pontos
            const info = lowResPoly.info;

            // Criamos a Polyline "Premium"
            const highResPoly = L.polyline(fullCoords, {
                color: info.color,
                weight: 5,         // Mais grossa para destacar
                opacity: 1,        // Opacidade total
                smoothFactor: 0.5, // Precisão máxima
                pane: 'overlayPane'
            }).addTo(sptransRoutesLayer);

            // Reaproveita o popup
            const popupContent = `
                <div class="map-popup">
                    <div class="popup-header" style="background-color: ${info.color}">
                        <strong>${info.number}</strong>
                    </div>
                    <div class="popup-body">
                        <p><strong>Itinerário:</strong><br>${info.name}</p>
                        <p><small>Modo: Alta Precisão</small></p>
                    </div>
                </div>
            `;
            highResPoly.bindPopup(popupContent);
        });

        // 3. Zoom focado
        const group = new L.featureGroup(sptransRoutesLayer.getLayers());
        if (group.getLayers().length > 0) {
            map.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 16 });
        }
    }
};

// ===============================
// CLICK LINHA
// ===============================
function handleLineClick(e, feature, lineColors) {
  if (selectedLayer) {
    selectedLayer.setStyle({ weight: 4, opacity: 0.8 });
  }

  selectedLayer = e.target;
  selectedLayer.setStyle({ weight: 8, opacity: 1 });

  const line = feature.properties.lines?.[0]?.line;
  const buildYear = feature.properties.buildstart;
  const statusObra =
    buildYear === 999999 ? "Em planejamento" : buildYear;

  selectedLayer.bindPopup(`
    <div class="map-popup">
      <div class="popup-header" style="background-color:${lineColors[line] || "#333"}">
        <strong>${line}</strong>
      </div>
      <div class="popup-body">
        <p><strong>Sistema:</strong> ${feature.properties.lines?.[0]?.system}</p>
        <p><strong>Construção:</strong> ${statusObra}</p>
      </div>
    </div>
  `).openPopup();

  L.DomEvent.stopPropagation(e);
}

// ===============================
// CONTROLES
// ===============================
function setupLayerControls() {
  const controls = {
    "check-trilhos": trilhosLayer,
    "check-ciclo": cicloLayer,
    "check-bike": bicicletarioLayer,
    "check-sptrans": sptransRoutesLayer
  };

  Object.entries(controls).forEach(([id, layer]) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("change", e => {

      if (id === "check-sptrans" && e.target.checked) {
        loadSPTransRoutes(); 
      }

      e.target.checked
        ? map.addLayer(layer)
        : map.removeLayer(layer);
    });
  });
}

loadMapData();