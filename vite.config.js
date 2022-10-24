/* eslint-disable */

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
const path = require('path');
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@scss': path.resolve(__dirname, './src/sass'),
    },
  },
  plugins: [
    vue(),
  ]
});
/* eslint-enable */