// src/lib/status-linhas.ts
const BASE_URL = ((window as any).__BASE_URL__ ?? "").replace(/\/$/, "");
const IS_LOCAL = window.location.hostname === "localhost";
const JSON_URL = `${BASE_URL}/data/status-linhas.json`;
const MANIFEST = `${BASE_URL}/data/status-manifest.json`;
const PROXY_URL =
  "https://corsproxy.io/?" +
  encodeURIComponent("https://ccm.artesp.sp.gov.br/metroferroviario/api/status/");

const INTERVAL_MS = IS_LOCAL ? 5 * 60 * 1000 : 10 * 60 * 1000;

interface StatusLinha {
  situacao: string;
  classificacao: string;
  operacao_normal: boolean;
  atualizado_ha: string;
  atualizado_em?: string;
  descricao?: string;
}
interface LinhaAPI   { codigo: string; nome: string; status: StatusLinha; }
interface EmpresaAPI { linhas: LinhaAPI[]; }
interface APIResponse {
  meta?: { timestamp?: string };
  empresas: EmpresaAPI[];
}

function codigoFromId(id: string): string {
  return String(parseInt(id.replace("L", ""), 10));
}

function cssClass(situacao: string): string {
  const s = situacao.toLowerCase();
  if (s.includes("normal") || s.includes("especial"))
    return "verde_operacao_normal";
  if (s.includes("velocidade") || s.includes("impacto") ||
      s.includes("atividade") || s.includes("parcial") || s.includes("maiores"))
    return "amarelo_velocidade_reduzida";
  if (s.includes("paralisada") || s.includes("interrompida"))
    return "vermelho_paralisada";
  return "branco_dados_indisponiveis";
}

// ── Modal de descrição ──
function setupModal(): void {
  if (document.getElementById("status-modal")) return;

  const overlay = document.createElement("div");
  overlay.id = "status-modal";
  overlay.innerHTML = `
    <div class="status-modal-box">
      <div class="status-modal-header">
        <span class="status-modal-linha" id="modal-linha-nome"></span>
        <button class="status-modal-close" id="modal-close" aria-label="Fechar">✕</button>
      </div>
      <div class="status-modal-badge" id="modal-badge"></div>
      <p class="status-modal-desc" id="modal-desc"></p>
      <p class="status-modal-update" id="modal-update"></p>
    </div>
  `;

  // --- ADICIONE OS EVENTOS AQUI DENTRO ---
  
  // 1. Fechar ao clicar no X
  overlay.querySelector("#modal-close")?.addEventListener("click", (e) => {
    e.stopPropagation(); // Evita conflitos com o clique no overlay
    closeModal();
  });

  // 2. Fechar ao clicar no fundo (overlay)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  // 3. Fechar com a tecla ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  document.body.appendChild(overlay);
}

function openModal(linhaNome: string, status: StatusLinha): void {
  const overlay = document.getElementById("status-modal");
  const nome    = document.getElementById("modal-linha-nome");
  const badge   = document.getElementById("modal-badge");
  const desc    = document.getElementById("modal-desc");
  const update  = document.getElementById("modal-update");
  if (!overlay || !nome || !badge || !desc || !update) return;

  nome.textContent  = linhaNome;
  badge.textContent = status.situacao;
  badge.className   = `status-modal-badge ${cssClass(status.situacao)}`;
  desc.textContent  = status.descricao || "Nenhuma descrição adicional disponível.";

  overlay.classList.add("is-open");
}

function closeModal(): void {
  document.getElementById("status-modal")?.classList.remove("is-open");
}

async function fetchData(): Promise<APIResponse> {
  if (IS_LOCAL) {
    const res = await fetch(PROXY_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
  const manifestRes = await fetch(`${MANIFEST}?t=${Date.now()}`);
  const { t } = await manifestRes.json();
  const res = await fetch(`${JSON_URL}?t=${t}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function applyStatus(data: APIResponse): void {
  const statusMap  = new Map<string, StatusLinha>();
  const nomeMap    = new Map<string, string>();

  data.empresas.forEach((e) =>
    e.linhas.forEach((l) => {
      if (l.status) {
        statusMap.set(l.codigo, l.status);
        nomeMap.set(l.codigo, l.nome);
      }
    })
  );

  document.querySelectorAll<HTMLElement>("[id$='-info']").forEach((card) => {
    const baseId = card.id.replace("-info", "").toUpperCase();
    const codigo = codigoFromId(baseId);
    const status = statusMap.get(codigo);
    const nome   = nomeMap.get(codigo) ?? baseId;

    card.className   = `card ${status ? cssClass(status.situacao) : "branco_dados_indisponiveis"}`;
    card.textContent = status ? status.situacao : "Sem dados";
    card.removeAttribute("title");

    // Só abre modal se houver descrição
    if (status?.descricao) {
      card.style.cursor = "pointer";
      card.onclick = () => openModal(nome, status);
    } else {
      card.style.cursor = "";
      card.onclick = null;
    }
  });

  const ultimaAtualizacao = document.getElementById("ultima-atualizacao");
  if (ultimaAtualizacao && data.meta?.timestamp) {
    const dt = new Date(data.meta.timestamp);
    const formatado = dt.toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    ultimaAtualizacao.textContent = `Atualizado em ${formatado}`;
  }
}

async function update(): Promise<void> {
  try {
    const data = await fetchData();
    applyStatus(data);
  } catch (err) {
    console.warn("[Status] Erro ao atualizar:", err);
    document.querySelectorAll<HTMLElement>("[id$='-info']").forEach((card) => {
      card.className   = "card branco_dados_indisponiveis";
      card.textContent = "Indisponível";
    });
  }
}

export function loadStatusLinhas(): void {
  setupModal();
  update();
  setInterval(update, INTERVAL_MS);
}