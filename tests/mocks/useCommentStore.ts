import { vi } from "vitest";

vi.mock('@/stores/CommentStore', () => ({
    useCommentStore: () => ({
        getCommentsConfig: vi.fn()
    })
}));
