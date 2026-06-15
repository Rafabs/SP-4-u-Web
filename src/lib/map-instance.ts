import L from "leaflet";

const DEFAULT_CENTER: L.LatLngExpression = [
  -23.5505,
  -46.6333,
];

const DEFAULT_ZOOM = 11;

const OSM_TILE_URL =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const ACCENT_COLOR = "#32e622";

export const map = L.map("map", {
  preferCanvas: true,
  zoomAnimation: true,
  touchZoom: false,
  doubleClickZoom: false,
  scrollWheelZoom: true,
  boxZoom: true,
  keyboard: true,
}).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

createBaseTileLayer().addTo(map);

L.control.scale({
  position: "bottomleft",
  metric: true,
  imperial: false,
  maxWidth: 120,
}).addTo(map);

type LeafletExtended = typeof L & {
  control?: any;
  Control?: any;
};

const leaflet = L as LeafletExtended;

export function initPlugins(): void {
  initFullscreenPlugin();
  initMeasurePlugin();
  initMiniMapPlugin();
}

function createBaseTileLayer(): L.TileLayer {
  return L.tileLayer(OSM_TILE_URL, {
    attribution: "&copy; OpenStreetMap contributors",
  });
}

function initFullscreenPlugin(): void {
  if (!leaflet.control?.fullscreen) return;

  leaflet.control.fullscreen({
    position: "topleft",
    title: "Tela cheia",
    titleCancel: "Sair da tela cheia",
    forceSeparateButton: true,
  }).addTo(map);
}

function initMeasurePlugin(): void {
  if (!leaflet.control?.measure) return;

  leaflet.control.measure({
    position: "topleft",
    primaryLengthUnit: "kilometers",
    secondaryLengthUnit: "meters",
    primaryAreaUnit: "sqmeters",
    activeColor: ACCENT_COLOR,
    completedColor: ACCENT_COLOR,
    localization: "pt_BR",
    popupOptions: {
      className: "leaflet-measure-resultpopup",
      autoPanPadding: [10, 10],
    },
  }).addTo(map);
}

function initMiniMapPlugin(): void {
  if (!leaflet.Control?.MiniMap) return;

  const miniTile = createBaseTileLayer();

  new leaflet.Control.MiniMap(miniTile, {
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