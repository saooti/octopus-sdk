import { mockI18n, mockUseRouter } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
vi.mock('vue-router', () => mockUseRouter());

import ListPaginate from '@/components/display/list/ListPaginate.vue';
import LoadingOverlay from '@/components/misc/LoadingOverlay.vue';
import PaginateParams from '@/components/display/list/PaginateParams.vue';
import PaginateSection from '@/components/display/list/PaginateSection.vue';
import { mount as testMount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

const mount = (props: Record<string, unknown> = {}) => testMount(ListPaginate, {
    shallow: true,
    props: { id: 'list', totalCount: 50, textCount: '50 items', loadingText: 'Loading', ...props },
    slots: { list: '<ul class="items"><li>Item</li></ul>' }
});

describe('ListPaginate', () => {
    describe('while loading', () => {
        it('keeps the controls and the content, covered by an overlay', async () => {
            const wrapper = await mount({ loading: true });
            expect(wrapper.findComponent(PaginateParams).exists()).toBe(true);
            expect(wrapper.find('.items').exists()).toBe(true);
            expect(wrapper.findComponent(LoadingOverlay).exists()).toBe(true);
        });

        it('does not show the overlay on first load', async () => {
            const wrapper = await mount({ loading: true, totalCount: 0 });
            expect(wrapper.findComponent(LoadingOverlay).exists()).toBe(false);
        });
    });

    it('keeps the same status message element during loading', async () => {
        const wrapper = await mount();
        const status = wrapper.find('[role="status"]').element;

        await wrapper.setProps({ loading: true });
        expect(wrapper.find('[role="status"]').element).toBe(status);
        expect(status.textContent?.trim()).toBe('Loading');

        await wrapper.setProps({ loading: false });
        expect(wrapper.find('[role="status"]').element).toBe(status);
        expect(status.textContent?.trim()).toBe('50 items');
    });

    describe('focus', () => {
        it('moves to the list on page change', async () => {
            const wrapper = await mount({ id: 'list-page' });
            vi.spyOn(document, 'getElementById').mockReturnValue(wrapper.element as HTMLElement);
            const focus = vi.spyOn(wrapper.element as HTMLElement, 'focus');

            wrapper.findComponent(PaginateSection).vm.$emit('update:first', 30);
            expect(focus).toHaveBeenCalled();
            expect(wrapper.emitted('update:first')).toEqual([[30]]);
        });

        it('stays on the select on size change', async () => {
            const wrapper = await mount();
            vi.spyOn(document, 'getElementById').mockReturnValue(wrapper.element as HTMLElement);
            const focus = vi.spyOn(wrapper.element as HTMLElement, 'focus');

            wrapper.findComponent(PaginateParams).vm.$emit('update:rowsPerPage', 10);
            expect(focus).not.toHaveBeenCalled();
            expect(wrapper.emitted('update:rowsPerPage')).toEqual([[10]]);
        });
    });
});
