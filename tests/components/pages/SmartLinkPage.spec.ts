import { mockUseRouter } from '@tests/mocks';
vi.mock('vue-router', () => mockUseRouter());

import { emissionApi } from "@/api/emissionApi";
import { playlistApi } from "@/api/playlistApi";
import SmartLinkPage from "@/components/pages/SmartLinkPage.vue";
import { emptyEmissionData } from "@/stores/class/general/emission";
import { emptyPlaylistData } from "@/stores/class/general/playlist";
import { mount, setupPlayerStore } from "@tests/utils";
import { describe, expect, it, Mock, vi } from "vitest";

vi.mock('@/api/emissionApi', () => ({
    emissionApi: {
        get: vi.fn()
    }
}));
vi.mock('@/api/playlistApi', () => ({
    playlistApi: {
        get: vi.fn(),
        getContent: () => []
    }
}));
vi.mock('@/api/podcastApi', () => ({
    podcastApi: {
        get: vi.fn(),
        searchFull: () => ({ count: 0 })
    },
    PodcastSort: {}
}));
vi.mock('@/api/organisationApi', () => ({
    organisationApi: {
        getAttributes: vi.fn()
    }
}));

vi.mock('@/components/composable/route/useSeoTitleUrl.ts', () => ({
    useSeoTitleUrl: () => ({
        updatePathParams: vi.fn()
    })
}));

vi.mock('@/components/composable/useImageProxy', () => ({
    useImageProxy: () => ({ useProxyImageUrl: vi.fn() })
}));

vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: vi.fn()
    })
}));

const title = 'test title';
const description = 'test description';

const mockGetEmission = (emissionApi.get as unknown as Mock);
const mockGetPlaylist = (playlistApi.get as unknown as Mock);

mockGetEmission.mockReturnValue(Promise.resolve({
    ...emptyEmissionData(),
    name: title,
    description
}));

mockGetPlaylist.mockReturnValue(Promise.resolve({
    ...emptyPlaylistData(),
    title,
    description
}));

describe('SmartLinkPage', () => {

    [
        { name: 'emission', key: 'emissionId', api: mockGetEmission },
        { name: 'playlist', key: 'playlistId', api: mockGetPlaylist },
    ].forEach(testData => {
        describe(`for ${testData.name}`, () => {
            it('displays data properly', async() => {
                const wrapper = await mount(SmartLinkPage, {
                    props: {
                        [testData.key]: 5
                    },
                    beforeMount: setupPlayerStore()
                });

                expect(wrapper.text()).toContain(title);
                expect(wrapper.text()).toContain(description);
            });
        });
    });
});
