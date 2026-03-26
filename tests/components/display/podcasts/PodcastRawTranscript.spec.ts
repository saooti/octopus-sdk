import '@tests/mocks/i18n';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { mount as testMount } from '@tests/utils';
import PodcastRawTranscript from '@/components/display/podcasts/PodcastRawTranscript.vue';

vi.mock('@/api/transcriptionApi', () => ({
    transcriptionApi: {
        getRawTranscription: vi.fn().mockResolvedValue('Sample transcript text'),
        getTranslations: vi.fn().mockResolvedValue([]),
    },
}));

vi.mock('@/helper/cookiesHelper', () => ({
    default: {
        getCookie: vi.fn().mockReturnValue(null),
        setCookie: vi.fn(),
    },
}));

import { transcriptionApi } from '@/api/transcriptionApi';
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

describe('PodcastRawTranscript', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(transcriptionApi.getRawTranscription).mockResolvedValue('Sample transcript text');
        vi.mocked(cookiesHelper.getCookie).mockReturnValue(null);
    });

    it('shows "View transcript" button, hides body and accessibility button initially', async () => {
        const wrapper = await mount({ podcastId: 1 });
        expect(wrapper.find('.btn-transcript').text()).toBe('View transcript');
        expect(wrapper.find('.transcription-body').exists()).toBe(false);
        expect(wrapper.find('.btn-primary').exists()).toBe(false);
    });

    describe('toggling', () => {
        it('shows body, updates button text and shows accessibility button when opened', async () => {
            const wrapper = await mount({ podcastId: 1 });
            await open(wrapper);
            expect(wrapper.find('.transcription-body').exists()).toBe(true);
            expect(wrapper.find('.btn-transcript').text()).toBe('Hide transcript');
            expect(wrapper.find('.btn-primary').exists()).toBe(true);
        });

        it('hides transcript body when closed again', async () => {
            const wrapper = await mount({ podcastId: 1 });
            await open(wrapper);
            await open(wrapper);
            expect(wrapper.find('.transcription-body').exists()).toBe(false);
        });
    });

    describe('transcript fetching', () => {
        it('fetches transcript when opened for the first time', async () => {
            const wrapper = await mount({ podcastId: 42 });
            await open(wrapper);
            expect(transcriptionApi.getRawTranscription).toHaveBeenCalledWith(42);
        });

        it('does not fetch when podcastId is undefined', async () => {
            const wrapper = await mount({});
            await open(wrapper);
            expect(transcriptionApi.getRawTranscription).not.toHaveBeenCalled();
        });

        it('fetches only once when closed and reopened', async () => {
            const wrapper = await mount({ podcastId: 1 });
            await open(wrapper);
            await flushPromises();
            await open(wrapper); // close
            await open(wrapper); // reopen
            expect(transcriptionApi.getRawTranscription).toHaveBeenCalledTimes(1);
        });

        it.each([
            ['Sample transcript text', 'Sample transcript text'],
            ['', 'Transcript does not yet exist for this episode'],
        ])('displays correct content for transcript %j', async (transcript, expected) => {
            vi.mocked(transcriptionApi.getRawTranscription).mockResolvedValue(transcript);
            const wrapper = await mount({ podcastId: 1 });
            await open(wrapper);
            await flushPromises();
            expect(wrapper.find('.transcription-text').text()).toContain(expected);
        });
    });

    describe('accessibility', () => {
        it('reads cookies and applies CSS properties on open', async () => {
            vi.mocked(cookiesHelper.getCookie).mockImplementation(name => {
                if (name === 'octopus-font-size') return '20px';
                if (name === 'octopus-background') return '#000';
                if (name === 'octopus-color') return '#fff';
                return null;
            });
            const spy = vi.spyOn(document.documentElement.style, 'setProperty');
            const wrapper = await mount({ podcastId: 1 });
            await open(wrapper);
            expect(cookiesHelper.getCookie).toHaveBeenCalledWith('octopus-font-size');
            expect(cookiesHelper.getCookie).toHaveBeenCalledWith('octopus-background');
            expect(cookiesHelper.getCookie).toHaveBeenCalledWith('octopus-color');
            expect(spy).toHaveBeenCalledWith('--octopus-accessibility-font-size', '20px');
            expect(spy).toHaveBeenCalledWith('--octopus-accessibility-background', '#000');
            expect(spy).toHaveBeenCalledWith('--octopus-accessibility-color', '#fff');
        });

        it('does not set CSS properties when cookies are absent', async () => {
            const spy = vi.spyOn(document.documentElement.style, 'setProperty');
            const wrapper = await mount({ podcastId: 1 });
            await open(wrapper);
            expect(spy).not.toHaveBeenCalled();
        });

        it('shows accessibility modal when its button is clicked', async () => {
            const wrapper = await mount({ podcastId: 1 });
            await open(wrapper);
            await wrapper.find('.btn-primary').trigger('click');
            expect(wrapper.findComponent(AccessibilityModalStub).exists()).toBe(true);
        });

        it('closes accessibility modal on close event', async () => {
            const wrapper = await mount({ podcastId: 1 });
            await open(wrapper);
            await wrapper.find('.btn-primary').trigger('click');
            wrapper.findComponent(AccessibilityModalStub).vm.$emit('close');
            await nextTick();
            expect(wrapper.findComponent(AccessibilityModalStub).exists()).toBe(false);
        });

        it('saves settings to cookies and CSS and closes modal on save', async () => {
            const spy = vi.spyOn(document.documentElement.style, 'setProperty');
            const wrapper = await mount({ podcastId: 1 });
            await open(wrapper);
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
