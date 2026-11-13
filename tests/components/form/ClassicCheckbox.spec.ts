import ClassicCheckbox from '@/components/form/ClassicCheckbox.vue';
import { mount } from '@tests/utils';
import { describe, expect, it } from 'vitest';

describe('ClassicCheckbox', () => {
    it('renders the switch as a checkbox with the switch role', async () => {
        const wrapper = await mount(ClassicCheckbox, {
            props: { label: 'Option', isSwitch: true, textInit: true }
        });
        const input = wrapper.find('input');
        expect(input.attributes('role')).toBe('switch');
        expect(input.element.checked).toBe(true);
        expect(wrapper.find('button').exists()).toBe(false);
    });

    it('has no role in checkbox mode', async () => {
        const wrapper = await mount(ClassicCheckbox, { props: { label: 'Option' } });
        expect(wrapper.find('input').attributes('role')).toBeUndefined();
    });

    it.each([false, true])('associates the label with the input (switch: %s)', async (isSwitch) => {
        const wrapper = await mount(ClassicCheckbox, { props: { label: 'Option', isSwitch } });
        expect(wrapper.find('label').attributes('for')).toBe(wrapper.find('input').attributes('id'));
    });

    it('emits the toggled value and clickAction on click', async () => {
        const wrapper = await mount(ClassicCheckbox, {
            props: { label: 'Option', isSwitch: true, textInit: false }
        });
        await wrapper.find('input').trigger('click');
        await wrapper.find('input').trigger('input');
        expect(wrapper.emitted('update:textInit')?.[0]).toEqual([true]);
        expect(wrapper.emitted('clickAction')).toHaveLength(1);
    });

    it('disables the input', async () => {
        const wrapper = await mount(ClassicCheckbox, {
            props: { label: 'Option', isSwitch: true, isDisabled: true }
        });
        expect(wrapper.find('input').element.disabled).toBe(true);
    });
});
