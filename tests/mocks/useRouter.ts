import { vi } from 'vitest';

vi.mock('vue-router', () => ({
    useRoute: () => ({
        path: '',
        query: {}
    }),
    useRouter: () => ({
        router: {}
    })
}));
