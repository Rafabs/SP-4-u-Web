const AQI_COLORS = [
  "#009966",
  "#ffde33",
  "#ff9933",
  "#cc0033",
  "#009966",
  "#ffde33",
  "#9e9e9e",
  "#ff9933",
];

const ICONS = [
  "air",
  "cloud",
  "aq_indoor",
  "humidity_percentage",
];

const CONFIG = {
  startY: 40,
  spacing: 55,
  baseIconSize: 18,
  iconSizeVariation: 6,
  baseDuration: 6,
  durationStep: 1.2,
  delayStep: 0.8,
};

export function initHeroAqi(): void {
  const canvas = document.getElementById("aqi-canvas");

  if (!canvas) return;

  AQI_COLORS.forEach((color, index) => {
    const y = CONFIG.startY + index * CONFIG.spacing;

    createTrack(canvas, y, color);
    createAnimatedIcon(canvas, y, color, index);
  });
}

function createTrack(
  container: HTMLElement,
  y: number,
  color: string
): void {
  const track = document.createElement("div");

  track.className = "aqi-track";
  track.style.top = `${y}px`;
  track.style.setProperty("--aqi-color", color);

  container.appendChild(track);
}

function createAnimatedIcon(
  container: HTMLElement,
  y: number,
  color: string,
  index: number
): void {
  const icon = document.createElement("span");

  icon.className = "material-symbols-outlined aqi-icon";
  icon.textContent = ICONS[index % ICONS.length];

  icon.setAttribute("aria-hidden", "true");

  icon.style.fontSize = `${
    CONFIG.baseIconSize +
    (index % 3) * CONFIG.iconSizeVariation
  }px`;

  icon.style.top = `${y - 12}px`;
  icon.style.setProperty("--aqi-color", color);

  icon.style.animationDuration =
    `${CONFIG.baseDuration + index * CONFIG.durationStep}s`;

  icon.style.animationDelay =
    `${-index * CONFIG.delayStep}s`;

  container.appendChild(icon);
}