// Detecta se estamos no GitHub Pages ou Localhost
const BASE_URL = window.location.pathname.includes('SP-4-u-Web') ? '/SP-4-u-Web' : '';

const dadosLinhas = {
    "L01": { nome: "Linha 01 - Azul", cor: "#0455A1", empresa: "METRÔ", mapa: `${BASE_URL}/assets/imgs/linha_01.PNG` },
    "L02": { nome: "Linha 02 - Verde", cor: "#007E5E", empresa: "METRÔ", mapa: `${BASE_URL}/assets/imgs/linha_02.PNG` },
    "L03": { nome: "Linha 03 - Vermelha", cor: "#EE372F", empresa: "METRÔ", mapa: `${BASE_URL}/assets/imgs/linha_03.PNG` },
    "L04": { nome: "Linha 04 - Amarela", cor: "#FFF000", empresa: "VIAQUATRO", mapa: `${BASE_URL}/assets/imgs/linha_04.PNG` },
    "L05": { nome: "Linha 05 - Lilás", cor: "#9B3894", empresa: "VIAMOBILIDADE", mapa: `${BASE_URL}/assets/imgs/linha_05.PNG` },
    "L06": { nome: "Linha 06 - Laranja", cor: "#000000", empresa: "METRÔ", mapa: `${BASE_URL}/assets/imgs/linha_06.PNG` },
    "L07": { nome: "Linha 07 - Rubi", cor: "#CA016B", empresa: "TIC TRENS", mapa: `${BASE_URL}/assets/imgs/linha_07.PNG` },
    "L08": { nome: "Linha 08 - Diamante", cor: "#97A098", empresa: "VIAMOBILIDADE", mapa: `${BASE_URL}/assets/imgs/linha_08.PNG` },
    "L09": { nome: "Linha 09 - Esmeralda", cor: "#01A9A7", empresa: "VIAMOBILIDADE", mapa: `${BASE_URL}/assets/imgs/linha_09.PNG` },
    "L10": { nome: "Linha 10 - Turquesa", cor: "#049FC3", empresa: "CPTM", mapa: `${BASE_URL}/assets/imgs/linha_10.PNG` },
    "L11": { nome: "Linha 11 - Coral", cor: "#F68368", empresa: "CPTM", mapa: `${BASE_URL}/assets/imgs/linha_11.PNG` },
    "L12": { nome: "Linha 12 - Safira", cor: "#133C8D", empresa: "CPTM", mapa: `${BASE_URL}/assets/imgs/linha_12.PNG` },
    "L13": { nome: "Linha 13 - Jade", cor: "#00B352", empresa: "CPTM", mapa: `${BASE_URL}/assets/imgs/linha_13.PNG` },
    "L15": { nome: "Linha 15 - Prata", cor: "#C0C0C0", empresa: "METRÔ", mapa: `${BASE_URL}/assets/imgs/linha_15.PNG` },
    "L17": { nome: "Linha 17 - Ouro", cor: "#000000", empresa: "METRÔ", mapa: `${BASE_URL}/assets/imgs/linha_17.PNG` }
};

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const linhaId = params.get('linha');
    const dados = dadosLinhas[linhaId];

    if (dados) {
        document.title = `${dados.nome}`;

        const corBloco = document.getElementById('linha-cor-bloco');
        if (corBloco) corBloco.style.backgroundColor = dados.cor;

        const nomeTitulo = document.getElementById('linha-nome-titulo');
        if (nomeTitulo) nomeTitulo.innerText = dados.nome;

        const statusCard = document.getElementById('linha-status-info');
        if (statusCard) {
            statusCard.id = `${linhaId.toLowerCase()}-info`; 
            statusCard.innerText = `Informações sobre a Operação - Sincronizando ${dados.nome}...`;
        }

        const empresaDiv = document.getElementById('linha-empresa');
        if (empresaDiv) empresaDiv.innerText = dados.empresa;

        const mapaImg = document.getElementById('linha-mapa-img');
        if (mapaImg) {
            mapaImg.src = dados.mapa;
            mapaImg.alt = `Mapa da ${dados.nome}`;
        }

    } else {
        // Redireciona para a 404 do Astro com o caminho base correto
        window.location.href = `${BASE_URL}/404`;
    }
});