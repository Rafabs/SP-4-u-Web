import { map } from "./map-instance"; 

declare const L: any; 

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

const aqiLayer = L.layerGroup();

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

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (match) => {
    const escapes: Record<string, string> = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    };
    return escapes[match];
  });
}

export async function loadAQIData(): Promise<void> {
  if (!AQI_TOKEN) {
    console.error("AQI Token não encontrado. Defina PUBLIC_AQI_API_KEY no .env");
    return;
  }

  try {
    const bounds = "-24.00,-47.00,-23.30,-46.20";
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `https://api.waqi.info/map/bounds/?latlng=${bounds}&token=${AQI_TOKEN}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const json: AQIResponse = await response.json();

    if (json.status === "ok") {
      aqiLayer.clearLayers();

      json.data.forEach((station) => {
        const semDados = !hasData(station.aqi);
        const color    = getAQIColor(station.aqi);
        const nomeEstacao = escapeHtml(station.station.name);

        let dataFormatada = station.station.time;
        try {
          if (station.station.time) {
            dataFormatada = new Date(station.station.time).toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo"
            });
          }
        } catch {
          dataFormatada = station.station.time;
        }

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
            <div style="text-align:center; font-family: sans-serif;">
              <strong>${nomeEstacao}</strong><br>
              ${semDados
                ? `<p style="margin:6px 0; color:#9e9e9e; font-size:0.85rem;">Dados indisponíveis</p>`
                : `<h2 style="margin:5px 0; color:${color}; font-size:1.5rem; font-weight:bold;">AQI: ${station.aqi}</h2>`
              }
              <small style="color:#666; display:block; margin-top:4px;">Atualizado em:<br>${dataFormatada}</small>
            </div>
          `);
      });
    } else {
      console.warn("API de Qualidade do Ar retornou um status inválido:", json.status);
    }
  } catch (error) {
    console.error("Erro ao carregar dados AQI:", error);
  }
}

export function setupAQIControls(): void {
  const checkAqi = document.getElementById("check-aqi") as HTMLInputElement | null;
  
  checkAqi?.removeEventListener("change", handleAqiChange);
  checkAqi?.addEventListener("change", handleAqiChange);
}

function handleAqiChange(e: Event): void {
  const checked = (e.target as HTMLInputElement).checked;
  if (checked) {
    map.addLayer(aqiLayer);
  } else {
    map.removeLayer(aqiLayer);
  }
}