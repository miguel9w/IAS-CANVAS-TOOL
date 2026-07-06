import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuracao minima do Vite — apenas o plugin de React e necessario.
// O Babel Standalone usado para compilar widgets em runtime e carregado
// via CDN no index.html e nao interfere no build do Vite.
export default defineConfig({
  plugins: [react()],
  base: '/IAS-CANVAS-TOOL/canvas/',
  server: { port: 5173 },
  build: {
    outDir: '../docs/canvas',
    emptyOutDir: true,
  },
});
