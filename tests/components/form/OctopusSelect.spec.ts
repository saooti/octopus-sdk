import '@tests/mocks/i18n';

import OctopusSelect from '@/components/form/OctopusSelect.vue';
import { mount } from '@tests/utils';
import { describe, expect, it } from 'vitest';

const options = [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' },
    { id: 3, name: 'Gamma' },
];

describe('OctopusSelect', () => {
    it('renders label when provided', async () => {
        const wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name', label: 'My label' },
        });
        expect(wrapper.find('label.form-label').text()).toBe('My label');
    });

    it('does not render label when not provided', async () => {
        const wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name' },
        });
        expect(wrapper.find('label.form-label').exists()).toBe(false);
    });

    it('opens dropdown on input focus', async () => {
        const wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name' },
        });
        expect(wrapper.find('.octopus-select-dropdown').exists()).toBe(false);
        await wrapper.find('input').trigger('focus');
        expect(wrapper.find('.octopus-select-dropdown').exists()).toBe(true);
    });

    it('shows one button per option when open', async () => {
        const wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name' },
        });
        await wrapper.find('input').trigger('focus');
        const optionButtons = wrapper.findAll('.octopus-select-option');
        expect(optionButtons).toHaveLength(3);
        expect(optionButtons[0].text()).toBe('Alpha');
    });

    it('filters options locally by search query', async () => {
        const wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name' },
        });
        await wrapper.find('input').trigger('focus');
        await wrapper.find('input').setValue('al');
        await wrapper.find('input').trigger('input');
        expect(wrapper.findAll('.octopus-select-option')).toHaveLength(1);
    });

    it('shows no-results message when filter matches nothing', async () => {
        const wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name' },
        });
        await wrapper.find('input').trigger('focus');
        await wrapper.find('input').setValue('zzz');
        await wrapper.find('input').trigger('input');
        expect(wrapper.find('.text-indic').exists()).toBe(true);
    });

    it('emits update:value with the clicked option', async () => {
        const wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name' },
        });
        await wrapper.find('input').trigger('focus');
        await wrapper.findAll('.octopus-select-option')[1].trigger('click');
        expect(wrapper.emitted('update:value')?.[0]).toEqual([options[1]]);
    });

    it('closes dropdown after selecting an option', async () => {
        const wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name' },
        });
        await wrapper.find('input').trigger('focus');
        await wrapper.findAll('.octopus-select-option')[0].trigger('click');
        expect(wrapper.find('.octopus-select-dropdown').exists()).toBe(false);
    });

    it('shows selected item label in the field when closed', async () => {
        const wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name', value: options[0] },
        });
        expect(wrapper.find('.octopus-select-value').text()).toBe('Alpha');
    });

    it('marks the selected option with the selected class', async () => {
        const wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name', value: options[0] },
        });
        await wrapper.find('.octopus-select-field').trigger('click');
        const optionButtons = wrapper.findAll('.octopus-select-option');
        expect(optionButtons[0].classes()).toContain('selected');
        expect(optionButtons[1].classes()).not.toContain('selected');
    });

    it('deselects the current option by default (allowDeselect defaults to true)', async () => {
        const wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name', optionKey: 'id', value: options[0] },
        });
        await wrapper.find('.octopus-select-field').trigger('click');
        await wrapper.findAll('.octopus-select-option')[0].trigger('click');
        expect(wrapper.emitted('update:value')?.[0]).toEqual([undefined]);
    });

    it('does not deselect when allowDeselect is false', async () => {
        const wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name', optionKey: 'id', value: options[0], allowDeselect: false as boolean },
        });
        await wrapper.find('.octopus-select-field').trigger('click');
        await wrapper.findAll('.octopus-select-option')[0].trigger('click');
        expect(wrapper.emitted('update:value')?.[0]).toEqual([options[0]]);
    });

    it('does not open dropdown when disabled', async () => {
        const wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name', isDisabled: true },
        });
        await wrapper.find('input').trigger('focus');
        expect(wrapper.find('.octopus-select-dropdown').exists()).toBe(false);
    });

    it('disables input when isDisabled is true', async () => {
        const wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name', isDisabled: true },
        });
        expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });

    it('matches by optionKey when checking selection', async () => {
        const value = { id: 1, name: 'Alpha' };
        const wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name', optionKey: 'id', value },
        });
        await wrapper.find('.octopus-select-field').trigger('click');
        expect(wrapper.findAll('.octopus-select-option')[0].classes()).toContain('selected');
    });
});
