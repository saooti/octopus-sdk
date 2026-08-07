// vite.config.js
/* eslint-disable */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'unplugin-dts/vite';
const path = require('path');

export default defineConfig({
  css: {
    preprocessorOptions: {
        scss: {
            api: "modern-compiler",
            silenceDeprecations: ["legacy-js-api"]
        }
    }
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    lib: {
      entry: path.resolve(__dirname, 'index.ts'),
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      // Mark all dependencies as external so they are not bundled
      external: (id) => !id.startsWith('.') && !path.isAbsolute(id)
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      vue: __dirname+`/node_modules/vue`,
      "hls.js":__dirname+`/node_modules/hls.js`

    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  plugins: [
    vue(),
    dts(),
  ]
});

/* eslint-enable */
