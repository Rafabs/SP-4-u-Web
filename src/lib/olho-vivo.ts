const BASE_URL = ((window as unknown as { __BASE_URL__?: string }).__BASE_URL__ ?? "").replace(/\/$/, "");

const AREA_COLORS: Record<number, string> = {
  1: "#509E2F", 2: "#002F6C", 3: "#DA291C", 4: "#FFD100",
  5: "#006341", 6: "#0082BA", 7: "#782F40", 8: "#FF671F"
};

interface Empresa {
  nome: string;
}

interface AreaFrota {
  area: number;
  qtdOnibus?: number;
  empresas?: Empresa[];
}

interface DataFrota {
  totalOnibus?: number;
  areas?: AreaFrota[];
  timestamp?: string | number;
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (match) => {
    const escapes: Record<string, string> = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    };
    return escapes[match];
  });
}

export async function loadFrota(): Promise<void> {
  const grid = document.getElementById("frota-grid");
  const ts = document.getElementById("frota-timestamp");
  const heroBus = document.getElementById("hero-total-onibus");

  if (!grid) return;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${BASE_URL}/data/olhovivo-frota.json?t=${Date.now()}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`Erro na requisição: ${res.status}`);

    const data: DataFrota = await res.json();

    if (heroBus) {
      const total = data.totalOnibus ?? 0;
      heroBus.innerHTML = `${total}<small style="font-size:0.5em; display:block; font-weight:normal;">veículos ativos</small>`;
    }

    grid.innerHTML = (data.areas ?? []).map((a) => {
      const color = AREA_COLORS[a.area] || "#333";
      const qtdOnibus = a.qtdOnibus ?? 0;
      const totalEmpresas = a.empresas?.length || 0;

      const empresasHtml = (a.empresas ?? []).map((e) => `
        <div class="company-item">
          <div class="company-name" style="font-size:0.75rem;">${escapeHtml(e.nome)}</div>
        </div>
      `).join("");

      return `
        <div class="area-group" style="border-top: 4px solid ${color}">
          <div class="area-header" style="display:flex; justify-content:space-between; align-items:start; margin-bottom: 15px;">
            <div>
              <div class="area-badge" style="background: ${color}; margin-bottom: 5px;">Área ${a.area}</div>
              <div style="font-size: 12px; font-weight: bold; display: flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size:14px;">directions_bus</span>
                ${qtdOnibus.toLocaleString('pt-BR')} ÔNIBUS
              </div>
            </div>
            <span style="background:${color}22; padding:2px 8px; border-radius:12px; font-size:10px; font-weight:bold; border: 1px solid ${color}44;">
              ${totalEmpresas} OPERADORAS
            </span>
          </div>
          
          <div class="companies-stack">
            ${empresasHtml}
          </div>
        </div>
      `;
    }).join("");

    if (ts && data.timestamp) {
      const dataFormatada = new Date(data.timestamp).toLocaleTimeString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      ts.textContent = `Sincronizado às ${dataFormatada}`;
    }

  } catch (err) {
    console.error("Erro ao carregar dados da frota:", err);
    grid.innerHTML = `<div class="error-msg">Erro ao carregar frota.</div>`;
  }
}

loadFrota();