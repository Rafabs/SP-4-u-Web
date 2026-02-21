/**
 * emtu.js - Processamento de Dados GTFS para ARTESP/EMTU
 */

const BASE_URL = window.location.pathname.includes('SP-4-u-Web') ? '/SP-4-u-Web' : '';

let gtfsData = {
    routes: [],
    fareAttributes: [],
    fareRules: [],
    trips: [],
    calendar: [],
    agency: ""
};

let isLeavingPage = false;

document.addEventListener('DOMContentLoaded', function () {
    setupSearch();
    loadGTFSFiles();
});

/* =========================================================
   CARREGAMENTO GTFS (ARTESP)
========================================================= */
async function loadGTFSFiles() {
    const basePath = `${BASE_URL}/gtfs-emtu/`; // Certifique-se de que a pasta na public tem este nome
    
    const files = [
        { id: 'fareAttributes', name: 'fare_attributes.txt' },
        { id: 'fareRules', name: 'fare_rules.txt' },
        { id: 'routes', name: 'routes.txt' },
        { id: 'trips', name: 'trips.txt' },
        { id: 'calendar', name: 'calendar.txt' },
        { id: 'agency', name: 'agency.txt' }
    ];

    const promises = files.map(file => {
        return new Promise(resolve => {
            Papa.parse(basePath + file.name, {
                download: true,
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (isLeavingPage || !gtfsData) return resolve();

                    if (file.id === 'agency') {
                        gtfsData.agency = results.data[0]?.agency_name || "EMTU/ARTESP";
                    } else {
                        gtfsData[file.id] = results.data;
                    }
                    resolve();
                },
                error: (err) => {
                    console.error(`Erro ao carregar ${file.name}:`, err);
                    resolve();
                }
            });
        });
    });

    await Promise.all(promises);

    if (!isLeavingPage && gtfsData) {
        renderAllLines();
    }
}

/* =========================================================
   RENDERIZAÇÃO TOTAL COM TARIFAS DINÂMICAS
========================================================= */
function renderAllLines(filteredRoutes = null) {
    const resultArea = document.getElementById("result-area");
    if (!resultArea || !gtfsData) return;

    const routesToRender = filteredRoutes ? filteredRoutes : gtfsData.routes;

    // Mapas para busca rápida O(1)
    const tripMap = new Map();
    gtfsData.trips.forEach(t => { if (!tripMap.has(t.route_id)) tripMap.set(t.route_id, t); });

    const calendarMap = new Map();
    gtfsData.calendar.forEach(c => calendarMap.set(c.service_id, c));

    // Mapa de Tarifas: Relaciona route_id -> preço
    const fareMap = new Map();
    gtfsData.fareRules.forEach(rule => {
        const attr = gtfsData.fareAttributes.find(a => a.fare_id === rule.fare_id);
        if (attr) fareMap.set(rule.route_id, attr.price);
    });

    let htmlContent = "";

    for (const route of routesToRender) {
        if (isLeavingPage) return;

        const trip = tripMap.get(route.route_id);
        const service = trip ? calendarMap.get(trip.service_id) : null;
        
        // Lógica de Operação baseada no calendar.txt (WD = Weekday, SAT = Saturday, SUN = Sunday)
        let operacao = "Sob Consulta";
        if (service) {
            if (service.monday === "1" && service.sunday === "1") operacao = "Diária";
            else if (service.monday === "1" && service.saturday === "0") operacao = "Segunda a Sexta";
            else if (service.service_id === "SAT") operacao = "Sábados";
            else if (service.service_id === "SUN") operacao = "Domingos e Feriados";
        }

        // Busca o preço específico desta linha
        const precoRaw = fareMap.get(route.route_id);
        const preco = precoRaw 
            ? parseFloat(precoRaw).toLocaleString("pt-br", { style: "currency", currency: "BRL" }) 
            : "R$ --";

        const badgeColor = "0054a6"; // Azul padrão EMTU caso não venha no GTFS
        const shortName = route.route_short_name || "";
        const longName = route.route_long_name || "";

        htmlContent += `
            <div class="line-card" style="border-top: 5px solid #${badgeColor}">
                <div class="line-header">
                    <div class="line-identity">
                        <img src="https://img.shields.io/badge/${shortName.replace("-", "--")}-${badgeColor}.svg?style=for-the-badge&logoColor=white" alt="${shortName}">
                        <span class="line-destiny">${trip ? trip.trip_headsign : "Circular"}</span>
                    </div>
                </div>
                <div class="line-body">
                    <p class="route-full-name">${longName}</p>
                    <div class="info-grid">
                        <p><i class="fa-solid fa-calendar-day"></i> <strong>Operação:</strong> ${operacao}</p>
                        <p><i class="fa-solid fa-coins"></i> <strong>Tarifa:</strong> ${preco}</p>
                    </div>
                </div>
                <div class="line-footer">
                    <small>Agência: ${gtfsData.agency} | ID: ${route.route_id}</small>
                </div>
            </div>
        `;
    }

    resultArea.innerHTML = htmlContent;
    if (typeof updateCounter === "function") updateCounter(routesToRender.length);
}

/* =========================================================
   BUSCA
========================================================= */
function setupSearch() {
    const searchInput = document.getElementById('lineSearch');
    const clearBtn = document.getElementById('clearSearch');

    if (!searchInput || !clearBtn) return;

    // Monitora a digitação
    searchInput.addEventListener('input', () => {
        const term = searchInput.value.trim().toLowerCase();
        
        // Se tiver texto, mostra o ícone de fechar (close), senão esconde
        if (term.length > 0) {
            clearBtn.style.display = 'block';
        } else {
            clearBtn.style.display = 'none';
        }
        
        filterLines(term);
    });

    // Evento de clique no ícone "X" (close)
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';         // Limpa o input
        clearBtn.style.display = 'none'; // Esconde o próprio ícone
        searchInput.focus();            // Mantém o foco para o usuário digitar de novo
        filterLines('');                // Volta a exibir todas as linhas
    });
}