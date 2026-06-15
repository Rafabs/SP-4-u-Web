const DEFAULT_BUS_COLORS = [
  "#e8000f",
  "#cc0000",
  "#ff3333",
  "#ff6600",
  "#e8000f",
  "#aa0000",
  "#ff4444",
  "#dd1111",
];

const HERO_CONFIG = {
  startY: 40,
  spacing: 55,
  baseIconSize: 18,
  iconSizeVariation: 6,
  baseDuration: 6,
  durationStep: 1.2,
  delayStep: 0.8,
};

export function initHeroBus(
  canvasId = "bus-routes-canvas",
  colors = DEFAULT_BUS_COLORS,
  icon = "directions_bus",
): void {
  const canvas = document.getElementById(canvasId);

  if (!canvas) return;

  colors.forEach((color, index) => {
    const y = HERO_CONFIG.startY + index * HERO_CONFIG.spacing;

    createTrack(canvas, y, color);
    createAnimatedIcon(canvas, y, color, icon, index);
  });
}

function createTrack(
  container: HTMLElement,
  y: number,
  color: string,
): void {
  const track = document.createElement("div");

  track.className = "hero-route-track";
  track.style.top = `${y}px`;
  track.style.setProperty("--hero-color", color);

  container.appendChild(track);
}

function createAnimatedIcon(
  container: HTMLElement,
  y: number,
  color: string,
  iconName: string,
  index: number,
): void {
  const icon = document.createElement("span");

  icon.className =
    "material-symbols-outlined hero-route-icon";

  icon.textContent = iconName;
  icon.setAttribute("aria-hidden", "true");

  icon.style.top = `${y - 12}px`;

  icon.style.fontSize = `${
    HERO_CONFIG.baseIconSize +
    (index % 3) * HERO_CONFIG.iconSizeVariation
  }px`;

  icon.style.setProperty("--hero-color", color);

  icon.style.animationDuration =
    `${HERO_CONFIG.baseDuration + index * HERO_CONFIG.durationStep}s`;

  icon.style.animationDelay =
    `${-index * HERO_CONFIG.delayStep}s`;

  container.appendChild(icon);
}