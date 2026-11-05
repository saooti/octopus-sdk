import { mockUseRouter, mockI18n } from '@tests/mocks';
vi.mock('vue-router', () => mockUseRouter());
vi.mock('vue-i18n', () => mockI18n());

import ProductorSearch from '@/components/display/filter/ProductorSearch.vue';
import ClassicSearch from '@/components/form/ClassicSearch.vue';
import { mount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

describe('ProductorSearch', () => {
    it('is a search landmark', async() => {
        const wrapper = await mount(ProductorSearch, { shallow: true });
        expect(wrapper.attributes('role')).toBe('search');
    });

    it('does not take focus on load', async() => {
        const wrapper = await mount(ProductorSearch, { shallow: true });
        expect(wrapper.findComponent(ClassicSearch).props('autofocus')).toBe(false);
    });
});
