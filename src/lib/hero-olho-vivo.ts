const CONFIG = {
  startY: 40,
  spacing: 55,
  baseIconSize: 18,
  iconSizeVariation: 6,
  baseDuration: 6,
  durationStep: 1.2,
  delayStep: 0.8,
};

export function initHeroOlhoVivo(
  canvasId = "olhovivo-canvas",
  colors = [
    "#e8000f",
    "#cc0000",
    "#ff3333",
    "#ff6600",
    "#e8000f",
    "#aa0000",
    "#ff4444",
    "#dd1111",
  ],
  iconName = "directions_bus"
): void {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  colors.forEach((color, index) => {
    const y = CONFIG.startY + index * CONFIG.spacing;

    createTrack(canvas, y, color);
    createIcon(canvas, y, color, iconName, index);
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