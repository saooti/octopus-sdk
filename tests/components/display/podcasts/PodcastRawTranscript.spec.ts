import '@tests/mocks/i18n';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { mount as testMount } from '@tests/utils';
import PodcastRawTranscript from '@/components/display/podcasts/PodcastRawTranscript.vue';
vi.mock('@/api/transcriptionApi', () => ({
    transcriptionApi: {
        getTranslations: vi.fn().mockResolvedValue({
            podcastId: 1,
            nativeLanguage: 'fr',
            translations: [],
        }),
        getTranslation: vi.fn().mockResolvedValue(''),
    },
    TranslationState: {
        TRANSLATING: 'TRANSLATING',
        FINISHED: 'FINISHED',
        FAILED: 'FAILED',
        AI_LIMIT_EXCEEDED: 'AI_LIMIT_EXCEEDED',
    },
}));

vi.mock('@/components/composable/useTranslation', () => ({
    useTranslation: vi.fn(),
}));

vi.mock('@/helper/cookiesHelper', () => ({
    default: {
        getCookie: vi.fn().mockReturnValue(null),
        setCookie: vi.fn(),
    },
}));

import { transcriptionApi, TranslationState } from '@/api/transcriptionApi';
import { useTranslation } from '@/components/composable/useTranslation';
import cookiesHelper from '@/helper/cookiesHelper';

const AccessibilityModalStub = defineComponent({
    name: 'AccessibilityModal',
    emits: ['save', 'close'],
    template: '<div />',
});

const mount = (props: Record<string, unknown> = {}) =>
    testMount(PodcastRawTranscript, {
        shallow: true,
        props,
        stubs: { AccessibilityModal: AccessibilityModalStub },
    });

const open = (wrapper: Awaited<ReturnType<typeof mount>>) =>
    wrapper.find('.btn-transcript').trigger('click');

const mountAndOpen = async (podcastId = 1) => {
    const wrapper = await mount({ podcastId });
    await open(wrapper);
    return wrapper;
};

