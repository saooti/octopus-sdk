import { mockI18n, mockUseRouter } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
vi.mock('vue-router', () => mockUseRouter());

import PodcastItem from '@/components/display/podcasts/PodcastItem.vue';
import { emptyPodcastData } from '@/stores/class/general/podcast';
import { mount as testMount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

const mount = (description = 'Some description') => testMount(PodcastItem, {
    props: { podcast: { ...emptyPodcastData(), description } },
    stubs: ['PodcastItemInfo', 'PodcastPlayButton']
});

describe('PodcastItem', () => {
    describe('description', () => {
        it('is toggled by a disclosure button', async () => {
            const wrapper = await mount();
            const button = wrapper.find('button[aria-controls]');
            const panel = wrapper.find('.description-podcast-item');
            expect(button.attributes('aria-controls')).toBe(panel.attributes('id'));
            expect(button.attributes('aria-expanded')).toBe('false');
            expect(panel.attributes('style')).toContain('display: none');

            await button.trigger('click');
            expect(button.attributes('aria-expanded')).toBe('true');
            expect(panel.attributes('style') ?? '').not.toContain('display: none');
        });

        it('has no button without description', async () => {
            const wrapper = await mount('');
            expect(wrapper.find('button[aria-controls]').exists()).toBe(false);
        });

        it('is closed with Escape', async () => {
            const wrapper = await mount();
            const button = wrapper.find('button[aria-controls]');
            await button.trigger('click');

            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            await wrapper.vm.$nextTick();
            expect(button.attributes('aria-expanded')).toBe('false');
        });

        it('opens on hover and closes when leaving the card', async () => {
            vi.useFakeTimers();
            const wrapper = await mount();
            const button = wrapper.find('button[aria-controls]');

            await wrapper.find('.description-podcast-item + div').trigger('mouseenter');
            await vi.advanceTimersByTimeAsync(100);
            expect(button.attributes('aria-expanded')).toBe('true');

            await wrapper.find('article').trigger('mouseleave');
            await vi.advanceTimersByTimeAsync(100);
            expect(button.attributes('aria-expanded')).toBe('false');
            vi.useRealTimers();
        });

        it('stays open when leaving the card after opening with the button', async () => {
            vi.useFakeTimers();
            const wrapper = await mount();
            const button = wrapper.find('button[aria-controls]');
            await button.trigger('click');

            await wrapper.find('article').trigger('mouseleave');
            await vi.advanceTimersByTimeAsync(100);
            expect(button.attributes('aria-expanded')).toBe('true');
            vi.useRealTimers();
        });
    });
});
