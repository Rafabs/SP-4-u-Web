export const LINE_COLORS = [
  "#0455A1", "#007E5E", "#EE372F", "#FFF000",
  "#9B3894", "#CA016B", "#97A098", "#01A9A7",
  "#049FC3", "#F68368", "#133C8D", "#00B352", "#C0C0C0",
];

export function initHeroLines(canvasId = "lines-canvas"): void {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  LINE_COLORS.forEach((color, i) => {
    const x = 60 + i * 60;

    const track = document.createElement("div");
    track.className = "line-track";
    track.style.cssText = `background:${color};right:${x}px;`;
    canvas.appendChild(track);

    const dot = document.createElement("div");
    dot.className = "line-dot";
    dot.style.cssText = `background:${color};right:${x - 2.5}px;animation-duration:${4 + i * 0.7}s;animation-delay:${-i * 0.5}s;`;
    canvas.appendChild(dot);
  });
}