import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent } from 'vue';
import { mount as _mount } from '@vue/test-utils';
import { setupPinia } from '@tests/utils';
import { useAuthStore } from '@/stores/AuthStore';
import { CreateTranslation } from '@/stores/class/transcript/transcriptParams';
import { useTranslation } from '@/components/composable/useTranslation';

vi.mock('@/api/transcriptionApi', () => ({
    transcriptionApi: {
        getTranslation: vi.fn().mockResolvedValue('srt content'),
        getTranslations: vi.fn(),
    },
}));

vi.mock('@/api/podcastApi', () => ({
    podcastApi: {
        get: vi.fn().mockResolvedValue({ emission: undefined }),
    },
}));

vi.mock('@/helper/language', () => ({
    getLanguage: vi.fn().mockReturnValue('fr'),
}));

import { transcriptionApi, type PodcastTranslationData } from '@/api/transcriptionApi';
import { podcastApi } from '@/api/podcastApi';
import { getLanguage } from '@/helper/language';

function makeTranslationData(overrides: Partial<PodcastTranslationData> = {}): PodcastTranslationData {
    return { podcastId: 1, nativeLanguage: 'fr', translations: [], ...overrides };
}

function setOrgTranslationConfig(config: object) {
    const authStore = useAuthStore();
    authStore.$patch({
        authOrganisation: {
            id: 'test-org',
            imageUrl: '',
            attributes: { 'translation-config': JSON.stringify(config) },
        },
    });
}

describe('useTranslation', () => {
    let composable: ReturnType<typeof useTranslation>;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(transcriptionApi.getTranslation).mockResolvedValue('srt content');
        vi.mocked(podcastApi.get).mockResolvedValue({ emission: undefined } as never);
        vi.mocked(getLanguage).mockReturnValue('fr');

        let result!: ReturnType<typeof useTranslation>;
        const pinia = setupPinia();
        _mount(defineComponent({
            setup() { result = useTranslation(); return {}; },
            template: '<div/>',
        }), { global: { plugins: [pinia] } });
        composable = result;
    });

    describe('convertSrtToPlainText', () => {
        it('converts a single SRT block to plain text', () => {
            const srt = '1\n00:00:01,000 --> 00:00:02,000\nHello world\n\n';
            expect(composable.convertSrtToPlainText(srt)).toBe('Hello world ');
        });

        it('joins multiple SRT blocks', () => {
            const srt = '1\n00:00:01,000 --> 00:00:02,000\nHello\n\n2\n00:00:03,000 --> 00:00:04,000\nworld\n\n';
            expect(composable.convertSrtToPlainText(srt)).toBe('Hello world ');
        });

        it('returns an empty string for empty input', () => {
            expect(composable.convertSrtToPlainText('')).toBe('');
        });
    });

    describe('getMostRelevantTranslation', () => {
        it('uses the native language when it matches the browser language', async () => {
            await composable.getMostRelevantTranslation(makeTranslationData({ nativeLanguage: 'fr' }));

            expect(transcriptionApi.getTranslation).toHaveBeenCalledWith(1, 'fr', true);
            expect(podcastApi.get).not.toHaveBeenCalled();
        });

        it('uses the browser language when it is available in the org config', async () => {
            vi.mocked(getLanguage).mockReturnValue('en');
            setOrgTranslationConfig({
                createTranslation: { en: CreateTranslation.ALWAYS },
                otherLanguage: CreateTranslation.NEVER,
            });

            await composable.getMostRelevantTranslation(makeTranslationData({ nativeLanguage: 'fr' }));

            expect(transcriptionApi.getTranslation).toHaveBeenCalledWith(1, 'en', true);
        });

        it('falls back to English when browser language is unavailable but English is available', async () => {
            vi.mocked(getLanguage).mockReturnValue('de');
            setOrgTranslationConfig({
                createTranslation: { en: CreateTranslation.ON_DEMAND },
                otherLanguage: CreateTranslation.NEVER,
            });

            await composable.getMostRelevantTranslation(makeTranslationData({ nativeLanguage: 'fr' }));

            expect(transcriptionApi.getTranslation).toHaveBeenCalledWith(1, 'en', true);
        });

        it('falls back to native language when neither browser language nor English is available', async () => {
            vi.mocked(getLanguage).mockReturnValue('de');
            setOrgTranslationConfig({
                createTranslation: {},
                otherLanguage: CreateTranslation.NEVER,
            });

            await composable.getMostRelevantTranslation(makeTranslationData({ nativeLanguage: 'fr' }));

            expect(transcriptionApi.getTranslation).toHaveBeenCalledWith(1, 'fr', true);
        });

        it('treats ON_DEMAND as available', async () => {
            vi.mocked(getLanguage).mockReturnValue('es');
            setOrgTranslationConfig({
                createTranslation: { es: CreateTranslation.ON_DEMAND },
                otherLanguage: CreateTranslation.NEVER,
            });

            await composable.getMostRelevantTranslation(makeTranslationData({ nativeLanguage: 'fr' }));

            expect(transcriptionApi.getTranslation).toHaveBeenCalledWith(1, 'es', true);
        });

        it('fetches translation data first when called with a podcast ID', async () => {
            vi.mocked(transcriptionApi.getTranslations).mockResolvedValue(makeTranslationData());

            await composable.getMostRelevantTranslation(1);

            expect(transcriptionApi.getTranslations).toHaveBeenCalledWith(1);
            expect(transcriptionApi.getTranslation).toHaveBeenCalledWith(1, 'fr', true);
        });
    });
});
