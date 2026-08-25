import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AxiosError } from 'axios';

vi.mock('../../src/api/classicApi', () => ({
    default: {
        fetchData: vi.fn()
    }
}));

import classicApi from '../../src/api/classicApi';
import { podcastApi } from '../../src/api/podcastApi';
import { registerI18n } from '../../src/i18n';
import { useNotificationStore } from '../../src/stores/NotificationStore';
import { setupPinia, localisation } from '../utils';

const baseOptions = { organisationId: ['org-1'] };

function countryBlockedError(message: string): AxiosError {
    const error = new AxiosError(message);
    error.status = 403;
    error.response = { data: message } as AxiosError['response'];
    return error;
}

describe('podcastApi', () => {
    describe('count', () => {
        beforeEach(() => {
            vi.mocked(classicApi.fetchData).mockResolvedValue({ count: 42, result: [], sort: null });
        });

        it('returns the count from search results', async () => {
            const result = await podcastApi.count(baseOptions);
            expect(result).toBe(42);
        });

        it('calls search with size 0', async () => {
            await podcastApi.count(baseOptions);
            expect(classicApi.fetchData).toHaveBeenCalledWith(
                expect.objectContaining({
                    parameters: expect.objectContaining({ size: 0 })
                })
            );
        });

        it('forwards other options to search', async () => {
            await podcastApi.count({ ...baseOptions, emissionId: 5 });
            expect(classicApi.fetchData).toHaveBeenCalledWith(
                expect.objectContaining({
                    parameters: expect.objectContaining({ organisationId: ['org-1'], emissionId: 5 })
                })
            );
        });
    });

    describe('downloadRegister', () => {
        beforeEach(() => {
            setupPinia();
            registerI18n({ global: { t: localisation } } as Parameters<typeof registerI18n>[0]);
        });

        it('resolves with the download location on success', async () => {
            vi.mocked(classicApi.fetchData).mockResolvedValue({ location: '/some/url', downloadId: 1 });
            const result = await podcastApi.downloadRegister(1);
            expect(result).toEqual({ location: '/some/url', downloadId: 1 });
        });

        it('notifies with a translated message when the country is blacklisted', async () => {
            vi.mocked(classicApi.fetchData).mockRejectedValue(countryBlockedError('Country FR is blacklisted'));
            const notificationStore = useNotificationStore();

            await expect(podcastApi.downloadRegister(1)).rejects.toBeInstanceOf(AxiosError);

            expect(notificationStore.currentNotification).toEqual({
                type: 'error',
                title: localisation('Generic - Content unavailable - Country blocked - Title'),
                message: localisation('Generic - Content unavailable - Country blocked - Message')
            });
        });

        it('notifies with a translated message when the country is not whitelisted', async () => {
            vi.mocked(classicApi.fetchData).mockRejectedValue(countryBlockedError('Country FR is not whitelisted'));
            const notificationStore = useNotificationStore();

            await expect(podcastApi.downloadRegister(1)).rejects.toBeInstanceOf(AxiosError);

            expect(notificationStore.currentNotification).toBeDefined();
        });

        it('does not notify for unrelated errors', async () => {
            vi.mocked(classicApi.fetchData).mockRejectedValue(countryBlockedError('Some other 403 reason'));
            const notificationStore = useNotificationStore();

            await expect(podcastApi.downloadRegister(1)).rejects.toBeInstanceOf(AxiosError);

            expect(notificationStore.currentNotification).toBeUndefined();
        });
    });
});
