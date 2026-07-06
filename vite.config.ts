import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: '/Pentacoder/',
  plugins: [
    tailwindcss(),
    svelte(),
    VitePWA({ 
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
      // Generates 'manifest.webmanifest' file on build
      manifest: {
        name: 'Pentacoder',
        short_name: 'Pentacoder',
        start_url: '/Pentacoder/',
        display: 'standalone',
        description: 'A punk and inherently web data matrix encoder.',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
          {
            "src": "images/icons/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "images/icons/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
          }
        ],
        'screenshots': [
          // Mobile
          {
            'src': 'images/screenshots/narrow1.png',
            'sizes': '1080x2300',
            'type': 'image/png',
            'form_factor': 'narrow',
          },
          // Desktop
          {
            'src': 'images/screenshots/wide1.png',
            'sizes': '1920x1080',
            'type': 'image/png',
            'form_factor': 'wide',
          },
        ],
      }
    })
  ],
  resolve: {
    alias: [
      { find: '@/*', replacement: resolve(__dirname, 'src') },
      { find: '@assets', replacement: resolve(__dirname, './src/assets') },
      { find: '@styles', replacement: resolve(__dirname, './src/styles') },
    ]
  },
})
