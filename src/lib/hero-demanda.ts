const DEMANDA_COLORS = [
  "#049FC3",
  "#0088aa",
  "#06b8e0",
  "#007799",
  "#049FC3",
  "#0099bb",
  "#05acd4",
  "#006688",
];

const ICONS = [
  "groups",
  "person",
  "monitoring",
  "subway",
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

export function initHeroDemanda(): void {
  const canvas = document.getElementById("demanda-canvas");

  if (!canvas) return;

  DEMANDA_COLORS.forEach((color, index) => {
    const y = CONFIG.startY + index * CONFIG.spacing;

    createTrack(canvas, y, color);
    createDemandIcon(canvas, y, color, index);
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

function createDemandIcon(
  container: HTMLElement,
  y: number,
  color: string,
  index: number,
): void {
  const demandIcon = document.createElement("span");

  demandIcon.className =
    "material-symbols-outlined hero-moving-icon";

  demandIcon.textContent = ICONS[index % ICONS.length];

  demandIcon.setAttribute("aria-hidden", "true");

  demandIcon.style.top = `${y - 12}px`;

  demandIcon.style.fontSize = `${
    CONFIG.baseIconSize +
    (index % 3) * CONFIG.iconSizeVariation
  }px`;

  demandIcon.style.setProperty("--hero-color", color);

  demandIcon.style.animationDuration =
    `${CONFIG.baseDuration + index * CONFIG.durationStep}s`;

  demandIcon.style.animationDelay =
    `${-index * CONFIG.delayStep}s`;

  container.appendChild(demandIcon);
}