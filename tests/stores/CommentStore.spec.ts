import { useCommentStore } from '@/stores/CommentStore';
import { setupPinia } from '@tests/utils';
import { beforeEach, describe, expect, it } from 'vitest';

describe('CommentStore', () => {
    beforeEach(() => {
        setupPinia();
    });

    describe('unsubscribeComments', () => {
        it('resets the current podcast subscription', async () => {
            const store = useCommentStore();
            await store.initComments(1, 'orga');
            await store.unsubscribeComments();
            expect(store.commentPodcastId).toBeUndefined();
            expect(store.commentQueueName).toBeUndefined();
        });
    });
});
