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
        >
            <input
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
import { computed, getCurrentInstance, nextTick, ref, shallowRef, watch } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import ChevronDownIcon from 'vue-material-design-icons/ChevronDown.vue';
import ClassicCheckbox from './ClassicCheckbox.vue';

const props = defineProps<{
    /** Optional label displayed above the field. */
    label?: string;
    /** Currently selected items. Bind with `v-model:selected`. */
    selected?: T[];
    /** Full list of options to display or filter. */
    options: T[];
    /** Key of each option object to use as the display label. */
    optionLabel: keyof T & string;
    /** Disables the field and all checkboxes when true. */
    isDisabled?: boolean;
    /** Placeholder shown in the input when no items are selected. Defaults to the translated "Search" string. */
    placeholder?: string;
    /** Label for the "select all" checkbox. Defaults to the translated "All" string. */
    selectAllText?: string;
    /** If provided, called on every input change; its return value replaces the displayed options. */
    onSearch?: (query: string) => T[] | Promise<T[]>;
    /** Disable the border around the input */
    noBorder?: boolean;
}>();

const emit = defineEmits<{
    /** Emitted when the selection changes. */
    (e: 'update:selected', value: T[]): void;
}>();

const { t } = useI18n();

const searchQuery = ref('');
const isOpen = ref(false);
const internalOptions = shallowRef<T[]>([]);
const containerRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

const computedId = computed(() => 'multiselect-' + getCurrentInstance()?.uid);

watch(
    () => props.options,
    (val) => {
        internalOptions.value = val;
    },
    { immediate: true }
);

const displayedOptions = computed((): Array<T> => {
    if (props.onSearch) {
        return internalOptions.value;
    }
    const query = searchQuery.value.toLowerCase();
    if (!query) {
        return props.options;
    }
    return props.options.filter((option) =>
        getLabel(option).toLowerCase().includes(query)
    );
});

const allSelected = computed(() => {
    if (displayedOptions.value.length === 0) {
        return false;
    }
    return displayedOptions.value.every((option) => isSelected(option));
});

const inputPlaceholder = computed(() => {
    const selected = props.selected ?? [];
    if (selected.length === 0) {
        return props.placeholder ?? t('Search');
    }
    const labels = selected.map(getLabel);
    if (labels.length <= 2) {
        return labels.join(', ');
    }
    return `${labels.slice(0, 2).join(', ')} (+${labels.length - 2})`;
});

function getLabel(option: T): string {
    return option[props.optionLabel] as string;
}

function isSelected(option: T): boolean {
    return props.selected?.includes(option) ?? false;
}

function toggleOption(option: T): void {
    const current = props.selected ?? [];
    if (isSelected(option)) {
        emit('update:selected', current.filter((item) => item !== option));
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
        emit('update:selected', current.filter((item: T) => !displayedOptions.value.includes(item)));
    }
}

function openDropdown(): void {
    if (props.isDisabled) {
        return;
    }
    isOpen.value = true;
    nextTick(() => {
        inputRef.value?.focus();
    });
}

function closeDropdown(): void {
    isOpen.value = false;
    searchQuery.value = '';
}

function toggleDropdown(): void {
    if (isOpen.value) {
        closeDropdown();
    } else {
        openDropdown();
    }
}

async function handleInput(): Promise<void> {
    if (!props.onSearch) {
        return;
    }
    const result = await props.onSearch(searchQuery.value);
    internalOptions.value = result;
}

onClickOutside(containerRef, closeDropdown);
</script>

<style lang="scss">
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

    .octopus-multiselect-input {
        flex: 1;
        border: none;
        background: transparent;
        padding: 0.4rem 0.5rem;
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
