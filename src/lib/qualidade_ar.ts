import L from "leaflet";
import { map } from "./map-instance"; // ← mapa compartilhado

const AQI_TOKEN = import.meta.env.PUBLIC_AQI_API_KEY as string | undefined;

interface AQIStation {
  lat: number;
  lon: number;
  aqi: number | "-";
  station: { name: string; time: string };
}

interface AQIResponse {
  status: string;
  data: AQIStation[];
}

const aqiLayer = L.layerGroup(); // não adiciona ao mapa até o checkbox ser marcado

function hasData(aqi: number | "-"): aqi is number {
  return aqi !== "-" && !isNaN(Number(aqi));
}

function getAQIColor(aqi: number | "-"): string {
  if (!hasData(aqi)) return "#9e9e9e";
  if (aqi <= 50)     return "#009966";
  if (aqi <= 100)    return "#ffde33";
  if (aqi <= 150)    return "#ff9933";
  return "#cc0033";
}

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
        const semDados = !hasData(station.aqi);
        const color    = getAQIColor(station.aqi);

        L.circleMarker([station.lat, station.lon], {
          radius:      semDados ? 7 : 10,
          fillColor:   color,
          color:       semDados ? "#757575" : "#fff",
          weight:      semDados ? 1 : 2,
          opacity:     semDados ? 0.5 : 1,
          fillOpacity: semDados ? 0.4 : 0.8,
        })
          .addTo(aqiLayer)
          .bindPopup(`
            <div style="text-align:center">
              <strong>${station.station.name}</strong><br>
              ${semDados
                ? `<p style="margin:6px 0;color:#9e9e9e;font-size:0.85rem;">Dados indisponíveis</p>`
                : `<h2 style="margin:5px 0;color:${color}">AQI: ${station.aqi}</h2>`
              }
              <small>Atualizado em: ${station.station.time}</small>
            </div>
          `);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar dados AQI:", error);
  }
}

export function setupAQIControls(): void {
  const checkAqi = document.getElementById("check-aqi") as HTMLInputElement | null;
  checkAqi?.addEventListener("change", (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    checked ? map.addLayer(aqiLayer) : map.removeLayer(aqiLayer);
  });
}