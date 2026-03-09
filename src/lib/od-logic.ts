import * as XLSX from "xlsx";
import L from "leaflet";
import {
  Chart,
  BarController,
  PieController,
  DoughnutController,
  BarElement,
  ArcElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  BarController,
  PieController,
  DoughnutController,
  BarElement,
  ArcElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

// ===============================
// CONFIGURAÇÃO
// ===============================
const BASE_URL = import.meta.env.BASE_URL ?? "";

const OD_CONFIG = {
  anos: [1997, 2007, 2017] as const,
  fontes: {
    geral:            "Tab02_OD{ano}.{ext}",
    genero:           "Tab03_OD{ano}.{ext}",
    frota:            "Tab04_OD{ano}.{ext}",
    idade:            "Tab02_OD{ano}.{ext}",
    escolaridade:     "Tab05_OD{ano}.{ext}",
    renda:            "Tab06_OD{ano}.{ext}",
    modos:            "Tab16_OD{ano}.{ext}",
    motivos:          "Tab18_OD{ano}.{ext}",
    vinculo:          "Tab08_OD{ano}.{ext}",
    atividade:        "Tab09_OD{ano}.{ext}",
    matriculas:       "Tab10_OD{ano}.{ext}",
    empregos_setor:   "Tab11_OD{ano}.{ext}",
    empregos_vinculo: "Tab13_OD{ano}.{ext}",
    empregos_externo: "Tab15_OD{ano}.{ext}",
    viagens_atraidas: "Tab21_OD{ano}.{ext}",
    tempo_viagem:     "Tab20_OD{ano}.{ext}",
    viagens_pe:       "Tab19_OD{ano}.{ext}",
  } as Record<string, string>,
  extensoes: { 1997: "xls", 2007: "xlsx", 2017: "xlsx" } as Record<number, string>,
  geoJson: {
    1997: "Zonas_1997_region.json",
    2007: "Zonas_2007_region.json",
    2017: "Zonas_2017_region.json",
  } as Record<number, string>,
  cores: { 1997: "#3498db", 2007: "#f39c12", 2017: "#d40000" } as Record<number, string>,
  nomesAnos: { 1997: "1997", 2007: "2007", 2017: "2017" } as Record<number, string>,
};

// ===============================
// TIPOS
// ===============================
type Ano = 1997 | 2007 | 2017;
type DataRow = Record<string, unknown>;
type DataMap = Record<string, DataRow | null>;
type MultiAnoData = Record<number, DataMap>;

// ===============================
// ESTADO
// ===============================
const charts: Record<string, Chart> = {};
let map: L.Map | null = null;
let geoJsonLayer: L.GeoJSON | null = null;
const cachePlanilhas: Record<string, DataRow[]> = {};
const anoAtivo = { value: 2017 };
let compararAnos: number[] = [];

// ===============================
// UTILITÁRIOS DE CAMINHO
// ===============================
function cleanBase(): string {
  const b = BASE_URL;
  if (b === "/") return "";
  return b.endsWith("/") ? b.slice(0, -1) : b;
}

function getFileName(key: string, ano: number): string {
  const template = OD_CONFIG.fontes[key];
  const ext = OD_CONFIG.extensoes[ano] ?? "xlsx";
  return template.replace("{ano}", String(ano)).replace("{ext}", ext);
}

function getPathForAno(ano: number, fileName: string): string {
  return `${cleanBase()}/origem_destino/${ano}/${fileName}`.replace(/\/+/g, "/");
}

function getGeoJsonPath(ano: number): string {
  return `${cleanBase()}/origem_destino/${ano}/${OD_CONFIG.geoJson[ano]}`.replace(/\/+/g, "/");
}

// ===============================
// MAPA
// ===============================
async function carregarMapaParaAno(
  ano: number,
  selector: HTMLSelectElement
): Promise<boolean> {
  if (typeof L === "undefined") return false;
  const mapElement = document.getElementById("map");
  if (!mapElement) return false;

  try {
    const response = await fetch(getGeoJsonPath(ano));
    if (!response.ok) return false;

    const geojsonData = await response.json();

    if (!map) {
      map = L.map("map").setView([-23.5505, -46.6333], 10);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "©OpenStreetMap",
      }).addTo(map);
    }

    if (geoJsonLayer) map.removeLayer(geoJsonLayer);

    geoJsonLayer = L.geoJSON(geojsonData, {
      style: { color: OD_CONFIG.cores[ano] ?? "#d40000", weight: 2, fillOpacity: 0.2 },
      onEachFeature: (feature, layer) => {
        const nomeZona =
          feature.properties.NomeZona ??
          feature.properties.nome ??
          feature.properties.NOME ??
          "Zona sem nome";

        layer.on("click", () => {
          selector.value = nomeZona;
          selector.dispatchEvent(new Event("change"));
        });
        layer.bindPopup(`<b>Zona (${ano}):</b> ${nomeZona}`);
      },
    }).addTo(map);

    map.fitBounds(geoJsonLayer.getBounds());
    return true;
  } catch (e) {
    console.error(`Erro ao carregar mapa para ${ano}:`, e);
    return false;
  }
}

