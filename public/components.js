// components.js
async function loadNavbar() {
    const navbarContainer = document.getElementById('navbar-placeholder');
    if (!navbarContainer) return;

    try {
        const response = await fetch('navbar.html'); // Caminho para o seu arquivo de navbar
        const data = await response.text();
        navbarContainer.innerHTML = data;
        
        // Após carregar, podemos marcar o link ativo (opcional)
        highlightCurrentPage();
    } catch (error) {
        console.error("Erro ao carregar a navbar:", error);
    }
}

function highlightCurrentPage() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// Inicia o carregamento assim que o script carregar
loadNavbar();

document.addEventListener("DOMContentLoaded", () => {
    renderSystemsInfo();
});

function renderSystemsInfo() {
    const container = document.getElementById('dynamic-systems-info');
    if (!container) return;

    // BANCO DE DADOS CENTRALIZADO
    const linksUteis = [
        { text: "Mapa da Rede", url: "https://www.metro.sp.gov.br/sua-viagem/mapa-da-rede/" },
        { text: "VIAQUATRO - Guia do Uso [PT/BR]", url: "https://trilhos.motiva.com.br/viaquatro/guia-de-uso/" },
        { text: "VIAMOBILIDADE - LINHAS 5 E 17 - Guia do Uso [PT/BR]", url: "https://trilhos.motiva.com.br/viamobilidade5/guia-de-uso/" },
        { text: "VIAMOBILIDADE - LINHAS 8 E 9 - Guia do Uso [PT/BR]", url: "https://trilhos.motiva.com.br/viamobilidade8e9/guia-de-uso/" },
        { text: "TIC TRENS - Informações Úteis [PT/BR]", url: "https://www.tictrens.com.br/sua-viagem/informacoes-uteis" },
        { text: "METRÔ - Guia do Usuário [PT/BR]", url: "https://github.com/Rafabs/SP-4-u/blob/main/Mapa_dos_Trilhos/Data/Guia_do_passageiro_abr_2022.pdf" },
        { text: "METRÔ - Guia do Usuário [EN/US]", url: "https://www.metro.sp.gov.br/wp-content/uploads/2023/05/Desktop_Guide_abr_2022_v2.pdf" },
        { text: "CPTM - Regulamento de Viagem", url: "https://www.cptm.sp.gov.br/cptm/sua-viagem/regulamento-de-viagem" },
        { text: "CPTM - Guia do Usuário - Expresso Turístico", url: "https://www.cptm.sp.gov.br/cptm/sua-viagem/expresso-turistico" }
    ];

    const contatos = [
        { nome: "ARTESP", site: "www.artesp.sp.gov.br", url: "https://www.artesp.sp.gov.br", tel: "0800 727 8377" },
        { nome: "CPTM", site: "www.cptm.sp.gov.br", url: "https://www.cptm.sp.gov.br", tel: "0800 055 0121" },
        { nome: "METRÔ", site: "www.metro.sp.gov.br", url: "https://www.metro.sp.gov.br", tel: "0800 770 7722" },
        { nome: "SPTRANS", site: "www.sptrans.com.br", url: "https://www.sptrans.com.br", tel: "156" },
        { nome: "TIC TRENS", site: "www.tictrens.com.br", url: "https://www.tictrens.com.br", tel: "0800 007 0670" },
        { nome: "VIAQUATRO", site: "www.viaquatro.com.br", url: "https://www.viaquatro.com.br", tel: "0800 770 7100" },
        { nome: "VIAMOBILIDADE", site: "www.viamobilidade.com.br", url: "https://www.viamobilidade.com.br", tel: "0800 770 7106" }
    ];

    // CONSTRUÇÃO DO HTML
    let html = `
        <section class="data">
            <h2>Informações sobre os Sistemas</h2>
            <ul class="data-list">
                ${linksUteis.map(link => `<li><a href="${link.url}" target="_blank">${link.text}</a></li>`).join('')}
            </ul>

            <hr>

            <div class="contact-section">
                <h3>Canais de Atendimento e Portais Oficiais</h3>
                <ul class="contact-list">
                    ${contatos.map(c => `
                        <li class="contact-item">
                            <strong>${c.nome}</strong>
                            <a href="${c.url}" target="_blank">${c.site}</a>
                            <span>${c.tel}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </section>
    `;

    container.innerHTML = html;
}