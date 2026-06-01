const OD_COLORS = [
      "#f0a500",
      "#cc8800",
      "#ffbb33",
      "#aa7700",
      "#f0a500",
      "#dd9900",
      "#ffcc44",
      "#bb8800",
];

const ICONS = [
  "directions_bike",
  "pedal_bike",
  "electric_bike",
];

export function initHeroOd(): void {
  const canvas = document.getElementById("od-canvas");
  if (!canvas) return;

  OD_COLORS.forEach((color, i) => {
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
