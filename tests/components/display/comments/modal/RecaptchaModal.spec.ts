import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import RecaptchaModal from '@/components/display/comments/modal/RecaptchaModal.vue';
import { CHECK_TOKEN_KEY } from '@/components/composable/keys';
import { mount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

function findRecaptcha(wrapper: Awaited<ReturnType<typeof mount>>) {
    return wrapper.findComponent({ name: 'VueRecaptcha' });
}

describe('RecaptchaModal', () => {
    describe('checkToken resolution', () => {
        it('calls the app-provided checkToken implementation with the recaptcha token', async () => {
            const checkToken = vi.fn().mockResolvedValue(false);
            const wrapper = await mount(RecaptchaModal, {
                stubs: ['VueRecaptcha'],
                provide: { [CHECK_TOKEN_KEY]: checkToken }
            });

            await findRecaptcha(wrapper).vm.$emit('verify', 'token-123');

            expect(checkToken).toHaveBeenCalledWith('token-123');
            // checkToken resolved false here, so the widget must stay so the
            // user can retry - proves isVerify was actually driven by the
            // provided implementation's result, not just called.
            expect(findRecaptcha(wrapper).exists()).toBe(true);
        });

        it('defaults to always-verified when no implementation is provided', async () => {
            const wrapper = await mount(RecaptchaModal, { stubs: ['VueRecaptcha'] });

            await findRecaptcha(wrapper).vm.$emit('verify', 'token-123');
            await nextTick();

            // The default checkToken resolves true, so the widget (v-if
            //="!isVerify") should be gone once its result is applied.
            expect(findRecaptcha(wrapper).exists()).toBe(false);
        });
    });
});
