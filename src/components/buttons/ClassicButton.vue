<!-- A simple button with accessibility in mind -->
<template>
    <button
        class="btn"
        :aria-disabled="disabled"
        :title="title"
        :aria-label="title"
        @click="onClick"
    >
        <slot />
    </button>
</template>

<script setup lang="ts">
const props = defineProps<{
    /** Disable the button */
    disabled?: boolean;
    /** Title of the button */
    title?: string;
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
