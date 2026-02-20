// assets/js/detalhes.js

const dadosLinhas = {
"L01": {
        nome: "Linha 01 - Azul",
        cor: "#0455A1",
        empresa: "METRÔ",
        mapa: "../assets/imgs/linha_01.PNG"
    },
    "L02": {
        nome: "Linha 02 - Verde",
        cor: "#007E5E",
        empresa: "METRÔ",
        mapa: "../assets/imgs/linha_02.PNG" 
    },
    "L03": {
        nome: "Linha 03 - Vermelha",
        cor: "#EE372F",
        empresa: "METRÔ",
        mapa: "../assets/imgs/linha_03.PNG"
    },
    "L04": {
        nome: "Linha 04 - Amarela",
        cor: "#FFF000",
        empresa: "VIAQUATRO",
        mapa: "../assets/imgs/linha_04.PNG"
    },
    "L05": {
        nome: "Linha 05 - Lilás",
        cor: "#9B3894",
        empresa: "VIAMOBILIDADE",
        mapa: "../assets/imgs/linha_05.PNG"
    },
    "L06": {
        nome: "Linha 06 - Laranja",
        cor: "#000000",
        empresa: "METRÔ",
        mapa: "../assets/imgs/linha_06.PNG"
    },
    "L07": {
        nome: "Linha 07 - Rubi",
        cor: "#CA016B",
        empresa: "TIC TRENS",
        mapa: "../assets/imgs/linha_07.PNG"
    },
    "L08": {
        nome: "Linha 08 - Diamante",
        cor: "#97A098",
        empresa: "VIAMOBILIDADE",
        mapa: "../assets/imgs/linha_08.PNG"
    },
    "L09": {
        nome: "Linha 09 - Esmeralda",
        cor: "#01A9A7",
        empresa: "VIAMOBILIDADE",
        mapa: "../assets/imgs/linha_09.PNG"
    },
    "L10": {
        nome: "Linha 10 - Turquesa",
        cor: "#049FC3",
        empresa: "CPTM",
        mapa: "../assets/imgs/linha_10.PNG"
    },
    "L11": {
        nome: "Linha 11 - Coral",
        cor: "#F68368",
        empresa: "CPTM",
        mapa: "../assets/imgs/linha_11.PNG"
    },
    "L12": {
        nome: "Linha 12 - Safira",
        cor: "#133C8D",
        empresa: "CPTM",
        mapa: "../assets/imgs/linha_12.PNG"
    },
    "L13": {
        nome: "Linha 13 - Jade",
        cor: "#00B352",
        empresa: "CPTM",
        mapa: "../assets/imgs/linha_13.PNG"
    },
    "L15": {
        nome: "Linha 15 - Prata",
        cor: "#C0C0C0",
        empresa: "METRÔ",
        mapa: "../assets/imgs/linha_15.PNG"
    },
    "L17": {
        nome: "Linha 17 - Ouro",
        cor: "#000000",
        empresa: "METRÔ",
        mapa: "../assets/imgs/linha_17.PNG"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const linhaId = params.get('linha');
    const dados = dadosLinhas[linhaId];

    if (dados) {
        // 1. Atualiza o Título da Aba do Navegador
        document.title = `${dados.nome}`;

        // 2. Ajusta o Bloco de Cor (o span do lado do nome)
        const corBloco = document.getElementById('linha-cor-bloco');
        if (corBloco) {
            corBloco.style.backgroundColor = dados.cor;
        }

        // 3. Atualiza o Nome da Linha (o link/texto principal)
        const nomeTitulo = document.getElementById('linha-nome-titulo');
        if (nomeTitulo) {
            nomeTitulo.innerText = dados.nome;
            // Mantém a cor do texto padrão ou aplica a cor da linha se desejar:
            // nomeTitulo.style.color = dados.cor; 
        }

        // 4. Atualiza o Card de Operação (Informações sobre a Operação)
        const statusCard = document.getElementById('linha-status-info');
        if (statusCard) {
            // Aqui você pode mudar o ID dinamicamente se o seu script de status precisar
            statusCard.id = `${linhaId.toLowerCase()}-info`; 
            statusCard.innerText = `Informações sobre a Operação - Sincronizando ${dados.nome}...`;
        }

        // 5. Atualiza a Empresa (METRÔ, VIAQUATRO, etc)
        const empresaDiv = document.getElementById('linha-empresa');
        if (empresaDiv) {
            empresaDiv.innerText = dados.empresa;
        }

        // 6. Atualiza o Mapa (Imagem Centralizada)
        const mapaImg = document.getElementById('linha-mapa-img');
        if (mapaImg) {
            mapaImg.src = dados.mapa;
            mapaImg.alt = `Mapa da ${dados.nome}`;
        }

    } else {
        // Se a linha não constar no banco de dados (dadosLinhas), vai para 404
        window.location.href = "../404.html";
    }
});