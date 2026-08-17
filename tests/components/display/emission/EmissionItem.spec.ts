import '@tests/mocks/i18n';
import '@tests/mocks/useRouter';

vi.mock('@/api/classicApi', () => ({
    default: { fetchData: vi.fn().mockResolvedValue({ count: 1 }) }
}));

import EmissionItem from '@/components/display/emission/EmissionItem.vue';
import { useAuthStore } from '@/stores/AuthStore';
import { emptyEmissionData, Emission } from '@/stores/class/general/emission';
import { mount as testMount, setupAuthStore } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

const mount = (emission: Partial<Emission> = {}, auth?: { roles: string[], scope?: number[] }) => {
    const base = emptyEmissionData();
    return testMount(EmissionItem, {
        props: { emission: { ...base, ...emission } },
        beforeMount: auth ? async () => {
            await setupAuthStore({ roles: auth.roles, scope: auth.scope })();
            useAuthStore().$patch({
                authProfile: { userId: 'test-user-123', scope: auth.scope ?? [] },
                authParam: { accessToken: 'test-token', refreshToken: undefined, expiration: undefined },
            });
        } : undefined
    });
};

describe('EmissionItem', () => {
    describe('RightsIndicator (scope)', () => {
        it('shows RightsIndicator when the emission is out of the user\'s scope', async () => {
            const wrapper = await mount(
                { emissionId: 1, rubriqueIds: [10] },
                { roles: ['PRODUCTION'], scope: [999] }
            );

            const icon = wrapper.find('.rights-indicator-icon');
            expect(icon.exists()).toBe(true);
            expect(icon.classes()).not.toContain('invisible');
            expect(wrapper.text()).toContain('RightsIndicator - Emission - Insufficient scope');
        });

        it('hides RightsIndicator when the emission is within the user\'s scope', async () => {
            const wrapper = await mount(
                { emissionId: 1, rubriqueIds: [10] },
                { roles: ['PRODUCTION'], scope: [10] }
            );

            const icon = wrapper.find('.rights-indicator-icon');
            expect(icon.exists()).toBe(true);
            expect(icon.classes()).toContain('invisible');
        });
    });
});
