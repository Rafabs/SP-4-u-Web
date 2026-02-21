import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://rafabs.github.io/SP-4-u-Web',
  base: '/SP-4-u-Web/',
  vite: {
    cacheDir: "C:/temp/vite-cache", // Move o cache para fora do OneDrive
    build: {
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === '.nojekyll') return '.nojekyll';
            return assetInfo.name;
          }
        }
      }
    }
  }
});
