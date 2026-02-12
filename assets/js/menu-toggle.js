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
document.querySelectorAll('.nav-menu a').forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add('active-link');
    }
});