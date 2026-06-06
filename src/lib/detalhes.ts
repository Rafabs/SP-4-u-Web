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
  tipo?: string;
  operadora?: string;
}

interface Estacao {
  nomePrincipal?: string;
  primary?: string;
  nomeSecundario?: string;
  secondary?: string;
  destaqueSecundario?: boolean;
  acesso_livre?: boolean;  
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
  L06: "6_laranja.png",
  L07: "tictrens.png",
  L08: "8_diamante.png",
  L09: "9_esmeralda.png",
  L10: "cptm.png",
  L11: "cptm.png",
  L12: "cptm.png",
  L13: "cptm.png",
  L15: "15_prata.png",
  L17: "1_azul.png",
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

        // adiciona botão de legenda com base nas conexões
        renderLegendButton(dados);

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
// LEGENDA (TIPOS DE CONEXÃO)
// ===============================
function renderLegendButton(dados: DadosLinha): void {
  // evita múltiplos botões em re-renders
  if (document.getElementById("btn-legend")) return;

  const backBtn = document.querySelector(".btn-back") as HTMLElement | null;
  // se não encontrar o botão de voltar, adiciona no body como fallback
  const insertAfterEl = backBtn ? (backBtn.closest("a") ?? backBtn) : null;

  const btn = document.createElement("button");
  btn.id = "btn-legend";
  btn.className = "btn-legend";
  btn.textContent = "Legenda";
  btn.style.cssText = "margin-left:8px;padding:8px 12px;border-radius:6px;background:#eee;color:#111;border:1px solid #ccc;cursor:pointer;";

  const panel = document.createElement("div");
  panel.id = "legend-panel";
  panel.style.cssText = "position:fixed;z-index:9999;max-width:360px;max-height:60vh;overflow:auto;padding:12px;background:#fff;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.15);display:none;color:#111;font-size:14px;";

  // informações adicionais estáticas para algumas linhas (sobrescreve/completa conexões)
  const LINE_INFO: Record<string, { cor?: string; operadora?: string; nomeLinha?: string }> = {
    L04: { cor: "#FFF000", operadora: "ViaQuatro", nomeLinha: "Linha 4 - Amarela" },
    L10: { cor: "#0088B0", operadora: "CPTM", nomeLinha: "Linha 10 - Turquesa" },
    L11: { cor: "#F04E23", operadora: "CPTM", nomeLinha: "Linha 11 - Coral" },
    L13: { cor: "#00B352", operadora: "CPTM", nomeLinha: "Linha 13 - Jade" },
  };

  // agrupa conexões em categorias mantendo o padrão desejado
  const servicos: Record<string, { icone?: string; operadora?: string; stations: string[] }> = {};
  const linhas: Record<string, { cor?: string; operadora?: string; nomeLinha?: string; stations: string[] }> = {};
  const outros: Record<string, { info: Conexao; stations: string[] }> = {};

  dados.estacoes.forEach((est) => {
    const stationName = est.nomePrincipal ?? est.primary ?? "";
    (est.conexoes ?? []).forEach((con) => {
      if (con.linha) {
        const id = con.linha;
        const info = LINE_INFO[id];
        // aceita propriedades vindas do JSON com nomes variantes: "nome-linha", "nome_linha", ou "nome"
        const nameFromCon = (con as any)["nome-linha"] ?? (con as any)["nome_linha"] ?? con.nome;
        if (!linhas[id]) linhas[id] = { cor: con.cor ?? info?.cor, operadora: con.operadora ?? info?.operadora, nomeLinha: nameFromCon ?? info?.nomeLinha, stations: [] };
        if (!linhas[id].cor && info?.cor) linhas[id].cor = info.cor;
        if (!linhas[id].operadora && info?.operadora) linhas[id].operadora = info.operadora;
        if (!linhas[id].nomeLinha && (nameFromCon ?? info?.nomeLinha)) linhas[id].nomeLinha = nameFromCon ?? info?.nomeLinha;
        if (!linhas[id].stations.includes(stationName)) linhas[id].stations.push(stationName);
      
      } else if ((con as Conexao).tipo === "servico" || con.icone || con.nome) {
        const key = con.nome ?? `servico-${con.icone ?? "unknown"}`;
        if (!servicos[key]) servicos[key] = { icone: con.icone, operadora: (con as any).operadora ?? con.operadora, stations: [] };
        // preenche operadora caso venha em outra estação/objeto
        if (!servicos[key].operadora && ((con as any).operadora ?? con.operadora)) servicos[key].operadora = (con as any).operadora ?? con.operadora;
        if (!servicos[key].stations.includes(stationName)) servicos[key].stations.push(stationName);
      } else {
        const key = JSON.stringify(con);
        if (!outros[key]) outros[key] = { info: con, stations: [] };
        if (!outros[key].stations.includes(stationName)) outros[key].stations.push(stationName);
      }
    });
  });

  const title = document.createElement("div");
  title.style.cssText = "font-weight:600;margin-bottom:8px;";
  title.textContent = "Legenda — Conexões nesta linha";
  panel.appendChild(title);

  // busca descrições adicionais em public/legenda-conexoes.json
  (async () => {
    let descrs: Record<string, { titulo?: string; descricao?: string }> = {};
    try {
      const resp = await fetch(`${BASE_URL}legenda-conexoes.json`);
      if (resp.ok) descrs = await resp.json();
    } catch (err) {
      console.warn("Não foi possível carregar legenda-conexoes.json", err);
    }

    if (Object.keys(servicos).length === 0 && Object.keys(linhas).length === 0 && Object.keys(outros).length === 0) {
      const empty = document.createElement("div");
      empty.textContent = "Nenhuma conexão encontrada nesta linha.";
      panel.appendChild(empty);
      return;
    }

    // Serviços (tipo: servico)
      if (Object.keys(servicos).length > 0) {
      const secTitle = document.createElement("div");
      secTitle.style.cssText = "font-weight:600;margin-top:6px;margin-bottom:6px;";
      secTitle.textContent = descrs["servico"]?.titulo ?? "Serviços";
      panel.appendChild(secTitle);

        const servEntries = Object.entries(servicos).sort((a, b) => a[0].localeCompare(b[0]));
        servEntries.forEach(([key, v]) => {
        const row = document.createElement("div");
        row.style.cssText = "display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #f0f0f0;";
        const img = document.createElement("img");
        img.src = v.icone ? `${BASE_URL}icons/${v.icone}` : `${BASE_URL}icons/default.png`;
        img.alt = key;
        img.style.cssText = "width:28px;height:20px;object-fit:contain;";
        const txt = document.createElement("div");
        const operatorText = v.operadora ?? "";
        txt.innerHTML = `<div style=\"font-weight:600;\">${key}</div><div style=\"color:#444;font-size:13px;\">${operatorText ? `Empresa: ${operatorText}` : ""}</div>`;
        row.appendChild(img);
        row.appendChild(txt);
        panel.appendChild(row);
      });
    }

    // Linhas (conexões com outras linhas)
      if (Object.keys(linhas).length > 0) {
      const secTitle = document.createElement("div");
      secTitle.style.cssText = "font-weight:600;margin-top:8px;margin-bottom:6px;";
      secTitle.textContent = descrs["linha"]?.titulo ?? "Linhas";
      panel.appendChild(secTitle);

        const lineEntries = Object.entries(linhas).sort((a, b) => {
          const na = parseInt(a[0].replace(/\D/g, ""), 10) || 0;
          const nb = parseInt(b[0].replace(/\D/g, ""), 10) || 0;
          if (na !== nb) return na - nb;
          return a[0].localeCompare(b[0]);
        });

        lineEntries.forEach(([id, v]) => {
        const row = document.createElement("div");
        row.style.cssText = "display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #f7f7f7;";

        // logo da linha (quando disponível)
        const imgLogo = document.createElement("img");
        imgLogo.src = `${BASE_URL}icons/${getIconFileName(id)}`;
        imgLogo.alt = id;
        imgLogo.style.cssText = "width:28px;height:20px;object-fit:contain;";

        const ball = document.createElement("div");
        ball.style.cssText = `width:28px;height:20px;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;`;
        ball.style.backgroundColor = v.cor ?? "#666";
        // cor do texto em linhas claras
        if (v.cor && (v.cor.toLowerCase() === "#fff000" || v.cor.toLowerCase() === "#c0c0c0")) {
          ball.style.color = "#000";
        }
        ball.textContent = id.replace("L", "");

        const txt = document.createElement("div");
        const displayTitle = v.nomeLinha ?? `${id} — ${v.operadora ?? "Operadora"}`;
        const operatorText = v.operadora ?? (LINE_INFO[id]?.operadora ?? "Operadora");
        txt.innerHTML = `<div style=\"font-weight:600;\">${displayTitle}</div><div style=\"color:#444;font-size:13px;\">${operatorText}</div>`;

        row.appendChild(imgLogo);
        row.appendChild(ball);
        row.appendChild(txt);
        panel.appendChild(row);
      });
    }

    // Outros
    if (Object.keys(outros).length > 0) {
      const secTitle = document.createElement("div");
      secTitle.style.cssText = "font-weight:600;margin-top:8px;margin-bottom:6px;";
      secTitle.textContent = descrs["outro"]?.titulo ?? "Outros";
      panel.appendChild(secTitle);
      const outrosEntries = Object.entries(outros).sort((a, b) => {
        const na = (a[1].info && ((a[1].info as any).nome)) ? String((a[1].info as any).nome) : a[0];
        const nb = (b[1].info && ((b[1].info as any).nome)) ? String((b[1].info as any).nome) : b[0];
        return na.localeCompare(nb);
      });

      outrosEntries.forEach(([k, v]) => {
        const info = v.info;
        const row = document.createElement("div");
        row.style.cssText = "display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #f7f7f7;";
        const txt = document.createElement("div");
        txt.innerHTML = `<div style=\"font-weight:600;\">${info.nome ?? JSON.stringify(info)}</div><div style=\"color:#444;font-size:13px;\">${v.stations.join(', ')}</div>`;
        row.appendChild(txt);
        panel.appendChild(row);
      });
    }
  })();

  // detecta viewport móvel para posicionamento mais confiável
  const isMobile = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width:700px)").matches;

