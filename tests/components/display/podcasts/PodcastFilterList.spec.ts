import '@tests/mocks/i18n';

import PodcastFilterList from '@/components/display/podcasts/PodcastFilterList.vue';
import { Emission, emptyEmissionData, SeasonMode } from '@/stores/class/general/emission';
import { mount as testMount } from '@tests/utils';
import { describe, expect, it } from 'vitest';

const mount = (props: Record<string, unknown> = {}) =>
    testMount(PodcastFilterList, { shallow: true, props });

describe('PodcastFilterList', () => {
    describe('season display', () => {
        it.each([
            { desc: 'no emission provided', props: {} },
            { desc: 'emission has NO_SEASON mode', props: { emission: { ...emptyEmissionData(), seasonMode: SeasonMode.NO_SEASON, seasons: [1, 2, 3] } } },
            { desc: 'emission has seasons but seasonCount is 0', props: { emission: { ...emptyEmissionData(), seasonMode: SeasonMode.SEASON_WITH_PODCAST_NUMBERING, seasons: [] } } },
        ])('shows a plain list when $desc', async ({ props }) => {
            const wrapper = await mount(props);
            expect(wrapper.find('podcast-list-stub').exists()).toBe(true);
            expect(wrapper.find('classic-nav-stub').exists()).toBe(false);
        });

        it.each([
            SeasonMode.SEASON_WITH_PODCAST_NUMBERING,
            SeasonMode.SEASON_WITHOUT_PODCAST_NUMBERING,
        ])('shows a season nav when seasonMode is %s', async (seasonMode) => {
            const emission: Emission = { ...emptyEmissionData(), seasonMode, seasons: [1, 2, 3] };
            const wrapper = await mount({ emission });
            expect(wrapper.find('classic-nav-stub').exists()).toBe(true);
            expect(wrapper.find('podcast-list-stub').exists()).toBe(false);
        });
    });
});
