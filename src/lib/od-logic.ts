import * as XLSX from "xlsx";
import L from "leaflet";
import {
  Chart, BarController, PieController, DoughnutController,
  BarElement, ArcElement, LinearScale, CategoryScale, Tooltip, Legend,
} from "chart.js";

Chart.register(
  BarController, PieController, DoughnutController,
  BarElement, ArcElement, LinearScale, CategoryScale, Tooltip, Legend
);

const BASE_URL = import.meta.env.BASE_URL ?? "";

// FONTES POR ANO
const OD_FONTES_POR_ANO: Record<number, Record<string, string>> = {
  1997: {
    geral:            "Tab02_OD1997.xls",
    genero:           "Tab04_OD1997.xls",
    frota:            "Tab04_OD1997.xls",
    idade:            "Tab02_OD1997.xls",
    escolaridade:     "Tab03_OD1997.xls",
    renda:            "Tab06_OD1997.xls",
    modos:            "Tab15_OD1997.xls",
    motivos:          "",
    vinculo:          "Tab08_OD1997.xls",
    atividade:        "Tab09_OD1997.xls",
    matriculas:       "Tab10_OD1997.xls",
    empregos_setor:   "Tab11_OD1997.xls",
    empregos_vinculo: "Tab13_OD1997.xls",
    empregos_externo: "",
    viagens_atraidas: "Tab21_OD1997.xls",
    tempo_viagem:     "Tab19_OD1997.xls",
    viagens_pe:       "Tab18_OD1997.xls",
  },
  2007: {
    geral:            "Tab02_OD2007.xlsx",
    genero:           "Tab04_OD2007.xlsx",
    frota:            "Tab04_OD2007.xlsx",
    idade:            "Tab02_OD2007.xlsx",
    escolaridade:     "Tab03_OD2007.xlsx",
    renda:            "Tab06_OD2007.xlsx",
    modos:            "Tab16_OD2007.xlsx",
    motivos:          "Tab18_OD2007.xlsx",
    vinculo:          "Tab08_OD2007.xlsx",
    atividade:        "Tab09_OD2007.xlsx",
    matriculas:       "Tab10_OD2007.xlsx",
    empregos_setor:   "Tab11_OD2007.xlsx",
    empregos_vinculo: "Tab13_OD2007.xlsx",
    empregos_externo: "Tab15_OD2007.xlsx",
    viagens_atraidas: "Tab21_OD2007.xlsx",
    tempo_viagem:     "Tab20_OD2007.xlsx",
    viagens_pe:       "Tab19_OD2007.xlsx",
  },
  2017: {
    geral:            "Tab02_OD2017.xlsx",
    genero:           "Tab03_OD2017.xlsx",
    frota:            "Tab04_OD2017.xlsx",
    idade:            "Tab02_OD2017.xlsx",
    escolaridade:     "Tab05_OD2017.xlsx",
    renda:            "Tab06_OD2017.xlsx",
    modos:            "Tab16_OD2017.xlsx",
    motivos:          "Tab18_OD2017.xlsx",
    vinculo:          "Tab08_OD2017.xlsx",
    atividade:        "Tab09_OD2017.xlsx",
    matriculas:       "Tab10_OD2017.xlsx",
    empregos_setor:   "Tab11_OD2017.xlsx",
    empregos_vinculo: "Tab13_OD2017.xlsx",
    empregos_externo: "Tab15_OD2017.xlsx",
    viagens_atraidas: "Tab21_OD2017.xlsx",
    tempo_viagem:     "Tab20_OD2017.xlsx",
    viagens_pe:       "Tab19_OD2017.xlsx",
  },
};

const OD_CONFIG = {
  anos: [1997, 2007, 2017] as const,
  geoJson: {
    1997: "Zonas_1997_region.json",
    2007: "Zonas_2007_region.json",
    2017: "Zonas_2017_region.json",
  } as Record<number, string>,
  cores:     { 1997: "#3498db", 2007: "#f39c12", 2017: "#d40000" } as Record<number, string>,
  nomesAnos: { 1997: "1997",    2007: "2007",    2017: "2017"    } as Record<number, string>,
};

type DataRow      = Record<string, unknown>;
type DataMap      = Record<string, DataRow | null>;
type MultiAnoData = Record<number, DataMap>;

