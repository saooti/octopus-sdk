import { mockI18n, mockUseRouter } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
vi.mock('vue-router', () => mockUseRouter());

import PodcastPlayButton from '@/components/display/podcasts/PodcastPlayButton.vue';
import { emptyPodcastData } from '@/stores/class/general/podcast';
import { mount as testMount } from '@tests/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const saootiPlayer = vi.hoisted(() => ({
    state: {
        podcast: undefined as { podcastId: number } | undefined,
        status: 'STOPPED',
        isVideo: false
    },
    playPodcast: vi.fn(),
    togglePlay: vi.fn()
}));
vi.mock('@saooti/saooti-player', () => ({ saootiPlayer }));

const podcast = { ...emptyPodcastData(), podcastId: 12, title: 'Mon épisode', duration: 754000 };

const mount = (status?: string) => {
    Object.assign(saootiPlayer.state, status ? { podcast, status } : { podcast: undefined, status: 'STOPPED' });
    return testMount(PodcastPlayButton, {
        props: { podcast },
        stubs: ['PodcastIsPlaying']
    });
};

describe('PodcastPlayButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('accessible name', () => {
        it('names the episode and its visible duration', async () => {
            const button = (await mount()).find('button');
            const duration = button.find('time').text();
            expect(button.attributes('aria-label')).toBe(`PodcastPlayButton - Play title:Mon épisode duration:${duration}`);
        });

        it('switches to pause while the episode is playing', async () => {
            const button = (await mount('PLAYING')).find('button');
            expect(button.attributes('aria-label')).toContain('PodcastPlayButton - Pause');
        });

        it('stays on play while the episode is paused', async () => {
            const button = (await mount('PAUSED')).find('button');
            expect(button.attributes('aria-label')).toContain('PodcastPlayButton - Play');
        });
    });

    describe('play', () => {
        it('starts the episode when it is not loaded', async () => {
            await (await mount()).find('button').trigger('click');
            expect(saootiPlayer.playPodcast).toHaveBeenCalledWith(12, false);
            expect(saootiPlayer.togglePlay).not.toHaveBeenCalled();
        });

        it.each(['PLAYING', 'PAUSED'])('toggles the episode when it is %s', async (status) => {
            await (await mount(status)).find('button').trigger('click');
            expect(saootiPlayer.togglePlay).toHaveBeenCalledOnce();
            expect(saootiPlayer.playPodcast).not.toHaveBeenCalled();
        });
    });
});
