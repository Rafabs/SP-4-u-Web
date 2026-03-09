import L from "leaflet";

// ===============================
// CONFIGURAÇÃO
// ===============================

// Variáveis PUBLIC_* são acessíveis no client sem define:vars
const AQI_TOKEN = import.meta.env.PUBLIC_AQI_API_KEY as string | undefined;

// ===============================
// TIPOS
// ===============================
interface AQIStation {
  lat: number;
  lon: number;
  aqi: number;
  station: {
    name: string;
    time: string;
  };
}

interface AQIResponse {
  status: string;
  data: AQIStation[];
}

// ===============================
// MAPA
// ===============================
const map = L.map("map", {
  preferCanvas: true,
}).setView([-23.5505, -46.6333], 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const aqiLayer = L.layerGroup().addTo(map);

// ===============================
// UTILIDADES
// ===============================
function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "#009966";
  if (aqi <= 100) return "#ffde33";
  if (aqi <= 150) return "#ff9933";
  return "#cc0033";
}

// ===============================
// CARREGAMENTO DE DADOS AQI
// ===============================
export async function loadAQIData(): Promise<void> {
  if (!AQI_TOKEN) {
    console.error("AQI Token não encontrado. Defina PUBLIC_AQI_API_KEY no .env");
    return;
  }

  try {
    const bounds = "-24.00,-47.00,-23.30,-46.20";
    const response = await fetch(
      `https://api.waqi.info/map/bounds/?latlng=${bounds}&token=${AQI_TOKEN}`
    );
    const json: AQIResponse = await response.json();

    if (json.status === "ok") {
      aqiLayer.clearLayers();

      json.data.forEach((station) => {
        const color = getAQIColor(station.aqi);

        L.circleMarker([station.lat, station.lon], {
          radius: 10,
          fillColor: color,
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        })
          .addTo(aqiLayer)
          .bindPopup(`
            <div style="text-align:center">
              <strong>${station.station.name}</strong><br>
              <h2 style="margin:5px 0; color:${color}">AQI: ${station.aqi}</h2>
              <small>Atualizado em: ${station.station.time}</small>
            </div>
          `);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar dados AQI:", error);
  }
}

// ===============================
// CONTROLE DA CAMADA
// ===============================
export function setupAQIControls(): void {
  const checkAqi = document.getElementById("check-aqi") as HTMLInputElement | null;

  checkAqi?.addEventListener("change", (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    checked ? map.addLayer(aqiLayer) : map.removeLayer(aqiLayer);
  });
}