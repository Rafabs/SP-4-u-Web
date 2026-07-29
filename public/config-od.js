const OD_YEARS = [1997, 2007, 2017];

const OD_SOURCE_DEFINITIONS = {
  geral: {
    file: 'Tab02_OD{ano}.xlsx',
    label: 'População por Faixa Etária',
  },
  genero: {
    file: 'Tab03_OD{ano}.xlsx',
    label: 'População por Sexo',
  },
  frota: {
    file: 'Tab04_OD{ano}.xlsx',
    label: 'Frota de Veículos',
  },
  idade: {
    file: 'Tab02_OD{ano}.xlsx',
    label: 'Faixa Etária',
  },
  escolaridade: {
    file: 'Tab05_OD{ano}.xlsx',
    label: 'Escolaridade',
  },
  renda: {
    file: 'Tab06_OD{ano}.xlsx',
    label: 'Renda',
  },
  modos: {
    file: 'Tab16_OD{ano}.xlsx',
    label: 'Viagens por Modo Principal',
  },
  motivos: {
    file: 'Tab18_OD{ano}.xlsx',
    label: 'Viagens por Motivo',
  },
  vinculo: {
    file: 'Tab08_OD{ano}.xlsx',
    label: 'Vínculo Empregatício',
  },
  atividade: {
    file: 'Tab09_OD{ano}.xlsx',
    label: 'Condição de Atividade',
  },
  matriculas: {
    file: 'Tab10_OD{ano}.xlsx',
    label: 'Matrículas Escolares',
  },
  empregos_setor: {
    file: 'Tab11_OD{ano}.xlsx',
    label: 'Empregos por Setor',
  },
  empregos_vinculo: {
    file: 'Tab13_OD{ano}.xlsx',
    label: 'Empregos por Vínculo',
  },
  empregos_externo: {
    file: 'Tab15_OD{ano}.xlsx',
    label: 'Trabalho Externo/Interno',
  },
  viagens_atraidas: {
    file: 'Tab21_OD{ano}.xlsx',
    label: 'Viagens Atraídas por Modo',
  },
  tempo_viagem: {
    file: 'Tab20_OD{ano}.xlsx',
    label: 'Tempo Médio de Viagem',
  },
  viagens_pe: {
    file: 'Tab19_OD{ano}.xlsx',
    label: 'Viagens a Pé - Razões',
  },
};

const OD_YEAR_COLORS = {
  1997: '#3498db',
  2007: '#f39c12',
  2017: '#d40000',
};

const buildSourceMap = () => Object.fromEntries(
  Object.entries(OD_SOURCE_DEFINITIONS).map(([key, source]) => [key, source.file]),
);

const buildYearLabels = () => Object.fromEntries(
  OD_YEARS.map((year) => [year, String(year)]),
);

// Mantém o contrato legado enquanto centraliza metadados das planilhas.
export const OD_CONFIG = Object.freeze({
  anos: OD_YEARS,
  fontes: buildSourceMap(),
  fontesInfo: OD_SOURCE_DEFINITIONS,
  cores: OD_YEAR_COLORS,
  nomesAnos: buildYearLabels(),
});
