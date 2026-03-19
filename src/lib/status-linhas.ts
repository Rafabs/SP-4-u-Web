// src/lib/status-linhas.ts
const BASE_URL = ((window as any).__BASE_URL__ ?? "").replace(/\/$/, "");
const IS_LOCAL = window.location.hostname === "localhost";
const JSON_URL = `${BASE_URL}/data/status-linhas.json`;
const MANIFEST = `${BASE_URL}/data/status-manifest.json`;
const PROXY_URL =
  "https://corsproxy.io/?" +
  encodeURIComponent(
    "https://ccm.artesp.sp.gov.br/metroferroviario/api/status/",
  );

const INTERVAL_MS = IS_LOCAL
  ? 5 * 60 * 1000 // local: 5 min (API direto via proxy, dados frescos)
  : 10 * 60 * 1000; // produção: 10 min (sincronizado com o Actions)

interface StatusLinha {
  situacao: string;
  classificacao: string;
  operacao_normal: boolean;
  atualizado_ha: string;
  atualizado_em?: string;
  descricao?: string;
}
interface LinhaAPI {
  codigo: string;
  nome: string;
  status: StatusLinha;
}
interface EmpresaAPI {
  linhas: LinhaAPI[];
}
interface APIResponse {
  meta?: { timestamp?: string };
  empresas: EmpresaAPI[];
}

function codigoFromId(id: string): string {
  return String(parseInt(id.replace("L", ""), 10));
}

function cssClass(situacao: string): string {
  const s = situacao.toLowerCase();
  if (s.includes("normal")) 
    return "verde_operacao_normal";
  if (s.includes("velocidade") || 
      s.includes("impacto") ||
      s.includes("atividade"))                                
    return "amarelo_velocidade_reduzida";
  if (
    s.includes("paralisada") ||
    s.includes("interrompida"))
    return "vermelho_paralisada";
  return "branco_dados_indisponiveis";
}

async function fetchData(): Promise<APIResponse> {
  if (IS_LOCAL) {
    // Local: usa corsproxy.io para contornar CORS
    const res = await fetch(PROXY_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // Produção: busca manifesto sem cache para obter timestamp atual
  const manifestRes = await fetch(`${MANIFEST}?t=${Date.now()}`);
  const { t } = await manifestRes.json();

  // Usa o timestamp do manifesto como cache-bust no JSON principal
  const res = await fetch(`${JSON_URL}?t=${t}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function applyStatus(data: APIResponse): void {
  const statusMap = new Map<string, StatusLinha>();
  data.empresas.forEach((e) =>
    e.linhas.forEach((l) => {
      if (l.status) statusMap.set(l.codigo, l.status);
    }),
  );

  document.querySelectorAll<HTMLElement>("[id$='-info']").forEach((card) => {
    const baseId = card.id.replace("-info", "").toUpperCase();
    const status = statusMap.get(codigoFromId(baseId));

    card.className = `card ${status ? cssClass(status.situacao) : "branco_dados_indisponiveis"}`;
    card.textContent = status ? status.situacao : "Sem dados";

    if (status?.descricao) {
      card.title = status.descricao;
      card.style.cursor = "help";
    } else {
      card.removeAttribute("title");
      card.style.cursor = "";
    }
  });

  // Última atualização — usa timestamp do meta do JSON carregado
  const ultimaAtualizacao = document.getElementById("ultima-atualizacao");
  if (ultimaAtualizacao && data.meta?.timestamp) {
    const dt = new Date(data.meta.timestamp);
    const formatado = dt.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
      card.className = "card branco_dados_indisponiveis";
      card.textContent = "Indisponível";
    });
  }
}

export function loadStatusLinhas(): void {
  console.log("[Status] Iniciando — polling a cada 5 min");
  update();
  setInterval(() => {
    console.log("[Status] Atualizando...");
    update();
  }, INTERVAL_MS);
}
