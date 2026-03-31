import '@tests/mocks/i18n';
import '@tests/mocks/useRouter';

import PodcastItemInfo from '@/components/display/podcasts/PodcastItemInfo.vue';
import { SeasonMode } from '@/stores/class/general/emission';
import { emptyPodcastData, Podcast, PodcastType } from '@/stores/class/general/podcast';
import { mount as testMount } from '@tests/utils';
import { describe, expect, it } from 'vitest';

const mount = (podcast: Partial<Podcast> = {}) => {
    const base = emptyPodcastData();
    return testMount(PodcastItemInfo, {
        props: { podcast: { ...base, ...podcast } },
        stubs: ['PodcastPlayBar', 'AnimatorsItem', 'BullhornIcon', 'GiftIcon'],
    });
};

describe('PodcastItemInfo', () => {
    describe('season display', () => {
        it('shows nothing for NO_SEASON', async () => {
            const podcast = emptyPodcastData();
            podcast.emission.seasonMode = SeasonMode.NO_SEASON;
            podcast.seasonNumber = 2;
            const wrapper = await mount(podcast);
            expect(wrapper.find('.podcast-item-season').text()).toBe('');
        });

        it('shows season number for SEASON_WITHOUT_PODCAST_NUMBERING', async () => {
            const podcast = emptyPodcastData();
            podcast.emission.seasonMode = SeasonMode.SEASON_WITHOUT_PODCAST_NUMBERING;
            podcast.seasonNumber = 3;
            const wrapper = await mount(podcast);
            expect(wrapper.find('.podcast-item-season').text()).toContain('S3');
        });

        it('shows season and episode number for SEASON_WITH_PODCAST_NUMBERING', async () => {
            const podcast = emptyPodcastData();
            podcast.emission.seasonMode = SeasonMode.SEASON_WITH_PODCAST_NUMBERING;
            podcast.seasonNumber = 2;
            podcast.seasonEpisodeNumber = 5;
            const wrapper = await mount(podcast);
            expect(wrapper.find('.podcast-item-season').text()).toContain('S2·E5');
        });
    });

    describe('episode type icons', () => {
        it('shows BullhornIcon for TRAILER type', async () => {
            const wrapper = await mount({ seasonEpisodeType: PodcastType.TRAILER });
            expect(wrapper.findComponent({ name: 'BullhornIcon' }).exists()).toBe(true);
            expect(wrapper.findComponent({ name: 'GiftIcon' }).exists()).toBe(false);
        });

        it('shows GiftIcon for BONUS type', async () => {
            const wrapper = await mount({ seasonEpisodeType: PodcastType.BONUS });
            expect(wrapper.findComponent({ name: 'GiftIcon' }).exists()).toBe(true);
            expect(wrapper.findComponent({ name: 'BullhornIcon' }).exists()).toBe(false);
        });

        it('shows no type icon for FULL type', async () => {
            const wrapper = await mount({ seasonEpisodeType: PodcastType.FULL });
            expect(wrapper.findComponent({ name: 'BullhornIcon' }).exists()).toBe(false);
            expect(wrapper.findComponent({ name: 'GiftIcon' }).exists()).toBe(false);
        });
    });
});
