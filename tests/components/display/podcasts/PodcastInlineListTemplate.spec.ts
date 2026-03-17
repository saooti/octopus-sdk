import '@tests/mocks/i18n';
import '@tests/mocks/useRouter';

import PodcastInlineListTemplate from '@/components/display/podcasts/PodcastInlineListTemplate.vue';
import { mount as testMount } from '@tests/utils';
import { describe, expect, it } from 'vitest';

const mount = (props: Record<string, unknown> = {}) =>
    testMount(PodcastInlineListTemplate, { shallow: true, props });

describe('PodcastInlineListTemplate', () => {
    describe('noSort prop', () => {
        it('shows sort buttons by default', async () => {
            const wrapper = await mount();
            expect(wrapper.find('.btn-underline').exists()).toBe(true);
        });

        it('hides sort buttons when noSort is true', async () => {
            const wrapper = await mount({ noSort: true });
            expect(wrapper.find('.btn-underline').exists()).toBe(false);
        });
    });
});
