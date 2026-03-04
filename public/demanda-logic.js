(function() {
    let charts = {};
    const base = '/SP-4-u-Web'; 

    async function init() {
        const anoSel = document.getElementById('ano-filter');
        const linhaSel = document.getElementById('linha-filter');
        if (!anoSel || !linhaSel) return;

        const anos = ["2025", "2024", "2023", "2022", "2021", "2020"];
        if (anoSel.options.length === 0) {
            anos.forEach(ano => anoSel.add(new Option(ano, ano)));
        }

        const linhas = [
            { id: "LINHA 1-AZUL", label: "Linha 1 - Azul" },
            { id: "LINHA 2-VERDE", label: "Linha 2 - Verde" },
            { id: "LINHA 3-VERMELHA", label: "Linha 3 - Vermelha" },
            { id: "LINHA 15-PRATA", label: "Linha 15 - Prata" }
        ];
        
        if (linhaSel.options.length === 0) {
            linhas.forEach(l => linhaSel.add(new Option(l.label, l.id)));
        }

        anoSel.addEventListener('change', loadAllData);
        linhaSel.addEventListener('change', loadAllData);

        loadAllData();
    }

    async function loadAllData() {
        if (typeof Papa === 'undefined') return;

        const ano = document.getElementById('ano-filter').value;
        const linhaId = document.getElementById('linha-filter').value;

        // Note o espaço duplo para bater com o arquivo original se necessário
        const pathLeve = `${base}/src/data/Passageiros Transportados por Linha - ${ano}.csv`;
        const pathPesado = `${base}/src/data/Entrada de Passageiros por Estação - Diária - ${ano}.csv`;

        Papa.parse(pathLeve, {
            download: true, header: false, delimiter: ";", skipEmptyLines: true,
            complete: function(resLeve) {
                const globalData = processLeve(resLeve.data, linhaId);
                
                Papa.parse(pathPesado, {
                    download: true, header: false, delimiter: ";", skipEmptyLines: true,
                    complete: function(resPesado) {
                        const ranking = processRanking(resPesado.data, linhaId);
                        updateUI(globalData, ranking, linhaId);
                    }
                });
            }
        });
    }

    function processLeve(rows, linhaBusca) {
        let trend = new Array(12).fill(null);
        let mduSoma = 0, mesesContados = 0;
        
        let colStart = 0;
        if (linhaBusca.includes("2-VERDE")) colStart = 7;
        else if (linhaBusca.includes("3-VERMELHA")) colStart = 14; 
        else if (linhaBusca.includes("15-PRATA")) colStart = 21;

        const mesesRef = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

        rows.forEach((row, index) => {
            if (index < 5) return;
            const celulaMes = row[colStart] ? row[colStart].toString().toUpperCase() : "";
            const mesIdx = mesesRef.findIndex(m => celulaMes.startsWith(m));

            if (mesIdx !== -1) {
                let mduRaw = row[colStart + 2]; 
                if (mduRaw && mduRaw.trim() !== "" && mduRaw !== "0") {
                    let mduValor = parseFloat(mduRaw.replace(/\./g, '').replace(',', '.')) * 1000;
                    if (!isNaN(mduValor)) {
                        trend[mesIdx] = mduValor;
                        mduSoma += mduValor;
                        mesesContados++;
                    }
                }
            }
        });
        return { trend, mediaAnual: mesesContados > 0 ? (mduSoma / mesesContados) : 0 };
    }

    function processRanking(rows, linhaBusca) {
        let estacoesMap = {};
        let colStart = -1;
        const linhaLimpa = linhaBusca.split('-')[0].replace("LINHA ", "").trim();

        for (let i = 0; i < 15; i++) {
            if (!rows[i]) continue;
            let idx = rows[i].findIndex(c => c && c.toUpperCase().includes("LINHA " + linhaLimpa));
            if (idx !== -1) { colStart = idx; break; }
        }

        if (colStart === -1) return [];

        let nomesEstacoes = [];
        rows.forEach(row => {
            const cell = row[colStart] ? row[colStart].toString().toUpperCase().trim() : "";
            if (cell === "DIA") {
                nomesEstacoes = [];
                for (let i = colStart + 1; i < colStart + 40; i++) {
                    let val = row[i] ? row[i].trim() : "";
                    if (val === "TOTAL" || val === "" || val === "DIA") break;
                    nomesEstacoes.push({ nome: val, idx: i });
                }
            }
            if (cell === "TOTAL") {
                nomesEstacoes.forEach(est => {
                    let val = row[est.idx];
                    if (val) {
                        let num = parseFloat(val.replace(',', '.')) * 1000;
                        if (!isNaN(num) && num > 0) {
                            if (!estacoesMap[est.nome]) estacoesMap[est.nome] = { soma: 0, count: 0 };
                            estacoesMap[est.nome].soma += num;
                            estacoesMap[est.nome].count++;
                        }
                    }
                });
            }
        });

        return Object.keys(estacoesMap).map(n => ({
            nome: n,
            media: Math.round(estacoesMap[n].soma / estacoesMap[n].count)
        })).sort((a, b) => b.media - a.media).slice(0, 10);
    }

    function updateUI(global, ranking, linhaId) {
        document.getElementById('total-demand').innerText = Math.round(global.mediaAnual).toLocaleString('pt-BR');
        
        if (ranking.length > 0) {
            document.getElementById('peak-station').innerText = ranking[0].nome;
            document.getElementById('peak-value').innerText = ranking[0].media.toLocaleString('pt-BR') + " pass./dia";
        }

        renderTrendChart(global.trend, linhaId);
        renderRankingChart(ranking, linhaId);
    }

    function renderTrendChart(data, linhaId) {
        if(charts.trend) charts.trend.destroy();
        const ctx = document.getElementById('chart-tendencia').getContext('2d');
        const color = getLineColor(linhaId);

        charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
                datasets: [{
                    label: 'MDU',
                    data: data,
                    borderColor: color,
                    backgroundColor: color + '20',
                    fill: true,
                    tension: 0.4,
                    spanGaps: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { ticks: { callback: v => (v/1000).toFixed(0) + 'k' } } }
            }
        });
    }

    function renderRankingChart(data, linhaId) {
        if(charts.rank) charts.rank.destroy();
        const ctx = document.getElementById('chart-ranking').getContext('2d');
        const color = getLineColor(linhaId);

        charts.rank = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.nome),
                datasets: [{
                    label: 'Média de Entradas',
                    data: data.map(d => d.media),
                    backgroundColor: color
                }]
            },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
        });
    }

    function getLineColor(linha) {
        if (linha.includes("1-AZUL")) return "#00549f";
        if (linha.includes("2-VERDE")) return "#008061";
        if (linha.includes("3-VERMELHA")) return "#ef4135";
        if (linha.includes("15-PRATA")) return "#808080";
        return "#d40000";
    }

    init();
})();