import { mockI18n, mockUseRouter } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
vi.mock('vue-router', () => mockUseRouter());

import PodcastPage from '@/components/pages/PodcastPage.vue';
import { emptyPodcastData } from '@/stores/class/general/podcast';
import { mount, setupAuthStore } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/api/classicApi', () => ({
    default: { fetchData: vi.fn() },
}));
vi.mock('@/api/podcastApi', () => ({
    podcastApi: { get: vi.fn() },
}));
vi.mock('@/components/composable/route/useSeoTitleUrl.ts', () => ({
    useSeoTitleUrl: () => ({ updatePathParams: vi.fn() })
}));

import classicApi from '@/api/classicApi';

// PodcastModuleBox's own internal children are irrelevant here: this suite
// only checks that PodcastPage forwards its slots into PodcastModuleBox's
// slots unchanged, so everything but PodcastModuleBox itself is stubbed.
const NON_MODULE_BOX_STUBS = [
    'PodcastmakerHeader', 'ShareSocialsButtons', 'SharePlayer', 'CommentSection',
    'PodcastInlineList', 'ClassicLazy',
    'PodcastImage', 'ParticipantDescription', 'PodcastRawTranscript', 'PodcastPlayBar',
    'SubscribeButtons', 'LikeSection', 'DownloadPodcastButton', 'PodcastPlannedSpinner',
    'Countdown', 'TagList', 'ShareAnonymous', 'PodcastRubriqueList', 'ErrorMessage',
];

function makeReadyPodcast() {
    const podcast = emptyPodcastData();
    podcast.organisation.id = 'org-1';
    podcast.organisation.privacy = 'PUBLIC';
    podcast.processingStatus = 'READY';
    podcast.valid = true;
    podcast.availability.visibility = true;
    return podcast;
}

describe('PodcastPage', () => {
    describe('slot pass-through to PodcastModuleBox', () => {
        it('forwards the edit-box slot scope unchanged', async () => {
            vi.mocked(classicApi.fetchData).mockResolvedValue(makeReadyPodcast());
            const wrapper = await mount(PodcastPage, {
                props: { podcastId: 1 },
                stubs: NON_MODULE_BOX_STUBS,
                slots: {
                    'edit-box': `<template #edit-box="{ podcast }"><button class="edit-box-slot" :data-podcast-id="podcast?.podcastId" /></template>`
                },
                beforeMount: setupAuthStore({ organisationId: 'org-1' })
            });

            const button = wrapper.find('.edit-box-slot');
            expect(button.exists()).toBe(true);
            expect(button.attributes('data-podcast-id')).toBe(String(makeReadyPodcast().podcastId));
        });

        it('forwards the recording-item-button slot scope unchanged', async () => {
            const podcast = makeReadyPodcast();
            podcast.conferenceId = 42;
            podcast.processingStatus = 'READY_TO_RECORD';
            vi.mocked(classicApi.fetchData).mockImplementation(async ({ path }: { path: string }) => {
                if (path.startsWith('podcast/')) {
                    return podcast;
                }
                if (path.startsWith('conference/info/')) {
                    return { status: 'PUBLISHING' };
                }
                return { conferenceId: 42, title: '', status: 'PUBLISHING' };
            });
            const wrapper = await mount(PodcastPage, {
                props: { podcastId: 1 },
                stubs: NON_MODULE_BOX_STUBS,
                slots: {
                    'recording-item-button': `<template #recording-item-button="{ podcast, live }"><button class="recording-slot" :data-podcast-id="podcast?.podcastId" :data-live="live" /></template>`
                },
                beforeMount: setupAuthStore({ roles: 'LIVE', organisationId: 'org-1' })
            });

            const button = wrapper.find('.recording-slot');
            expect(button.exists()).toBe(true);
            expect(button.attributes('data-podcast-id')).toBe(String(podcast.podcastId));
            expect(button.attributes('data-live')).toBe('true');
        });
    });
});
