import ClassicPopover from '@/components/misc/ClassicPopover.vue';
import { mount as testMount } from '@tests/utils';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';

describe('ClassicPopover', () => {
    let targetElement: HTMLElement;

    beforeEach(() => {
        targetElement = document.createElement('button');
        targetElement.id = 'test-target';
        targetElement.textContent = 'Trigger';
        document.body.appendChild(targetElement);
    });

    afterEach(() => {
        if (targetElement?.parentNode) {
            targetElement.parentNode.removeChild(targetElement);
        }
    });

    // Helper: Check if popover is visible
    const isVisible = (wrapper: any): boolean => {
        const element = wrapper.element as HTMLElement;
        return element.style.display !== 'none' &&
               window.getComputedStyle(element).display !== 'none';
    };

    // Helper: Mount popover with default props
    const mount = async (props: Record<string, any> = {}) => {
        return testMount(ClassicPopover, {
            props: {
                target: 'test-target',
                content: 'Test content',
                ...props
            }
        });
    };

    // Helper: Open popover via hover
    const openViaHover = async () => {
        targetElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        await nextTick();
    };

    // Helper: Open popover via click
    const openViaClick = async () => {
        targetElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await nextTick();
    };

    // Helper: Close via mouseleave with timeout
    const closeViaHover = async () => {
        targetElement.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 600));
    };

    // Helper: Click outside and cleanup
    const clickOutside = async () => {
        const outsideElement = document.createElement('div');
        document.body.appendChild(outsideElement);
        outsideElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        await nextTick();
        document.body.removeChild(outsideElement);
    };

    describe('hover behavior (onlyClick=false, default)', () => {
        it('opens on mouseenter and closes on mouseleave of target', async () => {
            const wrapper = await mount();

            expect(isVisible(wrapper)).toBe(false);

            await openViaHover();
            expect(isVisible(wrapper)).toBe(true);

            await closeViaHover();
            expect(isVisible(wrapper)).toBe(false);
        });

        it('stays open when mouse moves from target to popover content', async () => {
            const wrapper = await mount();

            await openViaHover();
            expect(isVisible(wrapper)).toBe(true);

            // Mouse enters popover
            const popoverElement = wrapper.element as HTMLElement;
            popoverElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            await nextTick();

            // Leave target
            await closeViaHover();

            // Should still be open because mouse is over popover
            expect(isVisible(wrapper)).toBe(true);
        });

        it('closes when mouse leaves popover content', async () => {
            const wrapper = await mount();

            await openViaHover();

            // Move to popover
            const popoverElement = wrapper.element as HTMLElement;
            popoverElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            await nextTick();

            // Leave popover
            popoverElement.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
            await nextTick();

            expect(isVisible(wrapper)).toBe(false);
        });

        it('closes via mouseleave even after clicking the target', async () => {
            const wrapper = await mount();

            await openViaHover();
            expect(isVisible(wrapper)).toBe(true);

            // Click the target (sets isClick to true)
            await openViaClick();
            expect(isVisible(wrapper)).toBe(true);

            // Leave with mouse
            await closeViaHover();

            // Should be closed because it was opened by hover
            expect(isVisible(wrapper)).toBe(false);
        });
    });

    describe('click behavior (onlyClick=true)', () => {
        it('opens on click of target', async () => {
            const wrapper = await mount({ onlyClick: true });

            expect(isVisible(wrapper)).toBe(false);

            await openViaClick();
            expect(isVisible(wrapper)).toBe(true);
        });

        it('does not open on mouseenter when onlyClick is true', async () => {
            const wrapper = await mount({ onlyClick: true });

            await openViaHover();

            expect(isVisible(wrapper)).toBe(false);
        });

        it('stays open when clicking inside popover', async () => {
            const wrapper = await mount({ onlyClick: true });

            await openViaClick();
            expect(isVisible(wrapper)).toBe(true);

            // Click inside popover
            const popoverElement = wrapper.element as HTMLElement;
            const insideElement = document.createElement('button');
            popoverElement.appendChild(insideElement);
            insideElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await nextTick();

            expect(isVisible(wrapper)).toBe(true);
        });

        it('closes when clicking outside both popover and target', async () => {
            const wrapper = await mount({ onlyClick: true });

            await openViaClick();
            expect(isVisible(wrapper)).toBe(true);

            await clickOutside();

            expect(isVisible(wrapper)).toBe(false);
        });

        it('closes when clicking inside popover then clicking outside', async () => {
            const wrapper = await mount({ onlyClick: true });

            await openViaClick();
            expect(isVisible(wrapper)).toBe(true);

            // Click inside popover
            const popoverElement = wrapper.element as HTMLElement;
            const insideButton = document.createElement('button');
            popoverElement.appendChild(insideButton);
            insideButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await nextTick();

            expect(isVisible(wrapper)).toBe(true);

            // Click outside
            await clickOutside();

            expect(isVisible(wrapper)).toBe(false);
        });

        it('toggles when clicking target while already open', async () => {
            const wrapper = await mount({ onlyClick: true });

            await openViaClick();
            expect(isVisible(wrapper)).toBe(true);

            // Click target again
            await openViaClick();

            expect(isVisible(wrapper)).toBe(false);
        });
    });

    describe('mixed behavior (onlyMouse=false, onlyClick=false)', () => {
        it('can open via hover or click', async () => {
            const wrapper = await mount({ onlyClick: false, onlyMouse: false });

            // Open via hover
            await openViaHover();
            expect(isVisible(wrapper)).toBe(true);

            // Close
            await closeViaHover();
            expect(isVisible(wrapper)).toBe(false);

            // Open via click
            await openViaClick();
            expect(isVisible(wrapper)).toBe(true);
        });
    });

    describe('expose clearClick method', () => {
        it('exposes clearClick method to close popover programmatically', async () => {
            const wrapper = await mount();

            await openViaHover();
            expect(isVisible(wrapper)).toBe(true);

            // Close programmatically
            (wrapper.vm as any).clearClick();
            await nextTick();

            expect(isVisible(wrapper)).toBe(false);
        });
    });
});
