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
            :class="{ disabled, open: isOpen, noBorder }"
            @click="openDropdown"
            @mouseenter="onFieldMouseEnter"
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
                :disabled="disabled"
                @focus="openDropdown"
                @input="handleInput"
                @keydown.enter="handleCustomValueEnter"
            >
            <button
                class="btn-transparent octopus-multiselect-chevron"
                :disabled="disabled"
                @click.stop="toggleDropdown"
            >
                <ChevronDownIcon />
            </button>
        </div>

        <Teleport :to="teleportTarget">
            <div
                v-if="expandOnHover && isHovered && !isOpen && overflowCount > 0"
                class="octopus-multiselect-hover-tooltip"
                :style="dropdownStyle"
            >
                {{ allLabelsText }}
            </div>

            <div
                v-if="isOpen"
                ref="dropdownRef"
                class="octopus-multiselect-dropdown"
                :style="dropdownStyle"
            >
                <ClassicCheckbox
                    :text-init="allSelected"
                    :label="selectAllText ?? t('All')"
                    :is-disabled="disabled"
                    @update:text-init="toggleAll"
                />

                <div class="octopus-multiselect-options">
                    <ClassicCheckbox
                        v-for="(option, index) in visibleOptions"
                        :key="index"
                        :text-init="isSelected(option)"
                        :label="getLabel(option)"
                        :is-disabled="disabled"
                        @update:text-init="toggleOption(option)"
                    />
                    <template v-if="allowCustomValue && searchQuery.trim()">
                        <hr v-if="visibleOptions.length > 0">
                        <span class="text-indic px-2">
                            {{ t('Press Enter to add this value') }}
                        </span>
                    </template>
                    <span v-else-if="visibleOptions.length === 0" class="text-indic px-2">
                        {{ t('No elements found. Consider changing the search query.') }}
                    </span>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts" generic="T">
import { type CSSProperties, computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
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
    /** Key of each option object to use as the display label. Omit when `options` is a
     *  plain `string[]` — each string is used as its own label. Note: omitting this for
     *  an object array is a runtime mistake (not caught at compile time) and will render
     *  "[object Object]". */
    optionLabel?: keyof T & string;
    /** When true, pressing Enter in the search input adds the typed text as a new
     *  selected value, even if it doesn't match any option. Intended for use when
     *  options are plain strings (`optionLabel` omitted) — casting arbitrary typed
     *  text into an object-shaped T would not produce a valid option. */
    allowCustomValue?: boolean;
    /** Disables the field and all checkboxes when true. */
    disabled?: boolean;
    /** Placeholder shown in the input when no items are selected. Defaults to the translated "Search" string. */
    placeholder?: string;
    /** Label for the "select all" checkbox. Defaults to the translated "All" string. */
    selectAllText?: string;
    /** Disable the border around the input */
    noBorder?: boolean;
    /** When true, hovering the closed field with overflow shows a tooltip listing all selected items. */
    expandOnHover?: boolean;
    /** When true, options selected at the moment the dropdown opens are moved to the
     *  top of the list. This is a snapshot taken at open time — it does not live-reorder
     *  while the dropdown stays open, only on the next closed→open transition. */
    pullSelectedToTop?: boolean;
}>();

const emit = defineEmits<{
    /** Emitted when the selection changes. */
    (e: 'update:selected', value: T[]): void;
    /** Emitted on every input change. When listened to, the parent is responsible for
     *  updating `options`; otherwise the component filters `options` client-side. */
    (e: 'search', query: string): void;
}>();

const { t } = useI18n();

// Ref on the teleported dropdown div — passed as ignored element to useOctopusDropdown
// so clicks inside the dropdown don't trigger the click-outside handler.
const dropdownRef = ref<HTMLElement | null>(null);

const {
    searchQuery,
    isOpen,
    isHovered,
    containerRef,
    inputRef,
    teleportTarget,
    computedId,
    displayedOptions,
    inputPlaceholder,
    getLabel,
    openDropdown,
    toggleDropdown,
    handleInput,
} = useOctopusDropdown(props, (query) => emit('search', query), 'multiselect', [dropdownRef]);

const selectionRef = ref<HTMLElement | null>(null);

// Position of the teleported dropdown (position: fixed, anchored below the trigger field)
const dropdownStyle = ref<CSSProperties>({});