  // (mantemos o botão na posição original; apenas o painel será centralizado em mobile)

  // fechar ao clicar fora
  document.addEventListener("click", (ev) => {
    const target = ev.target as HTMLElement;
    if (!target) return;
    if (target.id === "btn-legend" || panel.contains(target)) return;
    panel.style.display = "none";
  });

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    // posiciona o painel: em mobile usa fixed no canto inferior direito
    if (isMobile) {
      panel.style.position = "fixed";
      panel.style.left = "50%";
      panel.style.top = "50%";
      panel.style.transform = "translate(-50%, -50%)";
      panel.style.width = "min(92vw,360px)";
      panel.style.maxHeight = "80vh";
      panel.style.right = "";
      panel.style.bottom = "";
    } else if (insertAfterEl instanceof Element) {
      const rect = (insertAfterEl as Element).getBoundingClientRect();
      // tenta colocar o painel acima do botão
      panel.style.left = `${Math.max(12, rect.left)}px`;
      panel.style.top  = `${Math.max(12, rect.top - rect.height - 12)}px`;
      panel.style.position = "absolute";
      panel.style.transform = "";
      panel.style.right = "";
      panel.style.bottom = "";
    } else {
      // fallback desktop: fixed no canto inferior direito
      panel.style.position = "fixed";
      panel.style.right = "18px";
      panel.style.bottom = "68px";
      panel.style.transform = "";
    }
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  });

  if (insertAfterEl && insertAfterEl.parentElement) {
    // insere o botão logo após o elemento existente
    insertAfterEl.parentElement.insertBefore(btn, insertAfterEl.nextSibling);
  } else {
    document.body.appendChild(btn);
  }
  document.body.appendChild(panel);
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

    const isFree = est.acesso_livre === true;
    item.className = `item ${(est.conexoes?.length ?? 0) > 0 ? "has-transfer" : ""} ${isFree ? "is-free-access" : ""}`;
    
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