import { mockUseRouter, mockI18n } from '@tests/mocks';
vi.mock('vue-router', () => mockUseRouter());
vi.mock('vue-i18n', () => mockI18n());

import SharePlayer from '@/components/display/sharing/SharePlayer.vue';
import { mount as testMount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';
import { useApiStore } from '@/stores/ApiStore';
import { useSaveFetchStore } from '@/stores/SaveFetchStore';

describe('SharePlayer', () => {
    it('renders iframe with frameborder="0"', async () => {
        const wrapper = await testMount(SharePlayer, {
            props: {
                podcast: {
                    podcastId: 123,
                    organisation: { id: 'org1' },
                    availability: { visibility: true }
                },
                organisationId: 'org1',
                notExclusive: true
            },
            beforeMount: async () => {
                const apiStore = useApiStore();
                apiStore.miniplayerUrl = 'https://test.com/';

                const saveFetchStore = useSaveFetchStore();
                vi.spyOn(saveFetchStore, 'getOrgaAttributes').mockResolvedValue({});
            }
        });

        const iframe = wrapper.find('#miniplayerIframe');
        expect(iframe.attributes('frameborder')).toBe('0');
    });

    it('includes frameborder="0" in generated iframe code', async () => {
        const wrapper = await testMount(SharePlayer, {
            props: {
                podcast: {
                    podcastId: 123,
                    organisation: { id: 'org1' },
                    availability: { visibility: true }
                },
                organisationId: 'org1',
                notExclusive: true
            },
            beforeMount: async () => {
                const apiStore = useApiStore();
                apiStore.miniplayerUrl = 'https://test.com/';

                const saveFetchStore = useSaveFetchStore();
                vi.spyOn(saveFetchStore, 'getOrgaAttributes').mockResolvedValue({});
            }
        });

        const iFrameCode = (wrapper.vm as any).iFrame;
        expect(iFrameCode).toContain('frameborder="0"');
    });
});
