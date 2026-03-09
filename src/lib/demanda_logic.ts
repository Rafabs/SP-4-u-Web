import Papa from "papaparse";
import {
  Chart,
  LineController,
  BarController,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

// Registra apenas os componentes usados — tree-shaking eficiente
Chart.register(
  LineController,
  BarController,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend
);

// ===============================
// CONFIGURAÇÃO
// ===============================
const BASE_URL = import.meta.env.BASE_URL ?? "";

// ===============================
// TIPOS
// ===============================
interface LinhaOption {
  id: string;
  label: string;
}

interface TrendData {
  trend: (number | null)[];
  mediaAnual: number;
}

interface EstacaoRanking {
  nome: string;
  media: number;
}

// ===============================
// CONSTANTES
// ===============================
const ANOS = ["2025", "2024", "2023", "2022", "2021", "2020"];

const LINHAS: LinhaOption[] = [
  { id: "LINHA 1-AZUL",     label: "Linha 1 - Azul"    },
  { id: "LINHA 2-VERDE",    label: "Linha 2 - Verde"   },
  { id: "LINHA 3-VERMELHA", label: "Linha 3 - Vermelha"},
  { id: "LINHA 15-PRATA",   label: "Linha 15 - Prata"  },
];

const MESES_LABEL = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const MESES_REF   = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

const LINE_COLORS: Record<string, string> = {
  "1-AZUL":     "#00549f",
  "2-VERDE":    "#008061",
  "3-VERMELHA": "#ef4135",
  "15-PRATA":   "#808080",
};

// ===============================
// ESTADO
// ===============================
const charts: { trend?: Chart; rank?: Chart } = {};

// ===============================
// INICIALIZAÇÃO
// ===============================
export function initDemanda(): void {
  const anoSel   = document.getElementById("ano-filter")   as HTMLSelectElement | null;
  const linhaSel = document.getElementById("linha-filter") as HTMLSelectElement | null;
  if (!anoSel || !linhaSel) return;

  // Popula selects uma única vez
  if (anoSel.options.length === 0) {
    ANOS.forEach((ano) => anoSel.add(new Option(ano, ano)));
  }
  if (linhaSel.options.length === 0) {
    LINHAS.forEach((l) => linhaSel.add(new Option(l.label, l.id)));
  }

  anoSel.addEventListener("change", loadAllData);
  linhaSel.addEventListener("change", loadAllData);

  loadAllData();
}

// ===============================
// CARREGAMENTO DE DADOS
// ===============================
async function loadAllData(): Promise<void> {
  const ano     = (document.getElementById("ano-filter")   as HTMLSelectElement).value;
  const linhaId = (document.getElementById("linha-filter") as HTMLSelectElement).value;

  const pathLeve   = `${BASE_URL}/data/Passageiros Transportados por Linha - ${ano}.csv`;
  const pathPesado = `${BASE_URL}/data/Entrada de Passageiros por Estação - Diária - ${ano}.csv`;

  // Carrega os dois CSVs em paralelo — antes era sequencial (callback dentro de callback)
  const [resLeve, resPesado] = await Promise.all([
    parseCsv(pathLeve),
    parseCsv(pathPesado),
  ]);

  const globalData = processLeve(resLeve, linhaId);
  const ranking    = processRanking(resPesado, linhaId);

  updateUI(globalData, ranking, linhaId);
}

// Wrapper para Papa.parse com Promise
function parseCsv(path: string): Promise<string[][]> {
  return new Promise((resolve) => {
    Papa.parse(path, {
      download: true,
      header: false,
      delimiter: ";",
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<string[]>) => resolve(results.data),
      error: () => resolve([]),
    });
  });
}

// ===============================
// PROCESSAMENTO
// ===============================
function processLeve(rows: string[][], linhaBusca: string): TrendData {
  let trend: (number | null)[] = new Array(12).fill(null);
  let mduSoma = 0;
  let mesesContados = 0;

  let colStart = 0;
  if (linhaBusca.includes("2-VERDE"))    colStart = 7;
  else if (linhaBusca.includes("3-VERMELHA")) colStart = 14;
  else if (linhaBusca.includes("15-PRATA"))   colStart = 21;

  rows.forEach((row, index) => {
    if (index < 5) return;
    const celulaMes = row[colStart]?.toString().toUpperCase() ?? "";
    const mesIdx    = MESES_REF.findIndex((m) => celulaMes.startsWith(m));

    if (mesIdx !== -1) {
      const mduRaw = row[colStart + 2];
      if (mduRaw && mduRaw.trim() !== "" && mduRaw !== "0") {
        const mduValor = parseFloat(mduRaw.replace(/\./g, "").replace(",", ".")) * 1000;
        if (!isNaN(mduValor)) {
          trend[mesIdx] = mduValor;
          mduSoma += mduValor;
          mesesContados++;
        }
      }
    }
  });

  return {
    trend,
    mediaAnual: mesesContados > 0 ? mduSoma / mesesContados : 0,
  };
}

