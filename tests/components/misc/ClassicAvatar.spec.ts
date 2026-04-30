import ClassicAvatar from '@/components/misc/ClassicAvatar.vue';
import { mount } from '@tests/utils';
import { describe, expect, it } from 'vitest';

const IMAGE_URL = 'https://example.com/avatar.png';

describe('ClassicAvatar', () => {
    const mountAvatar = async (props: Record<string, unknown> = {}) =>
        mount(ClassicAvatar, { props: { name: 'Spotify', ...props } });

    describe('image rendering', () => {
        it('renders an img with correct src when imageUrl is provided', async () => {
            const wrapper = await mountAvatar({ imageUrl: IMAGE_URL });
            expect(wrapper.find('img').exists()).toBe(true);
            expect(wrapper.find('img').attributes('src')).toContain('example.com');
        });

        it('does not render an img without imageUrl', async () => {
            const wrapper = await mountAvatar();
            expect(wrapper.find('img').exists()).toBe(false);
        });
    });

    describe('initial letter fallback', () => {
        it('shows the first letter uppercased', async () => {
            const wrapper = await mountAvatar({ name: 'spotify' });
            expect(wrapper.text()).toBe('S');
        });

        it('shows ? when name is empty', async () => {
            const wrapper = await mountAvatar({ name: '' });
            expect(wrapper.text()).toBe('?');
        });
    });

    describe('container style', () => {
        it('applies size-based dimensions and font-size from size prop', async () => {
            const wrapper = await mountAvatar({ size: 48 });
            const style = (wrapper.element as HTMLElement).style;
            expect(style.height).toBe('48px');
            expect(style.width).toBe('48px');
            expect(style.fontSize).toBe('24px');
        });

        it('defaults to 24px size and applies a background-color', async () => {
            const wrapper = await mountAvatar();
            const style = (wrapper.element as HTMLElement).style;
            expect(style.height).toBe('24px');
            expect(style.width).toBe('24px');
            expect(style.fontSize).toBe('12px');
            expect(style.backgroundColor).toBeTruthy();
        });
    });

    describe('accessibility', () => {
        it('is aria-hidden and has empty alt on img when decorative', async () => {
            const wrapper = await mountAvatar({ imageUrl: IMAGE_URL });
            expect(wrapper.attributes('aria-hidden')).toBe('true');
            expect(wrapper.find('img').attributes('alt')).toBe('');
        });

        it('is not aria-hidden and uses name as alt on img when nonDecorative', async () => {
            const wrapper = await mountAvatar({ imageUrl: IMAGE_URL, nonDecorative: true });
            expect(wrapper.attributes('aria-hidden')).not.toBe('true');
            expect(wrapper.find('img').attributes('alt')).toBe('Spotify');
        });
    });
});
