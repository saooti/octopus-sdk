import ClassicColorPicker from '@/components/form/ClassicColorPicker.vue';
import { mount, VueWrapper } from '@tests/utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

describe('ClassicColorPicker', () => {
    let wrapper: VueWrapper | undefined;
    const onUpdate = vi.fn();

    afterEach(() => {
        wrapper?.unmount();
        onUpdate.mockReset();
    });

    // Mounts the picker and opens it
    const open = async () => {
        wrapper = await mount(ClassicColorPicker, {
            props: { modelValue: '#2ECC70', label: 'QR Code color', 'onUpdate:modelValue': onUpdate },
            attachTo: document.body
        });
        await wrapper.find('button').trigger('click');
        await nextTick();
        return wrapper.find('button').element;
    };
    const getSwatches = () => wrapper!.findAll<HTMLElement>('.vue-swatches__swatch').map((swatch) => swatch.element as HTMLElement);
    const press = (element: Element, type: 'keydown' | 'keyup', key: string) => {
        const event = new KeyboardEvent(type, { key, bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        return event;
    };

    it('has a labelled trigger button reflecting its state', async () => {
        const trigger = await open();

        expect(trigger.getAttribute('aria-label')).toBe('QR Code color');
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });

    it('focuses the selected swatch when opened', async () => {
        await open();

        expect(document.activeElement).toBe(getSwatches()[2]);
    });

    it('selects a swatch with Space without scrolling, then focuses the trigger', async () => {
        const trigger = await open();
        const swatch = getSwatches()[1];
        swatch.focus();

        expect(press(swatch, 'keydown', ' ').defaultPrevented).toBe(true);
        press(swatch, 'keyup', ' ');
        await nextTick();
        await nextTick();

        expect(onUpdate).toHaveBeenCalledOnce();
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
        expect(document.activeElement).toBe(trigger);
    });

    it('closes with Escape without closing its container, then focuses the trigger', async () => {
        const trigger = await open();

        const event = press(getSwatches()[0], 'keydown', 'Escape');
        await nextTick();
        await nextTick();

        expect(event.defaultPrevented).toBe(true);
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
        expect(document.activeElement).toBe(trigger);
    });
});
