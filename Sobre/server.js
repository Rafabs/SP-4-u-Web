const express = require('express'); // Importa o Express
const axios = require('axios'); // Importa o Axios para fazer requisições HTTP
const jsdom = require('jsdom'); // Importa o JSDOM para manipulação do DOM em Node.js
const cors = require('cors'); // Importa o pacote cors para lidar com requisições CORS
const { JSDOM } = jsdom; // Extrai JSDOM da biblioteca jsdom
const fs = require('fs');
const path = require('path');

const app = express(); // Cria uma instância do Express

app.use(cors()); // Utiliza o middleware cors para permitir solicitações de origens diferentes

// Define rotas para obter o status de cada linha de transporte público
// Cada rota chama a função getLineStatus com o número da linha e a resposta (res) como parâmetros
app.get('/linha1-status', (req, res) => {
    getLineStatus(1, res);
});

app.get('/linha2-status', (req, res) => {
    getLineStatus(2, res);
});

app.get('/linha3-status', (req, res) => {
    getLineStatus(3, res);
});

app.get('/linha4-status', (req, res) => {
    getLineStatus(4, res);
});

app.get('/linha5-status', (req, res) => {
    getLineStatus(5, res);
});

app.get('/linha7-status', (req, res) => {
    getLineStatus(7, res);
});

app.get('/linha8-status', (req, res) => {
    getLineStatus(8, res);
});

app.get('/linha9-status', (req, res) => {
    getLineStatus(9, res);
});

app.get('/linha10-status', (req, res) => {
    getLineStatus(10, res);
});

app.get('/linha11-status', (req, res) => {
    getLineStatus(11, res);
});

app.get('/linha12-status', (req, res) => {
    getLineStatus(12, res);
});

app.get('/linha13-status', (req, res) => {
    getLineStatus(13, res);
});

app.get('/linha15-status', (req, res) => {
    getLineStatus(15, res);
});

// Define a porta na qual o servidor irá ouvir as requisições
app.listen(3000, () => console.log('Servidor funcionando normalmente na porta \x1b[33m3000\x1b[0m\nPressione Ctrl + C para sair'));

function verificarArquivos(pastas, listaArquivos) {
    pastas.forEach(pasta => {
        console.log(`Verificando arquivos em \x1b[36m${pasta}\x1b[0m:`); // Adiciona estilo de cor ciano ao nome da pasta
        listaArquivos.forEach(arquivo => {
            const caminhoArquivo = path.join(pasta, arquivo);
            fs.access(caminhoArquivo, fs.constants.F_OK, (err) => {
                if (err) {
                    console.log(`- O arquivo \x1b[33m${arquivo}\x1b[0m não foi encontrado em ${pasta}.`); // Adiciona estilo de cor laranja ao nome do arquivo
                } else {
                    console.log(`- O arquivo \x1b[36m${arquivo}\x1b[0m foi encontrado em ${pasta}.`); // Adiciona estilo de cor ciano ao nome do arquivo
                }
            });
        });
    });
}

// Lista de pastas a serem verificadas
const pastasVerificadas = [
    "Mapa_dos_Trilhos",
    "Mapa_dos_Trilhos/Sobre",
    "Mapa_dos_Trilhos/Data",
    "Mapa_dos_Trilhos/Gtfs_EMTU",
    "Mapa_dos_Trilhos/Gtfs_SPTRANS",
    "Mapa_dos_Trilhos/Linhas"
];

// Lista de arquivos a serem verificados em todas as pastas
const listaArquivosVerificados =
    ["Mapa_dos_Trilhos/Data/caminho_icones.json",
        "dados_estacoes_medicoes.json",
        "Desktop_Guide_abr_2022_v2.pdf",
        "Guia_do_passageiro_abr_2022.pdf",
        "LL_WGS84_KMZ_bicicletarioparaciclo.geojson",
        "LL_WGS84_KMZ_redecicloviaria.json",
        "mapa-da-rede-metro.pdf",
        "Regulamento de Viagem Expresso Turístico.pdf",
        "Regulamento-Viagem.pdf",
        "sao-paulo_lines_systems_and_modes.json",
        "sao-paulo_sections.geojson",
        "sao-paulo_stations.geojson",
        "SIRGAS_SHP_origemdestino_2007.json",
        "SIRGAS_SHP_origemdestino_2017.json",
        "zonas97_region.json",
        "ZonasOD87_region.json",
        "agency.txt",
        "calendar.txt",
        "dataRef-10012024.txt",
        "fare_attributes.txt",
        "fare_rules.txt",
        "feed_info.txt",
        "routes.txt",
        "shapes.txt",
        "stops.txt",
        "trips.txt",
        "agency.txt",
        "calendar.txt",
        "fare_attributes.txt",
        "fare_rules.txt",
        "feed_info.txt",
        "routes.txt",
        "shapes.txt",
        "stops.txt",
        "trips.txt",
        "CPTM_SP_L7.py",
        "CPTM_SP_L8.py",
        "CPTM_SP_L9.py",
        "CPTM_SP_L10.py",
        "CPTM_SP_L11.py",
        "CPTM_SP_L12.py",
        "CPTM_SP_L13.py",
        "Guararema.py",
        "Metrô_SP_L1.py",
        "Metrô_SP_L2.py",
        "Metrô_SP_L3.py",
        "Metrô_SP_L4.py",
        "Metrô_SP_L5.py",
        "Metrô_SP_L15.py",
        "Pirapora.py",
        "cet.py",
        "gtfs_emtu.py",
        "gtfs_sptrans.py",
        "guias.py",
        "log.txt",
        "mapa.py",
        "noticia.py",
        "temperatura.py",
        "web.py",
        "index.html",
        "linha_01.html",
        "linha_02.html",
        "linha_03.html",
        "linha_04.html",
        "linha_05.html",
        "linha_07.html",
        "linha_08.html",
        "linha_09.html",
        "linha_10.html",
        "linha_11.html",
        "linha_12.html",
        "linha_13.html",
        "linha_14.html",
        "linha_15.html",
        "script.js",
        "server.js",
        "styles.css"];

// Chama a função para verificar os arquivos
verificarArquivos(pastasVerificadas, listaArquivosVerificados);