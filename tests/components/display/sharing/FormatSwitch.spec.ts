import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import FormatSwitch from '@/components/display/sharing/FormatSwitch.vue';
import { localisation, mount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

describe('FormatSwitch', () => {
    it('is a labelled group of two labelled radios', async () => {
        const wrapper = await mount(FormatSwitch, { props: { isSvg: true } });

        expect(wrapper.find('fieldset legend').text()).toBe(localisation('FormatSwitch - Format'));
        const radios = wrapper.findAll<HTMLInputElement>('input[type="radio"]');
        const labels = radios.map((radio) => wrapper.find(`label[for="${radio.attributes('id')}"]`).text());
        expect(labels).toEqual(['SVG', 'PNG']);
        expect(radios.map((radio) => radio.element.checked)).toEqual([true, false]);
    });

    it('emits the selected format', async () => {
        const wrapper = await mount(FormatSwitch, { props: { isSvg: true } });

        await wrapper.findAll('input[type="radio"]')[1].setValue();

        expect(wrapper.emitted('update:isSvg')).toEqual([[false]]);
    });
});
