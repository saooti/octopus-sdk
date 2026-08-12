import '@tests/mocks/i18n';
import '@tests/mocks/useRouter';

import EmissionPage from '@/components/pages/EmissionPage.vue';
import { emptyEmissionData, SeasonMode } from '@/stores/class/general/emission';
import { emptyPodcastData, PodcastProcessingStatus } from '@/stores/class/general/podcast';
import { mount, setupAuthStore, VueWrapper } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

vi.mock('@/api/emissionApi', () => ({
    emissionApi: { get: vi.fn() }
}));
vi.mock('@/components/composable/route/useSeoTitleUrl.ts', () => ({
    useSeoTitleUrl: () => ({ updatePathParams: vi.fn() })
}));
vi.mock('@/components/composable/useImageProxy', () => ({
    useImageProxy: () => ({ useProxyImageUrl: vi.fn() })
}));

import { emissionApi } from '@/api/emissionApi';
import { initialize } from '@/stores/ParamSdkStore';

const publicOrga = { id: 'org-1', name: 'Test', imageUrl: '', privacy: 'PUBLIC' };

function makeEmission(seasonMode: SeasonMode) {
    return { ...emptyEmissionData(), seasonMode, seasons: [1, 2], orga: publicOrga };
}

function makeReadyPodcast(seasonMode: SeasonMode = SeasonMode.NO_SEASON) {
    const podcast = emptyPodcastData();
    podcast.processingStatus = PodcastProcessingStatus.Ready;
    podcast.seasonNumber = 1;
    podcast.seasonEpisodeNumber = 3;
    podcast.emission.seasonMode = seasonMode;
    podcast.valid = true;
    return podcast;
}

async function mountPage(seasonMode: SeasonMode) {
    vi.mocked(emissionApi.get).mockResolvedValue(makeEmission(seasonMode));
    return mount(EmissionPage, { shallow: true, props: { emissionId: 1 } });
}

async function mountWithSeasons(seasons: number[]) {
    vi.mocked(emissionApi.get).mockResolvedValue({
        ...emptyEmissionData(),
        seasonMode: SeasonMode.SEASON_WITH_PODCAST_NUMBERING,
        seasons,
        orga: publicOrga,
    });
    return mount(EmissionPage, { shallow: true, props: { emissionId: 1 } });
}

async function triggerFetch(wrapper: VueWrapper, seasonMode: SeasonMode, season?: number, podcasts?: ReturnType<typeof makeReadyPodcast>[]) {
    await wrapper.findComponent({ name: 'PodcastFilterList' }).vm.$emit('fetch', podcasts ?? [makeReadyPodcast(seasonMode)], season);
    await nextTick();
}

