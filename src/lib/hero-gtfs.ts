const GTFS_COLORS = [
  "#00b352",
  "#009966",
  "#00cc44",
  "#007733",
  "#00aa44",
  "#008833",
  "#00bb55",
  "#006622",
];

const ICONS = [
  "train",
  "directions_bus",
  "schedule",
  "route",
  "transfer_within_a_station",
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

export function initHeroGtfs(): void {
  const canvas = document.getElementById("gtfs-canvas");

  if (!canvas) return;

  GTFS_COLORS.forEach((color, index) => {
    const y = CONFIG.startY + index * CONFIG.spacing;

    createTrack(canvas, y, color);
    createGtfsIcon(canvas, y, color, index);
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

function createGtfsIcon(
  container: HTMLElement,
  y: number,
  color: string,
  index: number,
): void {
  const gtfsIcon = document.createElement("span");

  gtfsIcon.className =
    "material-symbols-outlined hero-moving-icon";

  gtfsIcon.textContent = ICONS[index % ICONS.length];

  gtfsIcon.setAttribute("aria-hidden", "true");

  gtfsIcon.style.top = `${y - 12}px`;

  gtfsIcon.style.fontSize = `${
    CONFIG.baseIconSize +
    (index % 3) * CONFIG.iconSizeVariation
  }px`;

  gtfsIcon.style.setProperty("--hero-color", color);

  gtfsIcon.style.animationDuration =
    `${CONFIG.baseDuration + index * CONFIG.durationStep}s`;

  gtfsIcon.style.animationDelay =
    `${-index * CONFIG.delayStep}s`;

  container.appendChild(gtfsIcon);
}