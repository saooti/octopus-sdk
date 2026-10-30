import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import ExternalLink from '@/components/misc/ExternalLink.vue';
import { mount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

const HREF = 'https://example.com';

describe('ExternalLink', () => {
    const mountLink = (props: Record<string, unknown> = {}, slot = 'Example') =>
        mount(ExternalLink, { props: { href: HREF, ...props }, slots: { default: slot } });

    it('opens the url in a new window safely', async () => {
        const link = (await mountLink()).find('a');
        expect(link.attributes('href')).toBe(HREF);
        expect(link.attributes('target')).toBe('_blank');
        expect(link.attributes('rel')).toBe('noopener noreferrer');
    });

    it('appends the new window warning to the visible text', async () => {
        const wrapper = await mountLink();
        expect(wrapper.find('.visually-hidden').text()).toBe('ExternalLink - New window');
        expect(wrapper.text()).toBe('Example ExternalLink - New window');
        expect(wrapper.find('a').attributes('aria-label')).toBeUndefined();
    });

    it('renders a decorative icon by default', async () => {
        const icon = (await mountLink()).find('.external-link-icon');
        expect(icon.attributes('aria-hidden')).toBe('true');
        expect(icon.attributes('role')).toBeUndefined();
    });

    it('hides the icon on demand', async () => {
        const wrapper = await mountLink({ hideIcon: true });
        expect(wrapper.find('.external-link-icon').exists()).toBe(false);
    });

    it('keeps the warning in the name of an image-only link', async () => {
        const wrapper = await mountLink({}, '<img src="logo.png" alt="Logo">');
        expect(wrapper.find('img').attributes('alt')).toBe('Logo');
        expect(wrapper.find('.visually-hidden').text()).toBe('ExternalLink - New window');
    });

    it('appends the warning to a given aria-label', async () => {
        const wrapper = await mountLink({ ariaLabel: 'Example site' });
        expect(wrapper.find('a').attributes('aria-label')).toBe('Example site ExternalLink - New window');
    });
});
