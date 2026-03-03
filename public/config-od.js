// config-od.js
export const OD_CONFIG = {
  anos: [1997, 2007, 2017],
  fontes: {
    geral: "Tab02_OD{ano}.xlsx",      // População por Faixa Etária
    genero: "Tab03_OD{ano}.xlsx",      // População por Sexo
    frota: "Tab04_OD{ano}.xlsx",       // Frota de Veículos
    idade: "Tab02_OD{ano}.xlsx",       // Faixa Etária
    escolaridade: "Tab05_OD{ano}.xlsx", // Escolaridade
    renda: "Tab06_OD{ano}.xlsx",       // Renda
    modos: "Tab16_OD{ano}.xlsx",       // Viagens por Modo Principal
    motivos: "Tab18_OD{ano}.xlsx",      // Viagens por Motivo
    vinculo: "Tab08_OD{ano}.xlsx",      // Vínculo Empregatício
    atividade: "Tab09_OD{ano}.xlsx",    // Condição de Atividade
    matriculas: "Tab10_OD{ano}.xlsx",   // Matrículas Escolares
    empregos_setor: "Tab11_OD{ano}.xlsx", // Empregos por Setor
    empregos_vinculo: "Tab13_OD{ano}.xlsx", // Empregos por Vínculo
    empregos_externo: "Tab15_OD{ano}.xlsx", // Trabalho Externo/Interno
    viagens_atraidas: "Tab21_OD{ano}.xlsx", // Viagens Atraídas por Modo
    tempo_viagem: "Tab20_OD{ano}.xlsx", // Tempo Médio de Viagem
    viagens_pe: "Tab19_OD{ano}.xlsx",    // Viagens a Pé - Razões
  },
  // Cores para cada ano nos gráficos comparativos
  cores: {
    1997: "#3498db", // Azul
    2007: "#f39c12", // Laranja
    2017: "#d40000", // Vermelho
  },
  // Nomes amigáveis para os anos
  nomesAnos: {
    1997: "1997",
    2007: "2007",
    2017: "2017",
  }
};