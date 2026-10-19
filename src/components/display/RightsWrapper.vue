<template>
    <div
        v-if="displayIndicator"
    >
        <slot :id="elementId" :has-access="hasAccess" />
        <span v-if="!hasAccess" class="visually-hidden">{{ message }}</span>
        <ClassicPopover
            v-if="!hasAccess"
            :target="elementId"
            only-mouse
        >
            {{ message }}
        </ClassicPopover>
    </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue';
import { RightsProps, useRightsIndicator } from '../composable/useRightsIndicator';
import ClassicPopover from '../misc/ClassicPopover.vue';

const props = defineProps<RightsProps>();

const { displayIndicator, hasAccess, message } = useRightsIndicator(props);

const uid = getCurrentInstance()?.uid;
/** ID of the icon for reference by the popover */
const elementId = computed((): string => 'rights-wrapper-' + uid);
</script>
