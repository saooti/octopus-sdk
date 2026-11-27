import OctopusTabsList from '@/components/nav/OctopusTabsList.vue';
import { mount, VueWrapper } from '@tests/utils';
import { afterEach, describe, expect, it } from 'vitest';

const TABS = [
    { id: 0, label: 'Monday' },
    { id: 1, label: 'Tuesday' },
    { id: 2, label: 'Wednesday' }
];

describe('OctopusTabsList', () => {
    let wrapper: VueWrapper | undefined;

    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
    });

    const mountList = async (props: Record<string, unknown> = {}) => {
        wrapper = await mount(OctopusTabsList, {
            props: { tabs: TABS, tab: 0, prefix: 'p', label: 'Days', ...props },
            attachTo: document.body
        });
        return wrapper;
    };

    const tabs = (w: VueWrapper) => w.findAll('[role="tab"]');
    const emitted = (w: VueWrapper) => w.emitted<[unknown]>('update:tab')?.map(e => e[0]) ?? [];

    /** Dispatch a cancelable keydown, returns whether its default was prevented */
    const press = (w: VueWrapper, index: number, key: string): boolean => {
        const event = new KeyboardEvent('keydown', { key, cancelable: true, bubbles: true });
        tabs(w)[index].element.dispatchEvent(event);
        return event.defaultPrevented;
    };

    describe('accessible name', () => {
        it('uses label', async () => {
            const w = await mountList();
            expect(w.find('[role="tablist"]').attributes('aria-label')).toBe('Days');
            expect(w.find('[role="tablist"]').attributes('aria-labelledby')).toBeUndefined();
        });

        it('uses labelledBy', async () => {
            const w = await mountList({ label: undefined, labelledBy: 'title' });
            expect(w.find('[role="tablist"]').attributes('aria-labelledby')).toBe('title');
            expect(w.find('[role="tablist"]').attributes('aria-label')).toBeUndefined();
        });
    });

    describe('selection', () => {
        it('marks only the selected tab with aria-selected and tabindex 0', async () => {
            const w = await mountList({ tab: 1 });
            expect(tabs(w).map(t => t.attributes('aria-selected'))).toEqual(['false', 'true', 'false']);
            expect(tabs(w).map(t => t.attributes('tabindex'))).toEqual(['-1', '0', '-1']);
        });

        it.each([
            ['missing', undefined],
            ['not matching', 42]
        ])('falls back on the first tab when tab is %s', async (_, tab) => {
            const w = await mountList({ tab });
            expect(tabs(w).filter(t => t.attributes('tabindex') === '0')).toHaveLength(1);
            expect(tabs(w)[0].attributes('aria-selected')).toBe('true');
            expect(emitted(w)).toEqual([0]);
        });

        it('does not emit when tab matches, including the id 0', async () => {
            const w = await mountList({ tab: 0 });
            expect(emitted(w)).toEqual([]);
        });

        it('emits only the clicked tab id', async () => {
            const w = await mountList();
            await tabs(w)[2].trigger('click');
            await w.setProps({ tab: 2 });
            expect(emitted(w)).toEqual([2]);
        });

        it('emits undefined and renders no tablist when tabs become empty', async () => {
            const w = await mountList({ tab: 1 });
            await w.setProps({ tabs: [] });
            expect(w.find('[role="tablist"]').exists()).toBe(false);
            expect(emitted(w)).toEqual([undefined]);
        });
    });

    describe('ids', () => {
        it('links each tab to the panel', async () => {
            const w = await mountList();
            expect(tabs(w)[1].attributes('id')).toBe('tab-item-p-1');
            tabs(w).forEach(t => expect(t.attributes('aria-controls')).toBe('tab-panel-p'));
        });

        it('sets aria-current only on the current tab, independently of the selection', async () => {
            const w = await mountList({
                tabs: [TABS[0], { ...TABS[1], current: 'date' }, TABS[2]],
                tab: 2
            });
            expect(tabs(w).map(t => t.attributes('aria-current'))).toEqual([undefined, 'date', undefined]);
            expect(tabs(w)[2].attributes('aria-selected')).toBe('true');
        });

        it('replaces whitespace in tab ids', async () => {
            const w = await mountList({ tabs: [{ id: 'a b', label: 'A' }], tab: 'a b' });
            expect(tabs(w)[0].attributes('id')).toBe('tab-item-p-a-b');
        });
    });

    describe('keyboard', () => {
        it.each([
            ['ArrowRight', 0, 1],
            ['ArrowRight', 2, 0],
            ['ArrowLeft', 1, 0],
            ['ArrowLeft', 0, 2],
            ['Home', 2, 0],
            ['End', 0, 2]
        ])('%s from tab %i selects and focuses tab %i', async (key, from, to) => {
            const w = await mountList({ tab: from });
            expect(press(w, from, key)).toBe(true);
            expect(emitted(w)).toEqual([to]);
            expect(document.activeElement).toBe(tabs(w)[to].element);
        });

        it.each(['Tab', 'Enter', 'ArrowDown', 'a'])('ignores %s', async key => {
            const w = await mountList();
            expect(press(w, 0, key)).toBe(false);
            expect(emitted(w)).toEqual([]);
        });
    });
});
