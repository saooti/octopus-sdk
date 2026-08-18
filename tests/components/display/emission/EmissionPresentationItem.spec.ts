import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

const tagsFor = vi.fn();
const additionalInfoFor = vi.fn();

vi.mock('@/components/composable/usePresentationItem', () => ({
    usePresentationItem: () => ({ tagsFor, additionalInfoFor }),
}));

import EmissionPresentationItem from '@/components/display/emission/EmissionPresentationItem.vue';
import { emptyEmissionData } from '@/stores/class/general/emission';
import { mount as testMount } from '@tests/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

const mount = (props: Record<string, unknown>) => testMount(EmissionPresentationItem, { shallow: true, props });

beforeEach(() => {
    tagsFor.mockReset().mockResolvedValue([]);
    additionalInfoFor.mockReset().mockReturnValue(undefined);
});

describe('EmissionPresentationItem', () => {
    it('calls tagsFor with the emission prop', async () => {
        const emission = { ...emptyEmissionData(), emissionId: 42 };
        await mount({ emission });
        expect(tagsFor).toHaveBeenCalledWith(emission);
    });

    it('resolves tagsFor asynchronously and forwards the result as the tags prop', async () => {
        tagsFor.mockResolvedValue(['News']);
        const wrapper = await mount({ emission: emptyEmissionData() });
        await nextTick();
        await nextTick();
        const presentationItem = wrapper.findComponent({ name: 'PresentationItem' });
        expect(presentationItem.props('tags')).toEqual(['News']);
    });

    it('forwards additionalInfoFor result as the additional-info prop', async () => {
        additionalInfoFor.mockReturnValue(['Saooti']);
        const wrapper = await mount({ emission: emptyEmissionData() });
        const presentationItem = wrapper.findComponent({ name: 'PresentationItem' });
        expect(presentationItem.props('additionalInfo')).toEqual(['Saooti']);
    });
});
