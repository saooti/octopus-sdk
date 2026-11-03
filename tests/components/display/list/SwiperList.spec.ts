import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import SwiperList from '@/components/display/list/SwiperList.vue';
import { mount as testMount } from '@tests/utils';
import { Swiper, SwiperSlide } from 'swiper/vue';
import ChevronLeftIcon from 'vue-material-design-icons/ChevronLeft.vue';
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight.vue';
import { describe, expect, it, vi } from 'vitest';
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

        it('exposes a labelled carousel region only with a label', async () => {
            const root = (await mount({ itemCount: 3, label: 'Épisodes' })).find('div');
            expect(root.attributes()).toMatchObject({ role: 'region', 'aria-label': 'Épisodes', 'aria-roledescription': 'SwiperList - Role' });
            expect((await mount({ itemCount: 3 })).find('div').attributes('role')).toBeUndefined();
        });

        it('puts the navigation buttons before the slides, controlling them', async () => {
            const wrapper = await mount({ itemCount: 3 });
            const swiperId = wrapper.findComponent(Swiper).attributes('id');
            const buttons = wrapper.findAll('button');
            expect(buttons.map(b => b.attributes('aria-controls'))).toEqual([swiperId, swiperId]);
            expect(buttons[0].element.compareDocumentPosition(wrapper.findComponent(Swiper).element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        });

        describe('slides', () => {
            const mountSlides = async (itemCount: number) => {
                const wrapper = await testMount(SwiperList, {
                    shallow: true,
                    props: { listObject, itemCount },
                    // Wrapper read by slideChange to align the slides
                    stubs: { Swiper: { template: '<div><ul class="swiper-wrapper"><slot /></ul></div>' } }
                });
                await nextTick();
                return wrapper;
            };
            const visible = (wrapper: Awaited<ReturnType<typeof mountSlides>>) => wrapper.findAllComponents(SwiperSlide)
                .map((slide, index) => [index, slide.attributes('inert')] as const)
                .filter(([, inert]) => inert === undefined)
                .map(([index]) => index);

            it('keeps the position of each slide and hides the slides out of view', async () => {
                const wrapper = await mountSlides(3);
                const slides = wrapper.findAllComponents(SwiperSlide);
                expect(slides.map(s => [s.attributes('aria-posinset'), s.attributes('aria-setsize')])[1]).toEqual(['2', '10']);
                expect(visible(wrapper)).toEqual([0, 1, 2]);
                expect(wrapper.find('[role="status"]').text()).toBe('');
            });

            it('follows the visible slides and announces them after a change', async () => {
                const wrapper = await mountSlides(3);
                wrapper.findComponent(Swiper).vm.$emit('slide-change', { realIndex: 8 });
                await nextTick();
                expect(visible(wrapper)).toEqual([0, 8, 9]);
                expect(wrapper.find('[role="status"]').text()).toBe('SwiperList - Visible items first:9 last:1 count:10');
            });

            it('hides no slide and announces nothing when all items fit', async () => {
                const wrapper = await mountSlides(listObject.length);
                expect(visible(wrapper)).toHaveLength(listObject.length);
                expect(wrapper.find('[role="status"]').exists()).toBe(false);
            });
        });
    });
});
