import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import CommentList from '@/components/display/comments/CommentList.vue';
import { emptyComment } from '@/stores/class/general/comment';
import { mount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

const receiveEvent = vi.hoisted(() => vi.fn());

vi.mock('@/api/classicApi', () => ({
    default: {
        fetchData: vi.fn().mockResolvedValue({
            result: [{ commentId: 1 }, { commentId: 2 }],
            count: 2
        })
    }
}));

// Each fake item exposes receiveEvent, tagged with its own commentId
vi.mock('@/components/display/comments/item/CommentItem.vue', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        __esModule: true,
        default: defineComponent({
            props: { comment: { type: Object, required: true } },
            setup(props, { expose }) {
                expose({ receiveEvent: (event: unknown) => receiveEvent(props.comment.commentId, event) });
                return () => h('div');
            }
        })
    };
});

describe('CommentList', () => {
    it('forwards an answer event to the CommentItem it answers', async () => {
        const wrapper = await mount(CommentList, { stubs: ['ClassicPopover'] });

        const event = { type: 'CREATE', comment: { ...emptyComment(), commentId: 10, answerTo: 2 } };
        await wrapper.setProps({ eventToHandle: event });

        expect(receiveEvent).toHaveBeenCalledOnce();
        expect(receiveEvent).toHaveBeenCalledWith(2, event);
    });
});
