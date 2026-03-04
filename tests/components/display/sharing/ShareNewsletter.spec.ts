import '@tests/mocks/useRouter';
import '@tests/mocks/i18n';

import ShareNewsletter from '@/components/display/sharing/ShareNewsletter.vue';
import { mount as testMount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';
import { useSaveFetchStore } from '@/stores/SaveFetchStore';

describe('ShareNewsletter', () => {
    const mockSaveFetchStore = async () => {
        const saveFetchStore = useSaveFetchStore();
        vi.spyOn(saveFetchStore, 'getOrgaAttributes').mockResolvedValue({});
    };

    it('newsletterHtml contains no "[object Object]" for a podcast', async () => {
        const wrapper = await testMount(ShareNewsletter, {
            props: {
                podcast: {
                    podcastId: 1,
                    title: 'Episode title',
                    description: 'Episode description',
                    imageUrl: 'https://example.com/image.jpg',
                    article: 'https://example.com/article',
                    emission: { emissionId: 10, name: 'Emission name' },
                },
            },
            beforeMount: mockSaveFetchStore,
        });

        const html = (wrapper.vm as any).newsletterHtml;
        expect(html).not.toContain('[object Object]');
    });

    it('newsletterHtml contains no "[object Object]" for an emission', async () => {
        const wrapper = await testMount(ShareNewsletter, {
            props: {
                emission: {
                    emissionId: 10,
                    name: 'Emission name',
                    description: 'Emission description',
                    imageUrl: 'https://example.com/image.jpg',
                },
            },
            beforeMount: mockSaveFetchStore,
        });

        const html = (wrapper.vm as any).newsletterHtml;
        expect(html).not.toContain('[object Object]');
    });

    it('newsletterHtml contains no "[object Object]" for a playlist', async () => {
        const wrapper = await testMount(ShareNewsletter, {
            props: {
                playlist: {
                    playlistId: 20,
                    title: 'Playlist title',
                    description: 'Playlist description',
                    imageUrl: 'https://example.com/image.jpg',
                },
            },
            beforeMount: mockSaveFetchStore,
        });

        const html = (wrapper.vm as any).newsletterHtml;
        expect(html).not.toContain('[object Object]');
    });
});
