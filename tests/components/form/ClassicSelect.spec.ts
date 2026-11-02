import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import ClassicSelect from '@/components/form/ClassicSelect.vue';
import { mount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

const options = [
    { title: 'Five', value: 5 },
    { title: 'Ten', value: 10 }
];

describe('ClassicSelect', () => {
    it('selects the numeric option matching a numeric value', async () => {
        const wrapper = await mount(ClassicSelect, { props: { options, textInit: 10 } });
        expect(wrapper.find('select').element.value).toBe('10');
    });

    it('selects the numeric option matching a string value', async () => {
        const wrapper = await mount(ClassicSelect, { props: { options, textInit: '5' } });
        expect(wrapper.find('select').element.value).toBe('5');
    });

    it('selects the placeholder when the value is reset', async () => {
        const wrapper = await mount(ClassicSelect, { props: { options, textInit: 10, placeholder: 'Choose' } });
        await wrapper.setProps({ textInit: undefined });
        expect(wrapper.find('select').element.value).toBe('');
    });

    it('restores the displayed value when the parent does not accept the change', async () => {
        const wrapper = await mount(ClassicSelect, { props: { options, textInit: 5 } });
        await wrapper.find('select').setValue('10');
        await nextTick();
        expect(wrapper.emitted('update:textInit')).toEqual([['10']]);
        expect(wrapper.find('select').element.value).toBe('5');
    });
});
