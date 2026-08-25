import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import { useCacheStore } from '@/stores/CacheStore';
import { setupPinia } from '@tests/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('CacheStore', () => {
    beforeEach(() => {
        setupPinia();
    });

    describe('getData', () => {
        it('returns the value resolved by the callback', async () => {
            const store = useCacheStore();
            const result = await store.getData('key', () => Promise.resolve('value'));
            expect(result).toBe('value');
        });

        it('does not call the callback again for a cached key', async () => {
            const store = useCacheStore();
            const callback = vi.fn().mockResolvedValue('value');
            await store.getData('key', callback);
            await store.getData('key', callback);
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('shares the in-flight promise between concurrent callers', async () => {
            const store = useCacheStore();
            const callback = vi.fn().mockResolvedValue('value');
            const [a, b] = await Promise.all([
                store.getData('key', callback),
                store.getData('key', callback),
            ]);
            expect(a).toBe('value');
            expect(b).toBe('value');
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('keeps separate cache entries per key', async () => {
            const store = useCacheStore();
            const callbackA = vi.fn().mockResolvedValue('value-a');
            const callbackB = vi.fn().mockResolvedValue('value-b');
            expect(await store.getData('key-a', callbackA)).toBe('value-a');
            expect(await store.getData('key-b', callbackB)).toBe('value-b');
            expect(callbackA).toHaveBeenCalledTimes(1);
            expect(callbackB).toHaveBeenCalledTimes(1);
        });

        it('does not cache a rejected fetch, allowing the next call to retry', async () => {
            const store = useCacheStore();
            const callback = vi.fn()
                .mockRejectedValueOnce(new Error('boom'))
                .mockResolvedValueOnce('value');

            await expect(store.getData('key', callback)).rejects.toThrow('boom');
            // Let the internal `.catch(() => invalidate(key))` microtask run
            await Promise.resolve();
            await Promise.resolve();

            const result = await store.getData('key', callback);
            expect(result).toBe('value');
            expect(callback).toHaveBeenCalledTimes(2);
        });

        describe('expiration', () => {
            beforeEach(() => {
                vi.useFakeTimers();
            });

            afterEach(() => {
                vi.useRealTimers();
            });

            it('does not refetch before the 30 minute expiration', async () => {
                const store = useCacheStore();
                const callback = vi.fn().mockResolvedValue('value');
                await store.getData('key', callback);
                vi.advanceTimersByTime(29 * 60 * 1000);
                await store.getData('key', callback);
                expect(callback).toHaveBeenCalledTimes(1);
            });

            it('refetches after the 30 minute expiration', async () => {
                const store = useCacheStore();
                const callback = vi.fn().mockResolvedValue('value');
                await store.getData('key', callback);
                vi.advanceTimersByTime(31 * 60 * 1000);
                await store.getData('key', callback);
                expect(callback).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('invalidate', () => {
        it('forces the next call to refetch', async () => {
            const store = useCacheStore();
            const callback = vi.fn().mockResolvedValue('value');
            await store.getData('key', callback);
            store.invalidate('key');
            await store.getData('key', callback);
            expect(callback).toHaveBeenCalledTimes(2);
        });

        it('does nothing for an unknown key', () => {
            const store = useCacheStore();
            expect(() => store.invalidate('unknown')).not.toThrow();
        });
    });
});