function highlightMapZone(zoneName: string): void {
  if (!geoJsonLayer || !map) return;

  geoJsonLayer.eachLayer((layer) => {
    const l = layer as L.GeoJSON & { feature: GeoJSON.Feature };
    const featName =
      l.feature.properties?.NomeZona ??
      l.feature.properties?.nome ??
      l.feature.properties?.NOME;

    if (featName?.toString().trim() === zoneName.trim()) {
      (l as unknown as L.Path).setStyle({ fillOpacity: 0.6, weight: 4, color: "#ffffff" });
      map!.fitBounds((l as unknown as L.Polygon).getBounds(), { padding: [50, 50], maxZoom: 15 });
    } else {
      geoJsonLayer!.resetStyle(l as L.Layer);
    }
  });
}

// ===============================
// LEITURA DE EXCEL
// ===============================
async function getExcelDataNormalizado(ano: number, key: string): Promise<DataRow[]> {
  try {
    const filePath = getPathForAno(ano, getFileName(key, ano));
    const response = await fetch(filePath);
    if (!response.ok) return [];

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    if (ano === 1997 || ano === 2007) {
      const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
      const extrator = EXTRATORES[ano]?.[key];
      return extrator ? extrator(raw as string[][]) : extrairDadosGenerico(raw as string[][]);
    }

    return XLSX.utils.sheet_to_json<DataRow>(sheet, { range: 6 });
  } catch (e) {
    console.error(`Erro ao carregar ${key} para ${ano}:`, e);
    return [];
  }
}

// ===============================
// EXTRATORES LEGADOS (1997/2007)
// ===============================
function extrairDadosGenerico(rows: string[][]): DataRow[] {
  const results: DataRow[] = [];
  let start = -1;
  for (let i = 0; i < Math.min(15, rows.length); i++) {
    if (rows[i]?.length > 2) { start = i + 2; break; }
  }
  if (start === -1) return [];
  for (let i = start; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;
    const nome = row[1]?.toString().trim();
    if (!nome || nome.includes("Total")) continue;
    const entry: DataRow = { Nome: nome };
    row.slice(2).forEach((v, idx) => { entry[`Coluna_${idx + 2}`] = parseFloat(v) || 0; });
    results.push(entry);
  }
  return results;
}

function extrairComCabecalho(
  rows: string[][],
  buscaCabecalho: (row: string[]) => boolean,
  mapeamento: (row: string[]) => DataRow | null
): DataRow[] {
  let start = -1;
  for (let i = 0; i < Math.min(15, rows.length); i++) {
    if (rows[i] && buscaCabecalho(rows[i])) { start = i + 2; break; }
  }
  if (start === -1) return [];
  return rows.slice(start)
    .map(mapeamento)
    .filter((r): r is DataRow => r !== null);
}

