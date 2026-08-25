import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ref } from 'vue';
import { mount } from '@tests/utils';
import PlayerLarge from '@/components/misc/player/PlayerLarge.vue';

vi.mock('@/components/composable/player/usePlayerDisplayTime', () => ({
    usePlayerDisplayTime: vi.fn(),
}));
vi.mock('@/components/composable/player/usePlayerTranscript', () => ({
    usePlayerTranscript: vi.fn(),
}));

import { usePlayerDisplayTime } from '@/components/composable/player/usePlayerDisplayTime';
import { usePlayerTranscript } from '@/components/composable/player/usePlayerTranscript';

const mockGeneratingTranscriptLanguage = ref<string | null>(null);

describe('PlayerLarge', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGeneratingTranscriptLanguage.value = null;

        vi.mocked(usePlayerDisplayTime).mockReturnValue({
            transcriptText: ref('Some transcript'),
            isAdPlaying: false,
            radioUrl: '',
            displayPlayTime: ref('0:00'),
            displayTotalTime: ref('1:00'),
        } as unknown as ReturnType<typeof usePlayerDisplayTime>);

        vi.mocked(usePlayerTranscript).mockReturnValue({
            generatingTranscriptLanguage: mockGeneratingTranscriptLanguage,
            getTranscription: vi.fn(),
            onTimeUpdateTranscript: vi.fn(),
            onSeekedTranscript: vi.fn(),
            checkDelaytWithStitching: vi.fn(),
        } as unknown as ReturnType<typeof usePlayerTranscript>);
    });

    describe('generating subtitles indicator', () => {
        it('does not show ClassicLoading when no translation is being generated', async () => {
            const wrapper = await mount(PlayerLarge, { shallow: true });

            expect(wrapper.findComponent({ name: 'ClassicLoading' }).exists()).toBe(false);
        });

        it('shows ClassicLoading with the language name when a translation is being generated', async () => {
            mockGeneratingTranscriptLanguage.value = 'en';
            const wrapper = await mount(PlayerLarge, { shallow: true });

            const loading = wrapper.findComponent({ name: 'ClassicLoading' });
            expect(loading.exists()).toBe(true);
            expect(loading.props('loadingText')).toContain('en');
        });

        it('hides ClassicLoading when transcript section is not shown', async () => {
            vi.mocked(usePlayerDisplayTime).mockReturnValue({
                transcriptText: ref(''),
                isAdPlaying: false,
                radioUrl: '',
                displayPlayTime: ref('0:00'),
                displayTotalTime: ref('1:00'),
            } as unknown as ReturnType<typeof usePlayerDisplayTime>);
            mockGeneratingTranscriptLanguage.value = 'en';
            const wrapper = await mount(PlayerLarge, { shallow: true });

            expect(wrapper.findComponent({ name: 'ClassicLoading' }).exists()).toBe(false);
        });
    });
});
