import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

export default defineConfig({
  site: 'https://rafabs.github.io/SP-4-u-Web',
  base: '/SP-4-u-Web/',

  devToolbar: {
    enabled: false,
  },

  vite: {
    cacheDir: "C:/temp/vite-cache", 
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
  },

  integrations: [react()]
});