const charts: Record<string, Chart> = {};
let map: L.Map | null = null;
let geoJsonLayer: L.GeoJSON | null = null;
const cachePlanilhas: Record<string, DataRow[]> = {};
const anoAtivo = { value: 2017 };
let compararAnos: number[] = [];

// nomeZona(normalizado) → zonaId numérico, por ano
const cacheZonaIdPorAno: Record<number, Record<string, number>> = {};

// UTILITÁRIOS
function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function cleanBase(): string {
  const b = BASE_URL;
  if (!b || b === "/") return "";
  return b.endsWith("/") ? b.slice(0, -1) : b;
}

function buildPath(...parts: string[]): string {
  return ("/" + parts.filter(Boolean).join("/")).replace(/\/+/g, "/");
}

function getFileName(key: string, ano: number): string {
  return OD_FONTES_POR_ANO[ano]?.[key] ?? "";
}

function getPathForAno(ano: number, fileName: string): string {
  if (!fileName) return "";
  return buildPath(cleanBase(), "origem_destino", String(ano), fileName);
}

function getGeoJsonPath(ano: number): string {
  return buildPath(cleanBase(), "origem_destino", String(ano), OD_CONFIG.geoJson[ano]);
}

// MAPA
function extrairZonaIdDeProperties(props: Record<string, unknown>): number | null {
  const candidatos = [
    "Zona97", "Zona07",
    "NumZona", "num_zona", "ZonaID", "zona_id",
    "ZonaNum", "CD_ZONA", "id", "FID", "OBJECTID", "zona",
  ];
  for (const c of candidatos) {
    const v = props[c];
    if (v != null) {
      const n = Number(v);
      if (!isNaN(n) && n > 0) return Math.round(n);
    }
  }
  return null;
}

async function carregarMapaParaAno(ano: number, selector: HTMLSelectElement): Promise<boolean> {
  if (!document.getElementById("map")) return false;
  try {
    const res = await fetch(getGeoJsonPath(ano));
    if (!res.ok) return false;
    const geojson = await res.json();

    if (!map) {
      map = L.map("map").setView([-23.5505, -46.6333], 10);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "©OpenStreetMap",
      }).addTo(map);
    }

    if (geoJsonLayer) map.removeLayer(geoJsonLayer);
    cacheZonaIdPorAno[ano] = {};

    geoJsonLayer = L.geoJSON(geojson, {
      style: { color: OD_CONFIG.cores[ano] ?? "#d40000", weight: 2, fillOpacity: 0.2 },
      onEachFeature: (feature, layer) => {
        const props = feature.properties ?? {};
        const nomeZona: string = (
          props.NomeZona97 ?? props.NomeZona07 ??
          props.NomeZona ?? props.nome ?? props.NOME ?? ""
        ).toString().trim() || "Zona sem nome";

        const zonaId = extrairZonaIdDeProperties(props as Record<string, unknown>);
        if (zonaId !== null) {
          cacheZonaIdPorAno[ano][normalize(nomeZona)] = zonaId;
        }

        layer.on("click", () => {
          selector.value = nomeZona;
          selector.dispatchEvent(new Event("change"));
        });
        layer.bindPopup(`<b>Zona (${ano}):</b> ${nomeZona}${zonaId ? ` [#${zonaId}]` : ""}`);
      },
    }).addTo(map);

    const bounds = geoJsonLayer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds);
    return true;
  } catch (e) {
    console.error(`Erro mapa ${ano}:`, e);
    return false;
  }
}

