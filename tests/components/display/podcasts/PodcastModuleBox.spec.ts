import '@tests/mocks/i18n';
import '@tests/mocks/useRouter';

import PodcastModuleBox from '@/components/display/podcasts/PodcastModuleBox.vue';
import { emptyPodcastData, Podcast } from '@/stores/class/general/podcast';
import { mount, setupAuthStore } from '@tests/utils';
import { describe, expect, it } from 'vitest';
import { initialize } from '@/stores/ParamSdkStore';

describe('PodcastModuleBox', () => {
    describe('date display', () => {
        const podcast: Podcast = emptyPodcastData();
        podcast.pubDate = '2025-12-01T10:21:31.000+00:00';

        it('shows the date without time by default', async() => {
            const wrapper = await mount(PodcastModuleBox, {
                props: { podcast },
                stubs: ['ShareAnonymous', 'LikeSection'],
                beforeMount: setupAuthStore()
            });
            expect(wrapper.text()).toContain('1 December 2025');
            expect(wrapper.text()).not.toContain('11:21');
        });

        it('shows the date without time when disable in SdkParams', async() => {
            const wrapper = await mount(PodcastModuleBox, {
                props: { podcast },
                stubs: ['ShareAnonymous', 'LikeSection'],
                beforeMount: setupAuthStore()
            });
            expect(wrapper.text()).toContain('1 December 2025');
            expect(wrapper.text()).not.toContain('11:21');
        });

        it('shows the date with time when enabled in SdkParams', async() => {
            initialize({
                generalParameters: { showTimeWithDates: true }
            });
            const wrapper = await mount(PodcastModuleBox, {
                props: { podcast },
                stubs: ['ShareAnonymous', 'LikeSection'],
                beforeMount: setupAuthStore()
            });
            expect(wrapper.text()).toContain('1 December 2025');
            expect(wrapper.text()).toContain('11:21');
        });
    });
});
