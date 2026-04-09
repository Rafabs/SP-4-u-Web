// ===============================
// CONFIGURAÇÃO
// ===============================
const BASE_URL = import.meta.env.BASE_URL ?? "";

// ===============================
// TIPOS
// ===============================
interface Conexao {
  linha?: string;
  nome?: string;
  cor?: string;
  icone?: string;
}

interface Estacao {
  nomePrincipal?: string;
  primary?: string;
  nomeSecundario?: string;
  secondary?: string;
  destaqueSecundario?: boolean;
  conexoes?: Conexao[];
}

interface DadosLinha {
  nome: string;
  cor: string;
  empresa?: string;
  operadora?: string;
  estacoes: Estacao[];
}

type DadosLinhas = Record<string, DadosLinha>;

// ===============================
// MAPA DE ÍCONES
// ===============================
const ICON_MAP: Record<string, string> = {
  L01: "1_azul.png",
  L02: "2_verde.png",
  L03: "3_vermelha.png",
  L04: "4_amarela.png",
  L05: "5_lilas.png",
  L07: "cptm.png",
  L08: "8_diamante.png",
  L09: "9_esmeralda.png",
  L10: "cptm.png",
  L11: "cptm.png",
  L12: "cptm.png",
  L13: "cptm.png",
  L15: "15_prata.png",
};

function getIconFileName(id: string): string {
  return ICON_MAP[id] ?? "default.png";
}

