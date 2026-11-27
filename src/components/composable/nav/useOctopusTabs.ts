import { useId } from "vue";

export type TabID = string|number;

export interface TabItem {
    /** ID of the item */
    id: TabID;
    /** Label displayed for the item */
    label: string;
    /** Indicate this is the current element (current date, step, etc) */
    current?: 'date'|'step'|'page'|'location'|'time'|'true'|'false';
}

export function getTabId(prefix: string, tab: TabID): string {
    const id = String(tab).replace(/\s+/g, '-');
    return `tab-item-${prefix}-${id}`;
}

export function getPanelId(prefix: string, tab?: TabID): string {
    if (tab === undefined) {
        return `tab-panel-${prefix}`;
    } else {
        const id = String(tab).replace(/\s+/g, '-');
        return `tab-panel-${prefix}-${id}`;
    }
}

export const useOctopusTabs = () => {
    const prefix = useId();

    return {
        prefix,
        getTabId: (tab: TabID) => getTabId(prefix, tab),
        getPanelId: (tab?: TabID) => getPanelId(prefix, tab)
    };
};