const EXTRATORES: Record<number, Record<string, (rows: string[][]) => DataRow[]>> = {
  1997: {
    genero: (rows) => extrairComCabecalho(
      rows,
      (r) => JSON.stringify(r).toLowerCase().includes("masculino"),
      (r) => {
        const nome = r[1]?.toString().trim();
        if (!nome || nome.includes("Total")) return null;
        return { Nome: nome, Masculino: parseFloat(r[2]) || 0, Feminino: parseFloat(r[3]) || 0 };
      }
    ),
    idade: (rows) => extrairComCabecalho(
      rows,
      (r) => JSON.stringify(r).toLowerCase().includes("até 3"),
      (r) => {
        const nome = r[1]?.toString().trim();
        if (!nome || nome.includes("Total") || r.length < 13) return null;
        return {
          Nome: nome,
          "até 3": parseFloat(r[2]) || 0, "4 a 6": parseFloat(r[3]) || 0,
          "7 a 10": parseFloat(r[4]) || 0, "11 a 14": parseFloat(r[5]) || 0,
          "15 a 17": parseFloat(r[6]) || 0, "18 a 22": parseFloat(r[7]) || 0,
          "23 a 29": parseFloat(r[8]) || 0, "30 a 39": parseFloat(r[9]) || 0,
          "40 a 49": parseFloat(r[10]) || 0, "50 a 59": parseFloat(r[11]) || 0,
          "60 e mais": parseFloat(r[12]) || 0,
        };
      }
    ),
    modos: (rows) => extrairComCabecalho(
      rows,
      (r) => JSON.stringify(r).toLowerCase().includes("metro"),
      (r) => {
        const nome = r[1]?.toString().trim();
        if (!nome || nome.includes("Total") || r.length < 8) return null;
        return {
          Nome: nome,
          "Metrô": parseFloat(r[2]) || 0, "Trem": parseFloat(r[3]) || 0,
          "Ônibus": parseFloat(r[4]) || 0, "Dirigindo automóvel": parseFloat(r[5]) || 0,
          "Passageiro de automóvel": parseFloat(r[6]) || 0,
          "Bicicleta": parseFloat(r[7]) || 0, "A pé": parseFloat(r[8]) || 0,
        };
      }
    ),
  },
  2007: {},
};
// 2007 herda os mesmos extratores de 1997
EXTRATORES[2007] = EXTRATORES[1997];

// ===============================
// BUSCA DE ZONA E VALOR
// ===============================
function findZone(data: DataRow[], zoneName: string): DataRow | null {
  if (!data?.length) return null;
  const termo = zoneName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  return data.find((row) =>
    Object.values(row).some((v) => {
      if (v == null) return false;
      const val = v.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return val.includes(termo) || (termo.includes(val) && val.length > 3);
    })
  ) ?? null;
}

function getVal(row: DataRow | null | undefined, terms: string | string[]): number {
  if (!row) return 0;
  const list = Array.isArray(terms) ? terms : [terms];
  for (const term of list) {
    if (row[term] !== undefined) return typeof row[term] === "number" ? (row[term] as number) : parseFloat(row[term] as string) || 0;
    for (const [key, value] of Object.entries(row)) {
      if (key.toLowerCase().includes(term.toLowerCase()))
        return typeof value === "number" ? value : parseFloat(value as string) || 0;
    }
  }
  return 0;
}

// ===============================
// CARREGAMENTO MULTI-ANO
// ===============================
async function carregarDadosZonaMultiAno(zoneName: string, anos: number[]): Promise<MultiAnoData> {
  const resultados: MultiAnoData = {};
  const fontes = Object.keys(OD_CONFIG.fontes);

  for (const ano of anos) {
    const promises = fontes.map(async (key) => {
      const cacheKey = `${ano}_${key}`;
      if (!cachePlanilhas[cacheKey]) {
        cachePlanilhas[cacheKey] = await getExcelDataNormalizado(ano, key);
      }
      return { key, data: cachePlanilhas[cacheKey] };
    });

    const results = await Promise.all(promises);
    const dataMap: DataMap = {};
    results.forEach(({ key, data }) => { dataMap[key] = findZone(data, zoneName); });
    resultados[ano] = dataMap;
  }

  return resultados;
}

// ===============================
// GRÁFICOS
// ===============================
function createTooltipWithPercentage(total: number) {
  return {
    callbacks: {
      label: (context: { label?: string; raw: number }) => {
        const pct = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
        return `${context.label ?? ""}: ${context.raw.toLocaleString("pt-BR")} (${pct}%)`;
      },
    },
  };
}

function renderChart(id: string, type: string, data: object, options: object = {}): void {
  const canvas = document.getElementById(id) as HTMLCanvasElement | null;
  if (!canvas) return;

  charts[id]?.destroy();

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#a0a0a0", font: { size: 11 }, usePointStyle: true, pointStyle: "circle" },
      },
    },
  };

  charts[id] = new Chart(canvas, {
    type: type as never,
    data: data as never,
    options: Object.assign({}, defaultOptions, options) as never,
  });
}

