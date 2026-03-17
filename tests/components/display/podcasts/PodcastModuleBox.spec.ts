import '@tests/mocks/i18n';
import '@tests/mocks/useRouter';

import PodcastModuleBox from '@/components/display/podcasts/PodcastModuleBox.vue';
import { emptyPodcastData, Podcast } from '@/stores/class/general/podcast';
import { mount as testMount, setupAuthStore } from '@tests/utils';
import { describe, expect, it } from 'vitest';
import { initialize } from '@/stores/ParamSdkStore';

const mount = (podcast: Podcast) => testMount(PodcastModuleBox, {
    props: { podcast },
    stubs: ['ShareAnonymous', 'LikeSection'],
    beforeMount: setupAuthStore()
});

describe('PodcastModuleBox', () => {
    describe('date display', () => {
        const podcast: Podcast = emptyPodcastData();
        podcast.pubDate = '2025-12-01T10:21:31.000+00:00';

        it('shows the date without time by default', async() => {
            const wrapper = await mount(podcast);
            expect(wrapper.text()).toContain('1 December 2025');
            expect(wrapper.text()).not.toContain('11:21');
        });

        it('shows the date without time when disable in SdkParams', async() => {
            const wrapper = await mount(podcast);
            expect(wrapper.text()).toContain('1 December 2025');
            expect(wrapper.text()).not.toContain('11:21');
        });

        it('shows the date with time when enabled in SdkParams', async() => {
            initialize({ generalParameters: { showTimeWithDates: true } });
            const wrapper = await mount(podcast);
            expect(wrapper.text()).toContain('1 December 2025');
            expect(wrapper.text()).toContain('11:21');
        });
    });

    describe('season info', () => {
        it.each([
            { field: 'seasonNumber',       label: 'Podcast - Season'         },
            { field: 'seasonEpisodeNumber', label: 'Podcast - Episode number' },
        ])('hides $field when not set', async ({ label }) => {
            const wrapper = await mount(emptyPodcastData());
            expect(wrapper.text()).not.toContain(label);
        });

        it('shows season number when set', async () => {
            const wrapper = await mount({ ...emptyPodcastData(), seasonNumber: 2 });
            expect(wrapper.text()).toContain('Podcast - Season : 2');
        });

        it('shows episode number when set', async () => {
            const wrapper = await mount({ ...emptyPodcastData(), seasonEpisodeNumber: 5 });
            expect(wrapper.text()).toContain('Podcast - Episode number : 5');
        });
    });
});
