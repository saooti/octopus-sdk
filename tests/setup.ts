import { vi } from 'vitest';

// Tests run without isolation (see vitest.config.js), so the module registry
// is shared by all the test files of a worker. Reset it before each file so
// its vi.mock() calls apply even if an earlier file already imported the real
// modules (dependencies in node_modules are not affected and stay cached)
vi.resetModules();
