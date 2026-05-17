import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte(),
  ],
  resolve: {
    alias: [
      { find: '@/*', replacement: resolve(__dirname, 'src') },
      { find: '@assets', replacement: resolve(__dirname, './src/assets') },
      { find: '@styles', replacement: resolve(__dirname, './src/styles') },
    ]
  },
})