function highlightMapZone(zoneName: string): void {
  if (!geoJsonLayer || !map) return;
  let found = false;
  geoJsonLayer.eachLayer((layer) => {
    const l = layer as L.GeoJSON & { feature: GeoJSON.Feature };
    const props = l.feature?.properties ?? {};
    const featName = (
      props.NomeZona97 ?? props.NomeZona07 ??
      props.NomeZona ?? props.nome ?? props.NOME ?? ""
    ).toString().trim();

    if (featName === zoneName.trim()) {
      found = true;
      (l as unknown as L.Path).setStyle({ fillOpacity: 0.6, weight: 4, color: "#ffffff" });
      const bounds = (l as unknown as L.Polygon).getBounds();
      if (bounds.isValid()) map!.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else {
      geoJsonLayer!.resetStyle(l as L.Layer);
    }
  });
  if (!found) console.warn(`Zona "${zoneName}" não encontrada no GeoJSON.`);
}

// LOOKUP ZonaID
function getZonaId(zoneName: string, ano: number): number | null {
  const cache = cacheZonaIdPorAno[ano];
  if (!cache) return null;
  const key = normalize(zoneName);
  if (cache[key] !== undefined) return cache[key];
  for (const [k, v] of Object.entries(cache)) {
    if (k.includes(key) || key.includes(k)) return v;
  }
  return null;
}

// LEITURA DE EXCEL
async function getExcelDataNormalizado(ano: number, key: string): Promise<DataRow[]> {
  try {
    const fileName = getFileName(key, ano);
    if (!fileName) return [];
    const res = await fetch(getPathForAno(ano, fileName));
    if (!res.ok) return [];
    const buf = await res.arrayBuffer();
    const wb  = XLSX.read(new Uint8Array(buf), { type: "array" });
    const ws  = wb.Sheets[wb.SheetNames[0]];

    if (ano === 1997 || ano === 2007) {
      const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 }) as unknown[][];
      return extrairDadosLegado(raw);
    }
    return XLSX.utils.sheet_to_json<DataRow>(ws, { range: 6 });
  } catch (e) {
    console.error(`Erro ${key} ${ano}:`, e);
    return [];
  }
}

// EXTRATOR LEGADO (1997/2007)
function extrairDadosLegado(rows: unknown[][]): DataRow[] {
  // Encontra headerRow: primeira linha após r5 com ≥3 células STRING preenchidas
  let headerRow = -1;
  for (let i = 5; i < Math.min(12, rows.length); i++) {
    const row = rows[i] as unknown[];
    const stringsFilled = row.filter((c) => typeof c === "string" && (c as string).trim().length > 0).length;
    if (stringsFilled >= 3) { headerRow = i; break; }
  }
  if (headerRow === -1) return [];

  const currRow = rows[headerRow] as unknown[];
  const nextRow = (rows[headerRow + 1] as unknown[]) ?? [];
  const currStrings = currRow.filter((c) => typeof c === "string" && (c as string).trim().length > 0).length;
  const nextStrings = nextRow.filter((c) => typeof c === "string" && (c as string).trim().length > 0).length;
  const nextCol0IsString = typeof nextRow[0] === "string";

  let headers: string[];
  let dataStart: number;

  if (nextCol0IsString && nextStrings > currStrings) {
    const r1 = currRow.map((h) => h?.toString().trim() ?? "");
    const r2 = nextRow.map((h) => h?.toString().trim() ?? "");
    headers   = r2.map((b, i) => b || r1[i] || `col_${i}`);
    dataStart = headerRow + 2;
  } else {
    headers   = currRow.map((h) => h?.toString().trim() ?? "");
    dataStart = headerRow + 1;
  }

  const results: DataRow[] = [];
  for (let i = dataStart; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    if (!row || row.length < 2) continue;
    if (row[0] == null || typeof row[0] === "string") continue;
    const zonaId = Math.round(Number(row[0]));
    if (isNaN(zonaId) || zonaId <= 0) continue;

    const entry: DataRow = { _zonaId: zonaId };
    for (let c = 1; c < headers.length; c++) {
      const hdr = headers[c] || `col_${c}`;
      const val = row[c];
      entry[hdr] = val != null
        ? (typeof val === "number" ? val : parseFloat(val as string) || 0)
        : 0;
    }
    results.push(entry);
  }
  return results;
}

// BUSCA DE ZONA
function findZone(data: DataRow[], zoneName: string, ano: number): DataRow | null {
  if (!data?.length) return null;

  if (ano === 2017) {
    const termo = normalize(zoneName);
    return data.find((row) =>
      Object.values(row).some((v) => {
        if (v == null || typeof v !== "string") return false;
        return normalize(v) === termo;
      })
    ) ?? null;
  }

  const zonaId = getZonaId(zoneName, ano);
  if (zonaId === null) {
    console.warn(`ZonaID não encontrado para "${zoneName}" ano ${ano}.`);
    return null;
  }
  return data.find((row) => row._zonaId === zonaId) ?? null;
}

