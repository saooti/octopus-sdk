import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/classicApi', () => ({
    default: {
        fetchData: vi.fn()
    }
}));

import classicApi from '../../src/api/classicApi';
import { transcriptionApi } from '../../src/api/transcriptionApi';
import { ModuleApi } from '../../src/api/apiConnection';

describe('transcriptionApi', () => {
    beforeEach(() => {
        vi.mocked(classicApi.fetchData).mockResolvedValue('');
    });

    describe('getTranslations', () => {
        it('calls the SPEECHTOTEXT api with the correct path', async () => {
            await transcriptionApi.getTranslations(42);
            expect(classicApi.fetchData).toHaveBeenCalledWith({
                api: ModuleApi.SPEECHTOTEXT,
                path: 'transcription/42/languages',
            });
        });
    });

    describe('getTranslation', () => {
        it('calls the SPEECHTOTEXT api with the correct path', async () => {
            await transcriptionApi.getTranslation(42, 'en');
            expect(classicApi.fetchData).toHaveBeenCalledWith({
                api: ModuleApi.SPEECHTOTEXT,
                path: 'transcription/42/languages/en/srt',
            });
        });

        it.each([
            [true, 'true'],
            [false, 'false'],
        ])('appends mayCreateIfNotExists=%s to path when mayCreate is %s', async (mayCreate, suffix) => {
            await transcriptionApi.getTranslation(42, 'en', mayCreate);
            expect(classicApi.fetchData).toHaveBeenCalledWith({
                api: ModuleApi.SPEECHTOTEXT,
                path: `transcription/42/languages/en/srt?mayCreateIfNotExists=${suffix}`,
            });
        });
    });

    describe('getRawTranscription', () => {
        it('calls the SPEECHTOTEXT api with the correct path', async () => {
            await transcriptionApi.getRawTranscription(42);
            expect(classicApi.fetchData).toHaveBeenCalledWith({
                api: ModuleApi.SPEECHTOTEXT,
                path: 'transcription/text/42',
            });
        });
    });
});
