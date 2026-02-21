# 🌆 Sampa 4u 🌆

![Astro](https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![VSCode](https://img.shields.io/badge/Visual_Studio_Code-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)

O **Sampa 4u** é um ecossistema de visualização de dados focado na malha metroferroviária e de ônibus urbano de São Paulo. O projeto transforma dados operacionais e coordenadas em interfaces gráficas intuitivas, facilitando a compreensão da mobilidade urbana na capital paulista.



## 🚀 Funcionalidades Atuais

- **Mapa dos Trilhos:** Visualização completa das linhas de Metrô, CPTM e concessionárias.
- **Integração SPTrans:** Consulta de linhas de ônibus e dados operacionais.
- **Histórico de Alterações:** Acompanhamento cronológico de mudanças nas rotas e sistemas.
- **Arquitetura Dinâmica:** Página de detalhes que renderiza informações em tempo real baseada em parâmetros de linha.
- **Modo Escuro/Claro:** Interface adaptável à preferência do usuário.
- **Design Responsivo:** Otimizado para dispositivos móveis e desktop.

## 🛠️ Tecnologias Utilizadas

* **Astro:** Framework web para performance e entrega de conteúdo estático.
* **JavaScript (ES6+):** Lógica de manipulação de dados e estados.
* **CSS3 Custom Properties:** Design System baseado em variáveis para fácil manutenção.
* **Material Symbols:** Ícones modernos do Google para interface.
* **GitHub Actions:** Integração contínua (CI) para validação de builds.

## 📁 Estrutura do Projeto

```text
├── src/
│   ├── components/    # Componentes reutilizáveis (Card, Nav, Footer)
│   ├── data/          # Fonte única de verdade (Linhas e configurações)
│   ├── layouts/       # Template principal das páginas
│   ├── pages/         # Rotas do sistema (.astro e .html)
│   ├── scripts/       # Lógica client-side (detalhes.js, etc.)
│   └── styles/        # CSS modularizado
├── public/            # Ativos estáticos (Ícones, Mapas, Imagens)
└── astro.config.mjs   # Configuração do Framework
```

## 🔗 Fontes e Dados Oficiais

<section class="sources">
    <p>Este projeto utiliza informações de portais oficiais para garantir a precisão dos dados:</p>
    <ul>
        <li><strong>SPTrans:</strong> Login de Desenvolvedores (GTFS/API)</li>
        <li><strong>Metrô SP:</strong> Mapas e Guia do Usuário</li>
        <li><strong>ViaQuatro/ViaMobilidade:</strong> Manuais e Guias de Uso</li>
        <li><strong>CPTM:</strong> Regulamentos e Expresso Turístico</li>
    </ul>
</section>

## 💻 Como rodar o projeto localmente
Clone o repositório:

```
git clone [https://github.com/Rafabs/SP-4-u-Web.git](https://github.com/Rafabs/SP-4-u-Web.git)
```

Instale as dependências:

```
npm install
```

Inicie o servidor de desenvolvimento:

```
npm run dev
```
Acesse http://localhost:4321 no seu navegador.

## ⚖️ Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.