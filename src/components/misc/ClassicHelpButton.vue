<!--
    A simple component to display a help button that shows its message when
    hovered or clicked. The message is also set as the button's description,
    so screen readers announce it when the button is focused.

    Usage: 
        <ClassicHelpButton>This is my help message</ClassicHelpButton>
-->
<template>
    <button
        :id="computedId"
        type="button"
        class="btn-transparent"
        :aria-label="label ?? t('Help')"
        :aria-describedby="'popover' + computedId"
    >
        <!-- Button icon -->
        <HelpCircleIcon :fill-color="color" :size="iconSize" />

        <!-- Tooltip -->
        <ClassicPopover
            :target="computedId"
            popover-class="help-popover"
            :relative-class="inModal ? 'octopus-modal' : relativeClass"
        >
            <div class="content">
                <slot />
            </div>
        </ClassicPopover>
    </button>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue';
import { useI18n } from 'vue-i18n';

import HelpCircleIcon from "vue-material-design-icons/HelpCircle.vue";
import ClassicPopover from './ClassicPopover.vue';

const { colored, small, label } = defineProps<{
    colored?: boolean;
    /** Automatically sets relative class to octopus-modal */
    inModal?: boolean;
    /** Accessible name of the button *(default: "Help")* */
    label?: string;
    /** Make the popover relative (userful when in page-element) */
    relativeClass?: string;
    /** Make the icon smaller if true *(default: false)* */
    small?: boolean;
}>();

const { t } = useI18n();

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
    max-width: 60%;
}
</style>
