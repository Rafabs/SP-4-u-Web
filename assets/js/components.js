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