import '@tests/mocks/useRouter';

import ClassicPopover from '@/components/misc/ClassicPopover.vue';
import { mount as testMount, VueWrapper } from '@tests/utils';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';

describe('ClassicPopover', () => {
    let targetElement: HTMLElement;
    let appElement: HTMLElement;
    let wrapper: VueWrapper | undefined;

    beforeEach(() => {
        appElement = document.createElement('div');
        appElement.id = 'app';
        document.body.appendChild(appElement);

        targetElement = document.createElement('button');
        targetElement.id = 'test-target';
        targetElement.textContent = 'Trigger';
        document.body.appendChild(targetElement);
    });

    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
        if (targetElement?.parentNode) {
            targetElement.parentNode.removeChild(targetElement);
        }
        if (appElement?.parentNode) {
            appElement.parentNode.removeChild(appElement);
        }
    });

    // The popover is teleported to #app; retrieve it by its deterministic id.
    const getPopoverEl = (): HTMLElement =>
        document.getElementById('popovertest-target') as HTMLElement;

    // Helper: Check if popover is visible
    const isVisible = (): boolean => {
        const element = getPopoverEl();
        if (!element) return false;
        return element.style.display !== 'none' &&
               window.getComputedStyle(element).display !== 'none';
    };

    // Helper: Mount popover with default props
    const mount = async (props: Record<string, unknown> = {}) => {
        wrapper = await testMount(ClassicPopover, {
            props: {
                target: 'test-target',
                content: 'Test content',
                ...props
            }
        });
        return wrapper;
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
            await mount();

            expect(isVisible()).toBe(false);

            await openViaHover();
            expect(isVisible()).toBe(true);

            await closeViaHover();
            expect(isVisible()).toBe(false);
        });

        it('stays open when mouse moves from target to popover content', async () => {
            await mount();

            await openViaHover();
            expect(isVisible()).toBe(true);

            // Mouse enters popover
            getPopoverEl().dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            await nextTick();

            // Leave target
            await closeViaHover();

            // Should still be open because mouse is over popover
            expect(isVisible()).toBe(true);
        });

        it('closes when mouse leaves popover content', async () => {
            await mount();

            await openViaHover();

            // Move to popover
            getPopoverEl().dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            await nextTick();

            // Leave popover
            getPopoverEl().dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
            await nextTick();

            expect(isVisible()).toBe(false);
        });

        it('closes via mouseleave even after clicking the target', async () => {
            await mount();

            await openViaHover();
            expect(isVisible()).toBe(true);

            // Click the target (sets isClick to true)
            await openViaClick();
            expect(isVisible()).toBe(true);

            // Leave with mouse
            await closeViaHover();

            // Should be closed because it was opened by hover
            expect(isVisible()).toBe(false);
        });
    });

    describe('click behavior (onlyClick=true)', () => {
        it('opens on click of target', async () => {
            await mount({ onlyClick: true });

            expect(isVisible()).toBe(false);

            await openViaClick();
            expect(isVisible()).toBe(true);
        });

        it('does not open on mouseenter when onlyClick is true', async () => {
            await mount({ onlyClick: true });

            await openViaHover();

            expect(isVisible()).toBe(false);
        });

        it('stays open when clicking inside popover', async () => {
            await mount({ onlyClick: true });

            await openViaClick();
            expect(isVisible()).toBe(true);

            // Click inside popover
            const insideElement = document.createElement('button');
            getPopoverEl().appendChild(insideElement);
            insideElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await nextTick();

            expect(isVisible()).toBe(true);
        });

        it('closes when clicking outside both popover and target', async () => {
            await mount({ onlyClick: true });

            await openViaClick();
            expect(isVisible()).toBe(true);

            await clickOutside();

            expect(isVisible()).toBe(false);
        });

        it('closes when clicking inside popover then clicking outside', async () => {
            await mount({ onlyClick: true });

            await openViaClick();
            expect(isVisible()).toBe(true);

            // Click inside popover
            const insideButton = document.createElement('button');
            getPopoverEl().appendChild(insideButton);
            insideButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await nextTick();

            expect(isVisible()).toBe(true);

            // Click outside
            await clickOutside();

            expect(isVisible()).toBe(false);
        });

        it('toggles when clicking target while already open', async () => {
            await mount({ onlyClick: true });

            await openViaClick();
            expect(isVisible()).toBe(true);

            // Click target again
            await openViaClick();

            expect(isVisible()).toBe(false);
        });
    });

    describe('mixed behavior (onlyMouse=false, onlyClick=false)', () => {
        it('can open via hover or click', async () => {
            await mount({ onlyClick: false, onlyMouse: false });

            // Open via hover
            await openViaHover();
            expect(isVisible()).toBe(true);

            // Close
            await closeViaHover();
            expect(isVisible()).toBe(false);

            // Open via click
            await openViaClick();
            expect(isVisible()).toBe(true);
        });
    });

    describe('expose clearClick method', () => {
        it('exposes clearClick method to close popover programmatically', async () => {
            await mount();

            await openViaHover();
            expect(isVisible()).toBe(true);

            // Close programmatically
            (wrapper!.vm as unknown as { clearClick: () => void }).clearClick();
            await nextTick();

            expect(isVisible()).toBe(false);
        });
    });
});
