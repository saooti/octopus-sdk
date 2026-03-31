import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent } from 'vue';
import { mount as _mount } from '@vue/test-utils';
import { flushPromises } from '@vue/test-utils';
import { setupPinia } from '@tests/utils';
import { usePlayerStore } from '@/stores/PlayerStore';
import { useVastStore } from '@/stores/VastStore';
import { usePlayerTranscript } from '@/components/composable/player/usePlayerTranscript';

vi.mock('@/components/composable/useTranslation', () => ({
    useTranslation: vi.fn(),
}));

vi.mock('@/api/classicApi', () => ({
    default: { fetchData: vi.fn() },
}));

vi.mock('@/api/transcriptionApi', () => ({
    transcriptionApi: {
        getTranslations: vi.fn().mockResolvedValue({
            podcastId: 42,
            nativeLanguage: 'fr',
            translations: [],
        }),
        getTranslation: vi.fn().mockResolvedValue(''),
    },
    TranslationState: { FINISHED: 'FINISHED' },
}));

import { useTranslation } from '@/components/composable/useTranslation';
import { transcriptionApi } from '@/api/transcriptionApi';
import classicApi from '@/api/classicApi';

const SRT_FROM_ZERO = '1\n00:00:00,000 --> 00:00:02,000\nHello\n\n2\n00:00:02,000 --> 00:00:04,000\nWorld\n\n';
const SRT_DELAYED_START = '1\n00:00:01,000 --> 00:00:02,000\nHello\n\n';

