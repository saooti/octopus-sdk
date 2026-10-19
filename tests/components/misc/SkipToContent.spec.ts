import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import SkipToContent from '@/components/misc/SkipToContent.vue';
import { mount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

describe('SkipToContent', () => {
    it('links to the main content by default', async () => {
        const wrapper = await mount(SkipToContent);
        expect(wrapper.find('a').attributes('href')).toBe('#main-content');
        expect(wrapper.text()).toBe('Skip to content');
    });

    it('links to the given target', async () => {
        const wrapper = await mount(SkipToContent, { props: { target: 'content' } });
        expect(wrapper.find('a').attributes('href')).toBe('#content');
    });
});
