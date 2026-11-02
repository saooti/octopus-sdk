import SwiperList from '@/components/display/list/SwiperList.vue';
import { mount as testMount } from '@tests/utils';
import { Swiper, SwiperSlide } from 'swiper/vue';
import ChevronLeftIcon from 'vue-material-design-icons/ChevronLeft.vue';
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight.vue';
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

    describe('accessibility', () => {
        it('renders items as a list', async () => {
            const wrapper = await mount({ itemCount: 3 });
            expect(wrapper.findComponent(Swiper).props('wrapperTag')).toBe('ul');
        });

        it('renders each item as a list item', async () => {
            // Swiper stub rendering its slot, so that slides are mounted
            const wrapper = await testMount(SwiperList, {
                shallow: true,
                props: { listObject, itemCount: 3 },
                stubs: { Swiper: { template: '<div><slot /></div>' } }
            });
            await nextTick();
            const slides = wrapper.findAllComponents(SwiperSlide);
            expect(slides).toHaveLength(listObject.length);
            expect(slides.every(s => s.props('tag') === 'li')).toBe(true);
        });

        it('uses labelled buttons for navigation', async () => {
            const wrapper = await mount({ itemCount: 3 });
            const buttons = wrapper.findAll('button[type="button"]');
            expect(buttons.map(b => b.attributes('aria-label'))).toEqual([
                'SwiperList - Show previous items',
                'SwiperList - Show next items'
            ]);
        });

        it('shows arrows pointing in each direction, without relying on CSS', async () => {
            const wrapper = await mount({ itemCount: 3 });
            expect(wrapper.findComponent(Swiper).props('navigation')).toMatchObject({ addIcons: false });
            expect(wrapper.find('.swiper-button-prev').findComponent(ChevronLeftIcon).attributes('aria-hidden')).toBe('true');
            expect(wrapper.find('.swiper-button-next').findComponent(ChevronRightIcon).attributes('aria-hidden')).toBe('true');
        });

        it('does not render navigation buttons when all items fit', async () => {
            const wrapper = await mount({ itemCount: listObject.length });
            expect(wrapper.findAll('button')).toHaveLength(0);
        });
    });
});
