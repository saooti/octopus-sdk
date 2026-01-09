import { Component } from 'vue';
import { vi } from 'vitest';
import { mount as _mount, VueWrapper } from '@vue/test-utils';

/** Mock function for localisation */
export function localisation(str: string, options?: Record<string,string>): string {
    let result = str;
    if (options) {
        Object.entries(options).forEach(([key, value]) => {
            result += ` ${key}:${value}`;
        });
    }
    return result;
}

/**
 * Utility function to mount a component for testing.
 * This should be used in place of vue-test-utils' `mount` function.
 * This sets sensible defaults for this project, reducing code that has to be
 * written in tests.
 * This will also ensure that dynamic imports are resolved so as to avoid
 * test issues due to subcomponents being loaded.
 * @param component The component to mount
 * @param options Options for configuring the mounting
 * @returns A wrapper for the component
 */
export async function mount(component: Component, options?: {
        /** Use shallow mounting (do not mount subcomponents) */
        shallow?: boolean,
        /** Props to set on the component */
        props?: Record<string, unknown>,
        /** Stub subcomponents */
        stubs?: Record<string, Component|boolean>|string[]
    }): Promise<VueWrapper> {

    // Component stubbing
    const stubs: Record<string, Component|boolean> = {
        'router-link': true
    };
    if (options?.stubs !== undefined) {
        if (Array.isArray(options?.stubs)) {
            options.stubs.forEach(stub => {
                stubs[stub] = true
            });
        } else {
            Object.entries(options.stubs).forEach(([key, value]) => {
                stubs[key] = value;
            });
        }
    }

    // Mount component
    const wrapper = _mount(component, {
        global: {
            mocks: {
                $t: localisation,
                usePlayerStore: vi.fn()
            },
            stubs
        },
        props: options?.props,
        shallow: options?.shallow
    });

    // Wait for dynamic imports
    await vi.dynamicImportSettled();

    // Return wrapper
    return wrapper;
}

const fetchData = vi.fn();
fetchData.mockReturnValue(Promise.resolve());

export { VueWrapper };