// ===============================
// GRÁFICOS FIXOS
// ===============================
function renderGraficosFixos(dataMap: DataMap): void {
  // Gênero
  const masc = getVal(dataMap.genero, "Masculino");
  const fem  = getVal(dataMap.genero, "Feminino");
  renderChart("chart-genero", "pie", {
    labels: ["Masculino", "Feminino"],
    datasets: [{ data: [masc, fem], backgroundColor: ["#d40000", "#444444"], borderColor: "#1e1e1e", borderWidth: 2 }],
  }, { plugins: { tooltip: createTooltipWithPercentage(masc + fem) } });

  // Escolaridade
  const fund = getVal(dataMap.escolaridade, "Fundamental");
  const med  = getVal(dataMap.escolaridade, "Médio");
  const sup  = getVal(dataMap.escolaridade, "Superior");
  renderChart("chart-escolaridade", "bar", {
    labels: ["Fundamental", "Médio", "Superior"],
    datasets: [{ label: "Pessoas", data: [fund, med, sup], backgroundColor: ["#333333", "#666666", "#d40000"] }],
  });

  // Matrículas
  const pub = getVal(dataMap.matriculas, "Pública");
  const par = getVal(dataMap.matriculas, "Particular");
  renderChart("chart-matriculas", "doughnut", {
    labels: ["Pública", "Particular"],
    datasets: [{ data: [pub, par], backgroundColor: ["#d40000", "#333333"], borderColor: "#1e1e1e" }],
  }, { plugins: { tooltip: createTooltipWithPercentage(pub + par) } });

  // Viagens a pé
  const peData = [
    getVal(dataMap.viagens_pe, "Pequena Distância"),
    getVal(dataMap.viagens_pe, "Condução Cara"),
    getVal(dataMap.viagens_pe, "Ponto/Estação Distante"),
    getVal(dataMap.viagens_pe, "Atividade Física"),
  ];
  const totalPe = peData.reduce((a, b) => a + b, 0);
  if (totalPe > 0) {
    renderChart("chart-razoes-pe", "pie", {
      labels: ["Pequena Distância", "Condução Cara", "Ponto Distante", "Atividade Física"],
      datasets: [{ data: peData, backgroundColor: ["#d40000", "#333333", "#666666", "#999999"], borderColor: "#1e1e1e" }],
    }, { plugins: { tooltip: createTooltipWithPercentage(totalPe) } });
  }
}

// ===============================
// GRÁFICOS COMPARATIVOS
// ===============================
type ChartDef = { id: string; labels: string[]; getValues: (dm: DataMap) => number[]; axisLabel: string; indexAxis?: "x" | "y" };

const GRAFICOS_COMPARATIVOS: ChartDef[] = [
  {
    id: "chart-modos", labels: ["Metrô", "Trem", "Ônibus", "Carro", "Bicicleta", "A pé"], axisLabel: "Viagens",
    getValues: (dm) => [
      getVal(dm.modos, "Metrô"), getVal(dm.modos, "Trem"), getVal(dm.modos, "Ônibus"),
      getVal(dm.modos, "Dirigindo automóvel") + getVal(dm.modos, "Passageiro de automóvel"),
      getVal(dm.modos, "Bicicleta"), getVal(dm.modos, "A pé"),
    ],
  },
  {
    id: "chart-idade", labels: ["0-17", "18-39", "40-59", "60+"], axisLabel: "Pessoas",
    getValues: (dm) => [
      getVal(dm.idade, "até 3") + getVal(dm.idade, "4 a 6") + getVal(dm.idade, "7 a 10") + getVal(dm.idade, "11 a 14") + getVal(dm.idade, "15 a 17"),
      getVal(dm.idade, "18 a 22") + getVal(dm.idade, "23 a 29") + getVal(dm.idade, "30 a 39"),
      getVal(dm.idade, "40 a 49") + getVal(dm.idade, "50 a 59"),
      getVal(dm.idade, "60 e mais"),
    ],
  },
  {
    id: "chart-motivos", labels: ["Trabalho", "Educação", "Compras", "Saúde", "Lazer"], axisLabel: "Viagens", indexAxis: "y" as const,
    getValues: (dm) => [
      getVal(dm.motivos, "Trabalho Indústria") + getVal(dm.motivos, "Trabalho Comércio") + getVal(dm.motivos, "Trabalho Serviços"),
      getVal(dm.motivos, "Educação"), getVal(dm.motivos, "Compras"),
      getVal(dm.motivos, "Saúde"), getVal(dm.motivos, "Lazer"),
    ],
  },
  {
    id: "chart-vinculo", labels: ["Com Carteira", "Sem Carteira", "Público", "Autônomo", "Empregador"], axisLabel: "Pessoas",
    getValues: (dm) => [
      getVal(dm.vinculo, "Assalariado com Carteira"), getVal(dm.vinculo, "Assalariado sem Carteira"),
      getVal(dm.vinculo, "Funcionário Público"), getVal(dm.vinculo, "Autônomo"), getVal(dm.vinculo, "Empregador"),
    ],
  },
  {
    id: "chart-atividade", labels: ["Ocupado", "Aposentado", "Sem Trabalho", "Estudante"], axisLabel: "Pessoas",
    getValues: (dm) => [getVal(dm.atividade, "Ocupado"), getVal(dm.atividade, "Aposentado"), getVal(dm.atividade, "Sem Trabalho"), getVal(dm.atividade, "Estudante")],
  },
  {
    id: "chart-empregos-setor", labels: ["Indústria", "Serviços", "Outros"], axisLabel: "Empregos",
    getValues: (dm) => [getVal(dm.empregos_setor, "Secundário"), getVal(dm.empregos_setor, "Terciário"), getVal(dm.empregos_setor, "Outros")],
  },
  {
    id: "chart-empregos-vinculo", labels: ["Carteira", "Sem Carteira", "Público", "Autônomo"], axisLabel: "Empregos", indexAxis: "y" as const,
    getValues: (dm) => [
      getVal(dm.empregos_vinculo, "Assalariado com Carteira"), getVal(dm.empregos_vinculo, "Assalariado sem Carteira"),
      getVal(dm.empregos_vinculo, "Funcionário Público"), getVal(dm.empregos_vinculo, "Autônomo"),
    ],
  },
  {
    id: "chart-viagens-comparativo", labels: ["Metrô", "Trem", "Ônibus", "Carro", "Bicicleta", "A pé"], axisLabel: "Viagens",
    getValues: (dm) => [
      getVal(dm.modos, "Metrô"), getVal(dm.modos, "Trem"), getVal(dm.modos, "Ônibus"),
      getVal(dm.modos, "Dirigindo automóvel") + getVal(dm.modos, "Passageiro de automóvel"),
      getVal(dm.modos, "Bicicleta"), getVal(dm.modos, "A pé"),
    ],
  },
  {
    id: "chart-tempo-viagem", labels: ["Coletivo", "Individual", "A pé", "Bicicleta"], axisLabel: "Minutos",
    getValues: (dm) => [getVal(dm.tempo_viagem, "Coletivo"), getVal(dm.tempo_viagem, "Individual"), getVal(dm.tempo_viagem, "A pé"), getVal(dm.tempo_viagem, "Bicicleta")],
  },
];

