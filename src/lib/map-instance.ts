/**
 * map-instance.ts
 * Instância única do mapa Leaflet — importar daqui em todos os módulos.
 * Nunca chame L.map("map") fora deste arquivo.
 */
import L from "leaflet";

export const map = L.map("map", {
  preferCanvas: true,
  zoomAnimation: true,
  touchZoom: false,
  doubleClickZoom: false,
  scrollWheelZoom: true,
  boxZoom: true,
  keyboard: true,
}).setView([-23.5505, -46.6333], 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

L.control.scale({
  position: "bottomleft",
  metric: true,
  imperial: false,
  maxWidth: 120,
}).addTo(map);

/**
 * Inicializa plugins UMD (fullscreen, régua, minimap).
 * Deve ser chamado APÓS os <script src="..."> dos plugins carregarem,
 * passando o L do módulo npm para garantir a mesma instância.
 */
export function initPlugins(): void {
  const Lany = L as any;

  // Fullscreen
  if (Lany.control?.fullscreen) {
    Lany.control.fullscreen({
      position: "topleft",
      title: "Tela cheia",
      titleCancel: "Sair da tela cheia",
      forceSeparateButton: true,
    }).addTo(map);
  }

  // Régua
  if (Lany.control?.measure) {
    Lany.control.measure({
      position: "topleft",
      primaryLengthUnit: "kilometers",
      secondaryLengthUnit: "meters",
      primaryAreaUnit: "sqmeters",
      activeColor: "#32e622",
      completedColor: "#32e622",
      localization: "pt_BR",
      popupOptions: {
        className: "leaflet-measure-resultpopup",
        autoPanPadding: [10, 10],
      },
    }).addTo(map);
  }

  // Minimap
  if (Lany.Control?.MiniMap) {
    const miniTile = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: "" }
    );
    new Lany.Control.MiniMap(miniTile, {
      position: "bottomleft",
      width: 140,
      height: 100,
      collapsedWidth: 24,
      collapsedHeight: 24,
      zoomLevelOffset: -6,
      toggleDisplay: true,
      minimized: false,
    }).addTo(map);
  }
}