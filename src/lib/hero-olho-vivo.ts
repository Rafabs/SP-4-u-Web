export function initHeroOlhoVivo(
  canvasId = "olhovivo-canvas",
  colors = ["#e8000f","#cc0000","#ff3333","#ff6600","#e8000f","#aa0000","#ff4444","#dd1111"],
  icon = "directions_bus"
): void {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  colors.forEach((color, i) => {
    const y = 40 + i * 55;

    const track = document.createElement("div");
    track.style.cssText = `position:absolute;left:0;right:0;top:${y}px;height:2px;background:${color};opacity:.12;`;
    canvas.appendChild(track);

    const bus = document.createElement("span");
    bus.className = "material-symbols-outlined";
    bus.textContent = icon;
    bus.style.cssText = `position:absolute;top:${y - 12}px;font-size:${18 + (i % 3) * 6}px;color:${color};opacity:.6;animation:bus-run ${6 + i * 1.2}s linear infinite;animation-delay:${-i * 0.8}s;`;
    canvas.appendChild(bus);
  });
}