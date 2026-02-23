// map-logic.js
let selectedLayer = null;
const BASE_URL = window.location.pathname.includes("SP-4-u-Web") ? "/SP-4-u-Web" : "";

const map = L.map("map").setView([-23.5505, -46.6333], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// Grupos de Camadas
const trilhosLayer = L.layerGroup().addTo(map);
const cicloLayer = L.layerGroup();
const bicicletarioLayer = L.layerGroup();

async function loadMapData() {
  try {
    const [resLines, resIcons, resSections, resStations, resCiclo, resBicicletarios] = await Promise.all([
      fetch(`${BASE_URL}/data/map/sao-paulo_lines_systems_and_modes.json`),
      fetch(`${BASE_URL}/data/map/caminho_icones.json`),
      fetch(`${BASE_URL}/data/map/sao-paulo_sections.geojson`),
      fetch(`${BASE_URL}/data/map/sao-paulo_stations.geojson`),
      fetch(`${BASE_URL}/data/map/LL_WGS84_KMZ_redecicloviaria.json`),
      fetch(`${BASE_URL}/data/map/LL_WGS84_KMZ_bicicletarioparaciclo.geojson`)
    ]);

    const linesInfo = await resLines.json();
    const iconMapping = await resIcons.json();
    const lineColors = Object.fromEntries(linesInfo.map((l) => [l.name, l.color]));

    // --- 1. TRILHOS E ESTAÇÕES ---
    const sectionsData = await resSections.json();
    L.geoJSON(sectionsData, {
      style: (f) => ({ color: lineColors[f.properties.lines[0]?.line] || "#666", weight: 4, opacity: 0.8, lineCap: "round" }),
      onEachFeature: (f, l) => l.on('click', (e) => handleLineClick(e, f, lineColors))
    }).addTo(trilhosLayer);

    const stationsData = await resStations.json();
    L.geoJSON(stationsData, {
      pointToLayer: (f, latlng) => {
        const lineName = f.properties.lines[0]?.line;
        const iconPath = iconMapping[lineName];
        if (iconPath) {
          const fileName = iconPath.split("\\").pop().split("/").pop();
          return L.marker(latlng, { icon: L.icon({ iconUrl: `${BASE_URL}/icons/${fileName}`, iconSize: [22, 22], iconAnchor: [11, 11] }) });
        }
        return L.circleMarker(latlng, { radius: 5, fillColor: "white", color: "#000", weight: 1 });
      },
      onEachFeature: (f, l) => l.bindPopup(`<b>Estação:</b> ${f.properties.name}<br><b>Linha:</b> ${f.properties.lines[0]?.line}`)
    }).addTo(trilhosLayer);

    // --- 2. CICLOVIAS (UNIFICADO E CONTÍNUO) ---
    const cicloData = await resCiclo.json();
    L.geoJSON(cicloData, {
      style: { color: "#32e622", weight: 3, opacity: 0.8, dashArray: null },
      onEachFeature: (f, l) => l.bindPopup(`<b>Ciclovia:</b> ${f.properties.rc_nome || "Trecho"}`)
    }).addTo(cicloLayer);

    // --- 3. BICICLETÁRIOS (ÍCONE CORRIGIDO) ---
    const bikeData = await resBicicletarios.json();
    L.geoJSON(bikeData, {
      pointToLayer: (f, latlng) => {
        return L.marker(latlng, {
          icon: L.icon({
            iconUrl: `${BASE_URL}/icons/bicicleta.png`, // Certifique-se que o nome no arquivo é exatamente este
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -10]
          })
        });
      },
      onEachFeature: (f, l) => {
        l.bindPopup(`<b>Bicicletário:</b> ${f.properties.bcp_local}<br><b>Vagas:</b> ${f.properties.bcp_vaga}`);
      }
    }).addTo(bicicletarioLayer);

    setupLayerControls();
  } catch (error) { console.error("Erro:", error); }
}

function handleLineClick(e, feature, lineColors) {
  if (selectedLayer) selectedLayer.setStyle({ weight: 4, opacity: 0.8 });
  selectedLayer = e.target;
  selectedLayer.setStyle({ weight: 8, opacity: 1 });
  const line = feature.properties.lines[0]?.line;
  const content = `<div class="map-popup"><div class="popup-header" style="background-color: ${lineColors[line] || '#333'}"><strong>${line}</strong></div><div class="popup-body"><p>Sistema: ${feature.properties.lines[0]?.system}</p><p>Extensão: ${(feature.properties.length / 1000).toFixed(2)} km</p></div></div>`;
  selectedLayer.bindPopup(content).openPopup();
  L.DomEvent.stopPropagation(e);
}

function setupLayerControls() {
  const controls = { "check-trilhos": trilhosLayer, "check-ciclo": cicloLayer, "check-bike": bicicletarioLayer };
  Object.entries(controls).forEach(([id, layer]) => {
    document.getElementById(id)?.addEventListener("change", (e) => e.target.checked ? map.addLayer(layer) : map.removeLayer(layer));
  });
}

loadMapData();