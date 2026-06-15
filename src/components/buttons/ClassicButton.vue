<!-- A simple button with accessibility in mind -->
<template>
    <button
        :class="classes"
        :aria-disabled="disabled"
        :title="title"
        :aria-label="title"
        @click="onClick"
    >
        <slot />
    </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    /** Disable the button */
    disabled?: boolean;
    /** Title of the button */
    title?: string;
    /** Primary style for button */
    primary?: boolean;
    /** Icon style for button */
    icon?: boolean;
}>();

const emit = defineEmits<{
    /** Emitted when the user clicks on the button */
    (e: 'click'): void;
}>();

const classes = computed((): Array<string> => {
    const ary: Array<string> = ['btn', 'd-flex'];
    if (props.primary) {
        ary.push('btn-primary');
    }
    if (props.icon) {
        ary.push('btn-icon');
    }
    return ary;
});

function onClick(): void {
    if (!props.disabled) {
        emit('click');
    }
}
</script>
