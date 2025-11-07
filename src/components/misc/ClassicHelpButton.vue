<!--
    A simple component to display a help button that shows its message when
    hovered.

    Usage: 
        <ClassicHelpButton>This is my help message</ClassicHelpButton>
-->
<template>
    <button
        :id="computedId"
        class="btn-transparent"
    >
        <!-- Button icon -->
        <HelpCircleIcon :fill-color="color" :size="iconSize" />

        <!-- Tooltip -->
        <ClassicPopover
            :target="computedId"
            popover-class="help-popover"
        >
            <div class="content">
                <slot />
            </div>
        </ClassicPopover>
    </button>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue';

import HelpCircleIcon from "vue-material-design-icons/HelpCircle.vue";
import ClassicPopover from './ClassicPopover.vue';

const { colored, small } = defineProps<{
    colored?: boolean;
    /** Make the icon smaller if true *(default: false)* */
    small?: boolean;
}>();

/** The color to use for the icon */
const color = computed(() => {
    if (colored) {
        return "var(--octopus-primary-darker)";
    } else {
        return "black";
    }
});

/** The internal ID for the elements */
const computedId = computed(() => {
    return 'popover-' + getCurrentInstance()?.uid;
});

/** The size of the icon, according to the props */
const iconSize = computed(() => {
    if (small) {
        return 24;
    } else {
        return 30;
    }
});
</script>

<style lang="scss" scoped>
.content {
    font: revert;
    font-size: 18px !important;
    text-align: start;
}

.help-popover {
    background-color: var(--octopus-secondary-lighter);
}
</style>