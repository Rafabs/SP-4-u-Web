---
name: Sampa 4u
description: Painel urbano de mobilidade e dados ambientais da Região Metropolitana de São Paulo
colors:
  background-dark: "#121212"
  surface-dark: "#1e1e1e"
  header-red: "#2d0000"
  metropolitan-red: "#d40000"
  text-primary-dark: "#e0e0e0"
  text-secondary: "#a0a0a0"
  border-dark: "#333333"
  code-dark: "#3d3d3d"
  background-light: "#f0f2f5"
  surface-light: "#ffffff"
  text-primary-light: "#1a1a1a"
  text-secondary-light: "#4a4a4a"
  border-light: "#dcdcdc"
  status-blue: "#000655"
  status-blue-text: "#00a6ff"
  status-yellow: "#554800"
  status-yellow-text: "#ffd900"
  status-green: "#00550e"
  status-green-text: "#32e622"
  status-red: "#550000"
  status-red-text: "#ff0000"
  status-gray: "#000000"
  status-gray-text: "#ffffff"
typography:
  display:
    fontFamily: "Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(3rem, 5vw, 5.8rem)"
    fontWeight: 800
    lineHeight: 1
  headline:
    fontFamily: "Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Courier New, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "2px"
rounded:
  compact: "2px"
  sm: "4px"
  md: "8px"
  card: "15px"
  pill: "50%"
spacing:
  xs: "8px"
  sm: "10px"
  md: "15px"
  lg: "20px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.status-green-text}"
    textColor: "{colors.background-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.compact}"
    padding: "12px 28px"
  button-primary-hover:
    backgroundColor: "{colors.status-green-text}"
    textColor: "{colors.background-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.compact}"
    padding: "12px 28px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.compact}"
    padding: "11px 28px"
  card:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-primary-dark}"
    rounded: "{rounded.md}"
    padding: "15px"
---

# Design System: Sampa 4u

## Overview

**Creative North Star: "Painel Sampa em Tempo Real"**

O sistema visual do Sampa 4u é operacional, confiável, técnico e urbano. A interface usa densidade informacional com hierarquia clara, mantendo dados, mapas e estados de linha em primeiro plano sem transformá-los em decoração.

O dark-first cria uma base escura estável para informações que mudam com frequência. Vermelho profundo identifica a marca e estados críticos, enquanto cores semânticas distintas comunicam operação, alerta e indisponibilidade. A voz visual evita dashboards genéricos e mantém referências reconhecíveis à mobilidade paulista.

**Key Characteristics:**
- Dark-first com tema claro persistente
- Vermelho metropolitano usado com precisão
- Dados e estados operacionais como elementos principais
- Tipografia técnica em rótulos e assinaturas
- Superfícies modulares com bordas finas

## Colors

A paleta combina superfícies neutras em preto e cinza com um vermelho metropolitano profundo e cores semânticas reservadas a estados operacionais.

### Primary
- **Vermelho Metropolitano** (`#d40000`): destaque de marca, ações de navegação, bordas abertas e estados críticos.
- **Vermelho Institucional Escuro** (`#2d0000`): fundo estrutural de cabeçalho e áreas fortes.

### Secondary
- **Verde Operacional** (`#32e622`): estados normais e chamadas primárias de interface.
- **Azul Informacional** (`#00a6ff`): informação de status e dados neutros em uma visualização operacional.
- **Amarelo de Atenção** (`#ffd900`): operação com redução ou alerta.

### Neutral
- **Preto Sampa** (`#121212`): fundo principal no tema escuro.
- **Grafite de Superfície** (`#1e1e1e`): cards e painéis no tema escuro.
- **Cinza Técnico** (`#333333`): bordas e divisões no tema escuro.
- **Texto Claro** (`#e0e0e0`): texto principal no tema escuro.
- **Cinza Secundário** (`#a0a0a0`): metadados e texto de apoio.
- **Fundo Claro** (`#f0f2f5`): fundo principal no tema claro.
- **Superfície Clara** (`#ffffff`): cards no tema claro.

### Named Rules
**The Operational Color Rule.** Cores semânticas representam estados reais e nunca devem servir como decoração.

## Typography

**Display Font:** Segoe UI, com Roboto, Helvetica e Arial como fallbacks.
**Body Font:** Segoe UI, com Roboto, Helvetica e Arial como fallbacks.
**Label/Mono Font:** Courier New para rótulos técnicos; Share Tech Mono em assinaturas e elementos terminal-like.

**Character:** Segoe UI oferece legibilidade utilitária para conteúdo; Courier New e Share Tech Mono acrescentam precisão técnica sem substituir a hierarquia principal.

