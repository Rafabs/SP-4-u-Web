const COLORS = [
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

export function initHeroGtfs(): void {
  const canvas = document.getElementById("gtfs-canvas");
  if (!canvas) return;

  COLORS.forEach((color, i) => {
    const y = 40 + i * 55;

    const track = document.createElement("div");
    track.style.cssText = `position:absolute;left:0;right:0;top:${y}px;height:2px;background:${color};opacity:.12;`;
    canvas.appendChild(track);

    const pkg = document.createElement("span");
    pkg.className = "material-symbols-outlined";
    pkg.textContent = ICONS[i % ICONS.length];
    pkg.style.cssText = `position:absolute;top:${y - 12}px;font-size:${18 + (i % 3) * 6}px;color:${color};opacity:.6;animation:bus-run ${6 + i * 1.2}s linear infinite;animation-delay:${-i * 0.8}s;`;
    canvas.appendChild(pkg);
  });
}
