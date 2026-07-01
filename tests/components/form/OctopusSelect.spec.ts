import '@tests/mocks/i18n';

import OctopusSelect from '@/components/form/OctopusSelect.vue';
import { DOMWrapper, type VueWrapper } from '@vue/test-utils';
import { mount } from '@tests/utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const options = [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' },
    { id: 3, name: 'Gamma' },
];

// The dropdown is teleported to .octopus-app — helper to query it from the document.
function getDropdown(): Element | null {
    return document.body.querySelector('.octopus-select-dropdown');
}

describe('OctopusSelect', () => {
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
        wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name', label: 'My label' },
        });
        expect(wrapper.find('label.form-label').text()).toBe('My label');
    });

    it('does not render label when not provided', async () => {
        wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name' },
        });
        expect(wrapper.find('label.form-label').exists()).toBe(false);
    });

    it('opens dropdown on input focus', async () => {
        wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name' },
        });
        expect(getDropdown()).toBeNull();
        await wrapper.find('input').trigger('focus');
        expect(getDropdown()).not.toBeNull();
    });

    it('shows one button per option when open', async () => {
        wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name' },
        });
        await wrapper.find('input').trigger('focus');
        const optionButtons = document.body.querySelectorAll('.octopus-select-option');
        expect(optionButtons).toHaveLength(3);
        expect(optionButtons[0].textContent?.trim()).toBe('Alpha');
    });

    it('filters options locally by search query', async () => {
        wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name' },
        });
        await wrapper.find('input').trigger('focus');
        await wrapper.find('input').setValue('al');
        await wrapper.find('input').trigger('input');
        expect(document.body.querySelectorAll('.octopus-select-option')).toHaveLength(1);
    });

    it('shows no-results message when filter matches nothing', async () => {
        wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name' },
        });
        await wrapper.find('input').trigger('focus');
        await wrapper.find('input').setValue('zzz');
        await wrapper.find('input').trigger('input');
        expect(document.body.querySelector('.text-indic')).not.toBeNull();
    });

    it('emits update:value with the clicked option', async () => {
        wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name' },
        });
        await wrapper.find('input').trigger('focus');
        await new DOMWrapper(document.body.querySelectorAll('.octopus-select-option')[1]).trigger('click');
        expect(wrapper.emitted('update:value')?.[0]).toEqual([options[1]]);
    });

    it('closes dropdown after selecting an option', async () => {
        wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name' },
        });
        await wrapper.find('input').trigger('focus');
        await new DOMWrapper(document.body.querySelectorAll('.octopus-select-option')[0]).trigger('click');
        expect(getDropdown()).toBeNull();
    });

    it('shows selected item label in the field when closed', async () => {
        wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name', value: options[0] },
        });
        expect(wrapper.find('.octopus-select-value').text()).toBe('Alpha');
    });

    it('marks the selected option with the selected class', async () => {
        wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name', value: options[0] },
        });
        await wrapper.find('.octopus-select-field').trigger('click');
        const optionButtons = document.body.querySelectorAll('.octopus-select-option');
        expect(optionButtons[0].classList).toContain('selected');
        expect(optionButtons[1].classList).not.toContain('selected');
    });

    it('deselects the current option by default (allowDeselect defaults to true)', async () => {
        wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name', optionKey: 'id', value: options[0] },
        });
        await wrapper.find('.octopus-select-field').trigger('click');
        await new DOMWrapper(document.body.querySelectorAll('.octopus-select-option')[0]).trigger('click');
        expect(wrapper.emitted('update:value')?.[0]).toEqual([undefined]);
    });

    it('does not deselect when allowDeselect is false', async () => {
        wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name', optionKey: 'id', value: options[0], allowDeselect: false as boolean },
        });
        await wrapper.find('.octopus-select-field').trigger('click');
        await new DOMWrapper(document.body.querySelectorAll('.octopus-select-option')[0]).trigger('click');
        expect(wrapper.emitted('update:value')?.[0]).toEqual([options[0]]);
    });

    it('does not open dropdown when disabled', async () => {
        wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name', isDisabled: true },
        });
        await wrapper.find('input').trigger('focus');
        expect(getDropdown()).toBeNull();
    });

    it('disables input when isDisabled is true', async () => {
        wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name', isDisabled: true },
        });
        expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });

    it('matches by optionKey when checking selection', async () => {
        const value = { id: 1, name: 'Alpha' };
        wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name', optionKey: 'id', value },
        });
        await wrapper.find('.octopus-select-field').trigger('click');
        const optionButtons = document.body.querySelectorAll('.octopus-select-option');
        expect(optionButtons[0].classList).toContain('selected');
    });
});
