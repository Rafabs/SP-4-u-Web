document.addEventListener("DOMContentLoaded", () => {
    /* ==========================================================================
       MENU HAMBÚRGUER
       ========================================================================== */
    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.getElementById("nav-menu");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            menuToggle.classList.toggle("open");
        });

        // Fechar o menu ao clicar em um link (útil para navegação na mesma página)
        document.querySelectorAll(".nav-menu a").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                menuToggle.classList.remove("open");
            });
        });
    }

    /* ==========================================================================
       LINK ATIVO (ILUMINAR PÁGINA ATUAL)
       ========================================================================== */
    const currentUrl = window.location.href.split('#')[0].split('?')[0]; // Remove âncoras e queries
    document.querySelectorAll(".nav-menu a").forEach((link) => {
        // Verifica se o href do link corresponde à URL atual
        if (link.href === currentUrl || (currentUrl.endsWith('/') && link.href.endsWith('index.html'))) {
            link.classList.add("active-link");
        }
    });

    /* ==========================================================================
       BOTÃO VOLTAR AO TOPO
       ========================================================================== */
    const backToTopButton = document.getElementById("backToTop");

    if (backToTopButton) {
        window.onscroll = function () {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                backToTopButton.style.display = "flex";
            } else {
                backToTopButton.style.display = "none";
            }
        };

        backToTopButton.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
});