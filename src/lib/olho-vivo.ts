const BASE_URL = ((window as any).__BASE_URL__ ?? "").replace(/\/$/, "");

const AREA_COLORS: Record<number, string> = {
  1: "#509E2F", 2: "#002F6C", 3: "#DA291C", 4: "#FFD100",
  5: "#006341", 6: "#0082BA", 7: "#782F40", 8: "#FF671F"
};

export async function loadFrota(): Promise<void> {
  const grid = document.getElementById("frota-grid");
  const ts = document.getElementById("frota-timestamp");
  const heroBus = document.getElementById("hero-total-onibus");

  if (!grid) return;

  try {
    const res = await fetch(`${BASE_URL}/data/olhovivo-frota.json?t=${Date.now()}`);
    const data = await res.json();

    if (heroBus) {
      heroBus.innerHTML = `${data.totalOnibus ?? 0}<small style="font-size:0.5em; display:block; font-weight:normal;">veículos ativos</small>`;
    }

    grid.innerHTML = (data.areas ?? []).map((a: any) => {
      const color = AREA_COLORS[a.area as keyof typeof AREA_COLORS] || "#333";
      const qtdOnibus = a.qtdOnibus ?? 0;

      return `
        <div class="area-group" style="border-top: 4px solid ${color}">
          <div class="area-header" style="display:flex; justify-content:space-between; align-items:start; margin-bottom: 15px;">
            <div>
              <div class="area-badge" style="background: ${color}; margin-bottom: 5px;">Área ${a.area}</div>
              <div style="font-size: 11px; font-weight: bold; display: flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size:14px;">directions_bus</span>
                ${qtdOnibus.toLocaleString('pt-BR')} ÔNIBUS
              </div>
            </div>
            <span style="background:${color}22; padding:2px 8px; border-radius:12px; font-size:10px; font-weight:bold; border: 1px solid ${color}44;">
              ${a.empresas?.length || 0} OPERADORAS
            </span>
          </div>
          
          <div class="companies-stack">
            ${(a.empresas ?? []).map((e: any) => `
              <div class="company-item">
                <div class="company-code" style="border-color: ${color}44;">${e.codigo}</div>
                <div class="company-name" style="font-size:0.75rem;">${e.nome}</div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }).join("");

    if (ts && data.timestamp) {
      ts.textContent = `Sincronizado às ${new Date(data.timestamp).toLocaleTimeString("pt-BR", {timeZone: "America/Sao_Paulo"})}`;
    }

  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div class="error-msg">Erro ao carregar frota.</div>`;
  }
}

loadFrota();