describe('EmissionPage', () => {
    describe('messageListenEpisode', () => {
        it('does not show season info before any podcast is fetched', async () => {
            const wrapper = await mountPage(SeasonMode.SEASON_WITH_PODCAST_NUMBERING);
            expect(wrapper.text()).not.toContain('S1·E3');
        });

        it('shows base message without season info for NO_SEASON emission', async () => {
            const wrapper = await mountPage(SeasonMode.NO_SEASON);
            await triggerFetch(wrapper, SeasonMode.NO_SEASON);
            expect(wrapper.text()).toContain('Listen to the latest episode');
            expect(wrapper.text()).not.toContain('(S');
        });

        it.each([
            { seasonMode: SeasonMode.SEASON_WITH_PODCAST_NUMBERING,    expected: 'Listen to the latest episode (S1·E3)' },
            { seasonMode: SeasonMode.SEASON_WITHOUT_PODCAST_NUMBERING, expected: 'Listen to the latest episode (S1)'    },
        ])('appends season info for $seasonMode', async ({ seasonMode, expected }) => {
            const wrapper = await mountPage(seasonMode);
            await triggerFetch(wrapper, seasonMode);
            expect(wrapper.text()).toContain(expected);
        });
    });

    describe('podcastsFetched season filtering', () => {
        // seasons is [1, 2] in makeEmission, so max season is 2
        it.each([undefined, 2])('shows lastPodcast when season is %s', async (season) => {
            const wrapper = await mountPage(SeasonMode.SEASON_WITH_PODCAST_NUMBERING);
            await triggerFetch(wrapper, SeasonMode.SEASON_WITH_PODCAST_NUMBERING, season);
            expect(wrapper.text()).toContain('Listen to the latest episode');
        });

        it('ignores podcasts from earlier seasons', async () => {
            const wrapper = await mountPage(SeasonMode.SEASON_WITH_PODCAST_NUMBERING);
            await triggerFetch(wrapper, SeasonMode.SEASON_WITH_PODCAST_NUMBERING, 1);
            expect(wrapper.text()).not.toContain('Listen to the latest episode');
        });

        it('accepts the highest season in the seasons array', async () => {
            const wrapper = await mountWithSeasons([1, 2, 3]);
            await triggerFetch(wrapper, SeasonMode.SEASON_WITH_PODCAST_NUMBERING, 3);
            expect(wrapper.text()).toContain('Listen to the latest episode');
        });

        it('ignores a season below the max in the seasons array', async () => {
            const wrapper = await mountWithSeasons([1, 2, 3]);
            await triggerFetch(wrapper, SeasonMode.SEASON_WITH_PODCAST_NUMBERING, 2);
            expect(wrapper.text()).not.toContain('Listen to the latest episode');
        });
    });

    describe('subtitle', () => {
        it('shows subtitle when annotation is set', async () => {
            vi.mocked(emissionApi.get).mockResolvedValue({
                ...emptyEmissionData(),
                annotations: { subtitle: 'Emission subtitle' },
                orga: publicOrga,
            });
            const wrapper = await mount(EmissionPage, { shallow: true, props: { emissionId: 1 } });
            expect(wrapper.text()).toContain('Emission subtitle');
        });

        it('hides subtitle when annotation is not set', async () => {
            vi.mocked(emissionApi.get).mockResolvedValue({ ...emptyEmissionData(), orga: publicOrga });
            const wrapper = await mount(EmissionPage, { shallow: true, props: { emissionId: 1 } });
            expect(wrapper.find('h3').exists()).toBe(false);
        });

        it('hides subtitle when hideSubtitle is true', async () => {
            initialize({ emissionPage: { hideSubtitle: true } });
            vi.mocked(emissionApi.get).mockResolvedValue({
                ...emptyEmissionData(),
                annotations: { subtitle: 'Emission subtitle' },
                orga: publicOrga,
            });
            const wrapper = await mount(EmissionPage, { shallow: true, props: { emissionId: 1 } });
            expect(wrapper.text()).not.toContain('Emission subtitle');
            initialize({ emissionPage: { hideSubtitle: false } });
        });
    });

    describe('podcastsFetched podcast selection', () => {
        function makePodcast(seasonMode: SeasonMode, episodeNumber: number, { ready = true, visible = true } = {}) {
            const podcast = makeReadyPodcast(seasonMode);
            podcast.seasonEpisodeNumber = episodeNumber;
            if (!ready) podcast.processingStatus = PodcastProcessingStatus.Processing;
            if (!visible) podcast.availability.visibility = false;
            return podcast;
        }

        it('with seasons enabled, selects the last ready visible podcast', async () => {
            const wrapper = await mountPage(SeasonMode.SEASON_WITH_PODCAST_NUMBERING);
            const podcasts = [
                makePodcast(SeasonMode.SEASON_WITH_PODCAST_NUMBERING, 1),
                makePodcast(SeasonMode.SEASON_WITH_PODCAST_NUMBERING, 5),
            ];
            await triggerFetch(wrapper, SeasonMode.SEASON_WITH_PODCAST_NUMBERING, undefined, podcasts);
            expect(wrapper.text()).toContain('S1·E5');
        });

        it.each([SeasonMode.SEASON_WITH_PODCAST_NUMBERING, SeasonMode.NO_SEASON])('skips non-ready podcasts (%s)', async (seasonMode) => {
            const wrapper = await mountPage(seasonMode);
            await triggerFetch(wrapper, seasonMode, undefined, [makePodcast(seasonMode, 1, { ready: false })]);
            expect(wrapper.text()).not.toContain('Listen to the latest episode');
        });

        it.each([SeasonMode.SEASON_WITH_PODCAST_NUMBERING, SeasonMode.NO_SEASON])('skips non-visible podcasts (%s)', async (seasonMode) => {
            const wrapper = await mountPage(seasonMode);
            await triggerFetch(wrapper, seasonMode, undefined, [makePodcast(seasonMode, 1, { visible: false })]);
            expect(wrapper.text()).not.toContain('Listen to the latest episode');
        });
    });

    describe('edit-box slot', () => {
        it('passes the emission and an on-updated callback that refetches it', async () => {
            vi.mocked(emissionApi.get).mockResolvedValue({ ...emptyEmissionData(), orga: publicOrga });
            const wrapper = await mount(EmissionPage, {
                shallow: true,
                props: { emissionId: 1 },
                slots: {
                    'edit-box': `<template #edit-box="{ emission, onUpdated }">
                        <button class="edit-box-slot" :data-orga="emission?.orga?.id" @click="onUpdated()" />
                    </template>`
                },
                beforeMount: setupAuthStore({ organisationId: publicOrga.id })
            });

            const button = wrapper.find('.edit-box-slot');
            expect(button.exists()).toBe(true);
            expect(button.attributes('data-orga')).toBe(publicOrga.id);

            const callsBeforeClick = vi.mocked(emissionApi.get).mock.calls.length;
            await button.trigger('click');
            expect(vi.mocked(emissionApi.get).mock.calls.length).toBe(callsBeforeClick + 1);
        });

        it('is not rendered when the user has no edit rights', async () => {
            vi.mocked(emissionApi.get).mockResolvedValue({ ...emptyEmissionData(), orga: publicOrga });
            const wrapper = await mount(EmissionPage, {
                shallow: true,
                props: { emissionId: 1 },
                slots: {
                    'edit-box': `<template #edit-box><button class="edit-box-slot" /></template>`
                },
                beforeMount: setupAuthStore({ organisationId: 'org-2' })
            });

            expect(wrapper.find('.edit-box-slot').exists()).toBe(false);
        });
    });
});
