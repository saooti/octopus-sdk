import { mockAdvancedParamInit } from '@tests/mocks';
vi.mock('@/components/composable/route/useAdvancedParamInit', () => mockAdvancedParamInit({
    isInit: true,
    organisationId: { value: undefined },
    rubriquesFilterArrayIds: {}
}));

import PodcastsPage from '@/components/pages/PodcastsPage.vue';
import { mount } from '@tests/utils';

import { describe, expect, it, vi } from 'vitest';

describe('PodcastsPage', () => {
    describe('props', () => {
        it('initialize properly when not set', async() => {
            const wrapper = await mount(PodcastsPage, { shallow: true });
            const props = wrapper.vm.$props as Record<string, number>;
            expect(props.pr).toBeDefined();
            expect(props.ps).toBeDefined();
        });
    });

    it('has a visually hidden h1', async() => {
        const wrapper = await mount(PodcastsPage, { shallow: true });
        const h1 = wrapper.find('h1');
        expect(h1.exists()).toBe(true);
        expect(h1.classes()).toContain('visually-hidden');
    });
});
