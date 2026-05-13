<template>
    <button
        class="btn"
        :aria-disabled="disabled"
        @click="onClick"
    >
        <slot />
    </button>
</template>

<script setup lang="ts">
const props = defineProps<{
    /** Disable the button */
    disabled?: boolean;
}>();

const emit = defineEmits<{
    /** Emitted when the user clicks on the button */
    (e: 'click'): void;
}>();

function onClick(): void {
    if (!props.disabled) {
        emit('click');
    }
}
</script>
