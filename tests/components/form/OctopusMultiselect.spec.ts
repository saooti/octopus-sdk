import '@tests/mocks/i18n';

import OctopusMultiselect from '@/components/form/OctopusMultiselect.vue';
import { mount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

const options = [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' },
    { id: 3, name: 'Gamma' },
];

describe('OctopusMultiselect', () => {
    it('renders label when provided', async () => {
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', label: 'My label' },
        });
        expect(wrapper.find('label.form-label').text()).toBe('My label');
    });

    it('does not render label when not provided', async () => {
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name' },
        });
        expect(wrapper.find('label.form-label').exists()).toBe(false);
    });

    it('opens dropdown on input focus', async () => {
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name' },
        });
        expect(wrapper.find('.octopus-multiselect-dropdown').exists()).toBe(false);
        await wrapper.find('input').trigger('focus');
        expect(wrapper.find('.octopus-multiselect-dropdown').exists()).toBe(true);
    });

    it('shows "All" checkbox and one checkbox per option when open', async () => {
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name' },
        });
        await wrapper.find('input').trigger('focus');
        const checkboxes = wrapper.findAll('input[type="checkbox"]');
        // 1 for "All" + 3 for options
        expect(checkboxes).toHaveLength(4);
    });

    it('filters options locally by search query', async () => {
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name' },
        });
        await wrapper.find('input').trigger('focus');
        await wrapper.find('input').setValue('al');
        await wrapper.find('input').trigger('input');
        const checkboxes = wrapper.findAll('input[type="checkbox"]');
        // 1 for "All" + 1 matching "Alpha"
        expect(checkboxes).toHaveLength(2);
    });

    it('shows no-results message when filter matches nothing', async () => {
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name' },
        });
        await wrapper.find('input').trigger('focus');
        await wrapper.find('input').setValue('zzz');
        await wrapper.find('input').trigger('input');
        expect(wrapper.find('.text-indic').exists()).toBe(true);
    });

    it('calls onSearch with current query and updates displayed options', async () => {
        const searchResult = [{ id: 4, name: 'Delta' }];
        const onSearch = vi.fn().mockResolvedValue(searchResult);
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', onSearch },
        });
        await wrapper.find('input').trigger('focus');
        await wrapper.find('input').setValue('del');
        await wrapper.find('input').trigger('input');
        await vi.dynamicImportSettled();
        expect(onSearch).toHaveBeenCalledWith('del');
    });

    it('emits update:selected when toggling a single option', async () => {
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', selected: [] },
        });
        await wrapper.find('input').trigger('focus');
        const optionCheckboxes = wrapper.findAll('.octopus-multiselect-options input[type="checkbox"]');
        await optionCheckboxes[0].trigger('input');
        expect(wrapper.emitted('update:selected')?.[0]).toEqual([[options[0]]]);
    });

    it('deselects an already-selected option', async () => {
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', selected: [options[0]] },
        });
        await wrapper.find('input').trigger('focus');
        const optionCheckboxes = wrapper.findAll('.octopus-multiselect-options input[type="checkbox"]');
        await optionCheckboxes[0].trigger('input');
        expect(wrapper.emitted('update:selected')?.[0]).toEqual([[]]);
    });

    it('toggleAll selects all displayed options', async () => {
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', selected: [] },
        });
        await wrapper.find('input').trigger('focus');
        const allCheckbox = wrapper.find('.octopus-multiselect-dropdown > .octopus-form-item input[type="checkbox"]');
        await allCheckbox.trigger('input');
        const emitted = wrapper.emitted('update:selected')?.[0]?.[0] as unknown[];
        expect(emitted).toHaveLength(3);
    });

    it('toggleAll deselects all displayed options when all are selected', async () => {
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', selected: [...options] },
        });
        await wrapper.find('input').trigger('focus');
        const allCheckbox = wrapper.find('.octopus-multiselect-dropdown > .octopus-form-item input[type="checkbox"]');
        await allCheckbox.trigger('input');
        expect(wrapper.emitted('update:selected')?.[0]).toEqual([[]]);
    });

    it('shows selected items summary in placeholder', async () => {
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', selected: [options[0], options[1]] },
        });
        const input = wrapper.find('input');
        expect(input.attributes('placeholder')).toBe('Alpha, Beta');
    });

    it('shows count in placeholder when more than 2 items selected', async () => {
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', selected: [...options] },
        });
        const input = wrapper.find('input');
        expect(input.attributes('placeholder')).toBe('Alpha, Beta (+1)');
    });

    it('disables input when isDisabled is true', async () => {
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', isDisabled: true },
        });
        expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });

    it('does not open dropdown when disabled', async () => {
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', isDisabled: true },
        });
        await wrapper.find('input').trigger('focus');
        expect(wrapper.find('.octopus-multiselect-dropdown').exists()).toBe(false);
    });

    it('uses selectAllText as the "All" checkbox label when provided', async () => {
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', selectAllText: 'Tout' },
        });
        await wrapper.find('input').trigger('focus');
        const allCheckboxLabel = wrapper.find('.octopus-multiselect-dropdown > .octopus-form-item label');
        expect(allCheckboxLabel.text()).toBe('Tout');
    });

    it('deselects by optionKey even when selected objects are different references', async () => {
        const selected = [{ id: 1, name: 'Alpha' }];
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', optionKey: 'id', selected },
        });
        await wrapper.find('input').trigger('focus');
        const optionCheckboxes = wrapper.findAll('.octopus-multiselect-options input[type="checkbox"]');
        await optionCheckboxes[0].trigger('input');
        expect(wrapper.emitted('update:selected')?.[0]).toEqual([[]]);
    });

    it('toggleAll deselects by optionKey even when selected objects are different references', async () => {
        const selected = options.map((o) => ({ ...o }));
        const wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', optionKey: 'id', selected },
        });
        await wrapper.find('input').trigger('focus');
        const allCheckbox = wrapper.find('.octopus-multiselect-dropdown > .octopus-form-item input[type="checkbox"]');
        await allCheckbox.trigger('input');
        expect(wrapper.emitted('update:selected')?.[0]).toEqual([[]]);
    });
});
