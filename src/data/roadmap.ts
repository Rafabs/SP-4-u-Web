// src/data/roadmap.ts

export interface RoadmapItem {
  label: string;
  checked: boolean;
  status?: string;
}

export interface RoadmapSecao {
  categoria: string;
  itens?: RoadmapItem[];
  texto?: string;
}

export interface HistoricoLog {
  data: string;
  versao: string;
  descricao: string;
}

export interface Roadmap {
  roadmap: RoadmapSecao[];
  historico: HistoricoLog[];
}

const roadmapData: Roadmap = {
  roadmap: [
    {
      categoria: "🔧 Refatoração e Estrutura",
      itens: [
        { label: "Analisar o uso de arquivos GTFS diretamente do servidor", checked: false },
        { label: "Corrigir exibição de dados de Pesquisa Origem e Destino (Exibição de 1997 e 2007)", checked: false },
        { label: "Desenvolver Design System e disponibilizar no projeto", status: "EM DESENVOLVIMENTO", checked: false },
        { label: "Desenvolver funcionalidade de página de Turismo", checked: false },
        { label: "Adotar Next.js durante melhoria de mapas", checked: false },
        { label: "Melhorar códigos e comentários", checked: false },
        { label: "Desenvolver app Android - SP4U.apk", status: "EM DESENVOLVIMENTO", checked: false },
      ],
    },
    {
      categoria: "📚 Documentação (readme)",
      itens: [
        { label: "Atualizar README.md", status: "EM DESENVOLVIMENTO", checked: false },
      ],
    },
    {
      categoria: "🛠️ Logs e Validações",
      itens: [
        { label: "Atualizar Node.js, ver logs GitHub", checked: false },
      ],
    },
    {
      categoria: "🖼️ Interface",
      itens: [
        { label: "Exibir Linha 17 - Ouro por ramificação", checked: false },
        { label: "Correção de estilos em geral", checked: false },
      ],
    },
  ],
  historico: [
    { data: "14/04/2026", versao: "v26.04.3", descricao: "Atualização GTFS - SPTrans" },
    { data: "10/04/2026", versao: "v26.04.2", descricao: "Criado e Desenvovido pop-up de Ocorrências metroferroviárias em Index, Atualização GTFS - SPTrans" },
    { data: "08/04/2026", versao: "v26.04.1", descricao: "Desenvolvido status das linhas para cada item de detalhes.index, Atualização GTFS - SPTrans" },
    { data: "30/03/2026", versao: "v26.03.11", descricao: "Atualização GTFS - SPTrans" },
    { data: "21/03/2026", versao: "v26.03.10", descricao: "Adotado método de design Hero Section" },
    { data: "17/03/2026", versao: "v26.03.9", descricao: "Desenvolvido funcionalidade para atualização/horário das linhas e Atualização de status das linhas" },
    { data: "17/03/2026", versao: "v26.03.8", descricao: "Atualizar dados .json/.kmz de Mapa" },
    { data: "13/03/2026", versao: "v26.03.7", descricao: "Melhorias na interface e funcionalidade dos mapas, Atualização GTFS - SPTrans e Integrado exibição de versionamento de index com roadmap.ts" },
    { data: "12/03/2026", versao: "v26.03.6", descricao: "Corrigido AQI para dados de qualidade do ar em -- exibir na cor cinza e Exibição de todos os mapas unificados em Explore" },
    { data: "09/03/2026", versao: "v26.03.5", descricao: "Ajustado a localização de arquivos de dados nas pastas" },
    { data: "07/03/2026", versao: "v26.03.4", descricao: "Ajustado Linhas de estações e implantado L6 - Laranja e L17 - Ouro e Correção de estilos na versão mobile (footer)" },
    { data: "06/03/2026", versao: "v26.03.3", descricao: "Desenvolvido página de Turismo e Correção de estilos em Linhas (detalhes)" },
    { data: "04/03/2026", versao: "v26.03.2", descricao: "Desenvolvido página de Linhas (detalhes) com item nativo, substituir imagens" },
    { data: "04/03/2026", versao: "v26.03.1", descricao: "Desenvolvido página: Demanda/Estação" },
    { data: "03/03/2026", versao: "v26.03.0", descricao: "Atualização GTFS - SPTrans e Desenvolvido página: Origem e Destino" },
    { data: "26/02/2026", versao: "v26.02.11", descricao: "Desenvolvido página: Ciclovia, desenvolvido página: Qualidade do Ar e Funcionalidade para atualização de exibição de AQI" },
    { data: "26/02/2026", versao: "v26.02.10", descricao: "Atualização GTFS - SPTrans e Exibição dados de versao.astro via .js" },
    { data: "26/02/2026", versao: "v26.02.9",  descricao: "Inserir Mapa de via - ARTESP" },
    { data: "23/02/2026", versao: "v26.02.8",  descricao: "Inserir Mapa de via - SPTrans" },
    { data: "22/02/2026", versao: "v26.02.7",  descricao: "Desenvolvido página: Mapa" },
    { data: "22/02/2026", versao: "v26.02.6",  descricao: "Corrigido e implementado renderização progressiva ou virtual scroll em sptrans e artesp" },
    { data: "21/02/2026", versao: "v26.02.5",  descricao: "Desenvolvido página: Linhas - EMTU/ARTESP" },
    { data: "20/02/2026", versao: "v26.02.5",  descricao: "Desenvolvido funcionalidade para atualização de exibição/pesquisas dos dados EMTU/ARTESP" },
    { data: "20/02/2026", versao: "v26.02.5",  descricao: "Migrar para framework Astro" },
    { data: "20/02/2026", versao: "v26.02.4",  descricao: "Atualização GTFS - SPTrans e Migração para Astro" },
    { data: "18/02/2026", versao: "v26.02.3",  descricao: "Unificar arquivos SP_LXX.html em um único arquivo" },
    { data: "18/02/2026", versao: "v26.02.3",  descricao: "Inserir Canais de Atendimento e Portais Oficiais via .JS" },
    { data: "17/02/2026", versao: "v26.02.2",  descricao: "Utilizar ícones do Material Symbols (Google)" },
    { data: "17/02/2026", versao: "v26.02.2",  descricao: "Correção de erros em index.html" },
    { data: "13/02/2026", versao: "v26.02.1",  descricao: "Desenvolvido funcionalidade de pesquisas SPTrans" },
    { data: "12/02/2026", versao: "v26.02.1",  descricao: "Desenvolvido página: 404 e Back to Top" },
    { data: "04/02/2026", versao: "v26.02.0",  descricao: "Remodelar index.html, estilos e funcionalidades" },
  ],
};

export default roadmapData;