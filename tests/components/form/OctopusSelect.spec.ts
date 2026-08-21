import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import OctopusSelect from '@/components/form/OctopusSelect.vue';
import { DOMWrapper, type VueWrapper } from '@vue/test-utils';
import { mount } from '@tests/utils';
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const options = [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' },
    { id: 3, name: 'Gamma' },
];

// The dropdown is teleported to .octopus-app — helper to query it from the document.
function getDropdown(): Element | null {
    return document.body.querySelector('.octopus-select-dropdown');
}

function getOptionLabels(): string[] {
    return Array.from(document.body.querySelectorAll('.octopus-select-option'))
        .map((el) => el.textContent?.trim() ?? '');
}

// Simulates a click outside the component to trigger onClickOutside's closeDropdown.
async function clickOutside(): Promise<void> {
    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);
    outsideElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await nextTick();
    document.body.removeChild(outsideElement);
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

    it('teleports the dropdown into an ancestor ClassicPopover instead of .octopus-app', async () => {
        // ClassicPopover also teleports to .octopus-app: without this, both end up as DOM
        // siblings there instead of the dropdown being nested inside the popover, which is
        // what makes ClassicPopover's outside-click containment check misfire and close it.
        const popoverElement = document.createElement('div');
        popoverElement.className = 'octopus-popover';
        appElement.appendChild(popoverElement);

        wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name' },
        });
        popoverElement.appendChild(wrapper.element);

        await wrapper.find('input').trigger('focus');

        expect(popoverElement.querySelector('.octopus-select-dropdown')).not.toBeNull();
        expect(appElement.querySelector(':scope > .octopus-select-dropdown')).toBeNull();
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
            props: { options, optionLabel: 'name', disabled: true },
        });
        await wrapper.find('input').trigger('focus');
        expect(getDropdown()).toBeNull();
    });

    it('disables input when disabled is true', async () => {
        wrapper = await mount(OctopusSelect, {
            props: { options, optionLabel: 'name', disabled: true },
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

    describe('pullSelectedToTop', () => {
        it('does not reorder options when pullSelectedToTop is not set', async () => {
            wrapper = await mount(OctopusSelect, {
                props: { options, optionLabel: 'name', value: options[1] },
            });
            await wrapper.find('input').trigger('focus');
            expect(getOptionLabels()).toEqual(['Alpha', 'Beta', 'Gamma']);
        });

        it('moves the selected option to the top when pullSelectedToTop is true', async () => {
            wrapper = await mount(OctopusSelect, {
                props: { options, optionLabel: 'name', value: options[1], pullSelectedToTop: true },
            });
            await wrapper.find('input').trigger('focus');
            expect(getOptionLabels()).toEqual(['Beta', 'Alpha', 'Gamma']);
        });

        it('does not reorder while the dropdown stays open as the value changes', async () => {
            wrapper = await mount(OctopusSelect, {
                props: { options, optionLabel: 'name', pullSelectedToTop: true },
            });
            await wrapper.find('input').trigger('focus');
            await wrapper.setProps({ value: options[2] });
            expect(getOptionLabels()).toEqual(['Alpha', 'Beta', 'Gamma']);
        });

        it('re-pins using the latest value after closing and reopening', async () => {
            wrapper = await mount(OctopusSelect, {
                props: { options, optionLabel: 'name', value: options[2], pullSelectedToTop: true },
            });
            await wrapper.find('input').trigger('focus');
            await clickOutside();
            await wrapper.find('input').trigger('focus');
            expect(getOptionLabels()).toEqual(['Gamma', 'Alpha', 'Beta']);
        });

        it('pins by optionKey even when the value is a different reference', async () => {
            const value = { id: 2, name: 'Beta' };
            wrapper = await mount(OctopusSelect, {
                props: { options, optionLabel: 'name', optionKey: 'id', value, pullSelectedToTop: true },
            });
            await wrapper.find('input').trigger('focus');
            expect(getOptionLabels()).toEqual(['Beta', 'Alpha', 'Gamma']);
        });

        it('still respects the active search filter when pinning', async () => {
            wrapper = await mount(OctopusSelect, {
                props: { options, optionLabel: 'name', value: options[2], pullSelectedToTop: true },
            });
            await wrapper.find('input').trigger('focus');
            await wrapper.find('input').setValue('be');
            await wrapper.find('input').trigger('input');
            expect(getOptionLabels()).toEqual(['Beta']);
        });
    });
});
