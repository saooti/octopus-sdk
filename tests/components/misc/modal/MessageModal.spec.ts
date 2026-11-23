import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import MessageModal from '@/components/misc/modal/MessageModal.vue';
import { mount, VueWrapper } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

const MESSAGE = '<img src=x onerror=alert(1)> See https://example.com/a?b=1&c=2';

describe('MessageModal', () => {
    async function mountComp(html = false): Promise<VueWrapper> {
        return mount(MessageModal, {
            props: { message: MESSAGE, html },
            stubs: {
                ClassicModal: { template: '<div><slot name="body" /></div>' }
            }
        });
    }

    it('escapes the message by default, but still converts URLs to links', async () => {
        const content = (await mountComp()).find('.content');

        expect(content.find('img').exists()).toBe(false);
        expect(content.text()).toContain('<img src=x onerror=alert(1)>');
        // urlify keeps the character before the URL in the href (trimmed by browsers)
        expect(content.find('a').attributes('href')?.trim()).toBe('https://example.com/a?b=1&c=2');
    });

    it('renders the message as HTML when html is set', async () => {
        const content = (await mountComp(true)).find('.content');

        expect(content.find('img').exists()).toBe(true);
    });
});
