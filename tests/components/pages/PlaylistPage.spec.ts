import { mockI18n, mockUseRouter } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
vi.mock('vue-router', () => mockUseRouter());

import PlaylistPage from '@/components/pages/PlaylistPage.vue';
import { emptyPlaylistData } from '@/stores/class/general/playlist';
import { mount, setupAuthStore } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/api/playlistApi', () => ({
    playlistApi: { get: vi.fn() }
}));
vi.mock('@/components/composable/route/useSeoTitleUrl.ts', () => ({
    useSeoTitleUrl: () => ({ updatePathParams: vi.fn() })
}));
vi.mock('@/components/composable/useImageProxy', () => ({
    useImageProxy: () => ({ useProxyImageUrl: vi.fn() })
}));

import { playlistApi } from '@/api/playlistApi';

const publicOrga = { id: 'org-1', name: 'Test', imageUrl: '', privacy: 'PUBLIC' };

function makePlaylist() {
    return { ...emptyPlaylistData(), organisation: publicOrga };
}

describe('PlaylistPage', () => {
    describe('edit-box slot', () => {
        it('passes the fetched playlist to the slot', async () => {
            vi.mocked(playlistApi.get).mockResolvedValue(makePlaylist());
            const wrapper = await mount(PlaylistPage, {
                shallow: true,
                props: { playlistId: 1 },
                slots: {
                    'edit-box': `<template #edit-box="{ playlist }"><button class="edit-box-slot" :data-orga="playlist?.organisation?.id" /></template>`
                },
                beforeMount: setupAuthStore({ roles: 'PLAYLISTS', organisationId: 'org-1' })
            });

            const button = wrapper.find('.edit-box-slot');
            expect(button.exists()).toBe(true);
            expect(button.attributes('data-orga')).toBe('org-1');
        });

        it('is not rendered when the user has no edit rights', async () => {
            vi.mocked(playlistApi.get).mockResolvedValue(makePlaylist());
            const wrapper = await mount(PlaylistPage, {
                shallow: true,
                props: { playlistId: 1 },
                slots: {
                    'edit-box': `<template #edit-box="{ playlist }"><button class="edit-box-slot" :data-orga="playlist?.organisation?.id" /></template>`
                },
                beforeMount: setupAuthStore({ organisationId: 'org-2' })
            });

            expect(wrapper.find('.edit-box-slot').exists()).toBe(false);
        });
    });
});
