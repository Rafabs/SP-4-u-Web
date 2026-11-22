# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 7, TypeScript, JavaScript, CSS, Leaflet e React em partes específicas da interface.

## Users

Moradores da Região Metropolitana de São Paulo, estudantes, profissionais e visitantes que consultam mobilidade urbana e dados ambientais em desktop ou mobile.

## Product Purpose

Visualizar dados abertos de mobilidade, transporte metroferroviário, ônibus, ciclovias e qualidade ambiental em uma interface unificada, acessível e atualizada.

## Positioning

O produto reúne em uma única experiência dados operacionais e geográficos de diferentes sistemas de transporte paulistas, além de qualidade do ar, turismo, demanda e pesquisa origem-destino.

## Operating Context

O sistema funciona como um portal web público com páginas para status operacional, buscas de linhas, mapas, dados GTFS, qualidade do ar, ciclovias, origem-destino, demanda, notícias e turismo. Parte das integrações depende de dados estáticos atualizados e APIs ou chaves de serviço externas.

## Capabilities and Constraints

- Cobertura de SPTrans, EMTU/ARTESP, GTFS, monitoramento metroferroviário e dados ambientais.
- Interface responsiva com temas claro e escuro.
- Dados públicos e fontes abertas são fundamentais para a proposta.
- Variáveis de ambiente protegem integrações que exigem credenciais.
- Nesta inicialização, o objetivo é analisar e registrar o produto sem implementar mudanças visuais ou funcionais.

## Brand Commitments

O projeto se chama Sampa 4u e apresenta identidade ligada à mobilidade urbana e à Região Metropolitana de São Paulo. O repositório mantém recursos visuais próprios de logo e ícones em `public/logo` e `public/icons`.

## Evidence on Hand

- README do projeto com visão geral, módulos, stack e fontes de dados.
- Páginas Astro em `src/pages`.
- Dados e componentes compartilhados em `src/data` e `src/components`.
- Estilos globais e específicos em `public/styles.css` e demais arquivos CSS públicos.
- Histórico público de versões e roadmap em `src/data/roadmap.ts`.
- Fontes GTFS, geodados, arquivos CSV, XML/GeoJSON e bases históricas em `public/data`.

## Product Principles

- Transformar dados abertos complexos em interfaces compreensíveis.
- Preservar a cobertura funcional dos múltiplos sistemas de mobilidade.
- Manter transparência sobre fontes, versões e atualizações.
- Priorizar navegação clara e comportamento responsivo.
- Não fabricar informações sobre dados ou integrações ausentes.
