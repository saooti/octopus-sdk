import { mockAdvancedParamInit } from '@tests/mocks';
vi.mock('@/components/composable/route/useAdvancedParamInit', () => mockAdvancedParamInit());

import EmissionsPage from '@/components/pages/EmissionsPage.vue';
import { mount } from '@tests/utils';

import { describe, expect, it, vi } from 'vitest';

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
