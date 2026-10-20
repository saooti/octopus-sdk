import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import CommentInput from '@/components/display/comments/CommentInput.vue';
import { useCommentStore } from '@/stores/CommentStore';
import { mount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

const playerState = vi.hoisted(() => ({
    podcast: undefined as { podcastId: number } | undefined,
    live: undefined as { podcastId: number } | undefined,
    currentTime: 0,
    duration: 0
}));
vi.mock('@saooti/saooti-player', () => ({
    saootiPlayer: { state: playerState }
}));
vi.mock('@/api/classicApi', () => ({
    default: { postData: vi.fn().mockResolvedValue({}) }
}));

import classicApi from '@/api/classicApi';

async function postCommentWithPlayer(state: Partial<typeof playerState>): Promise<number> {
    Object.assign(playerState, { podcast: undefined, live: undefined, currentTime: 0, duration: 0 }, state);
    vi.mocked(classicApi.postData).mockClear();

    const wrapper = await mount(CommentInput, {
        props: { podcast: { podcastId: 1, duration: 3600000 } },
        stubs: {
            CommentName: true,
            ClassicEmojiPicker: true,
            ClassicContentEditable: {
                template: '<textarea @focus="$emit(\'focus\')" @input="$emit(\'update:modelValue\', $event.target.value)" />'
            }
        },
        beforeMount: () => {
            useCommentStore().commentUser = { name: 'John', uuid: 'uuid', uuidHash: null };
        }
    });

    const textarea = wrapper.find('textarea');
    await textarea.trigger('focus');
    await textarea.setValue('Hello');
    await wrapper.find('button.btn-primary').trigger('mousedown');

    const { dataToSend } = vi.mocked(classicApi.postData).mock.calls[0][0] as { dataToSend: { timeline: number } };
    return dataToSend.timeline;
}

describe('CommentInput', () => {
    describe('timeline', () => {
        it.each([
            ['the podcast is playing', { podcast: { podcastId: 1 }, currentTime: 60, duration: 3600 }, 60],
            ['the podcast is playing after a pre-roll ad', { podcast: { podcastId: 1 }, currentTime: 90, duration: 3630 }, 60],
            ['the pre-roll ad is still playing', { podcast: { podcastId: 1 }, currentTime: 10, duration: 3630 }, 0],
            ['the podcast is playing as a live', { live: { podcastId: 1 }, currentTime: 120, duration: 0 }, 120],
            ['another podcast is playing', { podcast: { podcastId: 2 }, currentTime: 60, duration: 3600 }, 0],
            ['nothing is playing', {}, 0]
        ])('is correct when %s', async (_, state, expected) => {
            expect(await postCommentWithPlayer(state)).toBe(expected);
        });
    });
});
