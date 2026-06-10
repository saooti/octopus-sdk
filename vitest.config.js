import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';
const path = require('path');

export default defineConfig(env => mergeConfig(viteConfig(env), defineConfig({
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
