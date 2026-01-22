import { vi } from "vitest";

vi.mock('@/stores/PlayerStore', () => ({
    usePlayerStore: () => ({
    })
}));
