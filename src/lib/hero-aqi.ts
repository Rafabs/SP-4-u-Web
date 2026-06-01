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
'air',
'cloud',
'aq_indoor',
'humidity_percentage'
]

export function initHeroAqi(): void {
  const canvas = document.getElementById("aqi-canvas");
  if (!canvas) return;

  AQI_COLORS.forEach((color, i) => {
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