function getVal(row: DataRow | null | undefined, terms: string | string[]): number {
  if (!row) return 0;
  const list = Array.isArray(terms) ? terms : [terms];
  for (const term of list) {
    if (row[term] !== undefined) {
      const v = row[term];
      return typeof v === "number" ? v : parseFloat(v as string) || 0;
    }
    for (const [k, v] of Object.entries(row)) {
      if (k === "_zonaId") continue;
      if (k.toLowerCase().includes(term.toLowerCase())) {
        return typeof v === "number" ? v : parseFloat(v as string) || 0;
      }
    }
  }
  return 0;
}

// CARREGAMENTO MULTI-ANO
async function carregarDadosZonaMultiAno(zoneName: string, anos: number[]): Promise<MultiAnoData> {
  const resultados: MultiAnoData = {};
  const fontes = Object.keys(OD_FONTES_POR_ANO[2017]);

  await Promise.all(anos.map(async (ano) => {
    const results = await Promise.all(fontes.map(async (key) => {
      const cacheKey = `${ano}_${key}`;
      if (!cachePlanilhas[cacheKey]) {
        cachePlanilhas[cacheKey] = await getExcelDataNormalizado(ano, key);
      }
      return { key, data: cachePlanilhas[cacheKey] };
    }));

    const dataMap: DataMap = {};
    results.forEach(({ key, data }) => {
      dataMap[key] = findZone(data, zoneName, ano);
    });
    resultados[ano] = dataMap;
  }));

  return resultados;
}

// GRÁFICOS
function createTooltipWithPercentage(total: number) {
  return {
    callbacks: {
      label: (ctx: { label?: string; raw: number }) => {
        const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : "0.0";
        return `${ctx.label ?? ""}: ${ctx.raw.toLocaleString("pt-BR")} (${pct}%)`;
      },
    },
  };
}

function renderChart(id: string, type: string, data: object, options: object = {}): void {
  const canvas = document.getElementById(id) as HTMLCanvasElement | null;
  if (!canvas) return;
  charts[id]?.destroy();

  const merged = {
    responsive: true,
    maintainAspectRatio: false,
    ...options,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: "#a0a0a0", font: { size: 11 }, usePointStyle: true, pointStyle: "circle" as const },
      },
      ...((options as { plugins?: object }).plugins ?? {}),
    },
  };

  charts[id] = new Chart(canvas, { type: type as never, data: data as never, options: merged as never });
}

// GRÁFICOS FIXOS
function renderGraficosFixos(dataMap: DataMap): void {
  // Gênero
  const masc = getVal(dataMap.genero, "Masculino");
  const fem  = getVal(dataMap.genero, "Feminino");
  renderChart("chart-genero", "pie", {
    labels: ["Masculino", "Feminino"],
    datasets: [{ data: [masc, fem], backgroundColor: ["#d40000", "#444444"], borderColor: "#1e1e1e", borderWidth: 2 }],
  }, { plugins: { tooltip: createTooltipWithPercentage(masc + fem) } });

  // Escolaridade — aliases cobrem 1997 (merged), 2007 e 2017
  renderChart("chart-escolaridade", "bar", {
    labels: ["Básico Inc.", "Básico Comp.", "Médio/Sup. Inc.", "Superior Comp."],
    datasets: [{ label: "Pessoas", data: [
      getVal(dataMap.escolaridade, ["Não Alfabetizado", "Não-Alfabetizado / Primário Incompleto", "Não alfabetizado"]),
      getVal(dataMap.escolaridade, ["1o. grau Completo", "Primário Completo / Ginásio Incompleto", "Fund. Completo"]),
      getVal(dataMap.escolaridade, ["2o. grau Completo", "Colegial Completo / Superior Incompleto", "Médio Completo"]),
      getVal(dataMap.escolaridade, "Superior Completo"),
    ], backgroundColor: ["#222222", "#444444", "#666666", "#d40000"] }],
  });

  // Matrículas — 1997: Rede Oficial/Outros | 2007/2017: Pública/Particular
  const pub = getVal(dataMap.matriculas, ["Pública", "Rede Oficial"]);
  const par = getVal(dataMap.matriculas, ["Particular", "Outros"]);
  renderChart("chart-matriculas", "doughnut", {
    labels: ["Pública/Oficial", "Particular/Outros"],
    datasets: [{ data: [pub, par], backgroundColor: ["#d40000", "#333333"], borderColor: "#1e1e1e" }],
  }, { plugins: { tooltip: createTooltipWithPercentage(pub + par) } });

  // Viagens a pé — 1997: Tab18 | 2007: Tab19 | 2017: Tab19
  const peData = [
    getVal(dataMap.viagens_pe, ["Pequena Distância", "Pequena Distancia"]),
    getVal(dataMap.viagens_pe, "Condução Cara"),
    getVal(dataMap.viagens_pe, "Ponto/Estação Distante"),
    getVal(dataMap.viagens_pe, ["Atividade Física", "Condução Lotada"]),
  ];
  renderChart("chart-razoes-pe", "pie", {
    labels: ["Pequena Distância", "Condução Cara", "Ponto Distante", "Atividade Física"],
    datasets: [{ data: peData, backgroundColor: ["#d40000", "#333333", "#666666", "#999999"], borderColor: "#1e1e1e" }],
  }, { plugins: { tooltip: createTooltipWithPercentage(peData.reduce((a, b) => a + b, 0)) } });
}

