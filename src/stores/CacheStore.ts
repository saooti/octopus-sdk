import { useDayjs } from "../components/composable/useDayjs";
import { Dayjs } from "dayjs";
import { defineStore } from "pinia";

/**
 * Type for cache storage
 */
interface CachedData<T> {
    /** The in-flight or resolved data, shared by concurrent callers */
    data: Promise<T>;
    /** Expiration date of the cached data */
    expiration: Dayjs;
}

export const useCacheStore = defineStore('cache', () => {

    const { dayjs } = useDayjs();
    const cachedData: Record<string, CachedData<unknown>> = {};

    async function getData<T>(key: string, callback: () => Promise<T>): Promise<T> {
        let cache = cachedData[key] as CachedData<T>|undefined;
        if (isDataEmptyOrExpired(cache)) {
            // Store the promise immediately so concurrent callers share this fetch
            const data = callback();
            const expiration = dayjs().add(30, 'minutes');
            cache = { data, expiration };
            cachedData[key] = cache;
            // Don't keep a failed fetch cached: let the next call retry
            data.catch(() => invalidate(key));
        }

        return cache.data;
    }

    function invalidate(key: string): void {
        delete cachedData[key];
    }

    function isDataEmptyOrExpired(data: CachedData<unknown>|undefined): boolean {
        if (!data) {
            return true;
        } else {
            return dayjs().isAfter(data.expiration);
        }
    }

    return {
        getData,
        invalidate
    };
});
