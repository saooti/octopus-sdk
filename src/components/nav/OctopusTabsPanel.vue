<template>
    <div
        :id="getPanelId(prefix)"
        :role="tab === undefined ? undefined : 'tabpanel'"
        :aria-labelledby="tab === undefined ? undefined : getTabId(prefix, tab)"
        :tabindex="contentFocusable ? -1 : 0"
    >
        <slot />
    </div>
</template>

<script setup lang="ts">
import { getPanelId, getTabId, TabID } from '../composable/nav/useOctopusTabs';

//Props 
defineProps<{
    /** Currently selected tab */
    tab?: TabID;
    /** Unique prefix ID for this component (use the same for matching
    OctopusTabsList)*/
    prefix: string;
    /** Set to true when content of the panel is focusable */
    contentFocusable?: boolean;
}>();

</script>

<style scoped lang="scss">
</style>
