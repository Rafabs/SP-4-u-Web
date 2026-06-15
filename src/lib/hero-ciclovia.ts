const CICLO_COLORS = [
  "#32e622",
  "#28cc1a",
  "#3fff2f",
  "#20aa14",
  "#32e622",
  "#25bb18",
  "#38dd25",
  "#1e9912",
];

const ICONS = [
  "directions_bike",
  "pedal_bike",
  "electric_bike",
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

export function initHeroCiclovia(): void {
  const canvas = document.getElementById("ciclo-canvas");

  if (!canvas) return;

  CICLO_COLORS.forEach((color, index) => {
    const y = CONFIG.startY + index * CONFIG.spacing;

    createTrack(canvas, y, color);
    createBikeIcon(canvas, y, color, index);
  });
}

function createTrack(
  container: HTMLElement,
  y: number,
  color: string,
): void {
  const track = document.createElement("div");

  track.className = "hero-track";
  track.style.top = `${y}px`;
  track.style.setProperty("--hero-color", color);

  container.appendChild(track);
}

function createBikeIcon(
  container: HTMLElement,
  y: number,
  color: string,
  index: number,
): void {
  const bikeIcon = document.createElement("span");

  bikeIcon.className =
    "material-symbols-outlined hero-moving-icon";

  bikeIcon.textContent = ICONS[index % ICONS.length];

  bikeIcon.setAttribute("aria-hidden", "true");

  bikeIcon.style.top = `${y - 12}px`;

  bikeIcon.style.fontSize = `${
    CONFIG.baseIconSize +
    (index % 3) * CONFIG.iconSizeVariation
  }px`;

  bikeIcon.style.setProperty("--hero-color", color);

  bikeIcon.style.animationDuration =
    `${CONFIG.baseDuration + index * CONFIG.durationStep}s`;

  bikeIcon.style.animationDelay =
    `${-index * CONFIG.delayStep}s`;

  container.appendChild(bikeIcon);
}