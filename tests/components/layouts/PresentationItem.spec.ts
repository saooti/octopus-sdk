import '@tests/mocks/i18n';
import '@tests/mocks/useRouter';

import PresentationItem from '@/components/layouts/PresentationItem.vue';
import { mount as testMount } from '@tests/utils';
import { describe, expect, it } from 'vitest';

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
});
