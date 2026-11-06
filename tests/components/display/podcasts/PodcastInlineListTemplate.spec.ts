import { mockI18n, mockUseRouter } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
vi.mock('vue-router', () => mockUseRouter());

import PodcastInlineListTemplate from '@/components/display/podcasts/PodcastInlineListTemplate.vue';
import { mount as testMount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

const mount = (props: Record<string, unknown> = {}) =>
    testMount(PodcastInlineListTemplate, { shallow: true, props });

describe('PodcastInlineListTemplate', () => {
    describe('noSort prop', () => {
        it('shows sort buttons by default', async () => {
            const wrapper = await mount();
            expect(wrapper.find('.btn-underline').exists()).toBe(true);
        });

        it('hides sort buttons when noSort is true', async () => {
            const wrapper = await mount({ noSort: true });
            expect(wrapper.find('.btn-underline').exists()).toBe(false);
        });
    });

    describe('accessibility', () => {
        const pressedStates = async (popularSort: boolean) => {
            const wrapper = await mount({ popularSort });
            return wrapper.findAll('.btn-underline')
                .map(button => button.attributes('aria-pressed'));
        };

        it('exposes the chronological sort as selected', async () => {
            expect(await pressedStates(false)).toEqual(['true', 'false']);
        });

        it('exposes the popular sort as selected', async () => {
            expect(await pressedStates(true)).toEqual(['false', 'true']);
        });
    });
});
