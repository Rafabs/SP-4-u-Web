// src/data/linhas.ts

export interface Linha {
  nome: string;
  image: string;
  cor: string;
  empresa: string;
}

export const dadosLinhas: Record<string, Linha> = {
  L01: {
    nome: "01 - Azul",
    image: "/public/icons/white_metro.png",
    cor: "#0455A1",
    empresa: "METRÔ",
  },
  L02: {
    nome: "02 - Verde",
    image: "/public/icons/white_metro.png",
    cor: "#007E5E",
    empresa: "METRÔ",
  },
  L03: {
    nome: "03 - Vermelha",
    image: "/public/icons/white_metro.png",
    cor: "#EE372F",
    empresa: "METRÔ",
  },
  L04: {
    nome: "04 - Amarela",
    image: "/public/icons/white_motiva.png",
    cor: "#FFF000",
    empresa: "MOTIVA",
  },
  L05: {
    nome: "05 - Lilás",
    image: "/public/icons/white_motiva.png",
    cor: "#9B3894",
    empresa: "MOTIVA",
  },
  L06: {
    nome: "06 - Laranja",
    image: "/public/icons/white_linha_uni.png",
    cor: "#F37321",
    empresa: "LINHA UNI",
  },
  L07: {
    nome: "07 - Rubi",
    image: "/public/icons/white_tic_trens.png",
    cor: "#CA016B",
    empresa: "TIC TRENS",
  },
  L08: {
    nome: "08 - Diamante",
    image: "/public/icons/white_motiva.png",
    cor: "#97A098",
    empresa: "MOTIVA",
  },
  L09: {
    nome: "09 - Esmeralda",
    image: "/public/icons/white_motiva.png",
    cor: "#01A9A7",
    empresa: "MOTIVA",
  },
  L10: {
    nome: "10 - Turquesa",
    image: "/public/icons/white_cptm.png",
    cor: "#049FC3",
    empresa: "CPTM",
  },
  L11: {
    nome: "11 - Coral",
    image: "/public/icons/white_trivia.png",
    cor: "#F68368",
    empresa: "TRIVIA TRENS",
  },
  L12: {
    nome: "12 - Safira",
    image: "/public/icons/white_trivia.png",
    cor: "#133C8D",
    empresa: "TRIVIA TRENS",
  },
  L13: {
    nome: "13 - Jade",
    image: "/public/icons/white_trivia.png",
    cor: "#00B352",
    empresa: "TRIVIA TRENS",
  },
  L15: {
    nome: "15 - Prata",
    image: "/public/icons/white_metro.png",
    cor: "#C0C0C0",
    empresa: "METRÔ",
  },
  L17: {
    nome: "17 - Ouro",
    image: "/public/icons/white_metro.png",
    cor: "#917F57",
    empresa: "METRÔ",
  },
};