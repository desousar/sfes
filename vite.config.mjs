import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'url';
import path from 'path';

const filename = fileURLToPath(import.meta.url);
const pathSegments = path.dirname(filename);

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      injectRegister: 'auto',
      manifest: {
        name: 'sfes',
        theme_color: '#17a2b8',
        background_color: '#ffffff',
        icons: [
          {
            src: '/img/icons/mstile-150x150.png',
            sizes: '150x150',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(pathSegments, './src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  }
});
