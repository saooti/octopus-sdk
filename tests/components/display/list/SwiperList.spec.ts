import SwiperList from '@/components/display/list/SwiperList.vue';
import { mount as testMount } from '@tests/utils';
import { Swiper } from 'swiper/vue';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';

const listObject = Array.from({ length: 10 }, (_, i) => i);

const mount = async (props: Record<string, unknown> = {}) => {
    const wrapper = await testMount(SwiperList, {
        shallow: true,
        props: { listObject, ...props }
    });
    await nextTick();
    return wrapper;
};

describe('SwiperList', () => {
    describe('itemCount prop', () => {
        it('shows the given number of items at once', async () => {
            const wrapper = await mount({ itemCount: 3 });
            expect(wrapper.findComponent(Swiper).props('slidesPerView')).toBe(3);
        });

        it('updates when itemCount changes', async () => {
            const wrapper = await mount({ itemCount: 3 });
            await wrapper.setProps({ itemCount: 4 });
            expect(wrapper.findComponent(Swiper).props('slidesPerView')).toBe(4);
        });

        it('falls back to size-based computation without itemCount', async () => {
            const wrapper = await mount();
            expect(wrapper.findComponent(Swiper).props('slidesPerView')).toBe(1);
        });
    });
});
