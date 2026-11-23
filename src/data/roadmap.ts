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
        { label: "Desenvolver Dash de ocorrências com base no DB automático de status", checked: false },
      ],
    },
  ],
  historico: [
    { data: "23/11/2026", versao: "v26.11.7", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "21/11/2026", versao: "v26.11.6", descricao: "chore(gtfs): atualiza dataset estático da SPTrans e de histórico de ocorrências" },
    { data: "18/11/2026", versao: "v26.11.5", descricao: "feat(ocorrencias): cria dashboard histórico de ocorrências" },
    { data: "15/11/2026", versao: "v26.11.4", descricao: "fix(gtfs): corrige TypeError no parser SPTrans e ARTESP" },
    { data: "11/11/2026", versao: "v26.11.3", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "06/11/2026", versao: "v26.11.2", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "02/11/2026", versao: "v26.11.1", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "30/10/2026", versao: "v26.10.5", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "24/10/2026", versao: "v26.10.4", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "17/10/2026", versao: "v26.10.3", descricao: "chore(gtfs): atualiza dataset estático da ARTESP" },
    { data: "15/10/2026", versao: "v26.10.2", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "02/10/2026", versao: "v26.10.1", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "24/09/2026", versao: "v26.09.6", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "20/09/2026", versao: "v26.09.5", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "13/09/2026", versao: "v26.09.4", descricao: "fix(ui): corrige renderização de itens em várias páginas" },
    { data: "12/09/2026", versao: "v26.09.3", descricao: "fix(status): atualiza label de Operação Diferenciada" },
    { data: "11/09/2026", versao: "v26.09.2", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "06/09/2026", versao: "v26.09.1", descricao: "feat(regulatorio): implementa informações do escopo da ARTESP" },
    { data: "29/08/2026", versao: "v26.08.7", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "21/08/2026", versao: "v26.08.6", descricao: "feat(status): adiciona indicador visual de saúde das linhas" },
    { data: "20/08/2026", versao: "v26.08.5", descricao: "chore(gtfs): atualiza dados da SPTrans; style(map): atualiza ícones" },
    { data: "18/08/2026", versao: "v26.08.4", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "12/08/2026", versao: "v26.08.3", descricao: "fix(status): corrige carregamento de status das linhas" },
    { data: "09/08/2026", versao: "v26.08.2", descricao: "fix(status): corrige carregamento de status das linhas" },
    { data: "04/08/2026", versao: "v26.08.1", descricao: "chore(gtfs): atualiza dados da SPTrans e CityLines" },
    { data: "29/07/2026", versao: "v26.07.15", descricao: "feat(gtfs): integra feeds da ARTESP e SPTrans; style(ui): aplica cores L6/L17" },
    { data: "25/07/2026", versao: "v26.07.14", descricao: "fix(gtfs): ignora shapes vazios ou indefinidos na leitura" },
    { data: "22/07/2026", versao: "v26.07.13", descricao: "fix(ui): corrige estilos mobile da página de detalhes" },
    { data: "22/07/2026", versao: "v26.07.12", descricao: "feat(ui): adiciona logos adaptáveis das linhas aos detalhes" },
    { data: "21/07/2026", versao: "v26.07.11", descricao: "fix(ui): corrige alinhamento; feat(operadora): adiciona Trivia" },
    { data: "21/07/2026", versao: "v26.07.10", descricao: "feat(politicas): cria página de Termos e Privacidade" },
    { data: "21/07/2026", versao: "v26.07.9", descricao: "chore(gtfs): atualiza dados da SPTrans; feat(ui): adiciona logos na index" },
    { data: "16/07/2026", versao: "v26.07.8", descricao: "feat(linha-Uni): adiciona Guia do Passageiro" },
    { data: "16/07/2026", versao: "v26.07.7", descricao: "refactor(hero): unifica estrutura e reutiliza componentes" },
    { data: "15/07/2026", versao: "v26.07.6", descricao: "chore(gtfs): atualiza dados da SPTrans; fix(map): corrige legenda" },
    { data: "12/07/2026", versao: "v26.07.5", descricao: "fix(status): corrige status operacional das linhas" },
    { data: "10/07/2026", versao: "v26.07.4", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "02/07/2026", versao: "v26.07.3", descricao: "style(lines): adiciona cores oficiais das linhas" },
    { data: "02/07/2026", versao: "v26.07.2", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "01/07/2026", versao: "v26.07.1", descricao: "fix(status): corrige carregamento de status das linhas" },
    { data: "27/06/2026", versao: "v26.06.14", descricao: "chore(deps): atualiza Astro; chore(gtfs): atualiza dados da SPTrans" },
    { data: "24/06/2026", versao: "v26.06.13", descricao: "fix(status): corrige carregamento de status das linhas" },
    { data: "24/06/2026", versao: "v26.06.12", descricao: "fix(status): corrige carregamento de status das linhas" },
    { data: "24/06/2026", versao: "v26.06.11", descricao: "fix(status): corrige carregamento de status das linhas" },
    { data: "24/06/2026", versao: "v26.06.10", descricao: "fix(status): corrige carregamento de status das linhas" },
    { data: "24/06/2026", versao: "v26.06.9", descricao: "fix(status): corrige carregamento de status das linhas" },
    { data: "24/06/2026", versao: "v26.06.8", descricao: "fix(status): corrige carregamento de status das linhas" },
    { data: "23/06/2026", versao: "v26.06.7", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "15/06/2026", versao: "v26.06.6", descricao: "refactor(code): melhora implementação e comentários" },
    { data: "13/06/2026", versao: "v26.06.5", descricao: "chore(gtfs): atualiza dados da SPTrans; style(ui): corrige estilos globais" },
    { data: "10/06/2026", versao: "v26.06.4", descricao: "feat(turismo): cria página de pontos turísticos" },
    { data: "08/06/2026", versao: "v26.06.3", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "06/06/2026", versao: "v26.06.2", descricao: "feat(linhas): adiciona botão de legendas nos detalhes" },
    { data: "04/06/2026", versao: "v26.06.2", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "01/06/2026", versao: "v26.06.1", descricao: "chore(gtfs): atualiza dados da SPTrans; style(ui): corrige estilos globais" },
    { data: "17/05/2026", versao: "v26.05.5", descricao: "chore(gtfs): atualiza dados da SPTrans; chore(deps): atualiza Node.js" },
    { data: "12/05/2026", versao: "v26.05.4", descricao: "fix(map): corrige carregamento do Leaflet CSS" },
    { data: "11/05/2026", versao: "v26.05.3", descricao: "fix(pesquisa): corrige exibição dos períodos 1997 e 2007" },
    { data: "07/05/2026", versao: "v26.05.2", descricao: "feat(noticias): cria página de notícias; chore(gtfs): atualiza dados" },
    { data: "04/05/2026", versao: "v26.05.1", descricao: "feat(olho-vivo): cria painel de monitoramento em tempo real" },
    { data: "28/04/2026", versao: "v26.04.8", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "27/04/2026", versao: "v26.04.7", descricao: "feat(footer): cria página de fontes de dados; docs: atualiza README" },
    { data: "26/04/2026", versao: "v26.04.6", descricao: "feat(map): publica mapa metropolitano via Figma" },
    { data: "22/04/2026", versao: "v26.04.5", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "19/04/2026", versao: "v26.04.4", descricao: "style(branding): atualiza identidade visual do logo" },
    { data: "14/04/2026", versao: "v26.04.3", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "10/04/2026", versao: "v26.04.2", descricao: "feat(ocorrencias): adiciona popup metroferroviário; chore(gtfs): atualiza dados" },
    { data: "08/04/2026", versao: "v26.04.1", descricao: "feat(status): integra status às páginas de detalhes; chore(gtfs): atualiza dados" },
    { data: "30/03/2026", versao: "v26.03.11", descricao: "chore(gtfs): atualiza dataset estático da SPTrans" },
    { data: "21/03/2026", versao: "v26.03.10", descricao: "feat(hero): aplica novo método de design à seção principal" },
    { data: "17/03/2026", versao: "v26.03.9", descricao: "feat(status): adiciona atualização de horários e status das linhas" },
    { data: "17/03/2026", versao: "v26.03.8", descricao: "chore(map): atualiza arquivos JSON e KMZ" },
    { data: "13/03/2026", versao: "v26.03.7", descricao: "feat(map): melhora interface; chore(gtfs): atualiza dados; feat(version): integra roadmap" },
    { data: "12/03/2026", versao: "v26.03.6", descricao: "fix(aqi): exibe AQI sem dados em cinza; feat(map): unifica mapas no Explore" },
    { data: "09/03/2026", versao: "v26.03.5", descricao: "refactor(data): reorganiza diretórios e localização dos arquivos" },
    { data: "07/03/2026", versao: "v26.03.4", descricao: "feat(map): adiciona linhas L6/L17; fix(ui): corrige footer mobile" },
    { data: "06/03/2026", versao: "v26.03.3", descricao: "feat(turismo): cria página; fix(ui): corrige detalhes das linhas" },
    { data: "04/03/2026", versao: "v26.03.2", descricao: "feat(linhas): cria página de detalhes nativa e substitui imagens" },
    { data: "04/03/2026", versao: "v26.03.1", descricao: "feat(demanda): cria página de demanda por estação" },
    { data: "03/03/2026", versao: "v26.03.0", descricao: "feat(origem-destino): cria página de trajetos; chore(gtfs): atualiza dados" },
    { data: "26/02/2026", versao: "v26.02.11", descricao: "feat(ciclovia): cria página; feat(aqi): cria qualidade do ar e atualiza AQI" },
    { data: "26/02/2026", versao: "v26.02.10", descricao: "chore(gtfs): atualiza dados da SPTrans; feat(version): integra versao.astro via JS" },
    { data: "26/02/2026", versao: "v26.02.9", descricao: "feat(map): cria mapa viário da ARTESP" },
    { data: "23/02/2026", versao: "v26.02.8", descricao: "feat(map): cria mapa viário da SPTrans" },
    { data: "22/02/2026", versao: "v26.02.7", descricao: "feat(mapa): cria página principal de mapas" },
    { data: "22/02/2026", versao: "v26.02.6", descricao: "perf(lista): implementa renderização progressiva e virtual scroll" },
    { data: "21/02/2026", versao: "v26.02.5", descricao: "feat(linhas): cria página EMTU/ARTESP" },
    { data: "20/02/2026", versao: "v26.02.5", descricao: "feat(artesp): cria atualização e pesquisa dos dados EMTU/ARTESP" },
    { data: "20/02/2026", versao: "v26.02.5", descricao: "chore(framework): migra projeto para Astro" },
    { data: "20/02/2026", versao: "v26.02.4", descricao: "chore(gtfs): atualiza dados da SPTrans; chore(framework): migra para Astro" },
    { data: "18/02/2026", versao: "v26.02.3", descricao: "refactor(linhas): consolida arquivos SP_LXX.html em arquivo único" },
    { data: "18/02/2026", versao: "v26.02.3", descricao: "feat(contato): cria canais de atendimento e portais via JS" },
    { data: "17/02/2026", versao: "v26.02.2", descricao: "feat(ui): integra Google Material Symbols" },
    { data: "17/02/2026", versao: "v26.02.2", descricao: "fix(ui): corrige erros na página index" },
    { data: "13/02/2026", versao: "v26.02.1", descricao: "feat(pesquisa): implementa busca de linhas SPTrans" },
    { data: "12/02/2026", versao: "v26.02.1", descricao: "feat(ui): cria página 404 e botão Back to Top" },
    { data: "04/02/2026", versao: "v26.02.0", descricao: "refactor(index): remodela estrutura, estilos e funcionalidades" },
  ],
};

export default roadmapData;