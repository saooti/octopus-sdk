// Kept separate from tests/index.ts on purpose: these factories are meant to
// be referenced from a spec's vi.mock(path, () => mockX()) call, which
// Vitest hoists and turns into a dynamic import that must fully resolve
// before any export becomes visible. tests/index.ts re-exports utils.ts,
// which imports AuthStore.ts, which imports the real vue-i18n/vue-router —
// if these mocks lived in that same bundled module, importing one of them
// would deadlock waiting on the very import it's supposed to intercept.
export { mockI18n } from './i18n';
export { mockUseRouter } from './useRouter';
export { mockAdvancedParamInit } from './useAdvancedParamInit';
export { mockEmission, mockPodcast } from './rights';
