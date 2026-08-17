import '@tests/mocks/i18n';
import '@tests/mocks/useRouter';

import PodcastModuleBox from '@/components/display/podcasts/PodcastModuleBox.vue';
import { useAuthStore } from '@/stores/AuthStore';
import { Conference } from '@/stores/class/conference/conference';
import { SeasonMode } from '@/stores/class/general/emission';
import { emptyPodcastData, Podcast } from '@/stores/class/general/podcast';
import { mount as testMount, setupAuthStore } from '@tests/utils';
import { describe, expect, it } from 'vitest';
import { initialize } from '@/stores/ParamSdkStore';

const mount = (podcast: Podcast, options?: {
    podcastConference?: Conference,
    slots?: Record<string, unknown>,
    roles?: string | string[],
    scope?: number[],
}) => testMount(PodcastModuleBox, {
    props: { podcast, podcastConference: options?.podcastConference },
    stubs: ['ShareAnonymous', 'LikeSection', 'PodcastRubriqueList'],
    slots: options?.slots,
    beforeMount: async () => {
        await setupAuthStore({ roles: options?.roles, organisationId: podcast.organisation?.id, scope: options?.scope })();
        // Only patch authParam (which drives isAuthenticated / RightsIndicator visibility) when a
        // scope is explicitly under test, to avoid changing the auth state for pre-existing tests.
        if (options?.scope !== undefined) {
            useAuthStore().$patch({
                authProfile: { userId: 'test-user-123', scope: options.scope },
                authParam: { accessToken: 'test-token', refreshToken: undefined, expiration: undefined },
            });
        }
    }
});

