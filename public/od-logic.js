// od-logic.js

import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js";
import "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js";

// Configuração dos anos
const OD_CONFIG = {
  anos: [1997, 2007, 2017],
  fontes: {
    geral: "Tab02_OD{ano}.{ext}",
    genero: "Tab03_OD{ano}.{ext}",
    frota: "Tab04_OD{ano}.{ext}",
    idade: "Tab02_OD{ano}.{ext}",
    escolaridade: "Tab05_OD{ano}.{ext}",
    renda: "Tab06_OD{ano}.{ext}",
    modos: "Tab16_OD{ano}.{ext}",
    motivos: "Tab18_OD{ano}.{ext}",
    vinculo: "Tab08_OD{ano}.{ext}",
    atividade: "Tab09_OD{ano}.{ext}",
    matriculas: "Tab10_OD{ano}.{ext}",
    empregos_setor: "Tab11_OD{ano}.{ext}",
    empregos_vinculo: "Tab13_OD{ano}.{ext}",
    empregos_externo: "Tab15_OD{ano}.{ext}",
    viagens_atraidas: "Tab21_OD{ano}.{ext}",
    tempo_viagem: "Tab20_OD{ano}.{ext}",
    viagens_pe: "Tab19_OD{ano}.{ext}",
  },
  // Extensão dos arquivos por ano
  extensoes: {
    1997: "xls",
    2007: "xlsx",
    2017: "xlsx",
  },
  // Nome do arquivo GeoJSON para cada ano
  geoJson: {
    1997: "Zonas_1997_region.json",
    2007: "Zonas_2007_region.json",
    2017: "Zonas_2017_region.json",
  },
  cores: {
    1997: "#3498db", // Azul
    2007: "#f39c12", // Laranja
    2017: "#d40000", // Vermelho
  },
  nomesAnos: {
    1997: "1997",
    2007: "2007",
    2017: "2017",
  },
};

