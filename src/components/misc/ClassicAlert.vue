<!--
    Simple component to display a message to the user.
    Usage:
        <ClassicAlert type='info'>This is an information</ClassicAlert>
        <ClassicAlert type='success'>Your changes have been saved</ClassicAlert>
        <ClassicAlert type='warning'>Some data will be lost</ClassicAlert>
        <ClassicAlert type='error'>An error occured while saving</ClassicAlert>
-->
<template>
    <div
        class="p-2 pe-4 rounded d-flex alert"
        :class="cardClass"
        :role="type === 'error' || type === 'warning' ? 'alert' : 'status'"
        :aria-live="type === 'error' || type === 'warning' ? 'assertive' : 'polite'"
        aria-atomic="true"
    >
        <span aria-hidden="true">
            <slot name="icon">
                <!-- The icon -->
                <component
                    :is="iconComponent"
                    v-if="!noIcon"
                    class="icon"
                    :size="text ? 22 : 30"
                />
            </slot>
        </span>

        <!-- Main content -->
        <span class="ms-2 content">
            <strong v-if="title">
                {{ title }}
                <br>
            </strong>

            <slot />
        </span>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Alert from 'vue-material-design-icons/Alert.vue';
import CheckCircle from 'vue-material-design-icons/CheckCircle.vue';
import CloseCircle from 'vue-material-design-icons/CloseCircle.vue';
import Information from 'vue-material-design-icons/Information.vue';

const { type, title = undefined, text } = defineProps<{
    /** Disables the icon when true */
    noIcon?: boolean;
    /** An optional title for the alert */
    title?: string;
    /** The type of message */
    type: 'info'|'success'|'warning'|'error';
    /** Use a simpler display */
    text?: boolean;
}>();

/** The class applied to the alert */
const cardClass = computed((): Array<string> => {
    const classes = ['alert-' + type];
    if (text === true) {
        classes.push('text-alert');
    } else {
        classes.push('my-2');
    }
    return classes;
});

const iconComponent = computed(() => {
    if (type === 'info') {
        return Information;
    } else if (type === 'success') {
        return CheckCircle;
    } else if (type === 'warning') {
        return Alert;
    } else if (type === 'error') {
        return CloseCircle;
    } else {
        return null;
    }
});
</script>

<style lang="scss" scoped>
.alert {
    &:not(.text-alert) {
        border: 1px solid;
        border-left: 8px solid;
    }

    .icon {
        align-items: start !important;
    }

    .content {
        display: flex;
        flex-direction: column;
        align-self: center;

        &:deep(p) {
            margin: 0 !important;
            &:not(:first-child) {
                margin-top: 8px !important;
            }
        }
    }

    $types: (
        'success': hsl(from var(--octopus-primary) h s 45),
        'info': var(--octopus-primary),
        'warning': var(--octopus-warning),
        'error': var(--octopus-danger),
    );

    @each $type, $color in $types {
        &-#{$type} {
            &:not(.text-alert) {
                background-color: hsl(from #{$color} h s 95) !important;
                border-color: #{$color} !important;
            }
            &.text-alert {
                color: #{$color} !important;
            }
            .icon {
                color: #{$color};
            }
        }
    }
}
</style>
