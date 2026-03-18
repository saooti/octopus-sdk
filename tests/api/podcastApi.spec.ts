import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/classicApi', () => ({
    default: {
        fetchData: vi.fn()
    }
}));

import classicApi from '../../src/api/classicApi';
import { podcastApi } from '../../src/api/podcastApi';

const baseOptions = { organisationId: ['org-1'] };

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
});
