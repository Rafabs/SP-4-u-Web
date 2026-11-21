
import * as XLSX from "xlsx";
import Chart from "chart.js/auto";

type Registro = {
  data: Date | null;
  linha: string;
  concessionaria: string;
  supervisao: string;
  situacao: string;
  classificacao: string;
  descricao: string;
  ano: string;
  inicioFalha: boolean;
};

const ANOS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
const POR_PAGINA = 25;

// Início do ciclo operacional: 04h40.
const INICIO_OPERACAO_MINUTOS = 4 * 60 + 40;

let registros: Registro[] = [];
let pagina = 1;
let charts: Chart[] = [];
const ChartJS = Chart;
let excluirEncerradasNoDrilldown = false;

const $ = (id: string) => document.getElementById(id) as HTMLElement;

const value = (id: string) =>
  (($(id) as HTMLInputElement | HTMLSelectElement).value || "").trim();

function normalizarCabecalho(valor: unknown): string {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Padroniza situações equivalentes.
 */
function normalizarSituacao(situacao: unknown): string {
  const original = String(situacao ?? "");
  const normalizada = original
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ");

  if (
    normalizada === "paralisada" ||
    normalizada === "operacao paralisada"
  ) {
    return "Operação Paralisada";
  }

  return original.trim();
}

/**
 * Normaliza a descrição.
 */
function normalizarDescricao(descricao: string): string {
  return descricao
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim()
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ");
}

/**
 * Extrai o trecho afetado da descrição.
 *
 * Exemplos:
 * "via única Capão Redondo–Largo Treze"
 * "entre Santo Amaro e Largo Treze"
 * "trecho Capão Redondo - Santo Amaro"
 *
 * Retorna null quando não consegue identificar
 * claramente os dois extremos do trecho.
 */
function extrairTrechoAfetado(descricao: string): string | null {
  const texto = normalizarDescricao(descricao)
    .replace(/[–—]/g, "-");

  const padroes = [
    // Entre estação A e estação B.
    /(?:trecho\s+entre|entre)\s+(.+?)\s+(?:e|a|até|ate|-)\s+(.+?)(?=[,.;]|$)/i,

    // Via única A-B.
    /via\s+[úu]nica\s+(.+?)\s*-\s*(.+?)(?=[,.;]|$)/i,

    // Trecho A-B.
    /trecho\s+(.+?)\s*-\s*(.+?)(?=[,.;]|$)/i
  ];

  for (const padrao of padroes) {
    const resultado = texto.match(padrao);

    if (!resultado) continue;

    const origem = resultado[1]
      .trim()
      .replace(/\s+/g, " ");

    const destino = resultado[2]
      .trim()
      .replace(/\s+/g, " ");

    if (!origem || !destino) continue;

    return [origem, destino]
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
      .join(" | ");
  }

  return null;
}

/**
 * Converte a data para o ciclo operacional.
 *
 * Registros entre 00h00 e 04h39 pertencem
 * ao ciclo operacional do dia anterior.
 *
 * Exemplo:
 * 18/11 23h50 -> ciclo 18/11
 * 19/11 00h10 -> ciclo 18/11
 * 19/11 04h40 -> ciclo 19/11
 */
function obterDiaOperacional(data: Date): string {
  const minutos =
    data.getHours() * 60 + data.getMinutes();

  const dia = new Date(data);

  if (minutos < INICIO_OPERACAO_MINUTOS) {
    dia.setDate(dia.getDate() - 1);
  }

  const ano = dia.getFullYear();
  const mes = String(dia.getMonth() + 1).padStart(2, "0");
  const diaMes = String(dia.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${diaMes}`;
}

function dataRegistro(valor: unknown): Date | null {
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    return valor;
  }

  if (typeof valor === "number" && valor > 20000) {
    const date = new Date(
      Date.UTC(1899, 11, 30) + valor * 86400000
    );

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const texto = String(valor ?? "").trim();

  if (!texto) return null;

  const br = texto.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );

  if (br) {
    const [
      ,
      dia,
      mes,
      ano,
      hora = "00",
      minuto = "00",
      segundo = "00"
    ] = br;

    const date = new Date(
      Number(ano),
      Number(mes) - 1,
      Number(dia),
      Number(hora),
      Number(minuto),
      Number(segundo)
    );

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(texto);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function lerLinha(row: Record<string, unknown>): Registro | null {
  const campos = new Map<string, unknown>();

  for (const [key, val] of Object.entries(row)) {
    campos.set(normalizarCabecalho(key), val);
  }

  const get = (...keys: string[]) => {
    for (const key of keys) {
      const found = campos.get(normalizarCabecalho(key));

      if (found !== undefined && found !== null) {
        return String(found).trim();
      }
    }

    return "";
  };

  const data = dataRegistro(get("Data/Hora", "Data Hora", "Data"));
  const linha = get("Linha");

  if (!data && !linha) return null;

  return {
    data,
    linha,
    concessionaria: get("Concessionária", "Concessionaria", "Empresa"),
    supervisao: get("Supervisão", "Supervisao"),
    situacao: normalizarSituacao(get("Situação", "Situacao")),
    classificacao: get("Classificação", "Classificacao"),
    descricao: get("Descrição", "Descricao"),
    ano: data ? String(data.getFullYear()) : "",
    inicioFalha: false
  };
}

/**
 * Identifica registros encerrados.
 */
function isEncerrada(situacao: string): boolean {
  return String(situacao ?? "")
    .toLocaleLowerCase("pt-BR")
    .includes("encerrad");
}

/**
 * Situações que não representam falhas.
 */
function isFalhaParaGraficos(registro: Registro): boolean {
  const situacao = normalizarSituacao(registro.situacao);

  if (!situacao) return false;

  if (
    situacao === "Operação Normal" ||
    situacao === "Operação Transitória" ||
    situacao === "Operação Especial" ||
    situacao === "Atividade Programada" ||
    situacao === "Dados Indisponíveis" ||
    situacao === "Dados/Status Indisponíveis" ||
    situacao === "Status não disponível" ||
    situacao === "Operação Diferenciada" ||    
    situacao.toLowerCase().includes("encerrad")
  ) {
    return false;
  }

  return true;
}

/**
 * Identifica o início de cada ocorrência.
 *
 * Regras:
 *
 * 1. Operação Normal / Encerrada / Especial /
 *    Transitória finalizam a ocorrência ativa.
 *
 * 2. Uma nova falha após uma situação normal
 *    inicia uma nova ocorrência.
 *
 * 3. Mudança do trecho afetado inicia uma nova
 *    ocorrência, mesmo que a situação seja igual.
 *
 * 4. Mudanças na descrição que não alterem
 *    o trecho não geram nova ocorrência.
 *
 * 5. A ocorrência pode atravessar a meia-noite.
 *
 * 6. Às 04h40 começa um novo ciclo operacional.
 */
function marcarIniciosDeFalha(items: Registro[]): void {
  const cronologicos = [...items].sort(
    (a, b) =>
      (a.data?.getTime() ?? 0) -
      (b.data?.getTime() ?? 0)
  );

  type EstadoFalha = {
    diaOperacional: string;
    trecho: string | null;
  };

  const estadoPorLinha = new Map<string, EstadoFalha>();

  for (const registro of cronologicos) {
    registro.inicioFalha = false;

    if (!registro.data) {
      continue;
    }

    const linha = registro.linha
      .trim()
      .toLocaleLowerCase("pt-BR");

    if (!linha) continue;

    const falhaAtiva = isFalhaParaGraficos(registro);

    // Situação normal ou não considerada falha:
    // encerra a ocorrência ativa.
    if (!falhaAtiva) {
      estadoPorLinha.delete(linha);
      continue;
    }

    const diaOperacional = obterDiaOperacional(registro.data);
    const trechoAtual = extrairTrechoAfetado(registro.descricao);

    const estadoAnterior = estadoPorLinha.get(linha);

    // Primeira falha da linha ou novo ciclo operacional.
    if (
      !estadoAnterior ||
      estadoAnterior.diaOperacional !== diaOperacional
    ) {
      registro.inicioFalha = true;

      estadoPorLinha.set(linha, {
        diaOperacional,
        trecho: trechoAtual
      });

      continue;
    }

    // Se os dois trechos foram identificados e são diferentes,
    // considera-se uma nova ocorrência.
    const mudouTrecho =
      estadoAnterior.trecho !== null &&
      trechoAtual !== null &&
      estadoAnterior.trecho !== trechoAtual;

    if (mudouTrecho) {
      registro.inicioFalha = true;
    }

    // Atualiza o trecho somente quando foi possível identificá-lo.
    // Assim, uma descrição incompleta não apaga a última referência.
    estadoPorLinha.set(linha, {
      diaOperacional,
      trecho: trechoAtual ?? estadoAnterior.trecho
    });
  }
}

/**
 * Retorna o período real dos dados carregados.
 */
function obterPeriodoHistorico(items: Registro[]): string {
  let primeiraData: Date | null = null;
  let ultimaData: Date | null = null;

  for (const registro of items) {
    const data = registro.data;

    if (!data || Number.isNaN(data.getTime())) continue;

    if (!primeiraData || data < primeiraData) {
      primeiraData = data;
    }

    if (!ultimaData || data > ultimaData) {
      ultimaData = data;
    }
  }

  if (!primeiraData || !ultimaData) {
    return "Período indisponível";
  }

  const formatar = (data: Date) =>
    data.toLocaleDateString("pt-BR");

  return `${formatar(primeiraData)} até ${formatar(ultimaData)}`;
}

async function carregarPlanilhas() {
  const status = $("load-status");

  status.textContent = "Carregando planilhas...";

  const base = ((window as any).__BASE_URL__ || "")
    .replace(/\/$/, "");

  const acumulado: Registro[] = [];
  const erros: string[] = [];

  for (const ano of ANOS) {
    const url = `${base}/data/historico/ocorrencias/${ano}.xlsx`;

    try {
      const response = await fetch(url, {
        cache: "no-store"
      });

      if (!response.ok) {
        if (response.status === 404) {
          erros.push(`${ano}: arquivo não encontrado`);
          continue;
        }

        throw new Error(`HTTP ${response.status}`);
      }

      const workbook = XLSX.read(
        await response.arrayBuffer(),
        {
          type: "array",
          cellDates: true
        }
      );

      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
          raw: false
        }) as Record<string, unknown>[];

        for (const row of rows) {
          const registro = lerLinha(row);

          if (registro) {
            acumulado.push(registro);
          }
        }
      }
    } catch (error) {
      erros.push(`${ano}: ${(error as Error).message}`);
    }
  }

  marcarIniciosDeFalha(acumulado);

  acumulado.sort(
    (a, b) =>
      (b.data?.getTime() ?? 0) -
      (a.data?.getTime() ?? 0)
  );

  registros = acumulado;

  const periodo = obterPeriodoHistorico(registros);

  $("hero-record-count").textContent =
    registros.length.toLocaleString("pt-BR");

  const elementoPeriodo = document.getElementById(
    "historical-period"
  );

  if (elementoPeriodo) {
    elementoPeriodo.textContent = periodo;
  }

  status.textContent =
    `${registros.length.toLocaleString("pt-BR")} registros carregados` +
    ` · Período: ${periodo}` +
    (erros.length
      ? ` · ${erros.length} arquivo(s) indisponível(is)`
      : "");

  status.title =
    erros.join("\n") || "Todos os arquivos foram lidos.";

  popularFiltros();
  atualizar();
}

function popularSelect(id: string, itens: string[]) {
  const select = $(id) as HTMLSelectElement;
  const atual = select.value;
  const primeiro = select.options[0]?.outerHTML ?? "";

  select.innerHTML = primeiro;

  for (const item of itens) {
    const option = document.createElement("option");

    option.value = item;
    option.textContent = item;

    select.appendChild(option);
  }

  if (itens.includes(atual)) {
    select.value = atual;
  }
}

function popularFiltros() {
  popularSelect(
    "filter-year",
    [...new Set(registros.map(r => r.ano).filter(Boolean))].sort()
  );

  popularSelect(
    "filter-line",
    [...new Set(registros.map(r => r.linha).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
  );

  popularSelect(
    "filter-company",
    [...new Set(registros.map(r => r.concessionaria).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
  );

  popularSelect(
    "filter-situation",
    [...new Set(registros.map(r => r.situacao).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
  );

  popularSelect(
    "filter-class",
    [...new Set(registros.map(r => r.classificacao).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
  );
}

function filtrados(ignorarClassificacao = false): Registro[] {
  const ano = value("filter-year");
  const linha = value("filter-line");
  const empresa = value("filter-company");
  const situacao = value("filter-situation");
  const classificacao = value("filter-class");
  const inicio = value("filter-start");
  const fim = value("filter-end");

  const busca = value("search")
    .toLocaleLowerCase("pt-BR");

  return registros.filter(r => {
    // Encerradas nunca aparecem na tabela nem nos totais filtrados, mesmo se classificadas como Offline.\n    if (isEncerrada(r.situacao)) return false;\n\n    if (ano && r.ano !== ano) return false;
    if (linha && r.linha !== linha) return false;
    if (empresa && r.concessionaria !== empresa) return false;
    if (situacao && r.situacao !== situacao) return false;

    if (
      !ignorarClassificacao &&
      classificacao &&
      r.classificacao !== classificacao
    ) {
      return false;
    }

    if (
      excluirEncerradasNoDrilldown &&
      isEncerrada(r.situacao)
    ) {
      return false;
    }

    if (
      inicio &&
      (!r.data || r.data < new Date(`${inicio}T00:00:00`))
    ) {
      return false;
    }

    if (
      fim &&
      (!r.data || r.data > new Date(`${fim}T23:59:59`))
    ) {
      return false;
    }

    if (
      busca &&
      ![
        r.linha,
        r.concessionaria,
        r.situacao,
        r.classificacao,
        r.descricao
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(busca)
    ) {
      return false;
    }

    return true;
  });
}

function contarPor(
  items: Registro[],
  chave: (r: Registro) => string
) {
  const contagem = new Map<string, number>();

  for (const item of items) {
    const nome = chave(item) || "Não informado";

    contagem.set(
      nome,
      (contagem.get(nome) ?? 0) + 1
    );
  }

  return [...contagem.entries()]
    .sort((a, b) => b[1] - a[1]);
}

function destruirGraficos() {
  charts.forEach(chart => chart.destroy());
  charts = [];
}

function grafico(id: string, config: any) {
  const canvas = $(id) as HTMLCanvasElement;
  const chart = new ChartJS(canvas, config);

  charts.push(chart);
}

function chartInteractions(
  onSelect: (index: number) => void
) {
  return {
    onClick: (
      _event: unknown,
      elements: Array<{ index: number }>
    ) => {
      const index = elements[0]?.index;

      if (index !== undefined) {
        onSelect(index);
      }
    },

    onHover: (
      event: { native?: Event },
      elements: unknown[]
    ) => {
      const target = event.native?.target;

      if (target instanceof HTMLCanvasElement) {
        target.style.cursor = elements.length
          ? "pointer"
          : "default";
      }
    }
  };
}

/**
 * Aplica filtros ao clicar em um gráfico.
 */
function aplicarFiltroDoGrafico(
  id: string,
  selected: string
) {
  ($(id) as HTMLSelectElement).value = selected;

  excluirEncerradasNoDrilldown = true;

  ($("filter-class") as HTMLSelectElement).value = "";

  pagina = 1;
  atualizar();

  requestAnimationFrame(() => {
    $("records-title").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

/**
 * Aplica filtro mensal ao clicar no gráfico.
 */
function aplicarFiltroDeMes(monthKey: string) {
  const [year, month] = monthKey.split("-");

  const lastDay = new Date(
    Number(year),
    Number(month),
    0
  ).getDate();

  ($("filter-start") as HTMLInputElement).value =
    `${year}-${month}-01`;

  ($("filter-end") as HTMLInputElement).value =
    `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

  excluirEncerradasNoDrilldown = true;

  ($("filter-class") as HTMLSelectElement).value = "";

  pagina = 1;
  atualizar();

  requestAnimationFrame(() => {
    $("records-title").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

function atualizarGraficos() {
  const falhas = filtrados(true).filter(
    r => r.inicioFalha
  );

  destruirGraficos();

  const meses = new Map<string, number>();

  for (const r of falhas) {
    if (!r.data) continue;

    const key =
      `${r.data.getFullYear()}-${String(
        r.data.getMonth() + 1
      ).padStart(2, "0")}`;

    meses.set(
      key,
      (meses.get(key) ?? 0) + 1
    );
  }

  const mensal = [...meses.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]));

  const palette = [
    "#36b6a4",
    "#4d8de0",
    "#e0a84d",
    "#b477d1",
    "#e16c78",
    "#7e9aaf",
    "#a3b86c"
  ];

  const textColor =
    getComputedStyle(document.body)
      .getPropertyValue("--text-secondary")
      .trim() || "#aab6c5";

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        labels: {
          color: textColor
        }
      }
    },

    scales: {
      x: {
        ticks: {
          color: textColor
        },
        grid: {
          color: "rgba(148,163,184,.10)"
        }
      },

      y: {
        ticks: {
          color: textColor
        },
        grid: {
          color: "rgba(148,163,184,.10)"
        }
      }
    }
  };

  // Falhas por mês
  grafico("monthly-chart", {
    type: "bar",

    data: {
      labels: mensal.map(([key]) => {
        const [year, month] = key.split("-");
        return `${month}/${year}`;
      }),

      datasets: [{
        label: "Falhas únicas",
        data: mensal.map(([, count]) => count),
        backgroundColor: "#e16c78",
        borderRadius: 5
      }]
    },

    options: {
      ...baseOptions,
      ...chartInteractions(index =>
        aplicarFiltroDeMes(mensal[index][0])
      )
    }
  });

  // Falhas por situação
  const situacoes = contarPor(
    falhas,
    r => r.situacao
  );

  grafico("situation-chart", {
    type: "doughnut",

    data: {
      labels: situacoes.map(x => x[0]),

      datasets: [{
        data: situacoes.map(x => x[1]),
        backgroundColor: palette,
        borderWidth: 0
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      ...chartInteractions(index =>
        aplicarFiltroDoGrafico(
          "filter-situation",
          situacoes[index][0]
        )
      ),

      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: textColor,
            boxWidth: 10,
            padding: 14
          }
        }
      }
    }
  });

  // Falhas por linha
  const linhas = contarPor(
    falhas,
    r => r.linha
  )
    .slice(0, 15)
    .reverse();

  grafico("line-chart", {
    type: "bar",

    data: {
      labels: linhas.map(x => x[0]),

      datasets: [{
        label: "Falhas únicas",
        data: linhas.map(x => x[1]),
        backgroundColor: "#4d8de0",
        borderRadius: 4
      }]
    },

    options: {
      ...baseOptions,

      ...chartInteractions(index =>
        aplicarFiltroDoGrafico(
          "filter-line",
          linhas[index][0]
        )
      ),

      indexAxis: "y",

      plugins: {
        legend: {
          display: false
        }
      }
    }
  });

  // Falhas por concessionária
  const empresas = contarPor(
    falhas,
    r => r.concessionaria
  ).reverse();

  grafico("company-chart", {
    type: "bar",

    data: {
      labels: empresas.map(x => x[0]),

      datasets: [{
        label: "Falhas únicas",
        data: empresas.map(x => x[1]),
        backgroundColor: "#b477d1",
        borderRadius: 4
      }]
    },

    options: {
      ...baseOptions,

      ...chartInteractions(index =>
        aplicarFiltroDoGrafico(
          "filter-company",
          empresas[index][0]
        )
      ),

      indexAxis: "y",

      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function renderTabela(items: Registro[]) {
  const inicio = (pagina - 1) * POR_PAGINA;

  const paginaItens = items.slice(
    inicio,
    inicio + POR_PAGINA
  );

  const body = $("records-body");

  body.replaceChildren();

  if (!items.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");

    td.colSpan = 6;
    td.className = "empty";
    td.textContent = "Nenhum registro encontrado.";

    tr.appendChild(td);
    body.appendChild(tr);
  } else {
    for (const r of paginaItens) {
      const tr = document.createElement("tr");

      const data = r.data
        ? r.data.toLocaleString("pt-BR")
        : "—";

      for (const text of [
        data,
        r.linha,
        r.concessionaria,
        r.situacao,
        r.classificacao,
        r.descricao
      ]) {
        const td = document.createElement("td");

        td.textContent = text || "—";

        tr.appendChild(td);
      }

      body.appendChild(tr);
    }
  }

  const totalPaginas = Math.max(
    1,
    Math.ceil(items.length / POR_PAGINA)
  );

  $("page-info").textContent =
    `Página ${pagina} de ${totalPaginas}`;

  $("prev-page").toggleAttribute(
    "disabled",
    pagina <= 1
  );

  $("next-page").toggleAttribute(
    "disabled",
    pagina >= totalPaginas
  );

  $("table-summary").textContent =
    `${items.length.toLocaleString("pt-BR")} registros encontrados`;
}

function atualizar() {
  const items = filtrados();

  const problemas = items.filter(
    r => r.inicioFalha
  ).length;

  $("kpi-total").textContent =
    items.length.toLocaleString("pt-BR");

  $("kpi-problems").textContent =
    problemas.toLocaleString("pt-BR");

  $("kpi-lines").textContent =
    new Set(
      items.map(r => r.linha).filter(Boolean)
    ).size.toLocaleString("pt-BR");

  $("kpi-companies").textContent =
    new Set(
      items.map(r => r.concessionaria).filter(Boolean)
    ).size.toLocaleString("pt-BR");

  pagina = Math.min(
    pagina,
    Math.max(
      1,
      Math.ceil(items.length / POR_PAGINA)
    )
  );

  renderTabela(items);
  atualizarGraficos();
}

export function initHistoricalDashboard() {
  const ids = [
    "filter-year",
    "filter-line",
    "filter-company",
    "filter-situation",
    "filter-class",
    "filter-start",
    "filter-end",
    "search"
  ];

  ids.forEach(id => {
    $(id).addEventListener("input", () => {
      pagina = 1;
      atualizar();
    });
  });

  $("clear-filters").addEventListener("click", () => {
    ids.forEach(id => {
      (
        $(id) as
          | HTMLInputElement
          | HTMLSelectElement
      ).value = "";
    });

    excluirEncerradasNoDrilldown = false;

    pagina = 1;
    atualizar();
  });

  $("reload").addEventListener("click", () => {
    void carregarPlanilhas();
  });

  $("prev-page").addEventListener("click", () => {
    pagina = Math.max(1, pagina - 1);
    renderTabela(filtrados());
  });

  $("next-page").addEventListener("click", () => {
    pagina += 1;
    renderTabela(filtrados());
  });

  void carregarPlanilhas().catch(error => {
    $("load-status").textContent =
      `Falha ao carregar: ${(error as Error).message}`;

    $("records-body").innerHTML =
      '<tr><td colspan="6" class="empty">Não foi possível carregar os arquivos XLSX.</td></tr>';
  });
}