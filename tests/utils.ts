import { Component } from 'vue';
import { vi } from 'vitest';
import { mount as _mount, VueWrapper } from '@vue/test-utils';
import { type Pinia, setActivePinia, createPinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';

import { useAuthStore } from '../src/stores/AuthStore';
import { PlayerStatus, usePlayerStore } from '../src/stores/PlayerStore';
import { Podcast } from '../src/stores/class/general/podcast';

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
        stubs?: Record<string, Component|boolean>|string[],
        /** Hook called before mounting with access to Pinia instance for store initialization */
        beforeMount?: (pinia: Pinia) => void | Promise<void>
    }): Promise<VueWrapper> {

    // Component stubbing
    const stubs: Record<string, Component|boolean> = {
        'router-link': {
            template: '<a><slot /></a>'
        },
        'RouterLink': {
            template: '<a><slot /></a>'
        }
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

    // Create real Pinia instance for testing
    const pinia = createTestingPinia({
        createSpy: vi.fn
    });

    // Call beforeMount hook if provided (allows test to configure stores)
    if (options?.beforeMount) {
        await options.beforeMount(pinia);
    }

    // Mount component with configured Pinia
    const wrapper = _mount(component, {
        global: {
            mocks: {
                $t: localisation,
                usePlayerStore: vi.fn()
            },
            directives: {
                lazy: vi.fn
            },
            plugins: [pinia],
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

/**
 * Helper for AuthStore configuration
 * @returns beforeMount hook function
 */
export function setupAuthStore(config?: {
    roles?: string | string[],
    organisationId?: string,
    organisationName?: string,
    organisationAttributes?: Record<string, string | number | boolean>
}) {
    return async () => {
        const roles = Array.isArray(config?.roles)
            ? config.roles
            : (config?.roles ? [config.roles] : []);

        const orgId = config?.organisationId || "test-org-id";
        const orgName = config?.organisationName || "Test Organisation";

        const authStore = useAuthStore(); // Uses active pinia (no parameter)
        authStore.$patch({
            authRole: roles,
            authOrgaId: orgId,
            authOrgaName: orgName,
            authOrganisation: {
                id: orgId,
                name: orgName,
                imageUrl: "",
                attributes: config?.organisationAttributes || {}
            }
        });
    };
}

/**
 * Helper for PlayerStore configuration
 * @returns beforeMount hook function
 */
export function setupPlayerStore(config?: {
    playerPodcast?: Podcast,
    playerStatus?: PlayerStatus
}) {
    return async () => {
        const playerStore = usePlayerStore(); // Uses active pinia
        playerStore.$patch({
            playerPodcast: config?.playerPodcast,
            playerStatus: config?.playerStatus || PlayerStatus.STOPPED
        });
    };
}

/**
 * Combines multiple store setups into one beforeMount hook
 */
export function combineStoreSetups(...setups: Array<() => void>) {
    return () => {
        setups.forEach(setup => setup());
    };
}

export { VueWrapper };

/**
 * Creates a Pinia instance without mounting a component.
 * Use this for testing composables or APIs directly.
 */
export function setupPinia(setupFn?: () => void | Promise<void>): Pinia {
    const pinia = createPinia();
    setActivePinia(pinia);
    if (setupFn) { setupFn(); }
    return pinia;
}
