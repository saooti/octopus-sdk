import LoadingOverlay from '@/components/misc/LoadingOverlay.vue';
import { mount } from '@tests/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

describe('LoadingOverlay', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('is only displayed after the delay', async () => {
        const wrapper = await mount(LoadingOverlay, { props: { delay: 300 } });
        expect(wrapper.find('.loading-overlay').exists()).toBe(false);

        vi.advanceTimersByTime(300);
        await nextTick();
        expect(wrapper.find('.loading-overlay').exists()).toBe(true);
    });

    it('is displayed immediately without delay', async () => {
        const wrapper = await mount(LoadingOverlay, { props: { delay: 0 } });
        expect(wrapper.find('.loading-overlay').exists()).toBe(true);
    });
});
