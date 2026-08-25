import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import ClipboardModal from '@/components/misc/modal/ClipboardModal.vue';
import { emptyEmissionData } from '@/stores/class/general/emission';
import { mount, setupAuthStore } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

// Stands in for the real implementation that a consuming app (e.g.
// frontoffice) registers globally via app.component("RssSection", ...).
const FakeRssSection = {
    props: ['emission'],
    template: '<div class="fake-rss-section" :data-emission-id="emission?.emissionId" />',
};

describe('ClipboardModal', () => {
    describe('RssSection resolution', () => {
        it('renders the globally registered RssSection with the emission prop', async () => {
            const emission = { ...emptyEmissionData(), emissionId: 42 };
            const wrapper = await mount(ClipboardModal, {
                props: { link: 'https://example.com/rss', emission },
                globalComponents: { RssSection: FakeRssSection },
                beforeMount: setupAuthStore()
            });

            const rssSection = wrapper.find('.fake-rss-section');
            expect(rssSection.exists()).toBe(true);
            expect(rssSection.attributes('data-emission-id')).toBe('42');
        });

        it('renders nothing where RssSection would be when no global component is registered', async () => {
            const emission = { ...emptyEmissionData(), emissionId: 42 };
            const wrapper = await mount(ClipboardModal, {
                props: { link: 'https://example.com/rss', emission },
                beforeMount: setupAuthStore()
            });

            expect(wrapper.find('.fake-rss-section').exists()).toBe(false);
        });

        it('does not render RssSection when there is no emission', async () => {
            const wrapper = await mount(ClipboardModal, {
                props: { link: 'https://example.com/rss' },
                globalComponents: { RssSection: FakeRssSection },
                beforeMount: setupAuthStore()
            });

            expect(wrapper.find('.fake-rss-section').exists()).toBe(false);
        });
    });
});
