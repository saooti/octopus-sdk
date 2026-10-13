import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import ClassicDatePicker from '@/components/form/ClassicDatePicker.vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import { mount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

describe('ClassicDatePicker', () => {
    describe('input id', () => {
        it('prefixes the input id with dp-input-', async () => {
            const wrapper = await mount(ClassicDatePicker, {
                props: { id: 'my-picker' }
            });
            expect(wrapper.find('input').attributes('id')).toBe('dp-input-my-picker');
        });

        it('does not set an input id when id is not provided', async () => {
            const wrapper = await mount(ClassicDatePicker);
            expect(wrapper.find('input').attributes('id')).toBeUndefined();
        });
    });

    describe('format', () => {
        it('uses a single date format for ranges', async () => {
            const wrapper = await mount(ClassicDatePicker, {
                props: { range: [new Date(), new Date()] }
            });
            expect(wrapper.findComponent(VueDatePicker).props('formats')).toEqual({ input: 'dd/MM/yyyy HH:mm' });
        });
    });
});
