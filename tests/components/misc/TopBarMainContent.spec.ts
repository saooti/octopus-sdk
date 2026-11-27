import { mockUseRouter, mockI18n } from '@tests/mocks';
vi.mock('vue-router', () => mockUseRouter());
vi.mock('vue-i18n', () => mockI18n());

import TopBarMainContent from '@/components/misc/TopBarMainContent.vue';
import { useFilterStore } from '@/stores/FilterStore';
import { mount as testMount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

const DEFAULT_LOGO = '/img/logo_saooti_play_white.svg';

describe('TopBarMainContent', () => {
    const mount = (filter: { orgaId?: string, imgUrl?: string } = {}) =>
        testMount(TopBarMainContent, {
            props: { titleDisplay: '' },
            stubs: ['RightsScopeMenu', 'RightsScopeSelector', 'HomeDropdown', 'MobileMenu', 'ClassicPopover'],
            beforeMount: () => {
                const filterStore = useFilterStore();
                filterStore.filterOrgaId = filter.orgaId;
                filterStore.filterImgUrl = filter.imgUrl;
            }
        });

    const homeLogo = (wrapper: Awaited<ReturnType<typeof mount>>) =>
        wrapper.find('.top-bar-logo img');

    describe('home link logo', () => {
        it('shows the default logo when the organisation has no image', async () => {
            const wrapper = await mount({ orgaId: 'org-1' });
            expect(homeLogo(wrapper).attributes('src')).toBe(DEFAULT_LOGO);
            expect(wrapper.find('img[src*="undefined"]').exists()).toBe(false);
        });

        it('shows the default logo for a placeholder image', async () => {
            const wrapper = await mount({ orgaId: 'org-1', imgUrl: 'https://example.com/emptypodcast.png' });
            expect(homeLogo(wrapper).attributes('src')).toBe(DEFAULT_LOGO);
        });

        it('shows the organisation logo when it has an image', async () => {
            const wrapper = await mount({ orgaId: 'org-1', imgUrl: 'https://example.com/logo.png' });
            expect(homeLogo(wrapper).classes()).toContain('client-logo');
        });

        it('falls back on the default logo when the organisation logo fails to load', async () => {
            const wrapper = await mount({ orgaId: 'org-1', imgUrl: 'https://example.com/logo.png' });
            await homeLogo(wrapper).trigger('error');
            expect(homeLogo(wrapper).attributes('src')).toBe(DEFAULT_LOGO);
        });
    });

    describe('accessibility', () => {
        it('has no title on decorative logos', async () => {
            const wrapper = await mount({ orgaId: 'org-1', imgUrl: 'https://example.com/logo.png' });
            const decorative = wrapper.findAll('img[aria-hidden="true"]');
            expect(decorative.length).toBeGreaterThan(0);
            decorative.forEach(img => expect(img.attributes('title')).toBeUndefined());
        });
    });
});
