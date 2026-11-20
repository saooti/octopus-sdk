import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

const { mockDownloadRegister, mockOnDownload } = vi.hoisted(() => ({
    mockDownloadRegister: vi.fn(),
    mockOnDownload: vi.fn()
}));
vi.mock('@/api', () => ({ podcastApi: { downloadRegister: mockDownloadRegister } }));
vi.mock('@/helper/downloadHelper', () => ({ default: { onDownload: mockOnDownload } }));

import DownloadPodcastButton from '@/components/display/podcasts/DownloadPodcastButton.vue';
import { emptyPodcastData } from '@/stores/class/general/podcast';
import { useNotificationStore } from '@/stores/NotificationStore';
import { mount } from '@tests/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const podcast = { ...emptyPodcastData(), podcastId: 12, title: 'Mon épisode' };

describe('DownloadPodcastButton', () => {
    beforeEach(() => {
        mockDownloadRegister.mockReset().mockResolvedValue({ location: 'https://cdn.example.com/12.mp3', downloadId: 'd' });
        mockOnDownload.mockReset().mockResolvedValue(undefined);
    });

    it('is an accessible button with a decorative icon', async () => {
        const button = (await mount(DownloadPodcastButton, { props: { podcast } })).find('button');
        expect(button.attributes('type')).toBe('button');
        expect(button.attributes('title')).toBe('Download');
        expect(button.find('[aria-hidden="true"]').exists()).toBe(true);
    });

    it('downloads directly, with the proxy as fallback', async () => {
        const wrapper = await mount(DownloadPodcastButton, { props: { podcast } });
        await wrapper.find('button').trigger('click');
        await vi.waitFor(() => expect(mockOnDownload).toHaveBeenCalled());
        expect(mockDownloadRegister).toHaveBeenCalledWith(12, { origin: 'saooti_play_download' });
        expect(mockOnDownload).toHaveBeenCalledWith('https://cdn.example.com/12.mp3', 'Mon épisode.mp3', false, true);
    });

    it('shows an error message when the download fails', async () => {
        mockOnDownload.mockRejectedValue(new Error('Download failed with status 404'));
        const wrapper = await mount(DownloadPodcastButton, { props: { podcast } });
        await wrapper.find('button').trigger('click');
        const { addNotification } = useNotificationStore();
        await vi.waitFor(() => expect(addNotification).toHaveBeenCalledWith({
            type: 'error',
            title: 'Error',
            message: 'Download - Error'
        }));
    });
});
