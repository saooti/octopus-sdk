<template>
    <div
        ref="containerRef"
        class="octopus-select"
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
            class="octopus-select-field"
            :class="{ disabled: isDisabled, open: isOpen, noBorder }"
            @click="openDropdown"
        >
            <span
                v-show="selectedLabel && !isOpen"
                class="octopus-select-value"
            >{{ selectedLabel }}</span>
            <input
                v-show="!selectedLabel || isOpen"
                :id="computedId"
                ref="inputRef"
                v-model="searchQuery"
                type="text"
                class="octopus-select-input"
                :placeholder="inputPlaceholder"
                :disabled="isDisabled"
                @focus="openDropdown"
                @input="handleInput"
            >
            <button
                class="btn-transparent octopus-select-chevron"
                :disabled="isDisabled"
                @click.stop="toggleDropdown"
            >
                <ChevronDownIcon />
            </button>
        </div>

        <Teleport to=".octopus-app">
            <div
                v-if="isOpen"
                ref="dropdownRef"
                class="octopus-select-dropdown"
                :style="dropdownStyle"
            >
                <div class="octopus-select-options">
                    <button
                        v-for="(option, index) in displayedOptions"
                        :key="index"
                        class="octopus-select-option"
                        :class="{ selected: isSelected(option) }"
                        @click="selectOption(option)"
                    >
                        {{ getLabel(option) }}
                    </button>
                    <span v-if="displayedOptions.length === 0" class="text-indic px-2">
                        {{ t('No elements found. Consider changing the search query.') }}
                    </span>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts" generic="T">
import { type CSSProperties, computed, nextTick, onMounted, onUnmounted, ref, toRaw, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import ChevronDownIcon from 'vue-material-design-icons/ChevronDown.vue';
import { useOctopusDropdown } from '../composable/form/useOctopusDropdown';

const props = withDefaults(defineProps<{
    /** Optional label displayed above the field. */
    label?: string;
    /** Currently selected item. Bind with `v-model:value`. */
    value?: T;
    /** Full list of options to display or filter. */
    options: T[];
    /** Key of each option object to use as the ID. */
    optionKey?: keyof T;
    /** Key of each option object to use as the display label. */
    optionLabel: keyof T & string;
    /** Disables the field when true. */
    isDisabled?: boolean;
    /** Placeholder shown in the input when no item is selected. Defaults to the translated "Search" string. */
    placeholder?: string;
    /** Disable the border around the input. */
    noBorder?: boolean;
    /** When true (default), clicking the already-selected option clears the selection. */
    allowDeselect?: boolean;
}>(), {
    label: undefined,
    value: undefined,
    optionKey: undefined,
    placeholder: undefined,
    allowDeselect: true,
});

const emit = defineEmits<{
    /** Emitted when the selection changes. */
    (e: 'update:value', value: T | undefined): void;
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
    containerRef,
    inputRef,
    computedId,
    displayedOptions,
    inputPlaceholder,
    getLabel,
    openDropdown,
    closeDropdown,
    toggleDropdown,
    handleInput,
} = useOctopusDropdown(props, (query) => emit('search', query), 'select', [dropdownRef]);

// Position of the teleported dropdown (position: fixed, anchored below the trigger field)
const dropdownStyle = ref<CSSProperties>({});

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

watch(isOpen, (val) => {
    if (val) {
        nextTick(updateDropdownPosition);
    }
});

onMounted(() => {
    // Keep the teleported dropdown aligned when the page scrolls or the viewport resizes
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
});

onUnmounted(() => {
    window.removeEventListener('scroll', updateDropdownPosition, true);
    window.removeEventListener('resize', updateDropdownPosition);
});

const selectedLabel = computed(() =>
    props.value !== undefined ? getLabel(props.value) : undefined
);

function isSelected(option: T): boolean {
    if (props.value === undefined) {
        return false;
    }
    if (props.optionKey) {
        return props.value[props.optionKey] === option[props.optionKey];
    }
    return toRaw(props.value as object) === toRaw(option as object);
}

function selectOption(option: T): void {
    if (isSelected(option) && props.allowDeselect) {
        emit('update:value', undefined);
    } else {
        emit('update:value', option);
    }
    closeDropdown();
}
</script>

<style scoped lang="scss">
.octopus-select {
    position: relative;

    .octopus-select-field {
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

    .octopus-select-value {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0.4rem 0.5rem;
        padding-right: 0;
        height: 2rem;
    }

    .octopus-select-input {
        flex: 1;
        border: none;
        background: transparent;
        padding: 0.4rem 0.5rem;
        height: 2rem;
        outline: none;
        cursor: inherit;
        min-width: 0;
    }

    .octopus-select-chevron {
        padding: 0.25rem 0.5rem;
        display: flex;
        align-items: center;
    }

}

// Dropdown is teleported to body — scoped rules must be top-level so that [data-v-xxxx]
// is matched directly on the element rather than via a descendant-of-.octopus-select selector.
.octopus-select-dropdown {
    z-index: 100;
    background: white;
    border: 1px solid var(--octopus-border-default);
    border-radius: var(--octopus-border-radius);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 0.25rem 0;
}

.octopus-select-options {
    max-height: 14rem;
    overflow-y: auto;
}

.octopus-select-option {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.25rem 0.5rem;
    border: none;
    background: transparent;
    cursor: pointer;

    &:hover {
        background: var(--octopus-secondary-lighter);
    }

    &.selected {
        font-weight: 600;
        color: var(--octopus-primary);
    }
}
</style>
