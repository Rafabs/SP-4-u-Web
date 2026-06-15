export const LINE_COLORS = [
  "#0455A1",
  "#007E5E",
  "#EE372F",
  "#FFF000",
  "#9B3894",
  "#CA016B",
  "#97A098",
  "#01A9A7",
  "#049FC3",
  "#F68368",
  "#133C8D",
  "#00B352",
  "#C0C0C0",
];

const CONFIG = {
  startX: 60,
  spacing: 60,
  baseDuration: 4,
  durationStep: 0.7,
  delayStep: 0.5,
  dotOffset: 2.5,
};

export function initHeroLines(
  canvasId = "lines-canvas",
): void {
  const canvas = document.getElementById(canvasId);

  if (!canvas) return;

  LINE_COLORS.forEach((color, index) => {
    const x =
      CONFIG.startX +
      index * CONFIG.spacing;

    createLineTrack(canvas, x, color);
    createAnimatedDot(canvas, x, color, index);
  });
}

function createLineTrack(
  container: HTMLElement,
  x: number,
  color: string,
): void {
  const track = document.createElement("div");

  track.className = "line-track";

  track.style.right = `${x}px`;
  track.style.setProperty("--line-color", color);

  container.appendChild(track);
}

function createAnimatedDot(
  container: HTMLElement,
  x: number,
  color: string,
  index: number,
): void {
  const dot = document.createElement("div");

  dot.className = "line-dot";

  dot.setAttribute("aria-hidden", "true");

  dot.style.right =
    `${x - CONFIG.dotOffset}px`;

  dot.style.setProperty("--line-color", color);

  dot.style.animationDuration =
    `${CONFIG.baseDuration + index * CONFIG.durationStep}s`;

  dot.style.animationDelay =
    `${-index * CONFIG.delayStep}s`;

  container.appendChild(dot);
}