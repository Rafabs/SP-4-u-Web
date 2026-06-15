document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-btn');
    const body = document.body;
    const storageKey = 'theme';
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)');

    if (!themeBtn) {
        return;
    }

    const getSavedTheme = () => {
        try {
            return localStorage.getItem(storageKey);
        } catch {
            return null;
        }
    };

    const saveTheme = (theme) => {
        try {
            localStorage.setItem(storageKey, theme);
        } catch {
            // Navegadores podem bloquear storage em modo privado ou políticas restritas.
        }
    };

    const setTheme = (theme, shouldPersist = false) => {
        const isLight = theme === 'light';

        body.classList.toggle('light-mode', isLight);
        themeBtn.textContent = isLight ? '🌙' : '☀️';
        themeBtn.setAttribute('aria-label', isLight ? 'Ativar tema escuro' : 'Ativar tema claro');
        themeBtn.setAttribute('title', isLight ? 'Ativar tema escuro' : 'Ativar tema claro');

        if (shouldPersist) {
            saveTheme(theme);
        }
    };

    // Preferência salva tem prioridade; sem ela, usa a configuração do sistema.
    const initialTheme = getSavedTheme() || (prefersLight.matches ? 'light' : 'dark');

    setTheme(initialTheme);

    themeBtn.addEventListener('click', () => {
        const nextTheme = body.classList.contains('light-mode') ? 'dark' : 'light';
        setTheme(nextTheme, true);
    });
});