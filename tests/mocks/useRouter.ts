import { vi } from 'vitest';

vi.mock('vue-router', () => ({
    useRouter: () => ({
        router: {}
    })
}));
