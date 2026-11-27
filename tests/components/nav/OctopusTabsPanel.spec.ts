import OctopusTabsList from '@/components/nav/OctopusTabsList.vue';
import OctopusTabsPanel from '@/components/nav/OctopusTabsPanel.vue';
import { type TabID, useOctopusTabs } from '@/components/composable/nav/useOctopusTabs';
import { mount } from '@tests/utils';
import { defineComponent, ref } from 'vue';
import { describe, expect, it } from 'vitest';

describe('OctopusTabsPanel', () => {
    const mountPanel = (props: Record<string, unknown> = {}) =>
        mount(OctopusTabsPanel, {
            props: { prefix: 'p', tab: 1, ...props },
            slots: { default: 'Content' }
        });

    describe('with a selected tab', () => {
        it('is a tabpanel labelled by the selected tab', async () => {
            const wrapper = await mountPanel();
            expect(wrapper.attributes('id')).toBe('tab-panel-p');
            expect(wrapper.attributes('role')).toBe('tabpanel');
            expect(wrapper.attributes('aria-labelledby')).toBe('tab-item-p-1');
            expect(wrapper.text()).toBe('Content');
        });

        it('is not a live region', async () => {
            const wrapper = await mountPanel();
            expect(wrapper.attributes('aria-live')).toBeUndefined();
        });
    });

    describe('without a selected tab', () => {
        it('has no tab semantics but still renders its content', async () => {
            const wrapper = await mountPanel({ tab: undefined });
            expect(wrapper.attributes('role')).toBeUndefined();
            expect(wrapper.attributes('aria-labelledby')).toBeUndefined();
            expect(wrapper.text()).toBe('Content');
        });
    });

    describe('focus', () => {
        it('is in the tab order when its content is not focusable', async () => {
            const wrapper = await mountPanel();
            expect(wrapper.attributes('tabindex')).toBe('0');
        });

        it('is out of the tab order when its content is focusable', async () => {
            const wrapper = await mountPanel({ contentFocusable: true });
            expect(wrapper.attributes('tabindex')).toBe('-1');
        });
    });

    describe('with OctopusTabsList', () => {
        const Parent = defineComponent({
            components: { OctopusTabsList, OctopusTabsPanel },
            setup() {
                const { prefix } = useOctopusTabs();
                const tab = ref<TabID|undefined>();
                const tabs = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }];
                return { prefix, tab, tabs };
            },
            template: `
                <OctopusTabsList v-model:tab="tab" :tabs="tabs" :prefix="prefix" label="Tabs" />
                <OctopusTabsPanel :tab="tab" :prefix="prefix">Content</OctopusTabsPanel>
            `
        });

        it('links the selected tab and the panel both ways', async () => {
            const wrapper = await mount(Parent);
            await wrapper.findAll('[role="tab"]')[1].trigger('click');

            const selected = wrapper.find('[role="tab"][aria-selected="true"]');
            const panel = wrapper.find('[role="tabpanel"]');
            expect(selected.attributes('aria-controls')).toBe(panel.attributes('id'));
            expect(panel.attributes('aria-labelledby')).toBe(selected.attributes('id'));
            expect(selected.text()).toBe('B');
        });

        it('labels the panel with the first tab when none is selected', async () => {
            const wrapper = await mount(Parent);
            const first = wrapper.findAll('[role="tab"]')[0];
            expect(wrapper.find('[role="tabpanel"]').attributes('aria-labelledby')).toBe(first.attributes('id'));
        });
    });
});
