/**
 * sptrans.js - Processamento de Dados GTFS para SPTrans
 * Integração: routes, trips, calendar, fare_attributes e agency
 */

let gtfsData = {
    routes: [],
    fares: [],
    trips: [],
    calendar: [],
    agency: ""
};

document.addEventListener('DOMContentLoaded', function() {
    // Inicia o carregamento dos arquivos
    loadGTFSFiles();

    // Configuração da Barra de Pesquisa e Botão Limpar (X)
    const searchInput = document.getElementById('lineSearch');
    const clearBtn = document.getElementById('clearSearch');

    if (searchInput && clearBtn) {
        // Monitora a digitação
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.toLowerCase();
            
            // Mostra o "X" apenas se houver texto
            clearBtn.style.display = term.length > 0 ? 'block' : 'none';
            
            // Filtra as linhas em tempo real
            filterLines(term);
        });

        // Lógica para o botão "X" (Limpar)
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            searchInput.focus();
            filterLines(''); // Reseta o filtro para mostrar tudo
        });
    }
});

/**
 * Carrega todos os arquivos .txt necessários via PapaParse
 */
async function loadGTFSFiles() {
    const basePath = '../data/'; // Certifique-se que o caminho está correto
    const files = [
        { id: 'fares', name: 'fare_attributes.txt' },
        { id: 'routes', name: 'routes.txt' },
        { id: 'trips', name: 'trips.txt' },
        { id: 'calendar', name: 'calendar.txt' },
        { id: 'agency', name: 'agency.txt' }
    ];

    const promises = files.map(file => {
        return new Promise((resolve) => {
            Papa.parse(basePath + file.name, {
                download: true,
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (file.id === 'agency') {
                        const url = results.data[0]?.agency_url || "";
                        gtfsData.agency = url.split('=')[1] || "Não identificada";
                    } else {
                        gtfsData[file.id] = results.data;
                    }
                    resolve();
                },
                error: () => {
                    console.error(`Erro ao carregar: ${file.name}`);
                    resolve();
                }
            });
        });
    });

    await Promise.all(promises);
    renderAllLines();
    updateVersionInfo();
}

/**
 * Renderiza os cards cruzando os dados
 */
function renderAllLines() {
    const resultArea = document.getElementById('result-area');
    if (!resultArea) return;

    // Busca tarifa padrão
    const fare = gtfsData.fares.find(f => f.fare_id === "Ônibus");
    const preco = fare ? parseFloat(fare.price).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }) : "R$ 5,30";

    const htmlContent = gtfsData.routes.map(route => {
        const trip = gtfsData.trips.find(t => t.route_id === route.route_id);
        const service = trip ? gtfsData.calendar.find(c => c.service_id === trip.service_id) : null;
        
        let operacao = "Sob Consulta";
        if (service) {
            if (service.monday === "1" && service.sunday === "1") operacao = "Diária";
            else if (service.monday === "1" && service.saturday === "0") operacao = "Segunda a Sexta";
            else if (service.saturday === "1" || service.sunday === "1") operacao = "Fins de Semana";
        }

        const badgeColor = route.route_color || "333333";
        const textColor = route.route_text_color || "FFFFFF";
        const shortName = route.route_short_name;

        return `
            <div class="line-card" 
                 data-search="${shortName.toLowerCase()} ${route.route_long_name.toLowerCase()}"
                 style="border-top: 5px solid #${badgeColor}">
                
                <div class="line-header">
                    <div class="line-identity">
                        <img src="https://img.shields.io/badge/${shortName.replace('-', '--')}-${badgeColor}.svg?style=for-the-badge&logoColor=${textColor}" alt="Linha ${shortName}">
                        <span class="line-destiny">${trip ? trip.trip_headsign : 'Circular'}</span>
                    </div>
                </div>

                <div class="line-body">
                    <p class="route-full-name"><strong></strong> ${route.route_long_name}</p>
                    <div class="info-grid">
                        <p><i class="fa-solid fa-calendar-day"></i> <strong>Operação:</strong> ${operacao}</p>
                        <p><i class="fa-solid fa-coins"></i> <strong>Tarifa:</strong> ${preco}</p>
                    </div>
                </div>

                <div class="line-footer">
                    <small>Versão SPTrans: ${gtfsData.agency} | ID: ${route.route_id}</small>
                </div>
            </div>
        `;
    }).join('');

    resultArea.innerHTML = htmlContent;
    updateCounter(gtfsData.routes.length);
}

/**
 * Filtro de busca
 */
function filterLines(term) {
    const cards = document.querySelectorAll('.line-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const searchText = card.getAttribute('data-search');
        if (searchText.includes(term)) {
            card.style.display = "block";
            visibleCount++;
        } else {
            card.style.display = "none";
        }
    });

    updateCounter(visibleCount);
}

/**
 * Contador de resultados
 */
function updateCounter(count) {
    let counter = document.getElementById('line-counter');
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'line-counter';
        const searchSection = document.querySelector('.search-section');
        if (searchSection) searchSection.after(counter);
    }
    counter.innerHTML = `<p style="text-align:center; color:#666; margin-top: -20px; margin-bottom: 20px;">
        Exibindo <strong>${count}</strong> linhas encontrada(s)
    </p>`;
}

/**
 * Informação da Versão
 */
function updateVersionInfo() {
    const infoContainer = document.querySelector('.info-container');
    if (infoContainer && gtfsData.agency) {
        const versionTag = document.createElement('p');
        versionTag.style.fontSize = "0.8rem";
        versionTag.style.marginTop = "10px";
        versionTag.innerHTML = `<i class="fa-solid fa-code-branch"></i> Base de dados: <strong>${gtfsData.agency}</strong>`;
        infoContainer.appendChild(versionTag);
    }
}