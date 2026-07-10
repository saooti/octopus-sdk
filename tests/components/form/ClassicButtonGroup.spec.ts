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
            props: { options, value: ['PODCAST'] },
        });
        expect(wrapper.findAll('button')).toHaveLength(3);
    });

    it('applies active class to selected options only', async () => {
        const wrapper = await mount(ClassicButtonGroup, {
            props: { options, value: ['PODCAST', 'LIVE'] },
        });
        const buttons = wrapper.findAll('button');
        expect(buttons[0].classes()).toContain('active');
        expect(buttons[1].classes()).not.toContain('active');
        expect(buttons[2].classes()).toContain('active');
    });

    it('emits update:value with added value when clicking inactive button', async () => {
        const wrapper = await mount(ClassicButtonGroup, {
            props: { options, value: ['PODCAST'] },
        });
        await wrapper.findAll('button')[1].trigger('click');
        expect(wrapper.emitted('update:value')?.[0]).toEqual([['PODCAST', 'VIDEO']]);
    });

    it('emits update:value without removed value when clicking active button (not last)', async () => {
        const wrapper = await mount(ClassicButtonGroup, {
            props: { options, value: ['PODCAST', 'VIDEO'] },
        });
        await wrapper.findAll('button')[0].trigger('click');
        expect(wrapper.emitted('update:value')?.[0]).toEqual([['VIDEO']]);
    });

    it('does not emit when clicking the only active button', async () => {
        const wrapper = await mount(ClassicButtonGroup, {
            props: { options, value: ['PODCAST'] },
        });
        await wrapper.findAll('button')[0].trigger('click');
        expect(wrapper.emitted('update:value')).toBeUndefined();
    });

    describe('solo prop', () => {
        it('emits only the clicked value when clicking an inactive button', async () => {
            const wrapper = await mount(ClassicButtonGroup, {
                props: { options, value: ['PODCAST'], solo: true },
            });
            await wrapper.findAll('button')[1].trigger('click');
            expect(wrapper.emitted('update:value')?.[0]).toEqual([['VIDEO']]);
        });

        it('emits only the clicked value when clicking the already active button', async () => {
            const wrapper = await mount(ClassicButtonGroup, {
                props: { options, value: ['PODCAST'], solo: true },
            });
            await wrapper.findAll('button')[0].trigger('click');
            expect(wrapper.emitted('update:value')?.[0]).toEqual([['PODCAST']]);
        });

        it('replaces multiple active values with the clicked one', async () => {
            const wrapper = await mount(ClassicButtonGroup, {
                props: { options, value: ['PODCAST', 'VIDEO'], solo: true },
            });
            await wrapper.findAll('button')[2].trigger('click');
            expect(wrapper.emitted('update:value')?.[0]).toEqual([['LIVE']]);
        });
    });
});