// Also used to position the hover tooltip: both are teleported and anchored the same way
// (fixed, directly below the field, same width), and are never shown at the same time.
function updateDropdownPosition(): void {
    if (!containerRef.value) { return; }
    const rect = containerRef.value.getBoundingClientRect();
    dropdownStyle.value = {
        position: 'fixed',
        top: `${rect.bottom + 2}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
    };
}

function onFieldMouseEnter(): void {
    isHovered.value = true;
    if (props.expandOnHover) {
        nextTick(updateDropdownPosition);
    }
}

const visibleCount = ref(2);

// Selection snapshot captured the instant the dropdown opens, used only to freeze the
// sort order when pullSelectedToTop is set — does not react to later `selected` changes
// while the dropdown stays open.
const pinnedSnapshot = ref<T[]>([]);

// Selected values not present in `options` — only populated when allowCustomValue is set,
// so a custom value typed via handleCustomValueEnter still shows (checked) in the dropdown.
const customSelectedOptions = computed<T[]>(() => {
    if (!props.allowCustomValue) { return []; }
    return (props.selected ?? []).filter((item) => !isInOptions(item));
});

const visibleOptions = computed<T[]>(() => {
    const query = searchQuery.value.toLowerCase();
    const filteredCustom = query
        ? customSelectedOptions.value.filter((option) => getLabel(option).toLowerCase().includes(query))
        : customSelectedOptions.value;
    const combined = [...displayedOptions.value, ...filteredCustom];
    if (!props.pullSelectedToTop) {
        return combined;
    }
    return [...combined.filter(isPinned), ...combined.filter((option) => !isPinned(option))];
});

const allSelected = computed(() => {
    if (visibleOptions.value.length === 0) {
        return false;
    }
    return visibleOptions.value.every((option) => isSelected(option));
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

function isInOptions(option: T): boolean {
    if (props.optionKey) {
        return props.options.some((opt) => opt[props.optionKey] === option[props.optionKey]);
    } else {
        return props.options.includes(option);
    }
}

function isPinned(option: T): boolean {
    if (props.optionKey) {
        return pinnedSnapshot.value.some((s) => s[props.optionKey] === option[props.optionKey]);
    } else {
        return pinnedSnapshot.value.includes(option);
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

function handleCustomValueEnter(): void {
    if (!props.allowCustomValue) { return; }
    const value = searchQuery.value.trim();
    if (!value) { return; }
    const customOption = value as unknown as T;
    if (!isSelected(customOption)) {
        emit('update:selected', [...(props.selected ?? []), customOption]);
    }
    searchQuery.value = '';
}

function toggleAll(val: boolean): void {
    const current = props.selected ?? [];
    if (val) {
        const toAdd = visibleOptions.value.filter((option: T) => !isSelected(option));
        emit('update:selected', [...current, ...toAdd]);
    } else {
        const key = props.optionKey;
        emit('update:selected', current.filter((item: T) => key
            ? !visibleOptions.value.some((opt) => opt[key] === item[key])
            : !visibleOptions.value.includes(item)
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
    // Keep the teleported dropdown aligned when the page scrolls or the viewport resizes
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
});

onUnmounted(() => {
    resizeObserver?.disconnect();
    window.removeEventListener('scroll', updateDropdownPosition, true);
    window.removeEventListener('resize', updateDropdownPosition);
});

watch(() => props.selected, updateVisibleCount);

watch(isOpen, (val) => {
    if (val) {
        pinnedSnapshot.value = [...(props.selected ?? [])];
        nextTick(updateDropdownPosition);
    } else {
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

    .octopus-multiselect-chevron {
        padding: 0.25rem 0.5rem;
        display: flex;
        align-items: center;
    }

}

// Dropdown/tooltip are teleported to body — scoped rules must be top-level so that
// [data-v-xxxx] is matched directly on the element rather than via a descendant-of-.octopus-multiselect selector.
.octopus-multiselect-hover-tooltip {
    z-index: 101;
    background: white;
    border: 1px solid var(--octopus-border-default);
    border-radius: var(--octopus-border-radius);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 0.5rem;
    word-break: break-word;
    pointer-events: none;
}

.octopus-multiselect-dropdown {
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

hr {
    border-top: 1px solid var(--octopus-secondary);
    border-bottom: none;
    margin: 0;
}
</style>
