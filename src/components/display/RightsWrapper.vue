<template>
    <div
        v-if="displayIndicator"
    >
        <slot :id="elementId" :has-access="hasAccess" />
        <span v-if="!hasAccess" class="rights-visually-hidden">{{ message }}</span>
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

<style scoped lang="scss">
/** Helper class to keep the data accessible for screen readers */
.rights-visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
</style>