describe('usePlayerTranscript', () => {
    let composable: ReturnType<typeof usePlayerTranscript>;
    let playerStore: ReturnType<typeof usePlayerStore>;
    let mockGetMostRelevantLanguage: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetMostRelevantLanguage = vi.fn().mockResolvedValue({ ready: 'fr' });
        vi.mocked(useTranslation).mockReturnValue({
            getMostRelevantLanguage: mockGetMostRelevantLanguage,
        } as unknown as ReturnType<typeof useTranslation>);

        const pinia = setupPinia();

        let result!: ReturnType<typeof usePlayerTranscript>;
        _mount(defineComponent({
            setup() {
                playerStore = usePlayerStore();
                result = usePlayerTranscript();
                return {};
            },
            template: '<div/>',
        }), { global: { plugins: [pinia] } });
        composable = result;
        composable.generatingTranscriptLanguage.value = null;
    });

    describe('getTranscription', () => {
        it('clears transcript when playerPodcast is undefined', async () => {
            const spy = vi.spyOn(playerStore, 'playerUpdateTranscript');

            await composable.getTranscription();

            expect(spy).toHaveBeenCalledWith();
            expect(mockGetMostRelevantLanguage).not.toHaveBeenCalled();
        });

        it('sets actualText from the first entry when it starts at 0', async () => {
            playerStore.$patch({ playerPodcast: { podcastId: 42 } as never });
            vi.mocked(transcriptionApi.getTranslation).mockResolvedValue(SRT_FROM_ZERO);
            const spy = vi.spyOn(playerStore, 'playerUpdateTranscript');

            await composable.getTranscription();

            expect(transcriptionApi.getTranslations).toHaveBeenCalledWith(42);
            expect(transcriptionApi.getTranslation).toHaveBeenCalledWith(42, 'fr');
            expect(spy).toHaveBeenCalledWith({
                actual: 0,
                actualText: 'Hello',
                value: [
                    { startTime: 0, endTime: 2, text: 'Hello' },
                    { startTime: 2, endTime: 4, text: 'World' },
                ],
            });
        });

        it('sets empty actualText when the first entry starts after 0', async () => {
            playerStore.$patch({ playerPodcast: { podcastId: 42 } as never });
            vi.mocked(transcriptionApi.getTranslation).mockResolvedValue(SRT_DELAYED_START);
            const spy = vi.spyOn(playerStore, 'playerUpdateTranscript');

            await composable.getTranscription();

            expect(spy).toHaveBeenCalledWith(expect.objectContaining({ actualText: '' }));
        });
    });

    describe('generatingTranscriptLanguage', () => {
        it('is null initially', () => {
            expect(composable.generatingTranscriptLanguage.value).toBeNull();
        });

        it('is reset to null when getTranscription starts', async () => {
            composable.generatingTranscriptLanguage.value = 'de';

            await composable.getTranscription(); // no podcast → returns early

            expect(composable.generatingTranscriptLanguage.value).toBeNull();
        });

        it('is set to the available language while a better translation is being generated', async () => {
            playerStore.$patch({ playerPodcast: { podcastId: 42 } as never });
            mockGetMostRelevantLanguage.mockResolvedValue({ ready: 'fr', available: 'en' });

            let resolveGeneration!: (value: string) => void;
            vi.mocked(transcriptionApi.getTranslation)
                .mockResolvedValueOnce('') // first call: ready='fr'
                .mockReturnValueOnce(new Promise(resolve => { resolveGeneration = resolve; }));

            const promise = composable.getTranscription();
            await flushPromises();

            expect(composable.generatingTranscriptLanguage.value).toBe('en');

            resolveGeneration('');
            await flushPromises();

            expect(composable.generatingTranscriptLanguage.value).toBeNull();
            await promise;
        });

        it('updates transcript with the better translation once generated', async () => {
            playerStore.$patch({ playerPodcast: { podcastId: 42 } as never });
            mockGetMostRelevantLanguage.mockResolvedValue({ ready: 'fr', available: 'en' });
            vi.mocked(transcriptionApi.getTranslation)
                .mockResolvedValueOnce('') // for ready='fr'
                .mockResolvedValueOnce(SRT_FROM_ZERO); // for available='en'

            const spy = vi.spyOn(playerStore, 'playerUpdateTranscript');

            await composable.getTranscription();

            expect(transcriptionApi.getTranslation).toHaveBeenCalledWith(42, 'en', true);
            expect(spy).toHaveBeenCalledWith(expect.objectContaining({
                actualText: 'Hello',
                value: [
                    { startTime: 0, endTime: 2, text: 'Hello' },
                    { startTime: 2, endTime: 4, text: 'World' },
                ],
            }));
        });
    });

    describe('onTimeUpdateTranscript', () => {
        it('does nothing when there is no transcript', () => {
            composable.onTimeUpdateTranscript(1);
            expect(playerStore.playerTranscript).toBeUndefined();
        });

        it('sets actualText when currentTime reaches startTime', () => {
            playerStore.playerUpdateTranscript({
                actual: 0, actualText: '',
                value: [{ startTime: 1, endTime: 3, text: 'Hello' }],
            });

            composable.onTimeUpdateTranscript(1.5);

            expect(playerStore.playerTranscript?.actualText).toBe('Hello');
            expect(playerStore.playerTranscript?.actual).toBe(0);
        });

        it('advances to the next entry when currentTime exceeds endTime', () => {
            playerStore.playerUpdateTranscript({
                actual: 0, actualText: '',
                value: [
                    { startTime: 0, endTime: 2, text: 'Hello' },
                    { startTime: 2, endTime: 4, text: 'World' },
                ],
            });

            composable.onTimeUpdateTranscript(3);

            expect(playerStore.playerTranscript?.actual).toBe(1);
            expect(playerStore.playerTranscript?.actualText).toBe('World');
        });
    });

    describe('onSeekedTranscript', () => {
        it('does nothing when there is no transcript', () => {
            composable.onSeekedTranscript(5);
            expect(playerStore.playerTranscript).toBeUndefined();
        });

        it('seeks to the correct entry index', () => {
            playerStore.playerUpdateTranscript({
                actual: 0, actualText: '',
                value: [
                    { startTime: 0, endTime: 2, text: 'Hello' },
                    { startTime: 2, endTime: 4, text: 'World' },
                    { startTime: 4, endTime: 6, text: 'Bye' },
                ],
            });

            composable.onSeekedTranscript(3);

            expect(playerStore.playerTranscript?.actual).toBe(1);
        });
    });

    describe('checkDelaytWithStitching', () => {
        it('always resets the stitching delay to 0', async () => {
            const spy = vi.spyOn(playerStore, 'playerUpdateDelayStitching');
            useVastStore().$patch({ useVastPlayerPodcast: true });

            await composable.checkDelaytWithStitching();

            expect(spy).toHaveBeenCalledWith(0);
        });

        it.each([
            ['useVastPlayerPodcast is true', () => useVastStore().$patch({ useVastPlayerPodcast: true })],
            ['no #audio-player element exists', () => playerStore.$patch({
                playerPodcast: { podcastId: 1 } as never,
                playerTranscript: { actual: 0, actualText: '', value: [] },
            })],
        ])('returns early when %s', async (_, setup) => {
            setup();
            await composable.checkDelaytWithStitching();
            expect(classicApi.fetchData).not.toHaveBeenCalled();
        });
    });
});
