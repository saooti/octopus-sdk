import { mockI18n, mockUseRouter } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
vi.mock('vue-router', () => mockUseRouter());

const platforms = vi.hoisted(() => ({ count: 0 }));
vi.mock('@/components/composable/share/useSharePlatforms', () => ({
    useSharePlatforms: () => ({
        initPlatforms: vi.fn(),
        getPlatformsWithLinks: () => Array.from({ length: platforms.count }, (_, index) => ({
            name: `platform${index}`,
            icon: 'span',
            title: `Platform ${index}`,
            url: `https://example.com/${index}`
        }))
    })
}));

import SubscribeButtons from '@/components/display/sharing/SubscribeButtons.vue';
import { mount as testMount } from '@tests/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('SubscribeButtons', () => {
    let appElement: HTMLElement;

    const mount = (count: number, props: Record<string, unknown> = {}) => {
        platforms.count = count;
        return testMount(SubscribeButtons, {
            attachTo: appElement,
            props: {
                content: { emissionId: 1, name: 'Emission', annotations: {}, orga: { id: 'org1' } },
                ...props
            }
        });
    };

    const moreButton = () => document.getElementById('subscribe-buttons-dropdown');
    const popover = () => document.getElementById('popoversubscribe-buttons-dropdown');

    beforeEach(() => {
        // ClassicPopover is teleported to #app
        appElement = document.createElement('div');
        appElement.id = 'app';
        document.body.appendChild(appElement);
    });

    afterEach(() => {
        appElement.remove();
    });

    describe('more button', () => {
        it('is not rendered without hidden links, so that it stays absent without styles', async () => {
            const wrapper = await mount(2);
            expect(moreButton()).toBeNull();
            expect(popover()).toBeNull();
            wrapper.unmount();
        });

        it('is not rendered with a limit', async () => {
            const wrapper = await mount(10, { limit: 2 });
            expect(moreButton()).toBeNull();
            expect(popover()).toBeNull();
            wrapper.unmount();
        });

        it('exposes the menu of hidden links', async () => {
            const wrapper = await mount(10);
            expect(moreButton()?.getAttribute('aria-expanded')).toBe('false');
            expect(moreButton()?.getAttribute('aria-controls')).toBe(popover()?.id);
            expect(popover()?.querySelectorAll('a')).toHaveLength(5);
            wrapper.unmount();
        });
    });
});