window.initODDashboard = async function (basePath) {
  const ChartJS = window.Chart;
  let charts = {};
  let map = null;
  let geoJsonLayer = null;
  let allZonesData = {};
  let currentGeoJson = null;

  ChartJS.defaults.color = "#a0a0a0";
  ChartJS.defaults.font.family = "'Segoe UI', sans-serif";

  // Garantir que o XLSX esteja disponível (SheetJS)
  const _XLSX = XLSX.read
    ? XLSX
    : XLSX.default?.read
      ? XLSX.default
      : window.XLSX;
  if (!_XLSX) {
    console.error("Biblioteca XLSX não encontrada.");
    return;
  }

  const anosDisponiveis = OD_CONFIG.anos;
  const anoAtivo = { value: 2017 };
  let compararAnos = [];

  const selector = document.getElementById("zone-selector");
  const anoSelector = document.getElementById("ano-selector");
  const compararContainer = document.getElementById("comparar-anos");

  // Cache para planilhas
  const cachePlanilhas = {};

  // --- FUNÇÕES AUXILIARES DE CAMINHO ---

  function getFileName(key, ano) {
    const template = OD_CONFIG.fontes[key];
    const ext = OD_CONFIG.extensoes[ano] || "xlsx";
    return template.replace("{ano}", ano).replace("{ext}", ext);
  }

  function getPathForAno(ano, fileName) {
    const cleanBase =
      basePath === "/"
        ? ""
        : basePath.endsWith("/")
          ? basePath.slice(0, -1)
          : basePath;
    return `${cleanBase}/origem_destino/${ano}/${fileName}`.replace(
      /\/+/g,
      "/",
    );
  }

  function getGeoJsonPath(ano) {
    const cleanBase =
      basePath === "/"
        ? ""
        : basePath.endsWith("/")
          ? basePath.slice(0, -1)
          : basePath;
    return `${cleanBase}/origem_destino/${ano}/${OD_CONFIG.geoJson[ano]}`.replace(
      /\/+/g,
      "/",
    );
  }

  // --- FUNÇÕES DO MAPA ---

  async function carregarMapaParaAno(ano) {
    if (typeof L === "undefined") {
      console.warn("Leaflet não está carregado.");
      return false;
    }

    const mapElement = document.getElementById("map");
    if (!mapElement) return false;

    try {
      const geoJsonPath = getGeoJsonPath(ano);
      console.log(`Carregando GeoJSON de ${ano}:`, geoJsonPath);

      const response = await fetch(geoJsonPath);
      if (!response.ok) {
        console.warn(`GeoJSON não encontrado para ${ano}:`, geoJsonPath);
        return false;
      }

      const geojsonData = await response.json();
      currentGeoJson = geojsonData;

      if (!map) {
        map = L.map("map").setView([-23.5505, -46.6333], 10);

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          { attribution: "©OpenStreetMap" },
        ).addTo(map);
      }

      if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
      }

      geoJsonLayer = L.geoJSON(geojsonData, {
        style: {
          color: OD_CONFIG.cores[ano] || "#d40000",
          weight: 2,
          fillOpacity: 0.2,
        },
        onEachFeature: (feature, layer) => {
          const nomeZona =
            feature.properties.NomeZona ||
            feature.properties.nome ||
            feature.properties.NOME ||
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
      console.error(`Erro ao carregar o mapa para ${ano}:`, e);
      return false;
    }
  }

  function highlightMapZone(zoneName, ano = anoAtivo.value) {
    if (!geoJsonLayer || !map) return;

    geoJsonLayer.eachLayer((layer) => {
      const featName =
        layer.feature.properties.NomeZona ||
        layer.feature.properties.nome ||
        layer.feature.properties.NOME;

      if (featName && featName.toString().trim() === zoneName.trim()) {
        layer.setStyle({
          fillOpacity: 0.6,
          weight: 4,
          color: "#ffffff",
        });
        map.fitBounds(layer.getBounds(), { padding: [50, 50], maxZoom: 15 });
      } else {
        geoJsonLayer.resetStyle(layer);
      }
    });
  }

  // --- FUNÇÃO PRINCIPAL PARA CARREGAR DADOS NORMALIZADOS ---
  async function getExcelDataNormalizado(ano, key) {
    try {
      const fileName = getFileName(key, ano);
      const filePath = getPathForAno(ano, fileName);
      console.log(`Carregando dados de ${ano}:`, filePath);

      const response = await fetch(filePath);
      if (!response.ok) {
        console.warn(`Arquivo não encontrado: ${filePath}`);
        return [];
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = _XLSX.read(new Uint8Array(arrayBuffer), {
        type: "array",
      });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      if (ano === 1997 || ano === 2007) {
        const dadosBrutos = _XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (EXTRATORES[ano] && EXTRATORES[ano][key]) {
          const dadosNormalizados = EXTRATORES[ano][key](dadosBrutos);
          return dadosNormalizados;
        } else {
          return extrairDadosGenerico1997_2007(dadosBrutos);
        }
      } else {
        const jsonData = _XLSX.utils.sheet_to_json(sheet, { range: 6 });
        console.log(
          `Colunas detectadas em ${ano}:`,
          Object.keys(jsonData[0] || {}),
        );
        return jsonData;
      }
    } catch (e) {
      console.error(`Erro ao carregar ${key} para ${ano}:`, e);
      return [];
    }
  }

  // Função findZone melhorada
  function findZone(dataArray, zoneName) {
    if (!dataArray || dataArray.length === 0) {
      console.log(`findZone: dataArray vazio para ${zoneName}`);
      return null;
    }
    
    const termoBusca = zoneName.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    
    console.log(`findZone: Buscando por "${zoneName}" (normalizado: "${termoBusca}") em ${dataArray.length} registros`);
    
    const encontrado = dataArray.find(row => {
      for (const [key, valor] of Object.entries(row)) {
        if (valor === null || valor === undefined) continue;
        
        const valorStr = valor.toString().toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim();
        
        if (valorStr.includes(termoBusca)) {
          console.log(`✅ Encontrado! Campo "${key}" = "${valor}"`);
          return true;
        }
        
        if (termoBusca.includes(valorStr) && valorStr.length > 3) {
          console.log(`✅ Encontrado por correspondência parcial! Campo "${key}" = "${valor}"`);
          return true;
        }
      }
      return false;
    });
    
    return encontrado;
  }

// Substitua a função getVal por esta versão mais robusta
// Substitua a função getVal por esta versão com debug
const getVal = (row, searchTerms) => {
  if (!row) {
    console.log(`getVal: row é null/undefined para termo ${searchTerms}`);
    return 0;
  }

  const terms = Array.isArray(searchTerms) ? searchTerms : [searchTerms];
  
  console.log(`\n🔍 getVal: buscando por ${JSON.stringify(terms)}`);
  console.log("📦 Dados disponíveis:", row);
  console.log("🔑 Chaves:", Object.keys(row));

  for (const term of terms) {
    console.log(`  Procurando por "${term}"...`);
    
    // Estratégia 1: Procura por chave que corresponda exatamente
    if (row[term] !== undefined) {
      const value = row[term];
      console.log(`    ✅ Encontrado exato! ${term} = ${value}`);
      return typeof value === "number" ? value : parseFloat(value) || 0;
    }
    
    // Estratégia 2: Procura por chave que contenha o termo
    for (const [key, value] of Object.entries(row)) {
      const keyNorm = key.toLowerCase().replace(/\s+/g, " ").trim();
      const termNorm = term.toLowerCase().replace(/\s+/g, " ").trim();
      
      if (keyNorm.includes(termNorm)) {
        console.log(`    ✅ Encontrado por chave! ${key} = ${value}`);
        return typeof value === "number" ? value : parseFloat(value) || 0;
      }
    }
    
    // Estratégia 3: Para dados de 1997/2007, tenta colunas específicas
    if (term === 'Masculino' && row['Coluna_3']) {
      console.log(`    ✅ Usando fallback Masculino: Coluna_3 = ${row['Coluna_3']}`);
      return parseFloat(row['Coluna_3']) || 0;
    }
    if (term === 'Feminino' && row['Coluna_4']) {
      console.log(`    ✅ Usando fallback Feminino: Coluna_4 = ${row['Coluna_4']}`);
      return parseFloat(row['Coluna_4']) || 0;
    }
  }
  
  console.log(`  ❌ Nenhum valor encontrado para ${terms.join(', ')}`);
  return 0;
};

// Extrator específico para dados de gênero
function extrairDadosGenero1997_2007(dadosBrutos) {
  if (!dadosBrutos || dadosBrutos.length < 10) return [];
  
  const resultados = [];
  let inicioDados = -1;
  
  for (let i = 0; i < Math.min(15, dadosBrutos.length); i++) {
    const linha = dadosBrutos[i];
    if (!linha) continue;
    
    const linhaStr = JSON.stringify(linha).toLowerCase();
    if (linhaStr.includes('masculino') && linhaStr.includes('feminino')) {
      inicioDados = i + 2;
      break;
    }
  }
  
  if (inicioDados === -1) return [];
  
  for (let i = inicioDados; i < dadosBrutos.length; i++) {
    const linha = dadosBrutos[i];
    if (!linha || linha.length < 4) continue;
    
    const nomeZona = linha[1]?.toString().trim();
    if (!nomeZona || nomeZona.includes('Total')) continue;
    
    resultados.push({
      Nome: nomeZona,
      'Masculino': parseFloat(linha[2]) || 0,
      'Feminino': parseFloat(linha[3]) || 0
    });
  }
  
  return resultados;
}

// Extrator específico para dados de idade
function extrairDadosIdade1997_2007(dadosBrutos) {
  if (!dadosBrutos || dadosBrutos.length < 10) return [];
  
  const resultados = [];
  let inicioDados = -1;
  
  for (let i = 0; i < Math.min(15, dadosBrutos.length); i++) {
    const linha = dadosBrutos[i];
    if (!linha) continue;
    
    const linhaStr = JSON.stringify(linha).toLowerCase();
    if (linhaStr.includes('até 3') || linhaStr.includes('4 a 6')) {
      inicioDados = i + 2;
      break;
    }
  }
  
  if (inicioDados === -1) return [];
  
  for (let i = inicioDados; i < dadosBrutos.length; i++) {
    const linha = dadosBrutos[i];
    if (!linha || linha.length < 13) continue;
    
    const nomeZona = linha[1]?.toString().trim();
    if (!nomeZona || nomeZona.includes('Total')) continue;
    
    resultados.push({
      Nome: nomeZona,
      'até 3': parseFloat(linha[2]) || 0,
      '4 a 6': parseFloat(linha[3]) || 0,
      '7 a 10': parseFloat(linha[4]) || 0,
      '11 a 14': parseFloat(linha[5]) || 0,
      '15 a 17': parseFloat(linha[6]) || 0,
      '18 a 22': parseFloat(linha[7]) || 0,
      '23 a 29': parseFloat(linha[8]) || 0,
      '30 a 39': parseFloat(linha[9]) || 0,
      '40 a 49': parseFloat(linha[10]) || 0,
      '50 a 59': parseFloat(linha[11]) || 0,
      '60 e mais': parseFloat(linha[12]) || 0
    });
  }
  
  return resultados;
}

// Extrator específico para modos de transporte
function extrairDadosModos1997_2007_Novo(dadosBrutos) {
  if (!dadosBrutos || dadosBrutos.length < 10) return [];
  
  const resultados = [];
  let inicioDados = -1;
  
  for (let i = 0; i < Math.min(15, dadosBrutos.length); i++) {
    const linha = dadosBrutos[i];
    if (!linha) continue;
    
    const linhaStr = JSON.stringify(linha).toLowerCase();
    if (linhaStr.includes('metro') || linhaStr.includes('trem')) {
      inicioDados = i + 2;
      break;
    }
  }
  
  if (inicioDados === -1) return [];
  
  for (let i = inicioDados; i < dadosBrutos.length; i++) {
    const linha = dadosBrutos[i];
    if (!linha || linha.length < 8) continue;
    
    const nomeZona = linha[1]?.toString().trim();
    if (!nomeZona || nomeZona.includes('Total')) continue;
    
    resultados.push({
      Nome: nomeZona,
      'Metrô': parseFloat(linha[2]) || 0,
      'Trem': parseFloat(linha[3]) || 0,
      'Ônibus': parseFloat(linha[4]) || 0,
      'Dirigindo automóvel': parseFloat(linha[5]) || 0,
      'Passageiro de automóvel': parseFloat(linha[6]) || 0,
      'Bicicleta': parseFloat(linha[7]) || 0,
      'A pé': parseFloat(linha[8]) || 0
    });
  }
  
  return resultados;
}
  // --- FUNÇÕES DE CARREGAMENTO DE DADOS MULTI-ANO ---
  async function carregarDadosZonaMultiAno(zoneName, anos = [anoAtivo.value]) {
    const resultados = {};

    for (const ano of anos) {
      const dataMap = {};
      const fontes = Object.keys(OD_CONFIG.fontes);

      const promises = fontes.map(async (key) => {
        const cacheKey = `${ano}_${key}`;

        if (!cachePlanilhas[cacheKey]) {
          console.log(`Buscando e cacheando: ${ano} - ${key}`);
          cachePlanilhas[cacheKey] = await getExcelDataNormalizado(ano, key);
        }

        return { key, data: cachePlanilhas[cacheKey] };
      });

      const results = await Promise.all(promises);

      results.forEach(({ key, data }) => {
        if (data) {
          dataMap[key] = findZone(data, zoneName);
        } else {
          dataMap[key] = null;
        }
      });

      resultados[ano] = dataMap;
    }

    return resultados;
  }

  // --- FUNÇÕES DE RENDERIZAÇÃO DE GRÁFICOS ---
  function createTooltipWithPercentage(total) {
    return {
      callbacks: {
        label: (context) => {
          const label = context.label || "";
          const value = context.raw;
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          return `${label}: ${value.toLocaleString("pt-BR")} (${percentage}%)`;
        },
      },
    };
  }

  function renderChart(id, type, data, options = {}) {
    const canvas = document.getElementById(id);
    if (!canvas) {
      console.warn(`Canvas com id '${id}' não encontrado.`);
      return;
    }
    const ctx = canvas.getContext("2d");

    if (charts[id]) {
      charts[id].destroy();
    }

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#a0a0a0",
            font: { size: 11 },
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
      },
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);

    try {
      charts[id] = new ChartJS(ctx, {
        type: type,
        data: data,
        options: mergedOptions,
      });
    } catch (error) {
      console.error(`Erro ao criar gráfico ${id}:`, error);
    }
  }

  // --- INICIALIZAÇÃO DOS CONTROLES ---
  function initAnoSelector() {
    if (!anoSelector) return;

    anoSelector.innerHTML = "";
    anosDisponiveis.forEach((ano) => {
      const opt = document.createElement("option");
      opt.value = ano;
      opt.textContent = OD_CONFIG.nomesAnos[ano] || ano;
      if (ano === 2017) opt.selected = true;
      anoSelector.appendChild(opt);
    });

    anoSelector.addEventListener("change", async (e) => {
      const novoAno = parseInt(e.target.value);
      anoAtivo.value = novoAno;

      await carregarMapaParaAno(novoAno);

      if (selector.value) {
        await atualizarComparacao();
      }
    });
  }

  function initCompararCheckboxes() {
    if (!compararContainer) return;

    compararContainer.innerHTML = "";
    anosDisponiveis.forEach((ano) => {
      const label = document.createElement("label");
      label.style.marginRight = "15px";
      label.style.color = "#a0a0a0";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = ano;
      checkbox.checked = false;

      checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          compararAnos = [...compararAnos, parseInt(e.target.value)];
        } else {
          compararAnos = compararAnos.filter(
            (a) => a !== parseInt(e.target.value),
          );
        }
        if (selector.value) {
          selector.dispatchEvent(new Event("change"));
        }
      });

      label.appendChild(checkbox);
      label.appendChild(
        document.createTextNode(` ${OD_CONFIG.nomesAnos[ano] || ano}`),
      );
      compararContainer.appendChild(label);
    });
  }

