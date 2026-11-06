import { mockUseRouter, mockI18n } from '@tests/mocks';
vi.mock('vue-router', () => mockUseRouter());
vi.mock('vue-i18n', () => mockI18n());

import ClassicPopover from '@/components/misc/ClassicPopover.vue';
import ShareAnonymous from '@/components/display/sharing/ShareAnonymous.vue';
import { localisation, mount } from '@tests/utils';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSaveFetchStore } from '@/stores/SaveFetchStore';
import { state } from '@/stores/ParamSdkStore';
import { Emission } from '@/stores/class/general/emission';

describe('ShareAnonymous', () => {
    let appElement: HTMLElement;

    beforeEach(() => {
        // ClassicPopover is teleported to #app
        appElement = document.createElement('div');
        appElement.id = 'app';
        document.body.appendChild(appElement);
        state.generalParameters.podcastmaker = true;
    });
    afterEach(() => {
        appElement.remove();
        state.generalParameters.podcastmaker = false;
        vi.restoreAllMocks();
    });

    const mountShare = async () => {
        const wrapper = await mount(ShareAnonymous, {
            props: {
                emission: { emissionId: 1, name: 'Emission', annotations: {} } as unknown as Emission,
                organisationId: 'org1'
            },
            beforeMount: () => {
                vi.spyOn(useSaveFetchStore(), 'getOrgaAttributes').mockResolvedValue({});
            }
        });
        await flushPromises();
        return wrapper;
    };

    it('keeps its menu usable without styles (RGAA 10.3)', async () => {
        const wrapper = await mountShare();
        expect(wrapper.findComponent(ClassicPopover).props('isTopLayer')).toBe(true);
        wrapper.unmount();
    });

    it('opens the smartlink', async () => {
        const open = vi.spyOn(window, 'open').mockReturnValue({ focus: vi.fn() } as unknown as Window);
        const wrapper = await mountShare();

        const smartLinkButton = Array.from(appElement.querySelectorAll('button'))
            .find(button => button.textContent?.trim() === localisation('SmartLink - Share link'));
        smartLinkButton?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(open).toHaveBeenCalledOnce();
        wrapper.unmount();
    });
});