### Hierarchy
- **Display** (800, 3rem–5.8rem, line-height 1): títulos principais e entradas visuais.
- **Headline** (700, até 2rem, line-height 1.2): títulos de seções.
- **Body** (400, 1rem, line-height 1.6): texto e descrições corridas.
- **Label** (500, 10–12px, letter-spacing 2px): tags, CTAs e metadados técnicos em caixa alta.

### Named Rules
**The Readability Rule.** Fontes mono aparecem em rótulos compactos e assinatura; texto funcional permanece em Segoe UI ou fonte sem serifa equivalente.

## Layout

A superfície usa um container central de até 1100px, com `40px` verticais e `20px` horizontais em seções. O desktop organiza navegação horizontal e listas em grades de dados; o mobile ativa menu em grade de três colunas abaixo de 768px e reduz o espaço para 15px laterais.

Os cards informativos usam ritmo compacto e repetitivo, com gaps entre `8px` e `16px`. Listas operacionais preservam hierarquia em grades; abaixo de 768px, a linha se reorganiza em conteúdo principal e metadados na segunda linha.

## Elevation & Depth

O sistema é predominantemente tonal e flat: profundidade vem de mudança de superfície, bordas finas e contrastes de estado. Sombras aparecem em controles fixos, cartões de destaque e interações específicas, sem elevação decorativa em todas as superfícies.

### Shadow Vocabulary
- **Control Float** (`0 4px 10px rgba(0,0,0,0.3)`): controles fixos como tema e voltar ao topo.
- **Header Structure** (`0 4px 20px rgba(0,0,0,0.5)`): separação estrutural do cabeçalho.
- **Status Glow** (`0 0 10px color-mix(in srgb, var(--status-green-text) 70%, transparent)`): confirmação visual de estado saudável.

### Named Rules
**The Flat-By-Default Rule.** Superfícies são flat em repouso; sombra é reservada a hierarquia fixa, foco ou feedback operacional.

## Shapes

O sistema combina formas retangulares compactas com bordas pequenas e círculos funcionais. Cards genéricos usam `8px`; containers editoriais maiores podem usar `15px`; botões de ação usam `2px`, reforçando precisão técnica.

Bordas têm `1px` ou `2px`, sem efeitos de glassmorphism. Indicadores, pontos de status e controles fixos usam círculos.

## Components

### Buttons
- **Shape:** retangular com `2px` de raio.
- **Primary:** verde operacional `#32e622`, texto quase preto, fonte mono de 12px, espaçamento de 2px e padding `12px 28px`.
- **Ghost:** fundo transparente, borda `1px` cinza, texto principal e mesmo tratamento tipográfico.
- **Hover:** redução de opacidade no primário e mudança de borda ou cor no ghost.

### Cards / Containers
- **Corner Style:** `8px` em listas e dados; `15px` em containers amplos como `.about`.
- **Background:** `#1e1e1e` no tema escuro e `#ffffff` no tema claro.
- **Border:** `1px solid var(--border-color)`.
- **Internal Padding:** normalmente `15px` ou `20px`.

### Navigation
- **Desktop:** links verticais compactos com ícones Material Symbols acima dos rótulos.
- **Active/Hover:** ícone com preenchimento visual e cor clara; leve deslocamento vertical no hover.
- **Mobile:** menu de três colunas abaixo de 768px em superfície escura ou clara conforme o tema.

### Status Indicators
- **Style:** elementos compactos com fundo e texto semânticos separados.
- **States:** azul informacional, amarelo de atenção, verde normal, vermelho parado e cinza indisponível.
- **Signature detail:** pontos de saúde usam borda externa colorida e glow verde ou vermelho.

### Fixed Controls
- **Shape:** circular, `45px` no desktop e `42px` no mobile.
- **Position:** fixados à direita, acima da borda inferior.
- **States:** tema escuro usa o fundo de código; voltar ao topo usa cor de borda.

## Do's and Don'ts

### Do:
- **Do** usar superfícies `#121212` e `#1e1e1e` como base dark-first.
- **Do** manter dados, estados e navegação legíveis antes da ornamentação.
- **Do** usar rótulos mono em caixa alta para metadados e ações compactas.
- **Do** preservar temas claro e escuro em componentes e logos.
- **Do** adaptar listas operacionais para grades de uma ou duas linhas no mobile.

### Don't:
- **Don't** usar vermelho metropolitano como fundo decorativo contínuo.
- **Don't** aplicar cores semânticas a elementos sem significado operacional.
- **Don't** usar sombras fortes em todos os cards.
- **Don't** substituir a hierarquia utilitária por tipografia puramente display.
- **Don't** transformar o sistema em um dashboard corporativo genérico ou desconectado da mobilidade urbana.
