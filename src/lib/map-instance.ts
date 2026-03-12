/**
 * map-instance.ts
 * Instância única do mapa Leaflet — importar daqui em todos os módulos.
 * Nunca chame L.map("map") fora deste arquivo.
 */
import L from "leaflet";

export const map = L.map("map", {
  preferCanvas: true,
}).setView([-23.5505, -46.6333], 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);