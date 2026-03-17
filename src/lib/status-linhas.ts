// src/lib/status-linhas.ts
const BASE_URL   = ((window as any).__BASE_URL__ ?? "").replace(/\/$/, "");
const IS_LOCAL   = window.location.hostname === "localhost";
const JSON_URL   = `${BASE_URL}/data/status-linhas.json`;
const PROXY_URL  = "https://api.allorigins.win/get?url=" +
                   encodeURIComponent("https://ccm.artesp.sp.gov.br/metroferroviario/api/status/");

const INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

interface StatusLinha {
  situacao: string;
  classificacao: string;
  operacao_normal: boolean;
  atualizado_ha: string;
  descricao?: string;
}
interface LinhaAPI    { codigo: string; nome: string; status: StatusLinha; }
interface EmpresaAPI  { linhas: LinhaAPI[]; }
interface APIResponse {
  meta?: { timestamp?: string };
  empresas: EmpresaAPI[];
}

function codigoFromId(id: string): string {
  return String(parseInt(id.replace("L", ""), 10));
}

function cssClass(situacao: string): string {
  const s = situacao.toLowerCase();
  if (s.includes("normal"))                                                                return "verde_operacao_normal";
  if (s.includes("velocidade"))                                                            return "amarelo_velocidade_reduzida";
  if (s.includes("paralisada") || s.includes("interrompida") || s.includes("encerrada")) return "vermelho_paralisada";
  return "branco_dados_indisponiveis";
}

async function fetchData(): Promise<APIResponse> {
  if (IS_LOCAL) {
    // Local: usa proxy allorigins para contornar CORS
    const res  = await fetch(PROXY_URL);
    const json = await res.json();
    return JSON.parse(json.contents) as APIResponse;
  }
  // Produção: JSON estático gerado pelo Actions
  const res = await fetch(`${JSON_URL}?t=${Date.now()}`); // cache-bust
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function applyStatus(data: APIResponse): void {
  const statusMap = new Map<string, StatusLinha>();
  data.empresas.forEach(e => e.linhas.forEach(l => {
    if (l.status) statusMap.set(l.codigo, l.status);
  }));

  document.querySelectorAll<HTMLElement>("[id$='-info']").forEach(card => {
    const baseId = card.id.replace("-info", "").toUpperCase();
    const status = statusMap.get(codigoFromId(baseId));

    card.className   = `card ${status ? cssClass(status.situacao) : "branco_dados_indisponiveis"}`;
    card.textContent = status ? status.situacao : "Sem dados";

    if (status?.descricao) {
      card.title        = status.descricao;
      card.style.cursor = "help";
    } else {
      card.removeAttribute("title");
      card.style.cursor = "";
    }
  });

  // Última atualização
  const ultimaAtualizacao = document.getElementById("ultima-atualizacao");
  if (ultimaAtualizacao) {
    const ts = data.meta?.timestamp ?? new Date().toISOString();
    const dt = new Date(ts);
    const formatado = dt.toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    ultimaAtualizacao.textContent = `atualizado em ${formatado}`;
  }
}

async function update(): Promise<void> {
  try {
    const data = await fetchData();
    applyStatus(data);
  } catch (err) {
    console.warn("[Status] Erro ao atualizar:", err);
    document.querySelectorAll<HTMLElement>("[id$='-info']").forEach(card => {
      card.className   = "card branco_dados_indisponiveis";
      card.textContent = "Indisponível";
    });
  }
}

export function loadStatusLinhas(): void {
  update(); // executa imediatamente
  setInterval(update, INTERVAL_MS); // repete a cada 5 min
}