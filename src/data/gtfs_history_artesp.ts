// TIPOS
export interface GTFSHistoryEntry {
  data: string;
  tipo: string;
  linha: string;
  cor: string;
  rota: string;
  recente: boolean;
}

// DADOS
export const historyData_ARTESP: GTFSHistoryEntry[] = [      
  {
    data: "17/10/2026",
    tipo: "❌ Remoção",
    linha: "264BI1",
    cor: "E8000F",
    rota: "BARUERI (JARDIM CALIFORNIA) - SANTANA DE PARNAIBA (RESIDENCIAL BURLE MARX)",
    recente: true,
  },  
  {
    data: "17/10/2026",
    tipo: "❌ Remoção",
    linha: "291BI1",
    cor: "E8000F",
    rota: "ITAPEVI (JARDIM BELA VISTA) - SANTANA DE PARNAIBA (RESIDENCIAL BURLE MARX)",
    recente: true,
  },  
  {
    data: "17/10/2026",
    tipo: "❌ Remoção",
    linha: "327",
    cor: "E8000F",
    rota: "POA (TERMINAL RODOVIARIO PEDRO FAVA - CIDADE KEMEL) - SAO PAULO (METRO CORINTHIANS-ITAQUERA)",
    recente: true,
  },  
  {
    data: "17/10/2026",
    tipo: "❌ Remoção",
    linha: "814",
    cor: "E8000F",
    rota: "BARUERI JARDIM SILVEIRA) - SANTANA DE PARNAIBA (RESIDENCIAL BURLE MARX)",
    recente: true,
  },        
];
