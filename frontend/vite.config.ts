import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import aurelia from '@aurelia/vite-plugin';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  appType: 'spa',
  server: { port: 9000, open: !process.env.CI, proxy: { '/api': { target: 'http://localhost:5191', changeOrigin: true, secure: false } } },
  test: {
    environment: 'jsdom',
    setupFiles: ['test/setup.ts'],
  },
    esbuild: {
      target: 'es2022'
    },
    plugins: [
      aurelia({
        useDev: true,
      }),
      nodePolyfills(),
      tailwindcss(),
    ],
});
