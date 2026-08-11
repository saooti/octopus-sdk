<!--
    Replacement component for ClassicNav
    It is easier to use, and rely on user-defined ids to identify the slots,
    instead of indices.
-->
<template>
    <ClassicNav
        v-model:active-tab="activeTab"
        :tab-number="tabs.length"
        :flex-column="flexColumn"
    >
        <template v-for="(tab, index) in tabs" #[index]>
            {{ tab.label }}
        </template>

        <template v-for="(tab, index) in tabs" #[tabSlotName(index)]>
            <slot :name="'tab-' + tab.id" />
        </template>
    </ClassicNav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ClassicNav from './ClassicNav.vue';

/** Type for the ID of tabs */
type TabId = string|number;

export interface Tab {
    /** ID of the tab, used for slots */
    id: TabId;
    /** Label displayed for the tab */
    label: string;
};

const props = defineProps<{
    /** Tabs definition */
    tabs: Array<Tab>;
    /** Currently active tab */
    activeTab: TabId;
    /** Apply flex-column to content */
    flexColumn?: boolean;
}>();

const emit = defineEmits<{
    /** Emitted when the tab changes */
    (e: 'update:active-tab', tab: string|number): void;
}>();

/** Currently active tab, just a proxy */
const activeTab = computed({
    get: () => props.tabs.findIndex(t => t.id === props.activeTab),
    set: (index: number) => emit('update:active-tab', props.tabs[index].id)
});

/** Get the tab content slot name */
function tabSlotName(index: number): string {
    return 'tab' + index;
}
</script>
