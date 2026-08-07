import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';
const path = require('path');

const resolvedViteConfig = typeof viteConfig === 'function'
    ? viteConfig({ mode: 'test', command: 'serve' })
    : viteConfig;

export default defineConfig(mergeConfig(resolvedViteConfig, defineConfig({
    resolve: {
        alias: {
            '@tests': path.resolve(__dirname, './tests')
        },
    },
    test: {
        environment: 'happy-dom',
        //setupFiles: ['./tests/setup.ts'],
        typecheck: {
            enabled: true,
            tsconfig: './tsconfig.test.json'
        }
    }
})));
