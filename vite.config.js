// vite.config.js
/* eslint-disable */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
const fs = require('fs');
const path = require('path');
const BRANCH = fs.readFileSync('plateform.conf', 'utf8');
console.log("Content of BRANCH is " + BRANCH);

const defaultConfig = {
  css: {
    preprocessorOptions: {
        scss: {
            api: "modern-compiler",
            silenceDeprecations: ["legacy-js-api"]
        }        
    }
  },
  build: {
    outDir: 'target/dist',
    target: 'esnext',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        assetFileNames: (assetInfo) => {
          if("index.css"===assetInfo.name){
            return `assets/[name].[ext]`;
          }
          return `assets/[name]-[hash].[ext]`;
        },
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@scss': path.resolve(__dirname, './src/sass'),
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
  ]
};

export default defineConfig(({ mode }) => {
  if ('development' === mode) {
    return {
      ...defaultConfig,
      server: {
        proxy: {
          '^/api/init': {
            target: 'http://localhost:3000',
            ws: true,
            changeOrigin: true,
          },
          '^/api': {
            target: 'https://' + BRANCH,
            ws: true,
            changeOrigin: true,
          },
        }
      }
    }
  } else {
    return defaultConfig
  }
});

/* eslint-enable */