// GRÁFICOS COMPARATIVOS
type ChartDef = {
  id: string; labels: string[];
  getValues: (dm: DataMap) => number[];
  axisLabel: string; indexAxis?: "x" | "y";
};

const GRAFICOS_COMPARATIVOS: ChartDef[] = [
  {
    id: "chart-modos", axisLabel: "Viagens",
    labels: ["Metrô", "Trem", "Ônibus", "Carro", "Bicicleta", "A pé"],
    getValues: (dm) => [
      getVal(dm.modos, ["Metrô", "Metro"]),
      getVal(dm.modos, "Trem"),
      getVal(dm.modos, ["Ônibus (*)", "Ônibus", "Onibus"]),
      getVal(dm.modos, ["Dirigindo Automóvel", "Dirigindo automóvel"]) +
      getVal(dm.modos, ["Passageiro de Automóvel", "Passageiro de automóvel"]),
      getVal(dm.modos, "Bicicleta"),
      getVal(dm.modos, ["A pé", "A Pe"]),
    ],
  },
  {
    id: "chart-idade", axisLabel: "Pessoas",
    labels: ["0–17", "18–39", "40–59", "60+"],
    getValues: (dm) => [
      getVal(dm.idade, "até 3") + getVal(dm.idade, "4 a 6") + getVal(dm.idade, "7 a 10") +
      getVal(dm.idade, "11 a 14") + getVal(dm.idade, "15 a 17"),
      getVal(dm.idade, "18 a 22") + getVal(dm.idade, "23 a 29") + getVal(dm.idade, "30 a 39"),
      getVal(dm.idade, "40 a 49") + getVal(dm.idade, "50 a 59"),
      getVal(dm.idade, "60 e mais"),
    ],
  },
  {
    id: "chart-motivos", axisLabel: "Viagens", indexAxis: "y" as const,
    labels: ["Trabalho", "Educação", "Compras", "Saúde", "Lazer"],
    getValues: (dm) => [
      getVal(dm.motivos, ["Trabalho Indústria", "Trabalho Industria"]) +
      getVal(dm.motivos, ["Trabalho Comércio", "Trabalho Comercio"]) +
      getVal(dm.motivos, ["Trabalho Serviços", "Trabalho Servicos"]),
      getVal(dm.motivos, ["Educação", "Educacao"]),
      getVal(dm.motivos, "Compras"),
      getVal(dm.motivos, ["Saúde", "Saude"]),
      getVal(dm.motivos, "Lazer"),
    ],
  },
  {
    id: "chart-atividade", axisLabel: "Pessoas",
    labels: ["Ocupado", "Aposentado", "Sem Trabalho", "Estudante"],
    getValues: (dm) => [
      getVal(dm.atividade, "Ocupado"),
      getVal(dm.atividade, "Aposentado"),
      getVal(dm.atividade, ["Sem Trabalho", "Nunca Trabalhou"]),
      getVal(dm.atividade, "Estudante"),
    ],
  },
  {
    id: "chart-empregos-setor", axisLabel: "Empregos",
    labels: ["Indústria", "Serviços", "Outros"],
    getValues: (dm) => [
      getVal(dm.empregos_setor, ["Secundário", "Secundario"]),
      getVal(dm.empregos_setor, ["Terciário", "Terciario"]),
      getVal(dm.empregos_setor, "Outros"),
    ],
  },
  {
    id: "chart-empregos-vinculo", axisLabel: "Empregos", indexAxis: "y" as const,
    labels: ["Com Carteira", "Sem Carteira", "Público", "Autônomo"],
    getValues: (dm) => [
      getVal(dm.empregos_vinculo, ["Assalariado com Carteira", "Assalariado com carteira"]),
      getVal(dm.empregos_vinculo, ["Assalariado sem Carteira ", "Assalariado sem Carteira", "Assalariado sem carteira"]),
      getVal(dm.empregos_vinculo, ["Funcionário Público", "Funcionário público"]),
      getVal(dm.empregos_vinculo, ["Autônomo", "Autonomo"]),
    ],
  },
  {
    id: "chart-tempo-viagem", axisLabel: "Minutos",
    labels: ["Coletivo", "Individual", "A pé", "Bicicleta"],
    getValues: (dm) => [
      getVal(dm.tempo_viagem, "Coletivo"),
      getVal(dm.tempo_viagem, "Individual"),
      getVal(dm.tempo_viagem, ["A pé", "A Pe"]),
      getVal(dm.tempo_viagem, "Bicicleta"),
    ],
  },
];

