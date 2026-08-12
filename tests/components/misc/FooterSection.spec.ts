import '@tests/mocks/i18n';
import '@tests/mocks/useRouter';

import FooterSection from '@/components/misc/FooterSection.vue';
import { LOAD_LOCALE_MESSAGES_KEY } from '@/components/composable/keys';
import { loadLocaleMessages as loadSdkLocaleMessages } from '@/i18n';
import { mount } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/api/classicApi', () => ({
    default: { fetchData: vi.fn().mockResolvedValue([]) },
}));
vi.mock('@/i18n', () => ({
    loadLocaleMessages: vi.fn(),
}));

function changeLanguage(wrapper: Awaited<ReturnType<typeof mount>>, locale: string) {
    return wrapper.findComponent({ name: 'ClassicSelect' }).vm.$emit('update:textInit', locale);
}

describe('FooterSection', () => {
    describe('loadLocaleMessages resolution', () => {
        it('calls the app-provided implementation when a language is chosen', async () => {
            const loadLocaleMessages = vi.fn();
            const wrapper = await mount(FooterSection, {
                shallow: true,
                provide: { [LOAD_LOCALE_MESSAGES_KEY]: loadLocaleMessages }
            });

            await changeLanguage(wrapper, 'en');

            expect(loadLocaleMessages).toHaveBeenCalledWith(
                expect.anything(), 'en', expect.anything(), expect.anything()
            );
            expect(loadSdkLocaleMessages).not.toHaveBeenCalled();
        });

        it('falls back to the SDK own loader when nothing is provided', async () => {
            const wrapper = await mount(FooterSection, { shallow: true });

            await changeLanguage(wrapper, 'en');

            expect(loadSdkLocaleMessages).toHaveBeenCalledWith(
                expect.anything(), 'en', expect.anything(), expect.anything()
            );
        });
    });
});
