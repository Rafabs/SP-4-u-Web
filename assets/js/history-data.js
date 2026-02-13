const historyData = [
    // --- ÚLTIMAS ATUALIZAÇÕES (RECENTES) ---
    { data: "12/02/2026", tipo: "🆕 Inclusão", linha: "179A/10", cor: "002F6C", rota: "Pq. Do Trote - Metrô Santana", recente: true },
    { data: "12/02/2026", tipo: "🆕 Inclusão", linha: "879A/10", cor: "002F6C", rota: "Metrô Barra Funda - São João / Ctn", recente: true },
    { data: "02/02/2025", tipo: "🆕 Inclusão", linha: "5108/21", cor: "006341", rota: "Jd. Celeste - Metrô Alto Do Ipiranga", recente: false },
    { data: "02/02/2025", tipo: "✏️ Modificação", linha: "1772/10", cor: "002F6C", rota: "<after>Atual:</after> Jd. Filhos Da Terra - Metrô Tucuruvi<br><before>Antes:</before> Recanto Verde - Metrô Tucuruvi", recente: false },
    { data: "02/02/2025", tipo: "✏️ Modificação", linha: "3025/10", cor: "DA291C", rota: "<after>Atual:</after> Jd. Wilma Flor - Cptm Guaianases<br><before>Antes:</before> Sítio Conceição - Cptm Guaianases", recente: false },
    { data: "02/02/2025", tipo: "✏️ Modificação", linha: "342N/10", cor: "DA291C", rota: "<after>Atual:</after> Cohab Pres. Juscelino Kubitscheck - E.t. Itaquera<br><before>Antes:</before> Cohab Juscelino - Cptm Guaianases", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "3789/10", cor: "DA291C", rota: "Metalúrgicos - Circular", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "6400/10", cor: "782F40", rota: "Term. João Dias - Term. Bandeira", recente: false },
    { data: "02/02/2025", tipo: "🆕 Inclusão", linha: "6820/21", cor: "782F40", rota: "Jd. Amália - Term. Capelinha", recente: false },
    { data: "02/02/2025", tipo: "🆕 Inclusão", linha: "695V/1", cor: "782F40", rota: "Term. Capelinha - Metrô Ana Rosa", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "8019/10", cor: "FF671F", rota: "Pq. Continental - Metrô Butantã", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "219P/60", cor: "002F6C", rota: "Parada Inglesa - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "219P/61", cor: "002F6C", rota: "Parada Inglesa - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "219P/62", cor: "002F6C", rota: "Parada Inglesa - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "219P/63", cor: "002F6C", rota: "Parada Inglesa - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "219P/64", cor: "509E2F", rota: "Parada Inglesa - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "219P/65", cor: "509E2F", rota: "Parada Inglesa - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "219P/66", cor: "509E2F", rota: "Parada Inglesa - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "219P/67", cor: "509E2F", rota: "Parada Inglesa - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "219P/68", cor: "509E2F", rota: "Parada Inglesa - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "219P/69", cor: "FF671F", rota: "Parada Inglesa - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "219P/70", cor: "782F40", rota: "Parada Inglesa - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "219P/71", cor: "FF671F", rota: "Parada Inglesa - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "219P/72", cor: "FF671F", rota: "Parada Inglesa - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "339A/60", cor: "FFD100", rota: "Metrô Vl. Matilde - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "339A/61", cor: "FFD100", rota: "Metrô Vl. Matilde - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "339A/62", cor: "DA291C", rota: "Metrô Vl. Matilde - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "339A/63", cor: "DA291C", rota: "Metrô Vl. Matilde - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "339A/64", cor: "DA291C", rota: "Metrô Vl. Matilde - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "339A/65", cor: "006341", rota: "Metrô Vl. Matilde - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "339A/66", cor: "006341", rota: "Metrô Vl. Matilde - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "339A/67", cor: "006341", rota: "Metrô Vl. Matilde - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "339A/68", cor: "0082BA", rota: "Metrô Vl. Matilde - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "339A/69", cor: "0082BA", rota: "Metrô Vl. Matilde - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "339A/70", cor: "FF671F", rota: "Metrô Vl. Matilde - Passeio Iluminado", recente: false },
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "339A/71", cor: "509E2F", rota: "Metrô Vl. Matilde - Passeio Iluminado", recente: false },
    { data: "06/01/2025", tipo: "💰 Tarifas", linha: "METRÔ", cor: "FFFFFF", rota: "R$ 5,40", recente: true },
    { data: "06/01/2025", tipo: "💰 Tarifas", linha: "CPTM", cor: "FFFFFF", rota: "R$ 5,40", recente: true },
    { data: "06/01/2025", tipo: "💰 Tarifas", linha: "Concessionárias", cor: "FFFFFF", rota: "R$ 5,40", recente: true },    
    { data: "06/01/2025", tipo: "💰 Tarifas", linha: "SPTrans", cor: "FFFFFF", rota: "R$ 5,30", recente: true },    
    { data: "02/02/2025", tipo: "❌ Remoção", linha: "339A/72", cor: "FF671F", rota: "Metrô Vl. Matilde - Passeio Iluminado", recente: false },
    { data: "01/12/2025", tipo: "🆕 Inclusão", linha: "2002/31", cor: "DA291C", rota: "Term. Pq. D. Pedro II - Natal Iluminado", recente: false },
    { data: "01/12/2025", tipo: "❌ Remoção", linha: "2101/41", cor: "DA291C", rota: "Pça. Silvio Romero - Term. Vl. Prudente", recente: false },
    { data: "01/12/2025", tipo: "✏️ Modificação", linha: "4015/10", cor: "DA291C", rota: "<after>Atual:</after> Pq. São Rafael - Term. São Mateus<br><before>Antes:</before> Term. São Mateus - Jd. Rodolfo Pirani", recente: false },
    { data: "01/12/2025", tipo: "✏️ Modificação", linha: "4016/10", cor: "DA291C", rota: "<after>Atual:</after> Pq. São Rafael - Term. São Mateus<br><before>Antes:</before> Term. São Mateus - Jd. Rodolfo Pirani", recente: false },
    { data: "01/12/2025", tipo: "🆕 Inclusão", linha: "519L/10", cor: "006341", rota: "Vl. Liviero - Metrô São Judas", recente: false },
    { data: "01/12/2025", tipo: "🆕 Inclusão", linha: "695Y/42", cor: "0082BA", rota: "Term. Parelheiros - Est. Varginha", recente: false },
    { data: "01/12/2025", tipo: "❌ Remoção", linha: "8594/21", cor: "509E2F", rota: "Cid. Pirituba - Pça. Ramos De Azevedo", recente: false },
    { data: "01/12/2025", tipo: "❌ Remoção", linha: "8594/41", cor: "509E2F", rota: "Cohab Pedra Verde - Pça. Ramos De Azevedo", recente: false },
    { data: "23/10/2025", tipo: "✏️ Modificação", linha: "575C/10", cor: "006341", rota: "<after>Atual:</after> Term. Vl. Prudente - Vl. Matias<br><before>Antes:</before> Ipiranga - Vl Matias", recente: false },
    { data: "04/10/2025", tipo: "🆕 Inclusão", linha: "4491/21", cor: "006341", rota: "Vl. Liviero - Metrô Santos Imigrantes", recente: false },
    { data: "04/10/2025", tipo: "🆕 Inclusão", linha: "920P/10", cor: "002F6C", rota: "Term. Pq. D. Pedro II - Pinacoteca", recente: false },
    { data: "04/10/2025", tipo: "🆕 Inclusão", linha: "955P/10", cor: "006341", rota: "Museu Ipiranga - Pq. Ibirapuera", recente: false },
    { data: "04/10/2025", tipo: "🆕 Inclusão", linha: "965A/10", cor: "0082BA", rota: "Paraíso - Pacaembu", recente: false },
    { data: "02/09/2025", tipo: "✏️ Modificação", linha: "4716/10", cor: "006341", rota: "<after>Atual:</after> Metrô Tamanduateí - Metrô Sta. Cruz<br><before>Antes:</before> Sacomã - Metrô Sta. Cruz", recente: false },
    { data: "06/08/2025", tipo: "✏️ Modificação", linha: "502J/21", cor: "0082BA", rota: "<after>Atual:</after> Est. Autódromo - Vl. Sta. Catarina<br><before>Antes:</before> Est. Autódromo - Vl. Joaniza", recente: false },
    { data: "06/08/2025", tipo: "✏️ Modificação", linha: "502J/22", cor: "0082BA", rota: "<after>Atual:</after> Est. Autódromo - Vl. Sta. Catarina<br><before>Antes:</before> Est. Autódromo - Vl. Joaniza", recente: false },
    { data: "06/08/2025", tipo: "❌ Remoção", linha: "6960/21", cor: "0082BA", rota: "Term. Varginha - E.t. Vitor Manzini", recente: false },
    { data: "23/06/2025", tipo: "✏️ Modificação", linha: "9166/10", cor: "002F6C", rota: "<after>Atual:</after> Cachoeirinha - Jd. Sta. Cruz<br><before>Antes:</before> Term. Cachoeirinha - Jd. Sta. Cruz", recente: false },
    { data: "23/06/2025", tipo: "❌ Remoção", linha: "8013/43", cor: "509E2F", rota: "Morro Doce - Term. Jd. Britania", recente: false },
    { data: "20/06/2025", tipo: "🆕 Inclusão", linha: "2034/10", cor: "002F6C", rota: "Metrô Tietê - Centro Tea", recente: false },
    { data: "20/06/2025", tipo: "✏️ Modificação", linha: "4056/10", cor: "DA291C", rota: "<after>Atual:</after> Pq. Boa Esperança - Term. São Mateus<br><before>Antes:</before> (Cor anterior: Amarelo)", recente: false },
    { data: "20/06/2025", tipo: "❌ Remoção", linha: "3033/10", cor: "FFD100", rota: "Guaianases - São Mateus", recente: false },
];

function renderHistory() {
    const recentBody = document.getElementById('sptrans-recent-body');
    const fullBody = document.getElementById('full-history-body');

    if (!recentBody || !fullBody) return;

    // Limpa os corpos das tabelas antes de renderizar
    recentBody.innerHTML = '';
    fullBody.innerHTML = '';

    historyData.forEach(item => {
        const badgeImg = `<img src="https://img.shields.io/badge/${item.linha}-${item.cor}.svg" alt="${item.linha}">`;

        // Tabela de Resumo (Apenas itens marcados como 'recente: true')
        if (item.recente) {
            recentBody.innerHTML += `
                <tr>
                    <td>${item.tipo}</td>
                    <td>${badgeImg}</td>
                    <td>${item.rota}</td>
                </tr>`;
        }

        // Tabela de Histórico Completo (Todos os itens)
        fullBody.innerHTML += `
            <tr>
                <td>${item.data}</td>
                <td>${item.tipo}</td>
                <td>${badgeImg}</td>
                <td>${item.rota}</td>
            </tr>`;
    });
}

document.addEventListener('DOMContentLoaded', renderHistory);