function processRanking(rows: string[][], linhaBusca: string): EstacaoRanking[] {
  const estacoesMap: Record<string, { soma: number; count: number }> = {};
  let colStart = -1;
  const linhaLimpa = linhaBusca.split("-")[0].replace("LINHA ", "").trim();

  for (let i = 0; i < 15; i++) {
    if (!rows[i]) continue;
    const idx = rows[i].findIndex((c) => c?.toUpperCase().includes("LINHA " + linhaLimpa));
    if (idx !== -1) { colStart = idx; break; }
  }

  if (colStart === -1) return [];

  let nomesEstacoes: { nome: string; idx: number }[] = [];

  rows.forEach((row) => {
    const cell = row[colStart]?.toString().toUpperCase().trim() ?? "";

    if (cell === "DIA") {
      nomesEstacoes = [];
      for (let i = colStart + 1; i < colStart + 40; i++) {
        const val = row[i]?.trim() ?? "";
        if (val === "TOTAL" || val === "" || val === "DIA") break;
        nomesEstacoes.push({ nome: val, idx: i });
      }
    }

    if (cell === "TOTAL") {
      nomesEstacoes.forEach((est) => {
        const val = row[est.idx];
        if (val) {
          const num = parseFloat(val.replace(",", ".")) * 1000;
          if (!isNaN(num) && num > 0) {
            if (!estacoesMap[est.nome]) estacoesMap[est.nome] = { soma: 0, count: 0 };
            estacoesMap[est.nome].soma  += num;
            estacoesMap[est.nome].count += 1;
          }
        }
      });
    }
  });

  return Object.entries(estacoesMap)
    .map(([nome, { soma, count }]) => ({ nome, media: Math.round(soma / count) }))
    .sort((a, b) => b.media - a.media)
    .slice(0, 10);
}

// ===============================
// ATUALIZAÇÃO DA UI
// ===============================
function updateUI(global: TrendData, ranking: EstacaoRanking[], linhaId: string): void {
  const totalEl       = document.getElementById("total-demand");
  const peakStationEl = document.getElementById("peak-station");
  const peakValueEl   = document.getElementById("peak-value");

  if (totalEl) totalEl.innerText = Math.round(global.mediaAnual).toLocaleString("pt-BR");

  if (ranking.length > 0) {
    if (peakStationEl) peakStationEl.innerText = ranking[0].nome;
    if (peakValueEl)   peakValueEl.innerText   = ranking[0].media.toLocaleString("pt-BR") + " pass./dia";
  }

  renderTrendChart(global.trend, linhaId);
  renderRankingChart(ranking, linhaId);
}

// ===============================
// GRÁFICOS
// ===============================
function getLineColor(linha: string): string {
  const key = Object.keys(LINE_COLORS).find((k) => linha.includes(k));
  return key ? LINE_COLORS[key] : "#d40000";
}

function renderTrendChart(data: (number | null)[], linhaId: string): void {
  charts.trend?.destroy();
  const canvas = document.getElementById("chart-tendencia") as HTMLCanvasElement | null;
  if (!canvas) return;

  const color = getLineColor(linhaId);

  charts.trend = new Chart(canvas, {
    type: "line",
    data: {
      labels: MESES_LABEL,
      datasets: [{
        label: "MDU",
        data,
        borderColor: color,
        backgroundColor: color + "20",
        fill: true,
        tension: 0.4,
        spanGaps: true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { ticks: { callback: (v: string | number) => (Number(v) / 1000).toFixed(0) + "k" } },
      },
    },
  });
}

function renderRankingChart(data: EstacaoRanking[], linhaId: string): void {
  charts.rank?.destroy();
  const canvas = document.getElementById("chart-ranking") as HTMLCanvasElement | null;
  if (!canvas) return;

  const color = getLineColor(linhaId);

  charts.rank = new Chart(canvas, {
    type: "bar",
    data: {
      labels: data.map((d) => d.nome),
      datasets: [{
        label: "Média de Entradas",
        data: data.map((d) => d.media),
        backgroundColor: color,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}