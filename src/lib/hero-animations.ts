interface HeroConfig {
  startY?: number;
  startX?: number;
  spacing: number;
  baseIconSize?: number;
  iconSizeVariation?: number;
  baseDuration: number;
  durationStep: number;
  delayStep: number;
  dotOffset?: number;
}

const DEFAULT_HORIZONTAL_CONFIG: HeroConfig = {
  startY: 40,
  spacing: 55,
  baseIconSize: 18,
  iconSizeVariation: 6,
  baseDuration: 6,
  durationStep: 1.2,
  delayStep: 0.8,
};

const DEFAULT_VERTICAL_CONFIG: HeroConfig = {
  startX: 60,
  spacing: 60,
  baseDuration: 4,
  durationStep: 0.7,
  delayStep: 0.5,
  dotOffset: 2.5,
};

function createMovingIconHero(
  canvasId: string,
  colors: string[],
  icons: string[],
  trackClassName = "hero-track",
  iconClassName = "hero-moving-icon"
): void {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const cfg = DEFAULT_HORIZONTAL_CONFIG;

  colors.forEach((color, index) => {
    const y = (cfg.startY ?? 40) + index * cfg.spacing;

    const track = document.createElement("div");
    track.className = trackClassName;
    track.style.top = `${y}px`;
    track.style.setProperty(
      trackClassName === "hero-route-track" ? "--hero-color" : "--hero-color",
      color
    );

    if (trackClassName === "aqi-track") {
      track.style.setProperty("--aqi-color", color);
    }
    canvas.appendChild(track);

    const icon = document.createElement("span");
    icon.className = `material-symbols-outlined ${iconClassName}`;
    icon.textContent = icons[index % icons.length];
    icon.setAttribute("aria-hidden", "true");
    
    icon.style.top = `${y - 12}px`;
    icon.style.fontSize = `${
      (cfg.baseIconSize ?? 18) + (index % 3) * (cfg.iconSizeVariation ?? 6)
    }px`;
    icon.style.animationDuration = `${cfg.baseDuration + index * cfg.durationStep}s`;
    icon.style.animationDelay = `${-index * cfg.delayStep}s`;
    
    
    if (iconClassName === "aqi-icon") {
      icon.style.setProperty("--aqi-color", color);
    } else {
      icon.style.setProperty("--hero-color", color);
    }

    canvas.appendChild(icon);
  });
}

export function initHeroAqi(): void {
  const colors = ["#009966", "#ffde33", "#ff9933", "#cc0033", "#009966", "#ffde33", "#9e9e9e", "#ff9933"];
  const icons = ["air", "cloud", "aq_indoor", "humidity_percentage"];
  createMovingIconHero("aqi-canvas", colors, icons, "aqi-track", "aqi-icon");
}

export function initHeroBus(
  canvasId = "bus-routes-canvas",
  colors = ["#e8000f", "#cc0000", "#ff3333", "#ff6600", "#e8000f", "#aa0000", "#ff4444", "#dd1111"],
  icon = "directions_bus"
): void {
  createMovingIconHero(canvasId, colors, [icon], "hero-route-track", "hero-route-icon");
}

export function initHeroCiclovia(): void {
  const colors = ["#32e622", "#28cc1a", "#3fff2f", "#20aa14", "#32e622", "#25bb18", "#38dd25", "#1e9912"];
  const icons = ["directions_bike", "pedal_bike", "electric_bike"];
  createMovingIconHero("ciclo-canvas", colors, icons);
}

export function initHeroDemanda(): void {
  const colors = ["#049FC3", "#0088aa", "#06b8e0", "#007799", "#049FC3", "#0099bb", "#05acd4", "#006688"];
  const icons = ["groups", "person", "monitoring", "subway"];
  createMovingIconHero("demanda-canvas", colors, icons);
}

export function initHeroGtfs(): void {
  const colors = ["#00b352", "#009966", "#00cc44", "#007733", "#00aa44", "#008833", "#00bb55", "#006622"];
  const icons = ["train", "directions_bus", "schedule", "route", "transfer_within_a_station"];
  createMovingIconHero("gtfs-canvas", colors, icons);
}

export function initHeroMapa(): void {
  const colors = ["#0455A1", "#007E5E", "#EE372F", "#FFF000", "#9B3894", "#CA016B", "#97A098", "#01A9A7"];
  const icons = ["train", "directions_bus", "route", "transfer_within_a_station", "directions_bike", "pedal_bike", "electric_bike", "air"];
  createMovingIconHero("mapa-canvas", colors, icons);
}

export function initHeroNews(): void {
  const colors = ["#1a3aff", "#2244ee", "#3355ff", "#0d2bdd", "#4466ff", "#1133cc", "#2255ff", "#0a22bb"];
  const icons = ["newspaper", "rss_feed", "campaign", "notifications", "broadcast_on_home"];
  createMovingIconHero("news-canvas", colors, icons);
}

export function initHeroOd(): void {
  const colors = ["#f0a500", "#cc8800", "#ffbb33", "#aa7700", "#f0a500", "#dd9900", "#ffcc44", "#bb8800"];
  const icons = ["directions_car", "directions_bus", "train", "directions_walk", "directions_bike", "pedal_bike", "electric_bike", "route"];
  createMovingIconHero("od-canvas", colors, icons);
}

export function initHeroOlhoVivo(
  canvasId = "olhovivo-canvas",
  colors = ["#e8000f", "#cc0000", "#ff3333", "#ff6600", "#e8000f", "#aa0000", "#ff4444", "#dd1111"],
  iconName = "directions_bus"
): void {
  createMovingIconHero(canvasId, colors, [iconName]);
}

export function initHeroTurismo(): void {
  const colors = ["#32e622", "#28cc1a", "#3fff2f", "#20aa14", "#32e622", "#25bb18", "#38dd25", "#1e9912"];
  const icons = ["attractions", "museum", "landscape", "location_city", "map", "travel_explore", "place", "account_balance"];
  createMovingIconHero("turismo-canvas", colors, icons);
}

export function initHeroVersion(): void {
  const colors = ['#7f77dd','#534ab7','#afa9ec','#3c3489', '#7f77dd','#6b63cc','#9b95e0','#4a42a8',];
  const icons = ["commit", "merge", "timeline", "deployed_code"];
  createMovingIconHero("versao-canvas", colors, icons);
}

export const LINE_COLORS = [
  "#0455A1", "#007E5E", "#EE372F", "#FFF000", "#9B3894", "#CA016B", 
  "#97A098", "#01A9A7", "#049FC3", "#F68368", "#133C8D", "#00B352", "#C0C0C0"
];

export function initHeroLines(canvasId = "lines-canvas"): void {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const cfg = DEFAULT_VERTICAL_CONFIG;

  LINE_COLORS.forEach((color, index) => {
    const x = (cfg.startX ?? 60) + index * cfg.spacing;

    
    const track = document.createElement("div");
    track.className = "line-track";
    track.style.right = `${x}px`;
    track.style.setProperty("--line-color", color);
    canvas.appendChild(track);

    
    const dot = document.createElement("div");
    dot.className = "line-dot";
    dot.setAttribute("aria-hidden", "true");
    dot.style.right = `${x - (cfg.dotOffset ?? 2.5)}px`;
    dot.style.setProperty("--line-color", color);
    dot.style.animationDuration = `${cfg.baseDuration + index * cfg.durationStep}s`;
    dot.style.animationDelay = `${-index * cfg.delayStep}s`;
    canvas.appendChild(dot);
  });
}