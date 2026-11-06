import { mockI18n, mockUseRouter } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());
vi.mock('vue-router', () => mockUseRouter());
vi.mock('@/api/classicApi', () => ({
    default: { fetchData: vi.fn() }
}));

import classicApi from '@/api/classicApi';
import PodcastInlineList from '@/components/display/podcasts/PodcastInlineList.vue';
import SwiperList from '@/components/display/list/SwiperList.vue';
import { emptyPodcastData } from '@/stores/class/general/podcast';
import { useFilterStore } from '@/stores/FilterStore';
import { mount as testMount } from '@tests/utils';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const podcast = (podcastId: number) => ({ ...emptyPodcastData(), podcastId });

const mockResult = (result: Array<unknown>) =>
    vi.mocked(classicApi.fetchData).mockResolvedValue({ result });

const mount = async (
    props: Record<string, unknown> = {},
    beforeMount?: () => void
) => {
    const wrapper = await testMount(PodcastInlineList, {
        props,
        beforeMount,
        stubs: ['SwiperList', 'ClassicLoading']
    });
    await flushPromises();
    return wrapper;
};

/** Search parameters of the nth API call (the last one by default) */
const searchParams = (call = -1) =>
    vi.mocked(classicApi.fetchData).mock.calls.at(call)?.[0].parameters;

describe('PodcastInlineList', () => {
    beforeEach(() => {
        vi.mocked(classicApi.fetchData).mockReset();
        mockResult([podcast(1), podcast(2)]);
    });

    describe('fetching', () => {
        it('searches the latest podcasts of the given organisation', async () => {
            await mount({ organisationId: ['org-1'], emissionId: 5 });
            expect(searchParams()).toMatchObject({
                organisationId: ['org-1'],
                emissionId: 5,
                sort: 'DATE'
            });
        });

        it('falls back on the filtered organisation', async () => {
            await mount({}, () => {
                useFilterStore().filterOrgaId = 'org-filter';
            });
            expect(searchParams()).toMatchObject({ organisationId: ['org-filter'] });
        });

        it('starts sorted by popularity when required', async () => {
            await mount({ requirePopularSort: true });
            expect(classicApi.fetchData).toHaveBeenCalledTimes(1);
            expect(searchParams()).toMatchObject({ sort: 'POPULARITY' });
        });

        it('limits popular podcasts to the last three months', async () => {
            await mount({ requirePopularSort: true, lastThreeMonths: true });
            expect(searchParams()?.after).toBeDefined();
        });

        it('fetches again when a filter changes', async () => {
            const wrapper = await mount({ emissionId: 5 });
            await wrapper.setProps({ emissionId: 6 });
            await flushPromises();
            expect(classicApi.fetchData).toHaveBeenCalledTimes(2);
            expect(searchParams()).toMatchObject({ emissionId: 6 });
        });
    });

    describe('display', () => {
        it('hides the list until podcasts are loaded', async () => {
            vi.mocked(classicApi.fetchData).mockReturnValue(new Promise(() => {}));
            const wrapper = await mount();
            expect(wrapper.findComponent(SwiperList).exists()).toBe(false);
            expect(wrapper.find('.podcast-inline-container').exists()).toBe(true);
        });

        it('excludes empty podcasts and the current podcast', async () => {
            mockResult([podcast(1), null, podcast(2)]);
            const wrapper = await mount({ podcastId: 2 });
            expect(wrapper.findComponent(SwiperList).props('listObject'))
                .toEqual([podcast(1)]);
        });

        it('renders nothing when there are no podcasts', async () => {
            mockResult([]);
            const wrapper = await mount({ title: 'Podcasts' });
            expect(wrapper.find('.podcast-inline-container').exists()).toBe(false);
        });
    });

    describe('sorting', () => {
        const buttons = (wrapper: Awaited<ReturnType<typeof mount>>) => {
            const [chrono, popular] = wrapper.findAll('button.btn-underline');
            return { chrono, popular };
        };

        it('switches between popular and chronological sorts', async () => {
            const wrapper = await mount();

            await buttons(wrapper).popular.trigger('click');
            await flushPromises();
            expect(searchParams()).toMatchObject({ sort: 'POPULARITY' });
            expect(buttons(wrapper).popular.classes()).toContain('active');

            await buttons(wrapper).chrono.trigger('click');
            await flushPromises();
            expect(searchParams()).toMatchObject({ sort: 'DATE' });
            expect(buttons(wrapper).chrono.classes()).toContain('active');
        });

        it('does not fetch again when choosing the current sort', async () => {
            const wrapper = await mount();
            await buttons(wrapper).chrono.trigger('click');
            await flushPromises();
            expect(classicApi.fetchData).toHaveBeenCalledTimes(1);
        });
    });

    describe('accessibility', () => {
        it('uses the title as a heading and as the list label', async () => {
            const wrapper = await mount({ title: 'Latest', titleTag: 'h3' });
            expect(wrapper.find('h3').text()).toBe('Latest');
            expect(wrapper.findComponent(SwiperList).props('label')).toBe('Latest');
        });
    });
});
