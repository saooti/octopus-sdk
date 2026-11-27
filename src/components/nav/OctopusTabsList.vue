<template>
    <div
        v-if="tabs.length > 0"
        role="tablist"
        class="tablist"
        :aria-labelledby="labelledBy"
        :aria-label="label"
    >
        <button
            v-for="_tab in tabs"
            :id="getTabId(prefix, _tab.id)"
            :key="_tab.id"
            :ref="el => setTabRef(_tab.id, el as HTMLButtonElement)"
            class="tab-item"
            :class="buttonClass"
            type="button"
            role="tab"
            :aria-controls="getPanelId(prefix)"
            :aria-selected="isSelected(_tab)"
            :aria-current="_tab.current"
            :tabindex="isSelected(_tab) ? 0 : -1"
            @click="changeTab(_tab)"
            @keydown="moveTab(_tab, $event)"
        >
            <slot name="tab" :tab="_tab">
                {{ _tab.label }}
            </slot>
        </button>
    </div>
</template>

<script setup generic="T extends TabItem" lang="ts">
import { computed, watch } from 'vue';
import { TabID, TabItem, getPanelId, getTabId } from '../composable/nav/useOctopusTabs';

interface BaseProps {
    /** Currently selected tab */
    tab?: TabID;
    /** List of available tabs */
    tabs: Array<T>;
    /** Unique prefix ID for this component (use the same for matching
    OctopusTabsPanel)*/
    prefix: string;
    /** Extend the active tab */
    extend?: boolean;
    /** Type of indicator */
    indicator?: 'border'|'arrow';
}

interface LabelledByProps {
    labelledBy: string;
    label?: never;
}

interface LabelProps {
    labelledBy?: never;
    label: string;
}

type Props = BaseProps & (LabelledByProps | LabelProps);

//Props 
const props = withDefaults(defineProps<Props>(), {
    indicator: 'border'
});

const emit = defineEmits<{
    /** Update the currently active tab */
    (e: 'update:tab', tab: TabID|undefined): void;
}>();

const tabRefs = new Map<TabID, HTMLButtonElement>();

const buttonClass = computed((): Array<string> => {
    const ary: Array<string> = [];
    if (props.extend === true) {
        ary.push('extend');
    }
    ary.push(`indicator-${props.indicator}`);
    return ary;
});

const selectedId = computed((): TabID|undefined => {
    if (props.tabs.length === 0) {
        return undefined;
    }
    if (props.tabs.some(t => t.id === props.tab)) {
        return props.tab;
    } else {
        return props.tabs[0].id;
    }
});

watch(selectedId, id => {
    if (id !== props.tab) {
        emit('update:tab', id);
    }
}, { immediate: true });

function isSelected(tab: TabItem): boolean {
    return tab.id === selectedId.value;
}

function changeTab(tab: TabItem): void {
    emit('update:tab', tab.id);
}

function setTabRef(id: TabID, element: HTMLButtonElement|null): void {
    if (element === null) {
        tabRefs.delete(id);
    } else {
        tabRefs.set(id, element);
    }
}

function moveTab(tab: TabItem, event: KeyboardEvent): void {
    const idx = props.tabs.findIndex(t => t.id === tab.id);
    let next: number;
    const l = props.tabs.length;

    if (event.key === "ArrowRight") {
        next = (idx + 1 + l) % l;
    } else if (event.key === "ArrowLeft") {
        next = (idx - 1 + l) % l;
    } else if (event.key === "Home") {
        next = 0;
    } else if (event.key === "End") {
        next = l - 1;
    } else {
        return;
    }

    event.preventDefault();

    const newTab = props.tabs[next];
    changeTab(newTab);
    tabRefs.get(newTab.id)?.focus();
}
</script>

<style scoped lang="scss">
.tablist {
    display: flex;
    overflow-x: auto;
    padding: 4px;
}

.tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    // Force equal size for tabs
    flex: 1 1 0;
    min-width: var(--octopus-tabs-min-width, 5rem);

    padding: 0.5rem;
    padding-bottom: 0.75rem;
    border-radius: 0;
    border: var(--border-width) solid transparent;

    // To position the arrow indicator
    position: relative;

    // Animate selection
    transition: flex-grow 0.2s;

    --border-width: 1px;
    --radius: 5px;

    &:first-child {
        border-top-left-radius: var(--radius);
        border-bottom-left-radius: var(--radius);
    }

    &:last-child {
        border-top-right-radius: var(--radius);
        border-bottom-right-radius: var(--radius);
    }

    &:not(:last-child) {
        border-right: 1px solid var(--octopus-primary-really-transparent);
    }

    &[aria-selected="true"] {
        z-index: 1;
        font-weight: 600;

        &.extend {
            flex-grow: 2;
        }

        &:hover {
            border-color: var(--octopus-color-on-primary);
        }

        &.indicator-border {
            border: 2px solid var(--octopus-primary);
            background: var(--octopus-background);
        }

        &.indicator-arrow {
            background: var(--octopus-primary);
            color: var(--octopus-color-on-primary);

            &::after {
                --indicator-size: 10px;
                --indicator-color: var(--octopus-background);
                content: "";
                position: absolute;
                bottom: calc(var(--border-width) * -1);
                translate: -50% 0;
                left: 50%;
                background-color: var(--indicator-color);
                width: calc(var(--indicator-size) * 2);
                height: var(--indicator-size);
                clip-path: polygon(50% 0, 100% 100%, 0 100%);
            }
        }

        @media (forced-colors: active) {
            &.indicator-border, &.indicator-arrow {
                background: Highlight;
                color: HighlightText;
                border-color: Highlight;
            }
        }
    }

    &:hover {
        background-color: var(--octopus-primary-really-transparent);
    }

    // Disable animations
    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
}
</style>