function renderGraficosComparativos(dadosMultiAno: MultiAnoData, anos: number[]): void {
  const scaleOpts = (axisLabel: string, isY: boolean) => ({
    [isY ? "x" : "y"]: {
      beginAtZero: true,
      ticks: { color: "#a0a0a0" },
      title: { display: true, text: axisLabel, color: "#a0a0a0" },
    },
    [isY ? "y" : "x"]: { ticks: { color: "#a0a0a0" } },
  });

  GRAFICOS_COMPARATIVOS.forEach(({ id, labels, getValues, axisLabel, indexAxis }) => {
    const isY = indexAxis === "y";
    renderChart(id, "bar", {
      labels,
      datasets: anos.map((ano) => ({
        label: OD_CONFIG.nomesAnos[ano],
        data: getValues(dadosMultiAno[ano] ?? {}),
        backgroundColor: OD_CONFIG.cores[ano],
      })),
    }, { ...(indexAxis ? { indexAxis } : {}), scales: scaleOpts(axisLabel, isY) });
  });

  // Trabalho Externo vs Interno — só 2007/2017 têm essa fonte
  renderChart("chart-trabalho-externo", "bar", {
    labels: ["Empregos"],
    datasets: anos.flatMap((ano) => [
      {
        label: `${OD_CONFIG.nomesAnos[ano]} - Externo`,
        data: [getVal(dadosMultiAno[ano]?.empregos_externo ?? null, ["Trabalho Externo (*)", "Trabalho Externo"])],
        backgroundColor: OD_CONFIG.cores[ano],
      },
      {
        label: `${OD_CONFIG.nomesAnos[ano]} - Interno`,
        data: [getVal(dadosMultiAno[ano]?.empregos_externo ?? null, "Trabalho Interno")],
        backgroundColor: OD_CONFIG.cores[ano] + "88",
      },
    ]),
  }, { scales: scaleOpts("Empregos", false) });
}

// CARDS DE ESTATÍSTICAS
function atualizarCardsBasicos(dataMap: DataMap): void {
  const faixas = ["até 3","4 a 6","7 a 10","11 a 14","15 a 17","18 a 22","23 a 29","30 a 39","40 a 49","50 a 59","60 e mais"];
  const totalPop  = faixas.reduce((s, f) => s + getVal(dataMap.geral, f), 0);
  const totalJobs = getVal(dataMap.empregos_setor, ["Secundário","Secundario"]) +
                    getVal(dataMap.empregos_setor, ["Terciário","Terciario"]) +
                    getVal(dataMap.empregos_setor, "Outros");
  const rendaVal  = getVal(dataMap.renda, ["Renda (*) per Capita","Renda(*) Per Capita","Renda Per Capita","per Capita"]);

  const fmt = (n: number) => Math.round(n).toLocaleString("pt-BR");
  setStatText("stat-pop",    totalPop  ? fmt(totalPop)  : "N/D");
  setStatText("stat-jobs",   totalJobs ? fmt(totalJobs) : "N/D");
  setStatText("stat-cars",   dataMap.frota
    ? fmt(getVal(dataMap.frota, ["Automóvel","Automovel","Masculino"])) : "N/D");
  setStatText("stat-income", rendaVal
    ? `R$ ${rendaVal.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}` : "N/D");
}

