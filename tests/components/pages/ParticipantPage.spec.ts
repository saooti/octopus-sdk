import { mockI18n, mockUseRouter } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
vi.mock('vue-router', () => mockUseRouter());

import ParticipantPage from '@/components/pages/ParticipantPage.vue';
import { emptyParticipantData } from '@/stores/class/general/participant';
import { mount, setupAuthStore } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/api/classicApi', () => ({
    default: { fetchData: vi.fn() },
}));
vi.mock('@/components/composable/route/useSeoTitleUrl.ts', () => ({
    useSeoTitleUrl: () => ({ updatePathParams: vi.fn() })
}));
vi.mock('@/components/composable/useImageProxy', () => ({
    useImageProxy: () => ({ useProxyImageUrl: vi.fn() })
}));

import classicApi from '@/api/classicApi';

const publicOrga = { id: 'org-1', name: 'Test', imageUrl: '', privacy: 'PUBLIC' };

function makeParticipant() {
    return { ...emptyParticipantData(), orga: publicOrga };
}

describe('ParticipantPage', () => {
    describe('edit-box slot', () => {
        it('passes the fetched participant and an on-updated callback that refetches it', async () => {
            vi.mocked(classicApi.fetchData).mockResolvedValue(makeParticipant());
            const wrapper = await mount(ParticipantPage, {
                shallow: true,
                props: { participantId: 1 },
                slots: {
                    'edit-box': `<template #edit-box="{ participant, onUpdated }">
                        <button class="edit-box-slot" :data-orga="participant?.orga?.id" @click="onUpdated({ ...participant, firstName: 'Updated' })">edit</button>
                    </template>`
                },
                beforeMount: setupAuthStore({ organisationId: 'org-1' })
            });

            const button = wrapper.find('.edit-box-slot');
            expect(button.exists()).toBe(true);
            expect(button.attributes('data-orga')).toBe('org-1');

            await button.trigger('click');
            expect(wrapper.text()).toContain('Updated');
        });

        it('is not rendered when the user has no edit rights', async () => {
            vi.mocked(classicApi.fetchData).mockResolvedValue(makeParticipant());
            const wrapper = await mount(ParticipantPage, {
                shallow: true,
                props: { participantId: 1 },
                slots: {
                    'edit-box': `<template #edit-box="{ participant }"><button class="edit-box-slot" :data-orga="participant?.orga?.id" /></template>`
                },
                beforeMount: setupAuthStore({ organisationId: 'org-2' })
            });

            expect(wrapper.find('.edit-box-slot').exists()).toBe(false);
        });
    });
});
