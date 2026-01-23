import '@tests/mocks/useAdvancedParamInit';

import PodcastsPage from '@/components/pages/PodcastsPage.vue';
import { mount } from '@tests/utils';

import { describe, expect, it } from 'vitest';

describe('PodcastsPage', () => {
    describe('props', () => {
        it('initialize properly when not set', async() => {
            const wrapper = await mount(PodcastsPage);
            const props = wrapper.vm.$props as Record<string, number>;
            expect(props.pr).toBeDefined();
            expect(props.ps).toBeDefined();
        });
    });
});
