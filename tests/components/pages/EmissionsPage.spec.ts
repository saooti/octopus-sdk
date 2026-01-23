import '@tests/mocks/useAdvancedParamInit';

import EmissionsPage from '@/components/pages/EmissionsPage.vue';
import { mount } from '@tests/utils';

import { describe, expect, it } from 'vitest';

describe('EmissionsPage', () => {
    describe('props', () => {
        it('initialize properly when not set', async() => {
            const wrapper = await mount(EmissionsPage);
            const props = wrapper.vm.$props as Record<string, number>;
            expect(props.pr).toBeDefined();
            expect(props.ps).toBeDefined();
        });
    });
});
