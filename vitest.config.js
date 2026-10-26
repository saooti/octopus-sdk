import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

const resolvedViteConfig = typeof viteConfig === 'function'
    ? viteConfig({ mode: 'test', command: 'serve' })
    : viteConfig;

export default defineConfig(mergeConfig(resolvedViteConfig, defineConfig({
    test: {
        environment: 'happy-dom',
        // Each worker boots its own environment at startup; the default
        // (cores - 1) causes a large memory spike on many-core machines
        maxWorkers: '25%',
        // Reuse the environment between test files of a same worker instead
        // of booting a new one for each; module state is reset in setup.ts
        isolate: false,
        setupFiles: ['./tests/setup.ts'],
        typecheck: {
            enabled: true,
            tsconfig: './tsconfig.test.json'
        }
    }
})));
