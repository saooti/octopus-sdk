import { mockI18n, mockUseRouter } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
vi.mock('vue-router', () => mockUseRouter());

import PodcastItemInfo from '@/components/display/podcasts/PodcastItemInfo.vue';
import { useAuthStore } from '@/stores/AuthStore';
import { SeasonMode } from '@/stores/class/general/emission';
import { emptyPodcastData, Podcast, PodcastType } from '@/stores/class/general/podcast';
import { mount as testMount, setupAuthStore } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

const mount = (podcast: Partial<Podcast> = {}, auth?: { roles: string[], scope?: number[] }) => {
    const base = emptyPodcastData();
    return testMount(PodcastItemInfo, {
        props: { podcast: { ...base, ...podcast } },
        stubs: ['PodcastPlayBar', 'AnimatorsItem', 'BullhornIcon', 'GiftIcon'],
        beforeMount: auth ? async () => {
            await setupAuthStore({ roles: auth.roles, scope: auth.scope })();
            useAuthStore().$patch({
                authProfile: { userId: 'test-user-123', scope: auth.scope ?? [] },
                authParam: { accessToken: 'test-token', refreshToken: undefined, expiration: undefined },
            });
        } : undefined
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

    describe('RightsIndicator (scope)', () => {
        it('shows RightsIndicator when the podcast is out of the user\'s scope', async () => {
            const wrapper = await mount(
                { podcastId: 1, rubriqueIds: [10] },
                { roles: ['PRODUCTION'], scope: [999] }
            );

            const icon = wrapper.find('.rights-indicator-icon');
            expect(icon.exists()).toBe(true);
            expect(icon.classes()).not.toContain('invisible');
            expect(wrapper.text()).toContain('RightsIndicator - Podcast - Insufficient scope');
        });

        it('hides RightsIndicator when the podcast is within the user\'s scope', async () => {
            const wrapper = await mount(
                { podcastId: 1, rubriqueIds: [10] },
                { roles: ['PRODUCTION'], scope: [10] }
            );

            const icon = wrapper.find('.rights-indicator-icon');
            expect(icon.exists()).toBe(true);
            expect(icon.classes()).toContain('invisible');
        });
    });
});
