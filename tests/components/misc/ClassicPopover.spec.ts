import { mockUseRouter } from '@tests/mocks';
const routerPush = vi.hoisted(() => vi.fn());
vi.mock('vue-router', () => {
    const mock = mockUseRouter();
    return { ...mock, useRouter: () => ({ ...mock.useRouter(), push: routerPush }) };
});

import ClassicPopover from '@/components/misc/ClassicPopover.vue';
import { mount as testMount, VueWrapper } from '@tests/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
        if (!element) {return false;}
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

    describe('focusout navigation to dropdown item', () => {
        it('keeps query and hash when navigating to the focused link', async () => {
            await mount({ onlyClick: true });
            await openViaClick();

            const link = document.createElement('a');
            link.href = '/page?foo=bar#anchor';
            link.className = 'octopus-dropdown-item';
            getPopoverEl().appendChild(link);

            targetElement.dispatchEvent(new FocusEvent('focusout', { relatedTarget: link }));

            expect(routerPush).toHaveBeenCalledWith('/page?foo=bar#anchor');
        });
    });

    describe('keyboard navigation (onlyClick=true)', () => {
        const mountMenu = async () => {
            wrapper = await testMount(ClassicPopover, {
                props: { target: 'test-target', onlyClick: true },
                slots: {
                    default: '<a href="/first" class="octopus-dropdown-item">First</a>'
                        + '<button class="octopus-dropdown-item">Last</button>'
                }
            });
            targetElement.focus();
        };
        const getItems = () => getPopoverEl().querySelectorAll<HTMLElement>('.octopus-dropdown-item');
        const pressKey = async (element: Element, key: string, shiftKey = false) => {
            element.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }));
            element.dispatchEvent(new KeyboardEvent('keyup', { key, shiftKey, bubbles: true }));
            await nextTick();
        };

        it('focuses the first item without navigating when opened by keyboard', async () => {
            await mountMenu();
            await openViaClick();
            await nextTick();

            expect(document.activeElement).toBe(getItems()[0]);
            expect(routerPush).not.toHaveBeenCalled();
            expect(isVisible()).toBe(true);
        });

        it('does not move focus when opened by mouse', async () => {
            await mountMenu();
            targetElement.dispatchEvent(new MouseEvent('click', { detail: 1, bubbles: true }));
            await nextTick();
            await nextTick();

            expect(document.activeElement).toBe(targetElement);
        });

        it.each([
            ['Shift+Tab on first item', 0, 'Tab', true],
            ['Tab on last item', 1, 'Tab', false],
            ['Escape', 0, 'Escape', false]
        ])('closes and focuses the target on %s', async (_, index, key, shiftKey) => {
            await mountMenu();
            await openViaClick();
            await nextTick();
            getItems()[index].focus();

            await pressKey(getItems()[index], key, shiftKey);

            expect(isVisible()).toBe(false);
            expect(document.activeElement).toBe(targetElement);
        });

        it('closes and focuses the target when an item is activated by keyboard', async () => {
            await mountMenu();
            await openViaClick();
            await nextTick();

            getItems()[1].dispatchEvent(new MouseEvent('click', { detail: 0, bubbles: true }));
            await nextTick();
            await nextTick();

            expect(isVisible()).toBe(false);
            expect(document.activeElement).toBe(targetElement);
        });

        it('sets aria-controls and aria-expanded on the target', async () => {
            await mountMenu();
            expect(targetElement.getAttribute('aria-controls')).toBe('popovertest-target');
            expect(targetElement.getAttribute('aria-expanded')).toBe('false');

            await openViaClick();
            expect(targetElement.getAttribute('aria-expanded')).toBe('true');
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

    describe('Popover API', () => {
        const showPopover = vi.fn();
        const hidePopover = vi.fn();

        beforeEach(() => {
            vi.clearAllMocks();
            Object.assign(HTMLElement.prototype, { showPopover, hidePopover });
        });

        afterEach(() => {
            const prototype = HTMLElement.prototype as unknown as Record<string, unknown>;
            delete prototype.showPopover;
            delete prototype.hidePopover;
        });

        it('is used to open and close a top layer popover', async () => {
            await mount({ onlyClick: true, isTopLayer: true });

            await openViaClick();
            await nextTick();
            expect(showPopover).toHaveBeenCalledOnce();

            (wrapper!.vm as unknown as { clearClick: () => void }).clearClick();
            await nextTick();
            expect(hidePopover).toHaveBeenCalledOnce();
        });

        it('is not used otherwise', async () => {
            await mount({ onlyClick: true });

            await openViaClick();
            await nextTick();
            expect(showPopover).not.toHaveBeenCalled();
        });
    });
});
