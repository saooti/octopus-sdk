import '@tests/mocks/i18n';
import '@tests/mocks/useRouter';

import EmissionPage from '@/components/pages/EmissionPage.vue';
import { emptyEmissionData, SeasonMode } from '@/stores/class/general/emission';
import { emptyPodcastData, PodcastProcessingStatus } from '@/stores/class/general/podcast';
import { mount, VueWrapper } from '@tests/utils';
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

const publicOrga = { id: 'org-1', name: 'Test', imageUrl: '', privacy: 'PUBLIC' };

function makeEmission(seasonMode: SeasonMode) {
    return { ...emptyEmissionData(), seasonMode, seasonCount: 2, orga: publicOrga };
}

function makeReadyPodcast(seasonMode: SeasonMode = SeasonMode.NO_SEASON) {
    const podcast = emptyPodcastData();
    podcast.processingStatus = PodcastProcessingStatus.Ready;
    podcast.seasonNumber = 1;
    podcast.seasonEpisodeNumber = 3;
    podcast.emission.seasonMode = seasonMode;
    return podcast;
}

async function mountPage(seasonMode: SeasonMode) {
    vi.mocked(emissionApi.get).mockResolvedValue(makeEmission(seasonMode));
    return mount(EmissionPage, { shallow: true, props: { emissionId: 1 } });
}

async function triggerFetch(wrapper: VueWrapper, seasonMode: SeasonMode) {
    await wrapper.findComponent({ name: 'PodcastFilterList' }).vm.$emit('fetch', [makeReadyPodcast(seasonMode)]);
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
});
