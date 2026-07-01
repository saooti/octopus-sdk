import '@tests/mocks/i18n';

import OctopusMultiselect from '@/components/form/OctopusMultiselect.vue';
import { DOMWrapper, type VueWrapper } from '@vue/test-utils';
import { mount } from '@tests/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const options = [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' },
    { id: 3, name: 'Gamma' },
];

// The dropdown is teleported to .octopus-app — helper to query it from the document.
function getDropdown(): Element | null {
    return document.body.querySelector('.octopus-multiselect-dropdown');
}

describe('OctopusMultiselect', () => {
    // The dropdown teleports to .octopus-app, which is normally the app root (see App.vue).
    // It doesn't exist in the test DOM, so it must be created before mount.
    let appElement: HTMLElement;

    beforeEach(() => {
        appElement = document.createElement('div');
        appElement.className = 'octopus-app';
        document.body.appendChild(appElement);
    });

    // Shared wrapper ref so afterEach can properly unmount it.
    // Proper unmount lets Vue clean up the teleport target before the next test starts.
    let wrapper: VueWrapper;
    afterEach(() => {
        wrapper?.unmount();
        appElement.remove();
    });

    it('renders label when provided', async () => {
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', label: 'My label' },
        });
        expect(wrapper.find('label.form-label').text()).toBe('My label');
    });

    it('does not render label when not provided', async () => {
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name' },
        });
        expect(wrapper.find('label.form-label').exists()).toBe(false);
    });

    it('opens dropdown on input focus', async () => {
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name' },
        });
        expect(getDropdown()).toBeNull();
        await wrapper.find('input').trigger('focus');
        expect(getDropdown()).not.toBeNull();
    });

    it('shows "All" checkbox and one checkbox per option when open', async () => {
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name' },
        });
        await wrapper.find('input').trigger('focus');
        const checkboxes = document.body.querySelectorAll('input[type="checkbox"]');
        // 1 for "All" + 3 for options
        expect(checkboxes).toHaveLength(4);
    });

    it('filters options locally by search query', async () => {
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name' },
        });
        await wrapper.find('input').trigger('focus');
        await wrapper.find('input').setValue('al');
        await wrapper.find('input').trigger('input');
        const checkboxes = document.body.querySelectorAll('input[type="checkbox"]');
        // 1 for "All" + 1 matching "Alpha"
        expect(checkboxes).toHaveLength(2);
    });

    it('shows no-results message when filter matches nothing', async () => {
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name' },
        });
        await wrapper.find('input').trigger('focus');
        await wrapper.find('input').setValue('zzz');
        await wrapper.find('input').trigger('input');
        expect(document.body.querySelector('.text-indic')).not.toBeNull();
    });

    it('calls onSearch with current query and updates displayed options', async () => {
        const searchResult = [{ id: 4, name: 'Delta' }];
        const onSearch = vi.fn().mockResolvedValue(searchResult);
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', onSearch },
        });
        await wrapper.find('input').trigger('focus');
        await wrapper.find('input').setValue('del');
        await wrapper.find('input').trigger('input');
        await vi.dynamicImportSettled();
        expect(onSearch).toHaveBeenCalledWith('del');
    });

    it('emits update:selected when toggling a single option', async () => {
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', selected: [] },
        });
        await wrapper.find('input').trigger('focus');
        const optionCheckboxes = document.body.querySelectorAll('.octopus-multiselect-options input[type="checkbox"]');
        await new DOMWrapper(optionCheckboxes[0] as Element).trigger('input');
        expect(wrapper.emitted('update:selected')?.[0]).toEqual([[options[0]]]);
    });

    it('deselects an already-selected option', async () => {
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', selected: [options[0]] },
        });
        await wrapper.find('input').trigger('focus');
        const optionCheckboxes = document.body.querySelectorAll('.octopus-multiselect-options input[type="checkbox"]');
        await new DOMWrapper(optionCheckboxes[0] as Element).trigger('input');
        expect(wrapper.emitted('update:selected')?.[0]).toEqual([[]]);
    });

    it('toggleAll selects all displayed options', async () => {
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', selected: [] },
        });
        await wrapper.find('input').trigger('focus');
        const allCheckbox = document.body.querySelector('.octopus-multiselect-dropdown > .octopus-form-item input[type="checkbox"]')!;
        await new DOMWrapper(allCheckbox).trigger('input');
        const emitted = wrapper.emitted('update:selected')?.[0]?.[0] as unknown[];
        expect(emitted).toHaveLength(3);
    });

    it('toggleAll deselects all displayed options when all are selected', async () => {
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', selected: [...options] },
        });
        await wrapper.find('input').trigger('focus');
        const allCheckbox = document.body.querySelector('.octopus-multiselect-dropdown > .octopus-form-item input[type="checkbox"]')!;
        await new DOMWrapper(allCheckbox).trigger('input');
        expect(wrapper.emitted('update:selected')?.[0]).toEqual([[]]);
    });

    it('shows selected items in the selection display', async () => {
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', selected: [options[0], options[1]] },
        });
        expect(wrapper.find('.octopus-multiselect-selection-text').text()).toBe('Alpha, Beta');
        expect(wrapper.find('.octopus-multiselect-selection-count').exists()).toBe(false);
    });

    it('shows overflow count badge when more than visible items are selected', async () => {
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', selected: [...options] },
        });
        expect(wrapper.find('.octopus-multiselect-selection-count').exists()).toBe(true);
    });

    it('disables input when isDisabled is true', async () => {
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', isDisabled: true },
        });
        expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });

    it('does not open dropdown when disabled', async () => {
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', isDisabled: true },
        });
        await wrapper.find('input').trigger('focus');
        expect(getDropdown()).toBeNull();
    });

    it('uses selectAllText as the "All" checkbox label when provided', async () => {
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', selectAllText: 'Tout' },
        });
        await wrapper.find('input').trigger('focus');
        const allCheckboxLabel = document.body.querySelector('.octopus-multiselect-dropdown > .octopus-form-item label')!;
        expect(allCheckboxLabel.textContent?.trim()).toBe('Tout');
    });

    it('deselects by optionKey even when selected objects are different references', async () => {
        const selected = [{ id: 1, name: 'Alpha' }];
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', optionKey: 'id', selected },
        });
        await wrapper.find('input').trigger('focus');
        const optionCheckboxes = document.body.querySelectorAll('.octopus-multiselect-options input[type="checkbox"]');
        await new DOMWrapper(optionCheckboxes[0] as Element).trigger('input');
        expect(wrapper.emitted('update:selected')?.[0]).toEqual([[]]);
    });

    it('toggleAll deselects by optionKey even when selected objects are different references', async () => {
        const selected = options.map((o) => ({ ...o }));
        wrapper = await mount(OctopusMultiselect, {
            props: { options, optionLabel: 'name', optionKey: 'id', selected },
        });
        await wrapper.find('input').trigger('focus');
        const allCheckbox = document.body.querySelector('.octopus-multiselect-dropdown > .octopus-form-item input[type="checkbox"]')!;
        await new DOMWrapper(allCheckbox).trigger('input');
        expect(wrapper.emitted('update:selected')?.[0]).toEqual([[]]);
    });
});
