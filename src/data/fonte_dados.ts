export const originData = [
  // ── MONITORAMENTO METROFERROVIÁRIO ──
  {
    nome: "CCM ARTESP",
    descricao: "API de monitoramento em tempo real do sistema metroferroviário (linhas concedidas e estatais da RMSP).",
    url: "https://ccm.artesp.sp.gov.br/metroferroviario/",
    tipo: "API Real-time",
    icon: "sensors"
  },

  // ── ÔNIBUS MUNICIPAL ──
  {
    nome: "SPTrans – Olho Vivo",
    descricao: "Posição em tempo real dos ônibus e itinerários da rede municipal de São Paulo.",
    url: "https://www.sptrans.com.br/desenvolvedores/",
    tipo: "GTFS / API",
    icon: "directions_bus"
  },

  // ── ÔNIBUS METROPOLITANO ──
  {
    nome: "EMTU – Dados Abertos",
    descricao: "Geolocalização em tempo real dos ônibus metropolitanos, ocorrências operacionais, linhas, itinerários e tarifas das 5 regiões metropolitanas do Estado de SP.",
    url: "https://www.emtu.sp.gov.br/emtu/dados-abertos/dados-abertos-principal.fss",
    tipo: "GTFS / API",
    icon: "directions_bus"
  },
  {
    nome: "EMTU – GTFS",
    descricao: "Feed GTFS estático com rotas, paradas e horários dos ônibus metropolitanos da RMSP e demais regiões metropolitanas paulistas.",
    url: "https://www.emtu.sp.gov.br/emtu/dados-abertos/dados-abertos-principal/gtfs.fss",
    tipo: "GTFS",
    icon: "schedule"
  },

  // ── QUALIDADE DO AR ──
  {
    nome: "WAQI - WORLD'S AIR POLLUTION",
    descricao: "Sistema de informações com índices e histórico de qualidade do ar das estações de monitoramento automáticas do Estado de São Paulo.",
    url: "https://waqi.info/",
    tipo: "API / CSV",
    icon: "humidity_percentage"
  },

  // ── GEODADOS ──
  {
    nome: "GeoSampa – PMSP",
    descricao: "Mapa digital da cidade de SP com mais de 400 camadas geoespaciais abertas: rede de transporte, ciclovias, zoneamento, patrimônio histórico, parques e equipamentos públicos.",
    url: "https://geosampa.prefeitura.sp.gov.br/",
    tipo: "WMS / WFS / Shapefile",
    icon: "map"
  },

  // ── CICLOVIA ──
  {
    nome: "GeoSampa – Rede Cicloviária",
    descricao: "Camada geoespacial com ciclovias, ciclofaixas, calçadas compartilhadas e ciclorrotas do município de São Paulo, mantida pela CET/SMT.",
    url: "https://metadados.geosampa.prefeitura.sp.gov.br/geonetwork/intranet/api/records/5d973631-65e5-447d-ab38-e5fb6b07a67b",
    tipo: "WFS / Shapefile",
    icon: "directions_bike"
  },

  // ── DADOS ABERTOS MUNICIPAIS ──
  {
    nome: "Portal Dados Abertos – PMSP",
    descricao: "Portal oficial da Prefeitura de São Paulo com datasets de todas as secretarias, subprefeituras e empresas públicas municipais em formatos abertos.",
    url: "https://dados.prefeitura.sp.gov.br/",
    tipo: "CSV / JSON / API",
    icon: "database"
  },

  // ── PESQUISA ORIGEM-DESTINO ──
  {
    nome: "Pesquisa Origem-Destino – Metrô SP",
    descricao: "Pesquisa domiciliar que mapeia os deslocamentos da população na Região Metropolitana de São Paulo, realizada pela Companhia do Metropolitano.",
    url: "https://www.metro.sp.gov.br/pesquisa-od/",
    tipo: "Microdados / CSV",
    icon: "transfer_within_a_station"
  },

  // ── TURISMO ──
  {
    nome: "São Paulo Turismo – SPTuris",
    descricao: "Dados e informações sobre pontos turísticos, atrativos culturais e equipamentos de lazer da cidade de São Paulo.",
    url: "https://www.spturis.com.br/",
    tipo: "Institucional",
    icon: "attractions"
  },

  // ── REFERÊNCIA GEOGRÁFICA ──
  {
    nome: "OpenStreetMap – Overpass API",
    descricao: "Base cartográfica colaborativa com dados geoespaciais globais: vias, estações, pontos de interesse e infraestrutura urbana consultáveis via Overpass API.",
    url: "https://overpass-api.de/",
    tipo: "API / GeoJSON",
    icon: "public"
  },
  {
    nome: "Transitland",
    descricao: "Repositório internacional de feeds GTFS com dados de agências de transporte do mundo inteiro, incluindo operadoras brasileiras.",
    url: "https://www.transit.land/",
    tipo: "GTFS / API",
    icon: "travel_explore"
  }
];