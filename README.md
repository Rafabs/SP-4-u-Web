# 🌆 Sampa 4u 🌆

![Astro](https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199903?style=for-the-badge&logo=leaflet&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)

O **Sampa 4u** é um ecossistema de visualização de dados focado na mobilidade urbana e qualidade ambiental de São Paulo. O projeto transforma dados operacionais (GTFS), coordenadas geográficas e APIs ambientais em interfaces gráficas intuitivas.

---

## 🚀 Funcionalidades Atuais

- **📍 Mapa Interativo Unificado:** Visualização de trilhos (Metrô/CPTM), ciclovias e bicicletários em uma única interface Leaflet.
- **🚌 Integração GTFS Multi-Sistema:** Suporte dinâmico para dados da **SPTrans** e **ARTESP/EMTU**, com renderização progressiva de milhares de linhas sem perda de performance.
- **🍃 Monitoramento AQI (Qualidade do Ar):** Integração em tempo real com a API do *World Air Quality Index*, exibindo níveis de poluição em estações de monitoramento por toda a capital.
- **📊 Roadmap Automatizado:** Sistema de versionamento alimentado via JSON, garantindo transparência total no desenvolvimento.
- **📱 Design Ultra-Responsivo:** Interface otimizada para consulta rápida em dispositivos móveis.
- **🔐 Segurança de Dados:** Implementação de variáveis de ambiente e GitHub Secrets para proteção de chaves de API.

---

## 🤖 Desenvolvimento Auxiliado por IA

| ![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white) | **Co-Desenvolvedor de Arquitetura** |
| :--- | :--- |
| **Papel:** | O Gemini atua na refatoração de lógica complexa, otimização de scripts de mapeamento (Leaflet), estruturação do CI/CD no GitHub Actions e garantia de conformidade com os Planos de Dados Abertos (PDA). |
| **Impacto:** | Redução no tempo de resposta da UI e implementação de padrões de segurança para consumo de APIs externas. |

---

## 🛠️ Tecnologias Utilizadas

* **Astro:** Framework focado em performance (Island Architecture) para entrega de HTML estático.
* **Leaflet.js:** Biblioteca principal para manipulação de mapas e camadas geográficas.
* **PapaParse:** Processamento de arquivos CSV/GTFS pesados diretamente no navegador.
* **GitHub Actions:** Pipeline de CI/CD para automação de builds e gestão de Secrets.
* **Material Symbols:** Linguagem visual moderna do Google para ícones de interface.

---

## 📁 Estrutura do Projeto

```text
├── .github/workflows/ # Configuração de Deploy e CI/CD (Secrets)
├── src/
│   ├── data/          # Fontes de verdade (roadmap.json, linhas.json)
│   ├── layouts/       # Templates base com suporte a Slots
│   ├── pages/         # Rotas (Mapas, Qualidade do Ar, Versões)
│   └── scripts/       # Lógica centralizada (map-logic.js, emtu.js)
├── public/            # Dados GTFS, GeoJSON e ícones estáticos
└── astro.config.mjs   # Configurações de ambiente e base URL