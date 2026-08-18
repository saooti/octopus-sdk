import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import ClassicInputText from '@/components/form/ClassicInputText.vue';
import { mount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

describe('ClassicInputText', () => {
    describe('aria-required', () => {
        it('sets aria-required to true when canBeNull is false (default)', async () => {
            const wrapper = await mount(ClassicInputText, {
                props: { canBeNull: false }
            });
            expect(wrapper.find('input').attributes('aria-required')).toBe('true');
        });

        it('sets aria-required to false when canBeNull is true', async () => {
            const wrapper = await mount(ClassicInputText, {
                props: { canBeNull: true }
            });
            expect(wrapper.find('input').attributes('aria-required')).toBe('false');
        });
    });
});
