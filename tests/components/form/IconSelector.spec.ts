import { describe, expect, it } from 'vitest';

import IconSelector from '@/components/form/IconSelector.vue';
import { useSelectableIcons } from '@/components/composable/useSelectableIcons';
import { mount } from '@tests/utils';

const iconNames = Object.keys(useSelectableIcons().Icons);

describe('IconSelector', () => {
    it('renders one button per icon, titled with its name', async () => {
        const wrapper = await mount(IconSelector);
        const titles = wrapper.findAll('button').map(b => b.attributes('title'));
        expect(titles).toEqual(iconNames);
    });

    it('applies selected class only to the selected icon', async () => {
        const wrapper = await mount(IconSelector, { props: { selected: 'Star' } });
        const selected = wrapper.findAll('button.selected');
        expect(selected).toHaveLength(1);
        expect(selected[0].attributes('title')).toBe('Star');
    });

    it('has no selected button when no icon is selected', async () => {
        const wrapper = await mount(IconSelector);
        expect(wrapper.findAll('button.selected')).toHaveLength(0);
    });

    it('emits update:selected with the clicked icon name', async () => {
        const wrapper = await mount(IconSelector);
        await wrapper.find('button[title="Rocket"]').trigger('click');
        expect(wrapper.emitted('update:selected')?.[0]).toEqual(['Rocket']);
    });
});
