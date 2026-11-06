import { mockI18n, mockUseRouter } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
vi.mock('vue-router', () => mockUseRouter());

import PresentationItem from '@/components/layouts/PresentationItem.vue';
import { mount as testMount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

const baseProps = {
    route: 'podcast',
    imageUrl: 'https://example.com/img.png',
    name: 'Item name',
};

const mount = (props: Record<string, unknown>) => testMount(PresentationItem, {
    props: { ...baseProps, ...props },
});

describe('PresentationItem', () => {
    describe('additionalInfo', () => {
        it('renders each additionalInfo entry when a description is set', async () => {
            const wrapper = await mount({ description: 'Some description', additionalInfo: ['1 décembre 2025', 'Saooti'] });
            const info = wrapper.findAll('.text-secondary');
            expect(info.map(el => el.text())).toEqual(['1 décembre 2025', 'Saooti']);
        });

        it('does not render additionalInfo when it is not provided', async () => {
            const wrapper = await mount({ description: 'Some description' });
            expect(wrapper.find('.text-secondary').exists()).toBe(false);
        });

        it('renders each additionalInfo even when there is no description', async () => {
            const wrapper = await mount({ additionalInfo: ['Saooti'] });
            expect(wrapper.find('.text-secondary').exists()).toBe(true);
        });
    });

    describe('accessibility', () => {
        it('renders the name in a h3 by default', async () => {
            const wrapper = await mount({});
            expect(wrapper.find('h3').text()).toBe('Item name');
        });

        it('renders the name in the given heading', async () => {
            const wrapper = await mount({ titleTag: 'h2' });
            expect(wrapper.find('h2').text()).toBe('Item name');
            expect(wrapper.find('h3').exists()).toBe(false);
        });

        it('limits the link to the name', async () => {
            const wrapper = await mount({ description: 'Some description' });
            expect(wrapper.find('a').text()).toBe('Item name');
        });

        it('does not nest the after-image slot in the link', async () => {
            const wrapper = await testMount(PresentationItem, {
                props: baseProps,
                slots: { 'after-image': '<button>Play</button>' }
            });
            expect(wrapper.find('button').exists()).toBe(true);
            expect(wrapper.find('a button').exists()).toBe(false);
        });

        it('has a decorative image without title', async () => {
            const wrapper = await mount({});
            const img = wrapper.find('img');
            expect(img.attributes('alt')).toBe('');
            expect(img.attributes('title')).toBeUndefined();
        });
    });
});