// --- ATUALIZAÇÃO DA INTERFACE ---
async function atualizarComparacao() {
  const zoneName = selector.value;
  if (!zoneName) return;

  selector.disabled = true;

  const anosParaCarregar = [anoAtivo.value, ...compararAnos];
  const dadosMultiAno = await carregarDadosZonaMultiAno(
    zoneName,
    anosParaCarregar,
  );

  await atualizarCardsBasicos(dadosMultiAno[anoAtivo.value]);
  await atualizarGraficosComparativos(dadosMultiAno, anosParaCarregar);

  highlightMapZone(zoneName, anoAtivo.value);
  selector.disabled = false;
}

  // --- ATUALIZAÇÃO DOS CARDS BÁSICOS ---
  async function atualizarCardsBasicos(dataMap) {
    const { geral, frota, renda } = dataMap;

    let totalPop = 0;
    if (geral) {
      const faixas = [
        "até 3",
        "4 a 6",
        "7 a 10",
        "11 a 14",
        "15 a 17",
        "18 a 22",
        "23 a 29",
        "30 a 39",
        "40 a 49",
        "50 a 59",
        "60 e mais",
      ];
      totalPop = faixas.reduce((sum, faixa) => sum + getVal(geral, faixa), 0);
    }
    document.getElementById("stat-pop").textContent = totalPop
      ? Math.round(totalPop).toLocaleString("pt-BR")
      : "N/D";

    let totalJobs = 0;
    const empSetor = dataMap.empregos_setor;
    if (empSetor) {
      totalJobs =
        getVal(empSetor, "Secundário") +
        getVal(empSetor, "Terciário") +
        getVal(empSetor, "Outros");
    }
    document.getElementById("stat-jobs").textContent = totalJobs
      ? Math.round(totalJobs).toLocaleString("pt-BR")
      : "N/D";

    document.getElementById("stat-cars").textContent = frota
      ? Math.round(getVal(frota, "Automóvel")).toLocaleString("pt-BR")
      : "N/D";

    if (renda) {
      const val = getVal(renda, "Renda(*) Per Capita");
      document.getElementById("stat-income").textContent = val
        ? `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "N/D";
    } else {
      document.getElementById("stat-income").textContent = "N/D";
    }
  }

  // --- GRÁFICOS FIXOS (apenas ano ativo) ---
  async function renderGraficosFixos(dataMap) {
    // Gênero
    const genero = dataMap.genero;
    const masc = getVal(genero, "Masculino");
    const fem = getVal(genero, "Feminino");
    const totalGenero = masc + fem;

    renderChart(
      "chart-genero",
      "pie",
      {
        labels: ["Masculino", "Feminino"],
        datasets: [
          {
            data: [masc, fem],
            backgroundColor: ["#d40000", "#444444"],
            borderColor: "#1e1e1e",
            borderWidth: 2,
          },
        ],
      },
      { plugins: { tooltip: createTooltipWithPercentage(totalGenero) } },
    );

    // Escolaridade
    const escolaridade = dataMap.escolaridade;
    const fundamental = getVal(escolaridade, "Fundamental");
    const medio = getVal(escolaridade, "Médio");
    const superior = getVal(escolaridade, "Superior");
    const totalEscolaridade = fundamental + medio + superior;

    renderChart(
      "chart-escolaridade",
      "bar",
      {
        labels: ["Fundamental", "Médio", "Superior"],
        datasets: [
          {
            label: "Pessoas",
            data: [fundamental, medio, superior],
            backgroundColor: ["#333333", "#666666", "#d40000"],
          },
        ],
      },
      {
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                const percentage =
                  totalEscolaridade > 0
                    ? ((value / totalEscolaridade) * 100).toFixed(1)
                    : 0;
                return `${context.dataset.label}: ${value.toLocaleString("pt-BR")} (${percentage}%)`;
              },
            },
          },
        },
      },
    );

    // Matrículas
    const matriculas = dataMap.matriculas;
    const publicas = getVal(matriculas, "Pública");
    const particulares = getVal(matriculas, "Particular");
    const totalMatriculas = publicas + particulares;

    renderChart(
      "chart-matriculas",
      "doughnut",
      {
        labels: ["Pública", "Particular"],
        datasets: [
          {
            data: [publicas, particulares],
            backgroundColor: ["#d40000", "#333333"],
            borderColor: "#1e1e1e",
          },
        ],
      },
      { plugins: { tooltip: createTooltipWithPercentage(totalMatriculas) } },
    );

    // Razões para Viagens a Pé
    const viagensPe = dataMap.viagens_pe;
    const peData = [
      getVal(viagensPe, "Pequena Distância"),
      getVal(viagensPe, "Condução Cara"),
      getVal(viagensPe, "Ponto/Estação Distante"),
      getVal(viagensPe, "Atividade Física"),
    ];
    const totalPe = peData.reduce((a, b) => a + b, 0);

    if (totalPe > 0) {
      renderChart(
        "chart-razoes-pe",
        "pie",
        {
          labels: [
            "Pequena Distância",
            "Condução Cara",
            "Ponto Distante",
            "Atividade Física",
          ],
          datasets: [
            {
              data: peData,
              backgroundColor: ["#d40000", "#333333", "#666666", "#999999"],
              borderColor: "#1e1e1e",
            },
          ],
        },
        { plugins: { tooltip: createTooltipWithPercentage(totalPe) } },
      );
    }
  }

  // --- GRÁFICOS COMPARATIVOS ---
  async function renderComparativoModos(dadosMultiAno, anos) {
    const datasets = [];
    const labels = ["Metrô", "Trem", "Ônibus", "Carro", "Bicicleta", "A pé"];

    anos.forEach((ano) => {
      const dataMap = dadosMultiAno[ano];
      const modos = dataMap.modos;

      const dados = [
        getVal(modos, "Metrô"),
        getVal(modos, "Trem"),
        getVal(modos, "Ônibus"),
        getVal(modos, "Dirigindo automóvel") +
          getVal(modos, "Passageiro de automóvel"),
        getVal(modos, "Bicicleta"),
        getVal(modos, "A pé"),
      ];

      datasets.push({
        label: OD_CONFIG.nomesAnos[ano],
        data: dados,
        backgroundColor: OD_CONFIG.cores[ano],
      });
    });

    renderChart(
      "chart-modos",
      "bar",
      { labels, datasets },
      {
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                return `${context.dataset.label}: ${value.toLocaleString("pt-BR")} viagens`;
              },
            },
          },
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Viagens" } },
        },
      },
    );
  }

  async function renderComparativoIdade(dadosMultiAno, anos) {
    const datasets = [];
    const labels = ["0-17", "18-39", "40-59", "60+"];

    anos.forEach((ano) => {
      const dataMap = dadosMultiAno[ano];
      const idade = dataMap.idade;

      const dados = [
        getVal(idade, "até 3") +
          getVal(idade, "4 a 6") +
          getVal(idade, "7 a 10") +
          getVal(idade, "11 a 14") +
          getVal(idade, "15 a 17"),
        getVal(idade, "18 a 22") +
          getVal(idade, "23 a 29") +
          getVal(idade, "30 a 39"),
        getVal(idade, "40 a 49") + getVal(idade, "50 a 59"),
        getVal(idade, "60 e mais"),
      ];

      datasets.push({
        label: OD_CONFIG.nomesAnos[ano],
        data: dados,
        backgroundColor: OD_CONFIG.cores[ano],
      });
    });

    renderChart(
      "chart-idade",
      "bar",
      { labels, datasets },
      {
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${context.raw.toLocaleString("pt-BR")} pessoas`,
            },
          },
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Pessoas" } },
        },
      },
    );
  }

  async function renderComparativoMotivos(dadosMultiAno, anos) {
    const datasets = [];
    const labels = ["Trabalho", "Educação", "Compras", "Saúde", "Lazer"];

    anos.forEach((ano) => {
      const dataMap = dadosMultiAno[ano];
      const motivos = dataMap.motivos;

      const dados = [
        getVal(motivos, "Trabalho Indústria") +
          getVal(motivos, "Trabalho Comércio") +
          getVal(motivos, "Trabalho Serviços"),
        getVal(motivos, "Educação"),
        getVal(motivos, "Compras"),
        getVal(motivos, "Saúde"),
        getVal(motivos, "Lazer"),
      ];

      datasets.push({
        label: OD_CONFIG.nomesAnos[ano],
        data: dados,
        backgroundColor: OD_CONFIG.cores[ano],
      });
    });

    renderChart(
      "chart-motivos",
      "bar",
      { labels, datasets },
      {
        indexAxis: "y",
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${context.raw.toLocaleString("pt-BR")} viagens`,
            },
          },
        },
        scales: {
          x: { beginAtZero: true, title: { display: true, text: "Viagens" } },
        },
      },
    );
  }

  async function renderComparativoVinculo(dadosMultiAno, anos) {
    const datasets = [];
    const labels = [
      "Com Carteira",
      "Sem Carteira",
      "Público",
      "Autônomo",
      "Empregador",
    ];

    anos.forEach((ano) => {
      const dataMap = dadosMultiAno[ano];
      const vinculo = dataMap.vinculo;

      const dados = [
        getVal(vinculo, "Assalariado com Carteira"),
        getVal(vinculo, "Assalariado sem Carteira"),
        getVal(vinculo, "Funcionário Público"),
        getVal(vinculo, "Autônomo"),
        getVal(vinculo, "Empregador"),
      ];

      datasets.push({
        label: OD_CONFIG.nomesAnos[ano],
        data: dados,
        backgroundColor: OD_CONFIG.cores[ano],
      });
    });

    renderChart(
      "chart-vinculo",
      "bar",
      { labels, datasets },
      {
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${context.raw.toLocaleString("pt-BR")} pessoas`,
            },
          },
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Pessoas" } },
        },
      },
    );
  }

  async function renderComparativoAtividade(dadosMultiAno, anos) {
    const datasets = [];
    const labels = ["Ocupado", "Aposentado", "Sem Trabalho", "Estudante"];

    anos.forEach((ano) => {
      const dataMap = dadosMultiAno[ano];
      const atividade = dataMap.atividade;

      const dados = [
        getVal(atividade, "Ocupado"),
        getVal(atividade, "Aposentado"),
        getVal(atividade, "Sem Trabalho"),
        getVal(atividade, "Estudante"),
      ];

      datasets.push({
        label: OD_CONFIG.nomesAnos[ano],
        data: dados,
        backgroundColor: OD_CONFIG.cores[ano],
      });
    });

    renderChart(
      "chart-atividade",
      "bar",
      { labels, datasets },
      {
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${context.raw.toLocaleString("pt-BR")} pessoas`,
            },
          },
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Pessoas" } },
        },
      },
    );
  }

  async function renderComparativoSetor(dadosMultiAno, anos) {
    const datasets = [];
    const labels = ["Indústria", "Serviços", "Outros"];

    anos.forEach((ano) => {
      const dataMap = dadosMultiAno[ano];
      const setor = dataMap.empregos_setor;

      const dados = [
        getVal(setor, "Secundário"),
        getVal(setor, "Terciário"),
        getVal(setor, "Outros"),
      ];

      datasets.push({
        label: OD_CONFIG.nomesAnos[ano],
        data: dados,
        backgroundColor: OD_CONFIG.cores[ano],
      });
    });

    renderChart(
      "chart-empregos-setor",
      "bar",
      { labels, datasets },
      {
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${context.raw.toLocaleString("pt-BR")} empregos`,
            },
          },
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Empregos" } },
        },
      },
    );
  }

  async function renderComparativoEmpregosVinculo(dadosMultiAno, anos) {
    const datasets = [];
    const labels = ["Carteira", "Sem Carteira", "Público", "Autônomo"];

    anos.forEach((ano) => {
      const dataMap = dadosMultiAno[ano];
      const vinculo = dataMap.empregos_vinculo;

      const dados = [
        getVal(vinculo, "Assalariado com Carteira"),
        getVal(vinculo, "Assalariado sem Carteira"),
        getVal(vinculo, "Funcionário Público"),
        getVal(vinculo, "Autônomo"),
      ];

      datasets.push({
        label: OD_CONFIG.nomesAnos[ano],
        data: dados,
        backgroundColor: OD_CONFIG.cores[ano],
      });
    });

    renderChart(
      "chart-empregos-vinculo",
      "bar",
      { labels, datasets },
      {
        indexAxis: "y",
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${context.raw.toLocaleString("pt-BR")} empregos`,
            },
          },
        },
        scales: {
          x: { beginAtZero: true, title: { display: true, text: "Empregos" } },
        },
      },
    );
  }

  async function renderComparativoExterno(dadosMultiAno, anos) {
    const datasets = [];

    anos.forEach((ano) => {
      const dataMap = dadosMultiAno[ano];
      const externo = dataMap.empregos_externo;

      datasets.push({
        label: `${OD_CONFIG.nomesAnos[ano]} - Externo`,
        data: [getVal(externo, "Trabalho Externo")],
        backgroundColor: OD_CONFIG.cores[ano],
      });

      datasets.push({
        label: `${OD_CONFIG.nomesAnos[ano]} - Interno`,
        data: [getVal(externo, "Trabalho Interno")],
        backgroundColor: OD_CONFIG.cores[ano],
        hidden: true,
      });
    });

    renderChart(
      "chart-trabalho-externo",
      "bar",
      {
        labels: ["Empregos"],
        datasets: datasets,
      },
      {
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const raw = context.raw;
                const datasetLabel = context.dataset.label;
                return `${datasetLabel}: ${raw.toLocaleString("pt-BR")}`;
              },
            },
          },
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Empregos" } },
        },
      },
    );
  }

  async function renderComparativoViagens(dadosMultiAno, anos) {
    const datasets = [];
    const labels = ["Metrô", "Trem", "Ônibus", "Carro", "Bicicleta", "A pé"];

    anos.forEach((ano) => {
      const dataMap = dadosMultiAno[ano];
      const modos = dataMap.modos;

      const produzidas = [
        getVal(modos, "Metrô"),
        getVal(modos, "Trem"),
        getVal(modos, "Ônibus"),
        getVal(modos, "Dirigindo automóvel") +
          getVal(modos, "Passageiro de automóvel"),
        getVal(modos, "Bicicleta"),
        getVal(modos, "A pé"),
      ];

      datasets.push({
        label: `${OD_CONFIG.nomesAnos[ano]} - Produzidas`,
        data: produzidas,
        backgroundColor: OD_CONFIG.cores[ano],
      });
    });

    renderChart(
      "chart-viagens-comparativo",
      "bar",
      { labels, datasets },
      {
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const raw = context.raw;
                const datasetLabel = context.dataset.label;
                return `${datasetLabel}: ${raw.toLocaleString("pt-BR")} viagens`;
              },
            },
          },
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Viagens" } },
        },
      },
    );
  }

  async function renderComparativoTempo(dadosMultiAno, anos) {
    const datasets = [];
    const labels = ["Coletivo", "Individual", "A pé", "Bicicleta"];

    anos.forEach((ano) => {
      const dataMap = dadosMultiAno[ano];
      const tempo = dataMap.tempo_viagem;

      const dados = [
        getVal(tempo, "Coletivo"),
        getVal(tempo, "Individual"),
        getVal(tempo, "A pé"),
        getVal(tempo, "Bicicleta"),
      ];

      datasets.push({
        label: OD_CONFIG.nomesAnos[ano],
        data: dados,
        backgroundColor: OD_CONFIG.cores[ano],
      });
    });

    renderChart(
      "chart-tempo-viagem",
      "bar",
      { labels, datasets },
      {
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${context.raw.toFixed(1)} minutos`,
            },
          },
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Minutos" } },
        },
      },
    );
  }

  async function atualizarGraficosComparativos(dadosMultiAno, anos) {
    const primeiroAno = anos[0];
    const dataMap = dadosMultiAno[primeiroAno];

    await renderGraficosFixos(dataMap);
    await renderComparativoModos(dadosMultiAno, anos);
    await renderComparativoIdade(dadosMultiAno, anos);
    await renderComparativoMotivos(dadosMultiAno, anos);
    await renderComparativoVinculo(dadosMultiAno, anos);
    await renderComparativoAtividade(dadosMultiAno, anos);
    await renderComparativoSetor(dadosMultiAno, anos);
    await renderComparativoEmpregosVinculo(dadosMultiAno, anos);
    await renderComparativoExterno(dadosMultiAno, anos);
    await renderComparativoViagens(dadosMultiAno, anos);
    await renderComparativoTempo(dadosMultiAno, anos);
  }

  // --- INICIALIZAÇÃO DO SELETOR DE ZONAS ---
  async function loadZones() {
    const fileName = getFileName("geral", 2017);
    const filePath = getPathForAno(2017, fileName);

    try {
      const response = await fetch(filePath);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = _XLSX.read(new Uint8Array(arrayBuffer), {
        type: "array",
      });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const data = _XLSX.utils.sheet_to_json(sheet, { range: 6 });

      selector.innerHTML = '<option value="">Selecione uma zona...</option>';

      if (data && data.length > 0) {
        const zoneNames = [];

        data.forEach((row) => {
          const primeiraColuna = Object.values(row)[0];
          if (primeiraColuna && typeof primeiraColuna === "string") {
            const zoneName = primeiraColuna.toString().trim();
            if (
              zoneName &&
              !zoneName.includes("Total") &&
              zoneName !== "Nome" &&
              zoneName !== "Tabela 2"
            ) {
              zoneNames.push(zoneName);
            }
          }
        });

        zoneNames.sort((a, b) => a.localeCompare(b, "pt-BR"));

        zoneNames.forEach((zoneName) => {
          const opt = document.createElement("option");
          opt.value = zoneName;
          opt.textContent = zoneName;
          selector.appendChild(opt);
        });
      } else {
        selector.innerHTML = '<option value="">Erro ao carregar zonas</option>';
      }
    } catch (e) {
      console.error("Erro ao carregar zonas:", e);
      selector.innerHTML = '<option value="">Erro ao carregar zonas</option>';
    }
  }

  // --- EVENT LISTENER ---
  selector.addEventListener("change", async (e) => {
    const zoneName = e.target.value;
    if (zoneName) {
      await atualizarComparacao();
    }
  });

  // --- INICIALIZAÇÃO ---
  console.log("Inicializando dashboard com basePath:", basePath);

  await loadZones();
  initAnoSelector();
  initCompararCheckboxes();
  await carregarMapaParaAno(2017);

  setTimeout(() => {
    if (selector.options.length > 1) {
      selector.selectedIndex = 1;
      selector.dispatchEvent(new Event("change"));
    }
  }, 1000);
  
};