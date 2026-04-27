# 🌆 Sampa 4u

![Astro](https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199903?style=for-the-badge&logo=leaflet&logoColor=white)

> Ecossistema de visualização de dados focado na mobilidade urbana e qualidade ambiental da Região Metropolitana de São Paulo.

---

## 🗺️ Visão Geral

O **Sampa 4u** transforma dados operacionais abertos — GTFS, APIs de monitoramento metroferroviário, qualidade do ar e geodados — em interfaces gráficas intuitivas. O projeto cobre todas as linhas do sistema metroferroviário paulista, ônibus municipal e metropolitano, ciclovias, turismo e pesquisa de origem e destino.

---

## 🚀 Funcionalidades

| Módulo | Descrição |
|---|---|
| 🗺️ **Mapa Interativo** | Visualização unificada de trilhos (Metrô/CPTM), ciclovias e bicicletários via Leaflet |
| 🚌 **GTFS Multi-Sistema** | Suporte a SPTrans e EMTU/ARTESP com renderização progressiva de milhares de rotas |
| 🚇 **Status das Linhas** | Monitoramento em tempo real via API do CCM ARTESP, atualizado a cada 10 minutos por GitHub Actions |
| 🍃 **Qualidade do Ar (AQI)** | Integração com CETESB/QUALAR exibindo índices AQI por estação de monitoramento |
| 🚲 **Rede Cicloviária** | Mapeamento de ciclovias, ciclofaixas e calçadas compartilhadas da capital |
| 🏛️ **Turismo** | Pontos turísticos, atrativos culturais e roteiros pela cidade |
| 📊 **Pesquisa OD** | Visualização dos dados de Origem-Destino do Metrô SP |
| 📰 **Notícias** | Portal de notícias sobre transporte público paulistano |
| 🎨 **Design Figma** | Protótipo visual do projeto embedado diretamente na interface |
| 📋 **Roadmap** | Sistema de versionamento alimentado via JSON com histórico público de desenvolvimento |
| 📱 **Responsivo** | Interface otimizada para mobile, tablet e desktop |
| 🌓 **Tema Claro/Escuro** | Alternância de tema persistida por sessão |
| 🔐 **Segurança** | Chaves de API protegidas via GitHub Secrets e variáveis de ambiente Astro |

---

## 🛠️ Stack Tecnológica

| Tecnologia | Uso |
|---|---|
| **Astro** | Framework principal (Island Architecture) — entrega de HTML estático com performance máxima |
| **Leaflet.js** | Renderização de mapas interativos e camadas geográficas |
| **PapaParse** | Processamento de arquivos CSV/GTFS pesados no navegador |
| **GitHub Actions** | CI/CD, deploy automático e coleta periódica de dados via API |
| **Material Symbols** | Biblioteca de ícones Google para toda a interface |
| **Orbitron + Share Tech Mono** | Tipografia gamer/terminal no footer e assinatura do projeto |
| **OpenStreetMap / Overpass** | Base cartográfica aberta para o mapa interativo |

---

## 📡 Fontes de Dados

| Fonte | Tipo | Cobertura |
|---|---|---|
| [CCM ARTESP](https://ccm.artesp.sp.gov.br/metroferroviario/) | API Real-time | Status das linhas metroferroviárias |
| [SPTrans – Olho Vivo](https://www.sptrans.com.br/desenvolvedores/) | GTFS / API | Ônibus municipal SP |
| [EMTU](https://www.emtu.sp.gov.br/emtu/dados-abertos/dados-abertos-principal.fss) | GTFS / API | Ônibus metropolitano — 5 RMs |
| [WAQI - WORLD'S AIR POLLUTION](https://waqi.info/) | API / CSV | Qualidade do ar — Estado de SP |
| [GeoSampa – PMSP](https://geosampa.prefeitura.sp.gov.br/) | WMS / WFS | Geodados municipais — 400+ camadas |
| [Portal Dados Abertos PMSP](https://dados.prefeitura.sp.gov.br/) | CSV / JSON / API | Datasets municipais abertos |
| [Pesquisa OD – Metrô SP](https://www.metro.sp.gov.br/pesquisa-od/) | Microdados | Deslocamentos na RMSP |
| [OpenStreetMap](https://overpass-api.de/) | API / GeoJSON | Base cartográfica global |
| [Transitland](https://www.transit.land/) | GTFS / API | Feeds GTFS internacionais |
| [Citylines.co](https://www.citylines.co/) | Open Data | Histórico de sistemas de transporte |

---

## ⚙️ Como Executar Localmente

```bash
# Clonar o repositório
git clone https://github.com/Rafabs/SP-4-u-Web.git
cd SP-4-u-Web

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build
```

> **Atenção:** algumas integrações (SPTrans Olho Vivo, CETESB) exigem chaves de API. Crie um arquivo `.env` na raiz com as variáveis necessárias antes de executar.

---

## 🗂️ Variáveis de Ambiente

```env
PUBLIC_SPTRANS_KEY=sua_chave_aqui
PUBLIC_WAQI_TOKEN=seu_token_aqui
```

---

## 📜 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo [`LICENSE`](./LICENSE) para mais detalhes.