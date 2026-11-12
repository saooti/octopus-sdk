import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import ClassicEmojiPicker from '@/components/form/ClassicEmojiPicker.vue';
import ClassicPopover from '@/components/misc/ClassicPopover.vue';
import { mount, VueWrapper } from '@tests/utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';

describe('ClassicEmojiPicker', () => {
    let wrappers: Array<VueWrapper> = [];

    afterEach(() => {
        wrappers.forEach((wrapper) => wrapper.unmount());
        wrappers = [];
    });

    // Returns the trigger button id, and the popover target
    const mountPicker = async (id?: string) => {
        const wrapper = await mount(ClassicEmojiPicker, { shallow: true, props: id ? { id } : {} });
        wrappers.push(wrapper);
        return {
            buttonId: wrapper.find('button').attributes('id'),
            target: wrapper.findComponent(ClassicPopover).props('target')
        };
    };

    it('binds the popover to its own button', async () => {
        const { buttonId, target } = await mountPicker();

        expect(buttonId).toBeTruthy();
        expect(target).toBe(buttonId);
    });

    // useId is unique per app: both pickers must be in the same one, like in a page
    it('generates a unique id for each instance', async () => {
        const Parent = defineComponent(() => () => [h(ClassicEmojiPicker), h(ClassicEmojiPicker)]);
        const wrapper = await mount(Parent, { stubs: { ClassicPopover: true, Picker: true } });
        wrappers.push(wrapper);
        const [first, second] = wrapper.findAll('button').map((button) => button.attributes('id'));

        expect(first).not.toBe(second);
    });

    it('uses the given id', async () => {
        const { buttonId, target } = await mountPicker('comment');

        expect(buttonId).toBe('emoji-picker-dropdowncomment');
        expect(target).toBe(buttonId);
    });
});
