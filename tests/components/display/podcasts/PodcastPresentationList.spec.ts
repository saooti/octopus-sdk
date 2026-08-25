import { mockI18n, mockUseRouter } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
vi.mock('vue-router', () => mockUseRouter());

vi.mock('@/api/classicApi', () => ({
    default: { fetchData: vi.fn() },
}));
vi.mock('@/api/podcastApi', () => ({
    podcastApi: { search: vi.fn() },
    PodcastSort: { DATE: 'DATE' },
}));

const tagsFor = vi.fn();
const additionalInfoFor = vi.fn();
vi.mock('@/components/composable/usePresentationItem', () => ({
    usePresentationItem: () => ({ tagsFor, additionalInfoFor }),
}));

import classicApi from '@/api/classicApi';
import { podcastApi } from '@/api/podcastApi';
import PodcastPresentationList from '@/components/display/podcasts/PodcastPresentationList.vue';
import { emptyEmissionData, Emission } from '@/stores/class/general/emission';
import { PodcastType, SimplifiedPodcast } from '@/stores/class/general/podcast';
import { mount as testMount } from '@tests/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';

function makeEmission(emissionId: number): Emission {
    return { ...emptyEmissionData(), emissionId, name: `Emission ${emissionId}`, orga: { id: 'org-1', name: 'Orga', imageUrl: '' } };
}

function makeSimplifiedPodcast(emissionId: number, podcastId: number, pubDate: string): SimplifiedPodcast {
    return {
        podcastId,
        emissionId,
        organisationId: 'org-1',
        audioUrl: '',
        audioStorageUrl: '',
        article: '',
        imageUrl: '',
        title: `Podcast ${podcastId}`,
        description: undefined,
        tags: [],
        beneficiaries: [],
        availability: { visibility: true, date: undefined },
        monetisable: 'UNDEFINED',
        pubDate,
        conferenceId: undefined,
        duration: 0,
        seasonEpisodeType: PodcastType.FULL,
    };
}

const mount = (props: Record<string, unknown> = {}) => testMount(PodcastPresentationList, {
    props,
    stubs: ['PresentationItem', 'PodcastPlayButton'],
});

beforeEach(() => {
    tagsFor.mockReset();
    additionalInfoFor.mockReset().mockReturnValue(undefined);
});

describe('PodcastPresentationList', () => {
    it('populates the tags prop of each item once tagsFor resolves', async () => {
        vi.mocked(classicApi.fetchData).mockResolvedValue({ count: 1, sort: '', result: [makeEmission(1)] });
        vi.mocked(podcastApi.search).mockResolvedValue({
            count: 1, sort: '', result: [makeSimplifiedPodcast(1, 10, '2025-01-01T00:00:00.000Z')],
        });
        tagsFor.mockResolvedValue(['News']);

        const wrapper = await mount();
        await flushPromises();

        const items = wrapper.findAllComponents({ name: 'PresentationItem' });
        expect(items).toHaveLength(1);
        expect(items[0].props('tags')).toEqual(['News']);
    });

    it('fetches tags only once per podcast', async () => {
        vi.mocked(classicApi.fetchData).mockResolvedValue({ count: 1, sort: '', result: [makeEmission(1)] });
        vi.mocked(podcastApi.search).mockResolvedValue({
            count: 1, sort: '', result: [makeSimplifiedPodcast(1, 10, '2025-01-01T00:00:00.000Z')],
        });
        tagsFor.mockResolvedValue(['News']);

        await mount();
        await flushPromises();
        await flushPromises();

        expect(tagsFor).toHaveBeenCalledTimes(1);
    });

    it('forwards additionalInfoFor result as the additional-info prop of each item', async () => {
        vi.mocked(classicApi.fetchData).mockResolvedValue({ count: 1, sort: '', result: [makeEmission(1)] });
        vi.mocked(podcastApi.search).mockResolvedValue({
            count: 1, sort: '', result: [makeSimplifiedPodcast(1, 10, '2025-01-01T00:00:00.000Z')],
        });
        tagsFor.mockResolvedValue([]);
        additionalInfoFor.mockReturnValue(['Orga']);

        const wrapper = await mount();
        await flushPromises();

        const items = wrapper.findAllComponents({ name: 'PresentationItem' });
        expect(items[0].props('additionalInfo')).toEqual(['Orga']);
    });
});
