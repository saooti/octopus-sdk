import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

vi.mock('@/api', () => ({
    rubriquesApi: { getCachedRubrique: vi.fn() },
}));

import { rubriquesApi } from '@/api';
import { usePresentationItem } from '@/components/composable/usePresentationItem';
import { emptyEmissionData, Emission } from '@/stores/class/general/emission';
import { emptyPodcastData, Podcast } from '@/stores/class/general/podcast';
import { Rubrique } from '@/stores/class/rubrique/rubrique';
import { useGeneralStore } from '@/stores/GeneralStore';
import { state } from '@/stores/ParamSdkStore';
import { setupPinia } from '@tests/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function rubrique(rubriqueId: number, name: string, rubriquageId?: number): Rubrique {
    return { rubriqueId, name, rubriquageId };
}

beforeEach(() => {
    setupPinia();
    state.presentationItems = { tags: 'none' };
    vi.mocked(rubriquesApi.getCachedRubrique).mockReset();
});

describe('usePresentationItem', () => {
    describe('tagsFor', () => {
        it('returns undefined when tags type is none', async () => {
            const { tagsFor } = usePresentationItem();
            expect(await tagsFor(emptyEmissionData())).toBeUndefined();
        });

        describe('iab type', () => {
            beforeEach(() => {
                state.presentationItems.tags = 'iab';
                useGeneralStore().storedUpdateCategories([
                    { id: 1, name: 'News' },
                    { id: 2, name: 'Sport' },
                ]);
            });

            it('returns the names of categories matching the emission iabIds', async () => {
                const { tagsFor } = usePresentationItem();
                const emission: Emission = { ...emptyEmissionData(), iabIds: [2] };
                expect(await tagsFor(emission)).toEqual(['Sport']);
            });

            it('reads iabIds from the podcast emission', async () => {
                const { tagsFor } = usePresentationItem();
                const podcast: Podcast = emptyPodcastData();
                podcast.emission = { ...emptyEmissionData(), iabIds: [1, 2] };
                expect(await tagsFor(podcast)).toEqual(['News', 'Sport']);
            });
        });

        describe('rubrique type', () => {
            beforeEach(() => {
                state.presentationItems.tags = 'rubrique';
            });

            it('fetches tags for an emission rubriqueIds', async () => {
                vi.mocked(rubriquesApi.getCachedRubrique).mockImplementation(
                    (id) => Promise.resolve(rubrique(id, `Rubrique ${id}`))
                );
                const { tagsFor } = usePresentationItem();
                const emission: Emission = { ...emptyEmissionData(), rubriqueIds: [1, 2] };
                expect(await tagsFor(emission)).toEqual(['Rubrique 1', 'Rubrique 2']);
            });

            it('combines a podcast rubriqueIds with its emission rubriqueIds', async () => {
                vi.mocked(rubriquesApi.getCachedRubrique).mockImplementation(
                    (id) => Promise.resolve(rubrique(id, `Rubrique ${id}`))
                );
                const { tagsFor } = usePresentationItem();
                const podcast: Podcast = emptyPodcastData();
                podcast.rubriqueIds = [1];
                podcast.emission = { ...emptyEmissionData(), rubriqueIds: [2] };
                expect(await tagsFor(podcast)).toEqual(['Rubrique 1', 'Rubrique 2']);
            });

            it('filters rubriques by tagsRubriquageId when set', async () => {
                vi.mocked(rubriquesApi.getCachedRubrique).mockImplementation((id) => {
                    if (id === 1) { return Promise.resolve(rubrique(1, 'Kept', 10)); }
                    return Promise.resolve(rubrique(2, 'Discarded', 20));
                });
                state.presentationItems.tagsRubriquageId = 10;
                const { tagsFor } = usePresentationItem();
                const emission: Emission = { ...emptyEmissionData(), rubriqueIds: [1, 2] };
                expect(await tagsFor(emission)).toEqual(['Kept']);
            });
        });

        it('limits the number of tags when tagsLimit is set', async () => {
            state.presentationItems.tags = 'iab';
            state.presentationItems.tagsLimit = 1;
            useGeneralStore().storedUpdateCategories([
                { id: 1, name: 'News' },
                { id: 2, name: 'Sport' },
            ]);
            const { tagsFor } = usePresentationItem();
            const emission: Emission = { ...emptyEmissionData(), iabIds: [1, 2] };
            expect(await tagsFor(emission)).toEqual(['News']);
        });
    });

    describe('additionalInfoFor', () => {
        it('returns undefined when additionalInfo is not configured', () => {
            const { additionalInfoFor } = usePresentationItem();
            expect(additionalInfoFor(emptyEmissionData())).toBeUndefined();
        });

        it('returns undefined when additionalInfo is empty', () => {
            state.presentationItems.additionalInfo = [];
            const { additionalInfoFor } = usePresentationItem();
            expect(additionalInfoFor(emptyEmissionData())).toBeUndefined();
        });

        it('resolves productor from the emission organisation name for an emission', () => {
            state.presentationItems.additionalInfo = ['productor'];
            const { additionalInfoFor } = usePresentationItem();
            const emission: Emission = { ...emptyEmissionData(), orga: { id: '1', name: 'Saooti', imageUrl: '' } };
            expect(additionalInfoFor(emission)).toEqual(['Saooti']);
        });

        it('resolves productor from the podcast emission organisation name', () => {
            state.presentationItems.additionalInfo = ['productor'];
            const { additionalInfoFor } = usePresentationItem();
            const podcast: Podcast = emptyPodcastData();
            podcast.emission = { ...emptyEmissionData(), orga: { id: '1', name: 'Saooti', imageUrl: '' } };
            expect(additionalInfoFor(podcast)).toEqual(['Saooti']);
        });

        it('formats the podcast pubDate for the date info', () => {
            state.presentationItems.additionalInfo = ['date'];
            const { additionalInfoFor } = usePresentationItem();
            const podcast: Podcast = emptyPodcastData();
            podcast.pubDate = '2025-12-01T10:21:31.000+00:00';
            expect(additionalInfoFor(podcast)).toEqual(['1 décembre 2025']);
        });

        it('omits the date info for an emission (no pubDate)', () => {
            state.presentationItems.additionalInfo = ['date'];
            const { additionalInfoFor } = usePresentationItem();
            expect(additionalInfoFor(emptyEmissionData())).toEqual([]);
        });

        it('omits the date info for a podcast without a pubDate', () => {
            state.presentationItems.additionalInfo = ['date'];
            const { additionalInfoFor } = usePresentationItem();
            expect(additionalInfoFor(emptyPodcastData())).toEqual([]);
        });

        it('combines multiple info entries in order', () => {
            state.presentationItems.additionalInfo = ['date', 'productor'];
            const { additionalInfoFor } = usePresentationItem();
            const podcast: Podcast = emptyPodcastData();
            podcast.pubDate = '2025-12-01T10:21:31.000+00:00';
            podcast.emission = { ...emptyEmissionData(), orga: { id: '1', name: 'Saooti', imageUrl: '' } };
            expect(additionalInfoFor(podcast)).toEqual(['1 décembre 2025', 'Saooti']);
        });
    });
});
