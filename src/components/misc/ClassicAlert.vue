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
        class="p-2 pe-4 my-2 rounded d-flex alert"
        :class="cardClass"
    >
        <!-- The icon -->
        <component
            :is="iconComponent"
            v-if="!noIcon"
            class="icon"
            :size="30"
        />

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

const { type } = defineProps<{
    /** Disables the icon when true */
    noIcon?: boolean;
    /** An optional title for the alert */
    title?: string;
    /** The type of message */
    type: 'info'|'success'|'warning'|'error';
}>();

/** The class applied to the alert */
const cardClass = computed(() => {
    return 'alert-' + type;
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
    //color: white;
    border: 1px solid;
    border-left: 8px solid;

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

    &.alert {
        @each $type, $color in $types {
            &-#{$type} {
                background-color: hsl(from #{$color} h s 95) !important;
                border-color: #{$color} !important;
                .icon {
                    color: #{$color};
                }
            }
        }
    }
}
</style>
