import '@tests/mocks/useRouter';

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { defineComponent, nextTick } from 'vue';
import { mount as _mount } from '@vue/test-utils';

import { useAdvancedParamInit } from '@/components/composable/route/useAdvancedParamInit';
import { state } from '@/stores/ParamSdkStore';
import { setupPinia, setupAuthStore } from '@tests/utils';
import type { RouteProps } from '@/components/composable/route/types';

vi.mock('@/api/groupsApi', () => ({
    groupsApi: { getAllById: vi.fn().mockResolvedValue({}) }
}));

async function setupComposable(
    props: RouteProps,
    isEmission: boolean,
    patchStores?: () => void | Promise<void>
): Promise<ReturnType<typeof useAdvancedParamInit>> {
    let result!: ReturnType<typeof useAdvancedParamInit>;

    const pinia = setupPinia();
    await patchStores?.();

    _mount(defineComponent({
        setup() { result = useAdvancedParamInit(props, isEmission); return {}; },
        template: '<div/>'
    }), { global: { plugins: [pinia] } });

    await nextTick(); // allow onMounted
    await nextTick(); // allow isInit via nextTick in initAdvancedParams

    return result;
}

describe('useAdvancedParamInit', () => {
    beforeEach(() => {
        state.generalParameters.podcastmaker = false;
    });

    describe('initValidity', () => {
        const propsWithHidden: RouteProps = { routeValidity: 'false', routeIncludeHidden: 'true' };
        const withOrg = (roles: string[]) => setupAuthStore({ roles, organisationId: 'test-org-id' });

        describe('forces validity to "true"', () => {
            it('when isEmission is true', async () => {
                const { validity } = await setupComposable(propsWithHidden, true, withOrg(['PRODUCTION']));
                expect(validity.value).toBe('true');
            });

            it('when isPodcastmaker is true', async () => {
                state.generalParameters.podcastmaker = true;
                const { validity } = await setupComposable(propsWithHidden, false, withOrg(['PRODUCTION']));
                expect(validity.value).toBe('true');
            });

            it('when includeHidden is false (no org)', async () => {
                // authOrgaId starts undefined → filterOrgaId undefined → organisation undefined → includeHidden false
                const { validity } = await setupComposable(propsWithHidden, false);
                expect(validity.value).toBe('true');
            });

            it('when routeIncludeHidden is "false"', async () => {
                const { validity } = await setupComposable(
                    { routeValidity: 'false', routeIncludeHidden: 'false' },
                    false,
                    withOrg(['PRODUCTION'])
                );
                expect(validity.value).toBe('true');
            });

            (['PODCAST_CRUD', 'RESTRICTED_PRODUCTION', 'PLAYLISTS'] as const).forEach(role => {
                it(`when role cannot validate (${role})`, async () => {
                    const { validity } = await setupComposable(propsWithHidden, false, withOrg([role]));
                    expect(validity.value).toBe('true');
                });
            });
        });

        describe('uses routeValidity when canValidatePodcast() is true', () => {
            (['ADMIN', 'ORGANISATION', 'PRODUCTION', 'PODCAST_VALIDATION'] as const).forEach(role => {
                it(`allows role ${role}`, async () => {
                    const { validity } = await setupComposable(propsWithHidden, false, withOrg([role]));
                    expect(validity.value).toBe('false');
                });
            });
        });
    });
});