function setStatText(id: string, text: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// CONTROLES
function initAnoSelector(selector: HTMLSelectElement): void {
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
    if (selector.value) await atualizarComparacao(selector);
  });
}

function initCompararCheckboxes(selector: HTMLSelectElement): void {
  const container = document.getElementById("comparar-anos");
  if (!container) return;
  OD_CONFIG.anos.forEach((ano) => {
    const label = document.createElement("label");
    label.style.cssText = "margin-right:15px;color:#a0a0a0;display:inline-flex;align-items:center;gap:4px;cursor:pointer;";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = String(ano);
    cb.addEventListener("change", async (e) => {
      const val = parseInt((e.target as HTMLInputElement).value);
      if ((e.target as HTMLInputElement).checked) {
        if (!compararAnos.includes(val)) {
          compararAnos.push(val);
          if (!cacheZonaIdPorAno[val] || Object.keys(cacheZonaIdPorAno[val]).length === 0) {
            await carregarMapaParaAno(val, selector);
          }
        }
      } else {
        compararAnos = compararAnos.filter((a) => a !== val);
      }
      if (selector.value) await atualizarComparacao(selector);
    });
    label.append(cb, ` ${OD_CONFIG.nomesAnos[ano]}`);
    container.appendChild(label);
  });
}

async function atualizarComparacao(selector: HTMLSelectElement): Promise<void> {
  const zoneName = selector.value;
  if (!zoneName) return;
  selector.disabled = true;
  try {
    const anosUnicos = [anoAtivo.value, ...compararAnos.filter((a) => a !== anoAtivo.value)];
    const dadosMultiAno = await carregarDadosZonaMultiAno(zoneName, anosUnicos);
    atualizarCardsBasicos(dadosMultiAno[anoAtivo.value] ?? {});
    renderGraficosFixos(dadosMultiAno[anoAtivo.value] ?? {});
    renderGraficosComparativos(dadosMultiAno, anosUnicos);
    highlightMapZone(zoneName);
  } finally {
    selector.disabled = false;
  }
}

// CARREGA ZONAS (dropdown — sempre do 2017)
async function loadZones(selector: HTMLSelectElement): Promise<void> {
  try {
    const fileName = getFileName("geral", 2017);
    const res = await fetch(getPathForAno(2017, fileName));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    const wb  = XLSX.read(new Uint8Array(buf), { type: "array" });
    const ws  = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<DataRow>(ws, { range: 6 });

    const nomeKey = data[0]
      ? Object.keys(data[0]).find((k) => normalize(k).includes("nome")) ?? Object.keys(data[0])[0]
      : null;

    selector.innerHTML = '<option value="">Selecione uma zona...</option>';

    const names = nomeKey
      ? data
          .map((r) => r[nomeKey]?.toString().trim() ?? "")
          .filter((n) => n && !n.toLowerCase().includes("total") && !n.toLowerCase().includes("fonte") && n.length > 1)
      : [];

    names.sort((a, b) => a.localeCompare(b, "pt-BR"));
    names.forEach((n) => selector.add(new Option(n, n)));

    if (!names.length) selector.innerHTML = '<option value="">Nenhuma zona encontrada</option>';
  } catch (e) {
    console.error("Erro ao carregar zonas:", e);
    selector.innerHTML = '<option value="">Erro ao carregar zonas</option>';
  }
}

// ENTRY POINT
export async function initODDashboard(): Promise<void> {
  Chart.defaults.color = "#a0a0a0";
  Chart.defaults.font.family = "'Segoe UI', sans-serif";

  const selector = document.getElementById("zone-selector") as HTMLSelectElement | null;
  if (!selector) return;

  await loadZones(selector);
  initAnoSelector(selector);
  initCompararCheckboxes(selector);
  await carregarMapaParaAno(2017, selector);

  selector.addEventListener("change", () => atualizarComparacao(selector));

  if (selector.options.length > 1) {
    selector.selectedIndex = 1;
    selector.dispatchEvent(new Event("change"));
  }
}