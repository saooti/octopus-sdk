// vite.config.js
/* eslint-disable */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'unplugin-dts/vite';
const fs = require('fs');
const path = require('path');

// Chunk filenames are content-hashed, and since emptyOutDir is false (to
// preserve dist/index.d.ts between incremental builds), every rebuild leaves
// the previous version of every chunk behind. Purge stale .mjs chunks after
// each build/rebuild so dist doesn't grow unbounded during a long
// build:watch session. This must run in writeBundle (after the new chunks
// are written), not buildStart: deleting old chunks up front leaves a window
// where dist has no .mjs files at all, which linked consumers (frontoffice,
// podcastmaker) can catch mid-rebuild and choke on.
function cleanStaleChunks() {
  return {
    name: 'clean-stale-chunks',
    writeBundle(_, bundle) {
      const outDir = path.resolve(__dirname, 'dist');
      const freshFiles = new Set(Object.keys(bundle));
      for (const file of fs.readdirSync(outDir)) {
        if (file.endsWith('.mjs') && !freshFiles.has(file)) {
          fs.unlinkSync(path.join(outDir, file));
        }
      }
    }
  };
}

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
      entry: {
        index: path.resolve(__dirname, 'index.ts'),
        tests: path.resolve(__dirname, 'tests/index.ts'),
        'tests-mocks': path.resolve(__dirname, 'tests/mocks/index.ts')
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.mjs`
    },
    rollupOptions: {
      // Mark all dependencies as external so they are not bundled
      external: (id) => !id.startsWith('.') && !id.startsWith('@/') && !id.startsWith('@tests/') && !path.isAbsolute(id)
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
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
    cleanStaleChunks(),
    // Skip type declaration generation in dev/watch builds (used for linking)
    // to keep rebuilds fast; run a full `npm run build` before publishing.
    ...(mode === 'development' ? [] : [dts()]),
  ]
}));

/* eslint-enable */
