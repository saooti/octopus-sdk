<template>
    <div
        ref="containerRef"
        class="octopus-multiselect"
        :class="{ 'form-margin': label }"
    >
        <label
            v-if="label"
            :for="computedId"
            class="form-label"
        >
            {{ label }}
        </label>

        <div
            class="octopus-multiselect-field"
            :class="{ disabled: isDisabled, open: isOpen, noBorder }"
            @click="openDropdown"
            @mouseenter="isHovered = true"
            @mouseleave="isHovered = false"
        >
            <div
                v-show="hasSelected && !isOpen"
                ref="selectionRef"
                class="octopus-multiselect-selection"
            >
                <span class="octopus-multiselect-selection-text">{{ selectionLabels }}</span>
                <span
                    v-if="overflowCount > 0"
                    class="octopus-multiselect-selection-count"
                >(+{{ overflowCount }})</span>
            </div>
            <input
                v-show="!hasSelected || isOpen"
                :id="computedId"
                ref="inputRef"
                v-model="searchQuery"
                type="text"
                class="octopus-multiselect-input"
                :placeholder="inputPlaceholder"
                :disabled="isDisabled"
                @focus="openDropdown"
                @input="handleInput"
            >
            <button
                class="btn-transparent octopus-multiselect-chevron"
                :disabled="isDisabled"
                @click.stop="toggleDropdown"
            >
                <ChevronDownIcon />
            </button>
        </div>

        <div
            v-if="expandOnHover && isHovered && !isOpen && overflowCount > 0"
            class="octopus-multiselect-hover-tooltip"
        >
            {{ allLabelsText }}
        </div>

        <div v-if="isOpen" class="octopus-multiselect-dropdown">
            <ClassicCheckbox
                :text-init="allSelected"
                :label="selectAllText ?? t('All')"
                :is-disabled="isDisabled"
                @update:text-init="toggleAll"
            />

            <div class="octopus-multiselect-options">
                <ClassicCheckbox
                    v-for="(option, index) in displayedOptions"
                    :key="index"
                    :text-init="isSelected(option)"
                    :label="getLabel(option)"
                    :is-disabled="isDisabled"
                    @update:text-init="toggleOption(option)"
                />
                <span v-if="displayedOptions.length === 0" class="text-indic px-2">
                    {{ t('No elements found. Consider changing the search query.') }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" generic="T">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import ChevronDownIcon from 'vue-material-design-icons/ChevronDown.vue';
import ClassicCheckbox from './ClassicCheckbox.vue';
import { useOctopusDropdown } from '../composable/form/useOctopusDropdown';

const props = defineProps<{
    /** Optional label displayed above the field. */
    label?: string;
    /** Currently selected items. Bind with `v-model:selected`. */
    selected?: T[];
    /** Full list of options to display or filter. */
    options: T[];
    /** Key of each option object to use as the ID */
    optionKey?: keyof T;
    /** Key of each option object to use as the display label. */
    optionLabel: keyof T & string;
    /** Disables the field and all checkboxes when true. */
    isDisabled?: boolean;
    /** Placeholder shown in the input when no items are selected. Defaults to the translated "Search" string. */
    placeholder?: string;
    /** Label for the "select all" checkbox. Defaults to the translated "All" string. */
    selectAllText?: string;
    /** Disable the border around the input */
    noBorder?: boolean;
    /** When true, hovering the closed field with overflow shows a tooltip listing all selected items. */
    expandOnHover?: boolean;
}>();

const emit = defineEmits<{
    /** Emitted when the selection changes. */
    (e: 'update:selected', value: T[]): void;
    /** Emitted on every input change. When listened to, the parent is responsible for
     *  updating `options`; otherwise the component filters `options` client-side. */
    (e: 'search', query: string): void;
}>();

const { t } = useI18n();

const {
    searchQuery,
    isOpen,
    isHovered,
    containerRef,
    inputRef,
    computedId,
    displayedOptions,
    inputPlaceholder,
    getLabel,
    openDropdown,
    toggleDropdown,
    handleInput,
} = useOctopusDropdown(props, (query) => emit('search', query), 'multiselect');

const selectionRef = ref<HTMLElement | null>(null);
const visibleCount = ref(2);

const allSelected = computed(() => {
    if (displayedOptions.value.length === 0) {
        return false;
    }
    return displayedOptions.value.every((option) => isSelected(option));
});

const hasSelected = computed(() => (props.selected?.length ?? 0) > 0);

const selectionLabels = computed(() =>
    (props.selected ?? []).slice(0, visibleCount.value).map(getLabel).join(', ')
);

const overflowCount = computed(() =>
    Math.max(0, (props.selected?.length ?? 0) - visibleCount.value)
);

const allLabelsText = computed(() =>
    (props.selected ?? []).map(getLabel).join(', ')
);

function isSelected(option: T): boolean {
    if (props.optionKey) {
        return props.selected?.find(s => s[props.optionKey] === option[props.optionKey]) !== undefined;
    } else {
        return props.selected?.includes(option) ?? false;
    }
}

function toggleOption(option: T): void {
    const current = props.selected ?? [];
    if (isSelected(option)) {
        const key = props.optionKey;
        emit('update:selected', key
            ? current.filter((item) => item[key] !== option[key])
            : current.filter((item) => item !== option)
        );
    } else {
        emit('update:selected', [...current, option]);
    }
}

function toggleAll(val: boolean): void {
    const current = props.selected ?? [];
    if (val) {
        const toAdd = displayedOptions.value.filter((option: T) => !isSelected(option));
        emit('update:selected', [...current, ...toAdd]);
    } else {
        const key = props.optionKey;
        emit('update:selected', current.filter((item: T) => key
            ? !displayedOptions.value.some((opt) => opt[key] === item[key])
            : !displayedOptions.value.includes(item)
        ));
    }
}

function updateVisibleCount(): void {
    const container = selectionRef.value;
    const selected = props.selected ?? [];
    if (!container || selected.length < 2) {
        visibleCount.value = selected.length;
        return;
    }

    const availableWidth = container.offsetWidth;
    if (availableWidth === 0) {
        return;
    }

    const labels = selected.map(getLabel);
    const measurer = document.createElement('span');
    measurer.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;';
    container.appendChild(measurer);

    measurer.textContent = labels.join(', ');
    if (measurer.offsetWidth <= availableWidth) {
        visibleCount.value = labels.length;
        container.removeChild(measurer);
        return;
    }

    measurer.textContent = `(+${labels.length})`;
    const badgeWidth = measurer.offsetWidth + 4;
    const textAvailable = availableWidth - badgeWidth;

    let count = 0;
    for (let i = 0; i < labels.length; i++) {
        measurer.textContent = labels.slice(0, i + 1).join(', ');
        if (measurer.offsetWidth > textAvailable) {
            break;
        }
        count = i + 1;
    }

    container.removeChild(measurer);
    visibleCount.value = Math.max(1, count);
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
    if (selectionRef.value) {
        resizeObserver = new ResizeObserver(updateVisibleCount);
        resizeObserver.observe(selectionRef.value);
    }
    updateVisibleCount();
});

