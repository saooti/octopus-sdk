import { mockI18n, mockUseRouter } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
vi.mock('vue-router', () => mockUseRouter());

import PodcastPlayButton from '@/components/display/podcasts/PodcastPlayButton.vue';
import { PlayerStatus } from '@/stores/PlayerStore';
import { emptyPodcastData } from '@/stores/class/general/podcast';
import { mount as testMount, setupPlayerStore } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

const podcast = { ...emptyPodcastData(), podcastId: 12, title: 'Mon épisode', duration: 754000 };

const mount = (playerStatus?: PlayerStatus) => testMount(PodcastPlayButton, {
    props: { podcast },
    stubs: ['PodcastIsPlaying'],
    beforeMount: playerStatus ? setupPlayerStore({ playerPodcast: podcast, playerStatus }) : undefined
});

describe('PodcastPlayButton', () => {
    describe('accessible name', () => {
        it('names the episode and its visible duration', async () => {
            const button = (await mount()).find('button');
            const duration = button.find('time').text();
            expect(button.attributes('aria-label')).toBe(`PodcastPlayButton - Play title:Mon épisode duration:${duration}`);
        });

        it('switches to pause while the episode is playing', async () => {
            const button = (await mount(PlayerStatus.PLAYING)).find('button');
            expect(button.attributes('aria-label')).toContain('PodcastPlayButton - Pause');
        });

        it('stays on play while the episode is paused', async () => {
            const button = (await mount(PlayerStatus.PAUSED)).find('button');
            expect(button.attributes('aria-label')).toContain('PodcastPlayButton - Play');
        });
    });
});