function renderGraficosComparativos(dadosMultiAno: MultiAnoData, anos: number[]): void {
  GRAFICOS_COMPARATIVOS.forEach(({ id, labels, getValues, axisLabel, indexAxis }) => {
    const datasets = anos.map((ano) => ({
      label: OD_CONFIG.nomesAnos[ano],
      data: getValues(dadosMultiAno[ano]),
      backgroundColor: OD_CONFIG.cores[ano],
    }));

    const isY = indexAxis === "y";
    renderChart(id, "bar", { labels, datasets }, {
      ...(indexAxis ? { indexAxis } : {}),
      scales: {
        [isY ? "x" : "y"]: { beginAtZero: true, title: { display: true, text: axisLabel } },
      },
    });
  });

  // Trabalho externo — estrutura diferente
  const datasetsExterno = anos.flatMap((ano) => [
    { label: `${OD_CONFIG.nomesAnos[ano]} - Externo`, data: [getVal(dadosMultiAno[ano].empregos_externo, "Trabalho Externo")], backgroundColor: OD_CONFIG.cores[ano] },
    { label: `${OD_CONFIG.nomesAnos[ano]} - Interno`, data: [getVal(dadosMultiAno[ano].empregos_externo, "Trabalho Interno")], backgroundColor: OD_CONFIG.cores[ano], hidden: true },
  ]);
  renderChart("chart-trabalho-externo", "bar", { labels: ["Empregos"], datasets: datasetsExterno }, {
    scales: { y: { beginAtZero: true, title: { display: true, text: "Empregos" } } },
  });
}

