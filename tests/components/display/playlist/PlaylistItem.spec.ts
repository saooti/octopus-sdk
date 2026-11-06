import { mockI18n, mockUseRouter } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
vi.mock('vue-router', () => mockUseRouter());

import PlaylistItem from '@/components/display/playlist/PlaylistItem.vue';
import { emptyPlaylistData } from '@/stores/class/general/playlist';
import { mount as testMount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

const mount = (props: Record<string, unknown> = {}) => testMount(PlaylistItem, {
    props: {
        playlist: {
            ...emptyPlaylistData(),
            title: 'My playlist',
            description: 'My description',
            organisation: { id: 'orga', name: 'Orga' }
        },
        ...props
    }
});

describe('PlaylistItem', () => {
    describe('accessibility', () => {
        it('renders the name in a h3 by default', async () => {
            const wrapper = await mount();
            expect(wrapper.find('h3').text()).toBe('My playlist');
        });

        it('renders the name in the given heading', async () => {
            const wrapper = await mount({ titleTag: 'h2' });
            expect(wrapper.find('h2').text()).toBe('My playlist');
            expect(wrapper.find('h3').exists()).toBe(false);
        });

        it('limits the link to the name', async () => {
            const wrapper = await mount();
            expect(wrapper.find('.element-link').text()).toBe('My playlist');
        });

        it('does not nest links', async () => {
            const wrapper = await mount();
            expect(wrapper.findAll('a')).toHaveLength(2);
            expect(wrapper.find('a a').exists()).toBe(false);
        });

        it('has a decorative image without title', async () => {
            const wrapper = await mount();
            const img = wrapper.find('img');
            expect(img.attributes('alt')).toBe('');
            expect(img.attributes('title')).toBeUndefined();
        });
    });
});
