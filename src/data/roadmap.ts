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
        { label: "Desenvolver Design System e disponibilizar no projeto", status: "EM DESENVOLVIMENTO", checked: false },
        { label: "Adotar Next.js durante melhoria de mapas no Vercel", checked: false },
        { label: "Desenvolver app Android - SP4U.apk", status: "EM DESENVOLVIMENTO", checked: false },
      ],
    },
    {
      categoria: "📚 Documentação (readme)",
      itens: [
      ],
    },
    {
      categoria: "🛠️ Logs e Validações",
      itens: [
      ],
    },
    {
      categoria: "🖼️ Interface",
      itens: [
        { label: "Exibir Linha 17 - Ouro por ramificação", checked: false },
      ],
    },
  ],
  historico: [
    { data: "25/07/2026", versao: "v26.07.14", descricao: "Atualização GTFS - SPTrans e (GTFS): Previne erro ao ler shapes com linhas vazias ou indefinidas" },    
    { data: "22/07/2026", versao: "v26.07.13", descricao: "Correção de estilos de Detalhes na versão mobile" },    
    { data: "22/07/2026", versao: "v26.07.12", descricao: "Inserção de Logo das linhas em modo dark e light em Detalhes de Linhas" },    
    { data: "21/07/2026", versao: "v26.07.11", descricao: "Corrigido alinhamento de estilos, inserção de Logo das linhas em modo dark e light e adição da operadora Trivia" },    
    { data: "21/07/2026", versao: "v26.07.10", descricao: "Desenvolvido página de Termos e Privacidade" },    
    { data: "21/07/2026", versao: "v26.07.9", descricao: "Atualização GTFS - SPTrans e Inserção de Logo das linhas em index" },    
    { data: "16/07/2026", versao: "v26.07.8", descricao: "Inserção de Guia do Passageiro da Linha Uni" },    
    { data: "16/07/2026", versao: "v26.07.7", descricao: "Unificar código e estrutura de itens Hero Section" },    
    { data: "15/07/2026", versao: "v26.07.6", descricao: "Atualização GTFS - SPTrans e Correção de Legenda de Mapa" },    
    { data: "12/07/2026", versao: "v26.07.5", descricao: "Correção de status das linhas" },    
    { data: "10/07/2026", versao: "v26.07.4", descricao: "Atualização GTFS - SPTrans" },
    { data: "02/07/2026", versao: "v26.07.3", descricao: "Inserção de cores das linhas" },
    { data: "02/07/2026", versao: "v26.07.2", descricao: "Atualização GTFS - SPTrans" },
    { data: "01/07/2026", versao: "v26.07.1", descricao: "Correção de erro no carregamento de status das linhas" },    
    { data: "27/06/2026", versao: "v26.06.14", descricao: "Atualização GTFS - SPTrans e Atualização do Framwork Astro" },    
    { data: "24/06/2026", versao: "v26.06.13", descricao: "Correção de erro no carregamento de status das linhas" },    
    { data: "24/06/2026", versao: "v26.06.12", descricao: "Correção de erro no carregamento de status das linhas" },    
    { data: "24/06/2026", versao: "v26.06.11", descricao: "Correção de erro no carregamento de status das linhas" },    
    { data: "24/06/2026", versao: "v26.06.10", descricao: "Correção de erro no carregamento de status das linhas" },    
    { data: "24/06/2026", versao: "v26.06.9", descricao: "Correção de erro no carregamento de status das linhas" },
    { data: "24/06/2026", versao: "v26.06.8", descricao: "Correção de erro no carregamento de status das linhas" },
    { data: "23/06/2026", versao: "v26.06.7", descricao: "Atualização GTFS - SPTrans" },
    { data: "15/06/2026", versao: "v26.06.6", descricao: "Melhorar códigos e comentários" },
    { data: "13/06/2026", versao: "v26.06.5", descricao: "Atualização GTFS - SPTrans e Correção de estilos em geral" },
    { data: "10/06/2026", versao: "v26.06.4", descricao: "Desenvolvido funcionalidade de página de Turismo" },
    { data: "08/06/2026", versao: "v26.06.3", descricao: "Atualização GTFS - SPTrans" },
    { data: "06/06/2026", versao: "v26.06.2", descricao: "Desenvolvido botão de Legendas em Detalhes de linhas" },
    { data: "04/06/2026", versao: "v26.06.2", descricao: "Atualização GTFS - SPTrans" },
    { data: "01/06/2026", versao: "v26.06.1", descricao: "Atualização GTFS - SPTrans e Correção de estilos em geral" },
    { data: "17/05/2026", versao: "v26.05.5", descricao: "Atualização GTFS - SPTrans e Atualizado Node.js, visualizção logs GitHub Actions" },
    { data: "12/05/2026", versao: "v26.05.4", descricao: "Correção de erro do Leaflet CSS" },
    { data: "11/05/2026", versao: "v26.05.3", descricao: "Correção de exibição de dados de Pesquisa Origem e Destino (Exibição de 1997 e 2007)" },
    { data: "07/05/2026", versao: "v26.05.2", descricao: "Atualização GTFS - SPTrans e Desenvolvido funcionalidade de página de Notícias" },
    { data: "04/05/2026", versao: "v26.05.1", descricao: "Desenvolvido Olho Vivo" },
    { data: "28/04/2026", versao: "v26.04.8", descricao: "Atualização GTFS - SPTrans" },
    { data: "27/04/2026", versao: "v26.04.7", descricao: "Desenvolvido funcionalidade de página de Fonte de Dados (footer), Atualização do README.md"},
    { data: "26/04/2026", versao: "v26.04.6", descricao: "Desenvolvido Mapa do Metropolitano e disponibilizar via Figma"},
    { data: "22/04/2026", versao: "v26.04.5", descricao: "Atualização GTFS - SPTrans" },
    { data: "19/04/2026", versao: "v26.04.4", descricao: "Atualização Logo" },
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
    { data: "26/02/2026", versao: "v26.02.9",  descricao: "Desenvolvido Mapa de via - ARTESP" },
    { data: "23/02/2026", versao: "v26.02.8",  descricao: "Desenvolvido Mapa de via - SPTrans" },
    { data: "22/02/2026", versao: "v26.02.7",  descricao: "Desenvolvido página: Mapa" },
    { data: "22/02/2026", versao: "v26.02.6",  descricao: "Corrigido e implementado renderização progressiva ou virtual scroll em sptrans e artesp" },
    { data: "21/02/2026", versao: "v26.02.5",  descricao: "Desenvolvido página: Linhas - EMTU/ARTESP" },
    { data: "20/02/2026", versao: "v26.02.5",  descricao: "Desenvolvido funcionalidade para atualização de exibição/pesquisas dos dados EMTU/ARTESP" },
    { data: "20/02/2026", versao: "v26.02.5",  descricao: "Migrar para framework Astro" },
    { data: "20/02/2026", versao: "v26.02.4",  descricao: "Atualização GTFS - SPTrans e Migração para Astro" },
    { data: "18/02/2026", versao: "v26.02.3",  descricao: "Unificar arquivos SP_LXX.html em um único arquivo" },
    { data: "18/02/2026", versao: "v26.02.3",  descricao: "Desenvolvido Canais de Atendimento e Portais Oficiais via .JS" },
    { data: "17/02/2026", versao: "v26.02.2",  descricao: "Implantado ícones do Material Symbols (Google)" },
    { data: "17/02/2026", versao: "v26.02.2",  descricao: "Correção de erros em index.html" },
    { data: "13/02/2026", versao: "v26.02.1",  descricao: "Desenvolvido funcionalidade de pesquisas SPTrans" },
    { data: "12/02/2026", versao: "v26.02.1",  descricao: "Desenvolvido página: 404 e Back to Top" },
    { data: "04/02/2026", versao: "v26.02.0",  descricao: "Remodelado index.html, estilos e funcionalidades" },
  ],
};

export default roadmapData;