// ===============================
// CARDS DE ESTATÍSTICAS
// ===============================
function atualizarCardsBasicos(dataMap: DataMap): void {
  const faixas = ["até 3", "4 a 6", "7 a 10", "11 a 14", "15 a 17", "18 a 22", "23 a 29", "30 a 39", "40 a 49", "50 a 59", "60 e mais"];
  const totalPop = faixas.reduce((sum, f) => sum + getVal(dataMap.geral, f), 0);
  const totalJobs = getVal(dataMap.empregos_setor, "Secundário") + getVal(dataMap.empregos_setor, "Terciário") + getVal(dataMap.empregos_setor, "Outros");
  const rendaVal = getVal(dataMap.renda, "Renda(*) Per Capita");

  setStatText("stat-pop",    totalPop  ? Math.round(totalPop).toLocaleString("pt-BR")  : "N/D");
  setStatText("stat-jobs",   totalJobs ? Math.round(totalJobs).toLocaleString("pt-BR") : "N/D");
  setStatText("stat-cars",   dataMap.frota ? Math.round(getVal(dataMap.frota, "Automóvel")).toLocaleString("pt-BR") : "N/D");
  setStatText("stat-income", rendaVal  ? `R$ ${rendaVal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "N/D");
}

function setStatText(id: string, text: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ===============================
// INICIALIZAÇÃO DOS CONTROLES
// ===============================
function initAnoSelector(selector: HTMLSelectElement, zoneSelector: HTMLSelectElement): void {
  const anoSelector = document.getElementById("ano-selector") as HTMLSelectElement | null;
  if (!anoSelector) return;

  OD_CONFIG.anos.forEach((ano) => {
    const opt = new Option(OD_CONFIG.nomesAnos[ano], String(ano));
    if (ano === 2017) opt.selected = true;
    anoSelector.add(opt);
  });

  anoSelector.addEventListener("change", async (e) => {
    anoAtivo.value = parseInt((e.target as HTMLSelectElement).value);
    await carregarMapaParaAno(anoAtivo.value, selector);
    if (zoneSelector.value) await atualizarComparacao(zoneSelector);
  });
}

function initCompararCheckboxes(zoneSelector: HTMLSelectElement): void {
  const container = document.getElementById("comparar-anos");
  if (!container) return;

  OD_CONFIG.anos.forEach((ano) => {
    const label = document.createElement("label");
    label.style.cssText = "margin-right: 15px; color: #a0a0a0;";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = String(ano);
    checkbox.addEventListener("change", (e) => {
      const val = parseInt((e.target as HTMLInputElement).value);
      compararAnos = (e.target as HTMLInputElement).checked
        ? [...compararAnos, val]
        : compararAnos.filter((a) => a !== val);
      if (zoneSelector.value) zoneSelector.dispatchEvent(new Event("change"));
    });

    label.append(checkbox, ` ${OD_CONFIG.nomesAnos[ano]}`);
    container.appendChild(label);
  });
}

async function atualizarComparacao(selector: HTMLSelectElement): Promise<void> {
  const zoneName = selector.value;
  if (!zoneName) return;

  selector.disabled = true;
  const anos = [anoAtivo.value, ...compararAnos];
  const dadosMultiAno = await carregarDadosZonaMultiAno(zoneName, anos);

  atualizarCardsBasicos(dadosMultiAno[anoAtivo.value]);
  renderGraficosFixos(dadosMultiAno[anoAtivo.value]);
  renderGraficosComparativos(dadosMultiAno, anos);
  highlightMapZone(zoneName);

  selector.disabled = false;
}

async function loadZones(selector: HTMLSelectElement): Promise<void> {
  try {
    const filePath = getPathForAno(2017, getFileName("geral", 2017));
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<DataRow>(sheet, { range: 6 });

    selector.innerHTML = '<option value="">Selecione uma zona...</option>';

    const names = data
      .map((row) => Object.values(row)[0]?.toString().trim() ?? "")
      .filter((n) => n && !n.includes("Total") && n !== "Nome" && n !== "Tabela 2");

    names.sort((a, b) => a.localeCompare(b, "pt-BR"));
    names.forEach((n) => selector.add(new Option(n, n)));
  } catch (e) {
    console.error("Erro ao carregar zonas:", e);
    selector.innerHTML = '<option value="">Erro ao carregar zonas</option>';
  }
}

// ===============================
// PONTO DE ENTRADA
// ===============================
export async function initODDashboard(): Promise<void> {
  Chart.defaults.color = "#a0a0a0";
  Chart.defaults.font.family = "'Segoe UI', sans-serif";

  const selector     = document.getElementById("zone-selector") as HTMLSelectElement | null;
  if (!selector) return;

  await loadZones(selector);
  initAnoSelector(selector, selector);
  initCompararCheckboxes(selector);
  await carregarMapaParaAno(2017, selector);

  selector.addEventListener("change", () => atualizarComparacao(selector));

  setTimeout(() => {
    if (selector.options.length > 1) {
      selector.selectedIndex = 1;
      selector.dispatchEvent(new Event("change"));
    }
  }, 1000);
}