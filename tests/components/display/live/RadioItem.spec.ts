import { mockI18n, mockUseRouter } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
vi.mock('vue-router', () => mockUseRouter());

import RadioItem from '@/components/display/live/RadioItem.vue';
import { mount as testMount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

const mount = (props: Record<string, unknown> = {}) => testMount(RadioItem, {
    props: { radio: { id: 1, name: 'My radio', description: 'My description' }, ...props },
    stubs: {
        RadioImage: true,
        RadioCurrently: { template: '<a>Current show</a>' }
    }
});

describe('RadioItem', () => {
    describe('accessibility', () => {
        it('renders the name in a h3 by default', async () => {
            const wrapper = await mount();
            expect(wrapper.find('h3').text()).toBe('My radio');
        });

        it('renders the name in the given heading', async () => {
            const wrapper = await mount({ titleTag: 'h4' });
            expect(wrapper.find('h4').text()).toBe('My radio');
            expect(wrapper.find('h3').exists()).toBe(false);
        });

        it('limits the link to the name', async () => {
            const wrapper = await mount();
            expect(wrapper.find('.element-link').text()).toBe('My radio');
        });

        it('does not nest links', async () => {
            const wrapper = await mount();
            expect(wrapper.findAll('a')).toHaveLength(2);
            expect(wrapper.find('a a').exists()).toBe(false);
        });
    });
});
