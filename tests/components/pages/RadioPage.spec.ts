import { mockI18n, mockUseRouter } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
vi.mock('vue-router', () => mockUseRouter());

import RadioPage from '@/components/pages/RadioPage.vue';
import { Canal } from '@/stores/class/radio/canal';
import { mount, setupAuthStore } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/api/classicApi', () => ({
    default: { fetchData: vi.fn() },
}));
vi.mock('@/components/composable/route/useSeoTitleUrl.ts', () => ({
    useSeoTitleUrl: () => ({ updatePathParams: vi.fn() })
}));

import classicApi from '@/api/classicApi';

function makeRadio(): Canal {
    return {
        id: 1,
        organisationId: 'org-1',
        name: 'Test radio',
        defaultPlaylist: '',
        defaultAmbiance: {},
        url: '',
        imageUrl: '',
        description: '',
        advertisingTag: null,
    };
}

describe('RadioPage', () => {
    describe('edit-box-radio slot', () => {
        it('passes the fetched radio to the slot', async () => {
            vi.mocked(classicApi.fetchData).mockResolvedValue(makeRadio());
            const wrapper = await mount(RadioPage, {
                shallow: true,
                props: { canalId: 1 },
                slots: {
                    'edit-box-radio': `<template #edit-box-radio="{ radio }"><button class="edit-box-radio-slot" :data-orga="radio?.organisationId" /></template>`
                },
                beforeMount: setupAuthStore({ roles: 'RADIO', organisationId: 'org-1' })
            });

            const button = wrapper.find('.edit-box-radio-slot');
            expect(button.exists()).toBe(true);
            expect(button.attributes('data-orga')).toBe('org-1');
        });

        it('is not rendered when the user has no edit rights', async () => {
            vi.mocked(classicApi.fetchData).mockResolvedValue(makeRadio());
            const wrapper = await mount(RadioPage, {
                shallow: true,
                props: { canalId: 1 },
                slots: {
                    'edit-box-radio': `<template #edit-box-radio="{ radio }"><button class="edit-box-radio-slot" :data-orga="radio?.organisationId" /></template>`
                },
                beforeMount: setupAuthStore({ organisationId: 'org-2' })
            });

            expect(wrapper.find('.edit-box-radio-slot').exists()).toBe(false);
        });
    });
});