onUnmounted(() => {
    resizeObserver?.disconnect();
});

watch(() => props.selected, updateVisibleCount);

watch(isOpen, (val) => {
    if (!val) {
        nextTick(updateVisibleCount);
    }
});
</script>

<style scoped lang="scss">
.octopus-multiselect {
    position: relative;

    .octopus-multiselect-field {
        display: flex;
        align-items: center;
        border: 1px solid var(--octopus-border-default);
        border-radius: var(--octopus-border-radius);
        background: white;
        cursor: pointer;

        &.open {
            border-color: var(--octopus-primary);
        }

        &.disabled {
            background: var(--octopus-secondary-lighter);
            cursor: default;
        }

        &.noBorder {
            border: none;
        }
    }

    .octopus-multiselect-selection {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        padding: 0.4rem 0.5rem;
        height: 2rem;
        gap: 0.25rem;
    }

    .octopus-multiselect-selection-text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .octopus-multiselect-selection-count {
        flex-shrink: 0;
        white-space: nowrap;
        color: var(--octopus-primary);
    }

    .octopus-multiselect-input {
        flex: 1;
        border: none;
        background: transparent;
        padding: 0.4rem 0.5rem;
        padding-right: 0;
        height: 2rem;
        outline: none;
        cursor: inherit;
        min-width: 0;
    }

    .octopus-multiselect-hover-tooltip {
        position: absolute;
        top: calc(100% + 2px);
        left: 0;
        right: 0;
        z-index: 101;
        background: white;
        border: 1px solid var(--octopus-border-default);
        border-radius: var(--octopus-border-radius);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        padding: 0.5rem;
        word-break: break-word;
        pointer-events: none;
    }

    .octopus-multiselect-chevron {
        padding: 0.25rem 0.5rem;
        display: flex;
        align-items: center;
    }

    .octopus-multiselect-dropdown {
        position: absolute;
        top: calc(100% + 2px);
        left: 0;
        right: 0;
        z-index: 100;
        background: white;
        border: 1px solid var(--octopus-border-default);
        border-radius: var(--octopus-border-radius);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        padding: 0.25rem 0;

        > .octopus-form-item {
            padding: 0.25rem 0.5rem;
            border-bottom: 1px solid var(--octopus-secondary);
        }
    }

    .octopus-multiselect-options {
        max-height: 14rem;
        overflow-y: auto;

        .octopus-form-item {
            padding: 0.25rem 0.5rem;
        }
    }
}
</style>
