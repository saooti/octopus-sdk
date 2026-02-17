import '@tests/mocks/useRouter';
import '@tests/mocks/useAdvancedParamInit';
import '@tests/mocks/i18n';

import AdvancedSearch from '@/components/display/filter/AdvancedSearch.vue';
import { mount } from '@tests/utils';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/AuthStore';
import { state } from '@/stores/ParamSdkStore';
import { useGeneralStore } from '@/stores/GeneralStore';

// Mock the useOrgaComputed composable
vi.mock('@/components/composable/useOrgaComputed', () => ({
    useOrgaComputed: () => {
        const { computed } = require('vue');
        return {
            isPodcastmaker: computed(() => state.generalParameters.podcastmaker as boolean),
            isEditRights: (orgaId?: string) => {
                const authStore = useAuthStore();
                return authStore.authOrgaId === orgaId || authStore.isRoleAdmin;
            }
        };
    }
}));

// Mock the groups API
vi.mock('@/api/groupsApi', () => {
    return {
        groupsApi: {
            count: vi.fn().mockResolvedValue(0)
        }
    };
});

describe('AdvancedSearch - isSelectValidity computed (fix for isPodcastmaker.value)', () => {
    beforeEach(() => {
        // Reset the podcastmaker state before each test
        state.generalParameters.podcastmaker = false;
    });

    it('should correctly evaluate isSelectValidity when isPodcastmaker is false', async () => {
        const wrapper = await mount(AdvancedSearch, {
            props: {
                organisationId: 'test-org-id',
                isEmission: false,
                includeHidden: true
            },
            beforeMount: async () => {
                const authStore = useAuthStore();
                authStore.$patch({
                    authOrgaId: 'test-org-id',
                    authRole: ['PODCAST_CRUD'],
                    authOrganisation: {
                        id: 'test-org-id',
                        name: 'Test Organisation',
                        imageUrl: '',
                        attributes: {}
                    }
                });

                const generalStore = useGeneralStore();
                generalStore.$patch({
                    platformEducation: false
                });

                // Ensure isPodcastmaker is false
                state.generalParameters.podcastmaker = false;
            }
        });

        // Access the component's computed property
        const vm = wrapper.vm as any;

        // When isPodcastmaker is false and other conditions are met,
        // isSelectValidity should be true
        expect(vm.isSelectValidity).toBe(true);
    });

    it('should correctly evaluate isSelectValidity when isPodcastmaker is true', async () => {
        const wrapper = await mount(AdvancedSearch, {
            props: {
                organisationId: 'test-org-id',
                isEmission: false,
                includeHidden: true
            },
            beforeMount: async () => {
                const authStore = useAuthStore();
                authStore.$patch({
                    authOrgaId: 'test-org-id',
                    authRole: ['PODCAST_CRUD'],
                    authOrganisation: {
                        id: 'test-org-id',
                        name: 'Test Organisation',
                        imageUrl: '',
                        attributes: {}
                    }
                });

                const generalStore = useGeneralStore();
                generalStore.$patch({
                    platformEducation: false
                });

                // Set isPodcastmaker to true
                state.generalParameters.podcastmaker = true;
            }
        });

        // Access the component's computed property
        const vm = wrapper.vm as any;

        // When isPodcastmaker is true, isSelectValidity should be false
        // (because the condition includes !isPodcastmaker.value)
        expect(vm.isSelectValidity).toBe(false);
    });

    it('should correctly evaluate isSelectValidity when isEmission is true', async () => {
        const wrapper = await mount(AdvancedSearch, {
            props: {
                organisationId: 'test-org-id',
                isEmission: true, // This should make isSelectValidity false
                includeHidden: true
            },
            beforeMount: async () => {
                const authStore = useAuthStore();
                authStore.$patch({
                    authOrgaId: 'test-org-id',
                    authRole: ['PODCAST_CRUD'],
                    authOrganisation: {
                        id: 'test-org-id',
                        name: 'Test Organisation',
                        imageUrl: '',
                        attributes: {}
                    }
                });

                const generalStore = useGeneralStore();
                generalStore.$patch({
                    platformEducation: false
                });

                state.generalParameters.podcastmaker = false;
            }
        });

        const vm = wrapper.vm as any;

        // When isEmission is true, isSelectValidity should be false
        expect(vm.isSelectValidity).toBe(false);
    });

    it('should correctly evaluate isSelectValidity when includeHidden is false', async () => {
        const wrapper = await mount(AdvancedSearch, {
            props: {
                organisationId: 'test-org-id',
                isEmission: false,
                includeHidden: false // This should make isSelectValidity false
            },
            beforeMount: async () => {
                const authStore = useAuthStore();
                authStore.$patch({
                    authOrgaId: 'test-org-id',
                    authRole: ['PODCAST_CRUD'],
                    authOrganisation: {
                        id: 'test-org-id',
                        name: 'Test Organisation',
                        imageUrl: '',
                        attributes: {}
                    }
                });

                const generalStore = useGeneralStore();
                generalStore.$patch({
                    platformEducation: false
                });

                state.generalParameters.podcastmaker = false;
            }
        });

        const vm = wrapper.vm as any;

        // When includeHidden is false, isSelectValidity should be false
        expect(vm.isSelectValidity).toBe(false);
    });
});
