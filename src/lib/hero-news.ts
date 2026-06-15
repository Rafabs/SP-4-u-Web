const NEWS_COLORS = [
  "#1a3aff",
  "#2244ee",
  "#3355ff",
  "#0d2bdd",
  "#4466ff",
  "#1133cc",
  "#2255ff",
  "#0a22bb",
];

const ICONS = [
  "newspaper",
  "rss_feed",
  "campaign",
  "notifications",
  "broadcast_on_home",
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

export function initHeroNews(): void {
  const canvas = document.getElementById("news-canvas");
  if (!canvas) return;

  NEWS_COLORS.forEach((color, index) => {
    const y = CONFIG.startY + index * CONFIG.spacing;

    createTrack(canvas, y, color);
    createIcon(canvas, y, color, ICONS[index % ICONS.length], index);
  });
}

function createTrack(
  canvas: HTMLElement,
  y: number,
  color: string
): void {
  const track = document.createElement("div");

  track.className = "hero-track";
  track.style.top = `${y}px`;
  track.style.setProperty("--hero-color", color);

  canvas.appendChild(track);
}

function createIcon(
  canvas: HTMLElement,
  y: number,
  color: string,
  iconName: string,
  index: number
): void {
  const icon = document.createElement("span");

  icon.className = "material-symbols-outlined hero-moving-icon";
  icon.textContent = iconName;
  icon.setAttribute("aria-hidden", "true");

  icon.style.top = `${y - 12}px`;

  icon.style.fontSize =
    `${CONFIG.baseIconSize + (index % 3) * CONFIG.iconSizeVariation}px`;

  icon.style.animationDuration =
    `${CONFIG.baseDuration + index * CONFIG.durationStep}s`;

  icon.style.animationDelay =
    `${-index * CONFIG.delayStep}s`;

  icon.style.setProperty("--hero-color", color);

  canvas.appendChild(icon);
}