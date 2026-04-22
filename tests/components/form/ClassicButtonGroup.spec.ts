import ClassicButtonGroup from '@/components/form/ClassicButtonGroup.vue';
import { mount } from '@tests/utils';
import { describe, expect, it } from 'vitest';

const options = [
    { label: 'Audio', value: 'PODCAST' },
    { label: 'Video', value: 'VIDEO' },
    { label: 'Live', value: 'LIVE' },
];

describe('ClassicButtonGroup', () => {
    it('renders one button per option', async () => {
        const wrapper = await mount(ClassicButtonGroup, {
            props: { options, modelValue: ['PODCAST'] },
        });
        expect(wrapper.findAll('button')).toHaveLength(3);
    });

    it('applies active class to selected options only', async () => {
        const wrapper = await mount(ClassicButtonGroup, {
            props: { options, modelValue: ['PODCAST', 'LIVE'] },
        });
        const buttons = wrapper.findAll('button');
        expect(buttons[0].classes()).toContain('active');
        expect(buttons[1].classes()).not.toContain('active');
        expect(buttons[2].classes()).toContain('active');
    });

    it('emits update:modelValue with added value when clicking inactive button', async () => {
        const wrapper = await mount(ClassicButtonGroup, {
            props: { options, modelValue: ['PODCAST'] },
        });
        await wrapper.findAll('button')[1].trigger('click');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['PODCAST', 'VIDEO']]);
    });

    it('emits update:modelValue without removed value when clicking active button (not last)', async () => {
        const wrapper = await mount(ClassicButtonGroup, {
            props: { options, modelValue: ['PODCAST', 'VIDEO'] },
        });
        await wrapper.findAll('button')[0].trigger('click');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['VIDEO']]);
    });

    it('does not emit when clicking the only active button', async () => {
        const wrapper = await mount(ClassicButtonGroup, {
            props: { options, modelValue: ['PODCAST'] },
        });
        await wrapper.findAll('button')[0].trigger('click');
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });
});
