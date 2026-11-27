import { useId } from "vue";

export type TabID = string|number;

export interface TabItem {
    /** ID of the item */
    id: TabID;
    /** Label displayed for the item */
    label: string;
}

export function getTabId(prefix: string, tab: TabID): string {
    return `tab-item-${prefix}-${tab}`;
}

export const useOctopusTabs = () => {
    const prefix = useId();

    return {
        prefix,
        getTabId: (tab: TabID) => getTabId(prefix, tab)
    }
}
