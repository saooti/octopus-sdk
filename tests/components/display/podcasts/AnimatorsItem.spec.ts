import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import AnimatorsItem from '@/components/display/podcasts/AnimatorsItem.vue';
import type { Participant } from '@/stores/class/general/participant';
import { mount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

const animator = { participantId: 1, firstName: 'Jean', lastName: 'Dupont' } as Participant;

describe('AnimatorsItem', () => {
    it('states the role before the link, keeping the link name to the visible text', async () => {
        const wrapper = await mount(AnimatorsItem, { props: { animator } });
        expect(wrapper.find('.visually-hidden').text()).toBe('Animated by');
        expect(wrapper.find('a').text()).toBe('Jean Dupont');
        expect(wrapper.text()).toMatch(/^Animated by\s*Jean Dupont$/);
    });
});
