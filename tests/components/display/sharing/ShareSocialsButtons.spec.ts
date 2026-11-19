import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import ShareSocialsButtons from '@/components/display/sharing/ShareSocialsButtons.vue';
import { localisation, mount } from '@tests/utils';
import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSaveFetchStore } from '@/stores/SaveFetchStore';
import { useAuthStore } from '@/stores/AuthStore';

describe('ShareSocialsButtons', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    const mountButtons = async (hoverNone: boolean, slots = {}, attributes = {}, authOrgaId?: string) => {
        vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: hoverNone } as MediaQueryList);
        const wrapper = await mount(ShareSocialsButtons, {
            props: { organisationId: 'org1' },
            slots,
            beforeMount: () => {
                vi.spyOn(useSaveFetchStore(), 'getOrgaAttributes').mockResolvedValue(attributes);
                useAuthStore().authOrgaId = authOrgaId;
            }
        });
        await flushPromises();
        return wrapper;
    };

    it('names each link with the platform and a new window warning', async () => {
        const wrapper = await mountButtons(false);
        const link = wrapper.find('a');
        expect(link.attributes('target')).toBe('_blank');
        expect(link.find('.visually-hidden').text()).toBe(localisation('New window', { text: 'Facebook' }));
    });

    it('renders no empty list item when WhatsApp is hidden', async () => {
        const wrapper = await mountButtons(false);
        const items = wrapper.findAll('li');
        expect(items).toHaveLength(5);
        items.forEach((item) => expect(item.find('a').exists()).toBe(true));
    });

    it('shows WhatsApp on touch devices', async () => {
        const wrapper = await mountButtons(true);
        expect(wrapper.findAll('li')).toHaveLength(6);
    });

    it('wraps additional buttons in a list item', async () => {
        const wrapper = await mountButtons(false, { 'additional-buttons': '<div class="extra">Extra</div>' });
        expect(wrapper.find('ul > li > .extra').exists()).toBe(true);
        expect(wrapper.find('ul > .extra').exists()).toBe(false);
    });

    it('renders no additional buttons item when sharing is disabled', async () => {
        // Logged in, so the section is still shown although sharing is disabled
        const wrapper = await mountButtons(false, { 'additional-buttons': '<div class="extra">Extra</div>' }, { noSharing: 'true' }, 'org1');
        expect(wrapper.findAll('li')).toHaveLength(5);
        expect(wrapper.find('.extra').exists()).toBe(false);
    });

    it('encodes the page URL in share links', async () => {
        window.history.replaceState({}, '', '/page?a=1&b=2');
        const wrapper = await mountButtons(false);
        expect(wrapper.find('a').attributes('href')).toBe(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
        );
        expect(wrapper.find('a').attributes('href')).not.toContain('&b=2');
    });
});
