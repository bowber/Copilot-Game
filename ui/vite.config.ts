import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  base: '/Copilot-Game/',
  server: {
    port: 3000,
    host: true,
    fs: {
      allow: ['..']
    }
  },
  assetsInclude: ['**/*.wasm']
});