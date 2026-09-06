const BASE_URL = ((window as unknown as { __BASE_URL__?: string }).__BASE_URL__ ?? "").replace(/\/$/, "");
const IS_LOCAL = window.location.hostname === "localhost";

const JSON_URL = `${BASE_URL}/data/status-linhas.json`;
const MANIFEST = `${BASE_URL}/data/status-manifest.json`;

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

const STALE_THRESHOLD_MS = 20 * 60 * 1000; // 20 minutos

function cssClass(situacao: string): string {
  const s = situacao.toLowerCase();
  if (s.includes("normal") || s.includes("especial") || s.includes("transitoria"))
    return "verde_operacao_normal";
  if (s.includes("velocidade") || s.includes("impacto") ||
      s.includes("atividade") || s.includes("parcial") || s.includes("maiores") || s.includes("circulação"))
    return "amarelo_velocidade_reduzida";
  if (s.includes("paralisada") || s.includes("interrompida"))
    return "vermelho_paralisada";
  return "branco_dados_indisponiveis";
}

function formatPtBrDateTime(value: string): string | null {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "America/Sao_Paulo"
  });
}

function createStatusUpdateLabel(timestamp?: string): string {
  if (!timestamp) return "";
  const formatted = formatPtBrDateTime(timestamp) ?? timestamp;
  const ageMs = Date.now() - new Date(timestamp).getTime();
  const staleNote = ageMs > STALE_THRESHOLD_MS ? " (Algumas informações podem estar desatualizadas)" : "";
  return `Atualizado em ${formatted}${staleNote}`;
}

function isDataFresh(timestamp?: string): boolean {
  if (!timestamp) return false;
  const updatedAt = new Date(timestamp).getTime();
  return !Number.isNaN(updatedAt) && Date.now() - updatedAt <= STALE_THRESHOLD_MS;
}

function setUpdateHealth(isHealthy: boolean): void {
  const dot = document.getElementById("status-atualizacao-dot");
  if (!dot) return;

  dot.classList.toggle("is-healthy", isHealthy);
  dot.classList.toggle("is-unhealthy", !isHealthy);
}

function handleEscKey(e: KeyboardEvent): void {
  if (e.key === "Escape") closeModal();
}

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

  overlay.querySelector("#modal-close")?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeModal();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
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
  update.textContent = status.atualizado_em
    ? `Atualizado em: ${formatPtBrDateTime(status.atualizado_em) ?? status.atualizado_em}`
    : "";

  overlay.classList.add("is-open");

  document.addEventListener("keydown", handleEscKey);
}

function closeModal(): void {
  document.getElementById("status-modal")?.classList.remove("is-open");
  document.removeEventListener("keydown", handleEscKey);
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 7000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function fetchData(): Promise<APIResponse> {
  // 🔥 LOCALHOST → usa o JSON local (sem proxy)
  if (IS_LOCAL) {
    const res = await fetchWithTimeout(`${JSON_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // 🔥 PRODUÇÃO → usa manifest + JSON local
  const manifestRes = await fetchWithTimeout(`${MANIFEST}?t=${Date.now()}`);
  const { t } = await manifestRes.json();

  const res = await fetchWithTimeout(`${JSON_URL}?t=${t}`);
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

  document.querySelectorAll<HTMLElement>("[id$='-info']:not(#dynamic-systems-info)")
    .forEach((card) => {
      const baseId = card.id.replace("-info", "").toUpperCase();
      const codigo = codigoFromId(baseId);
      const status = statusMap.get(codigo);
      const nome   = nomeMap.get(codigo) ?? baseId;

      card.className   = `card ${status ? cssClass(status.situacao) : "branco_dados_indisponiveis"}`;
      card.textContent = status ? status.situacao : "Sem dados";
      card.removeAttribute("title");

      if (status?.descricao) {
        card.style.cursor = "pointer";
        card.onclick = null; 
        card.onclick = () => openModal(nome, status);
      } else {
        card.style.cursor = "";
        card.onclick = null;
      }
    });

  const ultimaAtualizacao = document.getElementById("ultima-atualizacao");
  if (ultimaAtualizacao) {
    ultimaAtualizacao.textContent = createStatusUpdateLabel(data.meta?.timestamp);
  }

  setUpdateHealth(isDataFresh(data.meta?.timestamp));
}

async function update(): Promise<void> {
  try {
    const data = await fetchData();
    applyStatus(data);
  } catch (err) {
    console.warn("[Status] Erro ao atualizar:", err);
    document.querySelectorAll<HTMLElement>("[id$='-info']:not(#dynamic-systems-info)")
      .forEach((card) => {
        card.className   = "card branco_dados_indisponiveis";
        card.textContent = "Indisponível";
        card.onclick = null;
        card.style.cursor = "";
      });

    const ultimaAtualizacao = document.getElementById("ultima-atualizacao");
    if (ultimaAtualizacao) {
      ultimaAtualizacao.textContent = "Falha ao atualizar o status das linhas";
    }
    setUpdateHealth(false);
  }
}

export function loadStatusLinhas(): void {
  setupModal();
  update();
  setInterval(() => {
    if (document.visibilityState === "visible") {
      update();
    }
  }, INTERVAL_MS);
}
