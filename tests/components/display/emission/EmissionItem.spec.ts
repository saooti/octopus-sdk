import { mockI18n, mockUseRouter } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
vi.mock('vue-router', () => mockUseRouter());

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

    describe('accessibility', () => {
        const emission = { name: 'My emission', description: 'My description' };

        it('renders the name in a h3 by default', async () => {
            const wrapper = await mount(emission);
            expect(wrapper.find('h3').text()).toBe('My emission');
        });

        it('renders the name in the given heading', async () => {
            const wrapper = await testMount(EmissionItem, {
                props: { emission: { ...emptyEmissionData(), ...emission }, titleTag: 'h2' }
            });
            expect(wrapper.find('h2').text()).toBe('My emission');
            expect(wrapper.find('h3').exists()).toBe(false);
        });

        it('limits the link to the name', async () => {
            const wrapper = await mount(emission);
            expect(wrapper.find('.element-link').text()).toBe('My emission');
        });

        it('does not nest links', async () => {
            const wrapper = await mount(emission);
            expect(wrapper.findAll('a')).toHaveLength(2);
            expect(wrapper.find('a a').exists()).toBe(false);
        });

        it('has a decorative image without title', async () => {
            const wrapper = await mount(emission);
            const img = wrapper.find('img');
            expect(img.attributes('alt')).toBe('');
            expect(img.attributes('title')).toBeUndefined();
        });
    });
});
