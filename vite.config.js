// vite.config.js
/* eslint-disable */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'unplugin-dts/vite';
const path = require('path');

export default defineConfig(({ mode }) => ({
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
    // Watch rebuilds only emit .mjs chunks (dts is skipped in dev mode, see
    // below); keep emptyOutDir false so those rebuilds don't delete the
    // dist/index.d.ts produced by a prior full `npm run build`.
    emptyOutDir: false,
    target: 'esnext',
    lib: {
      entry: path.resolve(__dirname, 'index.ts'),
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      // Mark all dependencies as external so they are not bundled
      external: (id) => !id.startsWith('.') && !id.startsWith('@/') && !path.isAbsolute(id)
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
    // Skip type declaration generation in dev/watch builds (used for linking)
    // to keep rebuilds fast; run a full `npm run build` before publishing.
    ...(mode === 'development' ? [] : [dts()]),
  ]
}));

/* eslint-enable */
