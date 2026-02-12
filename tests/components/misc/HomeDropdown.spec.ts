import '@tests/mocks/useRouter';
import '@tests/mocks/i18n';

import HomeDropdown from '@/components/misc/HomeDropdown.vue';
import { mount } from '@tests/utils';
import { describe, expect, it } from 'vitest';

describe('HomeDropdown - displayUpload prop', () => {
    it('displays the upload button when displayUpload is true', async () => {
        const wrapper = await mount(HomeDropdown, {
            props: {
                displayUpload: true
            },
            stubs: ['ClassicPopover', 'UserButtonContent', 'AppsIcon', 'AccountIcon', 'DownloadIcon']
        });

        const uploadButton = wrapper.find('a[title="Upload"]');
        expect(uploadButton.exists()).toBe(true);
        expect(uploadButton.attributes('to')).toBe('/main/priv/upload');
    });

    it('does not display the upload button when displayUpload is false', async () => {
        const wrapper = await mount(HomeDropdown, {
            props: {
                displayUpload: false
            },
            stubs: ['ClassicPopover', 'UserButtonContent', 'AppsIcon', 'AccountIcon', 'DownloadIcon']
        });

        const uploadButton = wrapper.find('a[title="Upload"]');
        expect(uploadButton.exists()).toBe(false);
    });

    it('does not display the upload button when displayUpload is undefined', async () => {
        const wrapper = await mount(HomeDropdown, {
            props: {},
            stubs: ['ClassicPopover', 'UserButtonContent', 'AppsIcon', 'AccountIcon', 'DownloadIcon']
        });

        const uploadButton = wrapper.find('a[title="Upload"]');
        expect(uploadButton.exists()).toBe(false);
    });
});
