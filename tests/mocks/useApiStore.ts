import { vi } from "vitest";

vi.mock('@/stores/ApiStore', () => ({
    useApiStore: () => ({
    })
}));
