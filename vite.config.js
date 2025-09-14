import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://sentrad-backend-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  plugins: [vue()],
  resolve: {
    alias: {
      'vue-leaflet': path.resolve(__dirname, 'node_modules/vue-leaflet'),
    },
  },
  build: {
      outDir: 'public/build', 
      emptyOutDir: true, 
      manifest: true,
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
      },
    },
  
});