// ===============================
// INICIALIZAÇÃO
// ===============================
export async function initDetalhes(): Promise<void> {
  const params  = new URLSearchParams(window.location.search);
  const linhaId = params.get("linha");

  try {
    const response = await fetch(`${BASE_URL}dados-linhas.json`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

    const dadosLinhas: DadosLinhas = await response.json();
    const dados = linhaId ? dadosLinhas[linhaId] : null;

    if (dados && linhaId) {
      renderPage(dados, linhaId);
      renderLineSwitcher(linhaId, dadosLinhas);

      // ✅ ADICIONADO: carrega o status da linha selecionada
      // O renderPage já renomeou o id do card para o padrão "{linhaId.toLowerCase()}-info"
      // que o loadStatusLinhas usa para encontrar e atualizar o card.
      const { loadStatusLinhas } = await import("./status-linhas");
      loadStatusLinhas();
    } else {
      window.location.href = `${BASE_URL}/404`;
    }
  } catch (error) {
    console.error("Erro ao carregar dados da linha:", error);
  }
}

// ===============================
// RENDERIZAÇÃO DA PÁGINA
// ===============================
function renderPage(dados: DadosLinha, linhaId: string): void {
  document.title = dados.nome;

  // Cor do bloco
  const corBloco = document.getElementById("linha-cor-bloco");
  if (corBloco) corBloco.style.backgroundColor = dados.cor;

  // Nome
  const nomeEl = document.getElementById("linha-nome-titulo");
  if (nomeEl) nomeEl.innerText = dados.nome;

  // Operadora
  const empresaEl = document.getElementById("linha-empresa");
  const logoImg   = document.getElementById("linha-destaque-logo") as HTMLImageElement | null;
  const nomeOperadora = dados.operadora ?? dados.empresa ?? "Operadora Desconhecida";

  if (empresaEl) empresaEl.innerText = nomeOperadora;

  // Status da operação — renomeia o id para o padrão esperado pelo status-linhas.ts
  const statusCard = document.getElementById("linha-status-info");
  if (statusCard) {
    statusCard.id        = `${linhaId.toLowerCase()}-info`;
    statusCard.innerText = "Informações sobre a Operação - Carregando...";
  }

  renderTimeline(dados);
}

// ===============================
// TIMELINE DE ESTAÇÕES
// ===============================
function renderTimeline(dados: DadosLinha): void {
  const wrapper = document.getElementById("station-line-wrapper");
  const lineBar = document.getElementById("dynamic-line-color");
  if (!wrapper || !lineBar) return;

  lineBar.style.backgroundColor = dados.cor;

  // Limpa itens anteriores
  wrapper.querySelectorAll(".item").forEach((el) => el.remove());

  const iconBase = `${BASE_URL}icons`;

  dados.estacoes.forEach((est) => {
    const item = document.createElement("div");
    item.className = `item ${(est.conexoes?.length ?? 0) > 0 ? "has-transfer" : ""}`;
    item.style.setProperty("--line-color", dados.cor);

    const isDestaque     = est.destaqueSecundario === true;
    const nomePrincipal  = est.nomePrincipal ?? est.primary ?? "";
    const nomeSecundario = est.nomeSecundario ?? est.secondary;

    const nameHTML = `
      <div class="station-name-wrapper">
        <span class="name-main ${isDestaque ? "is-not-main" : ""}">${nomePrincipal}</span>
        ${nomeSecundario
          ? `<span class="name-secondary ${isDestaque ? "is-highlight" : ""}">${nomeSecundario}</span>`
          : ""}
      </div>
    `;

    let pillsHTML = '<div class="transfer-pills">';
    est.conexoes?.forEach((con) => {
      const iconName = con.icone ?? (con.linha ? getIconFileName(con.linha) : "default.png");
      const iconPath = `${iconBase}/${iconName}`;

      let ballHTML = "";
      if (con.linha && con.cor) {
        const textColor      = (con.linha === "L04" || con.linha === "L13") ? "#000" : "#fff";
        const numeroExibicao = con.linha.replace("L", "");
        ballHTML = `
          <div class="line-ball" style="background-color: ${con.cor}; color: ${textColor};">
            ${numeroExibicao}
          </div>`;
      }

      pillsHTML += `
        <div class="transfer-pill-custom">
          <img src="${iconPath}" class="operator-img" alt="${con.nome ?? "logo"}">
          ${ballHTML}
        </div>
      `;
    });
    pillsHTML += "</div>";

    item.innerHTML = `${nameHTML}${pillsHTML}`;
    wrapper.appendChild(item);
  });
}

// ===============================
// NAVEGADOR DE LINHAS (GRID PAGINADO)
// ===============================
function renderLineSwitcher(currentLinhaId: string, dadosLinhas: DadosLinhas): void {
  const grid      = document.getElementById("line-switcher-grid");
  const btnPrev   = document.getElementById("arrow-prev") as HTMLButtonElement | null;
  const btnNext   = document.getElementById("arrow-next") as HTMLButtonElement | null;
  const indicator = document.getElementById("page-indicator");
  if (!grid || !btnPrev || !btnNext || !indicator) return;

  const detalhesPath = `${BASE_URL}detalhes`;
  const getPageSize  = () => window.innerWidth <= 768 ? 3 : 6;

  const entries    = Object.entries(dadosLinhas);
  let pageSize     = getPageSize();
  let totalPages   = Math.ceil(entries.length / pageSize);
  const activeIndex = entries.findIndex(([id]) => id === currentLinhaId);
  let currentPage  = Math.floor(activeIndex / pageSize);

  function buildPills(page: number): void {
    pageSize   = getPageSize();
    totalPages = Math.ceil(entries.length / pageSize);
    currentPage = Math.min(page, totalPages - 1);

    const start = currentPage * pageSize;
    const slice = entries.slice(start, start + pageSize);

    grid!.innerHTML = "";

    slice.forEach(([id, linha]) => {
      const pill = document.createElement("a");
      pill.className = `line-pill${id === currentLinhaId ? " is-active" : ""}`;
      pill.style.setProperty("--pill-color", linha.cor);
      if (id !== currentLinhaId) pill.href = `${detalhesPath}?linha=${id}`;
      pill.innerHTML = `
        <span class="pill-dot" style="background:${linha.cor};"></span>
        <span class="pill-name">${linha.nome}</span>
      `;
      grid!.appendChild(pill);
    });

    // Células vazias para manter o grid alinhado
    const remainder = pageSize - slice.length;
    for (let i = 0; i < remainder; i++) {
      const empty = document.createElement("div");
      empty.className  = "line-pill-empty";
      empty.style.cssText = "visibility:hidden;";
      grid!.appendChild(empty);
    }

    indicator!.textContent  = `${currentPage + 1} / ${totalPages}`;
    btnPrev!.disabled = currentPage === 0;
    btnNext!.disabled = currentPage >= totalPages - 1;
  }

  function goTo(page: number): void {
    grid!.classList.add("page-exit");
    setTimeout(() => {
      grid!.classList.remove("page-exit");
      buildPills(page);
      grid!.classList.add("page-enter");
      setTimeout(() => grid!.classList.remove("page-enter"), 200);
    }, 150);
  }

  btnPrev.addEventListener("click", () => { if (currentPage > 0) goTo(--currentPage); });
  btnNext.addEventListener("click", () => { if (currentPage < totalPages - 1) goTo(++currentPage); });

  window.addEventListener("resize", () => {
    const newSize = getPageSize();
    if (newSize !== pageSize) {
      currentPage = Math.floor(activeIndex / newSize);
      buildPills(currentPage);
    }
  });

  buildPills(currentPage);
}