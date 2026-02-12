document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      menuToggle.classList.toggle("open");
    });
  }
});
// Script para iluminar o link da página atual automaticamente
document.querySelectorAll(".nav-menu a").forEach((link) => {
  if (link.href === window.location.href) {
    link.classList.add("active-link");
  }
});

const backToTopButton = document.getElementById("backToTop");

window.onscroll = function () {
  if (
    document.body.scrollTop > 300 ||
    document.documentElement.scrollTop > 300
  ) {
    backToTopButton.style.display = "flex";
    backToTopButton.style.alignItems = "center";
    backToTopButton.style.justifyContent = "center";
  } else {
    backToTopButton.style.display = "none";
  }
};

backToTopButton.addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth", // Roda suavemente até o topo
  });
});
