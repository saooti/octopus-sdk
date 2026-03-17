import '@tests/mocks/i18n';
import '@tests/mocks/useRouter';

import PodcastModuleBox from '@/components/display/podcasts/PodcastModuleBox.vue';
import { SeasonMode } from '@/stores/class/general/emission';
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

        it('shows the date with time when enabled in SdkParams', async() => {
            initialize({ generalParameters: { showTimeWithDates: true } });
            const wrapper = await mount(podcast);
            expect(wrapper.text()).toContain('1 December 2025');
            expect(wrapper.text()).toContain('11:21');
        });
    });

    describe('season info', () => {
        function makePodcast(seasonMode = SeasonMode.NO_SEASON, overrides: Partial<Podcast> = {}) {
            const podcast = emptyPodcastData();
            podcast.emission.seasonMode = seasonMode;
            return { ...podcast, ...overrides };
        }

        describe('season number', () => {
            it('hidden when seasonNumber is not set', async () => {
                const wrapper = await mount(makePodcast(SeasonMode.SEASON_WITH_PODCAST_NUMBERING));
                expect(wrapper.text()).not.toContain('Podcast - Season');
            });

            it('hidden when emission has no season mode', async () => {
                const wrapper = await mount(makePodcast(SeasonMode.NO_SEASON, { seasonNumber: 2 }));
                expect(wrapper.text()).not.toContain('Podcast - Season');
            });

            it.each([
                SeasonMode.SEASON_WITH_PODCAST_NUMBERING,
                SeasonMode.SEASON_WITHOUT_PODCAST_NUMBERING,
            ])('shown for %s', async (seasonMode) => {
                const wrapper = await mount(makePodcast(seasonMode, { seasonNumber: 2 }));
                expect(wrapper.text()).toContain('Podcast - Season : 2');
            });
        });

        describe('episode number', () => {
            it('hidden for SEASON_WITHOUT_PODCAST_NUMBERING', async () => {
                const wrapper = await mount(makePodcast(SeasonMode.SEASON_WITHOUT_PODCAST_NUMBERING, { seasonEpisodeNumber: 5 }));
                expect(wrapper.text()).not.toContain('Podcast - Episode number');
            });

            it('shown for SEASON_WITH_PODCAST_NUMBERING', async () => {
                const wrapper = await mount(makePodcast(SeasonMode.SEASON_WITH_PODCAST_NUMBERING, { seasonEpisodeNumber: 5 }));
                expect(wrapper.text()).toContain('Podcast - Episode number : 5');
            });
        });
    });
});
