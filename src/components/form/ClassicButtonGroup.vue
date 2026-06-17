<template>
    <div class="classic-button-group">
        <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="btn"
            :class="{ active: value.includes(option.value) }"
            @click="toggle(option.value)"
        >
            {{ option.label }}
        </button>
    </div>
</template>

<script setup lang="ts" generic="T">
export interface ButtonGroupOption<T> {
    label: string;
    value: T;
}

const props = defineProps<{
    /** Currently selected values */
    value: T[];
    /** Possible values */
    options: ButtonGroupOption<T>[];
}>();

const emit = defineEmits<{
    (e: 'update:value', values: T[]): void;
}>();

function toggle(value: T): void {
    const isSelected = props.value.includes(value);
    if (isSelected && props.value.length <= 1) { return; }
    const newValues = isSelected
        ? props.value.filter(v => v !== value)
        : [...props.value, value];
    emit('update:value', newValues);
}
</script>

<style lang="scss" scoped>
.classic-button-group {
    display: inline-flex;
    border: 1px solid var(--octopus-border-default);
    border-radius: var(--octopus-border-radius);
    overflow: hidden;

    .btn {
        border: none;
        border-right: 1px solid var(--octopus-border-default);
        border-radius: 0;
        background-color: var(--octopus-secondary);
        color: var(--octopus-gray-text);
        font-size: 0.8rem;
        transition: background-color 0.15s ease;

        &:last-child {
            border-right: none;
        }

        &:hover:not(.active) {
            background-color: var(--octopus-secondary-darker);
        }

        &.active {
            background-color: var(--octopus-primary);
            color: white;
        }
    }
}
</style>
