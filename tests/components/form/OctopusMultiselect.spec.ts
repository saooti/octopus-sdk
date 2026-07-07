import '@tests/mocks/i18n';

import OctopusMultiselect from '@/components/form/OctopusMultiselect.vue';
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
    return document.body.querySelector('.octopus-multiselect-dropdown');
}

function getOptionLabels(): (string | undefined)[] {
    return Array.from(document.body.querySelectorAll('.octopus-multiselect-options label'))
        .map((l) => l.textContent?.trim());
}

// Simulates a click outside the component to trigger onClickOutside's closeDropdown.
async function clickOutside(): Promise<void> {
    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);
    outsideElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await nextTick();
    document.body.removeChild(outsideElement);
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

    describe('pullSelectedToTop', () => {
        it('does not reorder options when pullSelectedToTop is not set', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options, optionLabel: 'name', selected: [options[1]] },
            });
            await wrapper.find('input').trigger('focus');
            expect(getOptionLabels()).toEqual(['Alpha', 'Beta', 'Gamma']);
        });

        it('moves the selected option to the top when pullSelectedToTop is true', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options, optionLabel: 'name', selected: [options[1]], pullSelectedToTop: true },
            });
            await wrapper.find('input').trigger('focus');
            expect(getOptionLabels()).toEqual(['Beta', 'Alpha', 'Gamma']);
        });

        it('preserves relative order within pinned and unpinned groups', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options, optionLabel: 'name', selected: [options[2], options[0]], pullSelectedToTop: true },
            });
            await wrapper.find('input').trigger('focus');
            expect(getOptionLabels()).toEqual(['Alpha', 'Gamma', 'Beta']);
        });

        it('does not reorder while the dropdown stays open as selection changes', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options, optionLabel: 'name', selected: [], pullSelectedToTop: true },
            });
            await wrapper.find('input').trigger('focus');
            const optionCheckboxes = document.body.querySelectorAll('.octopus-multiselect-options input[type="checkbox"]');
            await new DOMWrapper(optionCheckboxes[2] as Element).trigger('input');
            await wrapper.setProps({ selected: [options[2]] });
            expect(getOptionLabels()).toEqual(['Alpha', 'Beta', 'Gamma']);
        });

        it('re-pins using the latest selection after closing and reopening', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options, optionLabel: 'name', selected: [options[2]], pullSelectedToTop: true },
            });
            await wrapper.find('input').trigger('focus');
            await clickOutside();
            await wrapper.find('input').trigger('focus');
            expect(getOptionLabels()).toEqual(['Gamma', 'Alpha', 'Beta']);
        });

        it('pins by optionKey even when selected objects are different references', async () => {
            const selected = [{ id: 2, name: 'Beta' }];
            wrapper = await mount(OctopusMultiselect, {
                props: { options, optionLabel: 'name', optionKey: 'id', selected, pullSelectedToTop: true },
            });
            await wrapper.find('input').trigger('focus');
            expect(getOptionLabels()).toEqual(['Beta', 'Alpha', 'Gamma']);
        });

        it('still respects the active search filter when pinning', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options, optionLabel: 'name', selected: [options[2]], pullSelectedToTop: true },
            });
            await wrapper.find('input').trigger('focus');
            await wrapper.find('input').setValue('be');
            await wrapper.find('input').trigger('input');
            expect(getOptionLabels()).toEqual(['Beta']);
        });

        it('keeps a selected custom value pinned alongside allowCustomValue', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: {
                    options: ['Alpha', 'Beta', 'Gamma'],
                    selected: ['Delta'],
                    allowCustomValue: true,
                    pullSelectedToTop: true,
                },
            });
            await wrapper.find('input').trigger('focus');
            expect(getOptionLabels()).toEqual(['Delta', 'Alpha', 'Beta', 'Gamma']);
        });
    });

    describe('with string options', () => {
        const stringOptions = ['Alpha', 'Beta', 'Gamma'];

        it('uses each string as its own label without optionLabel', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions },
            });
            await wrapper.find('input').trigger('focus');
            const labels = document.body.querySelectorAll('.octopus-multiselect-options label');
            expect(Array.from(labels).map((l) => l.textContent?.trim())).toEqual(stringOptions);
        });

        it('emits update:selected when toggling a string option', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions, selected: [] },
            });
            await wrapper.find('input').trigger('focus');
            const optionCheckboxes = document.body.querySelectorAll('.octopus-multiselect-options input[type="checkbox"]');
            await new DOMWrapper(optionCheckboxes[0] as Element).trigger('input');
            expect(wrapper.emitted('update:selected')?.[0]).toEqual([['Alpha']]);
        });

        it('deselects an already-selected string option', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions, selected: ['Alpha'] },
            });
            await wrapper.find('input').trigger('focus');
            const optionCheckboxes = document.body.querySelectorAll('.octopus-multiselect-options input[type="checkbox"]');
            await new DOMWrapper(optionCheckboxes[0] as Element).trigger('input');
            expect(wrapper.emitted('update:selected')?.[0]).toEqual([[]]);
        });

        it('filters string options locally by search query', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions },
            });
            await wrapper.find('input').trigger('focus');
            await wrapper.find('input').setValue('al');
            await wrapper.find('input').trigger('input');
            const checkboxes = document.body.querySelectorAll('.octopus-multiselect-options input[type="checkbox"]');
            expect(checkboxes).toHaveLength(1);
        });

        it('toggleAll selects all displayed string options', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions, selected: [] },
            });
            await wrapper.find('input').trigger('focus');
            const allCheckbox = document.body.querySelector('.octopus-multiselect-dropdown > .octopus-form-item input[type="checkbox"]')!;
            await new DOMWrapper(allCheckbox).trigger('input');
            expect(wrapper.emitted('update:selected')?.[0]).toEqual([stringOptions]);
        });

        it('shows selected strings in the selection display', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions, selected: ['Alpha', 'Beta'] },
            });
            expect(wrapper.find('.octopus-multiselect-selection-text').text()).toBe('Alpha, Beta');
        });

        it('adds typed value as a new selection on Enter when allowCustomValue is true', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions, selected: [], allowCustomValue: true },
            });
            await wrapper.find('input').trigger('focus');
            await wrapper.find('input').setValue('Delta');
            await wrapper.find('input').trigger('keydown.enter');
            expect(wrapper.emitted('update:selected')?.[0]).toEqual([['Delta']]);
        });

        it('does not add typed value on Enter when allowCustomValue is not set', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions, selected: [] },
            });
            await wrapper.find('input').trigger('focus');
            await wrapper.find('input').setValue('Delta');
            await wrapper.find('input').trigger('keydown.enter');
            expect(wrapper.emitted('update:selected')).toBeUndefined();
        });

        it('does not add an empty or whitespace-only value on Enter', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions, selected: [], allowCustomValue: true },
            });
            await wrapper.find('input').trigger('focus');
            await wrapper.find('input').setValue('   ');
            await wrapper.find('input').trigger('keydown.enter');
            expect(wrapper.emitted('update:selected')).toBeUndefined();
        });

        it('does not duplicate an already-selected value on Enter', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions, selected: ['Alpha'], allowCustomValue: true },
            });
            await wrapper.find('input').trigger('focus');
            await wrapper.find('input').setValue('Alpha');
            await wrapper.find('input').trigger('keydown.enter');
            expect(wrapper.emitted('update:selected')).toBeUndefined();
        });

        it('clears the search input after adding a custom value on Enter', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions, selected: [], allowCustomValue: true },
            });
            await wrapper.find('input').trigger('focus');
            await wrapper.find('input').setValue('Delta');
            await wrapper.find('input').trigger('keydown.enter');
            expect((wrapper.find('input').element as HTMLInputElement).value).toBe('');
        });

        it('shows a previously added custom value as a checked option in the dropdown', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions, selected: ['Delta'], allowCustomValue: true },
            });
            await wrapper.find('input').trigger('focus');
            const labels = Array.from(document.body.querySelectorAll('.octopus-multiselect-options label'))
                .map((l) => l.textContent?.trim());
            expect(labels).toContain('Delta');
            const checkboxes = document.body.querySelectorAll('.octopus-multiselect-options input[type="checkbox"]');
            expect((checkboxes[labels.indexOf('Delta')] as HTMLInputElement).checked).toBe(true);
        });

        it('shows the checkbox for a value right after it is added via Enter', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions, selected: [], allowCustomValue: true },
            });
            await wrapper.find('input').trigger('focus');
            await wrapper.find('input').setValue('Delta');
            await wrapper.find('input').trigger('keydown.enter');
            const emittedSelected = wrapper.emitted('update:selected')?.[0]?.[0] as string[];
            await wrapper.setProps({ selected: emittedSelected });
            const labels = Array.from(document.body.querySelectorAll('.octopus-multiselect-options label'))
                .map((l) => l.textContent?.trim());
            expect(labels).toContain('Delta');
        });

        it('does not show out-of-options selected values in the dropdown when allowCustomValue is not set', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions, selected: ['Delta'] },
            });
            await wrapper.find('input').trigger('focus');
            const labels = Array.from(document.body.querySelectorAll('.octopus-multiselect-options label'))
                .map((l) => l.textContent?.trim());
            expect(labels).not.toContain('Delta');
        });

        it('deselects a custom value when its checkbox in the dropdown is toggled off', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions, selected: ['Alpha', 'Delta'], allowCustomValue: true },
            });
            await wrapper.find('input').trigger('focus');
            const checkboxes = document.body.querySelectorAll('.octopus-multiselect-options input[type="checkbox"]');
            // visibleOptions = [Alpha, Beta, Gamma, Delta] — Delta is the appended custom entry
            await new DOMWrapper(checkboxes[3] as Element).trigger('input');
            expect(wrapper.emitted('update:selected')?.[0]).toEqual([['Alpha']]);
        });

        it('toggleAll includes an already-selected custom value shown in the dropdown', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions, selected: ['Delta'], allowCustomValue: true },
            });
            await wrapper.find('input').trigger('focus');
            const allCheckbox = document.body.querySelector('.octopus-multiselect-dropdown > .octopus-form-item input[type="checkbox"]')!;
            await new DOMWrapper(allCheckbox).trigger('input');
            const emitted = wrapper.emitted('update:selected')?.[0]?.[0] as string[];
            expect(emitted).toHaveLength(4);
            expect(emitted).toEqual(expect.arrayContaining(['Alpha', 'Beta', 'Gamma', 'Delta']));
        });

        it('shows a hint to press Enter when allowCustomValue is true and text is typed', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions, allowCustomValue: true },
            });
            await wrapper.find('input').trigger('focus');
            await wrapper.find('input').setValue('Delta');
            await wrapper.find('input').trigger('input');
            const hints = Array.from(document.body.querySelectorAll('.octopus-multiselect-options .text-indic'))
                .map((el) => el.textContent?.trim());
            expect(hints).toContain('Press Enter to add this value');
        });

        it('does not show the Enter hint when allowCustomValue is not set', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions },
            });
            await wrapper.find('input').trigger('focus');
            await wrapper.find('input').setValue('Delta');
            await wrapper.find('input').trigger('input');
            const hints = Array.from(document.body.querySelectorAll('.octopus-multiselect-options .text-indic'))
                .map((el) => el.textContent?.trim());
            expect(hints).not.toContain('Press Enter to add this value');
        });

        it('does not show the Enter hint when the search input is empty', async () => {
            wrapper = await mount(OctopusMultiselect, {
                props: { options: stringOptions, allowCustomValue: true },
            });
            await wrapper.find('input').trigger('focus');
            const hints = Array.from(document.body.querySelectorAll('.octopus-multiselect-options .text-indic'))
                .map((el) => el.textContent?.trim());
            expect(hints).not.toContain('Press Enter to add this value');
        });
    });
});
