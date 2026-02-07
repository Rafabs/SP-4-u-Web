// Aguarda o DOM carregar completamente
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-btn');
    const body = document.body;

    // 1. Verifica se o usuário já tem uma preferência salva no navegador
    const savedTheme = localStorage.getItem('theme');
    
    // 2. Aplica o tema salvo (se existir)
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeBtn.innerText = '🌙'; // Ícone para voltar ao Dark
    } else {
        themeBtn.innerText = '☀️'; // Ícone para ir ao Light
    }

    // 3. Lógica de alternância (Toggle)
    themeBtn.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        
        let theme = 'dark';
        if (body.classList.contains('light-mode')) {
            theme = 'light';
            themeBtn.innerText = '🌙';
        } else {
            themeBtn.innerText = '☀️';
        }

        // 4. Salva a escolha para a próxima visita
        localStorage.setItem('theme', theme);
    });
});