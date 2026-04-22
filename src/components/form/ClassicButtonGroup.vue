<template>
    <div class="classic-button-group">
        <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="btn"
            :class="{ active: modelValue.includes(option.value) }"
            @click="toggle(option.value)"
        >
            {{ option.label }}
        </button>
    </div>
</template>

<script setup lang="ts">
export interface ButtonGroupOption {
    label: string;
    value: string;
}

const props = defineProps<{
    options: ButtonGroupOption[];
    modelValue: string[];
}>();

const emit = defineEmits<{
    'update:modelValue': [values: string[]];
}>();

function toggle(value: string): void {
    const isSelected = props.modelValue.includes(value);
    if (isSelected && props.modelValue.length <= 1) { return; }
    const newValues = isSelected
        ? props.modelValue.filter(v => v !== value)
        : [...props.modelValue, value];
    emit('update:modelValue', newValues);
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
