<template>
    <div class="icon-grid">
        <button
            v-for="icon,name in Icons"
            :key="name"
            type="button"
            class="btn btn-transparent"
            :class="{ selected: selected === name }"
            :title="name"
            @click="$emit('update:selected', name)"
        >
            <component
                :is="icon"
                :size="32"
            />
        </button>
    </div>
</template>

<script setup lang="ts">
import { useSelectableIcons, type IconName } from '../composable/useSelectableIcons';

const { Icons } = useSelectableIcons();

defineProps<{
    selected?: IconName;
}>();

defineEmits<{
    (e: 'update:selected', value: IconName|undefined): void;
}>();
</script>

<style scoped lang="scss">
.icon-grid {
    width: fit-content;
    display: grid;
    grid-template-columns: repeat(10, 42px);
    grid-column-gap: 5px;
    grid-row-gap: 5px;

    button {
        padding: 5px;
        border: 1px solid transparent;

        &.selected {
            background-color: var(--octopus-primary-more-transparent);
            border-color: var(--octopus-primary);
        }
    }
}
</style>