describe('PodcastModuleBox', () => {
    describe('date display', () => {
        const podcast: Podcast = emptyPodcastData();
        podcast.pubDate = '2025-12-01T10:21:31.000+00:00';

        it('shows the date without time by default', async() => {
            const wrapper = await mount(podcast);
            expect(wrapper.text()).toContain('1 décembre 2025');
            expect(wrapper.text()).not.toContain('11:21');
        });

        it('shows the date with time when enabled in SdkParams', async() => {
            initialize({ generalParameters: { showTimeWithDates: true } });
            const wrapper = await mount(podcast);
            expect(wrapper.text()).toContain('1 décembre 2025');
            expect(wrapper.text()).toContain('11:21');
        });
    });

    describe('subtitle', () => {
        it('shows subtitle when annotation is set', async () => {
            initialize({ podcastPage: { descriptionOrSummary: 'description' } });
            const podcast = emptyPodcastData();
            podcast.annotations = { subtitle: 'My subtitle' };
            const wrapper = await mount(podcast);
            expect(wrapper.text()).toContain('My subtitle');
        });

        it('hides subtitle when annotation is not set', async () => {
            initialize({ podcastPage: { descriptionOrSummary: 'description' } });
            const wrapper = await mount(emptyPodcastData());
            expect(wrapper.find('h3').exists()).toBe(false);
        });

        it('hides subtitle when hideSubtitle is true', async () => {
            initialize({ podcastPage: { hideSubtitle: true, descriptionOrSummary: 'description' } });
            const podcast = emptyPodcastData();
            podcast.annotations = { subtitle: 'My subtitle' };
            const wrapper = await mount(podcast);
            expect(wrapper.text()).not.toContain('My subtitle');
            initialize({ podcastPage: { hideSubtitle: false, descriptionOrSummary: 'description' } });
        });
    });

    describe('description and summary', () => {
        function makePodcastWithContent(): Podcast {
            const podcast = emptyPodcastData();
            podcast.description = 'The description';
            podcast.summary = 'The summary';
            return podcast;
        }

        it('shows description and hides summary by default', async () => {
            initialize({ podcastPage: { descriptionOrSummary: 'description' } });
            const wrapper = await mount(makePodcastWithContent());
            expect(wrapper.html()).toContain('The description');
            expect(wrapper.html()).not.toContain('The summary');
        });

        it('shows summary and hides description when descriptionOrSummary is summary', async () => {
            initialize({ podcastPage: { descriptionOrSummary: 'summary' } });
            const wrapper = await mount(makePodcastWithContent());
            expect(wrapper.html()).toContain('The summary');
            expect(wrapper.html()).not.toContain('The description');
        });

        it('shows both description and summary when descriptionOrSummary is both', async () => {
            initialize({ podcastPage: { descriptionOrSummary: 'both' } });
            const wrapper = await mount(makePodcastWithContent());
            expect(wrapper.html()).toContain('The description');
            expect(wrapper.html()).toContain('The summary');
        });

        it('hides summary when podcast has none', async () => {
            initialize({ podcastPage: { descriptionOrSummary: 'both' } });
            const podcast = emptyPodcastData();
            podcast.description = 'The description';
            const wrapper = await mount(podcast);
            expect(wrapper.html()).toContain('The description');
            expect(wrapper.html()).not.toContain('The summary');
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

    describe('edit-box slot', () => {
        it('passes the podcast, display-studio-access, and validate callback to the slot', async () => {
            const podcast = emptyPodcastData();
            podcast.organisation.id = 'org-1';
            const wrapper = await mount(podcast, {
                podcastConference: { conferenceId: 1, title: '', status: 'DEBRIEFING' },
                slots: {
                    'edit-box': `<template #edit-box="{ podcast, displayStudioAccess, onValidatePodcast }">
                        <button
                            class="edit-box-slot"
                            :data-podcast-id="podcast?.podcastId"
                            :data-debriefing="displayStudioAccess"
                            @click="onValidatePodcast({ ...podcast, valid: true })"
                        />
                    </template>`
                }
            });

            const button = wrapper.find('.edit-box-slot');
            expect(button.exists()).toBe(true);
            expect(button.attributes('data-podcast-id')).toBe(String(podcast.podcastId));
            expect(button.attributes('data-debriefing')).toBe('true');

            await button.trigger('click');
            expect(wrapper.emitted('updatePodcast')?.[0]).toEqual([{ ...podcast, valid: true }]);
        });

        it('is not rendered when the user has no edit rights', async () => {
            const podcast = emptyPodcastData();
            podcast.organisation.id = 'org-1';
            const wrapper = await testMount(PodcastModuleBox, {
                props: { podcast },
                stubs: ['ShareAnonymous', 'LikeSection'],
                slots: { 'edit-box': `<template #edit-box><button class="edit-box-slot" /></template>` },
                beforeMount: setupAuthStore({ organisationId: 'org-2' })
            });

            expect(wrapper.find('.edit-box-slot').exists()).toBe(false);
        });
    });

    describe('recording-item-button slot', () => {
        function makeLiveReadyPodcast() {
            const podcast = emptyPodcastData();
            podcast.organisation.id = 'org-1';
            podcast.conferenceId = 42;
            podcast.processingStatus = 'READY_TO_RECORD';
            return podcast;
        }

        it('takes priority over edit-box and passes podcast/live/recording and callbacks to the slot', async () => {
            const podcast = makeLiveReadyPodcast();
            const podcastConference: Conference = { conferenceId: 42, title: '', status: 'PUBLISHING' };
            const wrapper = await mount(podcast, {
                podcastConference,
                roles: 'LIVE',
                slots: {
                    'recording-item-button': `<template #recording-item-button="{ podcast, live, recording, onDeleteItem, onValidatePodcast }">
                        <button
                            class="recording-slot"
                            :data-podcast-id="podcast?.podcastId"
                            :data-live="live"
                            :data-recording-status="recording?.status"
                            @click="onValidatePodcast({ ...podcast, valid: true })"
                        />
                        <button class="recording-delete-slot" @click="onDeleteItem" />
                    </template>`,
                    'edit-box': `<template #edit-box><button class="edit-box-slot" /></template>`
                }
            });

            const button = wrapper.find('.recording-slot');
            expect(button.exists()).toBe(true);
            expect(button.attributes('data-podcast-id')).toBe(String(podcast.podcastId));
            expect(button.attributes('data-live')).toBe('true');
            expect(button.attributes('data-recording-status')).toBe('PUBLISHING');
            expect(wrapper.find('.edit-box-slot').exists()).toBe(false);

            await button.trigger('click');
            expect(wrapper.emitted('updatePodcast')?.[0]).toEqual([{ ...podcast, valid: true }]);
        });

        it('falls back to edit-box when there is no live conference', async () => {
            const podcast = emptyPodcastData();
            podcast.organisation.id = 'org-1';
            const wrapper = await mount(podcast, {
                roles: 'LIVE',
                slots: {
                    'recording-item-button': `<template #recording-item-button><button class="recording-slot" /></template>`,
                    'edit-box': `<template #edit-box><button class="edit-box-slot" /></template>`
                }
            });

            expect(wrapper.find('.recording-slot').exists()).toBe(false);
            expect(wrapper.find('.edit-box-slot').exists()).toBe(true);
        });
    });

    describe('RightsIndicator (scope)', () => {
        it('shows RightsIndicator when the podcast is out of the user\'s scope', async () => {
            const podcast = emptyPodcastData();
            podcast.rubriqueIds = [10];
            const wrapper = await mount(podcast, { roles: 'PRODUCTION', scope: [999] });

            const icon = wrapper.find('.rights-indicator-icon');
            expect(icon.exists()).toBe(true);
            expect(icon.classes()).not.toContain('invisible');
            expect(wrapper.text()).toContain('RightsIndicator - Podcast - Insufficient scope');
        });

        it('hides RightsIndicator when the podcast is within the user\'s scope', async () => {
            const podcast = emptyPodcastData();
            podcast.rubriqueIds = [10];
            const wrapper = await mount(podcast, { roles: 'PRODUCTION', scope: [10] });

            const icon = wrapper.find('.rights-indicator-icon');
            expect(icon.exists()).toBe(true);
            expect(icon.classes()).toContain('invisible');
        });
    });
});
