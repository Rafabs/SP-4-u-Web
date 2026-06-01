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

export function initHeroNews(): void {
  const canvas = document.getElementById("news-canvas");
  if (!canvas) return;

  NEWS_COLORS.forEach((color, i) => {
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