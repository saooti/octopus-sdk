import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import ClassicHelpButton from '@/components/misc/ClassicHelpButton.vue';
import { mount, VueWrapper } from '@tests/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('ClassicHelpButton', () => {
    let appElement: HTMLElement;
    let wrapper: VueWrapper | undefined;

    beforeEach(() => {
        // The popover is teleported to #app
        appElement = document.createElement('div');
        appElement.id = 'app';
        document.body.appendChild(appElement);
    });

    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
        appElement.remove();
    });

    async function mountComp(label?: string): Promise<VueWrapper> {
        wrapper = await mount(ClassicHelpButton, {
            props: { label },
            slots: { default: 'Help message' },
            attachTo: document.body
        });
        return wrapper;
    }

    it('has a default accessible name and does not submit forms', async () => {
        const button = (await mountComp()).find('button');

        expect(button.attributes('type')).toBe('button');
        expect(button.attributes('aria-label')).toBe('Help');
    });

    it('uses the label as accessible name', async () => {
        const button = (await mountComp('About this option')).find('button');

        expect(button.attributes('aria-label')).toBe('About this option');
    });

    it('is described by the popover content', async () => {
        const button = (await mountComp()).find('button');

        const description = document.getElementById(button.attributes('aria-describedby')!);
        expect(description?.textContent).toContain('Help message');
    });
});