describe('PodcastRawTranscript', () => {
    let mockConvertSrtToPlainText: ReturnType<typeof vi.fn>;
    let mockGetMostRelevantLanguage: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockConvertSrtToPlainText = vi.fn().mockReturnValue('Converted text');
        mockGetMostRelevantLanguage = vi.fn().mockResolvedValue('fr');
        vi.mocked(useTranslation).mockReturnValue({
            convertSrtToPlainText: mockConvertSrtToPlainText,
            getMostRelevantLanguage: mockGetMostRelevantLanguage,
            getMostRelevantTranslation: vi.fn(),
        } as ReturnType<typeof useTranslation>);
        vi.mocked(transcriptionApi.getTranslations).mockResolvedValue({
            podcastId: 1,
            nativeLanguage: 'fr',
            translations: [],
        });
        vi.mocked(transcriptionApi.getTranslation).mockResolvedValue('');
        vi.mocked(cookiesHelper.getCookie).mockReturnValue(null);
    });

    it('shows "View transcript" button, hides body and accessibility button initially', async () => {
        const wrapper = await mount({ podcastId: 1 });
        expect(wrapper.find('.btn-transcript').text()).toBe('View transcript');
        expect(wrapper.find('.transcription-body').exists()).toBe(false);
        expect(wrapper.find('.btn-primary').exists()).toBe(false);
    });

    describe('toggling', () => {
        it('shows body, language selector, button text and accessibility button when opened', async () => {
            const wrapper = await mountAndOpen();
            await flushPromises();
            expect(wrapper.find('.transcription-body').exists()).toBe(true);
            expect(wrapper.find('.language-selector').exists()).toBe(true);
            expect(wrapper.find('.btn-transcript').text()).toBe('Hide transcript');
            expect(wrapper.find('.btn-primary').exists()).toBe(true);
        });

        it('hides transcript body and language selector when closed again', async () => {
            const wrapper = await mountAndOpen();
            await open(wrapper);
            expect(wrapper.find('.transcription-body').exists()).toBe(false);
            expect(wrapper.find('.language-selector').exists()).toBe(false);
        });
    });

    describe('transcript fetching', () => {
        it('fetches translations when opened for the first time', async () => {
            await mountAndOpen(42);
            expect(transcriptionApi.getTranslations).toHaveBeenCalledWith(42);
        });

        it('does not fetch when podcastId is undefined', async () => {
            const wrapper = await mount({});
            await open(wrapper);
            expect(transcriptionApi.getTranslations).not.toHaveBeenCalled();
        });

        it('fetches only once when closed and reopened', async () => {
            const wrapper = await mountAndOpen();
            await flushPromises();
            await open(wrapper); // close
            await open(wrapper); // reopen
            expect(transcriptionApi.getTranslations).toHaveBeenCalledTimes(1);
        });

        it.each([
            ['Converted text', 'Converted text'],
            ['', 'Transcript does not yet exist for this episode'],
        ])('displays correct content for converted text %j', async (convertedText, expected) => {
            mockConvertSrtToPlainText.mockReturnValue(convertedText);
            const wrapper = await mountAndOpen();
            await flushPromises();
            expect(wrapper.find('.transcription-text').text()).toContain(expected);
        });
    });

    describe('language selector', () => {
        it('populates language options from finished translations', async () => {
            vi.mocked(transcriptionApi.getTranslations).mockResolvedValue({
                podcastId: 1,
                nativeLanguage: 'fr',
                translations: [
                    { language: 'en', state: TranslationState.FINISHED },
                    { language: 'es', state: TranslationState.TRANSLATING },
                    { language: 'de', state: TranslationState.FINISHED },
                ],
            });
            const wrapper = await mountAndOpen();
            await flushPromises();
            const select = wrapper.findComponent({ name: 'ClassicSelect' });
            const options = select.props('options') as Array<{ title: string; value: string }>;
            expect(options.map(o => o.value)).toEqual(['fr', 'en', 'de']);
        });

        it('sets the most relevant language as the initial selected language', async () => {
            const wrapper = await mountAndOpen();
            await flushPromises();
            const select = wrapper.findComponent({ name: 'ClassicSelect' });
            expect(select.props('textInit')).toBe('fr');
        });

        it('fetches translation and converts SRT when language changes', async () => {
            const srtContent = '1\n00:00:01,000 --> 00:00:02,000\nHello world\n\n';
            vi.mocked(transcriptionApi.getTranslation).mockResolvedValue(srtContent);
            mockConvertSrtToPlainText.mockReturnValue('Hello world ');
            const wrapper = await mountAndOpen();
            await flushPromises();
            const select = wrapper.findComponent({ name: 'ClassicSelect' });
            await select.vm.$emit('update:textInit', 'en');
            await flushPromises();
            expect(transcriptionApi.getTranslation).toHaveBeenCalledWith(1, 'en');
            expect(mockConvertSrtToPlainText).toHaveBeenCalledWith(srtContent);
            expect(wrapper.find('.transcription-text').text()).toContain('Hello world');
        });

        it('disables language select while loading', async () => {
            let resolveTranslation!: (value: string) => void;
            // First call (fetchTranscripts) resolves to make the selector visible
            vi.mocked(transcriptionApi.getTranslation).mockResolvedValueOnce('');
            // Subsequent call (changeLanguage) hangs
            vi.mocked(transcriptionApi.getTranslation).mockReturnValue(
                new Promise(resolve => { resolveTranslation = resolve; })
            );
            const wrapper = await mountAndOpen();
            await flushPromises();
            const select = wrapper.findComponent({ name: 'ClassicSelect' });
            await select.vm.$emit('update:textInit', 'en');
            await nextTick();
            expect(select.props('isDisabled')).toBe(true);
            resolveTranslation('');
            await flushPromises();
            expect(select.props('isDisabled')).toBe(false);
        });
    });

    describe('accessibility', () => {
        it('reads cookies and applies CSS properties on open', async () => {
            vi.mocked(cookiesHelper.getCookie).mockImplementation((name: string) => {
                if (name === 'octopus-font-size') { return '20px'; }
                if (name === 'octopus-background') { return '#000'; }
                if (name === 'octopus-color') { return '#fff'; }
                return null;
            });
            const spy = vi.spyOn(document.documentElement.style, 'setProperty');
            await mountAndOpen();
            expect(cookiesHelper.getCookie).toHaveBeenCalledWith('octopus-font-size');
            expect(cookiesHelper.getCookie).toHaveBeenCalledWith('octopus-background');
            expect(cookiesHelper.getCookie).toHaveBeenCalledWith('octopus-color');
            expect(spy).toHaveBeenCalledWith('--octopus-accessibility-font-size', '20px');
            expect(spy).toHaveBeenCalledWith('--octopus-accessibility-background', '#000');
            expect(spy).toHaveBeenCalledWith('--octopus-accessibility-color', '#fff');
        });

        it('does not set CSS properties when cookies are absent', async () => {
            const spy = vi.spyOn(document.documentElement.style, 'setProperty');
            await mountAndOpen();
            expect(spy).not.toHaveBeenCalled();
        });

        it('shows accessibility modal when its button is clicked', async () => {
            const wrapper = await mountAndOpen();
            await wrapper.find('.btn-primary').trigger('click');
            expect(wrapper.findComponent(AccessibilityModalStub).exists()).toBe(true);
        });

        it('closes accessibility modal on close event', async () => {
            const wrapper = await mountAndOpen();
            await wrapper.find('.btn-primary').trigger('click');
            wrapper.findComponent(AccessibilityModalStub).vm.$emit('close');
            await nextTick();
            expect(wrapper.findComponent(AccessibilityModalStub).exists()).toBe(false);
        });

        it('saves settings to cookies and CSS and closes modal on save', async () => {
            const spy = vi.spyOn(document.documentElement.style, 'setProperty');
            const wrapper = await mountAndOpen();
            await wrapper.find('.btn-primary').trigger('click');
            wrapper.findComponent(AccessibilityModalStub).vm.$emit('save', {
                fontSize: 18, background: '#fff', color: '#000',
            });
            await nextTick();
            expect(cookiesHelper.setCookie).toHaveBeenCalledWith('octopus-font-size', '18px');
            expect(cookiesHelper.setCookie).toHaveBeenCalledWith('octopus-background', '#fff');
            expect(cookiesHelper.setCookie).toHaveBeenCalledWith('octopus-color', '#000');
            expect(spy).toHaveBeenCalledWith('--octopus-accessibility-font-size', '18px');
            expect(spy).toHaveBeenCalledWith('--octopus-accessibility-background', '#fff');
            expect(spy).toHaveBeenCalledWith('--octopus-accessibility-color', '#000');
            expect(wrapper.findComponent(AccessibilityModalStub).exists()).toBe(false);
        });
    });
});
